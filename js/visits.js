// === TaurusTech Visits Tracker (Final Confirmed Version) ===
console.log("[TaurusTech] visits.js loaded");

// Wait for footer to be injected (by core.js)
async function waitForVisitorCount() {
  return new Promise((resolve) => {
    const look = () => {
      const el = document.getElementById("visitorCount");
      if (el) resolve(el);
      else requestAnimationFrame(look);
    };
    look();
  });
}

(async () => {
  const el = await waitForVisitorCount();

  const cacheKey = "taurustech_visits";
  const cached = localStorage.getItem(cacheKey);
  if (cached) el.textContent = cached;

  const update = (n) => {
    const formatted = Number(n || 0).toLocaleString();
    el.textContent = formatted;
    localStorage.setItem(cacheKey, formatted);
  };

  try {
    // Create timeout controller for older browsers
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const res = await fetch("https://taurustech.me/api/visits", {
      credentials: "include",
      headers: { "Accept": "application/json" },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    if (!data || typeof data.visits === "undefined")
      throw new Error("Invalid response format");

    update(data.visits);
    console.log(`[TaurusTech] Visits updated → ${data.visits}`);
  } catch (err) {
    console.warn(`[TaurusTech] Visit update failed: ${err.message}`);
    el.textContent = cached || "N/A";
  }
})();
