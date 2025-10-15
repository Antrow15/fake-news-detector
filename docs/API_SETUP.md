# API Key Setup Guide

## 🔑 Getting Your Gemini API Key

### Step 1: Visit Google AI Studio
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account

### Step 2: Create API Key
1. Click "Create API Key"
2. Choose your Google Cloud project (or create new one)
3. Copy the generated API key (starts with `AIza...`)

### Step 3: Test Your Key
Use the included test tool:
1. Open `test-api-key.html` in your browser
2. Paste your API key
3. Click "Test API Key"
4. Verify you get a success message

## 🚀 Setting Up in Extension

### Method 1: Extension Popup (Recommended)
1. Click the extension icon
2. Enter your API key in the input field
3. Click **"Test API Key"** (green button) to validate
4. Click **"Save API Key"** (gray button) to save

### Method 2: Manual Storage
1. Open Chrome DevTools (F12)
2. Go to Application → Storage → Chrome Extension Storage
3. Add key: `GEMINI_API_KEY`
4. Add value: your API key

## 🌐 Setting Up in Web App

### Method 1: Environment File
1. Create `.env` file in project root
2. Add: `REACT_APP_GEMINI_API_KEY=your_api_key_here`
3. Restart the development server

### Method 2: Direct Configuration
1. Open `src/services/apiService.js`
2. Replace the API key in the code
3. Save and refresh the app

## 💰 Pricing & Limits

### Free Tier
- **15 requests per minute**
- **1 million tokens per day**
- **Perfect for personal use**

### Paid Tier
- **Higher rate limits**
- **More tokens per day**
- **Better for heavy usage**

## 🔍 Validation

### Extension Validation
The extension automatically validates your API key:
- **Format check**: Basic structure validation
- **API test**: Real API call to Gemini
- **Error handling**: Detailed error messages

### Manual Testing
Use `test-api-key.html` for standalone testing:
- Tests API connectivity
- Shows detailed responses
- Helps debug issues

## 🛠️ Troubleshooting

### Common Issues

#### "Invalid API Key"
- Check if key is copied correctly
- Ensure no extra spaces or characters
- Verify key is from Google AI Studio

#### "API Error 403"
- Check if Gemini API is enabled in your project
- Verify billing is set up (if required)
- Check API key permissions

#### "Rate Limit Exceeded"
- Wait a few minutes before trying again
- Consider upgrading to paid tier
- Reduce request frequency

#### "Model Not Found"
- Ensure you're using a valid Gemini model
- Check if model is available in your region
- Verify API key has model access

### Debug Steps
1. **Test with standalone tool**: Use `test-api-key.html`
2. **Check console logs**: Look for error messages
3. **Verify API key**: Test at Google AI Studio
4. **Check quota**: Ensure you have remaining quota

## 🔒 Security Best Practices

- **Never share your API key**
- **Don't commit keys to version control**
- **Use environment variables**
- **Regularly rotate keys**
- **Monitor usage and costs**

## 📊 Monitoring Usage

### Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services → Quotas
3. Monitor your API usage

### Extension Monitoring
- Check browser console for API call logs
- Monitor response times
- Watch for error messages

## 🆘 Support

If you're having issues:
1. Check this troubleshooting guide
2. Test with `test-api-key.html`
3. Verify your API key at Google AI Studio
4. Check Google Cloud Console for quota issues
