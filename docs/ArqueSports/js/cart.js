// Lógica do carrinho. O carrinho é uma lista imutável de { id, quantity }.
// Guardamos só id e quantidade: nome e preço são sempre lidos de products.js,
// então um preço alterado no catálogo vale automaticamente no carrinho.
import { getProductById, getUnitPriceCents } from "./data/products.js";
import { readJson, writeJson } from "./storage.js";

export const MAX_QUANTITY = 10;
export const SHIPPING_CENTS = 1990;
export const FREE_SHIPPING_THRESHOLD_CENTS = 29900;
export const STORAGE_KEY = "arquesports:cart:v1";

const clampQuantity = (n) => Math.min(MAX_QUANTITY, Math.max(1, Math.trunc(n)));

export function addItem(cart, productId, quantity = 1) {
  if (!getProductById(productId) || !Number.isFinite(quantity)) return cart;
  const existing = cart.find((i) => i.id === productId);
  if (!existing) return [...cart, { id: productId, quantity: clampQuantity(quantity) }];
  return cart.map((i) =>
    i.id === productId ? { ...i, quantity: clampQuantity(i.quantity + quantity) } : i
  );
}

export const removeItem = (cart, productId) => cart.filter((i) => i.id !== productId);

/** Define a quantidade; zero ou menos remove o item. */
export function setQuantity(cart, productId, quantity) {
  if (!Number.isFinite(quantity)) return cart;
  if (quantity < 1) return removeItem(cart, productId);
  return cart.map((i) => (i.id === productId ? { ...i, quantity: clampQuantity(quantity) } : i));
}

export const clearCart = () => [];

/** Itens enriquecidos com produto e valores, prontos para a interface exibir. */
export function getCartLines(cart) {
  return cart.flatMap(({ id, quantity }) => {
    const product = getProductById(id);
    if (!product) return [];
    const unitPriceCents = getUnitPriceCents(product);
    return [{ product, quantity, unitPriceCents, lineTotalCents: unitPriceCents * quantity }];
  });
}

export function calculateTotals(cart) {
  const lines = getCartLines(cart);
  const subtotalCents = lines.reduce((sum, l) => sum + l.lineTotalCents, 0);
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);
  const freeShipping = subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS;
  const shippingCents = itemCount === 0 || freeShipping ? 0 : SHIPPING_CENTS;
  return { itemCount, subtotalCents, shippingCents, totalCents: subtotalCents + shippingCents, freeShipping };
}

/** localStorage é texto editável pelo usuário: nunca confie nele sem validar. */
export function sanitizeCart(raw) {
  if (!Array.isArray(raw)) return [];
  let cart = [];
  for (const entry of raw) {
    if (entry && typeof entry.id === "string" && Number.isFinite(entry.quantity)) {
      cart = addItem(cart, entry.id, entry.quantity);
    }
  }
  return cart;
}

export const loadCart = (storage) => sanitizeCart(readJson(STORAGE_KEY, storage));
export const saveCart = (cart, storage) => writeJson(STORAGE_KEY, cart, storage);
