/* El Reino 6 — carga las noticias desde noticias.json */
(async () => {
  'use strict';
  const list = document.getElementById('noticias-list');
  if (!list) return;

  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g,
    (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  const fallback = `<article class="block news-item">
      <div class="news-meta">Muy pronto</div>
      <h3>El Reino 6 está en camino</h3>
      <p>Estamos dándole los últimos retoques. Vuelve por aquí para enterarte de todo.</p>
    </article>`;

  try {
    const res = await fetch('noticias.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('http');
    const items = await res.json();
    if (!Array.isArray(items) || items.length === 0) throw new Error('empty');

    // orden por fecha desc si viene un campo "orden" numérico, si no respeta el orden del array
    items.sort((a, b) => (b.orden || 0) - (a.orden || 0));

    list.innerHTML = items.map((n) => `
      <article class="block news-item">
        <div class="news-meta">${esc(n.fecha)}${n.etiqueta ? `<span class="news-tag">${esc(n.etiqueta)}</span>` : ''}</div>
        <h3>${esc(n.titulo)}</h3>
        ${n.img ? `<img src="${esc(n.img)}" alt="" loading="lazy" style="margin:0 0 12px;border:2px solid var(--line-hi)">` : ''}
        <p>${n.cuerpo || ''}</p>
      </article>`).join('');

    avisoNovedades(items[0]);
  } catch (e) {
    list.innerHTML = fallback;
  }

  /* ── Aviso de novedades ──────────────────────────────────────────────────
     Problema: las noticias estan al final de la pagina (seccion 14) -> quien
     entra a menudo no se entera de nada sin bajar entero.
     Solucion: la ultima noticia sale en el HERO, y si NO la has visto todavia
     (localStorage con el mayor `orden` que ya viste) se marca como NUEVO + un
     punto en el nav. Se rellena de noticias.json -> publicar una noticia basta.
     Sin cookies, sin servidor, sin mantenimiento. */
  function avisoNovedades(ultima) {
    if (!ultima) return;
    const caja = document.getElementById('heroNews');
    const txt = document.getElementById('hnT');
    const nuevo = document.getElementById('hnNew');
    const punto = document.getElementById('navDot');
    if (!caja || !txt) return;

    txt.textContent = ultima.titulo || '';
    caja.hidden = false;

    const CLAVE = 'er6_ultima_noticia_vista';
    let visto = 0;
    try { visto = parseInt(localStorage.getItem(CLAVE), 10) || 0; } catch (e) { /* modo privado */ }
    const orden = Number(ultima.orden) || 0;

    if (orden > visto) {                       // hay algo que este navegador no ha visto
      if (nuevo) nuevo.hidden = false;
      caja.classList.add('is-new');
      if (punto) punto.hidden = false;
      const marcarVisto = () => {
        try { localStorage.setItem(CLAVE, String(orden)); } catch (e) { /* nada */ }
        if (nuevo) nuevo.hidden = true;
        caja.classList.remove('is-new');
        if (punto) punto.hidden = true;
      };
      caja.addEventListener('click', marcarVisto);
      const sec = document.getElementById('noticias');
      if (sec && 'IntersectionObserver' in window) {   // o si llegas bajando hasta ellas
        const io = new IntersectionObserver((es) => {
          if (es.some((x) => x.isIntersecting)) { marcarVisto(); io.disconnect(); }
        }, { threshold: 0.25 });
        io.observe(sec);
      }
    }
  }
})();
