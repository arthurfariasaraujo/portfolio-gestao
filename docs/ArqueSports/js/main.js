// Ponto de entrada da página inicial: liga estado, eventos e interface.
import { products, CATEGORIES, AUDIENCES, getProductById } from "./data/products.js";
import { PRICE_RANGES, SORTS, queryCatalog } from "./catalog.js";
import { createProductCard, createProductDetail, createEmptyState, createErrorState, el } from "./ui/render.js";
import { renderCartDrawer } from "./ui/cart-drawer.js";
import { addItem, setQuantity, removeItem, calculateTotals, loadCart, saveCart } from "./cart.js";
import { toggleFavorite, loadFavorites, saveFavorites } from "./favorites.js";
import { initMenu } from "./ui/menu.js";
import { initHero } from "./ui/hero.js";

const DEFAULT_FILTERS = Object.freeze({ query: "", category: "all", audience: "all", priceRange: "all", sort: "featured", onlyFavorites: false });

const $ = (id) => document.getElementById(id);
const grid = $("product-grid");
const searchInput = $("search-input");
const chipsBox = $("category-chips");
const drawer = $("cart-drawer");
const detailDialog = $("product-dialog");
const selects = { audience: $("filter-audience"), priceRange: $("filter-price"), sort: $("filter-sort") };

let state = { ...DEFAULT_FILTERS };
let cart = loadCart();
let favorites = loadFavorites();

const announce = (message) => { $("cart-status").textContent = message; };

/* ---------- Catálogo ---------- */

function fillSelect(select, options) {
  select.replaceChildren(...Object.entries(options).map(([value, label]) => el("option", { text: label, attrs: { value } })));
}

function buildControls() {
  fillSelect(selects.audience, { all: "Todos", ...AUDIENCES });
  fillSelect(selects.priceRange, Object.fromEntries(Object.entries(PRICE_RANGES).map(([k, r]) => [k, r.label])));
  fillSelect(selects.sort, SORTS);
  chipsBox.replaceChildren(...Object.entries({ all: "Todos", ...CATEGORIES }).map(([value, label]) =>
    el("button", { className: "chip", text: label, attrs: { type: "button", "data-category": value } })));
}

function syncControls() {
  searchInput.value = state.query;
  for (const [key, select] of Object.entries(selects)) select.value = state[key];
  for (const chip of chipsBox.children) chip.setAttribute("aria-pressed", String(chip.dataset.category === state.category));
  $("fav-toggle").setAttribute("aria-pressed", String(state.onlyFavorites));
}

function render() {
  const results = queryCatalog(products, { ...state, favoriteIds: favorites });
  const noFavoritesYet = state.onlyFavorites && favorites.length === 0;
  grid.replaceChildren(...(results.length
    ? results.map((p) => createProductCard(p, favorites.includes(p.id)))
    : [noFavoritesYet
        ? createEmptyState(resetFilters, "Você ainda não tem favoritos", "Use o coração em um produto para salvá-lo aqui.")
        : createEmptyState(resetFilters)]));
  $("result-status").textContent = results.length === 1 ? "1 produto encontrado" : `${results.length} produtos encontrados`;
}

function update(patch) {
  state = { ...state, ...patch };
  syncControls();
  render();
}

function resetFilters() {
  update({ ...DEFAULT_FILTERS });
  searchInput.focus();
}

/* ---------- Carrinho ---------- */

function updateCartBadge() {
  const { itemCount } = calculateTotals(cart);
  const badge = $("cart-count");
  badge.textContent = String(itemCount);
  badge.hidden = itemCount === 0;
  $("cart-link").setAttribute("aria-label", `Abrir carrinho, ${itemCount} ${itemCount === 1 ? "item" : "itens"}`);
}

/** Único ponto que altera o carrinho: salva, atualiza o contador e a gaveta. */
function setCart(next) {
  cart = next;
  saveCart(cart);
  updateCartBadge();
  renderCartDrawer(cart);
}

function handleAdd(button) {
  const product = getProductById(button.dataset.add);
  if (!product) return;
  setCart(addItem(cart, product.id));
  announce(`${product.name} adicionado ao carrinho`);
  button.dataset.label ??= button.textContent;
  button.textContent = "Adicionado ✓";
  setTimeout(() => { button.textContent = button.dataset.label; }, 1500);
}

