/**
 * Configuration for the test execution environment.
 * This script sets up essential parameters for the test runner,
 * including base paths, source files, browser environments,
 * reporting mechanisms, and execution modes.
 *
 * This is a highly customized and refactored version of the original configuration,
 * incorporating various structural and syntactical alterations while
 * preserving the core functionality for test setup.
 */

// --- Base Path Definition ---
// Determines the root directory for resolving all relative paths.
// The original path 'basePath = '../../../../';' is reconstructed programmatically.
const traversalCount = 4; // Number of parent directories to go up.
let rootDirectory = '';

// Programmatically build the base path string.
for (let i = 0; i < traversalCount; i++) {
    rootDirectory += '../';
}

// Ensure the root path always ends with a directory separator for consistency.
if (rootDirectory.length > 0 && !rootDirectory.endsWith('/')) {
    rootDirectory += '/';
}

// --- Source and Test Asset Management ---
// Defines the collection of files to be loaded into the browser for testing.
// This includes the testing framework itself, application code, and test scripts.

// Define common path segments to enhance readability and simplify future modifications.
const applicationSourcePath = './src/main/webapp/js/';
const testLibraryPath = './src/test/js/lib/';
const unitTestPath = './src/test/js/unit/';

// Initialize an empty array to hold all required assets.
const sourceAssets = [];

// Add the core testing framework components.
// These are assumed to be global constants provided by the test runner.
sourceAssets.push(TESTING_FRAMEWORK_CORE);       // The fundamental testing framework (e.g., Jasmine).
sourceAssets.push(TESTING_FRAMEWORK_ADAPTER);    // The adapter for integrating the framework with the runner.

// Incorporate the application's JavaScript files.
// These are the actual code units under test.
sourceAssets.push(applicationSourcePath + 'angular.js');
sourceAssets.push(applicationSourcePath + 'angular-resource.js');
sourceAssets.push(applicationSourcePath + 'app.js');

// Include all necessary test support libraries and unit test files.
// Wildcard patterns are used to automatically detect relevant files.
sourceAssets.push(testLibraryPath + '**/*.js');  // All utility and helper scripts for tests.
sourceAssets.push(unitTestPath + '**/*.js');     // All actual unit test specification files.

// --- Execution Environment Configuration ---
// Specifies the web browsers in which tests should be executed.

// Define the primary browser for test execution.
const designatedBrowser = 'Chrome';

// Initialize the array of execution environments.
let executionEnvironments = [];

// Conditionally add the designated browser. This step is illustrative
// for adding potential future logic (e.g., 'if (isProductionMode)').
if (true) { // In this context, it's always true to add the browser.
    executionEnvironments.push(designatedBrowser);
}

// --- Reporting Mechanisms ---
// Configures how test results and progress are displayed.

// Define individual reporter types.
const consoleProgressReporter = 'progress'; // Shows real-time test progress in the console.
const desktopNotificationReporter = 'growl'; // Provides desktop notifications for test outcomes.

// Assemble the list of desired output generators.
// Demonstrating adding elements in a specific order.
const outputGenerators = [desktopNotificationReporter]; // Start with growl notifications.

// Add the console progress reporter at the beginning of the array.
// This ensures progress is visible before other notifications.
outputGenerators.unshift(consoleProgressReporter);

// --- Test Runner Behavior Flags ---
// Control the operational mode of the test runner.

// Flag to enable or disable continuous monitoring of file changes.
// If true, tests re-run automatically when source or test files are modified.
const continuousMonitoring = Boolean(1); // Explicitly setting boolean true.

// Flag to determine if the test runner should terminate after completing a single run.
// If false, the runner stays active, typically for continuous monitoring.
const oneShotExecution = Boolean(0); // Explicitly setting boolean false.