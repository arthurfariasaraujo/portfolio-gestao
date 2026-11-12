// Favoritos: lista imutável de ids de produtos.
import { getProductById } from "./data/products.js";
import { readJson, writeJson } from "./storage.js";

export const FAVORITES_KEY = "arquesports:favorites:v1";

export function toggleFavorite(ids, productId) {
  if (!getProductById(productId)) return ids;
  return ids.includes(productId) ? ids.filter((id) => id !== productId) : [...ids, productId];
}

export function sanitizeFavorites(raw) {
  if (!Array.isArray(raw)) return [];
  return [...new Set(raw.filter((id) => typeof id === "string" && getProductById(id)))];
}

export const loadFavorites = (storage) => sanitizeFavorites(readJson(FAVORITES_KEY, storage));
export const saveFavorites = (ids, storage) => writeJson(FAVORITES_KEY, ids, storage);
