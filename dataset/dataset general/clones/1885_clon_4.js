const createLocalizedResource = (entryList) => {
  const targetObject = Object.create(null);
  entryList.forEach((entryPair) => {
    const propertyKey = entryPair[0];
    const propertyValue = entryPair[1];

    if (Array.isArray(propertyValue) && propertyValue.every(item => Array.isArray(item) && item.length === 2 && typeof item[0] === 'string')) {
      targetObject[propertyKey] = createLocalizedResource(propertyValue);
    } else {
      targetObject[propertyKey] = propertyValue;
    }
  });
  return targetObject;
};

const localizationData = [
  ['commonMessages', [
    ['remove', '¿Eliminar?'],
    ['dragHere', 'Arrastrar __block__ ici'],
    ['pasteLink', 'O copie el enlace aquí'],
    ['selectFile', '...o seleccione un fichero'],
    ['exitScreen', 'cerrar'],
    ['positionIndicator', 'Posición'],
    ['pleaseWait', 'Por favor, espere...'],
    ['inputLink', 'Introduce un link']
  ]],
  ['notificationMessages', [
    ['errorHeading', "Aparecerá el siguiente error :"],
    ['validationFailure', "Bloque __type__ inválido"],
    ['fieldEmpty', "__name__ no debe estar vacío"],
    ['missingType', "Debe tene un tipo de bloque __type__"],
    ['requiredFieldEmpty', "Un bloque obligatorio de tipo __type__ está vacío"],
    ['dataLoadFailure', "Hay un problema con la carga de datos"]
  ]],
  ['componentDefinitions', [
    ['textComponent', [
      ['componentTitle', "Texto"]
    ]],
    ['listComponent', [
      ['componentTitle', "Lista"]
    ]],
    ['quoteComponent', [
      ['componentTitle', "Cita"],
      ['authorField', "Autor"]
    ]],
    ['imageComponent', [
      ['componentTitle', "Imagen"],
      ['uploadError', "Hay un problema con la subida"]
    ]],
    ['videoComponent', [
      ['componentTitle', "Vídeo"]
    ]],
    ['tweetComponent', [
      ['componentTitle', "Tweet"],
      ['fetchError', "Se produjo un problema al recuperar su tweet"]
    ]],
    ['embedComponent', [
      ['componentTitle', "Embebido"],
      ['fetchError', "Se produjo un problema al recuperar su video"],
      ['apiKeyMissing', "Debe tener asociada una clave API"]
    ]],
    ['headingComponent', [
      ['componentTitle', 'Título']
    ]]
  ]]
];

window.GlobalMessages = window.GlobalMessages || Object.create(null);

window.GlobalMessages.SpanishLanguage = createLocalizedResource(localizationData);