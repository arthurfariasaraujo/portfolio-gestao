// Leitura/escrita segura de JSON no localStorage (compartilhada por carrinho e favoritos).
export function readJson(key, storage = globalThis.localStorage) {
  try {
    const text = storage.getItem(key);
    return text === null ? null : JSON.parse(text);
  } catch {
    return null; // JSON corrompido ou storage indisponível
  }
}

export function writeJson(key, value, storage = globalThis.localStorage) {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false; // modo privado ou cota cheia: o app segue sem persistir
  }
}
