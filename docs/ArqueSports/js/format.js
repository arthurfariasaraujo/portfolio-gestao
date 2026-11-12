// Formatação de moeda. Intl.NumberFormat já cuida de vírgula, ponto e "R$".
const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** formatPrice(14990) → "R$ 149,90" */
export function formatPrice(cents) {
  if (!Number.isInteger(cents)) throw new TypeError("O preço deve ser um inteiro em centavos.");
  return brl.format(cents / 100);
}
