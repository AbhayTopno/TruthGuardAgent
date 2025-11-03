import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Scan,
  CheckCircle2,
  XCircle,
  Loader2,
  MousePointerClick,
  Download,
  Copy,
  Check,
} from 'lucide-react';

const API_URL = 'http://34.122.181.2:8080/verify_for_frontend_extension_app';

const Popup = () => {
  const [mode, setMode] = useState(null); // 'full' or 'selection'
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [scrapedData, setScrapedData] = useState(null);
  const [text, setText] = useState('');
  const [copied, setCopied] = useState(false);

  const handleFullPageScan = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      // Check if we can access the tab
      if (!tab || !tab.id) {
        throw new Error('Unable to access current tab');
      }

      // Send message to content script to scrape the page
      const response = await chrome.tabs
        .sendMessage(tab.id, {
          action: 'scrapePage',
        })
        .catch((err) => {
          console.error('Content script error:', err);
          throw new Error('Content script not ready. Try refreshing the page.');
        });

      if (response && response.success) {
        // Store scraped data for download
        setScrapedData(response.data);
        setText(response.data.text);

        // Send to actual API
        const apiResponse = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: response.data.text,
          }),
        });

        if (!apiResponse.ok) {
          throw new Error(`API request failed: ${apiResponse.statusText}`);
        }

        const apiData = await apiResponse.json();
        console.log('API response:', apiData);

        setResult(apiData);
        setLoading(false);
      } else {
        throw new Error('Failed to receive response from content script');
      }
    } catch (err) {
      console.error('Error scanning page:', err);
      setError(err.message || 'Failed to scan the page. Please try again.');
      setLoading(false);
    }
  };

  const handleSelectionScan = async () => {
    try {
      // Get current tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      // Check if we can access the tab
      if (!tab || !tab.id) {
        throw new Error('Unable to access current tab');
      }

      // First, check if there's already selected text
      const checkResponse = await chrome.tabs
        .sendMessage(tab.id, {
          action: 'getSelectedText',
        })
        .catch((err) => {
          console.error('Content script error:', err);
          throw new Error('Content script not ready. Try refreshing the page.');
        });

      // If text is already selected, process it immediately
      if (checkResponse && checkResponse.success && checkResponse.text) {
        setLoading(true);
        setError(null);
        setResult(null);
        await processSelectedText(checkResponse, tab.id);
        return;
      }

      // If no text is selected, show instruction and close popup
      // The user needs to select text first
      setError(
        'No text selected. Please select some text on the page and click "Verify Selected Text" again.'
      );
    } catch (err) {
      console.error('Error in selection scan:', err);
      setError(
        err.message || 'Failed to initialize selection mode. Please try again.'
      );
    }
  };

  const processSelectedText = async (response, tabId) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Store scraped data for download
      setScrapedData({
        title: response.title || 'Selected Text',
        url: response.url,
        text: response.text,
        timestamp: new Date().toISOString(),
      });
      setText(response.text);

      // Send to actual API
      const apiResponse = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: response.text,
        }),
      });

      if (!apiResponse.ok) {
        throw new Error(`API request failed: ${apiResponse.statusText}`);
      }

      const apiData = await apiResponse.json();
      console.log('Selection API response:', apiData);

      setResult(apiData);
      setLoading(false);
    } catch (err) {
      console.error('Error scanning selection:', err);
      setError(
        err.message || 'Failed to scan the selection. Please try again.'
      );
      setLoading(false);
    }
  };

  const resetState = () => {
    setMode(null);
    setResult(null);
    setError(null);
    setLoading(false);
    setScrapedData(null);
    setText('');
  };

  // Helper function to strip code fences
  const stripFences = (s) =>
    typeof s === 'string'
      ? s.replace(/^```(?:[\w-]+)?\n/, '').replace(/\n```$/, '')
      : '';

  // Extract field from markdown
  const extractFieldFromMarkdown = (md, field) => {
    if (!md) return undefined;
    const stripped = stripFences(md);

    // Try matching bolded pattern: **Field:** value
    const boldRx = new RegExp(
      `\\*+\\s*${field}\\s*\\*+[:：]?\\s*([^\n\r]+)`,
      'i'
    );
    let m = stripped.match(boldRx);
    if (m && m[1]) return m[1].trim();

    // Remove all asterisks and match "Field: value"
    const noStars = stripped.replace(/\*/g, '');
    const lineRx = new RegExp(`^\\s*${field}\\s*[:：]\\s*([^\n\r]+)`, 'im');
    m = noStars.match(lineRx);
    if (m && m[1]) return m[1].trim();

    // Last resort: search anywhere
    const looseRx = new RegExp(`${field}\\s*[:：]?\\s*([\\d\\.]+|\\w+)`, 'i');
    m = stripped.match(looseRx);
    if (m && m[1]) return m[1].trim();

    return undefined;
  };

  // Extract summary from markdown
  const extractSummary = (md) => {
    if (!md) return undefined;
    const stripped = stripFences(md);
    const lines = stripped.split(/\r?\n/);
    const startIdx = lines.findIndex(
      (l) =>
        l.trim().toLowerCase().startsWith('### summary') ||
        l.trim().toLowerCase().startsWith('## summary')
    );
    if (startIdx === -1) return undefined;
    const acc = [];
    for (let i = startIdx + 1; i < lines.length; i++) {
      if (/^###?\s+/.test(lines[i])) break;
      if (lines[i].trim()) acc.push(lines[i].trim());
    }
    return acc.join(' ').trim();
  };

  const downloadPDF = () => {
    if (!scrapedData || !result) return;

    const resultData = result?.result || result || {};
    const formatted = result?.formatted_response || resultData?.raw_final || '';

    // Extract verdict
    let verdictRaw = extractFieldFromMarkdown(formatted, 'Verdict');
    if (!verdictRaw) verdictRaw = resultData?.verdict;
    const verdict = (verdictRaw || 'unverified').toString();

    // Extract confidence
    let confidenceRaw =
      extractFieldFromMarkdown(formatted, 'Confidence') ||
      extractFieldFromMarkdown(formatted, 'Confidence Score');
    if (confidenceRaw !== undefined) {
      const numberMatch = (confidenceRaw + '').match(/[\d.]+/);
      if (numberMatch) {
        confidenceRaw = parseFloat(numberMatch[0]);
      }
    }
    if (confidenceRaw === undefined) confidenceRaw = resultData?.confidence;
    const confidence =
      typeof confidenceRaw === 'number'
        ? Math.round(confidenceRaw <= 1 ? confidenceRaw * 100 : confidenceRaw)
        : 0;

    // Send message to background script to generate PDF
    chrome.runtime.sendMessage({
      action: 'generatePDF',
      data: {
        title: 'TruthGuard Fact Check Report',
        pageTitle: scrapedData.title,
        url: scrapedData.url,
        scannedAt: new Date(scrapedData.timestamp).toLocaleString(),
        content: scrapedData.text.substring(0, 2000),
        verdict: verdict,
        confidence: confidence,
        summary: resultData?.summary || extractSummary(formatted) || '',
        fullReport: stripFences(formatted),
        evidence: resultData?.evidence || [],
        mode: 'full',
      },
    });
  };

  const copyToClipboard = async () => {
    const resultData = result?.result || result || {};
    const formatted = result?.formatted_response || resultData?.raw_final || '';

    try {
      await navigator.clipboard.writeText(stripFences(formatted));
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 min-h-full rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-6 h-6" />
          <h1 className="text-xl font-bold">TruthGuard</h1>
        </div>
        <p className="text-blue-100 text-sm">
          Verify facts & detect misinformation
        </p>
      </div>

      <div className="p-4">
        {!loading && !result && (
          <>
            {/* Main Actions */}
            <div className="space-y-3 mb-4">
              <button
                onClick={handleFullPageScan}
                className="w-full bg-white hover:bg-blue-50 text-gray-800 font-semibold py-4 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 border-2 border-blue-200 hover:border-blue-400"
              >
                <Scan className="w-5 h-5 text-blue-600" />
                <div className="text-left">
                  <div className="text-base">Scan Full Page</div>
                  <div className="text-xs text-gray-500 font-normal">
                    Analyze entire article
                  </div>
                </div>
              </button>

              <button
                onClick={handleSelectionScan}
                className="w-full bg-white hover:bg-indigo-50 text-gray-800 font-semibold py-4 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-3 border-2 border-indigo-200 hover:border-indigo-400"
              >
                <MousePointerClick className="w-5 h-5 text-indigo-600" />
                <div className="text-left">
                  <div className="text-base">Verify Selected Text</div>
                  <div className="text-xs text-gray-500 font-normal">
                    Verify text you've highlighted
                  </div>
                </div>
              </button>
            </div>

            {/* Info Card */}
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
              <h3 className="font-semibold text-gray-700 mb-2 text-sm">
                How it works:
              </h3>
              <ul className="text-xs text-gray-600 space-y-1.5">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>
                    Click "Scan Full Page" to analyze the entire article
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 mt-0.5">•</span>
                  <span>
                    Highlight text on the page first, then click "Verify
                    Selected Text"
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-0.5">•</span>
                  <span>
                    Get instant fact-checking results with confidence scores
                  </span>
                </li>
              </ul>
            </div>
          </>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg p-8 shadow-lg text-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Analyzing Content...
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Verifying with AI fact-checker
            </p>
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-blue-800 font-medium">
                📤 Verifying content...
              </p>
            </div>
          </div>
        )}

        {/* Result State */}
        {result &&
          !result.error &&
          (() => {
            const resultData = result?.result || result || {};
            const formatted =
              result?.formatted_response || resultData?.raw_final || '';

            // Extract verdict & confidence
            let verdictRaw = undefined;
            let confidenceRaw = undefined;

            if (formatted) {
              verdictRaw = extractFieldFromMarkdown(formatted, 'Verdict');
              const confCandidate =
                extractFieldFromMarkdown(formatted, 'Confidence') ||
                extractFieldFromMarkdown(formatted, 'Confidence Score');
              if (confCandidate !== undefined) {
                const numberMatch = (confCandidate + '').match(/[\d.]+/);
                if (numberMatch) {
                  confidenceRaw = parseFloat(numberMatch[0]);
                }
              }
            }

            if (!verdictRaw) verdictRaw = resultData?.verdict;
            if (confidenceRaw === undefined || confidenceRaw === null)
              confidenceRaw = resultData?.confidence;

            const verdict = (verdictRaw || 'unverified')
              .toString()
              .toLowerCase();
            const confidence =
              typeof confidenceRaw === 'number'
                ? Math.round(
                    confidenceRaw <= 1 ? confidenceRaw * 100 : confidenceRaw
                  )
                : typeof confidenceRaw === 'string' &&
                  !isNaN(parseFloat(confidenceRaw))
                ? Math.round(
                    parseFloat(confidenceRaw) <= 1
                      ? parseFloat(confidenceRaw) * 100
                      : parseFloat(confidenceRaw)
                  )
                : undefined;

            const evidence = Array.isArray(resultData?.evidence)
              ? resultData.evidence
              : [];
            const summary = resultData?.summary || extractSummary(formatted);

            const isTrue = verdict.includes('true');
            const isFalse = verdict.includes('false');

            const getVerdictColor = () => {
              if (isTrue) return 'from-green-500 to-emerald-600';
              if (isFalse) return 'from-red-500 to-rose-600';
              return 'from-yellow-500 to-orange-600';
            };

            const getVerdictIcon = () => {
              if (isTrue) return '✅';
              if (isFalse) return '❌';
              return '⚠️';
            };

            const getConfidenceColor = (c) => {
              if (c >= 80) return 'text-green-600';
              if (c >= 50) return 'text-yellow-600';
              return 'text-red-600';
            };

            return (
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4 shadow-lg border-2 border-gray-200">
                  {/* Verdict Section */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                      <div className="text-4xl">{getVerdictIcon()}</div>
                      <div>
                        <h3 className="text-gray-500 text-xs font-medium uppercase">
                          Verdict
                        </h3>
                        <p
                          className={`text-xl font-extrabold bg-gradient-to-r ${getVerdictColor()} bg-clip-text text-transparent capitalize`}
                        >
                          {verdict}
                        </p>
                      </div>
                    </div>

                    {/* Confidence */}
                    {confidence !== undefined && (
                      <div className="text-right">
                        <h4 className="text-gray-500 text-xs font-medium uppercase mb-1">
                          Confidence
                        </h4>
                        <span
                          className={`text-2xl font-bold ${getConfidenceColor(
                            confidence
                          )}`}
                        >
                          {confidence}%
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Evidence */}
                  {evidence && evidence.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-gray-700 font-semibold text-sm mb-2 flex items-center gap-2">
                        <span>📋</span> Evidence
                      </h4>
                      <ul className="space-y-2 max-h-40 overflow-y-auto">
                        {evidence.slice(0, 3).map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 bg-gray-50 p-2 rounded border border-gray-200 text-xs"
                          >
                            <span className="text-blue-600 font-bold">
                              {i + 1}.
                            </span>
                            <span className="text-gray-700">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Summary */}
                  {summary && (
                    <div className="mb-4">
                      <h4 className="text-gray-700 font-semibold text-sm mb-2 flex items-center gap-2">
                        <span>📝</span> Summary
                      </h4>
                      <p className="text-xs text-gray-700 bg-gray-50 p-3 rounded border border-gray-200 leading-relaxed">
                        {summary}
                      </p>
                    </div>
                  )}

                  {/* Full Report Preview */}
                  {formatted && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-gray-700 font-semibold text-sm flex items-center gap-2">
                          <span>📄</span> Full Report
                        </h4>
                        <button
                          onClick={copyToClipboard}
                          className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-600 hover:text-gray-800 hover:border-gray-400 flex items-center gap-1"
                        >
                          {copied ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          {copied ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                      <div className="bg-gray-50 p-3 rounded border border-gray-200 max-h-32 overflow-y-auto">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap">
                          {stripFences(formatted)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>

                {/* API Info */}
                <div className="bg-blue-50 rounded-lg p-2 border border-blue-200">
                  <p className="text-xs text-blue-800 text-center">
                    ✓ Verified at {new Date().toLocaleString()}
                  </p>
                </div>

                {/* Download Button */}
                {scrapedData && (
                  <button
                    onClick={downloadPDF}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Report (PDF)
                  </button>
                )}

                <button
                  onClick={resetState}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Check Another Page
                </button>
              </div>
            );
          })()}

        {/* Error State */}
        {(error || result?.error) && (
          <div className="bg-white rounded-lg p-4 shadow-lg border-2 border-orange-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">⚠️</span>
              </div>
              <h3 className="font-bold text-orange-800 text-lg">
                Action Required
              </h3>
            </div>
            <p className="text-sm text-gray-700 mb-3 leading-relaxed">
              {error ||
                result?.error ||
                'Verification failed. Please try again.'}
            </p>

            {/* Additional instructions for selection mode */}
            {error && error.includes('No text selected') && (
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 mb-3">
                <p className="text-xs font-semibold text-indigo-800 mb-2">
                  📝 How to verify selected text:
                </p>
                <ol className="text-xs text-indigo-700 space-y-1 ml-4 list-decimal">
                  <li>Close this popup</li>
                  <li>
                    Select/highlight the text you want to verify on the page
                  </li>
                  <li>Click the TruthGuard extension icon again</li>
                  <li>Click "Verify Selected Text" button</li>
                </ol>
              </div>
            )}

            <button
              onClick={resetState}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Got it
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 pb-4">
        <p className="text-center text-xs text-gray-500">
          Powered by TruthGuard AI
        </p>
      </div>
    </div>
  );
};

export default Popup;
