/* ==========================================================================
   MOTION — coreografia exclusiva da página Barbearia Nobre.
   Não altera _shared/base.js. Roda por cima dele (icons, header scroll,
   accordion, reveal genérico e before-after já são cuidados por ele).
   Respeita prefers-reduced-motion: só anima se <html> tiver .js--motion,
   classe adicionada por um script inline no <head> antes do primeiro paint.
   Sem dependências externas — apenas transform/opacity, GPU-friendly.
   ========================================================================== */
(function () {
  "use strict";

  var motionOn = document.documentElement.classList.contains("js--motion");

  document.addEventListener("DOMContentLoaded", function () {
    try {
      splitWords(document.querySelector("[data-split-hero]"));
      initHeroTimeline();
      initScrollTitleSplit();
      initServicesPanel();
      initGalleryParallax();
      initCtaReveal();
      initMagneticCta();
    } catch (err) {
      document.documentElement.classList.remove("js--motion");
    }
  });

  /* Rede de segurança: se por qualquer motivo a coreografia não concluir
     (erro de script, observer que não dispara, timing), garante que todo
     o conteúdo fique visível — nunca deixa texto/nav preso em estado oculto. */
  window.addEventListener("load", function () {
    setTimeout(function () {
      document.querySelectorAll("[data-split-hero], [data-split-scroll], [data-hero-fade], [data-hero-media], [data-cta-media], .header").forEach(function (el) {
        el.classList.add("is-in");
      });
      document.documentElement.classList.remove("js--motion");
    }, 3200);
  });

  /* Quebra um heading em palavras/spans para permitir reveal em máscara.
     O espaço fica FORA dos spans (como texto normal) — colocá-lo dentro
     do inline-block é engolido pelo overflow:hidden e gruda as palavras. */
  function splitWords(el) {
    if (!el) return;
    var words = el.textContent.trim().split(/\s+/);
    el.innerHTML = words
      .map(function (w, i) {
        return '<span class="word" style="transition-delay:' + (i * 55) + 'ms"><span class="word__inner">' + w + "</span></span>";
      })
      .join(" ");
  }

  /* Hero: mídia revela por clip-path, título sobe em cascata, blocos
     seguintes entram em sequência, header estabiliza por último. */
  function initHeroTimeline() {
    if (!motionOn) return;
    var media = document.querySelector("[data-hero-media]");
    var title = document.querySelector("[data-split-hero]");
    var fades = document.querySelectorAll("[data-hero-fade]");
    var header = document.querySelector(".header");

    var steps = [
      [media, 120],
      [title, 380],
      [fades[0], 520],
      [fades[1], 620],
      [fades[2], 760],
      [fades[3], 900],
      [header, 300]
    ];
    steps.forEach(function (step) {
      var el = step[0];
      var delay = step[1];
      if (!el) return;
      setTimeout(function () {
        el.classList.add("is-in");
      }, delay);
    });
  }

  /* Título "Sobre": palavras sobem quando a seção entra na viewport. */
  function initScrollTitleSplit() {
    var el = document.querySelector("[data-split-scroll]");
    if (!el) return;
    splitWords(el);
    if (!motionOn || !("IntersectionObserver" in window)) {
      el.classList.add("is-in");
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
  }

  /* Serviços: hover/foco/toque troca a imagem do painel e destaca a linha. */
  function initServicesPanel() {
    var rows = document.querySelectorAll("[data-service-target]");
    if (!rows.length) return;

    var activate = function (row) {
      rows.forEach(function (r) { r.classList.remove("is-active"); });
      row.classList.add("is-active");
      var targetId = row.getAttribute("data-service-target");
      document.querySelectorAll(".services__media img").forEach(function (img) {
        img.classList.toggle("is-active", img.id === targetId);
      });
    };

    rows.forEach(function (row) {
      row.addEventListener("mouseenter", function () { activate(row); });
      row.addEventListener("focusin", function () { activate(row); });
      row.addEventListener("click", function (e) {
        if (e.target.closest(".service-row__link")) return;
        activate(row);
      });
      row.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activate(row);
        }
      });
    });
  }

  /* Galeria: parallax sutil por imagem, proporcional à posição no viewport. */
  function initGalleryParallax() {
    if (!motionOn || window.innerWidth < 700) return;
    var imgs = document.querySelectorAll(".gallery__grid img[data-speed]");
    if (!imgs.length) return;
    var ticking = false;

    var update = function () {
      var vh = window.innerHeight;
      imgs.forEach(function (img) {
        var rect = img.parentElement.getBoundingClientRect();
        var center = rect.top + rect.height / 2;
        var offset = (center - vh / 2) * parseFloat(img.getAttribute("data-speed"));
        img.style.transform = "scale(1.12) translateY(" + offset.toFixed(1) + "px)";
      });
      ticking = false;
    };
    var onScroll = function () {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  /* CTA final: a foto entra em escala quando a seção surge na viewport. */
  function initCtaReveal() {
    var media = document.querySelector("[data-cta-media]");
    if (!media) return;
    if (!motionOn || !("IntersectionObserver" in window)) {
      media.classList.add("is-in");
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    observer.observe(media);
  }

  /* Botão magnético — só no CTA principal do hero, só em desktop com mouse. */
  function initMagneticCta() {
    if (!motionOn) return;
    var btn = document.querySelector("[data-magnetic]");
    if (!btn) return;
    var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!canHover) return;

    btn.addEventListener("mousemove", function (e) {
      var rect = btn.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;
      btn.style.transition = "transform 0.1s linear";
      btn.style.transform = "translate(" + (x * 0.25).toFixed(1) + "px, " + (y * 0.25).toFixed(1) + "px)";
    });
    btn.addEventListener("mouseleave", function () {
      btn.style.transition = "transform 0.4s cubic-bezier(0.16,1,0.3,1)";
      btn.style.transform = "translate(0, 0)";
    });
  }
})();
