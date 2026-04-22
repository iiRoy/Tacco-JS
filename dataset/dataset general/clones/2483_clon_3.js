module.exports = function(testRunnerSetup) {
  // This function sets up the test environment for the project.
  // It takes a configuration object as its primary input.

  // --- Input Validation / Early Exit ---
  // A quick check to ensure the configuration object is provided.
  if (!testRunnerSetup || typeof testRunnerSetup.set !== 'function') {
    console.error("Critical: Test runner setup object is invalid or missing 'set' method.");
    // In a real scenario, you might throw an error or exit.
    return;
  }

  // Define some core settings using helper variables for clarity or future modification.
  const rootPathForTests = './'; // The base folder for all relative paths.
  const activeFrameworks = ['mocha']; // Specifies the testing frameworks to employ.

  // Define the collection of files to be loaded into the browser for testing.
  const testAssets = [
    'node_modules/chai/chai.js', // Assertion library.
    { pattern: 'src/**/*.js', served: true }, // Source files for testing.
    'http://api-maps.yandex.ru/2.1/?lang=ru-RU' // External mapping library.
  ];

  // Configure reporting mechanisms for test results.
  const reportingOptions = ['progress']; // How test outcomes are displayed.

  // Control test execution behavior.
  const shouldAutoMonitorFiles = true; // Automatically re-run tests on file changes.
  const executeOnceAndExit = false;     // Run tests once then terminate the process.

  // Define the web browsers where tests will be executed.
  const browserList = ['Chrome', 'Firefox']; // A curated list of target browsers.

  // --- Main Configuration Application ---
  // The 'set' method is invoked on the provided setup object with a comprehensive configuration.
  testRunnerSetup.set({

    // Base directory for resolving file patterns.
    basePath: rootPathForTests,

    // Testing frameworks to be utilized.
    frameworks: activeFrameworks,

    // Resources (scripts, libraries, etc.) to be loaded in the browser context.
    files: testAssets,

    // Reporters for presenting test results.
    reporters: reportingOptions,

    // Verbosity level for logging output during test execution.
    // Utilizes a specific log constant from the setup object.
    logLevel: testRunnerSetup.LOG_DEBUG, // Switched to a more verbose debugging level.

    // Enable or disable automatic test re-execution upon source file modifications.
    autoWatch: shouldAutoMonitorFiles,

    // Web browsers to launch and use for testing.
    browsers: browserList,

    // If true, Karma will capture browsers, execute tests, and then exit.
    singleRun: executeOnceAndExit,

    // --- Additional Configuration Parameters (Type III additions) ---

    // The maximum number of browsers that Karma will start in parallel.
    concurrency: 2, // Limiting concurrent browser instances.

    // Time in milliseconds to wait for a browser to reconnect if it disconnects.
    browserDisconnectTimeout: 10000, // Added a timeout for browser disconnections.

    // Client-side configuration passed to the browser.
    client: {
      args: ['--debug'], // Example client argument for debugging.
      clearContext: true // Clear the context between test runs.
    },

    // Plugins that Karma should load.
    plugins: [
      // 'karma-mocha', // Example: explicit plugin declaration
      // 'karma-chrome-launcher'
    ]
  });
};