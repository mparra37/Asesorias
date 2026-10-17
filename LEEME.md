# Sitio de asesorías: cómo publicarlo

Sitio público: https://mparra37.github.io/Asesorias/

| Pieza | Archivo | Dónde vive |
|---|---|---|
| Sitio (lo que ven los estudiantes) | `index.html`, `og-image.png` (en la raíz del repo) | GitHub Pages |
| Backend (guarda inscripciones y controla el cupo) | `backend/Codigo.gs` | Google Apps Script + una hoja de Google |

GitHub Pages: **Settings → Pages → Deploy from a branch → `main` / `(root)`**.

## Backend

1. En tu proyecto de https://script.google.com, reemplaza todo el código por `backend/Codigo.gs` y guarda.
2. Si todavía no lo has hecho, elige la función `configurar` → **Ejecutar** → acepta los permisos
   (*Configuración avanzada* → *Ir a … (no seguro)* → *Permitir*). En el registro aparece el enlace a la hoja de inscritos.
3. Publica la versión nueva sin cambiar la URL: **Implementar → Administrar implementaciones → lápiz →
   Versión: Nueva versión → Implementar**. La implementación debe ser *Aplicación web*, ejecutar como **Yo**
   y con acceso para **Cualquier usuario**.

La URL `/exec` ya está puesta en `CONFIG.API_URL` de `index.html`.

## Cómo funciona

- Cada estudiante aparta **un solo día**. Con nombre y matrícula basta; si la matrícula ya tiene lugar, se rechaza.
- 10 lugares por día. La inscripción de cada día se cierra sola a las 11:00 de ese día.
- La hoja tiene una casilla **Asistió** por fila. Compártela con los asesores para pasar lista.
- Para liberar un lugar, borra la fila de esa persona. El sitio lo refleja al instante.
- El QR del sitio (botón al final de la página) siempre apunta a `CONFIG.SITIO_URL`.

## Si cambias fechas, horario o cupo

Cámbialos en los **dos** archivos: `SESIONES` y `CUPO` en `Codigo.gs`, y `SESIONES` y `CONFIG.CUPO` en `index.html`
(más los textos de la página). Después publica una versión nueva del backend, como en el paso 3.
