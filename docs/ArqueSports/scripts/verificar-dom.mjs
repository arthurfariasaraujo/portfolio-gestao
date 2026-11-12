// Teste de fluxo no DOM simulado (jsdom). Requer: npm install. Rode: npm run test:dom
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const html = readFileSync(new URL("index.html", root), "utf8").replace(/<script[\s\S]*?<\/script>/, "");
const dom = new JSDOM(html, { url: "http://localhost/", pretendToBeVisual: true });
const { window } = dom;
Object.assign(globalThis, { window, document: window.document, localStorage: window.localStorage });

// jsdom pode não implementar <dialog>: simulamos só o essencial.
const D = window.HTMLDialogElement.prototype;
D.showModal = function () { this.setAttribute("open", ""); };
D.close = function () { this.removeAttribute("open"); };
window.HTMLElement.prototype.scrollIntoView = () => {};

const errors = [];
console.error = (...a) => errors.push(a);
await import(new URL("js/main.js", root).href);

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const text = (s) => $(s).textContent.replace(/\s/g, " ");
const fire = (n, type) => n.dispatchEvent(new window.Event(type, { bubbles: true }));
const addBtn = (id) => $(`.card [data-add="${id}"]`);

// 1) adicionar e abrir a gaveta
addBtn("asics-pulse-x").click(); addBtn("asics-pulse-x").click();
assert.equal($("#cart-count").textContent, "2");
$("#cart-link").click();
assert.ok($("#cart-drawer").hasAttribute("open"));
assert.equal($$(".cart-line").length, 1);
assert.equal(text(".cart-line-total"), "R$ 239,80");
assert.match(text("#cart-shipping"), /19,90/);
assert.equal(text("#cart-total"), "R$ 259,70");
assert.match(text("#cart-free-note"), /Faltam R\$ 59,20/);

// 2) quantidades, limites e foco
$('[data-action="inc"]').click();
assert.equal(text(".qty-value"), "Quantidade: 3");
assert.equal(text("#cart-subtotal"), "R$ 359,70");
assert.equal(text("#cart-shipping"), "Grátis");
$('[data-action="dec"]').click(); $('[data-action="dec"]').click();
assert.ok($('[data-action="dec"]').disabled, "diminuir fica desabilitado em 1");
assert.equal(document.activeElement.dataset.action, "remove", "foco migra para Remover");
$('[data-action="remove"]').click();
assert.ok(!$("#cart-empty").hidden && $("#cart-footer").hidden);
assert.equal(document.activeElement.id, "cart-title");
assert.equal($("#cart-count").hidden, true);
$("#cart-continue").click();
assert.ok(!$("#cart-drawer").hasAttribute("open"));

// 3) favoritos
assert.equal($$(".card [data-fav]")[0].getAttribute("aria-pressed"), "false");
$("#fav-toggle").click();
assert.match(text(".empty h3"), /ainda não tem favoritos/);
$("#fav-toggle").click();
$('.card [data-fav="top-core"]').click();
assert.equal(localStorage.getItem("arquesports:favorites:v1"), '["top-core"]');
$("#fav-toggle").click();
assert.equal($$(".card").length, 1);
$('.card [data-fav="top-core"]').click(); // desfavorita dentro do filtro
assert.equal($$(".card").length, 0);
assert.equal(document.activeElement.id, "catalog-title");
$("#fav-toggle").click();

// 4) modal de detalhes
$('.card [data-detail="volt-runner-elite"]').click();
assert.ok($("#product-dialog").hasAttribute("open"));
assert.equal(text("#detail-title"), "Volt Runner Elite");
assert.match(text("#detail-content .price"), /399,90.*329,90/);
$("#detail-content [data-add]").click();
assert.equal($("#cart-count").textContent, "1");
$("#detail-close").click();

// 5) menu de navegação
const triggers = $$(".menu-trigger");
assert.equal(triggers.length, 3);
assert.ok(triggers.every((t) => t.getAttribute("aria-expanded") === "false"));
assert.ok($$(".menu-panel").every((p) => p.hidden));
triggers[0].click();
assert.equal(triggers[0].getAttribute("aria-expanded"), "true");
assert.equal($("#menu-masculino").hidden, false);
triggers[1].click();
assert.ok($("#menu-masculino").hidden && !$("#menu-feminino").hidden, "abrir outro fecha o anterior");
triggers[1].dispatchEvent(new window.KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
assert.ok($("#menu-feminino").hidden);
assert.equal(document.activeElement, triggers[1], "Esc devolve o foco ao botão");
triggers[0].click();
$('#menu-masculino [data-go-category="calcados"]').click();
assert.ok($("#menu-masculino").hidden);
assert.deepEqual($$(".card-name").map((n) => n.textContent).sort(), ["Asics Pulse X", "Volt Runner Elite"]);

// 6) hero acessível
const slides = $$(".slide");
assert.equal(slides.length, 3);
assert.ok(slides[0].classList.contains("is-active") && !slides[0].hasAttribute("inert"));
assert.ok(slides[1].hasAttribute("inert") && slides[2].hasAttribute("inert"), "slides ocultos ficam inert");
$("#hero-next").click();
assert.ok(slides[1].classList.contains("is-active") && slides[0].hasAttribute("inert"));
assert.equal($$(".hero-dot")[1].getAttribute("aria-current"), "true");
$("#hero-prev").click(); $("#hero-prev").click();
assert.ok(slides[2].classList.contains("is-active"), "anterior do primeiro volta ao último");
assert.equal($("#hero-toggle").textContent, "Pausar");
$("#hero-toggle").click();
assert.equal($("#hero-toggle").textContent, "Reproduzir");
assert.equal(document.querySelector(".hero-slides").getAttribute("aria-live"), "polite");
slides[2].querySelector("[data-go-audience]").click();
assert.deepEqual($$(".card-name").map((n) => n.textContent).sort(), ["Mochila Kids Sport", "Tênis Play Fast Kids"]);

// 7) segurança: nome malicioso vira texto, nunca HTML
const { createProductCard } = await import(new URL("js/ui/render.js", root).href);
const evil = { id: "x", name: "<img src=x onerror=alert(1)>", brand: "B", description: "d", priceCents: 100, promoPriceCents: null, image: "a.svg", imageAlt: "a", category: "roupas", audience: "unissex" };
const card = createProductCard(evil);
assert.equal(card.querySelectorAll("img").length, 1);
assert.equal(card.querySelector(".card-name").textContent, evil.name);

assert.equal($$("img").filter((i) => i.getAttribute("alt") === null).length, 0);
assert.equal(errors.length, 0, "console sem erros");
console.log("DOM: fluxos de carrinho, favoritos e detalhes verificados.");
process.exit(0); // o autoplay do hero mantém um timer ativo
