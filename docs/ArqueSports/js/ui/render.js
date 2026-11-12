// Criação de elementos do DOM. Usamos createElement + textContent (e não
// innerHTML) para que nenhum texto seja interpretado como HTML.
import { formatPrice } from "../format.js";
import { isOnSale, CATEGORIES, AUDIENCES } from "../data/products.js";
import { MAX_QUANTITY } from "../cart.js";

export function el(tag, { className, text, attrs } = {}, ...children) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  for (const [name, value] of Object.entries(attrs ?? {})) node.setAttribute(name, value);
  node.append(...children.filter(Boolean));
  return node;
}

const SVG_NS = "http://www.w3.org/2000/svg";
const HEART_PATH = "M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10Z";

export function icon(pathData) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("class", "icon");
  svg.setAttribute("aria-hidden", "true");
  const path = document.createElementNS(SVG_NS, "path");
  path.setAttribute("d", pathData);
  svg.append(path);
  return svg;
}

const srOnly = (text) => el("span", { className: "sr-only", text });

function createPrice(p) {
  if (!isOnSale(p)) {
    return el("p", { className: "price" }, el("strong", { className: "price-now" }, srOnly("Preço: "), formatPrice(p.priceCents)));
  }
  return el("p", { className: "price" },
    el("s", { className: "price-old" }, srOnly("Preço original: "), formatPrice(p.priceCents)),
    el("strong", { className: "price-now" }, srOnly("Preço promocional: "), formatPrice(p.promoPriceCents)),
  );
}

const createAddButton = (p) => el("button", {
  className: "btn btn-primary",
  text: "Adicionar ao carrinho",
  attrs: { type: "button", "data-add": p.id, "aria-label": `Adicionar ${p.name} ao carrinho` },
});

function createFavoriteButton(p, isFavorite, withLabel = false) {
  return el("button", {
    className: withLabel ? "btn btn-outline fav-btn-wide" : "fav-btn",
    attrs: { type: "button", "data-fav": p.id, "aria-pressed": String(isFavorite), "aria-label": `Favoritar ${p.name}` },
  }, icon(HEART_PATH), withLabel ? "Favoritar" : null);
}

export function createProductCard(p, isFavorite = false) {
  const discount = isOnSale(p) ? Math.round((1 - p.promoPriceCents / p.priceCents) * 100) : 0;
  const image = el("img", { attrs: { src: p.image, alt: p.imageAlt, width: 800, height: 1000, loading: "lazy", decoding: "async" } });

  return el("article", { className: "card" },
    el("div", { className: "card-media" }, image,
      discount ? el("span", { className: "badge", text: `Promoção −${discount}%` }) : null,
      createFavoriteButton(p, isFavorite)),
    el("div", { className: "card-body" },
      el("p", { className: "card-brand", text: p.brand }),
      el("h3", { className: "card-name", text: p.name }),
      el("p", { className: "card-desc", text: p.description }),
      createPrice(p),
      createAddButton(p),
      el("button", {
        className: "btn btn-outline",
        text: "Ver detalhes",
        attrs: { type: "button", "data-detail": p.id, "aria-label": `Ver detalhes de ${p.name}` },
      })),
  );
}

export function createProductDetail(p, isFavorite = false) {
  return el("div", { className: "detail" },
    el("img", { className: "detail-media", attrs: { src: p.image, alt: p.imageAlt, width: 800, height: 1000 } }),
    el("div", { className: "detail-info" },
      el("p", { className: "card-brand", text: p.brand }),
      el("h2", { className: "detail-title", attrs: { id: "detail-title" }, text: p.name }),
      createPrice(p),
      el("p", { text: p.description }),
      el("dl", { className: "specs" },
        el("dt", { text: "Categoria" }), el("dd", { text: CATEGORIES[p.category] }),
        el("dt", { text: "Público" }), el("dd", { text: AUDIENCES[p.audience] })),
      el("div", { className: "detail-actions" }, createAddButton(p), createFavoriteButton(p, isFavorite, true))),
  );
}

export function createCartLine({ product: p, quantity, unitPriceCents, lineTotalCents }) {
  const stepper = (action, text, label, disabled) => el("button", {
    className: "qty-btn",
    text,
    attrs: { type: "button", "data-action": action, "data-id": p.id, "aria-label": label, ...(disabled ? { disabled: "" } : {}) },
  });

  return el("li", { className: "cart-line" },
    el("img", { attrs: { src: p.image, alt: "", width: 80, height: 100 } }), // decorativa: o nome está ao lado
    el("div", { className: "cart-line-info" },
      el("p", { className: "cart-line-name", text: p.name }),
      el("p", { className: "cart-line-unit", text: `${formatPrice(unitPriceCents)} cada` }),
      el("div", { className: "qty" },
        stepper("dec", "−", `Diminuir quantidade de ${p.name}`, quantity <= 1),
        el("span", { className: "qty-value" }, srOnly("Quantidade: "), String(quantity)),
        stepper("inc", "+", `Aumentar quantidade de ${p.name}`, quantity >= MAX_QUANTITY)),
      el("button", {
        className: "link-btn",
        text: "Remover",
        attrs: { type: "button", "data-action": "remove", "data-id": p.id, "aria-label": `Remover ${p.name} do carrinho` },
      })),
    el("p", { className: "cart-line-total", text: formatPrice(lineTotalCents) }));
}

export function createEmptyState(onReset, title = "Nenhum produto encontrado", text = "Tente outro termo de busca ou remova alguns filtros.") {
  const button = el("button", { className: "btn btn-outline", text: "Limpar filtros", attrs: { type: "button" } });
  button.addEventListener("click", onReset);
  return el("div", { className: "empty" }, el("h3", { text: title }), el("p", { text }), button);
}

export function createErrorState() {
  return el("div", { className: "empty", attrs: { role: "alert" } },
    el("h3", { text: "Não foi possível carregar os produtos" }),
    el("p", { text: "Atualize a página. Se o problema continuar, tente novamente mais tarde." }));
}
