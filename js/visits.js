// === TaurusTech Visits Tracker ===
// Powered by Cloudflare Workers (api/visits)

window.__tt_visits_loaded = true;

document.addEventListener("DOMContentLoaded", async () => {
  const el = document.getElementById("visitorCount");
  if (!el) {
    console.warn("[TaurusTech] visitorCount element not found, exiting.");
    return;
  }

  const cacheKey = "taurustech_visits";
  const cached = localStorage.getItem(cacheKey);

  // Show cached value instantly for smoother UX
  if (cached) el.textContent = cached;

  // Helper: safely update counter
  const updateDisplay = (count) => {
    const formatted = Number(count || 0).toLocaleString();
    el.textContent = formatted;
    localStorage.setItem(cacheKey, formatted);
  };

  // Fetch logic with fallback + retry
  async function fetchVisits(retry = false) {
    try {
      const res = await fetch("https://taurustech.me/api/visits", {
        credentials: "include",
        headers: { "Accept": "application/json" },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (!data || typeof data.visits === "undefined")
        throw new Error("Invalid response shape");

      updateDisplay(data.visits);
      console.log(`[TaurusTech] Visits updated → ${data.visits}`);
    } catch (err) {
      console.warn(`[TaurusTech] Visit fetch error: ${err.message}`);
      if (!retry) {
        console.log("[TaurusTech] Retrying once in 2s...");
        setTimeout(() => fetchVisits(true), 2000);
      } else {
        el.textContent = "N/A";
      }
    }
  }

  // Start fetch
  fetchVisits();
});
