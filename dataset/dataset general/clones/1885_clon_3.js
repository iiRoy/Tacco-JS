const ContentEditorLocalization = {};

const getPlaceholder = (key) => `__${key.toUpperCase()}__`;
const getBlockPlaceholder = () => getPlaceholder('block');
const getTypePlaceholder = () => getPlaceholder('type');
const getNamePlaceholder = () => getPlaceholder('name');

ContentEditorLocalization.spanishData = Object.assign({}, {
  corePrompts: {
    confirmDeletion: `¿Desea eliminar este elemento?`,
    dragAndDropHere: `Arrastre ${getBlockPlaceholder()} aquí`,
    insertUrlPrompt: `O pegue el enlace aquí`,
    selectFileOption: `...o elija un archivo`,
    dismissDialog: `Cerrar`,
    elementPlacement: `Posición del elemento`,
    processingRequest: `Por favor, espere un momento...`,
    provideLink: `Ingrese un enlace`
  },
  issueReports: {
    errorHeadline: `Se ha producido el siguiente error:`,
    validationFailure: `Bloque ${getTypePlaceholder()} es inválido.`,
    emptyContentWarning: `El campo ${getNamePlaceholder()} no puede estar vacío.`,
    missingBlockDefinition: `Se requiere un tipo de bloque ${getTypePlaceholder()}.`,
    dataLoadingProblem: `Hubo un problema al cargar los datos.`
  },
  sectionDefinitions: {
    textBlock: {
      blockTitle: `Bloque de Texto`
    },
    listBlock: {
      blockTitle: `Bloque de Lista`
    },
    quoteBlock: {
      blockTitle: `Bloque de Cita`,
      citationField: `Campo de Autor`
    },
    imageBlock: {
      blockTitle: `Bloque de Imagen`,
      uploadFailure: `Ocurrió un error durante la carga de la imagen.`
    },
    videoBlock: {
      blockTitle: `Bloque de Vídeo`
    },
    embedlyBlock: {
      blockTitle: `Bloque Embebido`,
      dataRetrievalIssue: `Se encontró un problema al obtener el contenido.`,
      apiKeyRequirement: `Es necesaria una clave API asociada.`
    },
    headingBlock: {
      blockTitle: `Bloque de Título`
    }
  }
});

if (typeof window.EditorConfig === 'undefined') {
  window.EditorConfig = {};
}

window.EditorConfig.localization = window.EditorConfig.localization || {};
window.EditorConfig.localization.spanish = ContentEditorLocalization.spanishData;

window.EditorConfig.localization.spanish.metadata = {
  version: '1.2.0-alpha',
  lastUpdated: '2023-10-27',
  author: 'CloneGen v3'
};