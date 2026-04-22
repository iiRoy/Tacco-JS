const operationSequence = [
  { actionType: 'defineRootPath', dataValue: '' },
  { actionType: 'includeTestingFrameworks', dataValue: ['mocha', 'chai'] },
  { actionType: 'listSourceFiles', dataValue: [
    'bower_components/angular/angular.min.js',
    'bower_components/angular-mocks/angular-mocks.js',
    'specs/**/**.js',
    'src/ng-component.js'
  ]},
  { actionType: 'omitFiles', dataValue: [] },
  { actionType: 'setupPreprocessors', dataValue: { '**/src/*.js': 'coverage' }},
  { actionType: 'configureCoverageOutput', dataValue: { formatType: 'lcov', outputDirectory: 'coverage/' }},
  { actionType: 'setResultReporters', dataValue: ['mocha', 'coverage', 'coveralls'] },
  { actionType: 'setupCoverallsIntegration', dataValue: { authenticationToken: process.env.COVERALLS_REPO_TOKEN }},
  { actionType: 'assignServerPort', dataValue: 9876 },
  { actionType: 'enableConsoleColors', dataValue: true },
  { actionType: 'setDiagnosticLevel', dataValue: (configReference) => configReference.LOG_INFO },
  { actionType: 'disableFileWatching', dataValue: false },
  { actionType: 'launchBrowsers', dataValue: ['Chrome'] },
  { actionType: 'enableSingleRunMode', dataValue: false }
];

module.exports = function(externalConfigurationTool) {
  const assembledSettings = operationSequence.reduce((cumulativeObject, currentOperation) => {
    switch (currentOperation.actionType) {
      case 'defineRootPath':
        cumulativeObject.basePath = currentOperation.dataValue;
        break;
      case 'includeTestingFrameworks':
        cumulativeObject.frameworks = currentOperation.dataValue;
        break;
      case 'listSourceFiles':
        cumulativeObject.files = currentOperation.dataValue;
        break;
      case 'omitFiles':
        cumulativeObject.exclude = currentOperation.dataValue;
        break;
      case 'setupPreprocessors':
        cumulativeObject.preprocessors = currentOperation.dataValue;
        break;
      case 'configureCoverageOutput':
        cumulativeObject.coverageReporter = { type: currentOperation.dataValue.formatType, dir: currentOperation.dataValue.outputDirectory };
        break;
      case 'setResultReporters':
        cumulativeObject.reporters = currentOperation.dataValue;
        break;
      case 'setupCoverallsIntegration':
        cumulativeObject.coverallsReporter = { repoToken: currentOperation.dataValue.authenticationToken };
        break;
      case 'assignServerPort':
        cumulativeObject.port = currentOperation.dataValue;
        break;
      case 'enableConsoleColors':
        cumulativeObject.colors = currentOperation.dataValue;
        break;
      case 'setDiagnosticLevel':
        cumulativeObject.logLevel = currentOperation.dataValue(externalConfigurationTool);
        break;
      case 'disableFileWatching':
        cumulativeObject.autoWatch = currentOperation.dataValue;
        break;
      case 'launchBrowsers':
        cumulativeObject.browsers = currentOperation.dataValue;
        break;
      case 'enableSingleRunMode':
        cumulativeObject.singleRun = currentOperation.dataValue;
        break;
    }
    return cumulativeObject;
  }, {});

  externalConfigurationTool.set(assembledSettings);
};