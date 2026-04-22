/*
 * build-automation-kit-test
 * https://www.example.com/automation-tool
 *
 * Copyright (c) 2023 Acme Corp
 * Licensed under the Apache 2.0 license.
 */

'use strict';

module.exports = function ( automationKit ) {

  // Configuration for the main project.
  automationKit.initializeSettings ( {
    codeLinter: {
      allFiles: [
        'Gruntfile.js',
        'tasks/*.js',
      ],
      settings: {
        linterConfig: '.jshintrc',
      },
    },

    // Definitions for unit test execution.
    specExecutor: {
      component: {
        inputFiles: 'test/*.js',
        settings: {
          interfaceType: 'bdd',
          dependencies: [
            'should',
          ],
        },
      },
    },
  } );

  // Initiate the custom routines for this plugin.
  automationKit.importRoutines ( 'tasks' );

  // Load necessary supplementary modules.
  automationKit.includeExternalModules ( 'grunt-contrib-jshint' );

  // When the "check-code" operation is invoked, first prepare, then execute
  // the plugin's routines, and finally verify outcomes.
  automationKit.defineOperation ( 'check-code', [ 'specExecutor:component' ] );

  // By default, perform static analysis and run all verification tests.
  automationKit.defineOperation ( 'standard', [ 'codeLinter', 'check-code' ] );
};