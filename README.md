# HydraStore 🐉

Landing page de **compra e venda de Tibia Coins**. Tema dark inspirado no Tibia
(verde da Hydra + dourado das coins), com calculadora de preço, pacotes,
prova social e CTAs que abrem direto no WhatsApp/Discord.

Site **100% estático** (HTML + CSS + JS puro, sem build). É só abrir o
`index.html` no navegador ou hospedar a pasta em qualquer lugar.

## Arquivos

| Arquivo | O que é |
|---|---|
| `index.html` | Estrutura da página (todas as seções) |
| `styles.css` | Estilo / tema Hydra (cores em variáveis CSS no topo) |
| `script.js` | Pacotes, calculadora, menu, ticker e links de contato |

## ⚙️ Configuração obrigatória antes de publicar

Abra **`script.js`** e troque os dois valores no topo pelos seus contatos reais:

```js
const WHATSAPP = "5599999999999";            // seu número: DDI+DDD+numero (só dígitos)
const DISCORD  = "https://discord.gg/hydrastore"; // seu convite do Discord
```

> Enquanto estiverem com os valores de exemplo, aparece um aviso no console do
> navegador. Todos os botões de comprar/vender/suporte usam esses dois valores.

## 💰 Editar pacotes e preços

Tudo fica no array `PACKAGES` em `script.js`:

```js
{ name: "Pacote Guerreiro", coins: 1000, price: 109.90, save: "Economize 8%", popular: true, desc: "..." }
```

- `coins` — quantidade de Tibia Coins
- `price` — preço em R$ (número, ex.: `109.90`)
- `save` — selo de economia (ex.: `"Economize 8%"`) ou `""` pra esconder
- `popular: true` — destaca o card como "Mais Popular" (só um deve ser `true`)

A **calculadora** usa o preço exato do pacote quando a quantidade bate com um
deles; para quantidades intermediárias, interpola pelas faixas em `tierRate()`.
Os limites do pedido são `MIN_COINS` e `MAX_COINS` (no topo do `script.js`).

## 🎨 Trocar cores

As cores estão em variáveis CSS no início do `styles.css` (`:root`). Ex.:

```css
--primary: #19A974;  /* verde Hydra */
--gold:    #E8B339;  /* dourado das coins */
--bg:      #0A0F0D;  /* fundo */
```

## 🚀 Publicar

Qualquer host estático serve. Exemplos:

- **Vercel:** `npm i -g vercel && vercel` (na pasta do projeto)
- **GitHub Pages / Netlify:** suba a pasta
- **Local:** `python3 -m http.server` e acesse `http://localhost:8000`

---

Tibia® é marca registrada da CipSoft GmbH. Esta é uma loja independente, sem
afiliação oficial com a CipSoft.
