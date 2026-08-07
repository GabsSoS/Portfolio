/* ==========================================================================
   HOME — utilidades sem GSAP. Tudo que já é resolvido por _shared/base.js
   (menu mobile, header no scroll, accordion, âncoras suaves, ano no
   footer, contadores) continua vindo de lá. Toda a coreografia de entrada,
   os scroll-reveals, o hover dos cards e os botões magnéticos ficam em
   home-motion.js (GSAP) — este arquivo só cuida do que não depende dele:
   link ativo do menu e a barra de progresso de leitura.
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initActiveNavLink();
    initScrollProgress();
  });

  function initActiveNavLink() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav__links a[href^="#"]'));
    if (!links.length || !("IntersectionObserver" in window)) return;

    var sections = links
      .map(function (link) { return document.querySelector(link.getAttribute("href")); })
      .filter(Boolean);
    if (!sections.length) return;

    var setActive = function (id) {
      links.forEach(function (link) {
        var isActive = link.getAttribute("href") === "#" + id;
        link.classList.toggle("is-active", isActive);
        if (isActive) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
      document.dispatchEvent(new CustomEvent("home:sectionchange", { detail: { id: id } }));
    };

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sections.forEach(function (section) { observer.observe(section); });
  }

  /* Traço fino no topo indicando o quanto da página já foi lida. */
  function initScrollProgress() {
    var bar = document.querySelector(".scroll-progress");
    if (!bar) return;
    var ticking = false;
    var update = function () {
      var doc = document.documentElement;
      var max = doc.scrollHeight - doc.clientHeight;
      var ratio = max > 0 ? doc.scrollTop / max : 0;
      bar.style.transform = "scaleX(" + ratio + ")";
      ticking = false;
    };
    update();
    window.addEventListener("scroll", function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
  }
})();
