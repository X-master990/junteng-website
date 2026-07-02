/* ============================================================
   駿騰智能 — 互動（克制版）
   ============================================================ */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 導覽列：捲動出現底線 ---------- */
  var nav = document.getElementById("nav");
  function onScroll() {
    nav.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- 手機選單 ---------- */
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  function closeMenu() {
    links.classList.remove("open");
    toggle.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  }
  toggle.addEventListener("click", function () {
    var open = links.classList.toggle("open");
    toggle.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  links.addEventListener("click", function (e) {
    if (e.target.tagName === "A") closeMenu();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && links.classList.contains("open")) {
      closeMenu();
      toggle.focus();
    }
  });

  /* ---------- 動畫：GSAP 電影感開場與捲動，失效時退回 CSS ---------- */
  var htmlEl = document.documentElement;
  var useGsap = !!(window.gsap && window.ScrollTrigger && htmlEl.classList.contains("js-anim"));

  if (useGsap) {
    gsap.registerPlugin(ScrollTrigger);

    /* 開場時間軸：眉標 → 遮罩標題逐行升起 → 朱紅句號蓋章 → 導言與按鈕 → 總表浮現、資料列逐筆落定 */
    var intro = gsap.timeline({ defaults: { ease: "power3.out" } });
    intro
      .fromTo(".hero-eyebrow", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.55 })
      .set(".hero-title", { autoAlpha: 1 }, "<0.1")
      .fromTo(".hero-title .line",
        { yPercent: 115 },
        { yPercent: 0, duration: 0.85, stagger: 0.14, ease: "power4.out" }, "-=0.2")
      .fromTo(".red-dot",
        { autoAlpha: 0, scale: 2.4, rotation: -12, transformOrigin: "50% 50%", display: "inline-block" },
        { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.5, ease: "back.out(2.5)" }, "-=0.3")
      .fromTo(".hero-lead", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.3")
      .fromTo(".hero-actions", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.42")
      .fromTo(".product-window",
        { autoAlpha: 0, y: 60, scale: 0.97 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 1.05 }, "-=0.35")
      .fromTo(".pw-table tbody tr",
        { autoAlpha: 0, y: 12 },
        { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.06 }, "-=0.55");

    /* 捲動漸入：進入視窗的元素成批浮升 */
    ScrollTrigger.batch(".reveal", {
      start: "top 88%",
      once: true,
      onEnter: function (batch) {
        gsap.fromTo(batch,
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out", overwrite: true });
      }
    });

    /* 總表微視差：開場結束後才啟用，避免與開場動畫互搶 */
    intro.eventCallback("onComplete", function () {
      gsap.to(".product-window", {
        y: -34,
        ease: "none",
        scrollTrigger: {
          trigger: ".product-window",
          start: "top 70%",
          end: "bottom top",
          scrub: 0.6
        }
      });
    });
  } else {
    /* 備援：拿掉 js-anim 讓 CSS 動畫接手，捲動漸入用 IntersectionObserver */
    htmlEl.classList.remove("js-anim");
    var revealEls = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && !reducedMotion) {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("visible");
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
      );
      revealEls.forEach(function (el) { io.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add("visible"); });
    }
  }

  /* ---------- 數字滾動 ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    if (reducedMotion) { el.textContent = target.toLocaleString(); return; }
    var duration = 1400;
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var cio = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }
})();
