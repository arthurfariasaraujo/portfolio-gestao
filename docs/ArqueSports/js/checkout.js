// Página de checkout DEMONSTRATIVA: lê o carrinho, valida o formulário e mostra a confirmação.
// Nenhum dado do formulário é enviado, salvo ou registrado.
import { loadCart, saveCart, clearCart, getCartLines, calculateTotals } from "./cart.js";
import { formatPrice } from "./format.js";
import { el } from "./ui/render.js";
import { FIELDS, MASKS, validateCheckout } from "./validators.js";

const $ = (id) => document.getElementById(id);
const FIELD_IDS = Object.keys(FIELDS);
const form = $("checkout-form");

const lines = getCartLines(loadCart());
const totals = calculateTotals(lines.map(({ product, quantity }) => ({ id: product.id, quantity })));

/* ---------- Resumo do pedido ---------- */

function renderSummary() {
  $("summary-items").replaceChildren(...lines.map(({ product, quantity, lineTotalCents }) =>
    el("li", { className: "summary-line" },
      el("span", { text: `${product.name} × ${quantity}` }),
      el("span", { text: formatPrice(lineTotalCents) }))));
  $("summary-subtotal").textContent = formatPrice(totals.subtotalCents);
  $("summary-shipping").textContent = totals.freeShipping ? "Grátis" : formatPrice(totals.shippingCents);
  $("summary-total").textContent = formatPrice(totals.totalCents);
}

/* ---------- Validação ---------- */

function showError(input, message) {
  const error = $(`${input.id}-error`);
  if (message) {
    input.setAttribute("aria-invalid", "true");
    error.textContent = message;
    error.hidden = false;
  } else {
    input.removeAttribute("aria-invalid");
    error.textContent = "";
    error.hidden = true;
  }
}

const readValues = () => Object.fromEntries(FIELD_IDS.map((id) => [id, $(id).value]));

form.addEventListener("input", (event) => {
  const input = event.target;
  if (!(input.id in FIELDS)) return;
  if (input.id in MASKS) input.value = MASKS[input.id](input.value);
  // Depois que o campo já foi marcado com erro, revalida a cada tecla para o erro sumir assim que for corrigido.
  if (input.hasAttribute("aria-invalid")) showError(input, FIELDS[input.id](input.value));
});

form.addEventListener("focusout", (event) => {
  const input = event.target;
  // Não reclama de campo vazio só porque o usuário passou por ele com Tab.
  if (input.id in FIELDS && input.value !== "") showError(input, FIELDS[input.id](input.value));
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const errors = validateCheckout(readValues());
  for (const id of FIELD_IDS) showError($(id), errors[id] ?? null);

  const invalid = FIELD_IDS.filter((id) => id in errors);
  const summary = $("form-summary");
  if (invalid.length > 0) {
    summary.textContent = `Corrija ${invalid.length} ${invalid.length === 1 ? "campo" : "campos"} para continuar.`;
    summary.hidden = false;
    $(invalid[0]).focus();
    return;
  }
  summary.hidden = true;
  completeOrder();
});

/* ---------- Confirmação (demonstrativa) ---------- */

function completeOrder() {
  const orderNumber = `ARQ-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  saveCart(clearCart()); // o pedido "foi feito": esvazia o carrinho
  const heading = el("h1", { className: "success-title", text: "Pedido recebido", attrs: { tabindex: "-1" } });

  $("checkout-main").replaceChildren(el("section", { className: "success" },
    heading,
    el("p", { className: "demo-note", text: "Compra demonstrativa: nenhuma cobrança foi feita e nenhum e-mail foi enviado." }),
    el("p", { text: `Número do pedido: ${orderNumber}` }),
    el("ul", { className: "summary-items" }, ...lines.map(({ product, quantity, lineTotalCents }) =>
      el("li", { className: "summary-line" },
        el("span", { text: `${product.name} × ${quantity}` }),
        el("span", { text: formatPrice(lineTotalCents) })))),
    el("p", { className: "summary-total-line", text: `Total: ${formatPrice(totals.totalCents)}` }),
    el("a", { className: "btn btn-primary", text: "Voltar à loja", attrs: { href: "index.html" } })));
  heading.focus();
}

/* ---------- Início ---------- */

if (lines.length === 0) {
  $("checkout-grid").hidden = true;
  $("empty-cart").hidden = false;
} else {
  renderSummary();
}
