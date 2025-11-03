// === TaurusTech Retro Hit Counter ===
// Built for the 90s web, powered by Cloudflare KV

document.addEventListener("DOMContentLoaded", async () => {
  const counterElement = document.getElementById("visitorCount");
  if (!counterElement) return;

  try {
    const cacheKey = "taurustech_hitcount";
    const cached = localStorage.getItem(cacheKey);

    // Display cached value instantly (retro snappiness!)
    if (cached) {
      counterElement.textContent = cached;
    }

    // Fetch the fresh count from your Worker
    const res = await fetch("https://hit-counter.keezay.workers.dev/");
    if (!res.ok) throw new Error("Failed to fetch counter");
    const data = await res.json();

    const formatted = data.visits.toLocaleString();
    counterElement.textContent = formatted;

    // Cache the number locally for faster reloads
    localStorage.setItem(cacheKey, formatted);
  } catch (err) {
    console.error("Retro Counter Error:", err);
    counterElement.textContent = "N/A";
  }
});
