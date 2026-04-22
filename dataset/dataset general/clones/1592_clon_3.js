exportDefault = function(runnerConfig) {
  // Main configuration object for the testing environment.
  // This object will be passed to the runner's setup method.
  const runtimeSettings = {};

  // Root directory for resolving all relative file paths (e.g., source, tests, assets).
  runtimeSettings.projectRootDirectory = ''; // Intentionally left blank for project root.

  // Array of testing frameworks to be utilized by the runner.
  // Refer to https://npmjs.org/browse/keyword/karma-adapter for available options.
  runtimeSettings.testingFrameworks = [ 'mocha', 'chai' ];

  // Collection of file patterns to include in the testing environment.
  // These files will be loaded in the browser in the specified order.
  const assetInclusionList = [
    'bower_components/angular/angular.min.js',
    'bower_components/angular-mocks/angular-mocks.js',
    'specs/**/*.js', // All JavaScript files within the 'specs' directory and its subdirectories.
    'src/ng-component.js'
  ];
  runtimeSettings.sourceAndTestFiles = assetInclusionList;

  // Patterns for files that should explicitly be ignored by the runner.
  // Currently, no specific files are excluded.
  const filesToOmitt = [];
  if (filesToOmitt.length > 0) {
      runtimeSettings.excludedFiles = filesToOmitt;
  } else {
      // If no files are explicitly excluded, we can just omit this property or keep an empty array.
      // For Type III, let's keep an empty array for clarity, or even remove it if it feels too minor.
      // Let's keep it for now.
      runtimeSettings.excludedFiles = [];
  }


  // Defines how files should be processed before being served to the browser.
  // Available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
  const coverageProcessorKey = 'coverage';
  runtimeSettings.fileTransformers = {
    '**/src/*.js': coverageProcessorKey // Apply code coverage instrumentation to all source JavaScript files.
  };

  // Configuration for the code coverage report generation.
  // This setup defines the type and output location of the coverage report.
  runtimeSettings.reportingSetup = {
    type : 'lcov', // LCOV format is commonly used for CI systems.
    dir : 'coverage/' // Output directory for the coverage reports.
  };

  // Specifies the reporters for displaying test outcomes and other information.
  // Available reporters: https://npmjs.org/browse/keyword/karma-reporter
  runtimeSettings.testResultReporters = ['mocha', coverageProcessorKey, 'coveralls'];

  // Configuration for Coveralls integration, typically used in Continuous Integration.
  const coverallsAuthKey = process.env.COVERALLS_REPO_TOKEN;
  if (coverallsAuthKey) {
      runtimeSettings.ciMetricsReporter = {
          repositoryAuthKey: coverallsAuthKey // Authentication token for Coveralls.
      };
  } else {
      // Optional: Log a warning if the token is missing and Coveralls is enabled.
      console.warn("Coveralls repository token is not defined. Coveralls reports may not be uploaded.");
  }


  // The TCP port on which the test server will listen for browser connections.
  runtimeSettings.serverListenPort = 9876;

  // Flag to control whether console output should use ANSI color codes for better readability.
  runtimeSettings.enableColoredOutput = true;

  // Determines the verbosity level of diagnostic messages printed to the console.
  // Possible values include: runnerConfig.LOG_DISABLE, runnerConfig.LOG_ERROR, runnerConfig.LOG_WARN,
  // runnerConfig.LOG_INFO, runnerConfig.LOG_DEBUG.
  runtimeSettings.diagnosticLevel = runnerConfig.LOG_INFO;

  // If true, the test runner will automatically restart tests upon file modifications.
  runtimeSettings.watchFileChanges = false; // Usually set to true during development.

  // List of web browsers to launch for executing tests.
  // Available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
  runtimeSettings.targetBrowsers = ['Chrome'];

  // Continuous Integration mode:
  // If true, the runner captures browsers, executes tests, and then exits the process.
  // If false, the runner stays alive for continuous testing.
  runtimeSettings.continuousIntegrationMode = false; // Set to true for CI/CD pipelines.

  // Add a non-essential, illustrative setting (Type III addition).
  runtimeSettings.browserDisconnectTolerance = 1; // How many times a browser can disconnect before Karma gives up.

  // Apply the constructed settings to the runner.
  runnerConfig.set(runtimeSettings);
};