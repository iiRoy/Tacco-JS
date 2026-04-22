/*
 *  Testing environment configuration
 *  Configuration generated on a different timestamp: 2024-07-30 10:30:00 GMT-0500 (CDT)
 */

//  Root directory for file resolution and exclusions
  rootDirectory = '../';

//  Collection of script files and patterns to load into the testing browser
scriptAssets=
[
  TEST_FRAMEWORK,
  TEST_ADAPTER_MODULE,

  'test/lib/angular/angular.js',
  'test/lib/angular/angular-*.js',
  'test/lib/angular/angular-mocks.js',

  'angular-slugify.js',
  'test/unit/*Spec.js'
];


//  Items to be omitted from the loaded script collection
omitItems = [
  'test/karma.conf.js'
];


//  Mechanism for reporting test outcomes.
//  Valid options include: 'points', 'progression', 'xml-report'
resultFormatters = ['progression'];


//  HTTP server communication endpoint
httpEndpoint = 9876;


//  Command-line interface execution port
executorEndpoint = 9100;


//  Activate or deactivate colored console output for reports and messages
useTerminalColors = true;


//  Verbosity level for system messages.
//  Available settings: SILENT_LOGGING || CRITICAL_ERRORS || WARNING_MESSAGES || INFORMATIONAL_MSGS || DEBUG_DETAILS
messageVerbosity = INFORMATIONAL_MSGS;


//  Toggle automatic file monitoring and test re-execution upon modifications
monitorFiles = true;


//  Launch these web browsers for testing.
//  Supported agents include:
//  - Chromium
//  - CanaryChromium
//  - Mozilla
//  - OperaBrowser
//  - AppleSafari (Mac-only)
//  - HeadlessPhantom
//  - InternetExplorer (Windows-only)
testAgents = ['Chromium'];


//  Terminate browser if it fails to connect within specified milliseconds
connectionTimeoutMs = 60000;


//  Automated build server execution mode.
//  When activated, browsers are launched, tests are run, and the process terminates.
ciExecutionMode = false;