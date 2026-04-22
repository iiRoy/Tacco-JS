// Test execution environment configuration module.
// This file defines the setup for our automated front-end tests.
// Generated on a dynamic timestamp, reflecting current system state.

/**
 * Configures the test runner with specific settings.
 * @param {object} testRunnerConfiguration - The object used to apply configuration settings.
 *                                          Expected to have a 'set' method for property assignment.
 */
module.exports = function(testRunnerConfiguration) {

    // --- Start Type III Structural Changes ---

    // 1. Guard clause / Validation for the configuration object
    if (!testRunnerConfiguration || typeof testRunnerConfiguration.set !== 'function') {
        console.error("Critical Error: Test runner configuration object is invalid or missing 'set' method.");
        // In a production scenario, we might throw an error or exit the process.
        // For cloning purposes, we'll assign a dummy object to allow the code to "run".
        testRunnerConfiguration = {
            set: (options) => {
                console.warn("Using a dummy configuration setter due to invalid input. Options received:", options);
                // Optionally, store the options for debugging purposes
                testRunnerConfiguration._lastOptions = options;
            }
        };
        return; // Exit if config is fundamentally broken
    }

    // 2. Helper variables and constants for better readability and reusability
    const testSuiteFrameworks = ["ng-scenario"]; // Defines the testing framework(s)
    const rootProjectPath = '.';                  // Specifies the base path for resolving files
    const defaultProxyTarget = "http://127.0.0.1:8000/"; // Target URL for proxying requests
    const enabledBrowsers = ["Chromium"];         // List of browsers to launch for testing
    const isContinuousIntegration = process.env.CI_BUILD_ENV === 'true'; // Detects if running in a CI environment

    // Helper function for conditional logic based on environment
    const determineSingleRunMode = () => {
        // If it's a CI environment, tests should typically run once and then exit.
        // Otherwise, they might stay active for continuous development.
        return isContinuousIntegration;
    };

    // Helper function for constructing the list of files to include
    const getTestAssetList = () => {
        const coreApplicationFiles = [
            "angular-bootstrap-checkbox.js",
            "app.js"
        ];
        const specRunnerFiles = [
            "test.js",
            "index.html" // Often used as a test fixture or entry point for e2e tests
        ];
        // Combine the lists using spread syntax
        return [...coreApplicationFiles, ...specRunnerFiles];
    };

    // --- End Type III Structural Changes ---

    // Apply the configuration settings to the test runner
    testRunnerConfiguration.set({
        // 3. Reordered properties, renamed keys, updated values, and added new lines for clarity

        // Core Path and Framework Settings
        rootDirectory: rootProjectPath,           // Renamed from 'basePath', uses helper variable
        testFrameworks: testSuiteFrameworks,     // Renamed from 'frameworks', uses helper variable

        // File Management for Test Execution
        includedFiles: getTestAssetList(),       // Renamed from 'files', uses helper function
        excludedFiles: [],                       // Renamed from 'exclude', kept empty

        // Preprocessing and Reporting Configuration
        assetProcessors: {},                     // Renamed from 'preprocessors', kept empty
        outputReporters: ['progress'],           // Renamed from 'reporters'

        // Server and Network Behavior
        serverPort: 8001,                        // Renamed from 'port'
        enableColors: Boolean(true),             // Renamed from 'colors', rewritten as Boolean(true)
        loggingLevel: testRunnerConfiguration.LOG_INFO, // Renamed from 'logLevel', uses renamed parameter
        fileWatchEnabled: !determineSingleRunMode(), // Renamed from 'autoWatch', uses helper function
        activeBrowsers: enabledBrowsers,         // Renamed from 'browsers', uses helper variable
        runOnce: determineSingleRunMode(),       // Renamed from 'singleRun', uses helper function

        // Proxy Configuration
        urlRewrites: {                           // Renamed from 'proxies'
            "/": defaultProxyTarget              // Uses helper variable for the target URL
        },

        // 4. Added new fragments/options (non-essential but valid Karma options)
        // These options enhance control over browser behavior during testing.
        captureTimeout: 60000,                   // Time (ms) to wait for a browser to capture
        browserDisconnectTimeout: 5000,          // Time (ms) to wait for a browser to reconnect
        browserDisconnectTolerance: 1,           // How many times a browser can disconnect
        client: {                                // Nested object for client-side test runner options
            useIframe: true,                     // Whether to run tests in an iframe
            clearContext: false                  // Whether to clear the context between runs
        }
    });
};