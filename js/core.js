// ==========================================================
// TaurusTech Core.js — Clean Modern Version (Finalized)
// Handles layout injection, navigation highlighting,
// visits counter initialization, and footer date logic
// ==========================================================

// Global error boundary
window.addEventListener('error', (event) => {
  console.error('Global JavaScript Error:', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error
  });
  
  // Prevent error from breaking the entire page
  return true;
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
  event.preventDefault();
});

document.addEventListener("DOMContentLoaded", async () => {
  try {
    await loadLayout();
    highlightActiveLink();
    initLastUpdatedDate();
    initLazyLoading();
    initOfflineIndicator();
  } catch (error) {
    console.error('Error during page initialization:', error);
  }
});

async function loadLayout() {
  try {
    // ✅ Safe prefix for root + subdirectories
    const depth = Math.max(0, window.location.pathname.split("/").filter(Boolean).length - 1);
    const prefix = depth > 0 ? "../".repeat(depth) : "./";

    const paths = [
      `${prefix}partials/header.html`,
      `${prefix}partials/nav.html`,
      `${prefix}partials/footer.html`
    ];

    const [headerHTML, navHTML, footerHTML] = await Promise.all(
      paths.map(async (p) => {
        const r = await fetch(p);
        if (!r.ok) throw new Error(`Failed to fetch ${p}`);
        return r.text();
      })
    );

    document.getElementById("site-header")?.insertAdjacentHTML("afterbegin", headerHTML);
    document.getElementById("site-nav")?.insertAdjacentHTML("afterbegin", navHTML);
    document.getElementById("site-footer")?.insertAdjacentHTML("afterbegin", footerHTML);

    // ✅ Load visits script AFTER footer is injected (avoid "hitcounter" keyword)
    const visitsScript = document.createElement("script");
    visitsScript.src = `${prefix}js/visits.js?v=20251105`;
    visitsScript.onload = () => console.log("✅ visits.js loaded");
    visitsScript.onerror = (e) => console.error("❌ Failed to load visits.js:", e);
    document.body.appendChild(visitsScript);

  } catch (err) {
    console.error("❌ Layout load error:", err);
  }
}

function highlightActiveLink() {
  const currentPath = window.location.pathname.replace(/\/$/, "");
  document.querySelectorAll("nav a").forEach(link => {
    const linkPath = link.getAttribute("href").replace(/\/$/, "");
    if (linkPath === currentPath) {
      link.style.color = "#FFFF00";
      link.style.textShadow = "none";
      link.style.textDecoration = "none";
    }
  });
}

function initLastUpdatedDate() {
  const observer = new MutationObserver(() => {
    const lastUpdated = document.getElementById("last-updated-date");
    if (lastUpdated && !lastUpdated.dataset.bound) {
      lastUpdated.dataset.bound = "true";
      const modified = document.lastModified ? new Date(document.lastModified) : null;
      lastUpdated.textContent = modified
        ? modified.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : "Date unavailable";
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// Lazy loading for images and iframes
window.initLazyLoading = function initLazyLoading() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const element = entry.target;
          if (element.dataset.src) {
            element.src = element.dataset.src;
            element.removeAttribute('data-src');
            element.classList.remove('lazy', 'lazy-iframe');
            observer.unobserve(element);
          }
        }
      });
    });

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src], iframe[data-src]').forEach(element => {
      imageObserver.observe(element);
    });
  } else {
    // Fallback for older browsers
    document.querySelectorAll('img[data-src], iframe[data-src]').forEach(element => {
      element.src = element.dataset.src;
      element.removeAttribute('data-src');
      element.classList.remove('lazy', 'lazy-iframe');
    });
  }
}

// Offline/Online indicator
function initOfflineIndicator() {
  // Create offline indicator
  const offlineDiv = document.createElement('div');
  offlineDiv.className = 'offline-indicator';
  offlineDiv.innerHTML = '⚠️ You are offline. Some features may not work.';
  document.body.appendChild(offlineDiv);

  // Show/hide based on connection status
  function updateOnlineStatus() {
    if (navigator.onLine) {
      offlineDiv.classList.remove('visible');
    } else {
      offlineDiv.classList.add('visible');
    }
  }

  // Listen for online/offline events
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Check initial status
  updateOnlineStatus();
}
