// ==========================================================
// TaurusTech Core.js — Clean Modern Version
// Handles layout injection, navigation highlighting,
// and footer date initialization
// ==========================================================

document.addEventListener("DOMContentLoaded", async () => {
  await loadLayout();
  highlightActiveLink();
  initLastUpdatedDate();
});

// ===== Load modular header, nav, and footer =====
async function loadLayout() {
  try {
    const depth = window.location.pathname.split("/").filter(Boolean).length - 1;
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

    // Inject modular layout
    document.getElementById("site-header")?.insertAdjacentHTML("afterbegin", headerHTML);
    document.getElementById("site-nav")?.insertAdjacentHTML("afterbegin", navHTML);
    document.getElementById("site-footer")?.insertAdjacentHTML("afterbegin", footerHTML);

    // ✅ Load hit counter script AFTER footer is injected
    const hitCounterScript = document.createElement("script");
    hitCounterScript.src = "/js/hitcounter.js";
    hitCounterScript.onload = () => console.log("Hit counter script loaded successfully.");
    hitCounterScript.onerror = (e) => console.error("❌ Failed to load hit counter script:", e);
    document.body.appendChild(hitCounterScript);

  } catch (err) {
    console.error("❌ Layout load error:", err);
  }
}

// ===== Highlight active nav link =====
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

// ===== Initialize Footer "Last Updated" =====
function initLastUpdatedDate() {
  const observer = new MutationObserver(() => {
    const lastUpdated = document.getElementById("last-updated-date");
    if (lastUpdated && !lastUpdated.dataset.bound) {
      lastUpdated.dataset.bound = "true";
      const modified = document.lastModified
        ? new Date(document.lastModified)
        : null;
      lastUpdated.textContent = modified
        ? modified.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
          })
        : "Date unavailable";
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
