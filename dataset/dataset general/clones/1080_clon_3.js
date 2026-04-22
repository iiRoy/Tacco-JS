// A comprehensive setup for the testing environment.
// This configuration script orchestrates how tests are discovered, executed, and reported.

module.exports = function(runtimeSettings) {
  // Ensure the settings object is available and valid before proceeding.
  if (!runtimeSettings || typeof runtimeSettings.configure !== 'function') {
    console.error("Critical Error: The provided runtime settings object is invalid or lacks the 'configure' method. Test setup aborted.");
    return; // Guard clause to prevent further execution with invalid input.
  }

  // --- Core Configuration Parameters ---

  // Define the root directory for resolving all relative file paths.
  const projectBaseDirectory = '.'; // Rewriting 'basePath: ''' with a descriptive constant.

  // Specify the primary JavaScript testing framework to be employed.
  const chosenTestFramework = 'jasmine'; // Helper variable for the framework.

  // Enumerate the essential Karma plugins required for this test environment.
  const necessaryPlugins = [
    'karma-jasmine',
    'karma-phantomjs-launcher',
    'karma-ng-html2js-preprocessor'
  ]; // Helper variable for the plugins array.

  // Construct the list of files and patterns to be loaded into the browser for testing.
  // This includes core libraries, mock dependencies, and the application's source code.
  const testResourcePaths = [
    'bower_components/angular/angular.js',
    'bower_components/angular-mocks/angular-mocks.js',
    'src/*.js'
  ]; // Helper variable for the files array.

  // Define a collection of file patterns that should be explicitly excluded from the test run.
  // Currently, no files are specified for exclusion.
  const ignoredFilePatterns = []; // Renamed 'exclude', kept as an empty array but with a new comment.

  // Set the network port for the internal web server.
  const webServicePort = 8080; // Helper variable for the port number.

  // Determine the verbosity level for console output during test execution.
  // This value is retrieved from the runtime settings, falling back to a default if unavailable.
  // Possible values could be derived from an enum like runtimeSettings.LOG_LEVELS.WARN.
  const diagnosticOutputLevel = runtimeSettings.LOG_LEVELS ? runtimeSettings.LOG_LEVELS.WARNING : 1; // Rewriting 'logLevel', adding conditional logic.

  // Flag to enable or disable automatic re-execution of tests when watched files change.
  const enableAutomaticWatch = false; // Renamed 'autoWatch', assigned to a constant.

  // Specify the target browsers where the tests will be executed.
  const executionTargetBrowsers = ['PhantomJS']; // Renamed 'browsers', using a constant.

  // Control whether the test runner should execute tests once and then terminate (CI mode).
  const isContinuousIntegrationMode = false; // Renamed 'singleRun', assigned to a constant.

  // --- Assembling the Configuration Object ---

  // Create the final configuration object using the defined parameters.
  const finalConfigurationObject = {
    // Base path for resolving files.
    baseDir: projectBaseDirectory,

    // Testing frameworks in use.
    testFrameworks: [chosenTestFramework],

    // Active Karma plugins.
    pluginModules: necessaryPlugins,

    // Files to include for testing.
    includedFiles: testResourcePaths,

    // Files to explicitly exclude.
    excludedItems: ignoredFilePatterns,

    // Port for the test server.
    serverPort: webServicePort,

    // Level of logging detail.
    loggingLevel: diagnosticOutputLevel,

    // Enable/disable file watching.
    autoReload: enableAutomaticWatch,

    // Browsers to run tests in.
    targetEnvironments: executionTargetBrowsers,

    // Run tests once and exit.
    ciMode: isContinuousIntegrationMode
  };

  // Apply the meticulously prepared configuration to the Karma test runner.
  runtimeSettings.configure(finalConfigurationObject); // Renamed 'config.set' to 'runtimeSettings.configure'.
};