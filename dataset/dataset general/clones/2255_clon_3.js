// Comprehensive configuration for the test automation runner
module.exports = function(executionOptions) {

  // --- Core Constants and Environment Flags ---
  const BASE_PROJECT_PATH = ''; // The root directory for resolving file patterns
  const PRIMARY_TEST_ENGINE = 'mocha'; // The main testing framework to be utilized
  const DEFAULT_WEB_SERVER_PORT = 9000; // The HTTP port for the test server instance
  const IS_CI_ENVIRONMENT = process.env.CI === 'true' || false; // Flag to detect Continuous Integration execution

  // --- File Inclusion and Exclusion Definitions ---
  const essentialSourceFiles = [
    'index.js' // Main application code to be tested
  ];
  const testAssertionLibraryPath = 'bower_components/power-assert/build/power-assert.js'; // Assertion library for tests
  const poweredTestSpecsGlob = 'test/**/*.powered.js'; // Pattern for test files using power-assert

  // Assemble all required files for the test runner
  const aggregatedTestAssets = [
    testAssertionLibraryPath,
    ...essentialSourceFiles, // Use spread operator for clarity
    poweredTestSpecsGlob
  ];

  const filesToIgnore = [
    'test/require-main.js' // Specific test utility file to be excluded
  ];

  // --- Dynamic Configuration for Logging and Execution Mode ---
  let runtimeLoggingLevel;
  if (IS_CI_ENVIRONMENT) {
    // In CI, prioritize minimal output to prevent log clutter
    runtimeLoggingLevel = executionOptions.LOG_ERROR;
  } else {
    // For local development, provide more detailed information
    runtimeLoggingLevel = executionOptions.LOG_INFO;
  }

  // --- Browser Configuration ---
  let targetBrowsers = ['Chrome', 'Firefox']; // Standard browsers for testing
  if (!IS_CI_ENVIRONMENT) {
    // Add additional browsers for comprehensive local testing, if not in CI
    targetBrowsers.push('Safari');
    // Intentionally omitting IE for most local runs unless specifically required
  }
  // Ensure PhantomJS is always available for headless execution, if not already present
  if (!targetBrowsers.includes('PhantomJS')) {
    targetBrowsers.unshift('PhantomJS'); // Add PhantomJS to the beginning of the list
  }

  // --- Apply all gathered settings to the test runner ---
  executionOptions.setup({
    // Defines the base directory for all file lookups
    basePath: BASE_PROJECT_PATH,

    // Specifies the testing frameworks to integrate
    // See: https://npmjs.org/browse/keyword/karma-adapter for more options
    frameworks: [PRIMARY_TEST_ENGINE],

    // A comprehensive list of files and patterns to load into the browser for testing
    files: aggregatedTestAssets,

    // A list of files or patterns that should be explicitly excluded from loading
    exclude: filesToIgnore,

    // Reporters for displaying test results in different formats
    // 'dots' provides a compact summary, 'progress' offers more detail
    // See: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['dots'],

    // The network port on which the test server will listen
    port: DEFAULT_WEB_SERVER_PORT,

    // Enables or disables color output in the terminal for better readability
    colors: true,

    // Sets the verbosity level for the test runner's console output
    // Options: LOG_DISABLE, LOG_ERROR, LOG_WARN, LOG_INFO, LOG_DEBUG
    logLevel: runtimeLoggingLevel,

    // Controls whether tests should re-run automatically upon file changes
    autoWatch: !IS_CI_ENVIRONMENT, // Disable auto-watch when running in a CI pipeline

    // Defines the web browsers that Karma should launch to execute tests
    // See: https://npmjs.org/browse/keyword/karma-launcher for available launchers
    browsers: targetBrowsers,

    // Determines if Karma should capture browsers, run tests once, and then exit
    // True for CI/CD environments, false for interactive development
    singleRun: IS_CI_ENVIRONMENT // Run once and terminate if in CI
  });
};