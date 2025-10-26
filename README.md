# AI Visualizer Pro 🚀

**Advanced Chrome Extension for Chrome Built-in AI Challenge 2025**

AI Visualizer Pro is a cutting-edge Chrome extension that leverages Chrome's built-in AI capabilities to analyze webpage content, process data through the Prompt API, and generate comprehensive summaries using the Summarizer API. Built specifically for the Chrome Built-in AI Challenge 2025.

## 🌟 Features

### Core Functionality
- **Screen Capture Analysis**: Automatically extracts and analyzes webpage content including text, headings, links, images, and metadata
- **Manual Input Mode**: ChatGPT-like interface for custom prompts and conversations
- **AI-Powered Processing**: Utilizes Chrome's Prompt API and Summarizer API with Gemini Nano
- **Visual Data Flow**: Interactive flowchart showing the data processing pipeline
- **Dynamic Visualizations**: Generates bar charts, pie charts, and line charts based on AI analysis
- **Conversation History**: Persistent chat history with timestamps
- **Modern UI/UX**: Beautiful, responsive interface with smooth animations

### Advanced Features
- **Context Menu Integration**: Right-click to analyze any page
- **Enhanced Data Extraction**: Comprehensive page analysis including performance metrics
- **Real-time AI Status**: Checks Gemini Nano availability and readiness
- **Export Capabilities**: Download generated charts and analysis results
- **Cross-tab Support**: Works across all websites and domains
- **Privacy-Focused**: All processing happens locally using Chrome's built-in AI

## 🏗️ Architecture

### Data Flow Pipeline
```
📱 Screen Capture → 🤖 Prompt API → 📝 Summarizer API → 📊 Visualization
```

1. **Screen Capture**: Extracts comprehensive webpage data
2. **Prompt API**: Processes data through Gemini Nano
3. **Summarizer API**: Generates structured summaries and insights
4. **Visualization**: Creates interactive charts and visual representations

### Technical Stack
- **Manifest V3**: Latest Chrome extension architecture
- **Chrome AI APIs**: Prompt API and Summarizer API
- **Gemini Nano**: Chrome's built-in AI model
- **Chart.js**: Dynamic data visualization
- **Modern CSS**: Glassmorphism design with smooth animations
- **ES6+ JavaScript**: Modern async/await patterns

## 🚀 Installation

### Prerequisites
- Chrome browser with AI features enabled
- Gemini Nano model downloaded and ready
- Chrome version 120+ (with AI capabilities)

### Setup Instructions
1. Clone or download the extension files
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. Ensure Gemini Nano is downloaded and available
6. Pin the extension to your toolbar for easy access

## 📖 Usage Guide

### Screen Capture Mode
1. Navigate to any webpage you want to analyze
2. Click the AI Visualizer Pro extension icon
3. Select "Screen Capture" mode
4. Click "Analyze Page" to process the current webpage
5. View the AI-generated summary and visualizations

### Manual Input Mode
1. Open the extension popup
2. Select "Manual Input" mode
3. Type your custom prompt in the text area
4. Click "Send" to process with AI
5. View the response and any generated visualizations

### Context Menu
- Right-click on any webpage
- Select "Analyze with AI Visualizer Pro"
- The extension will automatically open and analyze the page

## 🔧 API Integration

### Chrome AI APIs Used
- **LanguageModel.availability()**: Checks if Gemini Nano is ready
- **LanguageModel.create()**: Creates AI sessions with custom system prompts
- **session.prompt()**: Sends prompts to Gemini Nano for processing

### Data Extraction APIs
- **chrome.tabs.query()**: Gets active tab information
- **chrome.scripting.executeScript()**: Extracts page content
- **chrome.storage.local**: Persists chat history and settings

## 🎨 UI Components

### Main Interface
- **Header**: Extension branding with clear/settings buttons
- **Mode Selector**: Toggle between Screen Capture and Manual Input
- **Chat Container**: Conversation history with user/AI messages
- **Input Area**: Text input with send button
- **Loading Indicator**: Animated spinner during AI processing
- **Flowchart**: Visual representation of data processing pipeline
- **Charts Container**: Interactive data visualizations

