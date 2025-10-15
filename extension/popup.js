// Enhanced popup script for AI Content Authenticity Detector
document.addEventListener("DOMContentLoaded", () => {
  // DOM elements
  const apiKeyInput = document.getElementById("apiKey");
  const saveApiKeyBtn = document.getElementById("saveApiKey");
  const testApiKeyBtn = document.getElementById("testApiKey");
  const apiStatus = document.getElementById("apiStatus");
  
  const tabs = document.querySelectorAll(".tab");
  const tabContents = document.querySelectorAll(".tab-content");
  
  const textInput = document.getElementById("textInput");
  const analyzeTextBtn = document.getElementById("analyzeText");
  
  const imageUpload = document.getElementById("imageUpload");
  const imageInput = document.getElementById("imageInput");
  const imagePreview = document.getElementById("imagePreview");
  const previewImg = document.getElementById("previewImg");
  
  const urlInput = document.getElementById("urlInput");
  const analyzeUrlBtn = document.getElementById("analyzeUrl");
  
  const loading = document.getElementById("loading");
  const results = document.getElementById("results");

  // Load saved API key
  chrome.storage.sync.get(["GEMINI_API_KEY", "REACT_APP_GEMINI_API_KEY"], (res) => {
    if (res.GEMINI_API_KEY) {
      apiKeyInput.value = res.GEMINI_API_KEY;
    } else if (res.REACT_APP_GEMINI_API_KEY) {
      apiKeyInput.value = res.REACT_APP_GEMINI_API_KEY;
    }
  });

  // Save API key with validation
  saveApiKeyBtn.addEventListener("click", async () => {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      showStatus("Please enter an API key", "error");
      return;
    }
    
    // Show loading state
    saveApiKeyBtn.disabled = true;
    saveApiKeyBtn.textContent = "Validating...";
    showStatus("Validating API key...", "loading");
    
    try {
      // Test the API key first
      const isValid = await validateApiKey(apiKey);
      
      if (isValid) {
        // Save with both key names for compatibility
        chrome.storage.sync.set({ 
          GEMINI_API_KEY: apiKey,
          REACT_APP_GEMINI_API_KEY: apiKey 
        }, () => {
          showStatus("✅ API key validated and saved successfully!", "success");
        });
      } else {
        showStatus("❌ Invalid API key. Please check your key and try again.", "error");
      }
    } catch (error) {
      showStatus(`❌ Validation failed: ${error.message}`, "error");
    } finally {
      // Reset button state
      saveApiKeyBtn.disabled = false;
      saveApiKeyBtn.textContent = "Save API Key";
    }
  });

  // Test API key (without saving)
  testApiKeyBtn.addEventListener("click", async () => {
    const apiKey = apiKeyInput.value.trim();
    if (!apiKey) {
      showStatus("Please enter an API key to test", "error");
      return;
    }
    
    // Show loading state
    testApiKeyBtn.disabled = true;
    testApiKeyBtn.textContent = "Testing...";
    showStatus("Testing API key...", "loading");
    
    try {
      // Test the API key
      const isValid = await validateApiKey(apiKey);
      
      if (isValid) {
        showStatus("✅ API key is valid and working!", "success");
      } else {
        showStatus("❌ API key is invalid or not working.", "error");
      }
    } catch (error) {
      showStatus(`❌ Test failed: ${error.message}`, "error");
    } finally {
      // Reset button state
      testApiKeyBtn.disabled = false;
      testApiKeyBtn.textContent = "Test API Key";
    }
  });

  // Tab switching
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetTab = tab.dataset.tab;
      
      // Update active tab
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      
      // Update active content
      tabContents.forEach(content => {
        content.classList.remove("active");
        if (content.id === `${targetTab}-tab`) {
          content.classList.add("active");
        }
      });
    });
  });

  // Text analysis
  analyzeTextBtn.addEventListener("click", () => {
    const text = textInput.value.trim();
    if (!text) {
      showStatus("Please enter some text to analyze", "error");
      return;
    }
    
    analyzeContent("text", text);
  });

  // Image upload and analysis
  imageUpload.addEventListener("click", () => {
    imageInput.click();
  });

  imageInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      // Show preview
      const reader = new FileReader();
      reader.onload = (e) => {
        previewImg.src = e.target.result;
        imagePreview.style.display = "block";
      };
      reader.readAsDataURL(file);
      
      // Auto-analyze the image
      analyzeContent("image", file);
    }
  });

  // URL analysis
  analyzeUrlBtn.addEventListener("click", () => {
    const url = urlInput.value.trim();
    if (!url) {
      showStatus("Please enter a URL to analyze", "error");
      return;
    }
    
    // Extract text content from URL
    analyzeUrlContent(url);
  });

  // Main analysis function
  async function analyzeContent(type, content) {
    showLoading(true);
    clearResults();
    
    try {
      let response;
      
      if (type === "text") {
        response = await sendMessage({ type: "analyze-text", text: content });
      } else if (type === "image") {
        // Convert image to base64
        const base64 = await fileToBase64(content);
        response = await sendMessage({ type: "analyze-image", imageData: base64 });
      }
      
      if (response && response.ok) {
        displayResult(response.data);
      } else {
        throw new Error(response?.error || "Analysis failed");
      }
    } catch (error) {
      showStatus(`Analysis failed: ${error.message}`, "error");
    } finally {
      showLoading(false);
    }
  }

  // URL content analysis
  async function analyzeUrlContent(url) {
    showLoading(true);
    clearResults();
    
    try {
      // Get the active tab and inject content script to extract text
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      // Inject script to extract page content
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: extractPageContent
      });
      
      const pageContent = results[0]?.result;
      if (!pageContent) {
        throw new Error("Could not extract content from page");
      }
      
      // Analyze the extracted content
      const response = await sendMessage({ 
        type: "analyze-text", 
        text: `URL: ${url}\n\nContent: ${pageContent}` 
      });
      
      if (response && response.ok) {
        displayResult(response.data);
      } else {
        throw new Error(response?.error || "Analysis failed");
      }
    } catch (error) {
      showStatus(`URL analysis failed: ${error.message}`, "error");
    } finally {
      showLoading(false);
    }
  }

  // Helper function to extract page content (injected into page)
  function extractPageContent() {
    // Remove script and style elements
    const scripts = document.querySelectorAll('script, style, nav, header, footer, aside');
    scripts.forEach(el => el.remove());
    
    // Get main content
    const mainContent = document.querySelector('main, article, .content, .post, .article') || document.body;
    
    // Extract text content
    let text = mainContent.innerText || mainContent.textContent || '';
    
    // Clean up the text
    text = text.replace(/\s+/g, ' ').trim();
    
    // Limit length to avoid token limits
    if (text.length > 4000) {
      text = text.substring(0, 4000) + '...';
    }
    
    return text;
  }

  // Send message to background script
  function sendMessage(message) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        resolve(response);
      });
    });
  }

  // Convert file to base64
  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  }

  // Display analysis result
  function displayResult(result) {
    const resultDiv = document.createElement('div');
    resultDiv.className = `result ${result.isFake ? 'fake' : 'authentic'}`;
    
    const confidence = Math.round(result.confidence * 100);
    
    resultDiv.innerHTML = `
      <div class="result-header">
        <span>${result.isFake ? '⚠️ Likely Fake' : '✅ Likely Authentic'}</span>
      </div>
      <div class="confidence-bar">
        <div class="confidence-fill ${result.isFake ? 'fake' : 'authentic'}" 
             style="width: ${confidence}%"></div>
      </div>
      <div style="font-size: 11px; margin-bottom: 8px;">
        Confidence: ${confidence}%
      </div>
      <div style="line-height: 1.4;">
        ${result.reasoning}
      </div>
    `;
    
    results.appendChild(resultDiv);
  }

  // Show/hide loading state
  function showLoading(show) {
    if (show) {
      loading.classList.add('active');
    } else {
      loading.classList.remove('active');
    }
  }

  // Clear results
  function clearResults() {
    results.innerHTML = '';
  }

  // Show status message
  function showStatus(message, type) {
    apiStatus.textContent = message;
    apiStatus.className = `status ${type}`;
    apiStatus.style.display = 'block';
    
    setTimeout(() => {
      apiStatus.style.display = 'none';
    }, 3000);
  }

  // Auto-focus text input when text tab is active
  document.addEventListener('click', (e) => {
    if (e.target.dataset.tab === 'text') {
      setTimeout(() => textInput.focus(), 100);
    }
  });

  // API Key validation function
  async function validateApiKey(apiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: "Test API key validation. Respond with: {\"valid\": true}"
            }]
          }]
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`API Error (${response.status}): ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      return true; // If we get here, the API key is valid
      
    } catch (error) {
      console.error('API Key validation error:', error);
      throw error;
    }
  }
});