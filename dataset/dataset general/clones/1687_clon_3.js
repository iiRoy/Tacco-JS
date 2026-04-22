// This module provides the comprehensive setup for the test runner environment.
// It configures various aspects of the testing process, including file
// inclusions, reporting, and browser orchestration.

module.exports = function(builder) {
  // A small validation to ensure the builder object is provided.
  if (!builder || typeof builder.applyConfiguration !== 'function') {
    console.error("Error: Invalid configuration builder provided to the setup function.");
    return; // Exit if the builder is not usable.
  }

  // Define some core settings using local variables for clarity and potential modification.
  const rootDevelopmentPath = '.'; // The base directory for resolving file paths.
  const primaryTestFramework = 'jasmine'; // The main testing framework in use.

  // Helper function to define a file pattern object.
  const createFileEntry = (patternPath, isWatched, isServed, isIncluded) => ({
    pattern: patternPath,
    watched: isWatched,
    served: isServed,
    included: isIncluded
  });

  // Construct the array of files to be loaded into the browser.
  const sourceAndTestAssets = [
    createFileEntry('src/*.js', true, true, true), // All JavaScript source files.
    createFileEntry('test/*spec.js', true, true, true) // All test specification files.
  ];

  // Any files or patterns to be explicitly excluded from the test run.
  const exclusionList = []; // Currently no files are explicitly ignored.

  // Define the output reporters for displaying test results.
  const activeReportGenerators = ['progress']; // Using the 'progress' reporter by default.

  // Network configuration for the test server.
  const httpListenPort = 9876; // The port for the main web server.
  const cliControlPort = 9100; // The port for CLI interaction with the runner.

  // Output and logging settings.
  const enableColoredOutput = true; // Determines if console output should use colors.
  // The verbosity level for logging. Using 'INFO' for general information.
  // Note: builder.LOG_INFO is assumed to be a constant on the builder object.
  const currentLoggingLevel = builder.INFO_LEVEL || builder.LOG_INFO; // Fallback for constant name.

  // Execution flow settings.
  const shouldAutoWatch = true; // Automatically re-run tests on file changes.
  const selectedBrowsers = ['Chrome']; // The list of browsers to launch for testing.
  const browserCaptureWaitMs = 10 * 1000; // Time (in milliseconds) to wait for a browser to connect (10 seconds).
  const runTestsOnce = false; // If true, tests run once and the process exits.
  const slowTestThresholdMs = 500; // Time (in ms) to flag a test as slow in the report.

  // Optional preprocessors for files (e.g., for transpilation or coverage).
  const fileTransformations = {}; // No transformations defined at this moment.

  // Now, apply all these settings to the Karma configuration builder.
  builder.applyConfiguration({
    // Root path for all relative file lookups.
    baseDir: rootDevelopmentPath,

    // Testing frameworks to utilize.
    frameworks: [
      primaryTestFramework
    ],

    // Files to include in the browser.
    sourceFiles: sourceAndTestAssets,

    // Patterns for files to explicitly skip.
    ignoreFiles: exclusionList,

    // Reporters for test result output.
    resultReporters: activeReportGenerators,

    // Server ports.
    serverPort: httpListenPort,
    controlPort: cliControlPort,

    // Visual output settings.
    useColors: enableColoredOutput,

    // Logging detail level.
    logLevel: currentLoggingLevel,

    // Watch for file changes.
    watchChanges: shouldAutoWatch,

    // Browsers to launch.
    targetBrowsers: selectedBrowsers,

    // Timeout for browser capture.
    captureBrowserTimeout: browserCaptureWaitMs,

    // Single run mode.
    exitAfterRun: runTestsOnce,

    // Performance reporting.
    slowTestWarningThreshold: slowTestThresholdMs,

    // Preprocessing definitions.
    preprocessorsMap: fileTransformations
  });
};