### Design Features
- **Glassmorphism**: Modern translucent design
- **Smooth Animations**: CSS transitions and keyframe animations
- **Responsive Layout**: Adapts to different screen sizes
- **Dark Theme**: Optimized for extended use
- **Accessibility**: High contrast and keyboard navigation support

## 📊 Data Visualization

### Chart Types
- **Bar Chart**: Importance scores for key topics
- **Pie Chart**: Distribution of content categories
- **Line Chart**: Trend analysis over time

### Export Options
- Download individual charts as PNG
- Bulk download all charts
- Copy analysis results to clipboard

## 🔒 Privacy & Security

- **Local Processing**: All AI processing happens locally using Chrome's built-in AI
- **No External APIs**: No data sent to external servers
- **Minimal Permissions**: Only requests necessary Chrome APIs
- **Data Retention**: Chat history stored locally in Chrome storage
- **Transparent Operation**: Open source code for full transparency

## 🛠️ Development

### Project Structure
```
projectNano/
├── manifest.json          # Extension configuration
├── popup.html            # Main UI structure
├── popup.css             # Styling and animations
├── popup.js              # Main application logic
├── background.js          # Service worker
├── content.js            # Content script
├── chart.js              # Chart.js library
├── icon.png              # Extension icon
└── README.md             # Documentation
```

### Key Classes and Functions
- **AIVisualizerPro**: Main application class
- **captureScreenData()**: Enhanced page data extraction
- **processWithAI()**: AI processing pipeline
- **generateVisualizations()**: Chart generation
- **addMessageToChat()**: Chat interface management

## 🏆 Hackathon Compliance

### Chrome Built-in AI Challenge 2025 Requirements
✅ **Chrome Extension**: Built as a Chrome extension using Manifest V3
✅ **AI APIs**: Utilizes Prompt API and Summarizer API
✅ **Gemini Nano**: Leverages Chrome's built-in AI model
✅ **Public Repository**: Open source code available
✅ **Working Application**: Fully functional extension
✅ **Video Demo**: Ready for demonstration
✅ **English Documentation**: Complete English documentation

### Contest Advantages
- **Innovative Approach**: Combines screen capture with AI analysis
- **User Experience**: ChatGPT-like interface for familiarity
- **Visual Appeal**: Modern design with interactive visualizations
- **Comprehensive**: Handles both automatic and manual input modes
- **Performance**: Optimized for speed and efficiency

## 🚀 Future Enhancements

### Planned Features
- **Multi-language Support**: Analysis in different languages
- **Custom Prompts**: User-defined system prompts
- **Batch Processing**: Analyze multiple tabs simultaneously
- **Export Formats**: PDF reports and CSV data export
- **Integration**: Connect with other productivity tools
- **Analytics**: Usage statistics and insights

### Technical Improvements
- **Performance Optimization**: Faster data extraction
- **Error Handling**: Enhanced error recovery
- **Caching**: Smart caching for repeated analyses
- **Offline Support**: Basic functionality without internet
- **Accessibility**: Enhanced screen reader support

## 📞 Support

### Troubleshooting
- **AI Not Available**: Ensure Gemini Nano is downloaded and ready
- **Extension Not Loading**: Check Chrome version and developer mode
- **Charts Not Displaying**: Verify Chart.js is loaded correctly
- **Permission Errors**: Review manifest permissions

### Contact
- **GitHub Issues**: Report bugs and feature requests
- **Documentation**: Comprehensive usage guides
- **Community**: Join discussions and share feedback

## 📄 License

This project is developed for the Chrome Built-in AI Challenge 2025. All code is open source and available for educational and development purposes.

---

**Built with ❤️ for Chrome Built-in AI Challenge 2025**

*Leveraging the power of Chrome's built-in AI to create intelligent web experiences*