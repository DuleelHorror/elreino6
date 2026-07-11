/* El Reino 6 — brasas de fondo + scroll-reveal */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- scroll-reveal ---
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('in'));
  }

  if (reduce) return;

  // --- brasas (cuadradas, para el rollo pixel) ---
  const c = document.getElementById('embers');
  if (!c) return;
  const ctx = c.getContext('2d');
  let w = 0, h = 0, parts = [];
  const count = () => Math.min(80, Math.floor(window.innerWidth / 20));

  function resize() { w = c.width = window.innerWidth; h = c.height = window.innerHeight; }
  function spawn() {
    return {
      x: Math.random() * w, y: h + Math.random() * h,
      s: 1 + Math.floor(Math.random() * 3),
      v: 0.25 + Math.random() * 0.9,
      a: 0.18 + Math.random() * 0.5,
      drift: (Math.random() - 0.5) * 0.45,
      ember: Math.random() < 0.7
    };
  }
  function init() { resize(); parts = Array.from({ length: count() }, spawn); }
  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (const p of parts) {
      p.y -= p.v; p.x += p.drift + Math.sin(p.y * 0.01) * 0.3;
      if (p.y < -12) { Object.assign(p, spawn(), { y: h + 12 }); }
      ctx.globalAlpha = p.a * (0.55 + 0.45 * Math.sin(p.y * 0.05));
      ctx.fillStyle = p.ember ? '#ff8a3a' : '#a98bff';
      ctx.fillRect(p.x | 0, p.y | 0, p.s, p.s);
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }
  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(init, 150); });
  init();
  draw();
})();
