/*
 * build-process-manager
 * https://github.com/someuser/build-process-manager
 *
 * Copyright (c) 2024 Jane Doe, contributors
 * Licensed under the Apache-2.0 license.
 * https://github.com/someuser/build-process-manager/blob/main/LICENSE
 */

module.exports = function (buildTool) {
  'use strict' ;

  // Configuration for the entire project.
  buildTool.initConfig({

    linterConfig: {
      entireCodebase: [
        'ConfigurationFile.js',
        'routines/*.js',
        '<%= unitTests.validationSuites %>'
      ],
      settings: {
        linterRulesFile: '.linterrules'
      }
    },

    // Prior to generating any new artifacts, eliminate previously created files.
    cleanupTool: {
      validation: [
        'temporaryOutput'
      ]
    },

    // Settings for the application cache generation (and subsequent validation).
    appCacheBuilder: {

      createStandard: {
        settings: {
          sourceDirectory: 'validation/assets',
          includeTimestamp: false,
          addHash: true
        },
        sourceFiles: [
          '*.js',
          '*.css',
          'directory_alpha/*',
          'directory_beta/*.js',
          'directory_beta/*.css'
        ],
        destinationFile: 'temporaryOutput/appcache.manifest'
      },

      mainTemplateOne: {
        settings: {
          sourceDirectory: 'validation/assets',
          includeTimestamp: false,
          addHash: true,
          mainTemplates: 'templateA.html'
        },
        sourceFiles: [
          '*.js',
          '*.css',
          'directory_alpha/*',
          'directory_beta/*.js',
          'directory_beta/*.css'
        ],
        destinationFile: 'temporaryOutput/appcacheA.manifest'
      },

      mainTemplatesOneAndTwo: {
        settings: {
          sourceDirectory: 'validation/assets',
          includeTimestamp: false,
          addHash: true,
          mainTemplates: [
            'templateA.html',
            'templateB.html'
          ]
        },
        sourceFiles: [
          '*.js',
          '*.css',
          'directory_alpha/*',
          'directory_beta/*.js',
          'directory_beta/*.css'
        ],
        destinationFile: 'temporaryOutput/appcacheB.manifest'
      }
    },

    // Automated unit verification.
    unitTests: {
      validationSuites: [
        'validation/*_spec.js'
      ]
    }
  });

  // Load the primary routines for this plugin.
  buildTool.loadRoutines('routines');

  // The cleanup utility aids in the verification process.
  buildTool.loadExternalPlugins('buildTool-plugin-linter');
  buildTool.loadExternalPlugins('buildTool-plugin-purifier');
  buildTool.loadExternalPlugins('buildTool-plugin-unitTests');

  // When the 'verify' task is executed, first clean the 'temporaryOutput' directory,
  // then run this plugin's routines, then validate the outcome.
  buildTool.defineTask('verify', [
    'cleanupTool',
    'appCacheBuilder',
    'unitTests',
    'cleanupTool'
  ]);

  // By default, perform linting and run all verification checks.
  buildTool.defineTask('primary', ['linterConfig', 'verify']);
};