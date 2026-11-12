// Verificação da Etapa 2 (regras de busca, filtro e ordenação). Rode: npm test
import assert from "node:assert/strict";
import { products } from "../js/data/products.js";
import { filterProducts, sortProducts, queryCatalog, normalize } from "../js/catalog.js";
import { getUnitPriceCents } from "../js/data/products.js";

const ids = (list) => list.map((p) => p.id);

assert.equal(normalize("  TÊNIS Térmica "), "tenis termica");
assert.deepEqual(ids(filterProducts(products, { query: "termica" })), ["garrafa-volt"]);
assert.deepEqual(ids(filterProducts(products, { query: "tenis asics" })), ["asics-pulse-x"]);
assert.equal(filterProducts(products, { query: "xyz" }).length, 0);

assert.ok(filterProducts(products, { category: "calcados" }).every((p) => p.category === "calcados"));
const fem = filterProducts(products, { audience: "feminino" });
assert.ok(fem.every((p) => ["feminino", "unissex"].includes(p.audience)));
assert.ok(filterProducts(products, { audience: "infantil" }).every((p) => p.audience === "infantil"));

// faixa usa o preço promocional: Volt Runner custa 329,90 (não 399,90)
assert.ok(ids(filterProducts(products, { priceRange: "300-mais" })).includes("volt-runner-elite"));
assert.ok(filterProducts(products, { priceRange: "ate-100" }).every((p) => getUnitPriceCents(p) < 10000));

const asc = sortProducts(products, "price-asc").map(getUnitPriceCents);
assert.deepEqual(asc, [...asc].sort((a, b) => a - b));
assert.equal(sortProducts(products, "price-desc")[0].id, "volt-runner-elite");
const names = sortProducts(products, "name").map((p) => p.name);
assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b, "pt-BR")));
assert.ok(sortProducts(products, "featured").slice(0, 4).every((p) => p.featured));
const before = ids(products); sortProducts(products, "name");
assert.deepEqual(ids(products), before); // não altera o original

assert.deepEqual(ids(queryCatalog(products, { category: "roupas", audience: "feminino", sort: "price-asc" })), ["top-core", "legging-flex-pro"]);
console.log("Etapa 2: regras do catálogo verificadas.");
