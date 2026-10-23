document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav-links");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded));
      nav.classList.toggle("nav-open", !expanded);
    });
  }

  document.querySelectorAll(".flash").forEach((flash) => {
    window.setTimeout(() => {
      flash.classList.add("flash-hide");
      window.setTimeout(() => flash.remove(), 350);
    }, 5000);
  });
});
