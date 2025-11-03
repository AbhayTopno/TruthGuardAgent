// Background service worker for TruthGuard extension
import { jsPDF } from 'jspdf';

console.log('TruthGuard background service worker loaded');

// API endpoints
const API_BASE_URL = 'http://34.122.181.2:8080';
const EXTENSION_ENDPOINT = `${API_BASE_URL}/extension`;
const AGENT_ENDPOINT = `${API_BASE_URL}/agent`;

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeContent') {
    handleAnalyzeContent(request.data)
      .then((result) => sendResponse({ success: true, data: result }))
      .catch((error) => sendResponse({ success: false, error: error.message }));
    return true; // Keep the message channel open for async response
  } else if (request.action === 'generatePDF') {
    handleGeneratePDF(request.data);
    sendResponse({ success: true });
    return true;
  }
});

// Handle content analysis
async function handleAnalyzeContent(data) {
  try {
    // Log the data that would be sent
    console.log('Would send to extension endpoint:', EXTENSION_ENDPOINT, data);

    // In demo mode, simulate API call
    // When backend is ready, uncomment the actual API call below:
    /*
    const response = await fetch(EXTENSION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }
    
    const result = await response.json();
    */

    // Demo response
    await simulateDelay(1000);

    const result = {
      status: 'success',
      verdict: 'true',
      confidence: 0.95,
      summary:
        'The information has been verified against multiple reliable sources.',
      evidence: [
        {
          source: 'https://example.com/source1',
          excerpt: 'Supporting evidence from reliable source...',
        },
      ],
      meta: {
        processedAt: new Date().toISOString(),
      },
    };

    console.log('Would receive from agent endpoint:', AGENT_ENDPOINT, result);

    return result;
  } catch (error) {
    console.error('Error analyzing content:', error);
    throw error;
  }
}

// Simulate network delay
function simulateDelay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Handle PDF generation using jsPDF
async function handleGeneratePDF(data) {
  try {
    const doc = new jsPDF();

    // Set up the document
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPos = margin;

    // Helper function to add text with wrapping
    const addText = (text, fontSize = 10, isBold = false) => {
      doc.setFontSize(fontSize);
      if (isBold) doc.setFont(undefined, 'bold');
      else doc.setFont(undefined, 'normal');

      const lines = doc.splitTextToSize(text, maxWidth);

      // Check if we need a new page
      if (yPos + lines.length * fontSize * 0.5 > pageHeight - margin) {
        doc.addPage();
        yPos = margin;
      }

      doc.text(lines, margin, yPos);
      yPos += lines.length * fontSize * 0.5 + 5;
    };

    // Title
    doc.setFillColor(59, 130, 246); // Blue background
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text('TruthGuard Fact Check Report', pageWidth / 2, 25, {
      align: 'center',
    });

    yPos = 50;
    doc.setTextColor(0, 0, 0);

    // Article Information
    addText('Article Information', 14, true);
    addText(`Title: ${data.pageTitle}`, 10);
    addText(`URL: ${data.url}`, 10);
    addText(`Scanned at: ${data.scannedAt}`, 10);
    addText(
      `Mode: ${data.mode === 'full' ? 'Full Page Scan' : 'Selection Scan'}`,
      10
    );
    yPos += 5;

    // Verdict Section
    addText('Verification Result', 14, true);

    // Verdict with color
    const verdictLower = data.verdict.toLowerCase();
    if (verdictLower.includes('true')) {
      doc.setTextColor(22, 163, 74); // Green
    } else if (verdictLower.includes('false')) {
      doc.setTextColor(220, 38, 38); // Red
    } else {
      doc.setTextColor(245, 158, 11); // Yellow/Orange
    }
    addText(`Verdict: ${data.verdict.toUpperCase()}`, 12, true);
    doc.setTextColor(0, 0, 0);

    addText(`Confidence: ${data.confidence}%`, 10);
    yPos += 5;

    // Summary
    if (data.summary) {
      addText('Summary', 12, true);
      addText(data.summary, 10);
      yPos += 5;
    }

    // Evidence
    if (data.evidence && data.evidence.length > 0) {
      addText('Evidence', 12, true);
      data.evidence.forEach((item, i) => {
        addText(`${i + 1}. ${item}`, 9);
      });
      yPos += 5;
    }

    // Content Preview
    if (data.content) {
      addText('Content Preview', 12, true);
      const contentPreview =
        data.content.length > 1000
          ? data.content.substring(0, 1000) + '...'
          : data.content;
      addText(contentPreview, 9);
      yPos += 5;
    }

    // Full Report
    if (data.fullReport) {
      addText('Full Analysis Report', 12, true);
      const reportPreview =
        data.fullReport.length > 2000
          ? data.fullReport.substring(0, 2000) + '...'
          : data.fullReport;
      addText(reportPreview, 8);
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      'Generated by TruthGuard Extension',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    // Save the PDF
    const filename = `truthguard-report-${Date.now()}.pdf`;
    doc.save(filename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    // Fallback to simple text download if PDF generation fails
    generateFallbackReport(data);
  }
}

// Fallback to text file if PDF generation fails
function generateFallbackReport(data) {
  const content = `
TRUTHGUARD FACT CHECK REPORT
============================

Article Information:
- Title: ${data.pageTitle}
- URL: ${data.url}
- Scanned at: ${data.scannedAt}
- Mode: ${data.mode === 'full' ? 'Full Page Scan' : 'Selection Scan'}

Verification Result:
- Verdict: ${data.verdict.toUpperCase()}
- Confidence: ${data.confidence}%

${data.summary ? `Summary:\n${data.summary}\n` : ''}

${
  data.evidence && data.evidence.length > 0
    ? `Evidence:\n${data.evidence
        .map((item, i) => `${i + 1}. ${item}`)
        .join('\n')}\n`
    : ''
}

${
  data.content
    ? `Content Preview:\n${data.content.substring(0, 1000)}${
        data.content.length > 1000 ? '...' : ''
      }\n`
    : ''
}

${data.fullReport ? `Full Analysis Report:\n${data.fullReport}\n` : ''}

---
Generated by TruthGuard Extension
`;

  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const filename = `truthguard-report-${Date.now()}.txt`;

  chrome.downloads.download(
    {
      url: url,
      filename: filename,
      saveAs: true,
    },
    () => {
      URL.revokeObjectURL(url);
    }
  );
}

// Handle extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Open popup (this is handled automatically by the manifest)
  console.log('Extension icon clicked on tab:', tab.id);
});

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('TruthGuard extension installed');
    // You can open a welcome page here if needed
  } else if (details.reason === 'update') {
    console.log('TruthGuard extension updated');
  }
});
