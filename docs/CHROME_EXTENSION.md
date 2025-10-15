# Chrome Extension Guide

## 🚀 Quick Setup

1. **Get API Key**: Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. **Load Extension**: 
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the `extension/` folder
3. **Configure**: Click extension icon → Enter API key → Test → Save

## 🎯 Features

### Universal Website Support
- ✅ **All Websites**: Works on every website
- ✅ **WhatsApp Web**: Message and image analysis
- ✅ **Wikipedia**: Article and image analysis
- ✅ **Social Media**: Twitter, Facebook, Instagram
- ✅ **News Sites**: Article and image analysis
- ✅ **Google Images**: Image authenticity analysis

### Content Analysis
- **Text Analysis**: Click 🔍 on any text content
- **Image Analysis**: Click 🖼️ on any image
- **Real-time**: Works on dynamically loaded content
- **Visual Feedback**: Colored borders and tooltips

## 🔧 How It Works

### Content Detection
- Automatically detects text paragraphs and images
- Adds scan buttons (🔍 for text, 🖼️ for images)
- Smart filtering to avoid UI elements
- Works with lazy-loaded content

### Analysis Process
1. User clicks scan button
2. Content sent to background script
3. API call to Google Gemini
4. Results displayed with visual feedback

## 🛠️ Technical Details

### Files Structure
```
extension/
├── manifest.json      # Extension configuration
├── background.js      # Service worker (API calls)
├── contentScript.js   # DOM manipulation
├── popup.html        # Extension popup UI
├── popup.js          # Popup functionality
├── apiService.js     # API communication
└── icons/           # Extension icons
```

### Key Features
- **Manifest V3**: Latest Chrome extension standard
- **Service Worker**: Background processing
- **Content Scripts**: DOM injection and manipulation
- **Chrome Storage**: Secure API key storage
- **Message Passing**: Communication between components

## 🔍 Troubleshooting

### Extension Not Working
1. Check if extension is enabled in `chrome://extensions/`
2. Reload the extension (click refresh button)
3. Check browser console for errors (F12)

### API Key Issues
1. Use "Test API Key" button in popup
2. Verify key is valid at [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Check if you have sufficient quota

### No Scan Buttons Appearing
1. Check browser console for "AI Content Detector" messages
2. Try refreshing the page
3. Check if site is excluded (only Google search is excluded)

### Image Analysis Not Working
1. Ensure images are at least 10px in size
2. Check console for image processing logs
3. Try on different websites

## 📊 Performance

- **Speed**: 2-3 seconds analysis time
- **Model**: Gemini 2.5 Flash (optimized for speed)
- **Memory**: Minimal impact on browser performance
- **Storage**: API key stored securely in Chrome storage

## 🔒 Privacy & Security

- **Local Storage**: API key never leaves your browser
- **No Tracking**: No user data collection
- **Secure**: Uses Chrome's secure storage system
- **Open Source**: Code is transparent and auditable
