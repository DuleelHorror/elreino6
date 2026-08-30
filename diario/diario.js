/* ============================================================================
   EL HERALDO DEL REINO — lo poco que hace falta en el navegador.

   🔴 SIN NINGUNA LIBRERIA, y a proposito. Todo lo que se ve —el periodico entero y
   las graficas— sale ya escrito del build: esto solo AÑADE ENCIMA. Si este fichero
   no carga, el Diario se lee igual; lo unico que se pierde es ampliar la foto y los
   avisos al pasar el raton.

   Cuatro cosas:
     1. AMPLIAR LAS FOTOS  (y es lo que arregla el periodico en el movil, §abajo)
     2. las pestañas del Escalafon
     3. los avisos de las graficas
     4. ordenar la tabla y contar las cifras al aparecer

   🔴🔴 POR QUE LO PRIMERO ES LO IMPORTANTE (2026-08-28)
   Las fotos del periodico salen en gris y se revelaban con `figure:hover`, «como si
   las sacaras del Archivo Municipal». En un movil NO HAY raton, asi que a quien
   entraba desde el telefono el periodico entero le salia en blanco y negro y no se
   revelaba nunca — y no lo cantaba ningun auditor, porque un auditor comprueba lo
   que se puede ESCRIBIR, no lo que se VE. Ahora se pulsa y se abre en color.
   ============================================================================ */
