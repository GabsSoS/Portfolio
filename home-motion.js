/* ==========================================================================
   HOME — coreografia de entrada e transições (GSAP + ScrollTrigger).
   Só existe para animar; nenhuma lógica de layout/interação essencial
   depende deste arquivo (ver home.js e _shared/base.js). Se o CDN do
   GSAP falhar, ou se o visitante pedir prefers-reduced-motion, a classe
   .js-motion nunca é adicionada (ver <head>) ou é removida abaixo — e o
   CSS de home.css já garante que tudo fica visível/estático por padrão.
   ========================================================================== */
(function () {
  "use strict";

  var root = document.documentElement;
  if (!root.classList.contains("js-motion")) return; // reduced-motion: nada a fazer
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") {
    root.classList.remove("js-motion"); // CDN falhou: volta ao estado 100% visível
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  var hasFinePointer = window.matchMedia("(pointer: fine)").matches;

  buildHeroTimeline();
  setupScrollReveals();
  setupProjectCards();
  setupProcess();
  setupNavIndicator();
  if (hasFinePointer) {
    setupMagneticButtons();
  }

  /* 1) HERO — entrada coreografada, não "tudo aparece junto":
     estrutura → contexto (topbar) → headline linha a linha → palavra
     muda de estado → texto de apoio → nav estabiliza. */
  function buildHeroTimeline() {
    var flip = document.querySelector(".hero__headline .flip");
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.to(".hero__topbar", { opacity: 1, duration: 0.5 }, 0.1)
      .to(".line-mask .line-inner", { y: "0%", duration: 0.9, stagger: 0.14 }, 0.3)
      .add(function () { if (flip) flip.classList.add("is-flipped"); }, "+=0.05")
      .to('.hero__subtitle[data-reveal="fade"], .hero__actions[data-reveal="fade"]',
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }, "-=0.45")
      .to(".header", { opacity: 1, duration: 0.5 }, "-=0.35");
  }

  /* 2) Sobre / serviços / processo / CTA — cada [data-reveal] entra sozinho
     quando cruza a viewport (once). Técnica varia por tipo (fade / slide /
     scale / clip / clip-x) conforme a marcação em cada seção do HTML —
     evita que tudo use o mesmo fade-up. Os projetos têm função própria
     (setupProjectCards), com um leve efeito cascata por linha da grade. */
  function setupScrollReveals() {
    var items = document.querySelectorAll(
      "main > section:not(.hero):not(#projetos) [data-reveal]"
    );
    items.forEach(function (el) {
      gsap.to(el, revealVars(el, { trigger: el, start: "top 87%", once: true }));
    });
  }

  function revealVars(el, scrollTrigger) {
    var type = el.getAttribute("data-reveal");
    var vars = { duration: 0.8, ease: "power3.out", scrollTrigger: scrollTrigger };
    if (type === "clip" || type === "clip-x") vars.clipPath = "inset(0% 0% 0% 0%)";
    else if (type === "fade") { vars.opacity = 1; vars.y = 0; }
    else if (type === "slide") { vars.opacity = 1; vars.x = 0; }
    else if (type === "scale") { vars.opacity = 1; vars.scale = 1; }
    return vars;
  }

  /* 3) Projetos — agrupados por segmento, mas todos os 10 cartões são
     idênticos entre si. A entrada usa a posição do cartão dentro da sua
     própria grade (coluna) para um pequeno atraso em onda, da esquerda
     para a direita, linha por linha — recalculada por grupo, já que cada
     segmento tem sua própria grade. Os rótulos dos grupos entram junto.

     Hover: a borda, o título, a seta e o zoom do preview já reagem por
     CSS (funcionam mesmo sem GSAP). O GSAP acrescenta duas coisas que só
     fazem sentido com JS: a elevação (suave, sem quique) e uma leve
     inclinação 3D que segue o cursor — dá a sensação de estar tocando o
     cartão, não só vendo um efeito acontecer nele. */
  function setupProjectCards() {
    document.querySelectorAll(".project-group__label[data-reveal]").forEach(function (label) {
      gsap.to(label, revealVars(label, { trigger: label, start: "top 90%", once: true }));
    });

    document.querySelectorAll(".projects__grid").forEach(function (grid) {
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".project-card"));
      var columns = window.innerWidth >= 980 ? 3 : window.innerWidth >= 640 ? 2 : 1;

      cards.forEach(function (card, i) {
        var delay = (i % columns) * 0.08;
        card.querySelectorAll("[data-reveal]").forEach(function (el) {
          var vars = revealVars(el, { trigger: card, start: "top 88%", once: true });
          vars.delay = delay;
          gsap.to(el, vars);
        });

        if (!hasFinePointer) return;
        setupCardHoverTilt(card);
      });
    });
  }

  function setupCardHoverTilt(card) {
    gsap.set(card, { transformPerspective: 900 });
    var lift = gsap.to(card, { y: -6, scale: 1.015, duration: 0.85, ease: "power3.out", paused: true });
    var rxTo = gsap.quickTo(card, "rotateX", { duration: 0.7, ease: "power3.out" });
    var ryTo = gsap.quickTo(card, "rotateY", { duration: 0.7, ease: "power3.out" });

    card.addEventListener("mouseenter", function () { lift.play(); });
    card.addEventListener("mouseleave", function () {
      lift.reverse();
      rxTo(0);
      ryTo(0);
    });
    card.addEventListener("mousemove", function (e) {
      var rect = card.getBoundingClientRect();
      var relX = (e.clientX - rect.left) / rect.width - 0.5;
      var relY = (e.clientY - rect.top) / rect.height - 0.5;
      ryTo(relX * 5);
      rxTo(relY * -5);
    });
  }

  /* 4) Processo — a linha se desenha proporcionalmente ao scroll (scrub);
     cada etapa acende seu marcador ao ser alcançada. */
  function setupProcess() {
    var section = document.querySelector(".process");
    var fill = document.querySelector(".process__line-fill");
    if (!section || !fill) return;

    gsap.to(fill, {
      height: "100%",
      ease: "none",
      scrollTrigger: { trigger: section, start: "top 70%", end: "bottom 65%", scrub: 0.4 },
    });

    document.querySelectorAll(".process-step").forEach(function (step) {
      ScrollTrigger.create({
        trigger: step,
        start: "top 68%",
        once: true,
        onEnter: function () { step.classList.add("is-active"); },
      });
    });
  }

  /* 5) Indicador de seção ativa — desliza sob o link do menu conforme o
     visitante rola a página (home.js dispara o evento; aqui só a
     transição). Só existe na navbar de desktop (ver home.css). */
  function setupNavIndicator() {
    var nav = document.querySelector(".nav__links");
    var indicator = document.querySelector(".nav__indicator");
    if (!nav || !indicator) return;

    document.addEventListener("home:sectionchange", function (e) {
      var link = nav.querySelector('a[href="#' + e.detail.id + '"]');
      if (!link) return;
      var linkBox = link.getBoundingClientRect();
      var navBox = nav.getBoundingClientRect();
      gsap.to(indicator, {
        x: linkBox.left - navBox.left,
        width: linkBox.width,
        duration: 0.5,
        ease: "power3.out",
      });
    });
  }

  /* 6) Botões magnéticos — deslocam-se em direção ao cursor com uma
     interpolação mais suave (quickTo) do que um transform direto. */
  function setupMagneticButtons() {
    var buttons = document.querySelectorAll(".magnetic");
    if (!buttons.length) return;
    var strength = 0.3;
    var maxOffset = 10;

    buttons.forEach(function (btn) {
      var xTo = gsap.quickTo(btn, "x", { duration: 0.4, ease: "power3.out" });
      var yTo = gsap.quickTo(btn, "y", { duration: 0.4, ease: "power3.out" });
      btn.addEventListener("pointermove", function (e) {
        var rect = btn.getBoundingClientRect();
        var dx = e.clientX - (rect.left + rect.width / 2);
        var dy = e.clientY - (rect.top + rect.height / 2);
        xTo(Math.max(-maxOffset, Math.min(maxOffset, dx * strength)));
        yTo(Math.max(-maxOffset, Math.min(maxOffset, dy * strength)));
      });
      btn.addEventListener("pointerleave", function () { xTo(0); yTo(0); });
    });
  }
})();
