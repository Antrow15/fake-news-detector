// Enhanced content script for AI Content Authenticity Detector
// Injects scan buttons and provides inline analysis

(function() {
  'use strict';

  // Configuration
  const CONFIG = {
    buttonText: '🔍',
    buttonClass: 'ai-detector-btn',
    highlightClass: 'ai-detector-highlight',
    pendingClass: 'ai-detector-pending',
    fakeClass: 'ai-detector-fake',
    authenticClass: 'ai-detector-authentic'
  };

  // Create enhanced scan button
function createScanButton() {
  const btn = document.createElement("span");
    btn.textContent = CONFIG.buttonText;
    btn.className = CONFIG.buttonClass;
    btn.style.cssText = `
      cursor: pointer;
      margin-left: 6px;
      user-select: none;
      padding: 2px 6px;
      border-radius: 4px;
      background: #f3f4f6;
      border: 1px solid #d1d5db;
      font-size: 12px;
      transition: all 0.2s;
      display: inline-block;
    `;
    
    btn.addEventListener('mouseenter', () => {
      btn.style.background = '#e5e7eb';
      btn.style.borderColor = '#9ca3af';
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.background = '#f3f4f6';
      btn.style.borderColor = '#d1d5db';
    });
    
    return btn;
  }

  // Create image scan button
  function createImageScanButton() {
    const btn = document.createElement("span");
    btn.textContent = "🖼️";
    btn.className = CONFIG.buttonClass;
    btn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      cursor: pointer;
      user-select: none;
      padding: 4px 8px;
      border-radius: 4px;
      background: rgba(59, 130, 246, 0.9);
      color: white;
      font-size: 12px;
      transition: all 0.2s;
      display: inline-block;
      z-index: 1000;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    `;
    
    btn.addEventListener('mouseenter', () => {
      btn.style.background = 'rgba(37, 99, 235, 0.9)';
      btn.style.transform = 'scale(1.05)';
    });
    
    btn.addEventListener('mouseleave', () => {
      btn.style.background = 'rgba(59, 130, 246, 0.9)';
      btn.style.transform = 'scale(1)';
    });
    
  return btn;
}

  // Create result tooltip
  function createTooltip(result) {
    const tooltip = document.createElement("div");
    tooltip.style.cssText = `
      position: absolute;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      padding: 12px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 10000;
      max-width: 300px;
      font-size: 12px;
      line-height: 1.4;
      display: none;
    `;
    
    const confidence = Math.round(result.confidence * 100);
    const status = result.isFake ? '⚠️ Likely Fake' : '✅ Likely Authentic';
    const statusColor = result.isFake ? '#dc2626' : '#16a34a';
    
    tooltip.innerHTML = `
      <div style="font-weight: 600; color: ${statusColor}; margin-bottom: 8px;">
        ${status} (${confidence}%)
      </div>
      <div style="width: 100%; height: 4px; background: #e5e7eb; border-radius: 2px; margin-bottom: 8px;">
        <div style="width: ${confidence}%; height: 100%; background: ${statusColor}; border-radius: 2px;"></div>
      </div>
      <div style="color: #374151;">
        ${result.reasoning}
      </div>
    `;
    
    return tooltip;
  }

  // Attach buttons only to meaningful content paragraphs
function attachButtons() {
    console.log('AI Content Detector: Attaching buttons...');
    console.log('AI Content Detector: Current URL:', window.location.href);
    // Target ALL meaningful content paragraphs
    const contentSelectors = [
      // REMOVED: 'p' - was causing buttons on email metadata, UI elements, etc.
      // Main content paragraphs
      'article p', 'main p', '[role="main"] p',
      '.content p', '.post p', '.article p', '.text p',
      '.entry-content p', '.post-content p', '.article-content p',
      // Wikipedia specific
      '.mw-parser-output p', '#mw-content-text p',
      // Blog and news content
      '.story p', '.news p', '.blog p', '.entry p',
      // News specific selectors
      '.news-article p', '.news-content p', '.news-body p',
      '.article-text p', '.article-body p', '.article-content p',
      '.story-content p', '.story-body p', '.story-text p',
      '.post-body p', '.post-text p', '.post-content p',
      '.content-body p', '.content-text p', '.content-main p',
      // News website specific
      '.headline p', '.lead p', '.intro p', '.summary p',
      '.excerpt p', '.description p', '.caption p',
      // WhatsApp Web - only actual message content (very specific)
      '[data-testid="conversation-panel-messages"] .message-in .selectable-text',
      '[data-testid="conversation-panel-messages"] .message-out .selectable-text',
      '[data-testid="conversation-panel-messages"] .message .selectable-text',
      '[data-testid="conversation-panel-messages"] .msg .selectable-text',
      // Gmail specific - only email body content
      '.email-body p', '.message-body p', '.email-content p',
      '.msg-body p', '.mail-body p', '.content-body p',
      '[data-message-id] p', '.thread p', '.conversation p',
      // Social media content
      '[data-testid="tweet"] p', '.post p',
      // General content areas
      '.message p', '.text p', '.content p',
      // Additional content areas
      '.description p', '.summary p', '.excerpt p',
      '.body p', '.content-body p', '.article-body p'
    ];
    
    // Image selectors for ALL websites
    const imageSelectors = [
      'img', // All images
      'article img', 'div img', 'span img',
      '.content img', '.post img', '.article img',
      'main img', '[role="main"] img',
      '.mw-parser-output img', '#mw-content-text img',
      '.entry-content img', '.post-content img', '.article-content img',
      // Google Images specific
      '.rg_i', '.rg_ic', '.rg_l', '.rg_meta img',
      '[data-src]', '[data-lazy]', '.lazy img',
      // WhatsApp Web images - ONLY in message content and very specific (removed generic selectors)
      // Note: WhatsApp image detection is handled separately with ultra-strict filtering
      // Social media images
      '[data-testid="tweet"] img', '.post img',
      // General content images
      '.message img', '.text img', '.content img',
      // Additional common image selectors
      '.image img', '.photo img', '.picture img',
      '.gallery img', '.carousel img', '.slider img'
    ];
    
    // Elements to completely avoid (UI elements, navigation, etc.)
    const avoidSelectors = [
      'nav', 'header', 'footer', 'aside', 'menu',
      '.nav', '.navigation', '.menu', '.header', '.footer',
      '.search', '.search-bar', '.searchbox', '.search-input',
      'input', 'button', 'select', 'textarea', 'form',
      '.input', '.button', '.btn', '.form',
      '.sidebar', '.widget', '.ad', '.advertisement',
      '.social', '.share', '.comment', '.reply',
      '.meta', '.author', '.date', '.time',
      '.breadcrumb', '.pagination', '.pager',
      '[role="navigation"]', '[role="search"]', '[role="banner"]',
      '[role="contentinfo"]', '[role="complementary"]',
      // Navigation and UI elements
      '.navbar', '.nav-bar', '.top-bar', '.bottom-bar',
      '.toolbar', '.action-bar', '.status-bar',
      '.tab', '.tabs', '.tab-content', '.tab-panel',
      '.dropdown', '.dropdown-menu', '.dropdown-item',
      '.modal', '.popup', '.overlay', '.tooltip',
      // Single words and short text
      '.tag', '.label', '.badge', '.chip',
      '.title', '.subtitle', '.caption', '.legend',
      // Email metadata and UI elements
      '.sender', '.recipient', '.subject', '.date', '.time', '.timestamp',
      '.metadata', '.email-header', '.email-footer', '.email-status',
      '.from', '.to', '.cc', '.bcc', '.reply-to',
      // Social media metadata
      '.username', '.handle', '.upvotes', '.downvotes', '.likes', '.comments',
      '.shares', '.views', '.subreddit', '.community', '.post-meta',
      '.user-info', '.post-info', '.comment-count', '.vote-count',
      // Reddit specific
      '.upvotes', '.downvotes', '.comments', '.shares', '.hide',
      '.read-more', '.expand', '.collapse', '.show-more',
      // Emoji and decorative elements
      '.emoji', '.smiley', '.icon', '.symbol', '.glyph', '.character',
      '[data-emoji]', '[data-icon]', '[data-symbol]', '[data-glyph]',
      '.emoji-container', '.icon-container', '.symbol-container',
      // WhatsApp specific exclusions
      '[data-testid="chat-list"]', '[data-testid="chat-list"] *',
      '.chat-list', '.chat-list *',
      '[data-testid="side"]', '[data-testid="side"] *',
      '.side', '.side *',
      '[data-testid="chatlist"]', '[data-testid="chatlist"] *',
      // Avoid chat list items, timestamps, avatars, etc.
      '[data-testid="cell-frame-container"]',
      '[data-testid="cell-frame-container"] *',
      '.chat', '.chat *',
      '.chat-item', '.chat-item *',
      '.chat-title', '.chat-subtitle', '.chat-time',
      '.avatar', '.chat-avatar',
      // WhatsApp profile photos and UI elements
      '[data-testid="avatar"]', '[data-testid="avatar"] *',
      '.avatar', '.avatar *',
      '.profile-picture', '.profile-picture *',
      '.user-avatar', '.user-avatar *',
      '.contact-avatar', '.contact-avatar *',
      // WhatsApp message metadata
      '.message-time', '.message-status', '.message-info',
      '.msg-time', '.msg-status', '.msg-info',
      // WhatsApp UI elements
      '.message-header', '.message-footer', '.message-meta',
      '.msg-header', '.msg-footer', '.msg-meta'
    ];
    
    // Check if element should be avoided
    function shouldAvoid(element) {
      // Check if element matches any avoid selectors
      for (const selector of avoidSelectors) {
        if (element.matches(selector) || element.closest(selector)) {
          return true;
        }
      }
      
      // Check if element is in a form or interactive area
      if (element.closest('form, [role="form"], [role="search"], [role="navigation"]')) {
        return true;
      }
      
      // Check if element is very small (likely UI text) - increased threshold
      if (element.textContent.trim().length < 100) {
        return true;
      }
      
      // Skip elements that are likely navigation items
      if (element.closest('.navbar') || element.closest('.nav-bar') ||
          element.closest('.top-bar') || element.closest('.bottom-bar') ||
          element.closest('.toolbar') || element.closest('.action-bar')) {
        return true;
      }
      
      // Skip elements that are likely single words or labels
      if (element.classList.contains('tag') || element.classList.contains('label') ||
          element.classList.contains('badge') || element.classList.contains('chip') ||
          element.classList.contains('title') || element.classList.contains('subtitle')) {
        return true;
      }
      
      // Skip email metadata and UI elements
      if (element.classList.contains('sender') || element.classList.contains('recipient') ||
          element.classList.contains('subject') || element.classList.contains('date') ||
          element.classList.contains('time') || element.classList.contains('timestamp') ||
          element.classList.contains('metadata') || element.classList.contains('header') ||
          element.classList.contains('footer') || element.classList.contains('status')) {
        return true;
      }
      
      // Skip social media metadata
      if (element.classList.contains('username') || element.classList.contains('handle') ||
          element.classList.contains('upvotes') || element.classList.contains('downvotes') ||
          element.classList.contains('likes') || element.classList.contains('comments') ||
          element.classList.contains('shares') || element.classList.contains('views') ||
          element.classList.contains('subreddit') || element.classList.contains('community')) {
        return true;
      }
      
      // Skip emoji and decorative elements
      if (element.classList.contains('emoji') || element.classList.contains('smiley') ||
          element.classList.contains('icon') || element.classList.contains('symbol') ||
          element.classList.contains('glyph') || element.classList.contains('character') ||
          element.classList.contains('emoji-container') || element.classList.contains('icon-container') ||
          element.classList.contains('symbol-container')) {
        return true;
      }
      
      // Skip elements with emoji-related data attributes
      if (element.hasAttribute('data-emoji') || element.hasAttribute('data-icon') ||
          element.hasAttribute('data-symbol') || element.hasAttribute('data-glyph')) {
        return true;
      }
      
      // Check if element has many child elements (likely a container, not content)
      const textLength = element.textContent.trim().length;
      const childElements = element.children.length;
      if (childElements > 3 && textLength / childElements < 30) {
        return true;
      }
      
      // Check if element is in common UI areas
      const parent = element.parentElement;
      if (parent && (
        parent.classList.contains('nav') ||
        parent.classList.contains('menu') ||
        parent.classList.contains('header') ||
        parent.classList.contains('footer') ||
        parent.classList.contains('sidebar') ||
        parent.tagName === 'NAV' ||
        parent.tagName === 'HEADER' ||
        parent.tagName === 'FOOTER' ||
        parent.tagName === 'ASIDE'
      )) {
        return true;
      }
      
      // Gmail specific exclusions
      if (window.location.hostname.includes('gmail.com') || window.location.hostname.includes('mail.google.com')) {
        // Skip email headers, metadata, and UI elements
        if (element.closest('.email-header') || element.closest('.email-footer') ||
            element.closest('.sender') || element.closest('.recipient') ||
            element.closest('.subject') || element.closest('.date') ||
            element.closest('.time') || element.closest('.timestamp') ||
            element.closest('.metadata') || element.closest('.email-status') ||
            element.closest('.from') || element.closest('.to') ||
            element.closest('.cc') || element.closest('.bcc') ||
            element.closest('.reply-to') || element.closest('.email-actions') ||
            element.closest('.email-toolbar') || element.closest('.email-nav')) {
          return true;
        }
        
        // Only allow in email body content
        if (!element.closest('.email-body') && !element.closest('.message-body') &&
            !element.closest('.email-content') && !element.closest('.msg-body') &&
            !element.closest('.mail-body') && !element.closest('.content-body') &&
            !element.closest('[data-message-id]') && !element.closest('.thread') &&
            !element.closest('.conversation')) {
          return true;
        }
      }
      
      // WhatsApp specific exclusions
      if (window.location.hostname.includes('whatsapp.com') || window.location.hostname.includes('web.whatsapp.com')) {
        // Check if element is in chat list or sidebar
        if (element.closest('[data-testid="chat-list"]') ||
            element.closest('[data-testid="side"]') ||
            element.closest('[data-testid="chatlist"]') ||
            element.closest('.chat-list') ||
            element.closest('.side') ||
            element.closest('[data-testid="cell-frame-container"]') ||
            element.closest('.chat') ||
            element.closest('.chat-item')) {
          return true;
        }
        
        // Only allow in conversation panel
        if (!element.closest('[data-testid="conversation-panel-messages"]')) {
          return true;
        }
        
        // Skip profile photos and avatars
        if (element.closest('[data-testid="avatar"]') ||
            element.closest('.avatar') ||
            element.closest('.profile-picture') ||
            element.closest('.user-avatar') ||
            element.closest('.contact-avatar')) {
          return true;
        }
        
        // Skip message metadata (time, status, info)
        if (element.classList.contains('message-time') ||
            element.classList.contains('message-status') ||
            element.classList.contains('message-info') ||
            element.classList.contains('msg-time') ||
            element.classList.contains('msg-status') ||
            element.classList.contains('msg-info')) {
          return true;
        }
        
        // Skip very short messages (likely UI elements)
        if (element.textContent.trim().length < 20) {
          return true;
        }
        
        // Only allow actual message content with substantial text
        if (element.textContent.trim().split(' ').length < 3) {
          return true;
        }
      }
      
      return false;
    }
    
    contentSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach((element) => {
        // Skip if already processed
        if (element.dataset.aiDetectorProcessed || 
            element.querySelector(`.${CONFIG.buttonClass}`)) {
          return;
        }
        
        // Skip if element should be avoided
        if (shouldAvoid(element)) {
          return;
        }
        
        // Only add to elements with meaningful content
        const text = element.textContent.trim();
        if (text.length < 30 || text.length > 3000) {
          return;
        }
        
        // Skip if text looks like UI elements (very short, repetitive, etc.)
        if (text.split(' ').length < 5) {
          return;
        }
        
        // Skip if element is mostly whitespace or special characters
        if (text.replace(/[^\w\s]/g, '').length < 20) {
          return;
        }
        
        // Skip single words or very short phrases
        if (text.split(' ').length < 3) {
          return;
        }
        
        // Skip navigation elements, buttons, links
        if (element.tagName === 'A' || element.tagName === 'BUTTON' || 
            element.classList.contains('nav') || element.classList.contains('menu') ||
            element.classList.contains('button') || element.classList.contains('btn')) {
          return;
        }
        
        // Skip elements that are likely navigation or UI
        if (element.closest('nav') || element.closest('header') || 
            element.closest('footer') || element.closest('aside') ||
            element.closest('.nav') || element.closest('.menu') ||
            element.closest('.header') || element.closest('.footer')) {
          return;
        }
        
        // For news websites, be more permissive
        const isNewsSite = window.location.hostname.includes('news') || 
                          window.location.hostname.includes('cnn') ||
                          window.location.hostname.includes('bbc') ||
                          window.location.hostname.includes('reuters') ||
                          window.location.hostname.includes('nytimes') ||
                          window.location.hostname.includes('guardian') ||
                          window.location.hostname.includes('washingtonpost') ||
                          window.location.hostname.includes('foxnews') ||
                          window.location.hostname.includes('abcnews') ||
                          window.location.hostname.includes('cbsnews') ||
                          window.location.hostname.includes('nbcnews');
        
        if (isNewsSite) {
          // For news sites, be more lenient with content detection
          if (text.length >= 20 && text.split(' ').length >= 3) {
            // Allow news content even if it's shorter
            console.log('AI Content Detector: Allowing news content:', text.substring(0, 50));
          }
        }
        
    const btn = createScanButton();
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          analyzeElement(element, btn);
        });
        
        element.appendChild(btn);
        element.dataset.aiDetectorProcessed = "true";
        console.log('AI Content Detector: Added text button to element:', element.textContent.substring(0, 50));
      });
    });
    
    console.log('AI Content Detector: Processing images...');
    
    // Add image analysis buttons
    imageSelectors.forEach(selector => {
      const images = document.querySelectorAll(selector);
      console.log(`AI Content Detector: Found ${images.length} images with selector: ${selector}`);
      
      images.forEach((img) => {
        // Skip if already processed
        if (img.dataset.aiDetectorProcessed || 
            img.querySelector(`.${CONFIG.buttonClass}`)) {
          return;
        }
        
        console.log('AI Content Detector: Processing image:', img.src, 'Dimensions:', img.width, 'x', img.height);
        
        // Skip emojis and small decorative images FIRST (before any other filtering)
        if (isEmojiOrDecorative(img)) {
          console.log('AI Content Detector: Skipping emoji/decorative image:', img.src);
          return;
        }
        
        // WhatsApp specific: More reasonable filtering for message images
        if (window.location.hostname.includes('whatsapp.com') || window.location.hostname.includes('web.whatsapp.com')) {
          // Skip if not in conversation panel
          if (!img.closest('[data-testid="conversation-panel-messages"]')) {
            console.log('AI Content Detector: Skipping WhatsApp image - not in conversation panel');
            return;
          }
          
          // Skip if not in actual message content
          if (!img.closest('.message-in') && !img.closest('.message-out') && 
              !img.closest('.message') && !img.closest('.msg')) {
            console.log('AI Content Detector: Skipping WhatsApp image - not in message content');
            return;
          }
          
          // Skip if too small (likely profile photo) - reduced threshold
          if (img.width < 200 || img.height < 200) {
            console.log('AI Content Detector: Skipping WhatsApp image - too small:', img.width, 'x', img.height);
            return;
          }
          
          // Skip if square and small (likely profile photo) - reduced threshold
          if (img.width === img.height && img.width < 300) {
            console.log('AI Content Detector: Skipping WhatsApp image - square and small:', img.width, 'x', img.height);
            return;
          }
        }
        
        // Skip if image should be avoided
        if (shouldAvoid(img)) {
          return;
        }
        
        // Only add to meaningful images - very permissive
        if (img.width < 10 || img.height < 10) {
          console.log('AI Content Detector: Skipping image - too small:', img.width, 'x', img.height);
          return;
        }
        
        // Skip obvious UI elements (icons, buttons, etc.) - but be more permissive
        if (img.src.includes('icon') && (img.width < 24 || img.height < 24)) {
          console.log('AI Content Detector: Skipping image - looks like icon:', img.src);
          return;
        }
        
        // Skip images with very short src (likely data URIs for icons)
        if (img.src.length < 20) {
          console.log('AI Content Detector: Skipping image - src too short:', img.src);
          return;
        }
        
        // Check if image likely contains text (only show button if it does)
        if (!imageLikelyContainsText(img)) {
          console.log('AI Content Detector: Skipping image - no text detected:', img.src);
          return;
        }
        
        // WhatsApp specific: More reasonable filtering for profile photos
        if (window.location.hostname.includes('whatsapp.com') || window.location.hostname.includes('web.whatsapp.com')) {
          // For WhatsApp, be more reasonable - allow medium-sized images in message content
          if (img.width < 200 || img.height < 200) {
            console.log('AI Content Detector: Skipping WhatsApp image - too small:', img.width, 'x', img.height);
            return;
          }
          
          // Skip if image is square and small (likely profile photo)
          if (img.width === img.height && img.width < 300) {
            console.log('AI Content Detector: Skipping WhatsApp image - square and small:', img.width, 'x', img.height);
            return;
          }
          
          // Skip if image is in any avatar-related container
          if (img.closest('[data-testid*="avatar"]') ||
              img.closest('[class*="avatar"]') ||
              img.closest('[class*="profile"]') ||
              img.closest('[class*="contact"]')) {
            console.log('AI Content Detector: Skipping WhatsApp image - in avatar container');
            return;
          }
          
          // Skip if image is in chat list or sidebar
          if (img.closest('[data-testid="chat-list"]') ||
              img.closest('[data-testid="side"]') ||
              img.closest('.chat-list') ||
              img.closest('.side')) {
            console.log('AI Content Detector: Skipping WhatsApp image - in chat list/sidebar');
            return;
          }
          
          // Skip if image is in message header or metadata
          if (img.closest('.message-header') ||
              img.closest('.message-meta') ||
              img.closest('.msg-header') ||
              img.closest('.msg-meta')) {
            console.log('AI Content Detector: Skipping WhatsApp image - in message metadata');
            return;
          }
          
          // Skip if image is in any container that might be a profile area
          const parent = img.parentElement;
          if (parent) {
            const parentClasses = parent.className.toLowerCase();
            const parentId = parent.id.toLowerCase();
            if (parentClasses.includes('avatar') ||
                parentClasses.includes('profile') ||
                parentClasses.includes('contact') ||
                parentClasses.includes('user') ||
                parentClasses.includes('chat') ||
                parentId.includes('avatar') ||
                parentId.includes('profile') ||
                parentId.includes('contact') ||
                parentId.includes('user')) {
              console.log('AI Content Detector: Skipping WhatsApp image - in profile-related container');
              return;
            }
          }
          
          // Skip if image is in any element that might be a profile area
          let currentElement = img;
          for (let i = 0; i < 5; i++) { // Check up to 5 parent levels
            if (currentElement.parentElement) {
              currentElement = currentElement.parentElement;
              const classes = currentElement.className.toLowerCase();
              const id = currentElement.id.toLowerCase();
              if (classes.includes('avatar') ||
                  classes.includes('profile') ||
                  classes.includes('contact') ||
                  classes.includes('user') ||
                  classes.includes('chat') ||
                  id.includes('avatar') ||
                  id.includes('profile') ||
                  id.includes('contact') ||
                  id.includes('user')) {
                console.log('AI Content Detector: Skipping WhatsApp image - in profile-related parent');
                return;
              }
            } else {
              break;
            }
          }
          
          // For WhatsApp, be ULTRA strict - only allow very large images in message content
          if (img.width < 500 || img.height < 500) {
            console.log('AI Content Detector: Skipping WhatsApp image - not large enough:', img.width, 'x', img.height);
            return;
          }
        }
        
        console.log('AI Content Detector: Image passed filters, adding button');
        
        const btn = createImageScanButton();
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          analyzeImage(img, btn);
        });
        
        // Position button near the image
        const container = img.parentElement;
        if (container) {
          container.style.position = 'relative';
          container.appendChild(btn);
        } else {
          // If no parent container, position relative to the image itself
          img.style.position = 'relative';
          img.parentNode.insertBefore(btn, img.nextSibling);
        }
        
        img.dataset.aiDetectorProcessed = "true";
        console.log('AI Content Detector: Added image button to:', img.src.substring(0, 50));
        
        // For lazy-loaded images, also watch for when they load
        if (img.dataset.src || img.dataset.lazy || !img.complete) {
          img.addEventListener('load', () => {
            console.log('AI Content Detector: Lazy image loaded:', img.src.substring(0, 50));
            // Re-attach buttons when lazy images load
            setTimeout(attachButtons, 100);
          });
        }
      });
    });
    
    console.log('AI Content Detector: Button attachment complete');
    
    // Force add buttons to ALL images for testing
    const allImages = document.querySelectorAll('img');
    console.log(`AI Content Detector: Found ${allImages.length} total images on page`);
    
    allImages.forEach((img, index) => {
      if (!img.dataset.aiDetectorProcessed && !img.querySelector(`.${CONFIG.buttonClass}`)) {
        console.log(`AI Content Detector: Force adding button to image ${index + 1}:`, img.src);
        
        const btn = createImageScanButton();
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          analyzeImage(img, btn);
        });
        
        // Position button near the image
        const container = img.parentElement;
        if (container) {
          container.style.position = 'relative';
          container.appendChild(btn);
        } else {
          img.style.position = 'relative';
          img.parentNode.insertBefore(btn, img.nextSibling);
        }
        
        img.dataset.aiDetectorProcessed = "true";
      }
    });
  }

  // Analyze element content
  function analyzeElement(element, button) {
    const text = element.textContent.trim();
    if (!text) return;
    
    // Show loading state
    button.textContent = '⏳';
    button.style.background = '#fef3c7';
    button.style.borderColor = '#f59e0b';
    
    // Add pending class to element
    element.classList.add(CONFIG.pendingClass);
    element.style.transition = 'background-color 0.3s';
    
    // Send analysis request
    chrome.runtime.sendMessage({ 
      type: "analyze-text", 
      text: text 
    }, (response) => {
      // Reset button
      button.textContent = CONFIG.buttonText;
      button.style.background = '#f3f4f6';
      button.style.borderColor = '#d1d5db';
      
      if (!response || !response.ok) {
        element.classList.remove(CONFIG.pendingClass);
        showError(button, response?.error || "Analysis failed");
        return;
      }
      
      const { isFake, confidence, reasoning } = response.data;
      
      // Remove pending class and add result class
      element.classList.remove(CONFIG.pendingClass);
      element.classList.add(isFake ? CONFIG.fakeClass : CONFIG.authenticClass);
      
      // Apply visual feedback
      const bgColor = isFake ? '#fef2f2' : '#f0fdf4';
      const borderColor = isFake ? '#fecaca' : '#bbf7d0';
      element.style.backgroundColor = bgColor;
      element.style.borderLeft = `4px solid ${borderColor}`;
      element.style.paddingLeft = '8px';
      
      // Create and show tooltip
      const tooltip = createTooltip(response.data);
      document.body.appendChild(tooltip);
      
      // Position tooltip
      const rect = element.getBoundingClientRect();
      tooltip.style.left = `${rect.left}px`;
      tooltip.style.top = `${rect.bottom + 5}px`;
      tooltip.style.display = 'block';
      
      // Hide tooltip on click outside
      const hideTooltip = (e) => {
        if (!tooltip.contains(e.target) && !element.contains(e.target)) {
          tooltip.remove();
          document.removeEventListener('click', hideTooltip);
        }
      };
      
      setTimeout(() => {
        document.addEventListener('click', hideTooltip);
      }, 100);
      
      // Auto-hide tooltip after 10 seconds
      setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.remove();
        }
      }, 10000);
    });
  }

  // Analyze image content
  function analyzeImage(img, button) {
    console.log('Starting image analysis for:', img.src);
    
    // Show loading state
    button.textContent = '⏳';
    button.style.background = 'rgba(245, 158, 11, 0.9)';
    
    try {
      // Convert image to base64
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Use natural dimensions if available, otherwise use displayed dimensions
      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;
      
      canvas.width = width;
      canvas.height = height;
      
      console.log('Canvas dimensions:', width, 'x', height);
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob from canvas');
          showError(button, "Failed to process image");
          return;
        }
        
        console.log('Blob created, size:', blob.size);
        
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result.split(',')[1];
          console.log('Base64 length:', base64.length);
          
          // Send analysis request
          chrome.runtime.sendMessage({ 
            type: "analyze-image", 
            imageData: base64 
          }, (response) => {
            console.log('Image analysis response:', response);
            
            // Reset button
            button.textContent = '🖼️';
            button.style.background = 'rgba(59, 130, 246, 0.9)';
            
            if (!response || !response.ok) {
              console.error('Image analysis failed:', response?.error);
              showError(button, response?.error || "Image analysis failed");
              return;
            }
            
            const { isFake, confidence, reasoning } = response.data;
            
            // Apply visual feedback to image
            const borderColor = isFake ? '#fecaca' : '#bbf7d0';
            const bgColor = isFake ? 'rgba(254, 242, 242, 0.8)' : 'rgba(240, 253, 244, 0.8)';
            
            img.style.border = `3px solid ${borderColor}`;
            img.style.backgroundColor = bgColor;
            img.style.padding = '4px';
            img.style.borderRadius = '8px';
            
            // Create and show tooltip
            const tooltip = createTooltip(response.data);
            document.body.appendChild(tooltip);
            
            // Position tooltip near the image
            const rect = img.getBoundingClientRect();
            tooltip.style.left = `${rect.left}px`;
            tooltip.style.top = `${rect.bottom + 5}px`;
            tooltip.style.display = 'block';
            
            // Hide tooltip on click outside
            const hideTooltip = (e) => {
              if (!tooltip.contains(e.target) && !img.contains(e.target)) {
                tooltip.remove();
                document.removeEventListener('click', hideTooltip);
              }
            };
            
            setTimeout(() => {
              document.addEventListener('click', hideTooltip);
            }, 100);
            
            // Auto-hide tooltip after 10 seconds
            setTimeout(() => {
              if (tooltip.parentNode) {
                tooltip.remove();
              }
            }, 10000);
          });
        };
        reader.onerror = () => {
          console.error('Failed to read blob as data URL');
          showError(button, "Failed to process image");
        };
        reader.readAsDataURL(blob);
      }, 'image/jpeg', 0.8);
      
    } catch (error) {
      console.error('Error in image analysis:', error);
      showError(button, "Error processing image: " + error.message);
    }
  }

  // Check if image is an emoji or decorative image
  function isEmojiOrDecorative(img) {
    // Check if image is very small (likely emoji) - more aggressive
    if (img.width <= 64 || img.height <= 64) {
      return true;
    }
    
    // Check if image is square and small (likely emoji) - more aggressive
    if (img.width === img.height && img.width <= 80) {
      return true;
    }
    
    // Check if image source contains emoji-related keywords
    const src = img.src.toLowerCase();
    if (src.includes('emoji') || src.includes('smiley') || src.includes('icon') ||
        src.includes('sprite') || src.includes('symbol') || src.includes('glyph') ||
        src.includes('unicode') || src.includes('font') || src.includes('character') ||
        src.includes('reaction') || src.includes('sticker') || src.includes('avatar') ||
        src.includes('profile') || src.includes('thumb') || src.includes('favicon') ||
        src.includes('logo') || src.includes('badge') || src.includes('marker')) {
      return true;
    }
    
    // Check if image is in emoji-related containers
    if (img.closest('.emoji') || img.closest('.smiley') || img.closest('.icon') ||
        img.closest('.symbol') || img.closest('.glyph') || img.closest('.character') ||
        img.closest('[data-emoji]') || img.closest('[data-icon]') ||
        img.closest('[data-symbol]') || img.closest('[data-glyph]')) {
      return true;
    }
    
    // Check if image has emoji-related alt text
    const alt = img.alt.toLowerCase();
    if (alt.includes('emoji') || alt.includes('smiley') || alt.includes('icon') ||
        alt.includes('symbol') || alt.includes('glyph') || alt.includes('character') ||
        alt.includes('face') || alt.includes('hand') || alt.includes('gesture') ||
        alt.includes('reaction') || alt.includes('sticker') || alt.includes('avatar') ||
        alt.includes('profile') || alt.includes('thumb') || alt.includes('favicon') ||
        alt.includes('logo') || alt.includes('badge') || alt.includes('marker') ||
        alt.includes('like') || alt.includes('love') || alt.includes('heart') ||
        alt.includes('thumbs') || alt.includes('clap') || alt.includes('laugh')) {
      return true;
    }
    
    // Check if image is in a text node (likely inline emoji)
    const parent = img.parentElement;
    if (parent && parent.tagName === 'SPAN' && parent.children.length === 1) {
      const parentText = parent.textContent.trim();
      if (parentText.length <= 3) { // Likely just an emoji
        return true;
      }
    }
    
    // Check if image is very small and in a text context (likely emoji)
    if (img.width <= 32 && img.height <= 32) {
      const parent = img.parentElement;
      if (parent && (parent.tagName === 'SPAN' || parent.tagName === 'DIV')) {
        const parentText = parent.textContent.trim();
        if (parentText.length <= 10) { // Likely just an emoji or small text
          return true;
        }
      }
    }
    
    // Check if image is in a button or link (likely decorative)
    if (img.closest('button') || img.closest('a') || img.closest('.btn') ||
        img.closest('.link') || img.closest('.anchor')) {
      // Skip if it's small (more aggressive)
      if (img.width <= 48 || img.height <= 48) {
        return true;
      }
    }
    
    return false;
  }

  // Check if image likely contains text
  function imageLikelyContainsText(img) {
    // WhatsApp specific: Skip profile photos and avatars
    if (window.location.hostname.includes('whatsapp.com') || window.location.hostname.includes('web.whatsapp.com')) {
      // Skip if image is a profile photo or avatar
      if (img.closest('[data-testid="avatar"]') ||
          img.closest('.avatar') ||
          img.closest('.profile-picture') ||
          img.closest('.user-avatar') ||
          img.closest('.contact-avatar') ||
          img.closest('.chat-avatar')) {
        return false;
      }
      
      // Skip small images (likely profile photos)
      if (img.width < 150 || img.height < 150) {
        return false;
      }
      
      // Only allow images in actual message content
      if (!img.closest('[data-testid="conversation-panel-messages"]')) {
        return false;
      }
      
      // Skip images that are likely profile photos (square and small)
      if (img.width === img.height && img.width < 300) {
        return false;
      }
      
      // Skip images in chat list or sidebar
      if (img.closest('[data-testid="chat-list"]') ||
          img.closest('[data-testid="side"]') ||
          img.closest('.chat-list') ||
          img.closest('.side')) {
        return false;
      }
      
      // Skip images that are likely profile photos based on context
      const parent = img.parentElement;
      if (parent) {
        const parentClasses = parent.className.toLowerCase();
        if (parentClasses.includes('avatar') ||
            parentClasses.includes('profile') ||
            parentClasses.includes('contact') ||
            parentClasses.includes('user')) {
          return false;
        }
      }
      
      // Skip images in message headers or metadata
      if (img.closest('.message-header') ||
          img.closest('.message-meta') ||
          img.closest('.msg-header') ||
          img.closest('.msg-meta')) {
        return false;
      }
      
      // For WhatsApp, be more reasonable - allow medium-sized images in message content
      if (img.width < 200 || img.height < 200) {
        return false;
      }
      
      // Skip if image is square and small (likely profile photo)
      if (img.width === img.height && img.width < 300) {
        return false;
      }
    }
    
    // Check if image has alt text that suggests it contains text
    const altText = img.alt || '';
    if (altText.toLowerCase().includes('text') || 
        altText.toLowerCase().includes('screenshot') ||
        altText.toLowerCase().includes('document') ||
        altText.toLowerCase().includes('meme') ||
        altText.toLowerCase().includes('quote')) {
      return true;
    }
    
    // Check if image is in a context that suggests it contains text
    const parent = img.parentElement;
    if (parent) {
      const parentText = parent.textContent || '';
      if (parentText.toLowerCase().includes('screenshot') ||
          parentText.toLowerCase().includes('document') ||
          parentText.toLowerCase().includes('text') ||
          parentText.toLowerCase().includes('meme')) {
        return true;
      }
    }
    
    // Check if image is in a content area that typically has text images
    if (img.closest('.content') || img.closest('.article') || 
        img.closest('.post') || img.closest('.entry') ||
        img.closest('.story') || img.closest('.news')) {
      return true;
    }
    
    // Check if image has a large size (more likely to contain text)
    if (img.width > 200 && img.height > 100) {
      return true;
    }
    
    // Check if image src suggests it contains text
    const src = img.src.toLowerCase();
    if (src.includes('screenshot') || src.includes('document') || 
        src.includes('text') || src.includes('meme') ||
        src.includes('quote') || src.includes('post')) {
      return true;
    }
    
    // Default to false for images that don't clearly contain text
    return false;
  }

  // Show error message
  function showError(button, message) {
    const originalText = button.textContent;
    button.textContent = '❌';
    button.title = message;
    button.style.background = '#fee2e2';
    button.style.borderColor = '#fca5a5';
    
    setTimeout(() => {
      button.textContent = originalText;
      button.title = '';
      button.style.background = '#f3f4f6';
      button.style.borderColor = '#d1d5db';
    }, 3000);
  }

  // Add CSS styles for highlighting
  function addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .${CONFIG.pendingClass} {
        background-color: #fff3cd !important;
        transition: background-color 0.3s ease !important;
      }
      
      .${CONFIG.fakeClass} {
        background-color: #fef2f2 !important;
        border-left: 4px solid #fecaca !important;
        padding-left: 8px !important;
      }
      
      .${CONFIG.authenticClass} {
        background-color: #f0fdf4 !important;
        border-left: 4px solid #bbf7d0 !important;
        padding-left: 8px !important;
      }
      
      .${CONFIG.buttonClass}:hover {
        transform: scale(1.05);
      }
    `;
    document.head.appendChild(style);
  }

  // Check if current site should be excluded (minimal exclusions)
  function shouldExcludeSite() {
    const hostname = window.location.hostname.toLowerCase();
    const pathname = window.location.pathname.toLowerCase();
    
    // Only exclude Google search results page, but allow Google Images
    if (hostname.includes('google.com') && pathname.includes('/search') && !pathname.includes('/images')) {
      return true;
    }
    
    // Allow Gmail but with strict filtering (removed complete exclusion)
    // Exclude other email services
    if (hostname.includes('outlook.com') || hostname.includes('yahoo.com') || hostname.includes('hotmail.com')) {
      return true;
    }
    
    // Allow all other sites including Google Images, WhatsApp, social media, etc.
    return false;
  }

  // Initialize the content script
  function init() {
    console.log('AI Content Detector: Script loaded on', window.location.href);
    
    // Skip if site should be excluded
    if (shouldExcludeSite()) {
      console.log('AI Content Detector: Site excluded from analysis');
      return;
    }
    
    console.log('AI Content Detector: Initializing on', window.location.hostname);
    
    // Add styles
    addStyles();
    
    // Add a test indicator to show extension is working
    const testIndicator = document.createElement('div');
    testIndicator.id = 'ai-detector-test';
    testIndicator.style.cssText = `
      position: fixed;
      top: 10px;
      right: 10px;
      background: #4CAF50;
      color: white;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 12px;
      z-index: 999999;
      font-family: Arial, sans-serif;
    `;
    testIndicator.textContent = 'AI Detector Active';
    document.body.appendChild(testIndicator);
    
    // Remove test indicator after 3 seconds
    setTimeout(() => {
      if (testIndicator.parentNode) {
        testIndicator.remove();
      }
    }, 3000);
    
    // Add manual trigger for testing
    testIndicator.addEventListener('click', () => {
      console.log('AI Content Detector: Manual trigger clicked');
      attachButtons();
    });
    
    // Initial button attachment
    attachButtons();
    
    // Watch for dynamically added content
    const observer = new MutationObserver((mutations) => {
      let shouldAttach = false;
      
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if the added node or its children contain text elements
              if (node.textContent && node.textContent.trim().length > 20) {
                shouldAttach = true;
              }
            }
          });
        }
      });
      
      if (shouldAttach) {
        // Debounce the attachment
        clearTimeout(attachButtons.timeout);
        attachButtons.timeout = setTimeout(() => {
          console.log('AI Content Detector: Re-attaching buttons due to DOM changes');
          attachButtons();
        }, 500);
      }
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    // For WhatsApp, also watch for specific message containers
    if (window.location.hostname.includes('whatsapp.com') || window.location.hostname.includes('web.whatsapp.com')) {
      console.log('AI Content Detector: WhatsApp detected, setting up special observer');
      
      const whatsappObserver = new MutationObserver((mutations) => {
        let shouldAttach = false;
        
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // Check if new messages were added
                if (node.querySelector && (
                  node.querySelector('.selectable-text') ||
                  node.querySelector('.message') ||
                  node.querySelector('.msg') ||
                  node.classList.contains('message') ||
                  node.classList.contains('msg')
                )) {
                  shouldAttach = true;
                }
              }
            });
          }
        });
        
        if (shouldAttach) {
          clearTimeout(attachButtons.timeout);
          attachButtons.timeout = setTimeout(() => {
            console.log('AI Content Detector: Re-attaching buttons for new WhatsApp messages');
            attachButtons();
          }, 200);
        }
      });
      
      // Watch the conversation panel specifically
      const conversationPanel = document.querySelector('[data-testid="conversation-panel-messages"]');
      if (conversationPanel) {
        whatsappObserver.observe(conversationPanel, { 
          childList: true, 
          subtree: true 
        });
      }
    }
    
    // For Google Images, set up special observer for dynamic image loading
    if (window.location.hostname.includes('google.com') && window.location.pathname.includes('/images')) {
      console.log('AI Content Detector: Google Images detected, setting up special observer');
      
      const googleImagesObserver = new MutationObserver((mutations) => {
        let shouldAttach = false;
        
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // Check if new images were added
                if (node.querySelector && (
                  node.querySelector('img') ||
                  node.tagName === 'IMG' ||
                  node.classList.contains('rg_i') ||
                  node.classList.contains('rg_ic')
                )) {
                  shouldAttach = true;
                }
              }
            });
          }
        });
        
        if (shouldAttach) {
          clearTimeout(attachButtons.timeout);
          attachButtons.timeout = setTimeout(() => {
            console.log('AI Content Detector: Re-attaching buttons for new Google Images');
attachButtons();
          }, 300);
        }
      });
      
      // Watch the main content area for Google Images
      const mainContent = document.querySelector('#main') || document.querySelector('.main') || document.body;
      if (mainContent) {
        googleImagesObserver.observe(mainContent, { 
          childList: true, 
          subtree: true 
        });
      }
    }
  }

  // Start the content script
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
