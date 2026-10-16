/**
 * Backend · Asesorías de Programación
 *
 * Guarda las inscripciones en una hoja de Google y no deja pasar del CUPO.
 * El sitio (index.html) lo consulta para mostrar cuántos lugares quedan.
 *
 * Instalación (una sola vez):
 *   1. https://script.google.com → "Nuevo proyecto" → pega este archivo → guarda.
 *   2. Elige la función  configurar  → ▶ Ejecutar → acepta los permisos
 *      ("Configuración avanzada" → "Ir a ... (no seguro)" → "Permitir").
 *      En el registro aparece el enlace de la hoja de inscritos.
 *   3. "Implementar" → "Nueva implementación" → tipo "Aplicación web":
 *        Ejecutar como: Yo
 *        Quién tiene acceso: Cualquier usuario
 *      Copia la URL que termina en /exec y pégala en CONFIG.API_URL de index.html.
 *
 * Si cambias este código: "Implementar" → "Administrar implementaciones" →
 * editar (lápiz) → Versión: "Nueva versión". Así la URL sigue siendo la misma.
 */

const CUPO = 10;

// Mismos id que SESIONES en index.html. "inicio" cierra la inscripción de ese día.
const SESIONES = [
  { id: 'lun', nombre: 'Lunes 19 de octubre', inicio: '2026-10-19T11:00:00-06:00' },
  { id: 'mar', nombre: 'Martes 20 de octubre', inicio: '2026-10-20T11:00:00-06:00' },
  { id: 'mie', nombre: 'Miércoles 21 de octubre', inicio: '2026-10-21T11:00:00-06:00' },
];

const ENCABEZADOS = ['Registro', 'Sesión', 'Nombre', 'Matrícula', 'Grupo', 'Temas', 'Duda', 'Asistió'];
const COL_SESION = 2;
const COL_MATRICULA = 4;
const COL_ASISTIO = 8;

function configurar() {
  const libro = SpreadsheetApp.create('Inscritos · Asesorías de Programación');
  const hoja = libro.getSheets()[0];
  hoja.setName('Inscritos');
  hoja.appendRow(ENCABEZADOS);
  hoja.setFrozenRows(1);
  hoja.getRange(1, 1, 1, ENCABEZADOS.length).setFontWeight('bold');
  PropertiesService.getScriptProperties().setProperty('hojaId', libro.getId());
  Logger.log('Hoja de inscritos: ' + libro.getUrl());
}

function doGet() {
  return responder({ ok: true, cupo: CUPO, sesiones: estado(leerFilas(obtenerHoja())) });
}

function doPost(e) {
  let datos;
  try {
    datos = JSON.parse(e.postData.contents);
  } catch (err) {
    return responder({ ok: false, error: 'No pudimos leer tu inscripción. Intenta de nuevo.' });
  }

  const error = validar(datos);
  if (error) return responder({ ok: false, error });

  const lock = LockService.getScriptLock();
  if (!lock.tryLock(20000)) {
    return responder({ ok: false, error: 'Mucha gente se está inscribiendo a la vez. Intenta de nuevo en unos segundos.' });
  }

  try {
    const hoja = obtenerHoja();
    const filas = leerFilas(hoja);
    const matricula = datos.matricula.trim().toUpperCase();
    const ahora = Date.now();

    for (const id of datos.sesiones) {
      const s = SESIONES.find(x => x.id === id);
      const rechazo =
        ahora >= Date.parse(s.inicio) ? `La sesión del ${s.nombre} ya cerró.` :
        filas.some(f => f.sesion === s.nombre && f.matricula === matricula) ? `Ya tienes lugar el ${s.nombre}.` :
        contar(filas, s.nombre) >= CUPO ? `La sesión del ${s.nombre} se acaba de llenar. Elige otro día.` :
        '';
      if (rechazo) return responder({ ok: false, error: rechazo, sesiones: estado(filas) });
    }

    const registro = new Date();
    const temas = (datos.temas || []).join(', ');
    datos.sesiones.forEach(id => {
      const s = SESIONES.find(x => x.id === id);
      hoja.appendRow([
        registro, s.nombre, limpiar(datos.nombre), matricula,
        limpiar(datos.grupo), limpiar(temas), limpiar(datos.duda || ''), false,
      ]);
      hoja.getRange(hoja.getLastRow(), COL_ASISTIO).insertCheckboxes();
    });
    SpreadsheetApp.flush();

    return responder({ ok: true, sesiones: estado(leerFilas(hoja)) });
  } finally {
    lock.releaseLock();
  }
}

function validar(d) {
  if (!d || typeof d !== 'object') return 'Inscripción incompleta.';
  if (!Array.isArray(d.sesiones) || d.sesiones.length === 0) return 'Elige al menos un día.';
  if (new Set(d.sesiones).size !== d.sesiones.length) return 'Elegiste un día dos veces.';
  if (!d.sesiones.every(id => SESIONES.some(s => s.id === id))) return 'Ese día no existe.';
  if (typeof d.nombre !== 'string' || d.nombre.trim().length < 3 || d.nombre.length > 80) return 'Escribe tu nombre completo.';
  if (typeof d.matricula !== 'string' || !/^A\d{8}$/i.test(d.matricula.trim())) return 'Revisa tu matrícula (ejemplo: A01234567).';
  if (typeof d.grupo !== 'string' || !d.grupo.trim() || d.grupo.length > 40) return 'Elige tu grupo.';
  if (d.temas && (!Array.isArray(d.temas) || d.temas.length > 12 || d.temas.some(t => typeof t !== 'string' || t.length > 60))) return 'Revisa los temas.';
  if (d.duda && (typeof d.duda !== 'string' || d.duda.length > 500)) return 'La duda es demasiado larga (máximo 500 caracteres).';
  return '';
}

function obtenerHoja() {
  const id = PropertiesService.getScriptProperties().getProperty('hojaId');
  if (!id) throw new Error('Primero ejecuta la función configurar.');
  return SpreadsheetApp.openById(id).getSheetByName('Inscritos');
}

function leerFilas(hoja) {
  const n = hoja.getLastRow() - 1;
  if (n < 1) return [];
  return hoja.getRange(2, 1, n, ENCABEZADOS.length).getValues().map(f => ({
    sesion: String(f[COL_SESION - 1]),
    matricula: String(f[COL_MATRICULA - 1]).toUpperCase(),
  }));
}

function contar(filas, nombreSesion) {
  return filas.filter(f => f.sesion === nombreSesion).length;
}

function estado(filas) {
  const ahora = Date.now();
  return SESIONES.map(s => {
    const inscritos = contar(filas, s.nombre);
    return {
      id: s.id,
      inscritos,
      disponibles: Math.max(0, CUPO - inscritos),
      cerrada: ahora >= Date.parse(s.inicio),
    };
  });
}

// Evita que un texto que empieza con = + - @ se interprete como fórmula en la hoja.
function limpiar(texto) {
  const t = String(texto).trim();
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

function responder(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
