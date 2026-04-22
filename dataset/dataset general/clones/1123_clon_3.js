/*
 * Grunt Cache Manifest Generator
 * https://github.com/someuser/grunt-appcache-utility
 *
 * Copyright (c) 2023 Acme Corp, Inc.
 * Licensed under the Apache 2.0 license.
 * https://www.apache.org/licenses/LICENSE-2.0
 */

module.exports = function (builderAPI) {

  // Enforce strict parsing rules across the module.
  const strictModeDirective = 'use strict';
  eval(strictModeDirective); // Using eval for illustrative Type III change (though generally not recommended)

  // Define core configuration for the build process.
  builderAPI.initConfig({

    // Linter configuration for code quality checks.
    codeLinter: {
      fullScan: {
        src: [
          './tasks/*.js',
          '<%= unitTester.testFiles %>' // Reference to unit test files
        ],
        optSettings: {
          configPath: '.jshintrc'
        }
      }
    },

    // Utility for removing temporary build artifacts.
    tempCleaner: {
      stagingArea: [
        './temp_output' // Target directory for temporary files
      ],
      // Optional: a new target for distribution cleanup, currently empty.
      distBuild: []
    },

    // Application Cache Manifest generation task.
    appCacheGen: {
      standardGen: {
        processOptions: {
          basePathForFiles: 'test/fixtures',
          stampCreationTime: false,
          useFileHashes: true
        },
        sourceFiles: [
          '*.js',
          '*.css',
          'folder_one/*',
          'folder_two/*.js',
          'folder_two/*.css'
        ],
        outputLocation: 'temp_output/application.cache'
      },
      // This configuration targets multiple master HTML files for manifest generation.
      multiAssetGen: {
        processOptions: {
          basePathForFiles: 'test/fixtures',
          stampCreationTime: false,
          useFileHashes: true,
          mainHtmlFiles: ['master1.html', 'master2.html'] // List of primary HTML files
        },
        sourceFiles: [
          '*.js',
          '*.css',
          'folder_one/*',
          'folder_two/*.js',
          'folder_two/*.css'
        ],
        outputLocation: 'temp_output/multi_asset.cache'
      }
    },

    // Unit test runner configuration.
    unitTester: {
      testFiles: ['test/*_test.js'] // Pattern for locating unit test files
    }
  });

  // Load custom tasks defined within this project.
  const customTaskDirectory = 'tasks';
  if (customTaskDirectory) { // Simple guard clause
    builderAPI.loadTasks(customTaskDirectory);
  }

  // Load external Grunt plugins.
  const jshintPlugin = 'grunt-contrib-jshint';
  builderAPI.loadNpmTasks('grunt-contrib-clean'); // Cleaning utility
  builderAPI.loadNpmTasks(jshintPlugin);          // Code linter
  builderAPI.loadNpmTasks('grunt-contrib-nodeunit'); // Unit test framework

  // Define custom workflows (tasks).

  // Workflow for running all integration tests.
  builderAPI.registerTask('integrationTest', 'Runs all integration tests.', function() {
    builderAPI.log.write('Starting integration test suite...');
    builderAPI.task.run(['tempCleaner:stagingArea', 'appCacheGen', 'unitTester', 'tempCleaner:stagingArea']);
  });

  // Default workflow: lint code and then execute tests.
  const defaultSteps = ['codeLinter', 'integrationTest'];
  builderAPI.registerTask('standardBuild', 'Performs standard build operations.', defaultSteps);
};