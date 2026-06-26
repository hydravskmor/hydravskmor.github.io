/* ============================================================
   HydraStore — interactions
   ============================================================ */
(function () {
  "use strict";

  /* -------- CONFIG: troque pelo seu contato real -------- */
  const WHATSAPP = "5541995168492";            // número com DDI+DDD (sem símbolos)

  const BRL = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const fmtCoins = new Intl.NumberFormat("pt-BR");

  // respeita usuários que pedem menos movimento (vale também pro JS)
  const REDUCE_MOTION = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // avisa no console se o contato estiver fora do formato esperado
  if (!/^\d{12,13}$/.test(WHATSAPP)) {
    console.warn("[HydraStore] Configure WHATSAPP em script.js com DDI+DDD+número, usando só dígitos.");
  }

  /* limites do pedido: a partir de 25 TC, de 25 em 25 */
  const MIN_COINS = 25;
  const MAX_COINS = 15000;
  const STEP_COINS = 25;

  /* preço FIXO e linear: R$ 55 a cada 250 Tibia Coins, sem desconto por volume */
  const RATE = 55 / 250; // R$ 0,22 por coin

  /* -------- catálogo de pacotes (preço = coins * RATE) -------- */
  const PACKAGES = [
    { name: "Pacote Aprendiz",        coins: 250,   price: 55.00,   save: "", popular: false, desc: "O ponto de partida ideal pra renovar o Premium ou dar aquele upgrade rápido." },
    { name: "Pacote Caçador",         coins: 500,   price: 110.00,  save: "", popular: false, desc: "Coins suficientes pra um monte de outfits, addons e mounts essenciais." },
    { name: "Pacote Guerreiro",       coins: 1000,  price: 220.00,  save: "", popular: true,  desc: "Pra quem joga sério: Premium estendido, XP boosts e bagagem na mochila." },
    { name: "Pacote Cavaleiro Real",  coins: 3000,  price: 660.00,  save: "", popular: false, desc: "Estoque de Coins pra temporadas inteiras de hunt, train e mercado." },
    { name: "Pacote Lorde Dragão",    coins: 9000,  price: 1980.00, save: "", popular: false, desc: "Para guildas e investidores: estoque alto pra qualquer projeto." },
    { name: "Pacote Senhor da Hydra", coins: 27500, price: 6050.00, save: "", popular: false, desc: "O baú definitivo. Estoque máximo e prioridade total na entrega." },
  ];

  /* preço de qualquer quantidade: linear, sem desconto */
  function priceFor(coins) { return coins * RATE; }

  function waLink(message) {
    return "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(message);
  }

  /* frases de "nível de poder" do slider (ordenadas por minCoins crescente) */
  const PHRASES = [
    { minCoins: 25,    emoji: "🐀", text: "Recém-saído de Rookgaard, caçando rats. Todo herói começa do zero!" },
    { minCoins: 250,   emoji: "⚔️", text: "Premium e vocação escolhida! Knight, Paladin, Druid ou Sorcerer?" },
    { minCoins: 500,   emoji: "🚀", text: "Garantindo o boost, né? Nós entendemos 😏" },
    { minCoins: 1000,  emoji: "🪓", text: "Encarando Trolls, Rotworms e Minotaurs. Bem-vindo ao continente!" },
    { minCoins: 1500,  emoji: "👁️", text: "Cyclopolis e Dwarf Mines liberadas. Primeiro dinheiro de verdade!" },
    { minCoins: 2000,  emoji: "🎭", text: "Aquele outfit que você sempre quis pode ser seu agora..." },
    { minCoins: 3000,  emoji: "💀", text: "Larvas e Scarabs em Ankrahmun. As tumbas do deserto te respeitam." },
    { minCoins: 4000,  emoji: "🐍", text: "Deeper Banuta e suas Hydras! Subiu de patamar e encara veneno pesado." },
    { minCoins: 5000,  emoji: "🎯", text: "Com essas coins, cairia bem treinar um skillzinho, hein?" },
    { minCoins: 6500,  emoji: "🐉", text: "Dragon Lords em Draconia caindo. Agora sim você é forte!" },
    { minCoins: 8000,  emoji: "😈", text: "Demons na Hero Cave! Entrada oficial no high level. Dano real!" },
    { minCoins: 9500,  emoji: "⏫", text: "Já se adianta pro Double XP e compra mais um pouquinho, que tal?" },
    { minCoins: 11000, emoji: "🌑", text: "Roshamuul domado. Frazzlemaws e Silencers são farm de XP pra você." },
    { minCoins: 12500, emoji: "🐲", text: "Cobra e Falcon Set no corpo! Equipamento de elite, poder de verdade." },
    { minCoins: 13500, emoji: "⚡", text: "Soul War vencida! Goshnar caiu e a Soulcutter é sua. End-game puro." },
    { minCoins: 15000, emoji: "👑", text: "Ferumbras, Ghazbaran e Morgaroth no chão! O REI SUPREMO do Tibia. Curvem-se, mortais!" },
  ];
  function pickPhrase(coins) {
    var chosen = PHRASES[0];
    for (var i = 0; i < PHRASES.length; i++) { if (coins >= PHRASES[i].minCoins) chosen = PHRASES[i]; }
    return chosen;
  }

  /* -------- render dos pacotes -------- */
  function renderPackages() {
    const wrap = document.getElementById("packages");
    if (!wrap) return;
    wrap.innerHTML = PACKAGES.map(function (p) {
      const unit = (p.price / p.coins);
      const msg = "Olá! Quero comprar o " + p.name + " (" + fmtCoins.format(p.coins) +
                  " Tibia Coins) por " + BRL.format(p.price) + ". Como faço o pagamento via PIX?";
      return (
        '<article class="pkg' + (p.popular ? " pkg--popular" : "") + ' reveal">' +
          (p.popular ? '<span class="pkg__tag">⭐ Mais Popular</span>' : "") +
          (p.save ? '<span class="pkg__bonus">' + p.save + "</span>" : "") +
          '<div class="pkg__head">' +
            '<span class="pkg__coin"><img class="coinimg" src="assets/tibia-coin-icon.gif" alt="" width="12" height="12"></span>' +
            '<span class="pkg__name">' + p.name + "</span>" +
          "</div>" +
          '<div class="pkg__amount">' + fmtCoins.format(p.coins) + ' <span>coins</span></div>' +
          '<p class="pkg__desc">' + p.desc + "</p>" +
          '<div class="pkg__pricerow">' +
            '<span class="pkg__price">' + BRL.format(p.price) + "</span>" +
            '<span class="pkg__unit">R$ ' + unit.toFixed(3).replace(".", ",") + "/coin</span>" +
          "</div>" +
          '<p class="pkg__pix">⚡ no PIX, entrega imediata</p>' +
          '<a class="btn btn--gold pkg__btn' + (p.popular ? " cta-pulse" : "") + '" target="_blank" rel="noopener" href="' + waLink(msg) + '">Comprar agora</a>' +
        "</article>"
      );
    }).join("");
    observeReveals(wrap.querySelectorAll(".reveal"));
  }

  /* -------- calculadora -------- */
  function setupCalculator() {
    const input = document.getElementById("calcInput");
    const range = document.getElementById("calcRange");
    const rateEl = document.getElementById("calcRate");
    const totalEl = document.getElementById("calcTotal");
    const buyEl = document.getElementById("calcBuy");
    const card = document.getElementById("calc");
    const quoteEl = document.getElementById("calcQuote");
    let lastQuote = "";
    if (!input || !range) return;
    if (card && REDUCE_MOTION) card.classList.add("no-fx");

    function clamp(coins) {
      coins = Math.round(coins / STEP_COINS) * STEP_COINS;
      return Math.min(MAX_COINS, Math.max(MIN_COINS, coins));
    }

    // syncUi=true reflete o valor normalizado de volta nos controles (usado
    // fora da digitação livre, pra não atrapalhar quem está digitando).
    function update(rawCoins, syncUi) {
      const coins = clamp(rawCoins);
      const total = priceFor(coins);
      const rate = total / coins;
      rateEl.textContent = "R$ " + rate.toFixed(3).replace(".", ",");
      totalEl.textContent = BRL.format(total);
      range.value = coins;
      range.setAttribute("aria-valuetext", fmtCoins.format(coins) + " coins, " + BRL.format(total));
      if (syncUi) input.value = coins;
      const msg = "Olá! Quero comprar " + fmtCoins.format(coins) +
                  " Tibia Coins (" + BRL.format(total) + ") na HydraStore. Como pago via PIX?";
      buyEl.href = waLink(msg);
      buyEl.target = "_blank";
      buyEl.rel = "noopener";

      // carga de energia (0..1) + frase de "nível de poder"
      let charge = (coins - MIN_COINS) / (MAX_COINS - MIN_COINS);
      charge = Math.max(0, Math.min(1, charge));
      if (card) {
        card.style.setProperty("--charge", charge.toFixed(3));
        card.style.setProperty("--flick", (2.6 - 1.9 * charge).toFixed(2) + "s");
      }
      if (quoteEl) {
        const ph = pickPhrase(coins);
        const line = ph.emoji + "  " + ph.text;
        if (line !== lastQuote) {
          lastQuote = line;
          quoteEl.textContent = line;
          if (!REDUCE_MOTION) {
            quoteEl.classList.remove("pop");
            void quoteEl.offsetWidth; // reinicia a animação
            quoteEl.classList.add("pop");
          }
        }
      }
    }

    input.addEventListener("input", function () {
      const v = parseInt(input.value, 10);
      if (!Number.isNaN(v)) update(v, false);
    });
    input.addEventListener("change", function () {
      const v = parseInt(input.value, 10);
      update(Number.isNaN(v) ? MIN_COINS : v, true);
    });
    // arraste: coalesce as atualizações em 1 por frame (suaviza no mobile)
    let rafQueued = false, rafVal = MIN_COINS;
    range.addEventListener("input", function () {
      rafVal = parseInt(range.value, 10);
      if (!rafQueued) {
        rafQueued = true;
        requestAnimationFrame(function () { rafQueued = false; update(rafVal, true); });
      }
    });
    document.querySelectorAll(".calc__quick button").forEach(function (b) {
      b.addEventListener("click", function () {
        update(parseInt(b.dataset.q, 10), true);
      });
    });
    update(parseInt(input.value, 10) || MIN_COINS, true);
  }

  /* -------- menu mobile -------- */
  function setupMenu() {
    const burger = document.getElementById("burger");
    const menu = document.getElementById("navMobile");
    if (!burger || !menu) return;
    function setState(open) {
      menu.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      burger.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    }
    burger.addEventListener("click", function () {
      setState(!menu.classList.contains("open"));
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setState(false); });
    });
  }

  /* -------- links de contato (WhatsApp) -------- */
  function wireContacts() {
    const msgs = {
      comprar: "Olá! Quero comprar Tibia Coins na HydraStore. 🐉",
      suporte: "Olá! Preciso de ajuda com a HydraStore.",
      vender: "Olá! Quero vender minhas Tibia Coins na HydraStore.",
    };
    document.querySelectorAll("[data-whats]").forEach(function (el) {
      el.setAttribute("href", waLink(msgs[el.dataset.whats] || msgs.comprar));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
    });
  }

  /* -------- contador animado -------- */
  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    if (isNaN(target)) return;
    if (REDUCE_MOTION) { el.textContent = fmtCoins.format(target) + "+"; return; }
    const dur = 1600;
    const start = performance.now();
    function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.floor(eased * target);
      el.textContent = val >= 1000 ? fmtCoins.format(val) + "+" : String(val);
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = fmtCoins.format(target) + "+";
    }
    requestAnimationFrame(tick);
  }

  /* -------- reveal on scroll -------- */
  let revealObserver;
  function observeReveals(nodes) {
    if (!("IntersectionObserver" in window)) {
      nodes.forEach(function (n) { n.classList.add("in"); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            if (e.target.dataset.count) animateCount(e.target);
            revealObserver.unobserve(e.target);
          }
        });
      }, { threshold: 0.15 });
    }
    nodes.forEach(function (n) { revealObserver.observe(n); });
  }

  function setupReveals() {
    const sel = ".section__head, .vcard, .step, .tcard, .calc, .sell, .faq__item, .stat__num[data-count], .finalcta__inner";
    document.querySelectorAll(sel).forEach(function (n) {
      if (!n.dataset.count) n.classList.add("reveal");
    });
    observeReveals(document.querySelectorAll(".reveal, .stat__num[data-count]"));
  }

  /* -------- ticker de pedidos recentes (prova social) -------- */
  function setupTicker() {
    const el = document.getElementById("ticker");
    if (!el || REDUCE_MOTION) return; // sem movimento automático se o usuário pediu
    const names = ["Rafael", "Juliana", "Pedrão", "Carla", "Lucas", "Mariana", "Diego", "Bruna", "Thiago", "Camila"];
    const worlds = ["Monza", "Antica", "Yonabra", "Belobra", "Vunira", "Pacera"];
    const amounts = [250, 500, 750, 1000, 1500, 3000, 5000, 9000];
    let i = 0;

    function show() {
      const n = names[(i * 3) % names.length];
      const w = worlds[(i * 2) % worlds.length];
      const a = amounts[(i * 5) % amounts.length];
      const mins = 1 + ((i * 7) % 28);
      el.innerHTML =
        '<img class="ticker__coin coinimg" src="assets/tibia-coin-icon.gif" alt="" width="12" height="12">' +
        '<span><strong>' + n + "</strong> comprou <em>" + fmtCoins.format(a) +
        " coins</em><br>" + w + " · há " + mins + " min</span>";
      el.classList.add("show");
      i++;
      setTimeout(function () { el.classList.remove("show"); }, 5000);
    }

    setTimeout(function loop() {
      show();
      setTimeout(loop, 9000);
    }, 3500);
  }

  /* -------- init -------- */
  /* -------- abas: Comprar / Comprar Pacotes -------- */
  function setupTabs() {
    const tabs = document.querySelectorAll(".tab[data-panel]");
    if (!tabs.length) return;
    function activate(panelId) {
      tabs.forEach(function (t) {
        const on = t.dataset.panel === panelId;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      document.querySelectorAll(".tabpanel").forEach(function (p) {
        const show = p.id === panelId;
        p.hidden = !show;
        if (show) p.querySelectorAll(".reveal").forEach(function (n) { n.classList.add("in"); });
      });
    }
    tabs.forEach(function (t) {
      t.addEventListener("click", function () { activate(t.dataset.panel); });
    });
    document.querySelectorAll("[data-gotab]").forEach(function (el) {
      el.addEventListener("click", function (e) { e.preventDefault(); activate(el.dataset.gotab); });
    });
  }

  /* -------- scrollspy: ilumina o item do menu da seção atual -------- */
  function setupScrollSpy() {
    const ids = ["pacotes", "como-funciona", "faq", "contato"];
    const map = {};
    document.querySelectorAll(".nav__links a, .nav__mobile a, .link-soft").forEach(function (a) {
      const h = a.getAttribute("href") || "";
      if (h.charAt(0) === "#" && ids.indexOf(h.slice(1)) !== -1) {
        (map[h.slice(1)] = map[h.slice(1)] || []).push(a);
      }
    });
    const secs = ids.map(function (id) { return document.getElementById(id); }).filter(Boolean);
    if (!secs.length) return;
    function update() {
      let current = null;
      const y = window.scrollY;
      secs.forEach(function (s) { if (s.offsetTop - 110 <= y) current = s.id; });
      if (window.innerHeight + y >= document.documentElement.scrollHeight - 4) {
        current = secs[secs.length - 1].id; // perto do fim → última seção
      }
      document.querySelectorAll(".nav__links a.active, .nav__mobile a.active, .link-soft.active")
        .forEach(function (a) { a.classList.remove("active"); });
      if (current && map[current]) map[current].forEach(function (a) { a.classList.add("active"); });
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  document.addEventListener("DOMContentLoaded", function () {
    const y = document.getElementById("year");
    if (y) y.textContent = new Date().getFullYear();
    renderPackages();
    setupCalculator();
    setupMenu();
    wireContacts();
    setupReveals();
    setupTicker();
    setupTabs();
    setupScrollSpy();
  });
})();
