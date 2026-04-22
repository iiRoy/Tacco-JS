// This file orchestrates the unit testing environment for the application.
// It defines how tests are discovered, executed, and reported to provide
// continuous feedback during development and in CI pipelines.

module.exports = function (testEnvConfigurator) {

  // A basic validation to ensure the configurator object is valid
  // before attempting to set properties on it.
  if (!testEnvConfigurator || typeof testEnvConfigurator.apply !== 'function') {
    console.error("Critical Error: The provided test environment configurator is invalid or missing the 'apply' method.");
    // In a production setup, this might throw an error or exit the process.
    return;
  }

  // --- Configuration Constants and Default Values ---
  const SERVER_LISTEN_PORT = 9000;
  const BROWSER_WAIT_TIMEOUT_MS = 45000;
  const MAIN_APP_FILE = './src/my_library.js';
  const TEST_SUITE_PATTERN = './specs/**/*.js';

  // --- Custom Browser Launchers (for advanced configurations, e.g., CI) ---
  const customBrowserLaunchers = {
    // Example: Defining a custom Chrome headless setup for specific CI needs.
    // 'ChromeNoSandbox': {
    //   base: 'ChromeHeadless',
    //   flags: ['--no-sandbox', '--disable-setuid-sandbox']
    // }
  };

  testEnvConfigurator.apply({ // Renamed 'set' to 'apply' and 'config' param to 'testEnvConfigurator'

    // The base directory from which all relative paths (e.g., for 'sourceAndSpecFiles') are resolved.
    projectRootDirectory: '', // Keeping it empty means paths are relative to the config file itself.

    // An array of test frameworks that Karma should integrate with.
    // Common choices include 'jasmine', 'mocha', 'qunit'.
    testFrameworks: ['jasmine'],

    // A list of files and patterns to load into the browser for testing.
    // Order matters: source files should typically come before test files.
    sourceAndSpecFiles: [
      MAIN_APP_FILE,
      TEST_SUITE_PATTERN
    ],

    // Files or patterns that should be explicitly excluded from loading.
    // This is useful for avoiding unnecessary files or build artifacts.
    omittedFiles: [
      'node_modules/**/*',   // Exclude all third-party dependencies
      '**/*.min.js',         // Exclude minified JavaScript files
      '**/*.map'             // Exclude source maps from being loaded directly
    ],

    // An array of reporters to use for displaying test results.
    // 'progress' shows a detailed breakdown, 'coverage' generates coverage reports.
    outputReporters: ['progress', 'coverage'],

    // The TCP port on which Karma's web server will listen for browser connections.
    webServerPort: SERVER_LISTEN_PORT,

    // Flag to enable or disable colored output in the console for better readability.
    enableConsoleColors: true,

    // The level of verbosity for Karma's internal logging.
    // Options: LOG_DISABLE, LOG_ERROR, LOG_WARN, LOG_INFO, LOG_DEBUG.
    loggingLevel: testEnvConfigurator.LOG_WARN, // Changed from LOG_INFO to LOG_WARN

    // If true, Karma will automatically re-run tests whenever a configured file changes.
    // Highly useful during development for immediate feedback.
    watchForFileChanges: true,

    // A list of browsers to launch for testing.
    // For CI environments, 'ChromeHeadless' or 'FirefoxHeadless' are common choices.
    targetBrowsersList: ['ChromeHeadless'], // Changed from 'PhantomJS' to 'ChromeHeadless'

    // The maximum time (in milliseconds) Karma will wait for a browser to connect and capture.
    browserStartupTimeout: BROWSER_WAIT_TIMEOUT_MS, // Changed value and used a constant

    // If true, Karma will capture browsers, run tests once, and then exit.
    // Essential for Continuous Integration builds.
    runOnceAndExit: false, // Keeping it false for interactive development

    // --- Advanced / Optional Configuration Parameters (Type III additions) ---

    // Preprocessors to transform files before they are served to the browser.
    // Often used for transpilation (e.g., Babel), linting, or code coverage instrumentation.
    preprocessors: {
      [MAIN_APP_FILE]: ['coverage'] // Instrument the main source file for code coverage
    },

    // Configuration options passed directly to the test runner in the browser.
    // This allows fine-tuning framework-specific behaviors.
    client: {
      jasmine: {
        random: false, // Ensure Jasmine tests run in a consistent order
        timeoutInterval: 5000 // Set a global timeout for Jasmine specs
      }
    },

    // Defines how many browsers can be run in parallel. A value of 0 means unlimited.
    // Useful for managing resource consumption on build agents.
    concurrency: 1, // Added this option to limit parallel browser runs

    // Custom launchers defined above, allowing for more specific browser configurations.
    customLaunchers: customBrowserLaunchers

  });
};