// Liga as fotos de assets/img/fotos/ aos produtos. Rode: npm run fotos
// Regra: o NOME do arquivo é o id do produto (ex.: asics-pulse-x.jpg). Sem foto, o placeholder continua.
import { readdirSync, writeFileSync, existsSync } from "node:fs";
import { extname, basename } from "node:path";
import { products } from "../js/data/products.js";

const dir = new URL("../assets/img/fotos/", import.meta.url);
const PREFERENCE = [".avif", ".webp", ".jpg", ".jpeg", ".png"]; // se houver duas do mesmo produto, vence a primeira
const ids = new Set(products.map((p) => p.id));

const map = {};
for (const file of existsSync(dir) ? readdirSync(dir) : []) {
  const ext = extname(file).toLowerCase();
  if (!PREFERENCE.includes(ext)) continue;
  const id = basename(file, extname(file)).toLowerCase();
  if (!ids.has(id)) { console.warn(`Ignorado: "${file}" não corresponde a nenhum produto.`); continue; }
  const current = map[id];
  if (!current || PREFERENCE.indexOf(ext) < PREFERENCE.indexOf(extname(current))) map[id] = `assets/img/fotos/${id}${ext}`;
}

writeFileSync(new URL("../js/data/images.js", import.meta.url),
  `// GERADO por scripts/aplicar-fotos.mjs (npm run fotos). Não edite à mão.\nexport const PHOTOS = Object.freeze(${JSON.stringify(map, null, 2)});\n`);

const missing = products.filter((p) => !(p.id in map)).map((p) => p.id);
console.log(`${Object.keys(map).length} de ${products.length} produtos com foto.`);
if (missing.length) console.log(`Ainda com placeholder: ${missing.join(", ")}`);
