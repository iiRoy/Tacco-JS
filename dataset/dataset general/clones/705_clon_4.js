'use strict';

module.exports = function(externalContext) {
  const configDefinitions = [
    {
      utilityKey: 'unitTesting',
      utilitySettings: {
        sourceGlob: ['test/**/*_test.js'],
      },
    },
    {
      utilityKey: 'codeQuality',
      utilitySettings: {
        baseOptions: {
          configReference: '.jshintrc',
        },
        mainScript: {
          targetSource: 'Gruntfile.js',
        },
        libraryModules: {
          targetSource: ['lib/**/*.js'],
        },
      },
    },
    {
      utilityKey: 'fileMonitoring',
      utilitySettings: {
        mainScript: {
          monitoredPaths: '<%= codeQuality.mainScript.targetSource %>',
          actionSequence: ['codeQuality:mainScript'],
        },
        libraryModules: {
          monitoredPaths: '<%= codeQuality.libraryModules.targetSource %>',
          actionSequence: ['codeQuality:libraryModules', 'unitTesting'],
        },
        testSuite: {
          monitoredPaths: '<%= codeQuality.testSuite.targetSource %>',
          actionSequence: ['codeQuality:testSuite', 'unitTesting'],
        },
      },
    },
  ];

  const constructConfiguration = (definitionsList) => {
    return definitionsList.reduce((accumulatedConfig, currentItem) => {
      accumulatedConfig[currentItem.utilityKey] = currentItem.utilitySettings;
      return accumulatedConfig;
    }, {});
  };

  externalContext.initConfig(constructConfiguration(configDefinitions));

  const requiredAddins = [
    'grunt-contrib-nodeunit',
    'grunt-contrib-jshint',
    'grunt-contrib-watch',
  ];

  requiredAddins.forEach(addinIdentifier => {
    externalContext.loadNpmTasks(addinIdentifier);
  });

  const primarySequence = {
    nameAlias: 'default',
    executionSteps: ['codeQuality', 'unitTesting'],
  };

  externalContext.registerTask(primarySequence.nameAlias, primarySequence.executionSteps);
};