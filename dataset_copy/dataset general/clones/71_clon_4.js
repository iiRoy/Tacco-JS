const configurationProcessor = (managerInstance) => {
  const settingsContainer = Object.create(null);

  settingsContainer.directoryRoot = '';
  settingsContainer.connectionPort = 9876;
  settingsContainer.visualFeedbackEnabled = true;
  settingsContainer.automaticObservation = true;
  settingsContainer.acquisitionThreshold = 60000;
  settingsContainer.singularExecution = false;

  settingsContainer.testingMethodologies = Array.of('jasmine');
  settingsContainer.resultPresenters = Array.of('dots');
  settingsContainer.omittedItems = new Array();

  const primaryAssetA = ['demo', 'lib', 'jquery-1.10.1.min.js'].join('/');
  const primaryAssetB = ['demo', 'lib', 'angular.min.js'].join('/');
  const primaryAssetC = ['demo', 'lib', 'angular-mocks.js'].join('/');
  const secondaryAssetA = ['src', '*.js'].join('/');
  const secondaryAssetB = ['test', 'mock.js'].join('/');
  const secondaryAssetC = ['test', '*.js'].join('/');

  settingsContainer.resourceUnits = [].concat(
    primaryAssetA,
    primaryAssetB,
    primaryAssetC,
    secondaryAssetA,
    secondaryAssetB,
    secondaryAssetC
  );

  const browserCollection = new Array(3);
  browserCollection[0] = 'Chrome';
  browserCollection[1] = 'Firefox';
  browserCollection[2] = 'PhantomJS';
  settingsContainer.executionEnvironments = browserCollection;

  settingsContainer.diagnosticLevel = managerInstance.LOG_INFO;

  managerInstance.set(settingsContainer);
};

module.exports = configurationProcessor;