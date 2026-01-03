// ==========================================
// TaurusTech Projects Loader v3.5 (Final)
// Adds live search, filtering, sorting, and
// CRT-style animation with fault-tolerance.
// ==========================================

let allProjects = [];
let currentTag = "All";
let sortOrder = "newest";
let searchQuery = "";

// Initialize after DOM + layout load
document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("projects-container");
  if (!container) return;

  try {
    const res = await fetch("/data/projects.json", { cache: "no-store" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    allProjects = await res.json();

    if (!Array.isArray(allProjects) || allProjects.length === 0) {
      container.innerHTML = `<p style="color:#ff4444;">No projects available.</p>`;
      return;
    }

    buildControls(allProjects);
    renderProjects();
  } catch (err) {
    console.error("❌ Projects Loader Error:", err);
    container.innerHTML = `<p style="color:#ff4444;">Error loading project list. Please try again later.</p>`;
    
    // Report error but don't break the page
    if (window.gtag) {
      window.gtag('event', 'exception', {
        description: `Projects load error: ${err.message}`,
        fatal: false
      });
    }
  }
});

// ===== Build Filter, Sort, and Search Controls =====
function buildControls(projects) {
  const uniqueTags = Array.from(new Set(projects.flatMap(p => p.tags || []))).sort();

  const controls = document.createElement("div");
  controls.className = "project-controls";
  controls.innerHTML = `
    <label for="tagFilter">Filter:</label>
    <select id="tagFilter" aria-label="Filter projects by category">
      <option value="All">All</option>
      ${uniqueTags.map(t => `<option value="${t}">${t}</option>`).join("")}
    </select>

    &nbsp;&nbsp;

    <label for="sortOrder">Sort:</label>
    <select id="sortOrder" aria-label="Sort projects by date or name">
      <option value="newest">Newest</option>
      <option value="oldest">Oldest</option>
      <option value="alpha">A–Z</option>
    </select>

    &nbsp;&nbsp;

    <label for="projectSearch">Search:</label>
    <input type="text" id="projectSearch" placeholder="Type keyword..." autocomplete="off" aria-label="Search projects by keyword">
  `;

  const container = document.getElementById("projects-container");
  container.parentNode.insertBefore(controls, container);

  // Bind events
  document.getElementById("tagFilter").addEventListener("change", (e) => {
    currentTag = e.target.value;
    renderProjects();
  });

  document.getElementById("sortOrder").addEventListener("change", (e) => {
    sortOrder = e.target.value;
    renderProjects();
  });

  document.getElementById("projectSearch").addEventListener("input", debounce((e) => {
    searchQuery = e.target.value.toLowerCase();
    renderProjects();
  }, 200));
}

// ===== Render Projects with Retro Styling =====
function renderProjects() {
  const container = document.getElementById("projects-container");
  if (!container) return;
  container.innerHTML = "";

  let visible = [...allProjects];

  // Filter by tag
  if (currentTag !== "All") {
    visible = visible.filter(p => (p.tags || []).includes(currentTag));
  }

  // Filter by search query
  if (searchQuery) {
    visible = visible.filter(p =>
      p.title.toLowerCase().includes(searchQuery) ||
      p.description.toLowerCase().includes(searchQuery) ||
      (p.tags || []).some(tag => tag.toLowerCase().includes(searchQuery))
    );
  }

  // Sort logic
  if (sortOrder === "alpha") {
    visible.sort((a, b) => a.title.localeCompare(b.title));
  } else if (sortOrder === "oldest") {
    visible = [...visible].reverse(); // assuming JSON is newest first
  }

  // Handle no results
  if (visible.length === 0) {
    container.innerHTML = `
      <div class="no-results crt-glow">
        <p class="terminal-text">
          <span class="prompt">></span> NO MATCHING PROJECTS FOUND<span class="cursor">_</span>
        </p>
      </div>
    `;
    return;
  }

  // Render each project with flicker animation
  visible.forEach((proj, i) => {
    const div = document.createElement("div");
    div.className = "project-item crt-fadein";
    div.style.animationDelay = `${i * 0.25}s`;

    const tagsHTML = proj.tags?.length
      ? `<p style="color:#00ffff;font-family:'Courier New',monospace;">[ ${proj.tags.join(", ")} ]</p>`
      : "";

    const linksHTML = Array.isArray(proj.links)
      ? proj.links
          .map((l) => `<a href="${l.url}" target="_blank" rel="noopener noreferrer">${l.label}</a>`)
          .join(" &nbsp;|&nbsp; ")
      : "";

    const embedHTML = proj.embed
      ? `<div class="video-embed">
          <iframe src="${proj.embed}" 
            width="100%" height="405"
            style="max-width:720px;border:none;border-radius:12px;"
            title="${proj.title}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen></iframe>
         </div>`
      : "";

    div.innerHTML = `
      <h3>${proj.title}</h3>
      ${tagsHTML}
      <p>${proj.description}</p>
      ${linksHTML ? `<p><strong>${linksHTML}</strong></p>` : ""}
      ${embedHTML}
      <hr class="fancy-hr">
    `;

    container.appendChild(div);
  });
  
  // Re-initialize lazy loading for new iframes
  if (window.initLazyLoading) {
    window.initLazyLoading();
  }
}

// ===== Simple debounce for smoother search =====
function debounce(fn, delay) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}
