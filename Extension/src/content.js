// Content script for TruthGuard extension
console.log('TruthGuard content script loaded');

let isSelectionMode = false;
let selectionOverlay = null;
let selectionBox = null;
let startX = 0;
let startY = 0;
let isDrawing = false;
let currentSelectionData = null; // Store selection data for download

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapePage') {
    const pageData = scrapePageContent();
    sendResponse({ success: true, data: pageData });
  } else if (request.action === 'getSelectedText') {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
      sendResponse({
        success: true,
        text: selectedText,
        title: document.title,
        url: window.location.href,
      });
    } else {
      sendResponse({ success: false, message: 'No text selected' });
    }
  } else if (request.action === 'enableSelection') {
    enableSelectionMode();
    sendResponse({ success: true });
  } else if (request.action === 'disableSelection') {
    disableSelectionMode();
    sendResponse({ success: true });
  }
  return true;
});

// Listen for messages from the page
window.addEventListener('message', (event) => {
  if (event.data.type === 'TRUTHGUARD_ENABLE_SELECTION') {
    enableSelectionMode();
  }
});

// Scrape full page content
function scrapePageContent() {
  const title = document.title;
  const url = window.location.href;

  // Get main content (try to find article or main content area)
  let mainContent = '';

  // Try common article selectors
  const selectors = [
    'article',
    '[role="article"]',
    '.article-content',
    '.post-content',
    '.entry-content',
    'main',
    '.main-content',
    '#content',
  ];

  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      mainContent = element.innerText;
      break;
    }
  }

  // Fallback to body if no specific content found
  if (!mainContent) {
    mainContent = document.body.innerText;
  }

  // Limit content length
  const maxLength = 5000;
  if (mainContent.length > maxLength) {
    mainContent = mainContent.substring(0, maxLength) + '...';
  }

  return {
    title,
    url,
    text: mainContent,
    timestamp: new Date().toISOString(),
  };
}

// Enable selection mode with visual overlay
function enableSelectionMode() {
  if (isSelectionMode) return;

  isSelectionMode = true;

  // Create overlay
  selectionOverlay = document.createElement('div');
  selectionOverlay.id = 'truthguard-selection-overlay';
  selectionOverlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.3);
    z-index: 999999;
    cursor: crosshair;
  `;

  // Create instruction box
  const instructionBox = document.createElement('div');
  instructionBox.style.cssText = `
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 16px 24px;
    border-radius: 12px;
    font-family: Arial, sans-serif;
    font-size: 14px;
    font-weight: 600;
    box-shadow: 0 8px 16px rgba(0,0,0,0.3);
    z-index: 1000001;
    display: flex;
    align-items: center;
    gap: 12px;
  `;
  instructionBox.innerHTML = `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
      <path d="M3 9h18"></path>
    </svg>
    <span>Click and drag to select an area to verify • Press ESC to cancel</span>
  `;

  selectionOverlay.appendChild(instructionBox);

  // Selection box
  selectionBox = document.createElement('div');
  selectionBox.style.cssText = `
    position: fixed;
    border: 3px dashed #667eea;
    background: rgba(102, 126, 234, 0.1);
    display: none;
    z-index: 1000000;
    pointer-events: none;
  `;
  selectionOverlay.appendChild(selectionBox);

  document.body.appendChild(selectionOverlay);

  // Add event listeners
  selectionOverlay.addEventListener('mousedown', handleMouseDown);
  selectionOverlay.addEventListener('mousemove', handleMouseMove);
  selectionOverlay.addEventListener('mouseup', handleMouseUp);
  document.addEventListener('keydown', handleKeyDown);
}

function handleMouseDown(e) {
  isDrawing = true;
  startX = e.clientX;
  startY = e.clientY;

  selectionBox.style.left = startX + 'px';
  selectionBox.style.top = startY + 'px';
  selectionBox.style.width = '0px';
  selectionBox.style.height = '0px';
  selectionBox.style.display = 'block';
}

function handleMouseMove(e) {
  if (!isDrawing) return;

  const currentX = e.clientX;
  const currentY = e.clientY;

  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);
  const left = Math.min(currentX, startX);
  const top = Math.min(currentY, startY);

  selectionBox.style.width = width + 'px';
  selectionBox.style.height = height + 'px';
  selectionBox.style.left = left + 'px';
  selectionBox.style.top = top + 'px';
}

async function handleMouseUp(e) {
  if (!isDrawing) return;

  isDrawing = false;

  const rect = selectionBox.getBoundingClientRect();

  // Check if selection is large enough
  if (rect.width < 50 || rect.height < 50) {
    disableSelectionMode();
    return;
  }

  // Get text from selected area
  const selectedText = getTextFromArea(rect);

  // Show loading state
  showLoadingInSelection();

  try {
    // Send to actual API
    const response = await fetch(
      'http://34.122.181.2:8080/verify_for_frontend_extension_app',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: selectedText,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const apiData = await response.json();
    console.log('Selection API response:', apiData);

    // Store data for download
    currentSelectionData = {
      text: selectedText,
      url: window.location.href,
      title: document.title,
      timestamp: new Date().toISOString(),
      result: apiData,
    };

    showResultInSelection(apiData);

    // Auto-close after 10 seconds (more time to download)
    setTimeout(() => {
      disableSelectionMode();
    }, 10000);
  } catch (error) {
    console.error('Selection API error:', error);

    // Show error in selection box
    showErrorInSelection(error.message);

    // Auto-close after 5 seconds
    setTimeout(() => {
      disableSelectionMode();
    }, 5000);
  }
}

function handleKeyDown(e) {
  if (e.key === 'Escape') {
    disableSelectionMode();
  }
}

function getTextFromArea(rect) {
  // Get elements within the selected area
  const elements = document.elementsFromPoint(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2
  );

  let text = '';
  for (const element of elements) {
    if (element.innerText) {
      text = element.innerText;
      break;
    }
  }

  return text || 'Selected area content';
}

function showLoadingInSelection() {
  selectionBox.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      background: rgba(255, 255, 255, 0.95);
      border-radius: 8px;
    ">
      <div style="
        width: 40px;
        height: 40px;
        border: 4px solid #e5e7eb;
        border-top-color: #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
      "></div>
      <p style="
        margin-top: 16px;
        color: #1f2937;
        font-family: Arial, sans-serif;
        font-size: 14px;
        font-weight: 600;
      ">Analyzing...</p>
    </div>
    <style>
      @keyframes spin {
        to { transform: rotate(360deg); }
      }
    </style>
  `;
}

