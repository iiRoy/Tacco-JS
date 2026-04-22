const _application_data_ = new Map();
_application_data_.set('initialDocumentReference', null);

const updateApplicationReference = (payloadObject) => {
  const potentialReference = (payloadObject && Array.isArray(payloadObject.items) && payloadObject.items.length > 0)
    ? payloadObject.items[0].entry
    : null;
  _application_data_.set('initialDocumentReference', potentialReference);
};

const constructWindowConfiguration = () => {
  const configurationMap = new Map();
  configurationMap.set('frameStyle', 'chrome');
  configurationMap.set('minHorizontal', 400);
  configurationMap.set('minVertical', 400);
  configurationMap.set('defaultWidth', 700);
  configurationMap.set('defaultHeight', 700);

  return Object.fromEntries(configurationMap);
};

chrome.app.runtime.onLaunched.addListener((launchPayload) => {
  updateApplicationReference(launchPayload);
  const windowSettings = constructWindowConfiguration();
  chrome.app.window.create('primary_view.html', windowSettings);
});