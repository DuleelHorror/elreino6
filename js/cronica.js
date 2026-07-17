/* El Reino 6 — La Crónica del Reino: reproductor flotante + visualizador de audio.
   El botón del hero abre el reproductor en una esquina y narra el relato mientras
   sigues leyendo. Visualizador real con Web Audio (AnalyserNode); si el navegador
   no lo soporta, cae a un ecualizador animado por tiempo. */
(() => {
  'use strict';

  const openBtn = document.getElementById('cronicaOpen');
  const player  = document.getElementById('cronica-player');
  const audio   = document.getElementById('cronicaAudio');
  if (!openBtn || !player || !audio) return;

  const playBtn = document.getElementById('cronicaPlay');
  const canvas  = document.getElementById('cronicaViz');
  const bar     = document.getElementById('cronicaBar');
  const fill    = document.getElementById('cronicaFill');
  const timeEl  = document.getElementById('cronicaTime');
  const minBtn  = document.getElementById('cronicaMin');
  const closeBtn= document.getElementById('cronicaClose');
  const ctx2d   = canvas.getContext('2d');
  const reduce  = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // --- Web Audio (se monta en el primer gesto de play) ---
  let audioCtx = null, analyser = null, freq = null, wired = false;
  function wireAnalyser() {
    if (wired) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      audioCtx = new AC();
      const src = audioCtx.createMediaElementSource(audio);
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.78;
      freq = new Uint8Array(analyser.frequencyBinCount);
      src.connect(analyser);
      analyser.connect(audioCtx.destination);
    } catch (e) { analyser = null; }
    wired = true;
  }

  // --- canvas nítido según densidad de pantalla ---
  let W = 0, H = 0;
  function fitCanvas() {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const cssW = canvas.clientWidth || 300, cssH = canvas.clientHeight || 60;
    W = canvas.width = Math.round(cssW * dpr);
    H = canvas.height = Math.round(cssH * dpr);
  }

  // --- dibujo del visualizador ---
  const BARS = 32;
  let raf = 0, t0 = 0;
  function drawBars(vals) {
    ctx2d.clearRect(0, 0, W, H);
    const gap = Math.max(1, Math.round(W / (BARS * 7)));
    const bw = (W - gap * (BARS - 1)) / BARS;
    for (let i = 0; i < BARS; i++) {
      const v = Math.max(0.04, vals[i]);        // 0..1
      const bh = v * H;
      const x = Math.round(i * (bw + gap));
      const y = H - bh;
      const g = ctx2d.createLinearGradient(0, H, 0, 0);
      g.addColorStop(0, '#8a5cff');
      g.addColorStop(0.7, '#b493ff');
      g.addColorStop(1, '#ffb066');
      ctx2d.fillStyle = g;
      ctx2d.fillRect(x, y, Math.ceil(bw), bh);
      // reflejo tenue
      ctx2d.globalAlpha = 0.12;
      ctx2d.fillRect(x, H, Math.ceil(bw), Math.min(bh * 0.4, H));
      ctx2d.globalAlpha = 1;
    }
  }

  const vals = new Float32Array(BARS);
  function frame(ts) {
    if (analyser) {
      analyser.getByteFrequencyData(freq);
      const step = Math.floor(freq.length / BARS) || 1;
      for (let i = 0; i < BARS; i++) {
        // curva de agudos un pelín realzada para que se vea vivo
        const target = (freq[i * step] / 255) * (0.85 + i / (BARS * 3));
        vals[i] += (Math.min(1, target) - vals[i]) * 0.5;
      }
    } else {
      // fallback: onda sintética por tiempo mientras suena
      const t = (ts - t0) / 1000;
      for (let i = 0; i < BARS; i++) {
        const target = 0.28 + 0.34 * (Math.sin(t * 6 + i * 0.5) * 0.5 + 0.5) *
                              (Math.sin(t * 2.3 + i) * 0.5 + 0.5);
        vals[i] += (target - vals[i]) * 0.35;
      }
    }
    drawBars(vals);
    raf = requestAnimationFrame(frame);
  }
  function startViz() {
    if (reduce) { for (let i = 0; i < BARS; i++) vals[i] = 0.18 + (i % 4) * 0.12; drawBars(vals); return; }
    if (raf) return;
    t0 = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stopViz() {
    if (raf) { cancelAnimationFrame(raf); raf = 0; }
    // decaimiento a reposo
    for (let i = 0; i < BARS; i++) vals[i] = 0.04;
    drawBars(vals);
  }

  // --- utilidades ---
  const fmt = (s) => {
    if (!isFinite(s)) return '0:00';
    const m = Math.floor(s / 60), ss = Math.floor(s % 60);
    return m + ':' + (ss < 10 ? '0' : '') + ss;
  };
  function setPlayingUI(on) {
    playBtn.textContent = on ? '❚❚' : '▶';
    openBtn.classList.toggle('is-playing', on);
  }

  // --- abrir / reproducir ---
  function openAndPlay() {
    player.hidden = false;
    fitCanvas();
    wireAnalyser();
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    audio.play().catch(() => {});
  }
  openBtn.addEventListener('click', () => {
    if (player.hidden || audio.paused) openAndPlay();
    else audio.pause();
  });
  playBtn.addEventListener('click', () => {
    if (audio.paused) { if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume(); audio.play().catch(() => {}); }
    else audio.pause();
  });

  audio.addEventListener('play',  () => { setPlayingUI(true);  startViz(); });
  audio.addEventListener('pause', () => { setPlayingUI(false); stopViz(); });
  audio.addEventListener('ended', () => { setPlayingUI(false); stopViz(); fill.style.width = '100%'; });

  // --- progreso + tiempo ---
  audio.addEventListener('timeupdate', () => {
    const d = audio.duration || 0;
    const p = d ? (audio.currentTime / d) : 0;
    fill.style.width = (p * 100).toFixed(1) + '%';
    timeEl.textContent = fmt(audio.currentTime);
    bar.setAttribute('aria-valuenow', Math.round(p * 100));
  });
  audio.addEventListener('loadedmetadata', () => { timeEl.textContent = fmt(0); });

  // --- buscar en la barra (clic + teclado) ---
  function seekTo(clientX) {
    const r = bar.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (clientX - r.left) / r.width));
    if (audio.duration) audio.currentTime = p * audio.duration;
  }
  bar.addEventListener('click', (e) => seekTo(e.clientX));
  bar.addEventListener('keydown', (e) => {
    if (!audio.duration) return;
    if (e.key === 'ArrowRight') { audio.currentTime = Math.min(audio.duration, audio.currentTime + 5); e.preventDefault(); }
    else if (e.key === 'ArrowLeft') { audio.currentTime = Math.max(0, audio.currentTime - 5); e.preventDefault(); }
    else if (e.key === ' ' || e.key === 'Enter') { audio.paused ? audio.play() : audio.pause(); e.preventDefault(); }
  });

  // --- minimizar / cerrar ---
  minBtn.addEventListener('click', () => player.classList.toggle('min'));
  closeBtn.addEventListener('click', () => {
    audio.pause();
    player.hidden = true;
    player.classList.remove('min');
  });

  window.addEventListener('resize', () => { if (!player.hidden) fitCanvas(); }, { passive: true });
})();