(function () {
  "use strict";

  var quieto = window.matchMedia &&
               window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 1 · AMPLIAR LAS FOTOS ──────────────────────────────────────────────── */
  var fotos = [];
  var actual = -1;
  var caja = null;

  function construirCaja() {
    if (caja) return caja;
    caja = document.createElement("div");
    caja.className = "visor";
    caja.setAttribute("role", "dialog");
    caja.setAttribute("aria-modal", "true");
    caja.innerHTML =
      '<button class="visor-x" aria-label="Cerrar">&times;</button>' +
      '<button class="visor-ant" aria-label="Anterior">&#8249;</button>' +
      '<button class="visor-sig" aria-label="Siguiente">&#8250;</button>' +
      '<figure class="visor-marco"><img alt=""><figcaption></figcaption></figure>';
    document.body.appendChild(caja);

    caja.addEventListener("click", function (e) {
      // pulsar el fondo cierra; pulsar la foto, no (si no, es imposible mirarla)
      if (e.target === caja || e.target.className === "visor-x") cerrar();
      else if (e.target.className === "visor-ant") mover(-1);
      else if (e.target.className === "visor-sig") mover(1);
    });
    return caja;
  }

  function abrir(i) {
    construirCaja();
    actual = i;
    var f = fotos[i];
    var img = caja.querySelector("img");
    img.src = f.src;
    img.alt = f.alt || "";
    caja.querySelector("figcaption").innerHTML = f.pie || "";
    caja.querySelector(".visor-ant").hidden = fotos.length < 2;
    caja.querySelector(".visor-sig").hidden = fotos.length < 2;
    document.body.classList.add("con-visor");     // bloquea el scroll de detras
    caja.classList.add("abierto");
  }

  function cerrar() {
    if (caja) caja.classList.remove("abierto");
    document.body.classList.remove("con-visor");
    actual = -1;
  }

  function mover(paso) {
    if (actual < 0 || !fotos.length) return;
    abrir((actual + paso + fotos.length) % fotos.length);
  }

  function prepararFotos() {
    var nodos = document.querySelectorAll("figure img");
    for (var i = 0; i < nodos.length; i++) {
      (function (img) {
        var fig = img.closest("figure");
        var cap = fig ? fig.querySelector("figcaption") : null;
        var pie = "";
        if (cap) {
          // el «pase el raton para revelarla» es un gag de escritorio: en el visor sobra
          var copia = cap.cloneNode(true);
          var rev = copia.querySelector(".rev");
          if (rev) rev.parentNode.removeChild(rev);
          pie = copia.innerHTML;
        }
        var n = fotos.length;
        fotos.push({ src: img.currentSrc || img.src, alt: img.alt, pie: pie });
        img.classList.add("ampliable");
        img.setAttribute("tabindex", "0");
        img.setAttribute("role", "button");
        img.setAttribute("aria-label", "Ampliar la fotografía");
        img.addEventListener("click", function () { abrir(n); });
        img.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(n); }
        });
      })(nodos[i]);
    }
  }

  document.addEventListener("keydown", function (e) {
    if (actual < 0) return;
    if (e.key === "Escape") cerrar();
    else if (e.key === "ArrowLeft") mover(-1);
    else if (e.key === "ArrowRight") mover(1);
  });

  // pasar la foto con el dedo
  var x0 = null;
  document.addEventListener("touchstart", function (e) {
    if (actual >= 0 && e.touches.length === 1) x0 = e.touches[0].clientX;
  }, { passive: true });
  document.addEventListener("touchend", function (e) {
    if (x0 === null || actual < 0) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 60) mover(dx < 0 ? 1 : -1);
    x0 = null;
  }, { passive: true });

  /* ── 2 · LAS PESTAÑAS DEL ESCALAFON ─────────────────────────────────────── */
  function prepararPestanas() {
    var grupos = document.querySelectorAll("[data-pestanas]");
    for (var g = 0; g < grupos.length; g++) {
      (function (grupo) {
        var botones = grupo.querySelectorAll("[data-panel]");
        grupo.addEventListener("click", function (e) {
          var b = e.target.closest("[data-panel]");
          if (!b) return;
          for (var i = 0; i < botones.length; i++) {
            var act = botones[i] === b;
            botones[i].classList.toggle("activa", act);
            botones[i].setAttribute("aria-selected", act ? "true" : "false");
            var pan = document.getElementById(botones[i].dataset.panel);
            if (pan) pan.hidden = !act;
          }
        });
      })(grupos[g]);
    }
  }

  /* ── 3 · LOS AVISOS DE LAS GRAFICAS ─────────────────────────────────────── */
  var aviso = null;
  function decir(txt, x, y) {
    if (!aviso) {
      aviso = document.createElement("div");
      aviso.className = "gr-aviso";
      document.body.appendChild(aviso);
    }
    aviso.textContent = txt;
    aviso.style.left = x + "px";
    aviso.style.top = y + "px";
    aviso.classList.add("visible");
  }
  function callar() { if (aviso) aviso.classList.remove("visible"); }

  function prepararGraficas() {
    document.addEventListener("mousemove", function (e) {
      var m = e.target.closest ? e.target.closest(".barra, .col, .pt") : null;
      if (!m) { callar(); return; }
      var t = "";
      if (m.classList.contains("barra")) t = m.dataset.nombre + ": " + m.dataset.valor;
      else if (m.classList.contains("col")) t = m.dataset.fecha + ": " + m.dataset.valor;
      else t = m.dataset.hora + " · " + m.dataset.valor + " dentro";
      decir(t, e.clientX + 14, e.clientY - 10);
    });
    document.addEventListener("mouseleave", callar);
    // en tactil: un toque en la barra tambien lo dice
    document.addEventListener("touchstart", function (e) {
      var m = e.target.closest ? e.target.closest(".barra, .col, .pt") : null;
      if (!m) return;
      var t = m.dataset.nombre || m.dataset.fecha || m.dataset.hora;
      decir(t + ": " + m.dataset.valor, e.touches[0].clientX + 8,
            e.touches[0].clientY - 40);
      setTimeout(callar, 2200);
    }, { passive: true });
  }

  /* ── 4 · ORDENAR LA TABLA Y CONTAR LAS CIFRAS ───────────────────────────── */
  function prepararTablas() {
    var tablas = document.querySelectorAll("table[data-ordenable]");
    for (var i = 0; i < tablas.length; i++) {
      (function (tabla) {
        var ths = tabla.querySelectorAll("th[data-col]");
        for (var k = 0; k < ths.length; k++) {
          (function (th, col) {
            th.setAttribute("tabindex", "0");
            var desc = true;
            function ordenar() {
              var cuerpo = tabla.tBodies[0];
              var filas = Array.prototype.slice.call(cuerpo.rows);
              filas.sort(function (a, b) {
                var va = a.cells[col].dataset.v, vb = b.cells[col].dataset.v;
                var na = parseFloat(va), nb = parseFloat(vb);
                if (!isNaN(na) && !isNaN(nb)) return desc ? nb - na : na - nb;
                return desc ? String(vb).localeCompare(va) : String(va).localeCompare(vb);
              });
              for (var f = 0; f < filas.length; f++) cuerpo.appendChild(filas[f]);
              for (var j = 0; j < ths.length; j++) ths[j].removeAttribute("data-orden");
              th.setAttribute("data-orden", desc ? "desc" : "asc");
              desc = !desc;
            }
            th.addEventListener("click", ordenar);
            th.addEventListener("keydown", function (e) {
              if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ordenar(); }
            });
          })(ths[k], parseInt(ths[k].dataset.col, 10));
        }
      })(tablas[i]);
    }
  }

  function prepararCifras() {
    var nodos = document.querySelectorAll("[data-contar]");
    if (!nodos.length) return;
    if (quieto || !("IntersectionObserver" in window)) return;   // sin animar y ya esta
    var obs = new IntersectionObserver(function (entradas) {
      entradas.forEach(function (en) {
        if (!en.isIntersecting) return;
        obs.unobserve(en.target);
        var fin = parseFloat(en.target.dataset.contar);
        var t0 = null;
        function paso(t) {
          if (!t0) t0 = t;
          var k = Math.min(1, (t - t0) / 700);
          en.target.textContent = String(Math.round(fin * (1 - Math.pow(1 - k, 3))));
          if (k < 1) requestAnimationFrame(paso);
        }
        requestAnimationFrame(paso);
      });
    }, { threshold: 0.4 });
    for (var i = 0; i < nodos.length; i++) obs.observe(nodos[i]);
  }

  /* ── EL DOMINICAL PLEGADO ─────────────────────────────────────
     Encargo del usuario (2026-08-30): que el Dominical este PLEGADO y se despliegue al
     pulsarlo, «como un diario o un panfleto».

     🔑 SIN NINGUNA LIBRERIA. No hace falta: son transformaciones 3D del navegador y un
        `grid-template-rows: 0fr -> 1fr`, que anima la altura sin medir nada a mano. Y el
        Diario no enlaza CDNs a proposito (misma razon que las graficas: tiene que verse
        aunque no cargue nada de fuera).

     🔴 EL ORDEN IMPORTA: el HTML sale SIEMPRE DESPLEGADO y es este script el que lo
        pliega al arrancar. Al reves —plegado en el HTML y desplegando con JS— quien
        entrara sin JS se encontraria el repaso de la semana invisible y sin forma de
        abrirlo. Es la misma trampa que las fotos en blanco y negro del movil: lo que
        depende del navegador tiene que degradar hacia VISIBLE. */
  function prepararPliegos() {
    var secs = document.querySelectorAll("[data-plegable]");
    for (var i = 0; i < secs.length; i++) {
      (function (sec) {
        var tapa = sec.querySelector(".domi-tapa");
        if (!tapa) return;
        sec.classList.add("plegable", "plegado");
        tapa.setAttribute("aria-expanded", "false");

        function alternar() {
          var abierto = !sec.classList.contains("plegado");
          sec.classList.toggle("plegado", abierto);
          tapa.setAttribute("aria-expanded", abierto ? "false" : "true");
          /* al plegarlo desde abajo, la cabecera se queda fuera de pantalla: se sube */
          if (abierto) {
            var y = sec.getBoundingClientRect().top;
            if (y < 0) sec.scrollIntoView({ block: "start", behavior: "smooth" });
          }
        }
        tapa.addEventListener("click", alternar);
      })(secs[i]);
    }
  }

  function arrancar() {
    prepararPliegos();
    prepararFotos();
    prepararPestanas();
    prepararGraficas();
    prepararTablas();
    prepararCifras();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", arrancar);
  } else {
    arrancar();
  }
})();
