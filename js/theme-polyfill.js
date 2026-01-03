// Theme Color Polyfill for Firefox and Opera
// Provides theme color support for browsers that don't natively support it
(function() {
  'use strict';
  
  // Check if browser supports theme-color meta tag
  function supportsThemeColor() {
    // Chrome, Safari, Edge support theme-color
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isSafari = /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    const isEdge = /Edg/.test(navigator.userAgent);
    
    return isChrome || isSafari || isEdge;
  }
  
  // Add theme-color meta tags for supported browsers
  function addThemeColorMeta() {
    const darkMeta = document.createElement('meta');
    darkMeta.name = 'theme-color';
    darkMeta.content = '#a56cff';
    darkMeta.media = '(prefers-color-scheme: dark)';
    document.head.appendChild(darkMeta);
    
    const lightMeta = document.createElement('meta');
    lightMeta.name = 'theme-color';
    lightMeta.content = '#8a4bcc';
    lightMeta.media = '(prefers-color-scheme: light)';
    document.head.appendChild(lightMeta);
  }
  
  // Apply theme color for unsupported browsers
  function applyThemeColorPolyfill() {
    const themeColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--theme-color') || '#a56cff';
    
    // For Firefox: Set scrollbar colors
    if (navigator.userAgent.includes('Firefox')) {
      const style = document.createElement('style');
      style.textContent = `
        html {
          scrollbar-color: ${themeColor} #111;
        }
        ::-moz-selection {
          background: ${themeColor}40;
        }
      `;
      document.head.appendChild(style);
    }
    
    // For Opera: Set custom properties
    if (navigator.userAgent.includes('OPR')) {
      document.documentElement.style.setProperty('--browser-theme', themeColor);
    }
    
    // Update any browser chrome elements if APIs are available
    if ('setAppBadge' in navigator) {
      // PWA badge color customization if supported
      document.documentElement.style.setProperty('--app-badge-color', themeColor);
    }
  }
  
  // Initialize theme support
  function initThemeSupport() {
    if (supportsThemeColor()) {
      addThemeColorMeta();
    } else {
      applyThemeColorPolyfill();
    }
  }
  
  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initThemeSupport);
  } else {
    initThemeSupport();
  }
})();