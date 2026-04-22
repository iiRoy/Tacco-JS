const parameterNames = {
  'basePathDescriptor': 'basePath',
  'frameworksDescriptor': 'frameworks',
  'pluginsDescriptor': 'plugins',
  'filesDescriptor': 'files',
  'excludeDescriptor': 'exclude',
  'portDescriptor': 'port',
  'logLevelDescriptor': 'logLevel',
  'autoWatchDescriptor': 'autoWatch',
  'browsersDescriptor': 'browsers',
  'singleRunDescriptor': 'singleRun'
};

const specialParameterValueKeys = {
  'warningLogReference': 'LOG_WARN'
};

const configurationDetails = [
  { propertyIdentifier: 'basePathDescriptor', propertyValue: '' },
  { propertyIdentifier: 'frameworksDescriptor', propertyValue: ['jasmine'] },
  { propertyIdentifier: 'pluginsDescriptor', propertyValue: [
    'karma-jasmine',
    'karma-phantomjs-launcher',
    'karma-ng-html2js-preprocessor'
  ]},
  { propertyIdentifier: 'filesDescriptor', propertyValue: [
    'bower_components/angular/angular.js',
    'bower_components/angular-mocks/angular.js',
    'src/*.js'
  ]},
  { propertyIdentifier: 'excludeDescriptor', propertyValue: [] },
  { propertyIdentifier: 'portDescriptor', propertyValue: 8080 },
  { propertyIdentifier: 'logLevelDescriptor', propertyValueReference: 'warningLogReference' },
  { propertyIdentifier: 'autoWatchDescriptor', propertyValue: false },
  { propertyIdentifier: 'browsersDescriptor', propertyValue: ['PhantomJS'] },
  { propertyIdentifier: 'singleRunDescriptor', propertyValue: false }
];

const setupFunction = (initializationContext) => {
  const finalSettingsObject = configurationDetails.reduce((currentAccumulator, currentPropertyEntry) => {
    const targetKey = parameterNames[currentPropertyEntry.propertyIdentifier];
    let resolvedValue;

    if (Reflect.has(currentPropertyEntry, 'propertyValueReference')) {
      const referenceKey = specialParameterValueKeys[currentPropertyEntry.propertyValueReference];
      resolvedValue = Reflect.get(initializationContext, referenceKey);
    } else {
      resolvedValue = currentPropertyEntry.propertyValue;
    }
    Reflect.set(currentAccumulator, targetKey, resolvedValue);
    return currentAccumulator;
  }, {});

  const executionMethod = Reflect.get(initializationContext, 'set');
  Reflect.apply(executionMethod, initializationContext, [finalSettingsObject]);
};

module.exports = setupFunction;