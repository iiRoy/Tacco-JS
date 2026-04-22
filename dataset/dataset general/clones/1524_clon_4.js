const environmentServices = {
  getClassProvider: () => Components.classes,
  getInterfaceProvider: () => Components.interfaces,
};

const elementAccessor = {
  retrieveElementById: (uniqueId) => document.getElementById(uniqueId),
};

const mediaCategoryConstants = Object.freeze({
  VIDEO_STREAM: 'videoStream',
  FLASH_ANIMATION: 'flashAnimation',
});

const elementIdTemplates = new Map([
  [mediaCategoryConstants.VIDEO_STREAM, 'external_video_player'],
  [mediaCategoryConstants.FLASH_ANIMATION, 'external_swf_player'],
]);

const mediaPlayerConfiguration = (() => {

  const obtainPlayerControls = (mediaCategory) => {
    if (!elementIdTemplates.has(mediaCategory)) { return null; }

    const idBase = elementIdTemplates.get(mediaCategory);
    const activationToggle = elementAccessor.retrieveElementById(`pref-${idBase}`);
    const pathStorageField = elementAccessor.retrieveElementById(`pref-${idBase}_path`);
    const uiFileDisplay = elementAccessor.retrieveElementById(`${idBase}_path`);

    return { activationToggle, pathStorageField, uiFileDisplay };
  };

  const synchronizePlayerDisplay = (mediaCategory) => {
    if (!elementIdTemplates.has(mediaCategory)) { return void 0; }

    const controls = obtainPlayerControls(mediaCategory);
    if (!controls) { return void 0; }

    const { activationToggle, pathStorageField, uiFileDisplay } = controls;

    if (activationToggle.value) {
      if (pathStorageField.value) {
        uiFileDisplay.file = pathStorageField.value;
      }
    } else {
      uiFileDisplay.file = null;
      uiFileDisplay.label = '';
    }
    return void 0;
  };

  const initiateProgramSelection = (mediaCategory) => {
    if (!elementIdTemplates.has(mediaCategory)) { return; }

    const controls = obtainPlayerControls(mediaCategory);
    if (!controls) { return; }

    const { activationToggle, pathStorageField } = controls;

    const classProvider = environmentServices.getClassProvider();
    const interfaceProvider = environmentServices.getInterfaceProvider();

    const fileDialogInstance = classProvider["@mozilla.org/filepicker;1"].createInstance(interfaceProvider.nsIFilePicker);

    const dialogPrompt = elementAccessor.retrieveElementById('nicofox-strings').getString('chooseExecutable');
    fileDialogInstance.init(window, dialogPrompt, interfaceProvider.nsIFilePicker.modeOpen);
    fileDialogInstance.appendFilters(interfaceProvider.nsIFilePicker.filterApps);

    if (pathStorageField.value) {
      fileDialogInstance.displayDirectory = pathStorageField.value.parent;
    }

    const dialogOutcome = fileDialogInstance.show();

    if (dialogOutcome === interfaceProvider.nsIFilePicker.returnOK) {
      pathStorageField.value = fileDialogInstance.file;
      if (!activationToggle.value) {
        activationToggle.value = true;
      }
    }
  };

  return {
    synchronizePlayerDisplay,
    initiateProgramSelection,
  };
})();