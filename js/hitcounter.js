document.addEventListener("DOMContentLoaded", async () => {
  const counterElement = document.getElementById("visitorCount");
  if (!counterElement) return;

  try {
    const cacheKey = "taurustech_hitcount";
    const cached = localStorage.getItem(cacheKey);

    // Display cached value instantly
    if (cached) counterElement.textContent = cached;

    // Fetch fresh count from your own domain now
    const res = await fetch("/api/hitcounter");
    if (!res.ok) throw new Error("Failed to fetch counter");

    const data = await res.json();
    const formatted = data.visits.toLocaleString();

    counterElement.textContent = formatted;
    localStorage.setItem(cacheKey, formatted);
  } catch (err) {
    console.error("Retro Counter Error:", err);
    counterElement.textContent = "N/A";
  }
});
