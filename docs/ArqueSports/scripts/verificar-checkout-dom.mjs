// Fluxo do checkout no DOM simulado (jsdom). Rode: npm run test:dom
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const html = readFileSync(new URL("checkout.html", root), "utf8").replace(/<script[\s\S]*?<\/script>/, "");
const errors = [];
console.error = (...a) => errors.push(a);
let run = 0;

async function boot(cart) {
  const dom = new JSDOM(html, { url: "http://localhost/", pretendToBeVisual: true });
  Object.assign(globalThis, { window: dom.window, document: dom.window.document, localStorage: dom.window.localStorage });
  if (cart) localStorage.setItem("arquesports:cart:v1", JSON.stringify(cart));
  await import(new URL(`js/checkout.js?run=${++run}`, root).href); // ?run força reexecutar o módulo
  return dom.window;
}
const $ = (id) => document.getElementById(id);
const text = (id) => $(id).textContent.replace(/\s/g, " ");
const type = (id, value) => { $(id).value = value; $(id).dispatchEvent(new window.Event("input", { bubbles: true })); };
const submit = () => document.querySelector('button[type="submit"]').click();

// 1) carrinho vazio bloqueia o checkout
await boot(null);
assert.equal($("checkout-grid").hidden, true);
assert.equal($("empty-cart").hidden, false);

// 2) resumo lê o carrinho: 2 × Asics (239,80) + frete 19,90
await boot([{ id: "asics-pulse-x", quantity: 2 }]);
assert.equal($("checkout-grid").hidden, false);
assert.equal(document.querySelectorAll(".summary-line").length, 1);
assert.equal(text("summary-subtotal"), "R$ 239,80");
assert.equal(text("summary-total"), "R$ 259,70");

// 3) envio vazio: 8 erros, aria-invalid, foco no primeiro campo, resumo anunciado
submit();
assert.equal(document.querySelectorAll('[aria-invalid="true"]').length, 8);
assert.equal(document.activeElement.id, "nome");
assert.equal($("form-summary").hidden, false);
assert.match(text("form-summary"), /Corrija 8 campos/);
assert.match(text("nome-error"), /nome e sobrenome/i);

// 4) máscaras e correção ao vivo
type("cartao", "41111111111111119");
assert.equal($("cartao").value, "4111 1111 1111 1111");
type("nome", "Maria Silva");
assert.ok(!$("nome").hasAttribute("aria-invalid"), "erro some ao corrigir");
assert.equal($("nome-error").hidden, true);

// 5) cartão com dígito errado e cartão vencido
type("email", "maria@exemplo.com"); type("endereco", "Rua A, 10, Centro"); type("cidade", "João Pessoa");
type("cep", "58000000"); type("validade", "0120"); type("cvv", "12345");
assert.equal($("cep").value, "58000-000");
assert.equal($("cvv").value, "1234");
type("cartao", "4111111111111112");
submit();
assert.deepEqual([...document.querySelectorAll('[aria-invalid="true"]')].map((i) => i.id), ["cartao", "validade"]);
assert.equal(document.activeElement.id, "cartao");

// 6) pedido válido: confirmação, foco, carrinho limpo
type("cartao", "4111 1111 1111 1111"); type("validade", "12/39");
submit();
assert.equal(document.querySelector("#checkout-form"), null);
assert.equal(document.activeElement.className, "success-title");
assert.match(document.body.textContent, /nenhuma cobrança foi feita/);
assert.match(document.body.textContent, /Número do pedido: ARQ-[A-Z0-9]{6}/);
assert.equal(localStorage.getItem("arquesports:cart:v1"), "[]");

assert.equal(errors.length, 0, "console sem erros");
console.log("DOM: fluxo do checkout verificado.");
