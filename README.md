# Asesorías de Programación

Sitio de inscripción a las asesorías rumbo al examen: **lunes 19, martes 20 o miércoles 21 de octubre**, de 11:00 a 12:00, en el Aula LSIM (primer piso PEI). Cupo de 10 estudiantes por día.

**Sitio:** https://mparra37.github.io/Asesorias/

## Cómo funciona

- Cada estudiante aparta **un solo día** con su nombre y matrícula. Si la matrícula ya tiene lugar, se rechaza.
- El sitio muestra en vivo cuántos lugares quedan. Cuando un día llega a 10, ya no se puede elegir.
- La inscripción de cada día se cierra sola a las 11:00 de ese día.
- **Compartir** abre un mensaje listo para copiar y pegar en WhatsApp o Teams. **Mostrar código QR** sirve para proyectarlo en clase.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | El sitio completo (GitHub Pages lo sirve desde la raíz de `main`) |
| `og-image.png` | Imagen de vista previa al compartir el enlace |
| `backend/Codigo.gs` | Backend en Google Apps Script: guarda inscripciones en una hoja de Google y controla el cupo |
| `flyer-asesorias.png` | Flyer para redes |

## Backend (Google Apps Script)

1. Abre la hoja de Google donde quieres las inscripciones → **Extensiones → Apps Script**.
   Pega `backend/Codigo.gs` y guarda. La pestaña **Inscritos** se crea sola con la primera consulta.
   (Si el proyecto no está unido a una hoja, ejecuta una vez la función `configurar` y se crea una hoja nueva.)
2. **Implementar → Nueva implementación → Aplicación web**: ejecutar como **Yo**, acceso **Cualquier usuario**.
3. Copia la URL que termina en `/exec` y pégala en `CONFIG.API_URL` de `index.html`.

Si cambias el código después: **Implementar → Administrar implementaciones → lápiz → Versión: Nueva versión**.
Así la URL no cambia.

## Durante las asesorías

- La hoja tiene una fila por estudiante y una casilla **Asistió**. Compártela con los asesores para pasar lista.
- Para liberar un lugar, borra la fila de esa persona. El sitio lo refleja al instante.

## Si cambias fechas, horario o cupo

Cámbialos en los dos archivos: `SESIONES` y `CUPO` en `backend/Codigo.gs`, y `SESIONES`, `CONFIG.CUPO` y los textos en `index.html`.
Después publica una versión nueva del backend.
