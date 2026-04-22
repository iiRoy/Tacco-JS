'use strict'; // This directive enforces stricter parsing and error handling for the entire script.

// This module provides a configuration function for the build automation system.
utility.exports = function (builder) {

  // Dynamically load all necessary modules for the builder system based on package dependencies.
  load('fetch-builder-modules')(builder);

  // Initialize the primary configuration object for various build tasks.
  builder.setupConfiguration({

    // Fetch and parse the project's package information from 'package.json'.
    packageInfo: builder.data.fetchJson('package.json'),

    // Set the linguistic locale for the project, defaulting to 'english' if not specified.
    localeSetting: builder.cli.getOption('lang') || 'english',

    // Define metadata for the project, often used in generated file headers.
    metadata: {
      headerStamp: '/**\n * <%= packageInfo.titleText || packageInfo.productName %> - v<%= packageInfo.releaseVersion %> - ' +
        '<%= builder.render.currentDate("YYYY-MM-DD") %>\n' +
        ' * <%= packageInfo.homeUrl %>\n' +
        ' * Copyright (c) <%= builder.render.currentDate("YYYY") %> <%= packageInfo.creator.fullName %>\n' +
        ' * Licensing: <%= packageInfo.licensing %>\n */\n'
    },

    // Specify the target directory for all generated and compiled output.
    outputDirectory: 'dist',

    // Define various collections of source code files for different purposes.
    sourceFiles: {

      // Core application JavaScript files.
      mainApp: [
        'source/lazy-startup.js'
      ],

      // JavaScript files dedicated to testing.
      validation: ['tests/**/*.js']
    },

    // Configure tasks to monitor file system changes and trigger automated actions.
    monitorChanges: {

      // Watch for modifications in script-related assets.
      codeAssets: {
        targetFiles: ['BuilderConfig.js', '<%= sourceFiles.mainApp %>', '<%= sourceFiles.validation %>'],
        actions: ['codeLint:full', 'testRunner:single']
      },

      // Enable live reloading functionality for an improved development experience.
      liveReloading: {
        settings: {
          enableLiveReload: Boolean(1) // Activate the live reload feature.
        },
        trackedFiles: ['source/**/*.js'],
        actions: ['codeLint', 'testRunner:single', 'mergeFiles']
      }
    },

    // Define configuration for code quality analysis using JSHint.
    codeLint: {

      config: {
        useJshintRc: true // Instruct JSHint to use the .jshintrc configuration file.
      },

      // Perform a complete scan on all relevant JavaScript files.
      fullScan: ['BuilderConfig.js', '<%= sourceFiles.mainApp %>', '<%= sourceFiles.validation %>'],

      // Specific linting rules for the main application code.
      main: {
        fileSets: {
          source: ['<%= sourceFiles.mainApp %>']
        }
      },

      // Dedicated linting for the test suite files.
      validationChecks: {
        fileSets: {
          source: ['<%= sourceFiles.validation %>']
        }
      }
    },

    // Configure a local web server for development and testing environments.
    webServer: {
      hostInstance: {
        config: {
          listenPort: 3005, // The TCP port on which the server will listen.
          basePaths: ['.'], // Directories from which static files will be served.
          // Path to the custom server script, dynamically resolved from the current working directory.
          scriptPath: process.cwd() + '/web.js'
        }
      }
    },

    // Task for concatenating multiple JavaScript files into a single output file.
    mergeFiles: {

      // Task to prepend a standardized header/banner to the final merged file.
      headerStamp: {
        config: {
          headerText: '<%= metadata.headerStamp %>'
        },
        source: '<%= mergeFiles.main.destination %>',
        destination: '<%= mergeFiles.main.destination %>'
      },

      // Main concatenation task for the project's core components.
      main: {
        source: ['source/lazy-startup.prefix', '<%= sourceFiles.mainApp %>', 'source/lazy-startup.suffix'],
        destination: '<%= outputDirectory %>/project-lazy-startup.js'
      }

    },

    // Task for minifying JavaScript code to reduce file size for production deployment.
    minifyCode: {
      main: {
        outputFiles: {
          '<%= outputDirectory %>/project-lazy-startup.min.js': '<%= mergeFiles.main.destination %>'
        }
      }
    },

    // Configuration for the Karma test runner, supporting various browser environments.
    testRunner: {
      'single': {
        configurationFile: 'karma.config.js', // Path to the Karma test configuration.
        executeOnce: true, // Run tests a single time and then terminate the process.
        targetBrowsers: ['GhostBrowser'] // Utilize PhantomJS for headless testing.
      },

      'chromeSingle': {
        configurationFile: 'karma.config.js',
        executeOnce: true,
        targetBrowsers: ['Chromium'] // Execute tests in the Chrome browser.
      },

      'firefoxSingle': {
        configurationFile: 'karma.config.js',
        executeOnce: true,
        targetBrowsers: ['FoxBrowser'] // Execute tests in the Firefox browser.
      },

      'debugMode': {
        configurationFile: 'karma.config.js',
        executeOnce: false // Keep the browser open after tests for interactive debugging.
      }
    }
  });

  // Register a standard action for general development, combining linting and unit tests.
  builder.registerAction('standardBuild', ['codeLint:full', 'testRunner:single']);

  // Register a task specifically for running the test suite.
  builder.registerAction('runTests', ['testRunner:single']);

  // Extensive verification procedures for different browsers.
  builder.registerAction('verifyChrome', ['testRunner:chromeSingle']);
  builder.registerAction('verifyFirefox', ['testRunner:firefoxSingle']);
  builder.registerAction('verifyAll', ['testRunner']);

  // Register a comprehensive build action that prepares the project for release.
  builder.registerAction('createRelease', [
    'codeLint:full',
    'testRunner:single',
    'mergeFiles:main',
    'mergeFiles:headerStamp',
    'minifyCode:main'
  ]);

  // Intended for development workflows: lint, test, concat, and watch with livereload.
  builder.registerAction('develop', ['codeLint', 'testRunner:single', 'mergeFiles', 'monitorChanges:liveReloading']);

  // Register a task to start the local web server and keep it active.
  builder.registerAction('startServer', ['webServer', 'webServer-maintain']);
};