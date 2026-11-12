// Menu de navegação por público (Masculino, Feminino, Infantil).
// Os links são gerados a partir de AUDIENCES e CATEGORIES, então sempre refletem o catálogo real.
// Abre por clique/Enter/Espaço (funciona em teclado e toque); Esc fecha e devolve o foco ao botão.
import { AUDIENCES, CATEGORIES } from "../data/products.js";
import { el, icon } from "./render.js";

const MENU_AUDIENCES = ["masculino", "feminino", "infantil"];
const CHEVRON_PATH = "m6 9 6 6 6-6";

export function initMenu(nav) {
  const menus = MENU_AUDIENCES.map((audience) => {
    const label = AUDIENCES[audience];
    const panelId = `menu-${audience}`;
    const link = (text, category, className) => el("li", {}, el("a", {
      className, text,
      attrs: { href: "#produtos", "data-go-audience": audience, ...(category ? { "data-go-category": category } : {}) },
    }));

    const trigger = el("button", {
      className: "menu-trigger",
      attrs: { type: "button", "aria-expanded": "false", "aria-controls": panelId },
    }, label, icon(CHEVRON_PATH));
    const panel = el("div", { className: "menu-panel", attrs: { id: panelId, hidden: "" } },
      el("p", { className: "menu-title", text: `Linha ${label}` }),
      el("ul", { className: "menu-links" },
        ...Object.entries(CATEGORIES).map(([category, categoryLabel]) => link(categoryLabel, category)),
        link(`Ver tudo de ${label.toLowerCase()}`, null, "menu-all")));
    return { trigger, panel, item: el("div", { className: "menu-item" }, trigger, panel) };
  });

  const setOpen = (menu, open) => {
    menu.trigger.setAttribute("aria-expanded", String(open));
    menu.panel.hidden = !open;
  };
  const closeAll = () => menus.forEach((m) => setOpen(m, false));

  for (const menu of menus) {
    menu.trigger.addEventListener("click", () => {
      const willOpen = menu.panel.hidden;
      closeAll();
      setOpen(menu, willOpen);
    });
  }
  nav.addEventListener("click", (e) => { if (e.target.closest(".menu-panel a")) closeAll(); });
  nav.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const open = menus.find((m) => !m.panel.hidden);
    if (open) { closeAll(); open.trigger.focus(); }
  });
  document.addEventListener("click", (e) => { if (!nav.contains(e.target)) closeAll(); });
  document.addEventListener("focusin", (e) => { if (!nav.contains(e.target)) closeAll(); }); // Tab para fora fecha

  nav.replaceChildren(...menus.map((m) => m.item));
}
