// Slider de destaques acessível:
//  - slides inativos recebem `inert` (saem da ordem de Tab e do leitor de tela);
//  - botão Pausar/Reproduzir (exigência WCAG 2.2.2 para conteúdo que se move);
//  - não avança sozinho com prefers-reduced-motion, nem com mouse ou foco dentro do hero.
import { el, icon } from "./render.js";

const AUTOPLAY_MS = 6000;

export function initHero(root) {
  const slides = [...root.querySelectorAll(".slide")];
  const track = root.querySelector(".hero-slides");
  const toggle = root.querySelector("#hero-toggle");
  const dots = slides.map((_, i) => el("button", {
    className: "hero-dot",
    attrs: { type: "button", "aria-label": `Ir para o slide ${i + 1}` },
  }));
  root.querySelector(".hero-dots").replaceChildren(...dots);

  let index = 0;
  let playing = !(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false);
  let hovered = false;
  let focused = false;
  let timer = null;

  function show(next) {
    index = (next + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === index);
      if (i === index) slide.removeAttribute("inert"); else slide.setAttribute("inert", "");
    });
    dots.forEach((dot, i) => {
      if (i === index) dot.setAttribute("aria-current", "true"); else dot.removeAttribute("aria-current");
    });
  }

  function schedule() {
    clearInterval(timer);
    timer = playing && !hovered && !focused ? setInterval(() => show(index + 1), AUTOPLAY_MS) : null;
  }

  function go(next) { show(next); schedule(); }

  function renderToggle() {
    toggle.textContent = playing ? "Pausar" : "Reproduzir";
    toggle.setAttribute("aria-label", playing ? "Pausar rotação dos destaques" : "Reproduzir rotação dos destaques");
    track.setAttribute("aria-live", playing ? "off" : "polite"); // pausado: anuncia a troca manual
  }

  root.querySelector("#hero-prev").addEventListener("click", () => go(index - 1));
  root.querySelector("#hero-next").addEventListener("click", () => go(index + 1));
  dots.forEach((dot, i) => dot.addEventListener("click", () => go(i)));
  toggle.addEventListener("click", () => { playing = !playing; renderToggle(); schedule(); });
  root.addEventListener("mouseenter", () => { hovered = true; schedule(); });
  root.addEventListener("mouseleave", () => { hovered = false; schedule(); });
  root.addEventListener("focusin", () => { focused = true; schedule(); });
  root.addEventListener("focusout", (e) => { if (!root.contains(e.relatedTarget)) { focused = false; schedule(); } });

  show(0);
  renderToggle();
  schedule();
}
