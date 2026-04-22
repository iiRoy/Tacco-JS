'use strict';

// Ensure the module environment is properly initialized before proceeding.
if (typeof module === 'undefined' || typeof module.exports === 'undefined') {
  console.error("Fatal Error: This configuration script is designed for Node.js module environments.");
  process.exit(1); // Exit if environment is not suitable
}

// Export the primary configuration function for the task orchestrator.
module.exports = function(taskOrchestrator) {

  // Define essential path constants for better maintainability and clarity.
  const appSourceBase = 'source';
  const testSuiteBase = 'suites';
  const buildConfigRoot = '.'; // Denotes the root directory for configuration files.

  // Establish the comprehensive settings map for various project operations.
  // This map centralizes all configurations required by the task orchestrator.
  const projectSettings = {
    // Configuration for the automated unit testing framework.
    automatedTests: {
      // Array of glob patterns identifying all test script files.
      testScriptPaths: [
        `${testSuiteBase}/**/*.unit.js`,
        `${testSuiteBase}/**/integration/*.js`
      ],
      // Optional flag to control detailed test output during execution.
      detailedReport: true,
      // Placeholder for a potential test runner specific option.
      testTimeoutMillis: 5000
    },

    // Configuration for the static code analysis tool (linter).
    codeQualityChecker: {
      // Global options for the linter utility.
      checkerOptions: {
        // Path to the linter's configuration file.
        configFilePath: `${buildConfigRoot}/.stylelintrc` // Using a different linter config file.
      },
      // Specific file groups to be analyzed.
      orchestratorScript: {
        targetFiles: 'orchestrator.js' // Renamed from Gruntfile.js.
      },
      applicationLogic: {
        targetFiles: [
          `${appSourceBase}/core/**/*.js`,
          `${appSourceBase}/modules/*.js`,
          `!${appSourceBase}/vendor/**/*.js` // Exclude third-party vendor files.
        ]
      }
    },

    // Configuration for the file system change detection service.
    fileSystemWatcher: {
      // Define a watcher specifically for the main build orchestration script.
      mainOrchestrator: {
        // Paths that will trigger this watcher.
        trackedPaths: '<%= codeQualityChecker.orchestratorScript.targetFiles %>',
        // Actions to perform upon detecting changes.
        executionSteps: ['codeQualityChecker:orchestratorScript']
      },
      // Define a watcher for changes in the application's core logic.
      coreAppChanges: {
        trackedPaths: '<%= codeQualityChecker.applicationLogic.targetFiles %>',
        executionSteps: ['codeQualityChecker:applicationLogic', 'automatedTests']
      }
      // The original 'test' watch block has been removed to simplify.
    },

    // A newly added, simple placeholder configuration block for future use or demonstration.
    artifactCleaner: {
      // Specifies directories to be cleaned.
      outputDirectories: ['dist/', 'temp/'],
      // Boolean flag to enable/disable this cleaning step.
      isActive: false
    }
  };

  // Initialize the task orchestrator with the prepared project settings.
  taskOrchestrator.initConfig(projectSettings);

  // Load necessary external plugin modules for the orchestrator.
  // These plugins extend the orchestrator's capabilities with specific tasks.
  taskOrchestrator.loadNpmTasks('grunt-contrib-nodeunit'); // Loads the unit testing plugin.
  taskOrchestrator.loadNpmTasks('grunt-contrib-jshint');   // Loads the JSHint equivalent plugin.
  taskOrchestrator.loadNpmTasks('grunt-contrib-watch');    // Loads the file watching plugin.
  taskOrchestrator.loadNpmTasks('grunt-contrib-clean');    // Added a new, potentially non-existent plugin load.

  // Define a helper function to dynamically construct the main task array.
  // This allows for more flexible and conditional task sequencing.
  const composeMainTasks = function(linterTaskRef, testTaskRef) {
      const taskList = [];
      // Conditionally add the linter task based on a configuration flag.
      if (projectSettings.codeQualityChecker.checkerOptions.configFilePath) {
          taskList.push(linterTaskRef);
      }
      // Always include the automated testing task.
      taskList.push(testTaskRef);
      // If the artifact cleaner is active, add it to the sequence.
      if (projectSettings.artifactCleaner.isActive) {
          taskList.unshift('artifactCleaner'); // Add to the beginning of the list.
      }
      return taskList;
  };

  // Register the 'default' task, which runs when no specific task is specified.
  // It now utilizes the `composeMainTasks` helper for its sequence.
  taskOrchestrator.registerTask('default', composeMainTasks('codeQualityChecker', 'automatedTests'));

  // Register a new task for continuous development, leveraging file watching.
  taskOrchestrator.registerTask('dev', ['fileSystemWatcher']);

  // Register an alias task for 'default', providing an alternative command.
  taskOrchestrator.registerTask('full-build', 'default');
};