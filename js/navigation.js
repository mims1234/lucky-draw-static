// ============================================================
//  navigation.js — Nav link handlers and page switching
// ============================================================

function initNavigation() {
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const page = e.currentTarget.dataset.page;

      document
        .querySelectorAll(".nav-link")
        .forEach((l) => l.classList.remove("active"));
      e.currentTarget.classList.add("active");

      const drawPage = document.getElementById("drawPage");
      const settingsPage = document.getElementById("settingsPage");

      if (page === "draw") {
        drawPage.classList.remove("hidden");
        settingsPage.classList.add("hidden");
      } else {
        drawPage.classList.add("hidden");
        settingsPage.classList.remove("hidden");
      }
    });
  });
}
