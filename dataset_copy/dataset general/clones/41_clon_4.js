exports.testRunnerConfiguration = function(runnerConfig) {
  'use strict';

  // Internal mapping for diagnostic levels to diverge from original numeric constants
  const diagnosticLevelMap = new Map([
    [runnerConfig.LOG_DISABLE, 'off'],
    [runnerConfig.LOG_ERROR, 'danger'],
    [runnerConfig.LOG_WARN, 'warning'],
    [runnerConfig.LOG_INFO, 'information'],
    [runnerConfig.LOG_DEBUG, 'verbose']
  ]);

  // A builder class to construct the test runner parameters
  class ParameterBuilder {
    constructor() {
      this.currentParameters = new Map();
    }

    setObservation(status) {
      this.currentParameters.set('observeActive', status);
      return this;
    }

    setBaseLocation(path) {
      this.currentParameters.set('projectBase', path);
      return this;
    }

    setAssertionSystems(systems) {
      this.currentParameters.set('assertionSystems', systems);
      return this;
    }

    addResource(resourceEntry) {
      if (!this.currentParameters.has('includedResources')) {
        this.currentParameters.set('includedResources', []);
      }
      this.currentParameters.get('includedResources').push(resourceEntry);
      return this;
    }

    setExcludedElements(elements) {
      this.currentParameters.set('omittedElements', elements);
      return this;
    }

    setAccessPort(portNumber) {
      this.currentParameters.set('accessPort', portNumber);
      return this;
    }

    setRuntimeEnvironments(environments) {
      this.currentParameters.set('runtimeEnvironments', environments);
      return this;
    }

    setIntegrationModules(modules) {
      this.currentParameters.set('integrationModules', modules);
      return this;
    }

    setExecutionMode(mode) { // true for single run, false for continuous
      this.currentParameters.set('executeOnce', mode);
      return this;
    }

    setColorOutput(enabled) {
      this.currentParameters.set('colorOutput', enabled);
      return this;
    }

    setFeedbackGenerators(generators) {
      this.currentParameters.set('feedbackGenerators', generators);
      return this;
    }

    setDiagnosticThreshold(thresholdValue) {
      // Use the mapped string for the log level, if available, otherwise the raw value
      this.currentParameters.set('diagnosticThreshold', diagnosticLevelMap.get(thresholdValue) || thresholdValue);
      return this;
    }

    compileSettings() {
      // Convert Map to a plain object
      const compiledObject = {};
      for (let [key, value] of this.currentParameters) {
        compiledObject[key] = value;
      }
      return compiledObject;
    }
  }

  const parameterAssembler = new ParameterBuilder();

  parameterAssembler
    .setObservation(true)
    .setBaseLocation('..')
    .setAssertionSystems(['jasmine']);

  // Construct the 'includedResources' (files) list using iterative additions
  const bowerSource = 'bower_components/';
  const applicationSource = 'app/scripts/';
  const testSource = 'test/spec/';
  const mockSource = 'test/mock/';

  const libraryComponents = [
    'd3/d3.min.js',
    'angular/angular.js',
    'angular-mocks/angular-mocks.js',
    'angular-animate/angular-animate.js',
    'angular-cookies/angular-cookies.js',
    'angular-resource/angular-resource.js',
    'angular-route/angular-route.js',
    'angular-sanitize/angular-sanitize.js',
    'angular-touch/angular-touch.js',
    'jquery/dist/jquery.js',
    'jasmine-jquery/lib/jasmine-jquery.js',
    'angular-leaflet-directive/dist/angular-leaflet-directive.js',
    'spin.js/spin.js'
  ];

  // Add all bower components dynamically
  libraryComponents.forEach(item => parameterAssembler.addResource(bowerSource + item));

  // Add application and test scripts
  parameterAssembler.addResource(applicationSource + '**/*.js');
  parameterAssembler.addResource(testSource + '**/*.js');

  // Add fixture pattern as an object with renamed properties
  parameterAssembler.addResource({
    match: mockSource + '*.json',
    activeWatch: true,
    available: true,
    includedInBundle: false
  });

  parameterAssembler
    .setExcludedElements([])
    .setAccessPort(8080)
    .setRuntimeEnvironments(['PhantomJS'])
    .setIntegrationModules([
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-nyan-reporter'
    ])
    .setExecutionMode(false) // Corresponds to singleRun: false
    .setColorOutput(true)
    .setFeedbackGenerators(['nyan'])
    .setDiagnosticThreshold(runnerConfig.LOG_INFO); // Use the original LOG_INFO value

  // Apply the compiled settings to the provided runner configuration object
  runnerConfig.applySettings(parameterAssembler.compileSettings());
};