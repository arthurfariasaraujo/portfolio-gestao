// Calcula a razão de contraste WCAG dos pares de cores dos tokens. Rode: npm test
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../css/tokens.css", import.meta.url), "utf8");
const t = Object.fromEntries([...css.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((m) => [m[1], m[2]]));

const luminance = (hex) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a, b) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

// [texto, fundo, mínimo]: 4,5 para texto normal (WCAG AA)
const pairs = [
  ["color-text", "color-bg"], ["color-text", "color-surface"], ["color-text", "color-surface-raised"],
  ["color-text-muted", "color-bg"], ["color-text-muted", "color-surface"], ["color-text-muted", "color-surface-raised"],
  ["color-brand-text", "color-bg"], ["color-brand-text", "color-surface"], ["color-brand-text", "color-surface-raised"],
  ["color-danger", "color-surface"], ["color-danger", "color-surface-raised"],
  ["color-text", "color-brand"],
].map(([fg, bg]) => [t[fg], t[bg], `${fg} / ${bg}`]);
pairs.push(
  [t["color-white"], t["color-brand-hover"], "branco / botão azul (hover)"],
  [t["color-black"], t["color-white"], "selo Promoção"],
  [t["color-black"], t["color-tint"], "botão claro (hover)"],
);

let failed = 0;
for (const [fg, bg, name] of pairs) {
  const r = ratio(fg, bg);
  const ok = r >= 4.5;
  if (!ok) failed++;
  console.log(`${ok ? "ok  " : "FALHA"} ${r.toFixed(2).padStart(5)}:1  ${name}`);
}
assert.equal(failed, 0, `${failed} par(es) abaixo de 4,5:1`);
console.log("Etapa 5: contraste AA verificado.");
