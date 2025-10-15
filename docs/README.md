# AI Content Authenticity Detector

A comprehensive Chrome extension and React web application that uses Google Gemini AI to detect fake content in text, images, and videos.

## 🚀 Features

- **Chrome Extension**: Analyze content directly on any website
- **React Web App**: Full-featured web interface
- **AI-Powered**: Uses Google Gemini 2.5 Flash for fast, accurate analysis
- **Universal Support**: Works on all websites including WhatsApp, Wikipedia, social media
- **Image Analysis**: Detect manipulated or fake images
- **Real-time Detection**: Instant analysis with visual feedback

## 📁 Project Structure

```
fake-content-detector/
├── extension/                 # Chrome Extension
│   ├── manifest.json         # Extension configuration
│   ├── background.js         # Service worker
│   ├── contentScript.js      # Content injection script
│   ├── popup.html           # Extension popup UI
│   ├── popup.js             # Popup functionality
│   ├── apiService.js        # API communication
│   └── icons/               # Extension icons
├── src/                     # React Web Application
│   ├── App.js              # Main React component
│   ├── index.js            # React entry point
│   ├── index.css           # Global styles
│   └── services/
│       └── apiService.js   # API service for web app
├── public/                 # Static web assets
├── docs/                  # Documentation
├── test-api-key.html      # API key testing tool
└── README.md             # Main project README
```

## 🔧 Setup

### 1. Get Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Copy the key (starts with `AIza...`)

### 2. Chrome Extension Setup
1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `extension/` folder
4. Click the extension icon and enter your API key
5. Click "Test API Key" to validate, then "Save API Key"

### 3. React Web App Setup
1. Install dependencies: `npm install`
2. Create `.env` file with your API key:
   ```
   REACT_APP_GEMINI_API_KEY=your_api_key_here
   ```
3. Start the development server: `npm start`

## 🎯 Usage

### Chrome Extension
- **Text Analysis**: Click 🔍 buttons on text content
- **Image Analysis**: Click 🖼️ buttons on images
- **Universal**: Works on all websites including WhatsApp, Wikipedia, social media

### Web Application
- **Text Analysis**: Paste text and click analyze
- **Image Analysis**: Upload images for analysis
- **URL Analysis**: Analyze content from web pages

## 🛠️ Technology Stack

- **Frontend**: React.js, HTML5, CSS3, JavaScript (ES6+)
- **AI**: Google Gemini 2.5 Flash
- **Extension**: Chrome Extension APIs, Manifest V3
- **Storage**: Chrome Storage API
- **Build Tools**: npm, Node.js

## 📋 API Key Requirements

- Valid Google Gemini API key
- Gemini API access enabled
- Sufficient quota/limits

## 🔍 Testing

Use `test-api-key.html` to test your API key before setting up the extension or web app.

## 📄 License

This project is open source and available under the MIT License.
