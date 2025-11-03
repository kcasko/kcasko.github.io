// TaurusTech Retro Mode Toggle
document.addEventListener("DOMContentLoaded", () => {
  const button = document.getElementById("toggleRetro");
  const stylesheetHref = "/css/retro-effects.css";

  // Check if retro mode is remembered
  if (localStorage.getItem("retroMode") === "on") {
    activateRetro(button, stylesheetHref);
  }

  button.addEventListener("click", () => {
    const active = document.querySelector(`link[href="${stylesheetHref}"]`);
    if (active) {
      deactivateRetro(button, active);
    } else {
      activateRetro(button, stylesheetHref);
    }
  });
});

function activateRetro(button, href) {
  const link = document.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
  localStorage.setItem("retroMode", "on");
  button.textContent = "Deactivate 90s Mode";
}

function deactivateRetro(button, link) {
  link.remove();
  localStorage.removeItem("retroMode");
  button.textContent = "Activate 90s Mode";
}
