// ==========================================================
// TaurusTech Guestbook Admin
// Displays pending entries + approve/delete controls
// ==========================================================

document.addEventListener("DOMContentLoaded", () => {
  fetchPendingEntries();

  const refreshBtn = document.getElementById("refreshButton");
  if (refreshBtn) refreshBtn.addEventListener("click", fetchPendingEntries);
});

async function fetchPendingEntries() {
  const container = document.getElementById("pendingEntries");
  container.innerHTML = `<p>Loading pending entries...</p>`;

  try {
    const res = await fetch("https://taurustech.me/api/get-pending-entries", {
      headers: { "Accept": "application/json" },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const entries = await res.json();

    if (!entries || entries.length === 0) {
      container.innerHTML = `<p>No pending entries at the moment.</p>`;
      return;
    }

    container.innerHTML = entries
      .map(
        (e) => `
        <div class="guestbook-entry" data-id="${e.id}">
          <p><strong>${escapeHtml(e.name)}</strong> — <em>${formatDate(e.timestamp)}</em></p>
          <p>${escapeHtml(e.message)}</p>
          <button class="approveBtn retro-button">✅ Approve</button>
          <button class="deleteBtn retro-button" style="background-color:#660000;color:#fff;">🗑 Delete</button>
          <hr class="fancy-hr" />
        </div>`
      )
      .join("");

    attachActionButtons();
  } catch (err) {
    console.error("❌ Error fetching pending entries:", err);
    container.innerHTML = `<p style="color:#FF0000;">Error loading entries. Try again later.</p>`;
  }
}

function attachActionButtons() {
  document.querySelectorAll(".approveBtn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.closest(".guestbook-entry").dataset.id;
      await handleEntryAction(id, "approve");
    });
  });

  document.querySelectorAll(".deleteBtn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.closest(".guestbook-entry").dataset.id;
      await handleEntryAction(id, "delete");
    });
  });
}

async function handleEntryAction(id, action) {
  try {
    const confirmAction = confirm(
      `Are you sure you want to ${action} this entry?`
    );
    if (!confirmAction) return;

    const res = await fetch(`https://taurustech.me/api/${action}-entry`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      alert(`✅ Entry ${action}d successfully!`);
      fetchPendingEntries();
    } else {
      throw new Error(data.message || "Unknown error");
    }
  } catch (err) {
    console.error(`❌ Error ${action}ing entry:`, err);
    alert(`Error: ${err.message}`);
  }
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
    return d.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Unknown date";
  }
}
