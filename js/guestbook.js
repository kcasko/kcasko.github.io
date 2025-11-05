// ==========================================================
// TaurusTech Guestbook Frontend
// Handles displaying approved entries + form submissions
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  loadGuestbookEntries();
  setupGuestbookForm();
});

// ===== Load approved guestbook entries =====
async function loadGuestbookEntries() {
  const container = document.getElementById("guestbook-entries");
  if (!container) return console.warn("⚠️ guestbook-entries container missing.");

  container.innerHTML = `<p class="loading-text">Loading entries...</p>`;

  try {
    const res = await fetch("https://taurustech.me/api/get-entries", {
      headers: { "Accept": "application/json" },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const entries = await res.json();

    if (!entries || entries.length === 0) {
      container.innerHTML = `<p class="no-entries">No messages yet — be the first to sign!</p>`;
      return;
    }

    // Build entry markup
    const html = entries
      .map(e => `
        <div class="guestbook-entry">
          <p class="guestbook-message">"${escapeHtml(e.message)}"</p>
          <p class="guestbook-meta">– ${escapeHtml(e.name)} (${formatDate(e.timestamp)})</p>
        </div>
      `)
      .join("");

    container.innerHTML = html;
  } catch (err) {
    console.error("❌ Error loading guestbook:", err);
    container.innerHTML = `<p class="error-text">Unable to load guestbook entries at this time.</p>`;
  }
}

// ===== Handle guestbook form submission =====
function setupGuestbookForm() {
  const form = document.getElementById("guestbook-form");
  if (!form) return console.warn("⚠️ guestbook-form not found.");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = form.querySelector('input[name="name"]').value.trim();
    const message = form.querySelector('textarea[name="message"]').value.trim();
    const statusEl = document.getElementById("guestbook-status");

    if (!name || !message) {
      statusEl.textContent = "Please fill out both fields.";
      statusEl.style.color = "#ff6b6b";
      return;
    }

    statusEl.textContent = "Submitting...";
    statusEl.style.color = "#a56cff";

    try {
      const formData = new FormData(form);
      const res = await fetch("https://taurustech.me/api/submit-entry", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (res.ok && data.success) {
        statusEl.textContent = data.message;
        statusEl.style.color = "#00ff00";
        form.reset();
      } else {
        statusEl.textContent = data.message || "Error submitting entry.";
        statusEl.style.color = "#ff6b6b";
      }
    } catch (err) {
      console.error("❌ Error submitting form:", err);
      statusEl.textContent = "Network error submitting entry.";
      statusEl.style.color = "#ff6b6b";
    }
  });
}

// ===== Utility: sanitize HTML to prevent injection =====
function escapeHtml(str) {
  return str.replace(/[&<>"']/g, tag =>
    ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[tag] || tag)
  );
}

// ===== Utility: format timestamp =====
function formatDate(timestamp) {
  try {
    const d = new Date(timestamp);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Unknown date";
  }
}
