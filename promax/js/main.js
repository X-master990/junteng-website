/* ============================================================
   駿騰智能 ProMax — GSAP 動畫（Trust & Authority・motion 8）
   ============================================================ */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 導覽列 ---------- */
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

  /* ---------- 動畫：GSAP，失效時退回 CSS ---------- */
  var htmlEl = document.documentElement;
  var useGsap = !!(window.gsap && window.ScrollTrigger && htmlEl.classList.contains("js-anim"));

  if (!useGsap) {
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
    document.querySelectorAll(".wf-step").forEach(function (el) { el.classList.add("is-on"); });
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  /* 開場時間軸 */
  var intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .fromTo(".hero-eyebrow", { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.55 })
    .fromTo(".hero-title", { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.85 }, "-=0.3")
    .fromTo(".u-blue", { backgroundSize: "0% 0.18em" }, { backgroundSize: "100% 0.18em", duration: 0.6, ease: "power2.inOut" }, "-=0.35")
    .fromTo(".hero-lead", { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.3")
    .fromTo(".hero-actions", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.42")
    .set(".hero-creds", { autoAlpha: 1 }, "-=0.35")
    .fromTo(".hero-creds li",
      { autoAlpha: 0, y: 12 },
      { autoAlpha: 1, y: 0, duration: 0.45, stagger: 0.08 }, "<");

  /* 捲動漸入 */
  ScrollTrigger.batch(".reveal", {
    start: "top 88%",
    once: true,
    onEnter: function (batch) {
      gsap.fromTo(batch,
        { autoAlpha: 0, y: 18 },
        { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.08, ease: "power3.out", overwrite: true });
    }
  });

  /* Lamp 點燈：進入系統實況區時光條展開、光束亮起、標題浮現 */
  gsap.timeline({
    scrollTrigger: { trigger: "#wfPin", start: "top 75%" },
    defaults: { ease: "power3.out" }
  })
    .fromTo(".lamp-line", { scaleX: 0.3, autoAlpha: 0.35 }, { scaleX: 1, autoAlpha: 1, duration: 0.9 })
    .fromTo(".lamp-beam, .lamp-glow", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, "<0.15")
    .fromTo(".wf-head", { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.5");

  /* Pinned 捲動敘事：桌面釘住區塊，捲動推進三個角色 */
  var steps = [
    { step: "#wfStep1", chip: "#wfChip1", role: "承辦" },
    { step: "#wfStep2", chip: "#wfChip2", role: "會計" },
    { step: "#wfStep3", chip: "#wfChip3", role: "法務" }
  ];
  var roleEl = document.getElementById("wfRole");

  function setActive(index) {
    steps.forEach(function (s, i) {
      document.querySelector(s.step).classList.toggle("is-on", i === index);
      document.querySelector(s.chip).classList.toggle("is-hot", i === index);
    });
    if (roleEl) roleEl.textContent = steps[index].role;
  }

  var mm = gsap.matchMedia();

  mm.add("(min-width: 901px)", function () {
    setActive(0);
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#wfPin",
        start: "top top",
        end: "+=160%",
        scrub: 0.8,
        pin: true,
        onUpdate: function (self) {
          var idx = Math.min(2, Math.floor(self.progress * 3));
          setActive(idx);
        }
      }
    });
    tl.to("#wfBar", { scaleY: 1, ease: "none" });
    return function () { setActive(0); };
  });

  mm.add("(max-width: 900px)", function () {
    /* 手機不釘住（避免破壞原生捲動），步驟全亮 */
    steps.forEach(function (s) {
      document.querySelector(s.step).classList.add("is-on");
    });
    gsap.set("#wfBar", { scaleY: 1 });
  });

  /* 字體載入後重算 pin 位置 */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
})();
