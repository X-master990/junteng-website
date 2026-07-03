/* ============================================================
   Dotted Surface — Three.js 波浪點陣背景（vanilla 移植版）
   來源概念：21st.dev DottedSurface（React）→ 純 JS
   ============================================================ */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var host = document.querySelector(".dotted-surface");
  if (!host || !window.THREE || reducedMotion) return;

  var SEPARATION = 150;
  var AMOUNTX = 40;
  var AMOUNTY = 60;

  var w = host.clientWidth || window.innerWidth;
  var h = host.clientHeight || window.innerHeight;

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0xfdfdfb, 2000, 10000); /* 紙色霧，遠處的點融入背景 */

  var camera = new THREE.PerspectiveCamera(60, w / h, 1, 10000);
  camera.position.set(0, 355, 1220);

  var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(w, h);
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  /* 點陣網格 */
  var positions = [];
  for (var ix = 0; ix < AMOUNTX; ix++) {
    for (var iy = 0; iy < AMOUNTY; iy++) {
      positions.push(
        ix * SEPARATION - (AMOUNTX * SEPARATION) / 2,
        0,
        iy * SEPARATION - (AMOUNTY * SEPARATION) / 2
      );
    }
  }
  var geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));

  var material = new THREE.PointsMaterial({
    color: 0x1c1b18, /* 墨色 */
    size: 8,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true
  });
  scene.add(new THREE.Points(geometry, material));

  var count = 0;
  var running = !document.hidden;
  var inView = true;
  var rafId = null;

  function renderFrame() {
    var attr = geometry.attributes.position;
    var arr = attr.array;
    var i = 0;
    for (var ix = 0; ix < AMOUNTX; ix++) {
      for (var iy = 0; iy < AMOUNTY; iy++) {
        arr[i * 3 + 1] =
          Math.sin((ix + count) * 0.3) * 50 +
          Math.sin((iy + count) * 0.5) * 50;
        i++;
      }
    }
    attr.needsUpdate = true;
    renderer.render(scene, camera);
    count += 0.1;
  }

  function loop() {
    if (!running || !inView) { rafId = null; return; }
    renderFrame();
    rafId = requestAnimationFrame(loop);
  }
  function kick() {
    if (rafId === null && running && inView) rafId = requestAnimationFrame(loop);
  }

  /* 分頁隱藏或捲出視窗時暫停，省電 */
  document.addEventListener("visibilitychange", function () {
    running = !document.hidden;
    kick();
  });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      kick();
    }).observe(host);
  }

  window.addEventListener("resize", function () {
    var w2 = host.clientWidth || window.innerWidth;
    var h2 = host.clientHeight || window.innerHeight;
    camera.aspect = w2 / h2;
    camera.updateProjectionMatrix();
    renderer.setSize(w2, h2);
  });

  renderFrame(); /* 先畫第一格，避免空白 */
  kick();
})();
