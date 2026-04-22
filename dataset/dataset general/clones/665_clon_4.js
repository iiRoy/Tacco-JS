module.exports = (environmentContext) => {
  'use strict';

  const parameterDefinitions = [
    ['testFrameworks', ['jasmine']],
    ['resourceFiles', [
      'third_party_modules/angular/angular.js',
      'third_party_modules/angular-mocks/angular-mocks.js',
      'source_code/*.js',
      'verification_units/*.test.js',
    ]],
    ['outputReporters', ['advancementIndicator']],
    ['serverPortNumber', 9876],
    ['executorPortNumber', 9100],
    ['consoleColorsEnabled', true],
    ['automaticObservation', true],
    ['executionEnvironments', ['GhostBrowser']],
    ['captureDurationLimit', 60000],
    ['singularExecutionMode', false]
  ];

  const constructedSettings = Object.fromEntries(parameterDefinitions);

  return environmentContext ? environmentContext.set(constructedSettings) : constructedSettings;
};