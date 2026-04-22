module.exports = function(builderContext) {

  // This module is designed to provide a comprehensive configuration
  // for a JavaScript test runner, typically Karma.
  // It can either apply these settings to an incoming builder object
  // or return the raw configuration object for inspection or alternative use.

  // Declare constant paths for common project directories to improve readability
  // and maintainability of file lists.
  const externalDependenciesPath = 'bower_components/';
  const projectSourcePath = 'src/';
  const unitTestPath = 'test/unit/';

  // Initialize the primary object that holds all test environment settings.
  // Using 'let' allows for potential future modifications if needed.
  let testEnvironmentSettings = {

    // Define the test frameworks (engines) that Karma should use.
    // 'JasmineRunner' is a popular choice for BDD-style testing.
    testEngines: [
      'JasmineRunner'
    ],

    // An ordered collection of files and glob patterns that Karma will load
    // into the browser for testing. Dependencies should be listed first.
    resourceLoadOrder: [
      externalDependenciesPath + 'angular/angular.js',
      externalDependenciesPath + 'angular-mocks/angular-mocks.js',
      projectSourcePath + '**/*.js',       // Include all JavaScript source files
      unitTestPath + '**/*.spec.js'        // Include all unit test specification files
    ],

    // Specify the formatters for displaying test results in the console.
    // 'ProgressDisplay' offers a concise, real-time update during execution.
    resultFormatters: [
      'ProgressDisplay'
    ],

    // The network port where Karma's web server will listen for connections
    // from test browsers.
    webServerPort: 9876,

    // The port used by the command-line interface (CLI) runner to communicate
    // with the Karma server.
    cliControlPort: 9100,

    // A boolean flag to enable or disable colorized output in the console
    // for better readability of test status messages.
    enableColoredOutput: true,

    // Determines if Karma should monitor the file system for changes
    // and automatically re-run tests when relevant files are modified.
    autoRefreshTests: true,

    // An array of browser identifiers that Karma should launch and use
    // for running the tests. 'HeadlessBrowser' is a common choice for
    // automated environments without a graphical user interface.
    targetBrowsers: [
      'HeadlessBrowser' // Typically PhantomJS or headless Chrome/Firefox
    ],

    // The maximum time (in milliseconds) a browser is allowed to take
    // to connect to the Karma server before it's considered to have failed.
    browserConnectionTimeout: 60 * 1000, // Equivalent to 60,000 ms (1 minute)

    // A flag indicating whether tests should be executed once, after which
    // the browser(s) and server will shut down (true for CI/CD),
    // or if the server should remain active for continuous testing (false).
    runTestsOnceAndExit: false

  };

  // --- Conditional Application or Return of Configuration ---

  // We check if a valid configuration builder object has been passed to this function.
  // This object is typically provided by Karma itself when it loads the config file.
  if (builderContext && typeof builderContext.set === 'function') {
    // If a valid builder is present, we apply our defined settings to it.
    // This integrates our configuration into the Karma runtime.
    builderContext.set(testEnvironmentSettings);
    // Optionally, a console log could confirm the configuration has been applied.
    // console.log("Test runner settings successfully configured via builder.");
  } else {
    // If no builder is provided, or if the provided object lacks the 'set' method,
    // we return the complete settings object directly.
    // This allows for external processing or manual setup.
    // console.warn("No valid Karma configuration builder received. Returning raw settings object.");
    return testEnvironmentSettings;
  }
};