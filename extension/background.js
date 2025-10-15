// Service worker background script
// Import the API service functions directly
importScripts('apiService.js');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message.type);
  
  if (message?.type === "analyze-text") {
    apiService.analyzeText(message.text)
      .then((res) => {
        console.log('Analysis successful:', res);
        sendResponse({ ok: true, data: res });
      })
      .catch((err) => {
        console.error('Analysis failed:', err);
        sendResponse({ ok: false, error: err.message });
      });
    // return true to indicate async response
    return true;
  }
  
  if (message?.type === "analyze-image") {
    // Handle image analysis requests
    apiService.analyzeImage(message.imageData)
      .then((res) => {
        console.log('Image analysis successful:', res);
        sendResponse({ ok: true, data: res });
      })
      .catch((err) => {
        console.error('Image analysis failed:', err);
        sendResponse({ ok: false, error: err.message });
      });
    return true;
  }
  
  // Handle unknown message types
  sendResponse({ ok: false, error: "Unknown message type" });
  return false;
});
