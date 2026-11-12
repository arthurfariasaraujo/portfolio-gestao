// Verificação das regras de validação do checkout. Rode: npm test
import assert from "node:assert/strict";
import * as v from "../js/validators.js";

const NOW = new Date(2026, 9, 30); // 30/10/2026

// máscaras
assert.equal(v.formatCardNumber("41111111111111119999"), "4111 1111 1111 1111");
assert.equal(v.formatCardNumber("4111"), "4111");
assert.equal(v.formatCep("58000123"), "58000-123");
assert.equal(v.formatExpiry("1230"), "12/30");
assert.equal(v.formatCvv("12a3456"), "1234");

// Luhn e cartão
assert.ok(v.luhnCheck("4111111111111111"));
assert.ok(!v.luhnCheck("4111111111111112"));
assert.equal(v.validateCardNumber("4111 1111 1111 1111"), null);
assert.ok(v.validateCardNumber("4111 1111 1111 1112"));
assert.ok(v.validateCardNumber("1234"));

// validade: vale até o fim do mês
assert.equal(v.validateExpiry("10/26", NOW), null);
assert.equal(v.validateExpiry("09/26", NOW), "Cartão vencido.");
assert.equal(v.validateExpiry("12/25", NOW), "Cartão vencido.");
assert.equal(v.validateExpiry("01/27", NOW), null);
assert.equal(v.validateExpiry("13/30", NOW), "Mês inválido.");
assert.equal(v.validateExpiry("00/30", NOW), "Mês inválido.");
assert.ok(v.validateExpiry("1/30", NOW));

// demais campos
assert.equal(v.validateName("Maria Silva"), null);
assert.ok(v.validateName("Maria"));
assert.ok(v.validateName("  "));
assert.equal(v.validateEmail("a@b.com"), null);
assert.ok(v.validateEmail("a@b"));
assert.ok(v.validateEmail("a b@c.com"));
assert.equal(v.validateCep("58000-123"), null);
assert.ok(v.validateCep("58000"));
assert.equal(v.validateCvv("123"), null);
assert.ok(v.validateCvv("12"));

// formulário completo
const ok = { nome: "Maria Silva", email: "m@x.com", endereco: "Rua A, 10, Centro", cidade: "João Pessoa", cep: "58000-000", cartao: "4111 1111 1111 1111", validade: "12/30", cvv: "123" };
assert.deepEqual(v.validateCheckout(ok, NOW), {});
assert.deepEqual(Object.keys(v.validateCheckout({}, NOW)), Object.keys(v.FIELDS));
assert.deepEqual(Object.keys(v.validateCheckout({ ...ok, cvv: "1" }, NOW)), ["cvv"]);
console.log("Etapa 4: validadores verificados.");
