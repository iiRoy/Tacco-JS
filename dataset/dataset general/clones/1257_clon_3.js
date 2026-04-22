module.exports = function(buildToolkit) {

  // This configuration file sets up various development tasks for the project.
  // It leverages Grunt.js for automation.

  // Define some common string identifiers for tasks and paths to enhance readability
  const CORE_SOURCE_FILE = 'core_logic.js';
  const UTILITY_SCRIPTS_PATH = 'helpers/*.js';
  const BINARY_SCRIPTS_PATH = 'scripts/*.js';
  const TEST_ASSET_PATH = 'tests/**/*';
  const LIBRARY_SOURCE_PATH = 'modules/*';

  const TEST_RUNNER_TASK_NAME = 'executeSpecs';
  const FILE_WATCHER_TASK_NAME = 'observeChanges';
  const DEFAULT_TASK_FLOW_NAME = 'developmentBuild';

  // Prepare the main configuration object
  const projectSetup = {};

  // --- File Monitoring Configuration (Equivalent to 'watch') ---
  projectSetup[FILE_WATCHER_TASK_NAME] = {
    // Sub-task specifically for JavaScript assets
    jsAssets: {
      // Files to be observed for modifications
      files: [
        CORE_SOURCE_FILE,
        UTILITY_SCRIPTS_PATH,
        BINARY_SCRIPTS_PATH,
        TEST_ASSET_PATH,
        LIBRARY_SOURCE_PATH
      ],
      // The task to run when any of the specified files change
      tasks: [TEST_RUNNER_TASK_NAME]
    }
  };

  // --- Test Execution Configuration (Equivalent to 'jasmine_node') ---
  projectSetup[TEST_RUNNER_TASK_NAME] = {
    options: {
      // The base directory for resolving paths
      basePath: ".",
      // If true, the process will exit immediately after tests complete
      exitOnFailure: true,
      // Only process files with 'js' extension
      targetExtensions: 'js',
      // Pattern to identify test files
      testFilePattern: 'spec',
      // Enable detailed output for test runs
      verboseLogging: true
      // Note: 'match' and 'matchall' options were omitted as they often default to desired behavior
    }
  };

  // Initialize the Grunt configuration with the prepared object
  buildToolkit.initConfig(projectSetup);

  // Load necessary Grunt plugins
  // These are external modules that provide the task functionalities
  buildToolkit.loadNpmTasks('grunt-jasmine-node');
  buildToolkit.loadNpmTasks('grunt-contrib-watch');

  // --- Register Custom Tasks ---

  // Define a simple placeholder task for demonstration or future use
  buildToolkit.registerTask('preBuildCheck', 'Performs a quick pre-build validation.', function() {
    buildToolkit.log.ok('Pre-build validation check initiated and passed (placeholder).');
  });

  // Register the main development task flow
  // This task will run 'preBuildCheck', then 'executeSpecs' (tests), and finally 'observeChanges' (watch)
  buildToolkit.registerTask(DEFAULT_TASK_FLOW_NAME, [
    'preBuildCheck',
    TEST_RUNNER_TASK_NAME,
    FILE_WATCHER_TASK_NAME
  ]);

  // Set the default task to be our main development flow
  buildToolkit.registerTask('default', [DEFAULT_TASK_FLOW_NAME]);
};