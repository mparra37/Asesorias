/**
 * Formulario de inscripción · Asesorías de Programación
 *
 * Cómo usarlo:
 *   1. Entra a https://script.google.com  →  "Nuevo proyecto".
 *   2. Borra lo que trae y pega TODO este archivo. Guarda (Ctrl+S).
 *   3. Arriba elige la función  crearFormulario  y presiona  ▶ Ejecutar.
 *      Google pedirá permisos: "Revisar permisos" → tu cuenta →
 *      "Configuración avanzada" → "Ir a ... (no seguro)" → "Permitir".
 *   4. En "Registro de ejecución" aparecen los enlaces del formulario
 *      (para compartir con estudiantes) y de la hoja de respuestas.
 *
 * A partir de ahí, cada vez que alguien se inscribe el script cuenta
 * los lugares y quita del formulario el día que llegue a CUPO.
 * Cuando los tres días se llenan, el formulario se cierra solo.
 * Para ver cuántos van por día: ejecuta  verCupos.
 */

const CUPO = 10;

const SESIONES = [
  'Lunes 19 de octubre · 11:00 a 12:00',
  'Martes 20 de octubre · 11:00 a 12:00',
  'Miércoles 21 de octubre · 11:00 a 12:00',
];

const GRUPOS = ['Grupo 1', 'Grupo 2', 'Grupo 3', 'Grupo 4'];

const TEMAS = [
  'Variables, tipos de datos y operadores',
  'Condicionales (if / elif / else)',
  'Ciclos (for / while)',
  'Funciones',
  'Listas y cadenas',
  'No sé por dónde empezar',
];

function crearFormulario() {
  const form = FormApp.create('Inscripción · Asesorías de Programación');
  form.setDescription(
    'Asesorías rumbo al examen en el Aula LSIM (primer piso PEI, laboratorio de computadoras), ' +
    'de 11:00 a 12:00.\n\n' +
    'Máximo ' + CUPO + ' estudiantes por sesión. Si un día ya no aparece en la lista, es porque se llenó.\n' +
    'Si te inscribes y ya no puedes ir, avisa a tu docente para liberar tu lugar.'
  );
  form.setConfirmationMessage(
    '¡Listo, ya tienes tu lugar! Te esperamos en el Aula LSIM de 11:00 a 12:00. ' +
    'Trae tu código o el ejercicio que no te sale.'
  );
  form.setAllowResponseEdits(false);
  form.setShowLinkToRespondAgain(false);

  form.addTextItem().setTitle('Nombre completo').setRequired(true);
  form.addTextItem().setTitle('Matrícula').setRequired(true);
  form.addMultipleChoiceItem().setTitle('Grupo').setChoiceValues(GRUPOS).setRequired(true);

  const sesion = form.addCheckboxItem()
    .setTitle('¿A qué sesión vas a asistir?')
    .setHelpText('Puedes marcar más de un día.')
    .setChoiceValues(SESIONES)
    .setRequired(true);

  form.addCheckboxItem()
    .setTitle('¿En qué tema necesitas ayuda?')
    .setChoiceValues(TEMAS)
    .showOtherOption(true)
    .setRequired(true);

  form.addParagraphTextItem()
    .setTitle('¿Qué ejercicio o duda concreta traes?')
    .setHelpText('Opcional, pero ayuda a que el asesor llegue preparado.');

  const hoja = SpreadsheetApp.create('Inscritos · Asesorías de Programación');
  form.setDestination(FormApp.DestinationType.SPREADSHEET, hoja.getId());

  // Los formularios nuevos pueden quedar sin publicar; esto lo publica si la API lo permite.
  if (typeof form.setPublished === 'function') form.setPublished(true);

  PropertiesService.getScriptProperties().setProperties({
    formId: form.getId(),
    sesionItemId: String(sesion.getId()),
  });

  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('alRecibirRespuesta').forForm(form).onFormSubmit().create();

  Logger.log('Enlace para estudiantes: ' + form.getPublishedUrl());
  Logger.log('Editar formulario:       ' + form.getEditUrl());
  Logger.log('Hoja de respuestas:      ' + hoja.getUrl());
}

function alRecibirRespuesta() {
  const lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    actualizarCupos();
  } finally {
    lock.releaseLock();
  }
}

function actualizarCupos() {
  const { form, sesion } = obtenerFormulario();
  const conteo = contarInscritos(form, sesion);
  const disponibles = SESIONES.filter(s => conteo[s] < CUPO);

  if (disponibles.length === 0) {
    form.setAcceptingResponses(false);
    form.setCustomClosedFormMessage(
      'Las tres sesiones ya están llenas. Si necesitas ayuda, escríbele a tu docente.'
    );
  } else {
    sesion.setChoiceValues(disponibles);
    form.setAcceptingResponses(true);
  }
}

function verCupos() {
  const { form, sesion } = obtenerFormulario();
  const conteo = contarInscritos(form, sesion);
  SESIONES.forEach(s => Logger.log(s + ': ' + conteo[s] + ' / ' + CUPO));
}

function obtenerFormulario() {
  const props = PropertiesService.getScriptProperties();
  const form = FormApp.openById(props.getProperty('formId'));
  const sesion = form.getItemById(Number(props.getProperty('sesionItemId'))).asCheckboxItem();
  return { form, sesion };
}

function contarInscritos(form, sesion) {
  const conteo = {};
  SESIONES.forEach(s => (conteo[s] = 0));
  form.getResponses().forEach(r => {
    const respuesta = r.getResponseForItem(sesion);
    if (!respuesta) return;
    respuesta.getResponse().forEach(dia => {
      if (dia in conteo) conteo[dia]++;
    });
  });
  return conteo;
}
