// Verificação dos favoritos e do filtro "somente favoritos". Rode: npm test
import assert from "node:assert/strict";
import { toggleFavorite, sanitizeFavorites, loadFavorites, saveFavorites } from "../js/favorites.js";
import { filterProducts } from "../js/catalog.js";
import { products } from "../js/data/products.js";

let favs = toggleFavorite([], "asics-pulse-x");
assert.deepEqual(favs, ["asics-pulse-x"]);
assert.deepEqual(toggleFavorite(favs, "asics-pulse-x"), []);
assert.equal(toggleFavorite(favs, "nao-existe"), favs);
assert.deepEqual(sanitizeFavorites(["asics-pulse-x", "asics-pulse-x", 7, "xx"]), ["asics-pulse-x"]);

const store = { v: null, getItem() { return this.v; }, setItem(_, x) { this.v = x; } };
saveFavorites(["top-core"], store);
assert.deepEqual(loadFavorites(store), ["top-core"]);
store.v = "{quebrado";
assert.deepEqual(loadFavorites(store), []);

assert.deepEqual(filterProducts(products, { onlyFavorites: true, favoriteIds: ["top-core"] }).map((p) => p.id), ["top-core"]);
assert.equal(filterProducts(products, { onlyFavorites: true, favoriteIds: [] }).length, 0);
console.log("Etapa 3: favoritos verificados.");
