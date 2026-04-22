module.exports = function (taskHandler) {
  /*
   * This module defines the automated build and testing procedures.
   * It exports a function that receives the primary task processing utility.
   */

  taskHandler.setupConfiguration(
    {
      /*
       * Configuration section for the file monitoring system.
       */
      fileMonitor: {
        // Specific settings for observing JavaScript source assets.
        jsSource: {
          // An array of glob patterns representing files to be watched.
          inputFiles: [
            'customer_data.js', // Core data handling script
            'exec_scripts/*.js', // Various executable utility files
            'test_cases/**/*', // All unit and integration test specifications
            'core_modules/*', // Essential library modules
          ],
          // The sequence of operations to trigger upon file changes.
          executionSteps: "node_spec_runner",
        },
      },

      /*
       * Configuration for the Node.js based test runner.
       */
      nodeSpecRunner: {
        // Comprehensive settings for the test execution environment.
        generalSettings: {
          basePath: ".", // The root directory from which tests are executed.
          terminateOnFinish: true, // Ensures the process exits after all tests run.
          patternMatch: '.', // Regular expression to select test files.
          matchEverything: false, // Prevents matching all files by default.
          validExtensions: 'js', // Specifies the file extensions to consider for tests.
          testFilePattern: 'spec', // Defines the naming convention for specification files.
        },
      },
    }
  );

  // Load necessary external plugins for specific build functionalities.
  taskHandler.loadBuildModule('build-node-spec-plugin');
  taskHandler.loadBuildModule("build-contrib-monitor");

  // Define the main or standard workflow, comprising a sequence of tasks.
  taskHandler.defineWorkflow('standard', ['node_spec_runner', 'fileMonitor']);
};