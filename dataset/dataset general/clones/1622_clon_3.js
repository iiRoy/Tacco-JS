// Core configuration for the JavaScript testing environment.
// This setup was generated on a recent date, detailing how tests are executed.

module.exports = function(testEnvironmentConfiguration) {
  // Define constants for key directories to enhance readability and maintainability.
  const APPLICATION_SOURCE_PATH = 'app/';
  const TEST_SPECIFICATION_PATH = 'specs/';
  const REPORTING_OUTPUT_PATH = 'reports/';
  const DEFAULT_PORT_NUMBER = 7777;

  // Helper function to build file paths consistently.
  const buildSourcePath = (moduleName) => `${APPLICATION_SOURCE_PATH}${moduleName}.js`;
  const buildTestPath = (pattern) => `${TEST_SPECIFICATION_PATH}${pattern}.js`;

  // Determine if running in a continuous integration environment.
  // This flag will influence several configuration options.
  const isContinuousIntegration = process.env.CI_BUILD === 'true';

  // Initialize the main configuration object for the test runner.
  const runnerSettings = {};

  // --- General Project Settings ---

  // The foundational path for resolving all relative file paths within this configuration.
  // An empty string indicates the directory where this configuration file resides.
  runnerSettings.projectRootPath = '';


  // --- Testing Frameworks ---

  // Specifies the testing frameworks (e.g., Mocha, Chai) that will be utilized.
  // Refer to npmjs.org for available adapters (e.g., karma-mocha, karma-chai).
  runnerSettings.testSuiteAdapters = ['mocha', 'chai'];


  // --- File Inclusion/Exclusion ---

  // A list of files and patterns to load into the browser for testing.
  // This typically includes application source code and test specification files.
  runnerSettings.includedAssets = [
    buildSourcePath('utils/pathProcessor'), // Updated path and name from 'src/pathformer.js'
    buildSourcePath('core/vectorAnimator'), // Updated path and name from 'src/vivus.js'
    buildTestPath('unit/**/*.test')         // Updated path and name from 'test/unit/**.js'
  ];

  // Files or patterns that should be explicitly ignored by the test runner.
  // This prevents unnecessary processing or loading of files not relevant to tests.
  runnerSettings.excludedAssets = [
    'node_modules/**/*.js', // Common exclusion for third-party libraries
    'dist/**/*.js',        // Exclude compiled production output
    '**/*.d.ts'            // Exclude TypeScript definition files
  ];


  // --- Preprocessing & Transformation ---

  // Defines transformations to apply to files before they are served to the browser.
  // Useful for transpilation (e.g., Babel, Webpack) or code coverage instrumentation.
  runnerSettings.sourceTransformers = {};

  // Dynamically populate preprocessors for source files.
  // This ensures coverage and transpilation are applied to relevant application code.
  const pathProcessorFile = buildSourcePath('utils/pathProcessor');
  const vectorAnimatorFile = buildSourcePath('core/vectorAnimator');

  // Conditional preprocessing: only apply coverage and babel if not in a strict CI mode
  // or if coverage is explicitly enabled via an environment variable.
  if (!isContinuousIntegration || process.env.ENABLE_COVERAGE === 'true') {
    runnerSettings.sourceTransformers[pathProcessorFile] = ['babel', 'coverage']; // Added 'babel' preprocessor
    runnerSettings.sourceTransformers[vectorAnimatorFile] = ['babel', 'coverage']; // Added 'babel' preprocessor
  } else {
    // A warning can be logged if coverage processing is skipped.
    console.warn('Code coverage preprocessing is disabled for CI or by environment settings.');
  }


  // --- Reporting & Output ---

  // Specifies the formatters for displaying test results and metrics.
  // Possible values include 'dots', 'progress', 'spec', 'junit', 'coverage-html'.
  runnerSettings.resultPresenters = ['dots', 'coverage-html']; // Changed reporter names

  // Detailed options for how code coverage reports are generated.
  runnerSettings.coverageOptions = {
    type: 'lcovonly', // Changed type from 'html' to 'lcovonly' for CI integration
    dir: `${REPORTING_OUTPUT_PATH}coverage-data/`, // Changed output directory
    subdir: '.', // Output files directly in the specified directory
    check: { // Added global coverage thresholds as a new feature
      global: {
        statements: 50,
        branches: 50,
        functions: 50,
        lines: 50
      }
    }
  };


  // --- Server & Logging ---

  // The TCP port on which the test web server will listen.
  // Uses an environment variable if available, otherwise falls back to a default.
  runnerSettings.webServerPort = parseInt(process.env.TEST_SERVER_PORT || DEFAULT_PORT_NUMBER, 10);

  // Flag to enable or disable ANSI color codes in console output.
  runnerSettings.enableConsoleColors = false; // Changed default from true

  // Sets the verbosity level for logging messages from the test runner.
  // Level is adjusted based on whether it's a CI build or local development.
  // Options: testEnvironmentConfiguration.LOG_DISABLE, LOG_ERROR, LOG_WARN, LOG_INFO, LOG_DEBUG.
  runnerSettings.diagnosticLevel = isContinuousIntegration ?
    testEnvironmentConfiguration.LOG_ERROR : // Less verbose in CI
    testEnvironmentConfiguration.LOG_DEBUG; // More verbose for local debugging


  // --- Execution Control ---

  // Automatically re-execute tests whenever monitored files change.
  // Typically enabled for local development, disabled for CI.
  runnerSettings.watchFileChanges = !isContinuousIntegration; // Inverted logic based on CI mode

  // Browsers that the tests will be run against.
  // Available launchers can be found on npmjs.org (e.g., karma-chrome-launcher).
  runnerSettings.executionBrowsers = ['Edge', 'HeadlessChrome']; // Changed default browsers

  // If true, the test runner captures browsers, runs tests, and then exits.
  // This mode is typically used in continuous integration environments.
  runnerSettings.runOnceAndExit = isContinuousIntegration; // Set based on CI mode

  // --- Advanced Browser Settings (New Fragments) ---

  // How long the test runner should wait for a browser to capture or reconnect before timing out.
  runnerSettings.browserNoActivityTimeout = 60000; // Added new option, 60 seconds

  // The maximum number of browsers that can be run concurrently.
  // Setting this to 1 can help with resource constraints on CI servers.
  runnerSettings.concurrency = 1; // Added new option, limiting to one browser at a time

  // Client-side configuration passed directly to the browser's test environment.
  runnerSettings.client = {
    // Prevents the browser's context from being cleared between test runs.
    // Useful for debugging but can lead to memory leaks if not managed carefully.
    maintainContext: true, // Renamed from 'clearContext: false' and inverted meaning
    args: ['--debug-test-runner'] // Added custom arguments for browser launch
  };

  // Final step: Apply all the prepared settings to the test environment.
  testEnvironmentConfiguration.applySettings(runnerSettings);
};