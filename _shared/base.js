/* ==========================================================================
   BASE ENGINE — interatividade compartilhada entre todas as landing pages.
   Não depende de nenhuma biblioteca além do Lucide (ícones), carregado via CDN.
   ========================================================================== */
(function () {
  "use strict";

  document.addEventListener("DOMContentLoaded", function () {
    initIcons();
    initHeaderScroll();
    initMobileNav();
    initAccordion();
    initScrollReveal();
    initSmoothAnchors();
    initYear();
    initCounters();
    initBeforeAfter();
    initContactForm();
  });

  function initIcons() {
    if (window.lucide) window.lucide.createIcons();
  }

  function initHeaderScroll() {
    var header = document.querySelector(".header");
    if (!header) return;
    var toggle = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    toggle();
    window.addEventListener("scroll", toggle, { passive: true });
  }

  function initMobileNav() {
    var toggle = document.querySelector(".nav__toggle");
    var links = document.querySelector(".nav__links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      var isOpen = links.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });
    links.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        links.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  function initAccordion() {
    document.querySelectorAll(".accordion__item").forEach(function (item) {
      var trigger = item.querySelector(".accordion__trigger");
      var panel = item.querySelector(".accordion__panel");
      if (!trigger || !panel) return;
      trigger.addEventListener("click", function () {
        var isOpen = item.getAttribute("data-open") === "true";
        document.querySelectorAll(".accordion__item").forEach(function (other) {
          other.setAttribute("data-open", "false");
          other.querySelector(".accordion__trigger").setAttribute("aria-expanded", "false");
          other.querySelector(".accordion__panel").style.maxHeight = null;
        });
        if (!isOpen) {
          item.setAttribute("data-open", "true");
          trigger.setAttribute("aria-expanded", "true");
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });
    });
  }

  function initScrollReveal() {
    var items = document.querySelectorAll(".reveal");
    if (!items.length) return;
    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("in-view"); });
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    items.forEach(function (el) { observer.observe(el); });
  }

  function initSmoothAnchors() {
    var header = document.querySelector(".header");
    var offset = header ? header.offsetHeight + 12 : 0;
    document.querySelectorAll('a[href^="#"]').forEach(function (link) {
      link.addEventListener("click", function (e) {
        var id = link.getAttribute("href");
        if (!id || id === "#") return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: "smooth" });
      });
    });
  }

  function initYear() {
    document.querySelectorAll("[data-year]").forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  function initCounters() {
    var counters = document.querySelectorAll("[data-counter]");
    if (!counters.length) return;
    var animate = function (el) {
      var target = parseFloat(el.getAttribute("data-counter"));
      var suffix = el.getAttribute("data-counter-suffix") || "";
      var duration = 1400;
      var start = null;
      var step = function (ts) {
        if (!start) start = ts;
        var progress = Math.min((ts - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.round(target * eased * 10) / 10;
        el.textContent = (Number.isInteger(target) ? Math.round(value) : value.toFixed(1)) + suffix;
        if (progress < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animate);
      return;
    }
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animate(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    counters.forEach(function (el) { observer.observe(el); });
  }

  /* Slider "antes e depois" genérico — usado por nichos como barbearia/odonto. */
  function initBeforeAfter() {
    document.querySelectorAll(".before-after").forEach(function (widget) {
      var range = widget.querySelector("input[type='range']");
      var after = widget.querySelector(".before-after__after");
      if (!range || !after) return;
      var update = function () {
        after.style.clipPath = "inset(0 " + (100 - range.value) + "% 0 0)";
        widget.style.setProperty("--handle-pos", range.value + "%");
      };
      range.addEventListener("input", update);
      update();
    });
  }

  /* Formulário de contato sem backend — monta um link wa.me com os campos preenchidos. */
  function initContactForm() {
    document.querySelectorAll("[data-wa-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var phone = form.getAttribute("data-wa-phone");
        var lines = [];
        form.querySelectorAll(".form-field").forEach(function (field) {
          var label = field.querySelector("label");
          var input = field.querySelector("input, textarea, select");
          if (label && input && input.value) lines.push(label.textContent + ": " + input.value);
        });
        var text = encodeURIComponent(lines.join("\n"));
        window.open("https://wa.me/" + phone + "?text=" + text, "_blank", "noopener");
      });
    });
  }
})();
