// ==========================================================
// TaurusTech Typewriter.js — Reliable Session-Based Version
// Works across all pages (runs immediately or when header loads)
// ==========================================================

function startTypewriter() {
  const tagline = document.querySelector("[data-typewriter]");
  if (!tagline || tagline.dataset.active) return;

  tagline.dataset.active = "true"; // prevent reruns

  // Only run once per session
  if (sessionStorage.getItem("typedAlready") === "true") return;

  const text = tagline.textContent.trim();
  tagline.textContent = "";
  let i = 0;
  const speed = 60; // typing speed in ms

  function type() {
    if (i < text.length) {
      tagline.textContent += text.charAt(i);
      i++;
      setTimeout(type, speed);
    } else {
      sessionStorage.setItem("typedAlready", "true");
    }
  }

  // small delay before typing starts
  setTimeout(type, 300);
}

document.addEventListener("DOMContentLoaded", () => {
  // Run immediately if the header already exists
  if (document.querySelector("[data-typewriter]")) {
    startTypewriter();
  }

  // Also observe for dynamically injected headers (core.js)
  const observer = new MutationObserver(() => {
    if (document.querySelector("[data-typewriter]")) {
      startTypewriter();
      observer.disconnect(); // done once
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
});
