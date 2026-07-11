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
  } catch (e) {
    list.innerHTML = fallback;
  }
})();
