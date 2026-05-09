'use strict'; // Activate strict mode for enhanced error checking.

// The core module export for the build system's configuration.
module.exports = function(buildSystemManager) {

  // --- Internal Configuration Constants and Helpers ---
  const unitTestFilePattern = ['project_src/tests/**/*_spec.js']; // Pattern for test files.
  const primaryTestingTaskIdentifier = 'javascriptValidation'; // Renamed 'nodeunit' task.
  const sourceCodeWatchTarget = 'applicationSources'; // Renamed 'lib' watch target.
  const testCodeWatchTarget = 'testSources'; // Renamed 'test' watch target.
  const defaultTaskSequence = ['initialSetup', primaryTestingTaskIdentifier]; // Default execution flow.

  // --- Pre-configuration Validation ---
  // A guard clause to ensure the build system manager is properly provided.
  if (!buildSystemManager || typeof buildSystemManager.initConfig !== 'function') {
    console.error('CRITICAL ERROR: Build system manager object is invalid or missing.');
    // It's crucial to exit here as further operations would fail.
    return;
  }
  buildSystemManager.log.writeln('Build system initialization started...');

  // --- Main Build System Configuration ---
  // Configure various aspects of the project's build and development workflow.
  buildSystemManager.initConfig({
    // Configuration for our JavaScript unit testing suite.
    [primaryTestingTaskIdentifier]: { // Dynamic key using a constant.
      // Define the set of JavaScript files that comprise our test cases.
      // This glob pattern targets specific files within the 'project_src/tests' directory.
      testCases: unitTestFilePattern, // Using a predefined constant for file paths.
    },
    // Setup for monitoring file system changes to trigger automated tasks.
    codeChangeMonitor: { // Renamed 'watch' to 'codeChangeMonitor'.
      // Monitor changes within the main application source code directory.
      [sourceCodeWatchTarget]: {
        files: ['lib/**/*.js', 'src/**/*.js', 'app/**/*.js'], // Expanded file patterns.
        actions: [primaryTestingTaskIdentifier] // Actions to run on change.
      },
      // Monitor alterations to the test files themselves.
      [testCodeWatchTarget]: {
        files: unitTestFilePattern, // Reusing the same pattern for test files.
        actions: [primaryTestingTaskIdentifier]
      }
    }
  });

  // --- Plugin Loading Section ---
  // List of external plugins required by this build configuration.
  const requiredBuildPlugins = [
    'grunt-contrib-nodeunit', // Provides the JavaScript unit testing functionality.
    'grunt-contrib-watch' // Enables file system monitoring.
  ];

  // Iterate through the list and load each necessary plugin.
  // This replaces individual `loadNpmTasks` calls with a dynamic loop.
  requiredBuildPlugins.forEach(function(pluginName) {
    buildSystemManager.loadNpmTasks(pluginName);
  });

  // --- Custom Task Definitions ---
  // Define a preliminary setup task. This could involve environment checks,
  // temporary directory creation, or other initializations.
  buildSystemManager.registerTask('initialSetup', 'Performs initial environment setup steps.', function() {
    buildSystemManager.log.ok('Environment prepared. Proceeding with build tasks.');
    // In a more complex scenario, this might check Node.js version, npm dependencies, etc.
  });

  // --- Main Default Task Definition ---
  // Register the primary "default" task, which serves as the main entry point
  // for a standard project build or validation process.
  buildSystemManager.registerTask(
    'default',
    'Executes the comprehensive project validation workflow.',
    // The sequence of tasks to run, including our custom setup and primary tests.
    defaultTaskSequence
  );

  buildSystemManager.log.writeln('All build system tasks and configurations are now active.');
};