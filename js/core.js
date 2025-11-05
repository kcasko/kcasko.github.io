// ==========================================================
// TaurusTech Core.js
// Handles layout injection, global retro mode state,
// CRT transitions, and navigation highlighting
// ==========================================================

document.addEventListener("DOMContentLoaded", async () => {
  await loadLayout();
  applySavedRetroMode();
  setupRetroToggle();
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

    document.getElementById("site-header")?.insertAdjacentHTML("afterbegin", headerHTML);
    document.getElementById("site-nav")?.insertAdjacentHTML("afterbegin", navHTML);
    document.getElementById("site-footer")?.insertAdjacentHTML("afterbegin", footerHTML);

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
      link.style.textShadow = "0 0 5px #FFFF00";
      link.style.textDecoration = "none";
    }
  });
}

// ===== Apply saved retro mode instantly =====
function applySavedRetroMode() {
  const retroLink = document.getElementById("retroStyle");
  const saved = localStorage.getItem("retroMode");

  if (!retroLink) return console.warn("⚠️ Retro stylesheet link not found.");

  if (saved === "off") {
    retroLink.disabled = true;
    document.documentElement.classList.add("retro-off");
  }

  console.log(`🌐 TaurusTech mode: ${saved === "off" ? "Modern" : "90s Retro"}`);
}

// ===== Global retro toggle logic =====
function setupRetroToggle() {
  const retroLink = document.getElementById("retroStyle");
  if (!retroLink) return;

  const observer = new MutationObserver(() => {
    const toggleButton = document.getElementById("toggleRetro");
    if (!toggleButton || toggleButton.dataset.bound) return;

    toggleButton.dataset.bound = "true";
    const saved = localStorage.getItem("retroMode");

    if (saved === "off") {
      retroLink.disabled = true;
      toggleButton.textContent = "Activate 90s Mode";
    }

    toggleButton.addEventListener("click", () => {
      const isActive = !retroLink.disabled;

      // Trigger CRT transition + fade
      document.body.classList.add("mode-transition");
      setTimeout(() => {
        document.body.classList.add("mode-transition-active");
        document.body.classList.remove("mode-transition");
      }, 400);

      if (isActive) {
        playCRTShutdown();
        retroLink.disabled = true;
        document.documentElement.classList.add("retro-off");
        localStorage.setItem("retroMode", "off");
        toggleButton.textContent = "Activate 90s Mode";
        console.log("🖥️ Switched to Modern Mode");
      } else {
        playCRTBootup();
        retroLink.disabled = false;
        document.documentElement.classList.remove("retro-off");
        localStorage.setItem("retroMode", "on");
        toggleButton.textContent = "Deactivate 90s Mode";
        console.log("💾 Switched to 90s Retro Mode");
      }
    });

    observer.disconnect();
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

// ===== Initialize Footer Dynamic Elements =====
function initLastUpdatedDate() {
  const observer = new MutationObserver(() => {
    const lastUpdated = document.getElementById("last-updated-date");
    if (lastUpdated && !lastUpdated.dataset.bound) {
      lastUpdated.dataset.bound = "true";
      const modified = document.lastModified
        ? new Date(document.lastModified)
        : null;
      lastUpdated.textContent = modified
        ? modified.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        : "Date unavailable";
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// ===== CRT Visual + Audio Transitions =====
function playCRTShutdown() {
  const overlay = document.createElement("div");
  overlay.className = "crt-flicker-overlay";
  document.body.appendChild(overlay);

  // Optional CRT static sound
  playCRTNoise("shutdown");

  document.body.style.transition = "opacity 0.4s ease";
  document.body.style.opacity = "0.3";

  setTimeout(() => {
    overlay.remove();
    document.body.style.opacity = "1";
  }, 1200);
}

function playCRTBootup() {
  const overlay = document.createElement("div");
  overlay.className = "crt-bootup-overlay";
  document.body.appendChild(overlay);

  // Optional CRT static sound
  playCRTNoise("boot");

  document.body.style.transition = "opacity 0.6s ease";
  document.body.style.opacity = "0";

  setTimeout(() => {
    overlay.remove();
    document.body.style.opacity = "1";
  }, 1200);
}

// ===== Retro CRT Audio Effects (optional) =====
function playCRTNoise(type) {
  const audio = new Audio(type === "boot"
    ? "/audio/crt-boot.mp3"
    : "/audio/crt-shutdown.mp3");

  audio.volume = 0.4;
  audio.play().catch(() => {
    console.warn("🔇 Audio autoplay blocked — CRT sound skipped.");
  });

  // Clean up after playback
  audio.addEventListener("ended", () => audio.remove());
}

