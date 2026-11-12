// Regras do catálogo: busca, filtros e ordenação. Funções puras, sem DOM.
import { getUnitPriceCents } from "./data/products.js";

// Faixas em centavos. `max` é exclusivo; null = sem limite.
export const PRICE_RANGES = Object.freeze({
  all: { label: "Qualquer preço", min: 0, max: null },
  "ate-100": { label: "Até R$ 100", min: 0, max: 10000 },
  "100-200": { label: "R$ 100 a R$ 200", min: 10000, max: 20000 },
  "200-300": { label: "R$ 200 a R$ 300", min: 20000, max: 30000 },
  "300-mais": { label: "Acima de R$ 300", min: 30000, max: null },
});

export const SORTS = Object.freeze({
  featured: "Destaques",
  "price-asc": "Menor preço",
  "price-desc": "Maior preço",
  name: "Nome (A–Z)",
});

/** "Térmica" e "termica" devem encontrar o mesmo produto. */
export const normalize = (text) =>
  text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();

export function filterProducts(list, { query = "", category = "all", audience = "all", priceRange = "all", onlyFavorites = false, favoriteIds = [] } = {}) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  const range = PRICE_RANGES[priceRange] ?? PRICE_RANGES.all;

  return list.filter((p) => {
    const price = getUnitPriceCents(p);
    const haystack = normalize(`${p.name} ${p.brand} ${p.description}`);
    return (
      terms.every((t) => haystack.includes(t)) &&
      (category === "all" || p.category === category) &&
      // produtos unissex aparecem em masculino e feminino
      (audience === "all" || p.audience === audience || (p.audience === "unissex" && audience !== "infantil")) &&
      (!onlyFavorites || favoriteIds.includes(p.id)) &&
      price >= range.min &&
      (range.max === null || price < range.max)
    );
  });
}

export function sortProducts(list, sort = "featured") {
  const copy = [...list]; // nunca altera a lista original
  const byPrice = (a, b) => getUnitPriceCents(a) - getUnitPriceCents(b);
  switch (sort) {
    case "price-asc": return copy.sort(byPrice);
    case "price-desc": return copy.sort((a, b) => byPrice(b, a));
    case "name": return copy.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
    default: return copy.sort((a, b) => Number(b.featured) - Number(a.featured)); // sort é estável
  }
}

export const queryCatalog = (list, filters) => sortProducts(filterProducts(list, filters), filters?.sort);
