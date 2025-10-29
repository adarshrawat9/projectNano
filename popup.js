// Content Analyzer Extension
class ContentAnalyzer {
  constructor() {
    this.currentMode = 'screen';
    this.chatHistory = [];
    this.charts = [];
    this.isProcessing = false;
    
    this.initializeElements();
    this.bindEvents();
    this.loadChatHistory();
    this.checkAIAvailability();
  }

  initializeElements() {
    // Mode elements
    this.screenModeBtn = document.getElementById('screenModeBtn');
    this.manualModeBtn = document.getElementById('manualModeBtn');
    
    // Chat elements
    this.chatContainer = document.getElementById('chatContainer');
    this.manualInput = document.getElementById('manualInput');
    this.sendBtn = document.getElementById('sendBtn');
    
    // UI elements
    this.loadingIndicator = document.getElementById('loadingIndicator');
    this.flowchartContainer = document.getElementById('flowchartContainer');
    this.chartsContainer = document.getElementById('chartsContainer');
    this.clearChatBtn = document.getElementById('clearChatBtn');
    this.downloadChartsBtn = document.getElementById('downloadChartsBtn');
  }

  bindEvents() {
    // Mode switching
    this.screenModeBtn.addEventListener('click', () => this.switchMode('screen'));
    this.manualModeBtn.addEventListener('click', () => this.switchMode('manual'));
    
    // Send button
    this.sendBtn.addEventListener('click', () => this.handleSend());
    
    // Manual input enter key
    this.manualInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.handleSend();
      }
    });
    
    // Clear chat
    this.clearChatBtn.addEventListener('click', () => this.clearChat());
    
    // Download charts
    this.downloadChartsBtn.addEventListener('click', () => this.downloadAllCharts());
  }

  async checkAIAvailability() {
    try {
      if (!LanguageModel || !LanguageModel.availability) {
        this.showError('Chrome AI APIs not available. Please ensure you\'re using Chrome with AI features enabled.');
        return false;
      }

      const availability = await LanguageModel.availability();
      console.log('AI Model availability:', availability);
      
      if (availability === 'available') {
        // Check if this is the first time it's available (model just finished downloading)
        const lastStatus = sessionStorage.getItem('lastAIStatus');
        if (lastStatus !== 'available') {
          this.showDownloadCompletePopup();
        }
        sessionStorage.setItem('lastAIStatus', 'available');
        return true;
      } else if (availability === 'downloadable') {
        this.showDownloadProgress();
        // Keep checking until available
        setTimeout(() => this.checkAIAvailability(), 2000);
        return false;
      } else if (availability === 'unavailable') {
        this.showError('Gemini Nano is not available. Please check your Chrome AI settings.');
        return false;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking AI availability:', error);
      this.showError('Error checking AI availability: ' + error.message);
      return false;
    }
  }

  showDownloadProgress() {
    this.showLoading();
    const loadingText = this.loadingIndicator.querySelector('.loading-text');
    if (loadingText) {
      loadingText.textContent = 'Downloading Gemini Nano model... Please wait.';
    }
  }

  showDownloadCompletePopup() {
    // Create a popup notification
    const popup = document.createElement('div');
    popup.className = 'download-complete-popup';
    popup.innerHTML = `
      <div class="popup-content">
        <div class="popup-icon">✓</div>
        <div class="popup-title">Gemini Nano Ready!</div>
        <div class="popup-message">The AI model is now ready to use.</div>
      </div>
    `;
    
    document.body.appendChild(popup);
    
    // Remove popup after 3 seconds
    setTimeout(() => {
      popup.classList.add('fade-out');
      setTimeout(() => popup.remove(), 500);
    }, 3000);
  }

  switchMode(mode) {
    this.currentMode = mode;
    
    // Update button states
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(mode + 'ModeBtn').classList.add('active');
    
    // Show/hide manual input
    this.manualInput.style.display = mode === 'manual' ? 'block' : 'none';
    
    // Update send button text
    const btnText = this.sendBtn.querySelector('.btn-text');
    btnText.textContent = mode === 'screen' ? 'Analyze Page' : 'Send';
    
    // Clear manual input when switching to screen mode
    if (mode === 'screen') {
      this.manualInput.value = '';
    }
  }

  async handleSend() {
    if (this.isProcessing) return;
    
    const isAvailable = await this.checkAIAvailability();
    if (!isAvailable) return;
    
    this.isProcessing = true;
    this.showLoading();
    
    try {
      let userMessage = '';
      let inputData = '';
      
      if (this.currentMode === 'screen') {
        userMessage = 'Analyze the current webpage content';
        inputData = await this.captureScreenData();
      } else {
        userMessage = this.manualInput.value.trim();
        if (!userMessage) {
          this.hideLoading();
          this.isProcessing = false;
      return;
        }
        inputData = userMessage;
        this.manualInput.value = '';
      }
      
      // Add user message to chat
      this.addMessageToChat('user', userMessage);
      
      // Process with AI
      const result = await this.processWithAI(inputData);
      
      // Add AI response to chat with page details - only show if meaningful
      let responseText = result.summary;
      if (result.pageDetails) {
        let hasContent = false;
        
        // Check if title is meaningful
        const title = result.pageDetails.title && 
                      result.pageDetails.title.trim() && 
                      result.pageDetails.title !== 'Manual Input' && 
                      result.pageDetails.title !== 'Unknown'
                      ? result.pageDetails.title : null;
        
        // Check if URL is meaningful
        const url = result.pageDetails.url && 
                    result.pageDetails.url !== 'N/A' && 
                    result.pageDetails.url.trim()
                    ? result.pageDetails.url : null;
        
        // Check if main topics exist
        const topics = result.pageDetails.mainTopics && 
                       result.pageDetails.mainTopics.length > 0
                       ? result.pageDetails.mainTopics : null;
        
        // Check if insights exist
        const insights = result.pageDetails.keyInsights && 
                         result.pageDetails.keyInsights.length > 0
                         ? result.pageDetails.keyInsights : null;
        
        // Only add page details if there's meaningful content
        if (title || url || topics || insights) {
          responseText += `\n\n**Page Details:**\n`;
          if (title) {
            responseText += `Title: ${title}\n`;
          }
          if (url) {
            responseText += `URL: ${url}\n`;
          }
          if (topics) {
            responseText += `Main Topics: **${topics.join(', ')}**\n`;
          }
          if (insights) {
            responseText += `Key Insights: **${insights.join(', ')}**`;
          }
        }
      }
      
      this.addMessageToChat('ai', responseText, true);
      
      // Only show charts if AI explicitly determines they're necessary AND we have data
      if (result.showCharts && result.keywords && result.scores && 
          result.keywords.length > 0 && result.scores.length > 0 && 
          result.scores.every(s => typeof s === 'number')) {
        // Add chart reason to chat
        this.addMessageToChat('ai', `📊 Visualization: ${result.chartReason}`, true);
        await this.generateVisualizations(result.keywords, result.scores);
      } else {
        // Hide charts if not needed
        this.hideCharts();
      }
      
    } catch (error) {
      console.error('Error processing request:', error);
      this.addMessageToChat('ai', `Error: ${error.message}`);
    } finally {
      this.hideLoading();
      this.isProcessing = false;
    }
  }

  async captureScreenData() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Get page content
      const [{ result: pageText }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Extract comprehensive page data
          const data = {
            title: document.title,
            url: window.location.href,
            text: document.body.innerText.slice(0, 12000), // Optimized limit for faster processing
            headings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'))
              .map(h => ({ tag: h.tagName, text: h.innerText.trim() }))
              .filter(h => h.text),
            links: Array.from(document.querySelectorAll('a[href]'))
              .slice(0, 20)
              .map(a => ({ text: a.innerText.trim(), href: a.href }))
              .filter(a => a.text),
            images: Array.from(document.querySelectorAll('img[src]'))
              .slice(0, 10)
              .map(img => ({ alt: img.alt, src: img.src }))
              .filter(img => img.alt),
            meta: {
              description: document.querySelector('meta[name="description"]')?.content || '',
              keywords: document.querySelector('meta[name="keywords"]')?.content || ''
            }
          };
          return JSON.stringify(data);
        }
      });
      
      return JSON.parse(pageText);
    } catch (error) {
      console.error('Error capturing screen data:', error);
      throw new Error('Failed to capture page data');
    }
  }

  async processWithAI(inputData) {
    try {
      const session = await LanguageModel.create({
        systemPrompt: `Provide clear, helpful responses. Only suggest charts for numerical data.`,
        output: 'en' // ensure output language is specified
      });

      let prompt = '';
      
      if (typeof inputData === 'object' && inputData.text) {
        // Screen capture mode - analyze webpage data
        prompt = `Analyze this webpage:
Title: ${inputData.title}
URL: ${inputData.url}
Content: ${inputData.text.substring(0, 6000)}

Requirements:
- Provide a detailed summary with key information and takeaways
- Only recommend charts if content has numerical data or statistics
- Charts not needed for text-only content

Output JSON only:
{
  "summary": "Detailed summary",
  "showCharts": true/false,
  "chartReason": "Brief reason",
  "keywords": [],
  "scores": [],
  "pageDetails": {
    "title": "${inputData.title}",
    "url": "${inputData.url}",
    "mainTopics": [],
    "keyInsights": []
  }
}`;
      } else {
        // Manual input mode - process user prompt through Language Model
        prompt = `Answer: "${inputData}"

Requirements:
- Provide a detailed response
- Only recommend charts for numerical data

Output JSON:
{
  "summary": "Detailed response",
  "showCharts": true/false,
  "chartReason": "Brief reason",
  "keywords": [],
  "scores": [],
  "pageDetails": {
    "title": "Manual Input",
    "url": "N/A",
    "mainTopics": [],
    "keyInsights": []
  }
}`;
      }

      // Process through Prompt API
      const response = await session.prompt(prompt);
      console.log('AI Response:', response);
      
      const parsed = this.parseJSON(response);
      if (!parsed) {
        throw new Error('Failed to parse AI response');
      }
      
      return parsed;
    } catch (error) {
      console.error('Error processing with AI:', error);
      throw error;
    }
  }

  parseJSON(text) {
    try {
      const jsonStart = text.indexOf('{');
      const jsonEnd = text.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) {
        return {
          summary: text,
          showCharts: false,
          chartReason: "Unable to parse response",
          keywords: ['General', 'Content', 'Analysis', 'Summary'],
          scores: [7, 6, 5, 4],
          pageDetails: {
            title: "Unknown",
            url: "N/A",
            mainTopics: ['Content processed'],
            keyInsights: ['Analysis completed']
          }
        };
      }
      const parsed = JSON.parse(text.slice(jsonStart, jsonEnd + 1));
      
      // Ensure showCharts is boolean
      if (typeof parsed.showCharts !== 'boolean') {
        parsed.showCharts = false;
      }
      
      return parsed;
    } catch (error) {
      console.error('JSON parsing error:', error);
      return {
        summary: text,
        showCharts: false,
        chartReason: "Unable to parse response",
        keywords: ['General', 'Content', 'Analysis', 'Summary'],
        scores: [7, 6, 5, 4],
        pageDetails: {
          title: "Unknown",
          url: "N/A",
          mainTopics: ['Content processed'],
          keyInsights: ['Analysis completed']
        }
      };
    }
  }

  addMessageToChat(sender, content, isHTML = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message message-${sender}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    
    if (isHTML || sender === 'ai') {
      // Parse and enhance content for AI messages
      contentDiv.innerHTML = this.enhanceContent(content);
    } else {
      contentDiv.textContent = content;
    }
    
    const timestampDiv = document.createElement('div');
    timestampDiv.className = 'message-timestamp';
    timestampDiv.textContent = new Date().toLocaleTimeString();
    
    messageDiv.appendChild(contentDiv);
    messageDiv.appendChild(timestampDiv);
    
    // Remove welcome message if it exists
    const welcomeMessage = this.chatContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
      welcomeMessage.remove();
    }
    
    this.chatContainer.appendChild(messageDiv);
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    
    // Save to history
    this.chatHistory.push({ sender, content, timestamp: Date.now() });
    this.saveChatHistory();
  }

  enhanceContent(content) {
    // Make URLs clickable
    let enhanced = content.replace(/https?:\/\/[^\s]+/g, (url) => {
      return `<a href="${url}" target="_blank" class="chat-link">${url}</a>`;
    });
    
    // Highlight key information patterns
    enhanced = enhanced.replace(/\*\*(.*?)\*\*/g, '<strong class="highlight-text">$1</strong>');
    enhanced = enhanced.replace(/Title:(.*?)(?=\n|$)/g, '<div class="info-label">📄 Title:</div><div class="info-value">$1</div>');
    enhanced = enhanced.replace(/URL:(.*?)(?=\n|$)/g, '<div class="info-label">🔗 URL:</div><div class="info-value">$1</div>');
    enhanced = enhanced.replace(/Main Topics:(.*?)(?=\n|$)/g, '<div class="info-label">📋 Main Topics:</div><div class="info-value">$1</div>');
    enhanced = enhanced.replace(/Key Insights:(.*?)(?=\n|$)/g, '<div class="info-label">💡 Key Insights:</div><div class="info-value">$1</div>');
    
    // Add line breaks for better formatting
    enhanced = enhanced.replace(/\n/g, '<br>');
    
    // Highlight important keywords
    const importantKeywords = ['important', 'key', 'significant', 'critical', 'essential', 'notable'];
    importantKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      enhanced = enhanced.replace(regex, `<span class="keyword-highlight">${keyword}</span>`);
    });
    
    return enhanced;
  }


  async generateVisualizations(keywords, scores) {
    try {
      this.chartsContainer.style.display = 'block';
      this.clearCharts();
      
      // Wait a bit for the container to be visible
      await new Promise(resolve => setTimeout(resolve, 100));
      
      this.drawCharts(keywords, scores);
      this.chartsContainer.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
      console.error('Error generating visualizations:', error);
    }
  }

  drawCharts(labels, values) {
  // Only create one chart at a time based on what makes sense for the data
  // Priority: Bar chart (best for comparisons), then pie (for distributions)
  const chartConfigs = [
    { id: "barChart", type: "bar" },
    { id: "pieChart", type: "pie" }
  ];

  // Clear the line chart container to avoid confusion
  const lineChartContainer = document.getElementById("lineChart").parentElement;
  lineChartContainer.style.display = 'none';

  chartConfigs.forEach(({ id, type }) => {
    const ctx = document.getElementById(id).getContext("2d");
    const chart = new Chart(ctx, {
      type,
      data: {
      labels,
      datasets: [{
            label: "Importance Score",
        data: values,
        borderWidth: 2,
            backgroundColor: [
              '#007bff', '#28a745', '#ffc107', '#dc3545'
            ],
            borderColor: [
              '#0056b3', '#1e7e34', '#e0a800', '#c82333'
            ],
        fill: type === "line"
      }]
      },
      options: {
      responsive: true,
          maintainAspectRatio: false,
      plugins: {
        legend: {
        display: type !== "bar",
        labels: {
                color: "#333333"
        }
        },
        tooltip: {
        callbacks: {
          label: function(context) {
          return `${context.label}: ${context.parsed.y ?? context.parsed}`;
          }
        },
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              titleColor: "#ffffff",
              bodyColor: "#ffffff",
              borderColor: "#ffffff"
        }
      },
      scales: type === "bar" || type === "line" ? {
        x: {
              ticks: { color: "#333333" },
              title: { color: "#333333" },
              grid: { color: "rgba(0, 0, 0, 0.1)" },
              border: { color: "rgba(0, 0, 0, 0.2)" }
        },
        y: {
        beginAtZero: true,
        max: 10,
              title: { display: true, text: "Importance Score", color: "#333333" },
              ticks: { color: "#333333" },
              grid: { color: "rgba(0, 0, 0, 0.1)" },
              border: { color: "rgba(0, 0, 0, 0.2)" }
        }
      } : {}
      }
      });

      this.charts.push(chart);
    });
  }

  clearCharts() {
    this.charts.forEach(c => c.destroy());
    this.charts = [];
  }

  hideCharts() {
    this.chartsContainer.style.display = 'none';
    this.clearCharts();
  }

  downloadAllCharts() {
    this.charts.forEach((chart, idx) => {
        const link = document.createElement("a");
        link.href = chart.toBase64Image();
      link.download = `ai-visualizer-chart-${idx + 1}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
  }

  showLoading() {
    this.loadingIndicator.style.display = 'flex';
    this.sendBtn.disabled = true;
    this.sendBtn.querySelector('.btn-text').textContent = 'Processing...';
  }

  hideLoading() {
    this.loadingIndicator.style.display = 'none';
    this.sendBtn.disabled = false;
    const btnText = this.sendBtn.querySelector('.btn-text');
    btnText.textContent = this.currentMode === 'screen' ? 'Analyze Page' : 'Send';
  }

  showError(message) {
    this.addMessageToChat('ai', `❌ ${message}`);
  }

  clearChat() {
    this.chatHistory = [];
    this.chatContainer.innerHTML = `
      <div class="welcome-message">
        <div class="welcome-content">
          <h3>Content Analyzer</h3>
          <p>Analyze webpages with AI</p>
          <ul>
            <li><strong>Screen Capture:</strong> Analyze the current page</li>
            <li><strong>Manual Input:</strong> Ask questions</li>
          </ul>
        </div>
      </div>
    `;
    this.hideCharts();
    this.saveChatHistory();
  }

  saveChatHistory() {
    try {
      chrome.storage.local.set({ chatHistory: this.chatHistory });
    } catch (error) {
      console.error('Error saving chat history:', error);
    }
  }

  loadChatHistory() {
    try {
      chrome.storage.local.get(['chatHistory'], (result) => {
        if (result.chatHistory && result.chatHistory.length > 0) {
          this.chatHistory = result.chatHistory;
          this.renderChatHistory();
        }
      });
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }

  renderChatHistory() {
    if (this.chatHistory.length === 0) return;
    
    // Clear welcome message
    const welcomeMessage = this.chatContainer.querySelector('.welcome-message');
    if (welcomeMessage) {
      welcomeMessage.remove();
    }
    
    // Render all messages
    this.chatHistory.forEach(({ sender, content, timestamp }) => {
      const messageDiv = document.createElement('div');
      messageDiv.className = `chat-message message-${sender}`;
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'message-content';
      
      // Render AI messages with enhancement
      if (sender === 'ai') {
        contentDiv.innerHTML = this.enhanceContent(content);
      } else {
        contentDiv.textContent = content;
      }
      
      const timestampDiv = document.createElement('div');
      timestampDiv.className = 'message-timestamp';
      timestampDiv.textContent = new Date(timestamp).toLocaleTimeString();
      
      messageDiv.appendChild(contentDiv);
      messageDiv.appendChild(timestampDiv);
      this.chatContainer.appendChild(messageDiv);
    });
    
    this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
  }
}

// Initialize extension
document.addEventListener('DOMContentLoaded', () => {
  new ContentAnalyzer();
});