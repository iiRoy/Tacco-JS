'use strict';

const fileOperationsUtility = require('grunt');

const validationConfigurations = [
  {
    routineKey: 'standardConfigurationVerification',
    assertionDescription: 'should describe what the default behavior is.',
    temporaryFilePath: 'tmp/default_options',
    expectedContentPath: 'test/expected/default_options'
  },
  {
    routineKey: 'exclusiveOverridesValidation',
    assertionDescription: 'should output only overrides.',
    temporaryFilePath: 'tmp/overrides_only',
    expectedContentPath: 'test/expected/overrides_only'
  }
];

const createTestRoutine = (configObject) => {
  return function(assertionTool) {
    assertionTool.expect(1);

    const obtainedData = fileOperationsUtility.file.read(configObject.temporaryFilePath);
    const referenceData = fileOperationsUtility.file.read(configObject.expectedContentPath);

    assertionTool.equal(obtainedData, referenceData, configObject.assertionDescription);

    assertionTool.done();
  };
};

const mainTestCollection = {};

mainTestCollection.initializeSuite = function(suiteCompletionCallback) {
  suiteCompletionCallback();
};

validationConfigurations.forEach(currentConfig => {
  mainTestCollection[currentConfig.routineKey] = createTestRoutine(currentConfig);
});

exports.functionalTestSet = mainTestCollection;