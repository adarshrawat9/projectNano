// AI Visualizer Pro - Enhanced Chrome Extension for AI Challenge 2025
class AIVisualizerPro {
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
      
      if (availability !== 'available') {
        this.showError('Gemini Nano is not ready. Please wait for the model to finish downloading.');
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking AI availability:', error);
      this.showError('Error checking AI availability: ' + error.message);
      return false;
    }
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
      
      // Add AI response to chat with page details
      let responseText = result.summary;
      if (result.pageDetails) {
        responseText += `\n\n📄 Page Details:\n`;
        responseText += `Title: ${result.pageDetails.title}\n`;
        responseText += `URL: ${result.pageDetails.url}\n`;
        if (result.pageDetails.mainTopics && result.pageDetails.mainTopics.length > 0) {
          responseText += `Main Topics: ${result.pageDetails.mainTopics.join(', ')}\n`;
        }
        if (result.pageDetails.keyInsights && result.pageDetails.keyInsights.length > 0) {
          responseText += `Key Insights: ${result.pageDetails.keyInsights.join(', ')}`;
        }
      }
      
      this.addMessageToChat('ai', responseText);
      
      // Generate visualizations if we have structured data
      if (result.keywords && result.scores) {
        await this.generateVisualizations(result.keywords, result.scores);
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
            text: document.body.innerText.slice(0, 8000), // Increased limit
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
      // Create AI session with enhanced system prompt
    const session = await LanguageModel.create({
        systemPrompt: `You are an AI assistant for Chrome Built-in AI Challenge 2025. Provide clear, helpful responses.`
      });

      let prompt = '';
      
      if (typeof inputData === 'object' && inputData.text) {
        // Screen capture mode - analyze webpage data
        prompt = `Analyze this webpage and extract key information:

        Title: ${inputData.title}
        URL: ${inputData.url}
        Content: ${inputData.text.substring(0, 3000)}
        Headings: ${inputData.headings.map(h => h.text).join(', ')}
        
        Provide a clear summary and identify the main topics from this specific webpage content.
        
        Output format (JSON):
        {
          "summary": "Clear summary of this webpage...",
          "keywords": ["actual", "topics", "from", "page"],
          "scores": [8, 7, 6, 5],
          "pageDetails": {
            "title": "${inputData.title}",
            "url": "${inputData.url}",
            "mainTopics": ["topic1", "topic2"],
            "keyInsights": ["insight1", "insight2"]
          }
        }`;
      } else {
        // Manual input mode - process user prompt
        prompt = `Answer this question: "${inputData}"
        
        Provide a helpful response based on the user's question.
        
      Output format (JSON):
      {
          "summary": "Your response here...",
          "keywords": ["relevant", "topics"],
          "scores": [7, 6],
          "pageDetails": {
            "title": "Manual Input",
            "url": "N/A",
            "mainTopics": ["user", "question"],
            "keyInsights": ["response", "insights"]
          }
        }`;
      }

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
          keywords: ['General', 'Content', 'Analysis', 'Summary'],
          scores: [7, 6, 5, 4],
          insights: ['Content processed successfully']
        };
      }
      return JSON.parse(text.slice(jsonStart, jsonEnd + 1));
    } catch (error) {
      console.error('JSON parsing error:', error);
      return {
        summary: text,
        keywords: ['General', 'Content', 'Analysis', 'Summary'],
        scores: [7, 6, 5, 4],
        insights: ['Content processed successfully']
      };
    }
  }

  addMessageToChat(sender, content) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message message-${sender}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = content;
    
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
  const chartConfigs = [
    { id: "barChart", type: "bar" },
    { id: "pieChart", type: "pie" },
    { id: "lineChart", type: "line" }
  ];

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
          <h3>Welcome to AI Visualizer Pro!</h3>
          <p>Choose your mode:</p>
          <ul>
            <li><strong>Screen Capture:</strong> Analyze current webpage content</li>
            <li><strong>Manual Input:</strong> Type your own prompts</li>
          </ul>
        </div>
      </div>
    `;
    this.clearCharts();
    this.chartsContainer.style.display = 'none';
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
      contentDiv.textContent = content;
      
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

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new AIVisualizerPro();
});