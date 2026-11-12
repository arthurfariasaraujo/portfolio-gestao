# ARQUESPORTS

Loja virtual esportiva feita com **HTML, CSS e JavaScript puro** (ES Modules), sem frameworks nem bibliotecas em tempo de execução.
Projeto acadêmico de Ciências da Computação, evoluído para portfólio.

> **Aviso:** o checkout é **demonstrativo**. Nenhuma cobrança é feita e nenhum dado do formulário é enviado ou salvo.
> Para testar, use o cartão `4111 1111 1111 1111`, qualquer validade futura e qualquer CVV.

## Como executar

Os ES Modules não funcionam com duplo clique (`file://`). Sirva a pasta por HTTP:

- **VS Code:** abra a pasta do projeto (a que contém `index.html`), botão direito em `index.html` → *Open with Live Server*
- **Terminal:** `python -m http.server 8000` dentro desta pasta e abra http://localhost:8000

## Funcionalidades

- Catálogo renderizado por JavaScript a partir de uma única fonte de dados
- Busca (nome, marca e descrição, sem diferenciar acentos), filtros por categoria, público e faixa de preço, ordenação
- Favoritos com filtro "somente favoritos"
- Modal de detalhes do produto
- Carrinho em gaveta: adicionar, remover, alterar quantidade, subtotal, frete (grátis a partir de R$ 299,00) e total
- Carrinho e favoritos persistem no `localStorage`
- Checkout com máscaras, validação (Luhn, validade real), erros acessíveis e confirmação demonstrativa
- Menu de navegação e slider de destaques acessíveis por teclado e toque
- Estados de lista vazia, erro e carrinho vazio

## Estrutura

```
index.html, checkout.html
css/   tokens.css (design tokens) · base.css · components.css · header.css · hero.css · checkout.css
js/
  data/products.js      fonte única dos produtos (preços em centavos)
  cart.js favorites.js catalog.js validators.js format.js storage.js    lógica, sem DOM
  ui/render.js cart-drawer.js menu.js hero.js                           construção da interface
  main.js checkout.js                                                   estado e eventos de cada página
assets/ favicon.svg · img/ (placeholders SVG, um por produto)
scripts/ gerar-placeholders.mjs · verificar-*.mjs
```

## Decisões técnicas

- **Preços em centavos (inteiros):** evita erros de ponto flutuante. A formatação em reais é feita só na exibição (`Intl.NumberFormat`).
- **O carrinho guarda só `{ id, quantity }`:** nome e preço são lidos do catálogo, então não há dado duplicado para ficar desatualizado.
- **Funções puras e imutáveis** para carrinho, catálogo, favoritos e validação: testáveis em Node, sem navegador.
- **Interface = função do estado:** eventos atualizam o estado e a tela é redesenhada a partir dele.
- **Sem `innerHTML`:** elementos são criados com `createElement` + `textContent`, então nenhum dado é interpretado como HTML.
- **`<dialog>` nativo** para carrinho e detalhes (foco preso, Esc, fundo inerte).
- **Design tokens em CSS variables:** nenhuma cor fixa fora de `tokens.css`; o contraste (WCAG AA) é calculado em teste.
- **`localStorage` é tratado como entrada não confiável:** os dados são validados ao ler.

## Testes

Precisa de Node 18+.

| Comando | O que verifica |
|---|---|
| `npm test` | Carrinho, catálogo, favoritos, validadores, contraste das cores e auditoria estática (links, imports, padrões proibidos, variáveis CSS) |
| `npm install` + `npm run test:dom` | Fluxos de tela em DOM simulado (jsdom): carrinho, favoritos, detalhes, menu, slider e checkout |
| `npm run placeholders` | Regera as imagens SVG a partir de `js/data/products.js` |

## Fotos reais dos produtos

Salve uma foto por produto em `assets/img/fotos/` (nome do arquivo = id do produto) e rode `npm run fotos`. As instruções e sugestões de busca estão em `assets/img/fotos/LEIA-ME.md`.

## Limitações conhecidas

- Imagens são placeholders locais; fotos reais entram trocando o campo `image` em `products.js`.
- Não há back-end: catálogo, pedidos e pagamento são simulados.
- Não foi testado com leitor de tela real nem em dispositivos físicos.
- Os testes de DOM usam jsdom, que não renderiza CSS nem implementa `<dialog>` por completo.

## Melhorias futuras

- Fotos reais otimizadas (WebP/AVIF, `srcset`)
- Estado dos filtros na URL (links compartilháveis) e página própria por produto
- Paginação ou "carregar mais" e debounce na busca se o catálogo crescer
- Back-end com API de produtos e pedidos; pagamento real via gateway
- Testes end-to-end em navegador real (Playwright) e auditoria Lighthouse no CI
- Tema claro, internacionalização e cálculo de frete por CEP
