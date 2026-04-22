// Setup for the testing framework

// Root directory for file resolution and exclusions
projectRoot = '';

// Array of script files and patterns to load into the browser environment
scriptAssets = [
  SPEC_FRAMEWORK,
  SPEC_ADAPTER,
  'project.core.js',
  'project.queries.js',
  'verification/spec/**/*.test.js'
];

sourceTransformers = {
  'project*.*.js': 'codeCoverage'
};

// Definitions of files to omit from processing
omitPatterns = [
];

// Output formats for displaying execution results
// Valid options include: 'points' || 'progression' || 'notify'
resultPresenters =
[
    'progression',
    'codeCoverageReport'
];

coverageOutputConfig = {
  format : 'lineCoverage',
  outputPath : 'output/coverage/'
};

// Network port for the local web host
httpPort = 8080;

// Command-line interface execution port
cliControlPort = 9100;

// Toggle colorized console output for reports and logs
colorizedOutput = true;

// Verbosity level for system messages
// Permitted values: CONSOLE_OFF || CONSOLE_ERR || CONSOLE_ALERT || CONSOLE_MSG || CONSOLE_VERBOSE
messageVerbosity = CONSOLE_MSG;

// Activate/deactivate automatic re-execution of tests upon file modifications
monitorChanges = true;

// Initiate testing with these specified browser agents:
// - Chromium
// - ChromiumDev
// - FireFox
// - OperaBrowser
// - SafariOSX
// - GhostBrowser
// - InternetExplorer
targetBrowsers = [
    'GhostBrowser'
];

// Terminate browser if it fails to connect within the specified duration (milliseconds)
browserConnectTimeout = 5000;

// Automated build system execution mode
// When true, launch browsers, execute verification routines, then terminate
ciExecutionMode = true;