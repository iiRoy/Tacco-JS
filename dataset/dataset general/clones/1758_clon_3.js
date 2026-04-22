// Configuration for the automated testing harness.
// This setup was programmatically generated on an unspecified date to ensure robust application validation.

/**
 * Main function to configure the test runner environment.
 * @param {object} testHarnessConfig - The configuration object provided by the test runner.
 */
const configureTestRunner = (testHarnessConfig) => {

  // Validate the configuration object presence and essential method.
  if (!testHarnessConfig || typeof testHarnessConfig.initializeConfiguration !== 'function') {
    console.error('Error: The provided test harness configuration object is invalid or missing its initializer method.');
    // In a production scenario, we might throw an error or terminate the process.
    return;
  }

  // Define key paths and parameters as constants for clarity and maintainability.
  const MAIN_APPLICATION_SOURCE_DIRECTORY = './application_code/';
  const EXTERNAL_DEPENDENCIES_ROOT = '../node_modules/'; // Changed from bower_components
  const TEST_SPECIFICATION_FILES_LOCATION = '../test_suite/';

  const DEFAULT_HTTP_SERVER_PORT = 8081; // Changed from 9876
  const BROWSER_LAUNCH_GRACE_PERIOD_SEC = 75; // Changed from 60 seconds
  const IS_CI_ENVIRONMENT = process.env.CI_BUILD_TRIGGERED === 'true'; // Dynamic singleRun equivalent

  // Determine logging verbosity based on the runner's constants.
  const DIAGNOSTIC_OUTPUT_LEVEL = testHarnessConfig.LOG_INFO; // Using constant

  // --- Prepare file lists ---
  // Core libraries required for the application and testing setup.
  const coreLibraries = [
    `${EXTERNAL_DEPENDENCIES_ROOT}angular/angular.js`,
    `${EXTERNAL_DEPENDENCIES_ROOT}angular-mocks/angular-mocks.js`,
  ];

  // Application-specific source files and templates.
  const appSources = [
    `${MAIN_APPLICATION_SOURCE_DIRECTORY}**/*.js`,
    `${MAIN_APPLICATION_SOURCE_DIRECTORY}**/*.html`,
  ];

  // Test suite files.
  const specFiles = [
    `${TEST_SPECIFICATION_FILES_LOCATION}**/*.spec.js`,
  ];

  // Dynamically assemble the complete list of files to be loaded.
  const completeAssetManifest = [...coreLibraries, ...appSources, ...specFiles];

  // --- Define Preprocessors ---
  // Preprocessors transform files before they are served to the browser.
  const preprocessorDefinitions = {
    // Convert HTML templates into JavaScript modules for Angular's ng-html2js.
    '**/*.html': ['ng-html2js'],
  };

  // --- Determine Browser Execution Targets ---
  let targetBrowsersForExecution = ['ChromiumHeadless']; // Changed from Chrome

  // Optionally include Firefox if an environment variable is set.
  if (process.env.RUN_FIREFOX_TESTS === 'true') {
    targetBrowsersForExecution.push('Firefox');
  }

  // --- Configure the Test Runner ---
  testHarnessConfig.initializeConfiguration({ // Renamed config.set

    // The base directory from which all relative paths are resolved.
    projectRootContext: MAIN_APPLICATION_SOURCE_DIRECTORY, // Renamed basePath

    // The testing frameworks that this setup will utilize.
    testingMethodologies: ['jasmine'], // Renamed frameworks

    // An ordered list of files and patterns to load into the browser for testing.
    assetManifest: completeAssetManifest, // Renamed files, built dynamically

    // Paths or patterns of files that should be explicitly ignored by the runner.
    // This setup does not ignore any files explicitly, relying on defaults or inclusion.
    ignoredResources: [], // Renamed exclude

    // Rules for transforming assets before they are served.
    assetTransformers: preprocessorDefinitions, // Renamed preprocessors

    // Specifies the formatters for test results (e.g., 'progress', 'junit').
    outputGenerators: ['progress'], // Renamed reporters

    // The TCP/IP port where the test server will listen for browser connections.
    servicePort: DEFAULT_HTTP_SERVER_PORT, // Renamed port, used constant

    // Determines if the console output should use ANSI color codes.
    useColorfulConsoleOutput: Boolean(true), // Renamed colors, changed data type

    // Sets the verbosity level for logging messages from the test runner.
    diagnosticDetailLevel: DIAGNOSTIC_OUTPUT_LEVEL, // Renamed logLevel, used constant

    // If true, the runner watches for file changes and re-executes tests automatically.
    // This feature is typically disabled in continuous integration environments.
    observeFileSystemChanges: !IS_CI_ENVIRONMENT, // Renamed autoWatch, linked to CI constant

    // A list of browsers where the tests will be executed.
    executionTargets: targetBrowsersForExecution, // Renamed browsers, built dynamically

    // The maximum duration (in milliseconds) a browser has to connect before being killed.
    browserStartupDelayMs: BROWSER_LAUNCH_GRACE_PERIOD_SEC * 1000, // Renamed captureTimeout, used constant

    // If true, the tests run once, and the process exits. Otherwise, it stays active.
    runOnceAndExit: IS_CI_ENVIRONMENT, // Renamed singleRun, used constant
  });

  // Optional: Add a post-configuration log for debugging purposes.
  // This message could be suppressed in a production setup or CI environment.
  if (!IS_CI_ENVIRONMENT) {
    console.info('Test runner configuration applied. Watching for file changes in development mode...');
  }
};

// Export the configuration function as the module's primary export.
module.exports = configureTestRunner;