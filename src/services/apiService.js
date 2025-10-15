// Import GoogleGenerativeAI
import { GoogleGenerativeAI } from '@google/generative-ai';

// API service for handling different content analysis APIs

const API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

// Helper function to convert file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
  });
};

export const apiService = {
  // Text analysis using Gemini API
  analyzeText: async (text) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const prompt = `Analyze this text for factual accuracy. Focus on verifiable facts, not opinions.

Text: "${text}"

Respond ONLY in JSON:
{
  "isFake": boolean,
  "confidence": number (0-1),
  "reasoning": "brief explanation"
}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();
      
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
      throw new Error('Failed to analyze text with Gemini API');
    }
  },

  // Image analysis using Gemini Vision API
  analyzeImage: async (imageFile) => {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const base64Data = await fileToBase64(imageFile);
      
      const prompt = `Analyze this image for authenticity. Check for manipulated content, fake text, or misleading information.

Respond ONLY in JSON:
{
  "isFake": boolean,
  "confidence": number (0-1),
  "reasoning": "brief explanation"
}`;

      const imageParts = [
        {
          inlineData: {
            data: base64Data,
            mimeType: imageFile.type
          }
        }
      ];

      const result = await model.generateContent([prompt, ...imageParts]);
      const response = await result.response;
      const analysisText = response.text();
      
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
      throw new Error('Failed to analyze image with Gemini Vision API');
    }
  },

  // Video analysis using Gemini API
  analyzeVideo: async (videoFile) => {
    try {
      // Note: Gemini doesn't directly support video analysis yet
      // This is a workaround that analyzes video metadata and provides general guidance
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const videoInfo = {
        name: videoFile.name,
        size: videoFile.size,
        type: videoFile.type,
        lastModified: new Date(videoFile.lastModified).toISOString()
      };
      
      const prompt = `
        Analyze this video file for content authenticity based on available information:
        
        File details: ${JSON.stringify(videoInfo)}
        
        Focus on determining if this video likely contains authentic or fake content. Consider:
        - File naming patterns that might indicate content type
        - File size and format that could suggest content authenticity
        - Whether the file characteristics align with genuine content
        - Any indicators that suggest misinformation, staged content, or fabricated material
        
        Note: This analysis is based on metadata only. The goal is to assess content authenticity rather than technical manipulation.
        
        Respond in JSON format with:
        {
          "isFake": boolean,
          "confidence": number (0-1),
          "reasoning": "explanation of content authenticity assessment based on available information"
        }
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysisText = response.text();
      
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
          reasoning: analysis.reasoning + "\n\nNote: This analysis is based on metadata only. For comprehensive video deepfake detection, specialized video analysis tools are recommended."
        };
      } catch (parseError) {
        console.log('Video JSON parsing failed, raw response:', analysisText);
        // Better fallback logic for videos
        const lowerText = analysisText.toLowerCase();
        const fakeKeywords = ['fake', 'manipulated', 'deepfake', 'artificial', 'synthetic', 'altered'];
        const authenticKeywords = ['authentic', 'real', 'genuine', 'original', 'legitimate', 'natural'];
        
        const fakeScore = fakeKeywords.reduce((score, keyword) => 
          score + (lowerText.includes(keyword) ? 1 : 0), 0);
        const authenticScore = authenticKeywords.reduce((score, keyword) => 
          score + (lowerText.includes(keyword) ? 1 : 0), 0);
        
        return {
          isFake: fakeScore > authenticScore,
          confidence: 0.5,
          reasoning: `Video metadata analysis completed. Raw response: ${analysisText}\n\nNote: Full video content analysis requires specialized deepfake detection tools.`
        };
      }
    } catch (error) {
      console.error('Video analysis error:', error);
      throw new Error('Failed to analyze video with Gemini API');
    }
  }
};

export const analyzeText = apiService.analyzeText;
export const analyzeImage = apiService.analyzeImage;
export const analyzeVideo = apiService.analyzeVideo;