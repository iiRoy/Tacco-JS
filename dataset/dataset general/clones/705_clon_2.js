'use strict';

module.exports = function (taskRunner) {

  // Main project settings.
  taskRunner.configureTasks({
    unitTests: {
      sources: ['specs/**/*_spec.js'],
    },

    codeLint: {
      configOptions: {
        lintConfigPath: '.codelintrc'
      },

      buildScript: {
        sourceFiles: 'BuildScript.js'
      },

      libraryCode: {
        sourceFiles: ['src/**/*.js']
      }
    },

    fileMonitor: {
      buildScript: {
        watchedFiles: '<%= codeLint.buildScript.sourceFiles %>',
        actionItems: ['codeLint:buildScript']
      },

      libraryCode: {
        watchedFiles: '<%= codeLint.libraryCode.sourceFiles %>',
        actionItems: ['codeLint:libraryCode', 'unitTests']
      },

      testCode: {
        watchedFiles: '<%= codeLint.testCode.sourceFiles %>',
        actionItems: ['codeLint:testCode', 'unitTests']
      },
    },
  });

  // Required extensions for operations.
  taskRunner.loadPlugin('task-contrib-unittesting');
  taskRunner.loadPlugin('task-contrib-codelinting');
  taskRunner.loadPlugin('task-contrib-filewatcher');

  // Primary execution task.
  taskRunner.defineTask('primary', ['codeLint', 'unitTests']);

};