// Adapted API service for Chrome extension context
// Reads API key from chrome.storage and caches it in-memory

let cachedKey = null;
let genAI = null;

async function getApiKey() {
  if (cachedKey) return cachedKey;
  
  // First try to get from Chrome storage (extension popup)
  return new Promise((resolve) => {
    chrome.storage.sync.get(["GEMINI_API_KEY", "REACT_APP_GEMINI_API_KEY"], (res) => {
      // Try both possible key names
      cachedKey = res["GEMINI_API_KEY"] || res["REACT_APP_GEMINI_API_KEY"] || "";
      resolve(cachedKey);
    });
  });
}

async function getModel() {
  if (genAI) return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const key = await getApiKey();
  if (!key) throw new Error("Gemini API key not set. Open the extension popup to configure it.");
  
  // Load GoogleGenerativeAI from CDN
  if (typeof self !== 'undefined' && self.importScripts) {
    // Service worker context - use importScripts
    try {
      // We'll make direct fetch calls instead of using the library
      return { key, model: "gemini-2.5-flash" };
    } catch (error) {
      throw new Error("Failed to load Gemini AI library");
    }
  } else {
    // Regular context - use dynamic import
    try {
      const { GoogleGenerativeAI } = await import("https://esm.sh/@google/generative-ai@0.15.0");
      genAI = new GoogleGenerativeAI(key);
      return genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    } catch (error) {
      throw new Error("Failed to load Gemini AI library");
    }
  }
}

// Direct API call function for service worker context
async function callGeminiAPI(key, prompt, imageData = null) {
  const model = "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
  
  let requestBody;
  
  if (imageData) {
    // Image analysis
    requestBody = {
      contents: [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: imageData
            }
          }
        ]
      }]
    };
  } else {
    // Text analysis
    requestBody = {
      contents: [{
        parts: [{ text: prompt }]
      }]
    };
  }
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    throw new Error(`API call failed: ${error.message}`);
  }
}

const apiService = {
  analyzeText: async (text) => {
    try {
      const key = await getApiKey();
      if (!key) throw new Error("Gemini API key not set. Open the extension popup to configure it.");
      
      const prompt = `Analyze this text for factual accuracy. Focus on verifiable facts, not opinions.

Text: "${text}"

Respond ONLY in JSON:
{
  "isFake": boolean,
  "confidence": number (0-1),
  "reasoning": "brief explanation"
}`;

      let analysisText;
      
      // Check if we're in a service worker context
      if (typeof self !== 'undefined' && self.importScripts) {
        // Service worker - use direct API call
        analysisText = await callGeminiAPI(key, prompt);
      } else {
        // Regular context - use the library
        const model = await getModel();
        const result = await model.generateContent(prompt);
        const response = await result.response;
        analysisText = response.text();
      }
      
      try {
        // Clean the response text to extract JSON
        let cleanedText = analysisText.trim();
        
        // Remove markdown code blocks if present
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.replace(/```json\s*/, '').replace(/```\s*$/, '');
        } else if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/```\s*/, '').replace(/```\s*$/, '');
        }
        
        const analysis = JSON.parse(cleanedText);
        return {
          isFake: analysis.isFake,
          confidence: parseFloat(analysis.confidence),
          reasoning: analysis.reasoning
        };
      } catch (parseError) {
        console.log('JSON parsing failed, raw response:', analysisText);
        // Better fallback logic - analyze the actual content
        const lowerText = analysisText.toLowerCase();
        const isFakeKeywords = ['fake', 'false', 'misinformation', 'manipulated', 'fabricated', 'incorrect', 'wrong', 'inaccurate'];
        const isAuthenticKeywords = ['authentic', 'real', 'genuine', 'legitimate', 'true', 'accurate', 'correct', 'factual'];
        
        const fakeScore = isFakeKeywords.reduce((score, keyword) => 
          score + (lowerText.includes(keyword) ? 1 : 0), 0);
        const authenticScore = isAuthenticKeywords.reduce((score, keyword) => 
          score + (lowerText.includes(keyword) ? 1 : 0), 0);
        
        // Default to fake if uncertain, as it's better to be cautious with misinformation
        return {
          isFake: fakeScore >= authenticScore,
          confidence: 0.6,
          reasoning: `Analysis completed with fallback logic. The AI detected potential factual issues. Raw response: ${analysisText}`
        };
      }
    } catch (error) {
      console.error('Text analysis error:', error);
      throw new Error(`Failed to analyze text: ${error.message}`);
    }
  },

  analyzeImage: async (imageData) => {
    try {
      const key = await getApiKey();
      if (!key) throw new Error("Gemini API key not set. Open the extension popup to configure it.");
      
      const prompt = `Analyze this image for authenticity. Check for manipulated content, fake text, or misleading information.

Respond ONLY in JSON:
{
  "isFake": boolean,
  "confidence": number (0-1),
  "reasoning": "brief explanation"
}`;

      let analysisText;
      
      // Check if we're in a service worker context
      if (typeof self !== 'undefined' && self.importScripts) {
        // Service worker - use direct API call
        analysisText = await callGeminiAPI(key, prompt, imageData);
      } else {
        // Regular context - use the library
        const model = await getModel();
        const imageParts = [
          {
            inlineData: {
              data: imageData,
              mimeType: "image/jpeg"
            }
          }
        ];
        const result = await model.generateContent([prompt, ...imageParts]);
        const response = await result.response;
        analysisText = response.text();
      }
      
      try {
        // Clean the response text to extract JSON
        let cleanedText = analysisText.trim();
        
        // Remove markdown code blocks if present
        if (cleanedText.startsWith('```json')) {
          cleanedText = cleanedText.replace(/```json\s*/, '').replace(/```\s*$/, '');
        } else if (cleanedText.startsWith('```')) {
          cleanedText = cleanedText.replace(/```\s*/, '').replace(/```\s*$/, '');
        }
        
        const analysis = JSON.parse(cleanedText);
        return {
          isFake: analysis.isFake,
          confidence: parseFloat(analysis.confidence),
          reasoning: analysis.reasoning
        };
      } catch (parseError) {
        console.log('Image JSON parsing failed, raw response:', analysisText);
        // Better fallback logic for images
        const lowerText = analysisText.toLowerCase();
        const fakeKeywords = ['fake', 'manipulated', 'edited', 'artificial', 'deepfake', 'altered'];
        const authenticKeywords = ['authentic', 'real', 'genuine', 'original', 'unedited', 'natural'];
        
        const fakeScore = fakeKeywords.reduce((score, keyword) => 
          score + (lowerText.includes(keyword) ? 1 : 0), 0);
        const authenticScore = authenticKeywords.reduce((score, keyword) => 
          score + (lowerText.includes(keyword) ? 1 : 0), 0);
        
        return {
          isFake: fakeScore > authenticScore,
          confidence: 0.6,
          reasoning: `Image analysis completed. Raw response: ${analysisText}`
        };
      }
    } catch (error) {
      console.error('Image analysis error:', error);
      throw new Error(`Failed to analyze image: ${error.message}`);
    }
  }
};

// Make apiService available globally for importScripts
if (typeof self !== 'undefined') {
  self.apiService = apiService;
}