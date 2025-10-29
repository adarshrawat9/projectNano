// AI Visualizer Pro - Background Service Worker
// Enhanced for Chrome Built-in AI Challenge 2025

chrome.runtime.onInstalled.addListener((details) => {
  console.log("AI Visualizer Pro Extension installed/updated:", details.reason);
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'getPageData':
      handleGetPageData(sender.tab, sendResponse);
      return true; // Keep message channel open for async response
      
    case 'checkAIAvailability':
      handleCheckAIAvailability(sendResponse);
      return true;
      
    case 'processWithAI':
      handleProcessWithAI(request.data, sendResponse);
      return true;
      
    default:
      console.log('Unknown action:', request.action);
  }
});

async function handleGetPageData(tab, sendResponse) {
  try {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: extractPageData
    });
    
    sendResponse({ success: true, data: results[0].result });
  } catch (error) {
    console.error('Error extracting page data:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleCheckAIAvailability(sendResponse) {
  try {
    if (!LanguageModel || !LanguageModel.availability) {
      sendResponse({ success: false, error: 'Chrome AI APIs not available' });
      return;
    }
    
    const availability = await LanguageModel.availability();
    sendResponse({ success: true, availability });
  } catch (error) {
    console.error('Error checking AI availability:', error);
    sendResponse({ success: false, error: error.message });
  }
}

async function handleProcessWithAI(data, sendResponse) {
  try {
    if (!LanguageModel || !LanguageModel.availability) {
      sendResponse({ success: false, error: 'Chrome AI APIs not available' });
      return;
    }
    
    const availability = await LanguageModel.availability();
    if (availability !== 'available') {
      sendResponse({ success: false, error: 'Gemini Nano not ready' });
      return;
    }
    
    const session = await LanguageModel.create({
      systemPrompt: "You are an advanced AI assistant for the Chrome Built-in AI Challenge 2025. Provide helpful, accurate, and detailed responses.",
      output: 'en' // ensure output language is specified
    });
    
    const response = await session.prompt(data.prompt);
    sendResponse({ success: true, response });
  } catch (error) {
    console.error('Error processing with AI:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Function to extract comprehensive page data
function extractPageData() {
  const data = {
    title: document.title,
    url: window.location.href,
    text: document.body.innerText.slice(0, 10000),
    headings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map(h => ({ tag: h.tagName, text: h.innerText.trim() }))
      .filter(h => h.text),
    links: Array.from(document.querySelectorAll('a[href]'))
      .slice(0, 30)
      .map(a => ({ text: a.innerText.trim(), href: a.href }))
      .filter(a => a.text),
    images: Array.from(document.querySelectorAll('img[src]'))
      .slice(0, 15)
      .map(img => ({ alt: img.alt, src: img.src }))
      .filter(img => img.alt),
    meta: {
      description: document.querySelector('meta[name="description"]')?.content || '',
      keywords: document.querySelector('meta[name="keywords"]')?.content || '',
      author: document.querySelector('meta[name="author"]')?.content || ''
    },
    timestamp: Date.now()
  };
  
  return data;
}

// Handle tab updates to refresh data
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Could trigger data refresh here if needed
    console.log('Tab updated:', tab.url);
  }
});

// Handle extension icon click
if (chrome.action && chrome.action.onClicked) {
  chrome.action.onClicked.addListener((tab) => {
    // This will open the popup automatically due to manifest configuration
    console.log('Extension icon clicked for tab:', tab?.url);
  });
} else {
  console.warn('chrome.action API not available in this environment');
}
