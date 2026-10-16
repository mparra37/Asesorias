# Sitio de asesorías: cómo publicarlo

Tiene dos piezas:

| Pieza | Archivo | Dónde vive |
|---|---|---|
| Sitio (lo que ven los estudiantes) | `sitio/index.html`, `sitio/og-image.png` | GitHub Pages |
| Backend (guarda inscripciones y controla el cupo) | `backend/Codigo.gs` | Google Apps Script + una hoja de Google |

Sin el backend, el sitio funciona en **modo demostración**: los lugares son de ejemplo y no guarda nada.

## 1. Backend (unos 5 minutos)

1. Entra a https://script.google.com → **Nuevo proyecto**. Borra lo que trae, pega `backend/Codigo.gs` y guarda.
2. Elige la función `configurar` → **Ejecutar** → acepta los permisos
   (*Configuración avanzada* → *Ir a … (no seguro)* → *Permitir*; es tu propio script).
   En el registro aparece el enlace a la hoja **Inscritos · Asesorías de Programación**.
3. **Implementar → Nueva implementación** → tipo **Aplicación web**:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
4. Copia la URL que termina en `/exec`.

## 2. Sitio

1. Abre `sitio/index.html` y pega la URL en `CONFIG.API_URL` (cerca del inicio del `<script>`).
2. En el mismo bloque `CONFIG`, ajusta `GRUPOS` con los nombres reales de tus 4 grupos y, si hace falta, los `TEMAS`.
3. Sube `index.html` y `og-image.png` a tu repositorio de GitHub Pages.
4. En la etiqueta `og:image` del `<head>`, cambia `https://TU-USUARIO.github.io/TU-REPO/og-image.png`
   por la dirección real. Así WhatsApp y Teams muestran la vista previa con imagen.

## 3. Durante las asesorías

- La hoja tiene una fila por estudiante y por día, y una casilla **Asistió**. Compártela con los asesores
  para que marquen asistencia; de ahí salen los puntos de apoyo (filtra por *Asistió = TRUE*).
- Para liberar un lugar, borra la fila de esa persona. El sitio lo refleja al instante.
- La inscripción de cada día se cierra sola a las 11:00 de ese día.
- Para proyectar el QR en clase: botón **Mostrar código QR** al final del sitio.

## Si cambias fechas, horario o cupo

Cámbialos en los **dos** archivos: `SESIONES` y `CUPO` en `Codigo.gs`, y `SESIONES` y `CONFIG.CUPO` en `index.html`
(más los textos de la página). Después de editar `Codigo.gs`: **Implementar → Administrar implementaciones →
lápiz → Versión: Nueva versión**, para que la URL siga siendo la misma.
