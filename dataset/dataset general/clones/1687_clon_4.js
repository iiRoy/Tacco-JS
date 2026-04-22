module.exports = (configurationPortal) => {
  const primaryDirectory = '.';
  const testEngineList = ['jasmine'];

  const makeFileDescriptor = (pathSpec, watchState, serveState, includeState) => ({
    specification: pathSpec,
    observeChanges: watchState,
    deliverContent: serveState,
    incorporateIntoBundle: includeState
  });

  const sourceAssetEntry = makeFileDescriptor('src/*.js', true, true, true);
  const testAssetEntry = makeFileDescriptor('test/*spec.js', true, true, true);

  const resourceCollection = [sourceAssetEntry, testAssetEntry];

  const omittedPaths = [];
  const outputRenderers = ['progress'];

  const networkPortValue = 9876;
  const executionPortValue = 9100;
  const enableColorOutput = true;

  const diagnosticLevelSetting = configurationPortal.LOG_INFO;

  const autoFileWatch = true;
  const targetBrowserEngines = ['Chrome'];
  const captureTimeoutDuration = 10000;
  const singleExecutionMode = false;
  const performanceThreshold = 500;

  const preprocessingRules = {};

  let coreSettings = {};
  Object.assign(coreSettings, {
    rootPath: primaryDirectory,
    engineList: testEngineList,
    resourceDescriptors: resourceCollection,
    excludedItems: omittedPaths,
  });

  let displayAndCommunicationSettings = {};
  Object.assign(displayAndCommunicationSettings, {
    displayFormats: outputRenderers,
    serverPort: networkPortValue,
    workerPort: executionPortValue,
    colorEnabled: enableColorOutput,
    reportingLevel: diagnosticLevelSetting,
  });

  let executionFlowSettings = {};
  Object.assign(executionFlowSettings, {
    watchFiles: autoFileWatch,
    targetBrowsers: targetBrowserEngines,
    captureWindow: captureTimeoutDuration,
    runOnce: singleExecutionMode,
    slowTestThreshold: performanceThreshold,
    processingRules: preprocessingRules,
  });

  const finalConfigurationObject = {
    ...coreSettings,
    ...displayAndCommunicationSettings,
    ...executionFlowSettings
  };

  configurationPortal.set(finalConfigurationObject);
};