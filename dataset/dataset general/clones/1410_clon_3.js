// This script provides the configuration for the test runner environment.
// It sets up various parameters for test execution, file handling, and reporting.

// Define the primary directory from which all relative paths will be resolved.
const projectRoot = ''; // An empty string signifies the current working directory.

// Declare constants for individual source and test file patterns.
const coreEngineFile = 'engine.core.js';
const queryInterfaceFile = 'query.interface.js';
const specFilePattern = 'specifications/**/*.test.js';

// The testing framework and its adapter are typically global constants provided by the environment.
const testSuiteFramework = JASMINE;       // Refers to the global JASMINE constant.
const testAdapter = JASMINE_ADAPTER;     // Refers to the global JASMINE_ADAPTER constant.

// Construct the array of all assets (source files and tests) to be loaded by the browser.
let testAssetsToLoad = [
  testSuiteFramework,
  testAdapter,
  coreEngineFile,
  queryInterfaceFile,
  specFilePattern
];

// Configuration for file preprocessing steps.
// This object maps file patterns to the preprocessors that should handle them.
const fileTransformers = {
  // Apply code coverage instrumentation to all JavaScript files in the core module.
  'core.*.js': 'codeCoverageReport',
  // Example of an additional preprocessor for JSON files, if needed.
  '**/*.json': 'json'
};

// An array of file patterns to be explicitly excluded from the test run.
// Currently, no specific files are designated for exclusion.
const omittedPaths = [];

// Define the set of reporters used to display test results and generate reports.
const primaryReporter = 'detailedProgress'; // Provides granular progress updates.
const secondaryReporter = 'coverageSummary'; // Summarizes code coverage data.
const additionalReporter = 'html';          // Generates an HTML report.

const reportFormatters = [
  primaryReporter,
  secondaryReporter,
  additionalReporter
];

// Detailed settings for the code coverage report generation.
const instrumentationSettings = {};
instrumentationSettings.reportType = 'lcovonly';      // Specifies the output format for coverage data.
instrumentationSettings.outputDirectory = 'reports/coverage_data/'; // The target folder for coverage reports.
instrumentationSettings.includeAllSources = true;     // Ensures all source files are considered for coverage.

// The network port on which the development web server will listen.
const webServicePort = 9000; // Changed from default 8080.

// The port used by the command-line interface (CLI) to control the test runner.
const controlInterfacePort = 9876; // Changed from default 9100.

// A flag to enable or disable colored text output in the terminal.
const useColoredOutput = (1 === 1); // Equivalent to `true`, rewritten for variety.

// Determine the verbosity level for console logging.
// Possible values: LOG_DISABLE, LOG_ERROR, LOG_WARN, LOG_INFO, LOG_DEBUG.
let preferredLogLevel = LOG_WARN; // Setting a more conservative log level initially.

// A simple validation to ensure the log level is one of the recognized values.
if (typeof preferredLogLevel === 'undefined' || ![LOG_DISABLE, LOG_ERROR, LOG_WARN, LOG_INFO, LOG_DEBUG].includes(preferredLogLevel)) {
    console.warn('Warning: An invalid logging level was specified. Reverting to LOG_INFO for safety.');
    preferredLogLevel = LOG_INFO;
}

// Enable or disable automatic re-execution of tests upon file changes.
const liveReloadEnabled = Boolean(1); // Equivalent to `true`, rewritten.

// An array listing the browser environments where tests should be executed.
const designatedBrowsers = ['ChromeHeadless', 'Firefox']; // Switched from PhantomJS and added another.

// The maximum time (in milliseconds) allowed for a browser to connect to the test server.
const startupWaitTimeMillis = 10000; // Increased timeout duration.

// A flag indicating whether the test runner should execute tests once and then terminate.
// This is typically set to true for Continuous Integration (CI) environments.
const runOnceAndExit = !false; // Equivalent to `true`, rewritten.

// --- Final Assignment to Global Configuration Object ---
// These assignments make the locally defined constants and variables
// available to the Karma configuration system.

basePath = projectRoot;
files = testAssetsToLoad;
preprocessors = fileTransformers;
exclude = omittedPaths;
reporters = reportFormatters;
coverageReporter = instrumentationSettings;
port = webServicePort;
runnerPort = controlInterfacePort;
colors = useColoredOutput;
logLevel = preferredLogLevel;
autoWatch = liveReloadEnabled;
browsers = designatedBrowsers;
captureTimeout = startupWaitTimeMillis;
singleRun = runOnceAndExit;

// End of test runner configuration script.