function handleCartAction(button) {
  const { action, id } = button.dataset;
  const product = getProductById(id);
  const line = cart.find((i) => i.id === id);
  if (!product || !line) return;

  if (action === "inc") setCart(setQuantity(cart, id, line.quantity + 1));
  if (action === "dec") setCart(setQuantity(cart, id, line.quantity - 1));
  if (action === "remove") setCart(removeItem(cart, id));

  const updated = cart.find((i) => i.id === id);
  announce(updated ? `${product.name}: quantidade ${updated.quantity}` : `${product.name} removido do carrinho`);

  // A lista foi redesenhada: devolve o foco ao controle equivalente para o teclado não se perder.
  const items = $("cart-items");
  const target = items.querySelector(`[data-action="${action}"][data-id="${id}"]:not(:disabled)`)
    ?? items.querySelector(`[data-action="remove"][data-id="${id}"]`)
    ?? $("cart-title");
  target.focus();
}

/* ---------- Favoritos e detalhes ---------- */

function handleFavorite(button) {
  const product = getProductById(button.dataset.fav);
  if (!product) return;
  favorites = toggleFavorite(favorites, product.id);
  saveFavorites(favorites);
  announce(`${product.name} ${favorites.includes(product.id) ? "adicionado aos" : "removido dos"} favoritos`);

  if (state.onlyFavorites) {
    render();
    if (!button.isConnected) $("catalog-title").focus();
  }
  for (const b of document.querySelectorAll("[data-fav]")) {
    b.setAttribute("aria-pressed", String(favorites.includes(b.dataset.fav)));
  }
}

function openDetail(productId) {
  const product = getProductById(productId);
  if (!product) return;
  $("detail-content").replaceChildren(createProductDetail(product, favorites.includes(product.id)));
  detailDialog.showModal();
}

/* ---------- Eventos ---------- */

function bindEvents() {
  searchInput.addEventListener("input", () => update({ query: searchInput.value }));
  $("search-form").addEventListener("submit", (e) => { e.preventDefault(); $("produtos").scrollIntoView(); });
  chipsBox.addEventListener("click", (e) => {
    const chip = e.target.closest("[data-category]");
    if (chip) update({ category: chip.dataset.category });
  });
  for (const [key, select] of Object.entries(selects)) select.addEventListener("change", () => update({ [key]: select.value }));
  $("fav-toggle").addEventListener("click", () => update({ onlyFavorites: !state.onlyFavorites }));

  // Delegação: um único listener cobre botões de cards, do modal e criados depois.
  document.addEventListener("click", (e) => {
    // Links do menu e botões do hero: aplicam o filtro de categoria/público e o href="#produtos" rola até a lista.
    const go = e.target.closest("[data-go-category], [data-go-audience]");
    if (go) return update({ ...DEFAULT_FILTERS, category: go.dataset.goCategory ?? "all", audience: go.dataset.goAudience ?? "all" });
    const add = e.target.closest("[data-add]");
    if (add) return handleAdd(add);
    const fav = e.target.closest("[data-fav]");
    if (fav) return handleFavorite(fav);
    const detail = e.target.closest("[data-detail]");
    if (detail) openDetail(detail.dataset.detail);
  });
  $("cart-items").addEventListener("click", (e) => {
    const button = e.target.closest("[data-action]");
    if (button) handleCartAction(button);
  });

  $("cart-link").addEventListener("click", () => drawer.showModal());
  $("cart-close").addEventListener("click", () => drawer.close());
  $("cart-continue").addEventListener("click", () => drawer.close());
  $("detail-close").addEventListener("click", () => detailDialog.close());
  // Clique no fundo escurecido (::backdrop) tem o próprio <dialog> como alvo.
  for (const dialog of [drawer, detailDialog]) {
    dialog.addEventListener("click", (e) => { if (e.target === dialog) dialog.close(); });
  }
}

try {
  buildControls();
  initMenu($("main-nav"));
  initHero($("hero"));
  bindEvents();
  syncControls();
  updateCartBadge();
  renderCartDrawer(cart);
  render();
} catch (error) {
  console.error(error);
  grid.replaceChildren(createErrorState());
}