function showResultInSelection(result) {
  // Parse API response (same logic as Popup.jsx)
  const resultData = result?.result || result || {};
  const formatted = result?.formatted_response || resultData?.raw_final || '';

  // Extract verdict
  let verdictRaw = extractFieldFromMarkdown(formatted, 'Verdict');
  if (!verdictRaw) verdictRaw = resultData?.verdict;
  const verdict = (verdictRaw || 'unverified').toString().toLowerCase();

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
  if (confidenceRaw === undefined || confidenceRaw === null) {
    confidenceRaw = resultData?.confidence;
  }
  const confidence =
    typeof confidenceRaw === 'number'
      ? Math.round(confidenceRaw <= 1 ? confidenceRaw * 100 : confidenceRaw)
      : 85;

  // Extract summary
  const summary =
    resultData?.summary ||
    extractSummaryFromMarkdown(formatted) ||
    'Verification complete.';

  const isTrue = verdict.includes('true');
  const isFalse = verdict.includes('false');
  const bgColor = isTrue ? '#dcfce7' : isFalse ? '#fee2e2' : '#fef3c7';
  const borderColor = isTrue ? '#22c55e' : isFalse ? '#ef4444' : '#f59e0b';
  const textColor = isTrue ? '#166534' : isFalse ? '#991b1b' : '#92400e';
  const icon = isTrue ? '✓' : isFalse ? '✗' : '⚠';

  // Enable pointer events for the result box so download button works
  selectionBox.style.pointerEvents = 'auto';

  selectionBox.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      height: 100%;
      background: ${bgColor};
      border: 3px solid ${borderColor};
      border-radius: 8px;
      padding: 20px;
      overflow: auto;
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      ">
        <div style="
          width: 48px;
          height: 48px;
          background: ${borderColor};
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: bold;
        ">${icon}</div>
        <div>
          <h3 style="
            margin: 0;
            color: ${textColor};
            font-family: Arial, sans-serif;
            font-size: 18px;
            font-weight: bold;
            text-transform: capitalize;
          ">${verdict}</h3>
          <p style="
            margin: 4px 0 0 0;
            color: ${textColor};
            font-family: Arial, sans-serif;
            font-size: 12px;
          ">Confidence: ${confidence}%</p>
        </div>
      </div>
      <p style="
        margin: 0;
        color: ${textColor};
        font-family: Arial, sans-serif;
        font-size: 13px;
        line-height: 1.5;
      ">${summary}</p>
      
      <!-- Download Button -->
      <button id="truthguard-download-btn" style="
        margin-top: 16px;
        padding: 10px 16px;
        background: #3b82f6;
        color: white;
        border: none;
        border-radius: 6px;
        font-family: Arial, sans-serif;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 8px;
        justify-content: center;
        transition: background 0.2s;
      " onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="7 10 12 15 17 10"></polyline>
          <line x1="12" y1="15" x2="12" y2="3"></line>
        </svg>
        Download Report (PDF)
      </button>
      
      <p style="
        margin-top: 12px;
        padding-top: 12px;
        border-top: 2px solid ${borderColor};
        color: #6b7280;
        font-family: Arial, sans-serif;
        font-size: 11px;
      ">Auto-closes in 10 seconds • Press ESC to close</p>
    </div>
  `;

  // Add click handler for download button
  const downloadBtn = selectionBox.querySelector('#truthguard-download-btn');
  if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadSelectionPDF);
  }
}

function showErrorInSelection(errorMessage) {
  const bgColor = '#fee2e2';
  const borderColor = '#ef4444';
  const textColor = '#991b1b';

  selectionBox.style.pointerEvents = 'auto';

  selectionBox.innerHTML = `
    <div style="
      display: flex;
      flex-direction: column;
      height: 100%;
      background: ${bgColor};
      border: 3px solid ${borderColor};
      border-radius: 8px;
      padding: 20px;
      overflow: auto;
    ">
      <div style="
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 12px;
      ">
        <div style="
          width: 48px;
          height: 48px;
          background: ${borderColor};
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          font-weight: bold;
        ">✗</div>
        <div>
          <h3 style="
            margin: 0;
            color: ${textColor};
            font-family: Arial, sans-serif;
            font-size: 18px;
            font-weight: bold;
          ">Error</h3>
        </div>
      </div>
      <p style="
        margin: 0;
        color: ${textColor};
        font-family: Arial, sans-serif;
        font-size: 13px;
        line-height: 1.5;
      ">${
        errorMessage ||
        'Failed to verify the selected content. Please try again.'
      }</p>
      
      <p style="
        margin-top: 12px;
        padding-top: 12px;
        border-top: 2px solid ${borderColor};
        color: #6b7280;
        font-family: Arial, sans-serif;
        font-size: 11px;
      ">Auto-closes in 5 seconds • Press ESC to close</p>
    </div>
  `;
}

// Helper functions for markdown parsing
function stripFences(s) {
  return typeof s === 'string'
    ? s.replace(/^```(?:[\w-]+)?\n/, '').replace(/\n```$/, '')
    : '';
}

function extractFieldFromMarkdown(md, field) {
  if (!md) return undefined;
  const stripped = stripFences(md);

  const boldRx = new RegExp(
    `\\*+\\s*${field}\\s*\\*+[:：]?\\s*([^\n\r]+)`,
    'i'
  );
  let m = stripped.match(boldRx);
  if (m && m[1]) return m[1].trim();

  const noStars = stripped.replace(/\*/g, '');
  const lineRx = new RegExp(`^\\s*${field}\\s*[:：]\\s*([^\n\r]+)`, 'im');
  m = noStars.match(lineRx);
  if (m && m[1]) return m[1].trim();

  const looseRx = new RegExp(`${field}\\s*[:：]?\\s*([\\d\\.]+|\\w+)`, 'i');
  m = stripped.match(looseRx);
  if (m && m[1]) return m[1].trim();

  return undefined;
}

function extractSummaryFromMarkdown(md) {
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
}

async function downloadSelectionPDF() {
  if (!currentSelectionData) return;

  const { text, url, title, timestamp, result } = currentSelectionData;

  // Parse result data
  const resultData = result?.result || result || {};
  const formatted = result?.formatted_response || resultData?.raw_final || '';

  let verdictRaw = extractFieldFromMarkdown(formatted, 'Verdict');
  if (!verdictRaw) verdictRaw = resultData?.verdict;
  const verdict = (verdictRaw || 'unverified').toString();

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
      title: 'TruthGuard Fact Check Report (Selection)',
      pageTitle: title,
      url: url,
      scannedAt: new Date(timestamp).toLocaleString(),
      content: text.substring(0, 1000),
      verdict: verdict,
      confidence: confidence,
      summary:
        resultData?.summary ||
        extractSummaryFromMarkdown(formatted) ||
        'Verification complete.',
      fullReport: stripFences(formatted),
      mode: 'selection',
    },
  });
}

function downloadSelectionMarkdown() {
  if (!currentSelectionData) return;

  const { text, url, title, timestamp, result } = currentSelectionData;

  // Create markdown content
  const markdown = `# TruthGuard Fact Check Report (Selection)

## Article Information
- **Title:** ${title}
- **URL:** ${url}
- **Scanned at:** ${new Date(timestamp).toLocaleString()}

## Selected Content

${text}

---

## Verification Result

- **Verdict:** ${
    result.verdict === 'true' ? '✅ Verified True' : '❌ False Information'
  }
- **Confidence:** ${(result.confidence * 100).toFixed(0)}%
- **Message:** ${result.message}
- **Summary:** ${result.summary}
- **Analyzed at:** ${new Date().toLocaleString()}

---

*Generated by TruthGuard Extension (Selection Scan)*
`;

  // Create blob and download
  const blob = new Blob([markdown], { type: 'text/markdown' });
  const downloadUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = `truthguard-selection-${Date.now()}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}

function disableSelectionMode() {
  if (!isSelectionMode) return;

  isSelectionMode = false;
  isDrawing = false;
  currentSelectionData = null; // Clear selection data

  if (selectionOverlay) {
    selectionOverlay.remove();
    selectionOverlay = null;
  }

  selectionBox = null;

  document.removeEventListener('keydown', handleKeyDown);
}
