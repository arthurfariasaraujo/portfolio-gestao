// Verificação rápida da Etapa 1. Rode: npm test
import assert from "node:assert/strict";
import { addItem, setQuantity, removeItem, calculateTotals, sanitizeCart, loadCart, saveCart, MAX_QUANTITY } from "../js/cart.js";
import { formatPrice } from "../js/format.js";
import { products } from "../js/data/products.js";

const memoryStorage = (initial = null) => {
  let value = initial;
  return { getItem: () => value, setItem: (_, v) => { value = v; } };
};

// moeda
assert.equal(formatPrice(14990).replace(/\s/g, " "), "R$ 149,90");
assert.throws(() => formatPrice(149.9));

// adicionar soma quantidades e ignora ids inexistentes
let cart = addItem([], "camisa-selecao");
cart = addItem(cart, "camisa-selecao", 2);
assert.deepEqual(cart, [{ id: "camisa-selecao", quantity: 3 }]);
assert.equal(addItem(cart, "nao-existe"), cart);

// limite máximo e remoção por quantidade 0
assert.equal(setQuantity(cart, "camisa-selecao", 99)[0].quantity, MAX_QUANTITY);
assert.deepEqual(setQuantity(cart, "camisa-selecao", 0), []);

// totais: 3 x 149,90 = 449,70 → frete grátis
let t = calculateTotals(cart);
assert.equal(t.subtotalCents, 44970);
assert.equal(t.shippingCents, 0);

// abaixo do limite cobra frete; usa preço promocional (329,90 → frete grátis)
t = calculateTotals(addItem([], "adidas-street-cap"));
assert.deepEqual([t.subtotalCents, t.shippingCents, t.totalCents], [8990, 1990, 10980]);
assert.equal(calculateTotals(addItem([], "volt-runner-elite")).subtotalCents, 32990);
assert.equal(calculateTotals([]).totalCents, 0);

// imutabilidade
const original = [{ id: "asics-pulse-x", quantity: 1 }];
addItem(original, "asics-pulse-x"); removeItem(original, "asics-pulse-x");
assert.deepEqual(original, [{ id: "asics-pulse-x", quantity: 1 }]);

// persistência e dados corrompidos
const storage = memoryStorage();
saveCart(cart, storage);
assert.deepEqual(loadCart(storage), cart);
assert.deepEqual(loadCart(memoryStorage("{quebrado")), []);
assert.deepEqual(sanitizeCart([{ id: "asics-pulse-x", quantity: "x" }, null, 5, { id: "asics-pulse-x", quantity: 2 }]),
  [{ id: "asics-pulse-x", quantity: 2 }]);

assert.equal(products.length, 12);
console.log("Etapa 1: todas as verificações passaram.");
