// AI Visualizer Pro - Content Script
// Enhanced for Chrome Built-in AI Challenge 2025

console.log("AI Visualizer Pro content script loaded.");

// Add visual indicators for AI analysis
function addAnalysisIndicator() {
  const indicator = document.createElement('div');
  indicator.id = 'ai-visualizer-indicator';
  indicator.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      cursor: pointer;
      transition: all 0.3s ease;
      opacity: 0.9;
    ">
      🤖 AI Visualizer Pro Ready
    </div>
  `;
  
  document.body.appendChild(indicator);
  
  // Add click handler to open extension
  indicator.addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openPopup' });
  });
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    if (indicator && indicator.parentNode) {
      indicator.style.opacity = '0';
      setTimeout(() => {
        if (indicator && indicator.parentNode) {
          indicator.parentNode.removeChild(indicator);
        }
      }, 300);
    }
  }, 5000);
}

// Enhanced page data extraction
function extractEnhancedPageData() {
  const data = {
    title: document.title,
    url: window.location.href,
    domain: window.location.hostname,
    text: document.body.innerText.slice(0, 12000),
    headings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
      .map(h => ({ 
        tag: h.tagName, 
        text: h.innerText.trim(),
        level: parseInt(h.tagName.charAt(1))
      }))
      .filter(h => h.text),
    links: Array.from(document.querySelectorAll('a[href]'))
      .slice(0, 50)
      .map(a => ({ 
        text: a.innerText.trim(), 
        href: a.href,
        isExternal: !a.href.startsWith(window.location.origin)
      }))
      .filter(a => a.text),
    images: Array.from(document.querySelectorAll('img[src]'))
      .slice(0, 20)
      .map(img => ({ 
        alt: img.alt, 
        src: img.src,
        width: img.naturalWidth,
        height: img.naturalHeight
      }))
      .filter(img => img.alt),
    forms: Array.from(document.querySelectorAll('form'))
      .slice(0, 10)
      .map(form => ({
        action: form.action,
        method: form.method,
        inputs: Array.from(form.querySelectorAll('input, textarea, select'))
          .map(input => ({
            type: input.type,
            name: input.name,
            placeholder: input.placeholder
          }))
      })),
    meta: {
      description: document.querySelector('meta[name="description"]')?.content || '',
      keywords: document.querySelector('meta[name="keywords"]')?.content || '',
      author: document.querySelector('meta[name="author"]')?.content || '',
      viewport: document.querySelector('meta[name="viewport"]')?.content || '',
      robots: document.querySelector('meta[name="robots"]')?.content || ''
    },
    social: {
      ogTitle: document.querySelector('meta[property="og:title"]')?.content || '',
      ogDescription: document.querySelector('meta[property="og:description"]')?.content || '',
      ogImage: document.querySelector('meta[property="og:image"]')?.content || '',
      twitterTitle: document.querySelector('meta[name="twitter:title"]')?.content || '',
      twitterDescription: document.querySelector('meta[name="twitter:description"]')?.content || ''
    },
    performance: {
      loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
      domContentLoaded: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
    },
    timestamp: Date.now(),
    userAgent: navigator.userAgent,
    language: document.documentElement.lang || navigator.language
  };
  
  return data;
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'extractPageData':
      try {
        const data = extractEnhancedPageData();
        sendResponse({ success: true, data });
      } catch (error) {
        console.error('Error extracting page data:', error);
        sendResponse({ success: false, error: error.message });
      }
      break;
      
    case 'highlightElements':
      highlightElements(request.selectors);
      sendResponse({ success: true });
      break;
      
    case 'removeHighlights':
      removeHighlights();
      sendResponse({ success: true });
      break;
      
    default:
      console.log('Unknown action in content script:', request.action);
  }
});

// Highlight elements on page
function highlightElements(selectors) {
  removeHighlights();
  
  selectors.forEach(selector => {
    try {
      const elements = document.querySelectorAll(selector);
      elements.forEach(el => {
        el.style.outline = '2px solid #667eea';
        el.style.outlineOffset = '2px';
        el.classList.add('ai-visualizer-highlighted');
      });
    } catch (error) {
      console.error('Error highlighting elements:', error);
    }
  });
}

// Remove highlights
function removeHighlights() {
  const highlighted = document.querySelectorAll('.ai-visualizer-highlighted');
  highlighted.forEach(el => {
    el.style.outline = '';
    el.style.outlineOffset = '';
    el.classList.remove('ai-visualizer-highlighted');
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    addAnalysisIndicator();
  });
} else {
  addAnalysisIndicator();
}

// Export functions for use in popup
window.AIVisualizerContent = {
  extractEnhancedPageData,
  highlightElements,
  removeHighlights
};
