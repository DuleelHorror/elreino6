/* El Reino 6 — nav: menú móvil + scroll-spy */
(() => {
  'use strict';
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    const setOpen = (open) => {
      links.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    };
    toggle.addEventListener('click', () => setOpen(!links.classList.contains('open')));
    links.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  }

  // scroll-spy: resalta el enlace de la sección visible
  const anchors = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const map = new Map();
  anchors.forEach((a) => {
    const sec = document.getElementById(a.getAttribute('href').slice(1));
    if (sec) map.set(sec, a);
  });
  if ('IntersectionObserver' in window && map.size) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          anchors.forEach((a) => a.classList.remove('active'));
          const a = map.get(e.target);
          if (a) a.classList.add('active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach((_a, sec) => spy.observe(sec));
  }
})();

/* El Reino 6 — scroll-reveal + progreso + parallax + fondo vivo (brasas + esquirlas) */
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

  // --- una sola pasada por scroll: progreso + parallax + "zumbido" ---
  const bar = document.getElementById('progress');
  const heroImg = document.querySelector('.hero-img');
  let hum = 0, ticking = false;
  function onScroll() {
    const st = window.scrollY || document.documentElement.scrollTop || 0;
    const max = (document.documentElement.scrollHeight - window.innerHeight) || 1;
    const p = Math.min(1, Math.max(0, st / max));
    if (bar) bar.style.width = (p * 100).toFixed(2) + '%';
    hum = p; // cuanto más hondo, más fuerte suena la Torre
    if (!reduce && heroImg && st < window.innerHeight) {
      heroImg.style.transform = 'translateY(' + (st * 0.28).toFixed(1) + 'px) scale(1.06)';
    }
    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  if (reduce) return;

  // --- brasas cuadradas + esquirlas arcanas (canvas) ---
  const c = document.getElementById('embers');
  if (!c) return;
  const ctx = c.getContext('2d');
  let w = 0, h = 0, parts = [], sparks = [];
  const count = () => Math.min(90, Math.floor(window.innerWidth / 18));

  function resize() { w = c.width = window.innerWidth; h = c.height = window.innerHeight; }
  function spawn() {
    return {
      x: Math.random() * w, y: h + Math.random() * h,
      s: 1 + Math.floor(Math.random() * 3),
      v: 0.22 + Math.random() * 0.9,
      a: 0.16 + Math.random() * 0.5,
      drift: (Math.random() - 0.5) * 0.45,
      ember: Math.random() < 0.68
    };
  }
  // esquirla: destello morado que nace, brilla y se apaga (marca grabada de la Torre)
  function spawnSpark() {
    return { x: Math.random() * w, y: Math.random() * h, life: 0, max: 26 + Math.random() * 26, s: 2 + Math.floor(Math.random() * 2) };
  }
  function init() { resize(); parts = Array.from({ length: count() }, spawn); sparks = []; }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const boost = 1 + hum * 0.9;

    for (const p of parts) {
      p.y -= p.v * boost; p.x += p.drift + Math.sin(p.y * 0.01) * 0.3;
      if (p.y < -12) { Object.assign(p, spawn(), { y: h + 12 }); }
      ctx.globalAlpha = p.a * (0.55 + 0.45 * Math.sin(p.y * 0.05)) * (0.85 + hum * 0.4);
      ctx.fillStyle = p.ember ? '#ff8a3a' : '#a98bff';
      ctx.fillRect(p.x | 0, p.y | 0, p.s, p.s);
    }

    // más esquirlas cuanto más hondo estás (el zumbido sube)
    if (Math.random() < 0.012 + hum * 0.05 && sparks.length < 26) sparks.push(spawnSpark());
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i]; s.life++;
      const al = Math.sin((s.life / s.max) * Math.PI);
      ctx.fillStyle = '#c9b0ff';
      ctx.globalAlpha = Math.max(0, al) * 0.9;
      ctx.fillRect(s.x | 0, s.y | 0, s.s, s.s);
      ctx.globalAlpha = Math.max(0, al) * 0.32; // pequeña cruz de destello
      ctx.fillRect((s.x - 2) | 0, s.y | 0, s.s + 4, 1);
      ctx.fillRect(s.x | 0, (s.y - 2) | 0, 1, s.s + 4);
      if (s.life >= s.max) sparks.splice(i, 1);
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  let t;
  window.addEventListener('resize', () => { clearTimeout(t); t = setTimeout(init, 150); });
  init();
  draw();
})();
