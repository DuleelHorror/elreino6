# El Reino 6 — web pública de jugadores

Landing promocional del servidor de Minecraft **El Reino 6**. Sitio 100% estático (HTML/CSS/JS),
servido por **GitHub Pages**. Tema obsidiana, estética cuadrada tipo Minecraft.

**Web:** https://duleelhorror.github.io/elreino6/

## Estructura
```
index.html          <- la página (todas las secciones)
css/style.css       <- estilos (tema obsidiana blocky)
js/main.js          <- brasas de fondo + animaciones al hacer scroll
js/noticias.js      <- carga las noticias desde noticias.json
noticias.json       <- LAS NOTICIAS (editar aquí para publicar)
assets/fonts/       <- fuente pixel (Monocraft, licencia OFL/MIT)
assets/img/         <- capturas del juego (héroe, features…)
```

## 📰 Cómo publicar una noticia (lo más importante)
Edita **`noticias.json`**: es una lista de noticias. Añade un objeto NUEVO **arriba** con un `orden`
más alto (el mayor sale primero):

```json
{
  "orden": 2,
  "fecha": "Agosto 2026",
  "etiqueta": "Novedad",
  "titulo": "Título de la noticia",
  "cuerpo": "El texto. Puedes usar <b>negrita</b> y enlaces <a href='...'>así</a>.",
  "img": "assets/img/lo-que-sea.jpg"
}
```
- `orden`: número; el más alto aparece el primero.
- `etiqueta` e `img` son opcionales.
- Guarda, haz commit y `git push` → la web se actualiza sola en 1-2 minutos.

## 📰 El Diario del Reino (`diario/`)

**Página aparte**, no una sección de `index.html`: el periódico del Ayuntamiento, un número por
jornada, con hemeroteca y calendario. Vive en `diario/` y tiene **su propio `diario.css`**, que no
depende de `css/style.css` a propósito (así un retoque en la landing no puede romperlo).

🔴 **NO SE EDITA AQUÍ.** Se genera desde el repo principal:

```bash
python web/diario_extraer.py --dia AAAA-MM-DD   # saca los datos de la jornada
# escribir  web/diario/dias/<fecha>.yml
python web/build_diario.py --auditar            # comprueba (falla si hay antirol o spoilers)
python web/build_diario.py                      # escribe diario/ aquí
git add diario && git commit && git push
```

Todo lo demás (la voz, qué se puede contar y qué no, la rutina) está en
`.claude/docs/diario-del-reino.md` del repo principal.

## Imágenes
Las capturas del juego van en `assets/img/`. La del **héroe** es `assets/img/hero.jpg` (la Torre Negra).
Se referencian desde `index.html` / `css/style.css`.

## Notas
- La landing no usa ningún build ni dependencia: se abre `index.html` y ya.
  (El `diario/` sí se genera, desde el repo principal — ver arriba.)
- No afiliado a Mojang. Hecho con cariño y humor negro.
