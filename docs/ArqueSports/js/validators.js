// Regras de validação e máscaras do checkout. Funções puras: cada validador
// devolve uma mensagem de erro (string) ou null quando o valor é válido.

export const onlyDigits = (value) => value.replace(/\D/g, "");

/** Algoritmo de Luhn: detecta erros de digitação em números de cartão. */
export function luhnCheck(digits) {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (double) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}

/* ---------- Máscaras (formatam enquanto o usuário digita) ---------- */
export const formatCep = (v) => { const d = onlyDigits(v).slice(0, 8); return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d; };
export const formatCardNumber = (v) => onlyDigits(v).slice(0, 16).replace(/(.{4})(?=.)/g, "$1 ");
export const formatExpiry = (v) => { const d = onlyDigits(v).slice(0, 4); return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d; };
export const formatCvv = (v) => onlyDigits(v).slice(0, 4);

/* ---------- Validadores ---------- */
export function validateName(value) {
  const words = value.trim().split(/\s+/).filter((w) => w.length >= 2);
  return words.length >= 2 ? null : "Informe nome e sobrenome.";
}

export const validateEmail = (value) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim()) ? null : "Informe um e-mail válido, como nome@exemplo.com.";

export const validateAddress = (value) => (value.trim().length >= 5 ? null : "Informe rua, número e bairro.");
export const validateCity = (value) => (value.trim().length >= 2 ? null : "Informe a cidade.");
export const validateCep = (value) => (onlyDigits(value).length === 8 ? null : "O CEP deve ter 8 números.");

export function validateCardNumber(value) {
  const digits = onlyDigits(value);
  if (digits.length < 13 || digits.length > 16) return "O número do cartão deve ter entre 13 e 16 dígitos.";
  return luhnCheck(digits) ? null : "Número de cartão inválido. Confira os dígitos.";
}

/** O cartão vale até o ÚLTIMO dia do mês indicado. */
export function validateExpiry(value, now = new Date()) {
  const match = /^(\d{2})\/(\d{2})$/.exec(value.trim());
  if (!match) return "Use o formato MM/AA.";
  const month = Number(match[1]);
  const year = 2000 + Number(match[2]);
  if (month < 1 || month > 12) return "Mês inválido.";
  const expired = year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1);
  return expired ? "Cartão vencido." : null;
}

export const validateCvv = (value) => (/^\d{3,4}$/.test(value) ? null : "O CVV deve ter 3 ou 4 números.");

/** Fonte única: id do campo → validador. A ordem é a ordem do formulário. */
export const FIELDS = Object.freeze({
  nome: validateName,
  email: validateEmail,
  endereco: validateAddress,
  cidade: validateCity,
  cep: validateCep,
  cartao: validateCardNumber,
  validade: validateExpiry,
  cvv: validateCvv,
});

export const MASKS = Object.freeze({ cep: formatCep, cartao: formatCardNumber, validade: formatExpiry, cvv: formatCvv });

/** Valida tudo e devolve { campo: mensagem } só com os campos inválidos. */
export function validateCheckout(values, now = new Date()) {
  const errors = {};
  for (const [id, validate] of Object.entries(FIELDS)) {
    const message = validate(values[id] ?? "", now);
    if (message) errors[id] = message;
  }
  return errors;
}
