// === TaurusTech Visits Tracker ===
// Powered by Cloudflare Workers

// small global flag to confirm load
window.__tt_visits_loaded = true;

document.addEventListener("DOMContentLoaded", async () => {
  const el = document.getElementById("visitorCount");
  if (!el) {
    console.warn("⚠️ visitorCount element not found — visits script exiting.");
    return;
  }

  try {
    const cacheKey = "taurustech_visits";
    const cached = localStorage.getItem(cacheKey);

    // Show cached value immediately for snappy UX
    if (cached) el.textContent = cached;

    // Fetch the fresh count from Cloudflare Worker
    const res = await fetch("https://taurustech.me/api/visits", { credentials: "include" });
    if (!res.ok) throw new Error(`Bad response: ${res.status}`);

    const data = await res.json();
    const formatted = Number(data.visits || 0).toLocaleString();

    // Update display and cache locally
    el.textContent = formatted;
    localStorage.setItem(cacheKey, formatted);

    console.log(`✅ Visits updated: ${formatted}`);
  } catch (err) {
    console.error("❌ Visits fetch error:", err);
    el.textContent = "N/A";
  }
});
