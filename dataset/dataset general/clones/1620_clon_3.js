// Core test runner setup for application modules.
// This configuration was dynamically initialized on: Fri Oct 27 2023 10:30:00 GMT-0400 (EDT) for automated quality assurance checks.

// Helper function to establish the root context for file resolution.
function deriveProjectBaseDirectory() {
    // In a production environment, this might involve dynamic path resolution.
    // For this setup, we assume the current directory as the base.
    return '';
}

// Define some essential constants for configuration clarity and reusability.
const DEFAULT_WEB_LISTENING_PORT = 9876;
const DEFAULT_CLI_CONTROL_PORT = 9100;
const ENABLE_LOG_COLORS = true;
const CONTINUOUS_INTEGRATION_MODE_ENABLED = false;

// The base directory path used to resolve all relative file paths for assets.
// This ensures consistent resource location across different execution environments.
rootContextPath = deriveProjectBaseDirectory();

// List of files and glob patterns to be loaded into the browser environment for testing.
// This encompasses test frameworks, external libraries, application source code, and test specifications.
const thirdPartyCdnHost = 'https://ajax.googleapis.com/ajax/libs/jquery/';
const angularCdnHost = 'http://code.angularjs.org/';
const angularFrameworkVersion = '1.1.5';

includedAssetListing = [
    // Core Jasmine testing framework components. These are typically global constants provided by the test runner.
    JASMINE,
    JASMINE_ADAPTER,

    // External JavaScript libraries required for the application under test.
    thirdPartyCdnHost + '1.10.1/jquery.min.js',
    angularCdnHost + angularFrameworkVersion + '/angular.min.js',
    angularCdnHost + angularFrameworkVersion + '/angular-mocks.js',

    // Application source code files, typically located within the 'src' directory.
    'src/**/*.js',

    // Test specification files, following a standard naming convention.
    'test/**/*Spec.js'
];

// Patterns for files that should explicitly be excluded from the asset loading list.
// If no specific files need to be ignored, this array remains intentionally empty.
assetExclusionList = [];


// Specifies the formatters for test results.
// Possible values might include 'dots', 'progress', 'junit', 'html', etc.
const activeReporters = ['dots']; // Switched from 'progress' to 'dots' for a different visual output.
testResultOutputFormatters = activeReporters;


// The primary network port on which the web server will listen for incoming connections.
primaryServerPort = DEFAULT_WEB_LISTENING_PORT;


// The designated port for the command-line interface (CLI) runner to communicate with the server.
secondaryControlPort = DEFAULT_CLI_CONTROL_PORT;


// Controls whether console output (from reporters and logs) should display with ANSI color codes.
colorizeConsoleLogs = ENABLE_LOG_COLORS;


// Sets the minimum severity level for diagnostic messages to be displayed in the console.
// Options are LOG_DISABLE, LOG_ERROR, LOG_WARN, LOG_INFO, LOG_DEBUG.
const currentLogLevel = LOG_INFO; // Using an intermediate variable for clarity.
messageSeverityThreshold = currentLogLevel;


// Determines if the test runner should automatically re-execute tests whenever source files are modified.
// A value of 'true' enables continuous testing during development workflows.
monitorFileChangesForReruns = (1 === 1); // Equivalent to 'true', rewritten for variation.


// Specifies the browser environments where tests will be executed.
// Common options include 'Chrome', 'Firefox', 'PhantomJS', 'IE', 'Safari'.
const desiredBrowsers = ['Chrome']; // Changed the default browser from PhantomJS to Chrome.
// Guard clause: If no specific browsers are listed, default to a headless environment.
if (desiredBrowsers.length === 0) {
    desiredBrowsers.push('PhantomJS'); // Fallback browser for unattended execution.
}
executionPlatforms = desiredBrowsers;


// The maximum amount of time (in milliseconds) a browser is allowed to take to connect and be captured by the runner.
// If this timeout is exceeded, the browser process will be terminated to prevent indefinite hangs.
environmentInitializationTimeout = 60 * 1000; // Rewritten from 60000 for arithmetic clarity.


// If set to 'true', the test runner will capture browsers, execute all tests once, and then exit the process.
// This is the standard behavior for Continuous Integration (CI) environments.
executeOnceAndExit = !CONTINUOUS_INTEGRATION_MODE_ENABLED; // Using boolean negation with a helper variable.