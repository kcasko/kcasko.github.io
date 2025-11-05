// === TaurusTech Visits Tracker (Final Reliable Version) ===
// Works even with dynamically injected footer
// Powered by Cloudflare Workers (api/visits)

console.log("[TaurusTech] visits.js loaded");

// Wait for the footer visitor element to exist before running
async function waitForVisitorElement() {
  return new Promise((resolve) => {
    const check = () => {
      const el = document.getElementById("visitorCount");
      if (el) resolve(el);
      else requestAnimationFrame(check); // checks every frame (faster than setTimeout)
    };
    check();
  });
}

(async () => {
  const el = await waitForVisitorElement();

  const cacheKey = "taurustech_visits";
  const cached = localStorage.getItem(cacheKey);

  // Show cached value instantly
  if (cached) el.textContent = cached;

  // Helper: update text + local cache
  const updateDisplay = (count) => {
    const formatted = Number(count || 0).toLocaleString();
    el.textContent = formatted;
    localStorage.setItem(cacheKey, formatted);
  };

  // Fetch visit count from Worker
  async function fetchVisits(retry = false) {
    try {
      const res = await fetch("https://taurustech.me/api/visits", {
        credentials: "include",
        headers: { "Accept": "application/json" },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (!data || typeof data.visits === "undefined")
        throw new Error("Invalid Worker response");

      updateDisplay(data.visits);
      console.log(`[TaurusTech] Visits updated → ${data.visits}`);
    } catch (err) {
      console.warn(`[TaurusTech] Visit fetch error: ${err.message}`);
      if (!retry) setTimeout(() => fetchVisits(true), 1500);
      else el.textContent = "N/A";
    }
  }

  // Initial fetch
  fetchVisits();
})();
