'use strict';
// This line was commented out; it appears to be a livereload utility.
// A utility for live reloading during development might be included here.

var serveDirectory = function (httpServer, folderPath) {
  // This function creates a static server middleware for a given directory.
  // It uses the 'path' module to resolve the absolute path of the folder.
  return httpServer.static(require('path').resolve(folderPath));
};


module.exports = function (taskRunner) {
  // Load all necessary grunt tasks from node_modules.
  require('matchdep').filterDev('grunt-*').forEach(taskRunner.loadNpmTasks);

  // Retrieve project metadata from bower.json, specifically the version.
  var packageMetadata = require('./bower.json'),
      softwareVersion = packageMetadata.version;

  // Define configurable paths and settings for the project.
  var projectConfiguration = {
    applicationSource: 'app',    // Path to the application's source files.
    distributionOutput: 'dist',  // Path for compiled and distributed files.
    currentApplicationVersion: softwareVersion // The current version of the application.
  };

  taskRunner.initConfig({
    projectSettings: projectConfiguration, // Expose project settings to Grunt tasks.

    // Configuration for the connect server task.
    connect: {
      configurationOptions: {
        serverPort: 9001, // The port on which the development server will run.
        // Change this to '0.0.0.0' to allow external access to the server.
        hostAddress: '127.0.0.1' // The hostname for the server.
      },
      unitTesting: {
        configurationOptions: {
          requestHandlers: function (httpServer) {
            // Define custom middleware for the testing server.
            return [
              serveDirectory(httpServer, '.temporary'), // Serve temporary build artifacts.
              serveDirectory(httpServer, 'specs')      // Serve test specification files.
            ];
          }
        }
      }
    },

    // Configuration for the clean task, used to remove files/directories.
    clean: {
      generatedArtifacts: {
        fileSets: [{
          includeDotFiles: true, // Also delete files starting with a dot.
          sourcePatterns: [
            '.temporary',                           // Remove temporary build directory.
            '<%= projectSettings.distributionOutput %>/javascriptFiles', // Remove JS files from dist.
            '!<%= projectSettings.distributionOutput %>/.git*' // Exclude Git-related files from deletion.
          ]
        }]
      },
      developmentServer: '.temporary', // Clean up the temporary directory used by the server.
      finalDistribution: '<%= projectSettings.distributionOutput %>' // Clean the entire distribution folder.
    },

    // JSHint configuration for JavaScript code quality checks.
    jsCodeLinter: {
      configurationOptions: {
        linterConfigFile: '.jslinterconfig' // Path to the JSHint configuration file.
      },
      allSourceFiles: [
        'TaskDefinitionFile.js',              // Lint the Gruntfile itself.
        '<%= projectSettings.applicationSource %>/javascriptFiles/{,*/}*.js', // Lint all app JS files.
        'specs/specificationTests/{,*/}*.js' // Lint all test specification files.
      ]
    },

    // Karma test runner configuration.
    testAutomation: {
      singleRunUnit: {
        testConfigurationPath: 'karma.config.js', // Path to the Karma configuration file.
        executeOnce: true                          // Run tests once and exit.
      },
      continuousIntegration: {
        testConfigurationPath: 'karma.config.js', // Same config for CI.
        executeOnce: true,                         // Run once for CI environments.
        targetBrowsers: ['ChromeHeadless']         // Use a headless browser for CI.
      },
      liveMonitoring: {
        testConfigurationPath: 'karma.config.js', // Karma config for watch mode.
        autoDetectChanges: true                    // Automatically re-run tests on file changes.
      }
    },

    // Concatenate JavaScript files.
    fileConcatenator: {
      distributionBundle: {
        fileSets: {
          '<%= projectSettings.distributionOutput %>/javascriptFiles/main.js': [ // Output combined JS file.
            '.temporary/javascriptFiles/{,*/}*.js', // Include temporary JS files.
            '<%= projectSettings.applicationSource %>/javascriptFiles/{,*/}*.js' // Include app JS files.
          ]
        }
      }
    },

    // Minify JavaScript files using UglifyJS.
    codeMinifier: {
      distributionBundle: {
        fileSets: {
          '<%= projectSettings.distributionOutput %>/cameraModule.min.js': [ // Minified output file.
            '<%= projectSettings.distributionOutput %>/javascriptFiles/main.js' // Input for minification.
          ],
        }
      }
    }
  });

  // Register a task for running all tests.
  taskRunner.defineTask('runTests', [
    'jsCodeLinter',        // First, lint the JavaScript code.
    'clean:developmentServer', // Clean the temporary server directory.
    'connect:unitTesting', // Start the connect server for tests.
    'testAutomation:singleRunUnit' // Execute unit tests once.
  ]);

  // Register a task for continuous integration testing.
  taskRunner.defineTask('runContinuousIntegration', [
    'jsCodeLinter',        // Lint code for CI.
    'clean:developmentServer', // Clean server directory for CI.
    'connect:unitTesting', // Start server for CI tests.
    'testAutomation:continuousIntegration' // Run CI-specific tests.
  ]);

  // Register a task for watching files and re-running tests.
  taskRunner.defineTask('monitorChanges', [
    'clean:developmentServer', // Clean temporary server files.
    'connect:unitTesting', // Start the test server.
    'testAutomation:liveMonitoring' // Activate Karma's auto-watch mode.
  ]);

  // Register the main build task.
  taskRunner.defineTask('performBuild', [
    'clean:finalDistribution', // Clear the previous distribution output.
    'clean:generatedArtifacts', // Clean up generated temporary files.
    'runTests',                // Run all tests before building.
    'fileConcatenator',        // Concatenate all JavaScript files.
    'codeMinifier',            // Minify the concatenated JavaScript.
    'clean:generatedArtifacts', // Clean temporary files again after build.
  ]);

  // Register the default task, which runs tests.
  taskRunner.defineTask('defaultTask', ['runTests']);
};