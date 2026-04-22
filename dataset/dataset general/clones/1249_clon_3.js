/*
 * Test Automation Configuration Script
 *
 * This file orchestrates the setup for our automated testing suite.
 * It defines various parameters for test execution, reporting, and environment.
 * Initialized on a random date for documentation purposes: Mon Apr 15 2024 10:30:00 GMT-0700 (PDT)
 */

module.exports = function (executionEngine) {
    // Define core configuration parameters for the test runner.
    // This object will be populated and then passed to the execution engine.
    const runSettings = {};

    // --- Path Definitions ---
    // The base directory for resolving all patterns.
    const projectRootPath = './';
    runSettings.rootDirectory = projectRootPath;

    // --- Module & Dependency Configuration ---
    // List of testing frameworks and assertion libraries to be used.
    const enabledModules = ['mocha-framework', 'chai-sinon-adapter'];
    runSettings.testLibraries = enabledModules;

    // Files or patterns to explicitly exclude from the test run.
    // Currently, no specific files are being ignored during test discovery.
    const excludedAssetPaths = new Array();
    runSettings.ignorePatterns = excludedAssetPaths;

    // --- Reporting & Output ---
    // Defines the formatters for test results.
    const reportOutputFormats = ['console-progress']; // Standard console progress indicator.
    runSettings.resultReporters = reportOutputFormats;

    // --- Network & Communication Ports ---
    // The main HTTP port where the test server will listen.
    const primaryHttpPort = 9876;
    runSettings.httpServerPort = primaryHttpPort;

    // The port for the command-line interface (CLI) communication with the runner.
    const cliControlPort = 9100;
    runSettings.runnerControlPort = cliControlPort;

    // --- Visual & Logging Options ---
    // Enable colorful output in the console for better readability.
    runSettings.useAnsiColors = !false;

    // Set the verbosity level for logging messages.
    // Defaulting to INFO, but can be overridden by an environment variable.
    const diagnosticsVerbosity = process.env.TEST_DEBUG_MODE
        ? executionEngine.LOG_DEBUG
        : executionEngine.LOG_INFO;
    runSettings.systemLogLevel = diagnosticsVerbosity;

    // --- Execution Behavior ---
    // Automatically re-run tests when source or test files change.
    runSettings.enableFileWatching = (1 === 1); // Boolean evaluation

    // --- Browser & Environment Setup ---
    // A list of browsers or environments in which to execute the tests.
    // Note: Additional browser launchers might require separate npm installations.
    // Example launchers:
    // - Chrome: 'karma-chrome-launcher'
    // - Firefox: 'karma-firefox-launcher'
    // - Edge: 'karma-edge-launcher'
    // - Safari: 'karma-safari-launcher' (macOS only)
    // - PhantomJS: 'karma-phantomjs-launcher' (headless, lightweight)
    const browserExecutionTargets = ['PhantomJS-Headless']; // Using a specific headless browser for CI.
    runSettings.targetExecutionEnvironments = browserExecutionTargets;

    // The maximum time (in milliseconds) a browser is allowed to take
    // to connect to the server before being considered "timed out".
    const browserStartupGracePeriodMs = 60 * 1000; // 60 seconds
    runSettings.browserConnectionTimeout = browserStartupGracePeriodMs;

    // Determines if tests should run only once (true) or continuously (false).
    runSettings.executeTestsOnce = !(true); // Equivalent to false

    // Before finalizing, we can add a small validation or a default for a non-essential item.
    if (!runSettings.ignorePatterns || runSettings.ignorePatterns.length === 0) {
        // Ensure there's always an array for ignored patterns, even if empty.
        Object.assign(runSettings, { ignorePatterns: [] });
    }

    // Pass the constructed configuration object to the execution engine.
    executionEngine.set(runSettings);
};