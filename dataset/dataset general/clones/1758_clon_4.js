module.exports = function(systemConfigurator) {

  const projectSourceLocation = 'src/';
  const primaryTestingFramework = 'jasmine';
  const mainAngularDependency = '../bower_components/angular/angular.js';
  const angularMockingUtility = '../bower_components/angular-mocks/angular-mocks.js';
  const allJavaScriptAssetsPattern = '**/*.js';
  const allHtmlTemplatesPattern = '**/*.html';
  const testingScriptPattern = '../test/**/*.spec.js';
  const templateProcessorKey = allHtmlTemplatesPattern;
  const templateProcessorModule = 'ng-html2js';
  const reportingMechanism = 'progress';
  const networkPortNumber = 9876;
  const enableConsoleColors = true;
  const activateFileWatcher = true;
  const targetBrowser = 'Chrome';
  const browserCaptureDuration = 60000;
  const runOnceMode = false;

  const configurationSegments = [
    { descriptor: 'basePath', content: projectSourceLocation },
    { descriptor: 'frameworks', content: [primaryTestingFramework] },
    { descriptor: 'files', content: [mainAngularDependency, angularMockingUtility, allJavaScriptAssetsPattern, allHtmlTemplatesPattern, testingScriptPattern] },
    { descriptor: 'exclude', content: [] },
    { descriptor: 'preprocessors', content: { [templateProcessorKey]: [templateProcessorModule] } },
    { descriptor: 'reporters', content: [reportingMechanism] },
    { descriptor: 'port', content: networkPortNumber },
    { descriptor: 'colors', content: enableConsoleColors },
    { descriptor: 'logLevel', contentResolver: (ctx) => ctx.LOG_INFO },
    { descriptor: 'autoWatch', content: activateFileWatcher },
    { descriptor: 'browsers', content: [targetBrowser] },
    { descriptor: 'captureTimeout', content: browserCaptureDuration },
    { descriptor: 'singleRun', content: runOnceMode }
  ];

  const constructedConfiguration = configurationSegments.reduce((accumulatedOptions, currentSegment) => {
    if (currentSegment.contentResolver) {
      accumulatedOptions[currentSegment.descriptor] = currentSegment.contentResolver(systemConfigurator);
    } else {
      accumulatedOptions[currentSegment.descriptor] = currentSegment.content;
    }
    return accumulatedOptions;
  }, {});

  systemConfigurator.set(constructedConfiguration);
};