'use strict'; // Enforce strict parsing and execution for this module.

/**
 * This module exports a configuration function for the Grunt build system.
 * It sets up various development and build tasks, including code quality
 * checks, minification, and unit testing.
 * @param {object} buildToolInstance - The Grunt instance object.
 */
module.exports = function(buildToolInstance) {
  // Validate that the Grunt instance is provided and has essential methods.
  if (!buildToolInstance || typeof buildToolInstance.initConfig !== 'function') {
    // In a real application, this might throw an error or log to a specific stream.
    // For a clone, a console warning is sufficient to show the addition of a guard.
    console.warn("Grunt instance (buildToolInstance) is missing or invalid. Configuration aborted.");
    return;
  }

  // Define some common directory paths and file names for better maintainability.
  const applicationSourceDir = 'source/';
  const testSpecificationDir = 'specs/';
  const finalBuildOutputDir = 'build/';
  const primaryApplicationScript = 'ng-google-places-module.js';
  const unitTestFilesPattern = testSpecificationDir + '**/*.spec.js';
  const buildConfigurationFiles = ['build-settings.js', applicationSourceDir + primaryApplicationScript, unitTestFilesPattern];
  const projectManifestFile = 'project-manifest.json'; // Renamed from package.json

  /**
   * Helper function to dynamically generate a standardized banner for minified files.
   * @param {string} projectName - The name of the project.
   * @returns {string} The formatted banner string.
   */
  const createMinificationBanner = (projectName) => {
    const currentTimestamp = buildToolInstance.template.today("yyyy-mm-dd HH:MM:ss");
    // Added a placeholder for a version number, demonstrating a new fragment in the string.
    return `/*! ${projectName} v1.0.0 | Built on ${currentTimestamp} | (c) Acme Corp. */\n`;
  };

  // Initialize the Grunt configuration object with various task settings.
  buildToolInstance.initConfig({
    // Retrieve essential metadata about the project from its manifest file.
    projectDetails: buildToolInstance.file.readJSON(projectManifestFile),

    // Configuration for the JavaScript code quality analysis (JSHint).
    jsCodeValidator: {
      // Specifies the set of files that need to be linted.
      inspectionTargets: buildConfigurationFiles,
      // Custom settings to override JSHint's default behavior.
      validatorOptions: {
        // Enforce strict mode for all JavaScript files.
        strictModeEnforcement: true, // Equivalent to 'globalstrict'
        // A list of global variables that JSHint should recognize without warning.
        recognizedGlobalVariables: {
          jQuery: false, // Indicate usage, but not necessarily a global definition.
          console: true,
          module: true,
          document: true,
          expect: true,
          it: true,
          spyOn: true,
          beforeEach: true,
          angular: true,
          inject: true,
          describe: true,
          afterEach: true,
          google: true,
          // Adding a non-standard global for demonstration purposes.
          _customAppGlobal: true
        },
        // Introduce a new, non-standard JSHint option for cloning purposes.
        maxFunctionComplexity: 15
      }
    },

    // Configuration for JavaScript code minification and compression (UglifyJS).
    codeCompressor: {
      // General options applicable across all minification sub-tasks.
      globalCompressionSettings: {
        // A descriptive header comment to be prepended to the minified output.
        banner: createMinificationBanner('<%= projectDetails.name %>')
      },
      // Specific configuration for generating the production-ready distribution.
      productionDistribution: {
        files: {
          [`${finalBuildOutputDir}<%= projectDetails.name %>.min.js`]: [applicationSourceDir + primaryApplicationScript]
        }
      }
    },

    // Configuration for the unit test execution framework (Karma).
    testExecutionEngine: {
      // Settings for running component-level unit tests.
      moduleUnitTests: {
        configFilePath: 'karma-test-setup.js' // Renamed from karma.conf.js
      }
    },

    // Placeholder for a future task to remove build artifacts.
    // This section is added to show a new configuration block,
    // even if the corresponding plugin isn't loaded below.
    artifactCleaner: {
      options: {
        dryRun: false // Added a new option
      },
      temporaryFiles: [finalBuildOutputDir + '**/*', 'temp/']
    }
  });

  // Load various Grunt plugins that provide the actual task implementations.
  // Using a slightly different naming convention for the loading function.
  buildToolInstance.loadGruntPlugin('grunt-contrib-jshint');
  buildToolInstance.loadGruntPlugin('grunt-contrib-uglify');
  buildToolInstance.loadGruntPlugin('grunt-karma');
  // Intentionally omitting `grunt-contrib-clean` load, though `artifactCleaner` task is defined.

  // Define the primary workflow task, which orchestrates multiple sub-tasks.
  // The order of execution has been re-arranged for the clone.
  const defaultWorkflowSequence = ['jsCodeValidator', 'codeCompressor', 'testExecutionEngine'];
  buildToolInstance.defineMainTask('default', defaultWorkflowSequence); // Renamed `registerTask`

  // Add a new, simple custom task that just logs a message to the console.
  buildToolInstance.registerTask('helloGrunt', 'Displays a friendly greeting message.', function() {
    buildToolInstance.log.writeln('----- Grunt build process initialized! Welcome! -----');
    buildToolInstance.log.ok('Configuration loaded successfully.');
  });
};