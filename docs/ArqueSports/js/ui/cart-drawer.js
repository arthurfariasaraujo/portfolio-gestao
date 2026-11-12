// Desenha o conteúdo da gaveta do carrinho a partir do estado (cart).
import { calculateTotals, getCartLines, FREE_SHIPPING_THRESHOLD_CENTS } from "../cart.js";
import { formatPrice } from "../format.js";
import { createCartLine } from "./render.js";

const $ = (id) => document.getElementById(id);

export function renderCartDrawer(cart) {
  const lines = getCartLines(cart);
  const totals = calculateTotals(cart);
  const hasItems = lines.length > 0;

  $("cart-items").replaceChildren(...lines.map(createCartLine));
  $("cart-items").hidden = !hasItems;
  $("cart-empty").hidden = hasItems;
  $("cart-footer").hidden = !hasItems;

  $("cart-subtotal").textContent = formatPrice(totals.subtotalCents);
  $("cart-shipping").textContent = totals.freeShipping ? "Grátis" : formatPrice(totals.shippingCents);
  $("cart-total").textContent = formatPrice(totals.totalCents);
  $("cart-free-note").textContent = totals.freeShipping
    ? "Você ganhou frete grátis!"
    : `Faltam ${formatPrice(FREE_SHIPPING_THRESHOLD_CENTS - totals.subtotalCents)} para ganhar frete grátis.`;
}
