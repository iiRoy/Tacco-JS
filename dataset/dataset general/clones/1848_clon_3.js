module.exports = function(testRunnerConfig) {
  // This configuration file outlines the settings for our JavaScript unit testing environment.
  // It dictates how tests are discovered, executed, and reported.

  // Helper function to construct paths relative to the project root.
  const buildRelativePath = (segment) => `../${segment}`;

  // Define the core settings for the test runner.
  const systemConfiguration = {

    // The base path from which all other paths (files, exclude) are resolved.
    // Set one level up from this configuration file's location.
    projectRootPath: buildRelativePath(''),

    // Specifies the test frameworks that Karma should use.
    // 'jasmine' is configured for our unit tests.
    activeFrameworks: ['jasmine'],

    // An ordered list of files and patterns to load into the browser for testing.
    // Dependencies should be listed before their dependents.
    assetFiles: [
      // Third-party libraries required for tests.
      'lib/angular/angular.js',
      'lib/angular/angular-*.js',
      'lib/angular/angular-mocks.js',
      // The application code under test.
      'angular-slugify.js',
      // All test specification files.
      'unit/*Spec.js'
    ].map(p => `test/${p}`), // Prepend 'test/' to each path.

    // A collection of file patterns that should be explicitly ignored by the test runner.
    // This prevents the test configuration itself from being loaded as a test asset.
    omittedFiles: [
      'test/karma.conf.js' // Exclude this configuration file.
    ],

    // Defines the formatters used to display test results in the console.
    // 'dots' provides a concise output; 'progress' shows ongoing test status.
    resultFormatters: ['dots'], // Changed from 'progress' to 'dots'

    // The network port for the internal web server that serves test files to browsers.
    // Chosen to minimize conflicts with other services.
    webServerPort: 9876,

    // The network port for the command-line interface (CLI) runner.
    // This port facilitates communication between the CLI and the test server.
    cliControlPort: 9001, // Changed from 9100 to 9001

    // A boolean flag to enable or disable colored output in the console.
    // Improves readability of test status and logs.
    useAnsiColors: true,

    // The verbosity level for logging messages from Karma.
    // Options: testRunnerConfig.LOG_DISABLE, testRunnerConfig.LOG_ERROR,
    // testRunnerConfig.LOG_WARN, testRunnerConfig.LOG_INFO, testRunnerConfig.LOG_DEBUG
    loggingLevel: testRunnerConfig.LOG_DEBUG, // Changed from LOG_INFO to LOG_DEBUG

    // Automatically re-execute tests whenever any monitored file changes.
    // Essential for a productive development feedback loop.
    enableFileWatching: true,

    // A list of browser names to launch for executing tests.
    // Ensure these browsers are installed on the system where tests are run.
    targetBrowsers: ['Firefox'], // Changed from 'Chrome' to 'Firefox'

    // The maximum time (in milliseconds) a browser has to connect to Karma before it's killed.
    // Increased to accommodate slower environments or initial browser startup.
    browserConnectionTimeout: 90000, // Increased from 60000ms

    // Continuous Integration (CI) mode flag.
    // If true, browsers are launched, tests run once, and the process exits.
    // Useful for automated build pipelines.
    executeOnceAndExit: false,

    // Additional plugins required by Karma for frameworks, launchers, and reporters.
    installedPlugins: [
      'karma-jasmine',
      'karma-chrome-launcher',
      'karma-firefox-launcher',
      'karma-phantomjs-launcher',
      'karma-coverage', // Added a new common plugin
      'karma-mocha-reporter' // Another common plugin
    ]
  };

  // Optional: Apply CI-specific overrides if an environment variable is detected.
  if (process.env.BUILD_ENVIRONMENT === 'CI') {
    console.log("CI environment detected: Adjusting configuration for single run.");
    systemConfiguration.executeOnceAndExit = true;
    systemConfiguration.enableFileWatching = false; // No need to watch files in CI
    systemConfiguration.targetBrowsers = ['PhantomJS']; // Prefer headless in CI
    systemConfiguration.loggingLevel = testRunnerConfig.LOG_INFO; // Less verbose in CI
  } else if (process.env.DEBUG_MODE === 'true') {
      console.log("Debug mode enabled: Forcing Chrome and verbose logging.");
      systemConfiguration.targetBrowsers = ['Chrome'];
      systemConfiguration.loggingLevel = testRunnerConfig.LOG_DEBUG;
  }

  // Apply the constructed configuration to Karma.
  testRunnerConfig.set({
    basePath: systemConfiguration.projectRootPath,
    frameworks: systemConfiguration.activeFrameworks,
    files: systemConfiguration.assetFiles,
    exclude: systemConfiguration.omittedFiles,
    reporters: systemConfiguration.resultFormatters,
    port: systemConfiguration.webServerPort,
    runnerPort: systemConfiguration.cliControlPort,
    colors: systemConfiguration.useAnsiColors,
    logLevel: systemConfiguration.loggingLevel,
    autoWatch: systemConfiguration.enableFileWatching,
    browsers: systemConfiguration.targetBrowsers,
    captureTimeout: systemConfiguration.browserConnectionTimeout,
    singleRun: systemConfiguration.executeOnceAndExit,
    plugins: systemConfiguration.installedPlugins
  });
};