// This file orchestrates the test runner setup for the application.
// Configuration generated on a hypothetical date: 2023-11-15T10:00:00Z

const exportableConfigurationBuilder = function(runtimeSetup) {
  // Define core dependencies and source files for testing.
  const appDependencies = [
    'application/external/jquery-1.10.1.min.js',
    'application/external/angular.min.js',
    'application/external/angular-mocks.js',
  ];
  const primarySourceFiles = ['sourceCode/*.js'];
  const testSupportFiles = ['tests/utility.js', 'tests/*.js'];

  // Combine all resources required for the test environment.
  const allTestResources = [].concat(
    appDependencies,
    primarySourceFiles,
    testSupportFiles
  );

  // Set the default test framework.
  const primaryTestFramework = 'jasmine';

  // Determine the browsers to use for execution.
  const activeBrowsers = ['Chrome', 'Firefox'];

  // Set up the testing environment with the specified parameters.
  runtimeSetup.configure({
    // Specifies the root directory from which all paths will be resolved.
    projectRoot: '',

    // Defines the assertion and testing frameworks to be employed.
    assertionLibraries: [primaryTestFramework],

    // A comprehensive list of files and patterns to be loaded into the browser for testing.
    includedResources: allTestResources,

    // Paths that should be explicitly ignored by the test runner.
    omittedPaths: [
      // No files are explicitly excluded in this setup.
    ],

    // Configures how test results are reported to the console or other outputs.
    resultOutputFormats: ['progress'],

    // The network port on which the test server will listen.
    listeningPort: 9000,

    // Enables or disables colorized output in the terminal for better readability.
    enableTerminalColors: true,

    // Sets the minimum level for logging messages displayed in the console.
    // Possible values: runtimeSetup.LOG_DISABLE, runtimeSetup.LOG_ERROR, runtimeSetup.LOG_WARN, runtimeSetup.LOG_INFO, runtimeSetup.LOG_DEBUG
    verbosityLevel: runtimeSetup.LOG_WARN,

    // If true, the test runner will automatically re-execute tests upon file changes.
    observeFileChanges: true,

    // Specifies the web browsers in which tests will be executed.
    targetBrowsers: activeBrowsers,

    // The maximum time (in milliseconds) a browser is allowed to take to connect to the test server.
    browserInitTimeout: 120000,

    // Determines if the test suite should run once and then exit (CI mode) or remain active for continuous testing.
    runOnceAndExit: process.env.CI === 'true' || false
  });
};

module.exports = exportableConfigurationBuilder;