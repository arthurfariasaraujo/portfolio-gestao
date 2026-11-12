// Fonte ÚNICA dos produtos. Preços em CENTAVOS (inteiros) para evitar erros
// de ponto flutuante (0.1 + 0.2 !== 0.3). Para trocar uma foto, edite `image`.

import { PHOTOS } from "./images.js";

const raw = [
  { id: "camisa-selecao", name: "Camisa Seleção Brasileira", brand: "Jordan", kind: "camisa",
    category: "roupas", audience: "masculino", priceCents: 14990, promoPriceCents: null,
    description: "Camisa esportiva Jordan com tecido leve e respirável.", featured: true },
  { id: "asics-pulse-x", name: "Asics Pulse X", brand: "Asics", kind: "tenis",
    category: "calcados", audience: "masculino", priceCents: 11990, promoPriceCents: null,
    description: "Tênis com amortecimento macio para treinos e corridas diárias.", featured: true },
  { id: "adidas-street-cap", name: "Adidas Street Cap", brand: "Adidas", kind: "bone",
    category: "acessorios", audience: "unissex", priceCents: 8990, promoPriceCents: null,
    description: "Boné casual azul-marinho com aba curva e ajuste traseiro.", featured: true },
  { id: "volt-runner-elite", name: "Volt Runner Elite", brand: "ArqueSports", kind: "tenis",
    category: "calcados", audience: "masculino", priceCents: 39990, promoPriceCents: 32990,
    description: "Tênis de corrida da linha Volt-Reaction, com retorno de energia a cada passada.", featured: true },
  { id: "volt-sprint-feminino", name: "Volt Sprint Feminino", brand: "ArqueSports", kind: "tenis",
    category: "calcados", audience: "feminino", priceCents: 29990, promoPriceCents: null,
    description: "Tênis leve para treino e corrida, com cabedal respirável.", featured: false },
  { id: "short-pace-dry", name: "Short Pace Dry", brand: "ArqueSports", kind: "shorts",
    category: "roupas", audience: "masculino", priceCents: 8990, promoPriceCents: 6990,
    description: "Short de secagem rápida com bolso interno para chave.", featured: false },
  { id: "jaqueta-thermo", name: "Jaqueta Cortavento Thermo", brand: "ArqueSports", kind: "jaqueta",
    category: "roupas", audience: "masculino", priceCents: 24990, promoPriceCents: null,
    description: "Jaqueta leve que protege do vento e da garoa sem esquentar demais.", featured: false },
  { id: "legging-flex-pro", name: "Legging Flex Pro", brand: "ArqueSports", kind: "legging",
    category: "roupas", audience: "feminino", priceCents: 12990, promoPriceCents: null,
    description: "Legging de cintura alta com compressão média e costuras planas.", featured: false },
  { id: "top-core", name: "Top Fitness Core", brand: "ArqueSports", kind: "top",
    category: "roupas", audience: "feminino", priceCents: 6990, promoPriceCents: null,
    description: "Top com sustentação média para treinos de academia e corrida.", featured: false },
  { id: "tenis-play-kids", name: "Tênis Play Fast Kids", brand: "ArqueSports", kind: "tenis",
    category: "calcados", audience: "infantil", priceCents: 17990, promoPriceCents: 14990,
    description: "Tênis infantil com fechamento em velcro e solado antiderrapante.", featured: false },
  { id: "mochila-kids", name: "Mochila Kids Sport", brand: "ArqueSports", kind: "mochila",
    category: "acessorios", audience: "infantil", priceCents: 12990, promoPriceCents: null,
    description: "Mochila resistente com alças acolchoadas e bolso para garrafa.", featured: false },
  { id: "garrafa-volt", name: "Garrafa Térmica Volt 750 ml", brand: "ArqueSports", kind: "garrafa",
    category: "acessorios", audience: "unissex", priceCents: 5990, promoPriceCents: null,
    description: "Garrafa de aço inox que mantém a bebida gelada por até 12 horas.", featured: false },
];

export const CATEGORIES = Object.freeze({
  calcados: "Calçados",
  roupas: "Roupas",
  acessorios: "Acessórios",
});

export const AUDIENCES = Object.freeze({
  masculino: "Masculino",
  feminino: "Feminino",
  infantil: "Infantil",
  unissex: "Unissex",
});

export const products = Object.freeze(
  raw.map((p) => Object.freeze({
    ...p,
    image: PHOTOS[p.id] ?? `assets/img/${p.id}.svg`, // foto real, se existir; senão o placeholder
    imageAlt: `${p.name}, ${p.brand}`,
  }))
);

// Falha cedo se houver dado inconsistente (id repetido, preço inválido...).
(function validateCatalog() {
  const ids = new Set();
  for (const p of products) {
    if (ids.has(p.id)) throw new Error(`Produto com id duplicado: ${p.id}`);
    ids.add(p.id);
    if (!Number.isInteger(p.priceCents) || p.priceCents <= 0) {
      throw new Error(`Preço inválido em ${p.id}`);
    }
    if (p.promoPriceCents !== null && !(Number.isInteger(p.promoPriceCents) && p.promoPriceCents < p.priceCents)) {
      throw new Error(`Preço promocional inválido em ${p.id}`);
    }
    if (!(p.category in CATEGORIES) || !(p.audience in AUDIENCES)) {
      throw new Error(`Categoria ou público inválido em ${p.id}`);
    }
  }
})();

const byId = new Map(products.map((p) => [p.id, p]));

export const getProductById = (id) => byId.get(id) ?? null;
export const isOnSale = (p) => p.promoPriceCents !== null;
/** Preço que o cliente de fato paga (promocional, se existir). */
export const getUnitPriceCents = (p) => (isOnSale(p) ? p.promoPriceCents : p.priceCents);
