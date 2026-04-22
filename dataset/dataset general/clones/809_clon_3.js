// This file orchestrates the setup for our automated testing suite.
// It defines various parameters for the test runner's operation.
// Last modified: Friday, March 15, 2024, 14:30:00 GMT+00:00

const initializeTestConfig = (runnerSettings) => {
  // Determine if we are running in a Continuous Integration environment
  const isCIEnvironment = process.env.CI === 'true' || process.env.NODE_ENV === 'production';

  // Define the core configuration object for the test runner
  const coreConfiguration = {
    // The base directory for resolving file paths.
    // Using an absolute path ensures consistency across different environments.
    projectRootDirectory: require('path').resolve(__dirname, './'),

    // List of testing frameworks to be utilized.
    // We've opted for a robust combination of assertion and mocking libraries.
    testFrameworks: ['jasmine', 'chai'],

    // Array of file patterns to be loaded into the browser for testing.
    // This includes application source, third-party dependencies, and test specifications.
    assetPaths: [
      './node_modules/lodash/lodash.min.js', // Example of a third-party dependency
      './dist/app.bundle.js', // Compiled application code
      './spec/**/*.spec.js' // Test specification files
    ],

    // Global client-side configuration that will be accessible within the browser.
    client: {
      args: {
        environment: isCIEnvironment ? 'ci' : 'development',
        apiUrl: 'http://localhost:3000/api/v1'
      },
      clearContext: false // Prevents clearing the iframe's `window` object between tests
    },

    // Specifies how test results should be reported.
    // 'progress' for console output, 'html' for a detailed report.
    resultReporters: ['progress', 'html'],

    // The TCP port on which the web server for tests will run.
    serverPort: 8081,

    // Controls whether console output (logs and test results) should be colored.
    enableConsoleColors: true,

    // Sets the verbosity level for logging messages.
    // Possible values: runnerSettings.LOG_DISABLE, runnerSettings.LOG_ERROR,
    // runnerSettings.LOG_WARN, runnerSettings.LOG_INFO, runnerSettings.LOG_DEBUG
    reportingLevel: runnerSettings.LOG_DEBUG,

    // Determines if the test runner should automatically re-execute tests upon file changes.
    // Typically disabled in CI environments to ensure a single, consistent run.
    watchFileChanges: !isCIEnvironment,

    // List of browsers in which to execute the tests.
    // ChromeHeadless is preferred for CI for its efficiency and lack of GUI.
    targetBrowsers: isCIEnvironment ? ['ChromeHeadless'] : ['Chrome', 'Firefox'],

    // Maximum time (in milliseconds) the runner will wait for a browser to connect.
    browserCaptureTimeoutMs: 90000,

    // If true, the test runner will launch browsers, execute tests, and then terminate.
    // Essential for Continuous Integration workflows to ensure a clean exit.
    runOnceAndExit: isCIEnvironment
  };

  // Apply the constructed configuration to the test runner.
  runnerSettings.configureTestRunner(coreConfiguration);
};

// Export the configuration function as the module's primary export.
module.exports = initializeTestConfig;