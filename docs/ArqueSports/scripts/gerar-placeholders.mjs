// Gera um SVG por produto em assets/img/. Rode: npm run placeholders
import { writeFileSync } from "node:fs";
import { products } from "../js/data/products.js";

const SHAPES = {
  tenis: "M30 150 L30 112 Q30 100 42 98 L88 90 L112 66 Q124 60 133 69 L146 96 Q184 106 214 118 Q226 122 226 138 L226 150 Q226 158 218 158 L38 158 Q30 158 30 150 Z M30 158 L226 158 L226 170 L30 170 Z",
  camisa: "M88 44 L48 62 L24 104 L56 116 L68 104 L68 190 L188 190 L188 104 L200 116 L232 104 L208 62 L168 44 Q128 72 88 44 Z",
  bone: "M52 140 Q52 66 128 66 Q204 66 204 140 Z M190 134 L246 142 Q250 160 196 154 Z M36 146 L204 146 L204 158 L36 158 Z",
  shorts: "M68 56 L188 56 L202 176 L142 176 L128 112 L114 176 L54 176 Z",
  mochila: "M88 60 Q88 40 128 40 Q168 40 168 60 L190 72 L190 200 Q190 212 178 212 L78 212 Q66 212 66 200 L66 72 Z M88 150 L168 150 L168 190 L88 190 Z",
  garrafa: "M110 36 L146 36 L146 56 L110 56 Z M104 62 L152 62 L164 82 L164 206 Q164 216 154 216 L102 216 Q92 216 92 206 L92 82 Z",
  top: "M92 56 L112 56 L128 92 L144 56 L164 56 L176 120 Q176 150 128 150 Q80 150 80 120 Z",
  legging: "M82 48 L174 48 L184 190 L138 190 L128 108 L118 190 L72 190 Z",
};
SHAPES.jaqueta = SHAPES.camisa + " M126 52 L130 190 L126 190 Z";

const hash = (id) => [...id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 360, 7);

for (const p of products) {
  const bg = ["#111111", "#14161f", "#101419"][hash(p.id) % 3]; // varia o fundo levemente
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" role="img" aria-label="${p.imageAlt}">
  <rect width="800" height="1000" fill="${bg}"/>
  <circle cx="400" cy="440" r="270" fill="#0033ff" opacity="0.18"/>
  <circle cx="400" cy="440" r="270" fill="none" stroke="#0033ff" stroke-width="3"/>
  <g transform="translate(144 184) scale(2)" fill="#1b1b1b" stroke="#ffffff" stroke-width="3" stroke-linejoin="round">
    <path d="${SHAPES[p.kind]}"/>
  </g>
  <text x="400" y="900" fill="#a3a3a3" font-family="Helvetica, Arial, sans-serif" font-size="30" text-anchor="middle">${p.brand}</text>
  <text x="400" y="944" fill="#5c7cff" font-family="Arial Black, Arial, sans-serif" font-size="22" letter-spacing="6" text-anchor="middle">ARQUESPORTS</text>
</svg>
`;
  writeFileSync(new URL(`../assets/img/${p.id}.svg`, import.meta.url), svg);
}
console.log(`${products.length} placeholders gerados.`);
