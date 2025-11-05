// === TaurusTech Hit Counter ===
// Powered by Cloudflare Workers

document.addEventListener("DOMContentLoaded", async () => {
  const counterElement = document.getElementById("visitorCount");
  if (!counterElement) return;

  try {
    const cacheKey = "taurustech_hitcount";
    const cached = localStorage.getItem(cacheKey);

    // Display cached value instantly
    if (cached) counterElement.textContent = cached;

    // Fetch the fresh count from your Cloudflare Worker
    const res = await fetch("https://taurustech.me/api/hitcounter");
    if (!res.ok) throw new Error("Failed to fetch counter");

    const data = await res.json();
    const formatted = data.visits.toLocaleString();

    // Update display and cache locally
    counterElement.textContent = formatted;
    localStorage.setItem(cacheKey, formatted);
  } catch (err) {
    console.error("Hit Counter Error:", err);
    counterElement.textContent = "N/A";
  }
});
