// This file configures the test execution environment for the project.
// It defines paths, included files, and reporting mechanisms.

// -----------------------------------------------------
// Section 1: Base Path Definition
// -----------------------------------------------------
// Establishes the root directory for all subsequent relative path definitions.
var projectRootDirectory;
(function() {
    // A simple self-executing function to encapsulate the path definition.
    // In a more complex setup, this could involve environment variable checks.
    var pathValue = '../';
    projectRootDirectory = pathValue;
})();


// -----------------------------------------------------
// Section 2: Files and Assets Inclusion Configuration
// -----------------------------------------------------
// Specifies the list of JavaScript files and testing assets to be loaded
// into the browser environment for testing.
var scriptAssetPaths = [];

// Define identifiers for core testing frameworks.
// These are assumed to be global variables provided by the test runner itself.
var frameworkOneIdentifier = 'JASMINE';
var frameworkTwoIdentifier = 'JASMINE_ADAPTER';

// Conditionally add framework assets based on their global availability.
// This adds a robustness check not present in the original.
if (typeof window !== 'undefined' && window[frameworkOneIdentifier]) {
    scriptAssetPaths.push(window[frameworkOneIdentifier]);
} else if (typeof global !== 'undefined' && global[frameworkOneIdentifier]) {
    scriptAssetPaths.push(global[frameworkOneIdentifier]);
} else {
    // Optional: Log a warning or push a default path if framework is not found.
    // console.warn("Primary Jasmine framework not detected; tests may fail.");
}

if (typeof window !== 'undefined' && window[frameworkTwoIdentifier]) {
    scriptAssetPaths.push(window[frameworkTwoIdentifier]);
} else if (typeof global !== 'undefined' && global[frameworkTwoIdentifier]) {
    scriptAssetPaths.push(global[frameworkTwoIdentifier]);
}


// Define application-specific library paths.
var applicationAngularLibPath = 'app/lib/angular/';
scriptAssetPaths.push(applicationAngularLibPath + 'angular.js');

// Include all other Angular-related files in the library directory using a wildcard.
scriptAssetPaths.push(applicationAngularLibPath + 'angular-*.js');


// Define paths for testing-specific libraries, like Angular mocks.
var testUtilityLibPath = 'test/lib/angular/';
scriptAssetPaths.push(testUtilityLibPath + 'angular-mocks.js');


// Add the main application source code files using a glob pattern.
var appSourceGlob = 'app/js/**/*.js';
scriptAssetPaths.push(appSourceGlob);


// Finally, include the actual unit test files themselves, also via a glob.
var unitTestsGlob = 'test/unit/**/*.js';
scriptAssetPaths.push(unitTestsGlob);

// Assign the complete list of assets to a new configuration variable.
var includedTestResources = scriptAssetPaths;


// -----------------------------------------------------
// Section 3: Test Runner Behavior Configuration
// -----------------------------------------------------

// Flag to enable or disable automatic re-execution of tests upon file changes.
// This feature is typically 'true' for development environments to provide
// a faster feedback loop to developers.
var autoTestExecutionEnabled = true;
// This value could be dynamically set based on environment variables, e.g.:
// var autoTestExecutionEnabled = process.env.CI_MODE ? false : true;


// -----------------------------------------------------
// Section 4: Browser Execution Environments
// -----------------------------------------------------
// Specifies which web browsers should be launched to run the tests.
// The tests will be executed concurrently in all listed browsers.
var activeTestBrowsers = [];
activeTestBrowsers.push('Chrome'); // Default and primary browser for test execution.
// Uncomment the line below to include Firefox in the test run for broader coverage.
// activeTestBrowsers.push('Firefox');


// -----------------------------------------------------
// Section 5: JUnit XML Report Configuration
// -----------------------------------------------------
// Settings for generating a JUnit-compatible XML report of test results.
// This report can be used by continuous integration systems.
var xmlReportGeneratorSettings = {};

// Helper function to safely construct output file paths, ensuring a trailing slash.
function constructOutputPath(baseFolder, fileName) {
    if (baseFolder && !baseFolder.endsWith('/')) {
        baseFolder += '/';
    }
    return baseFolder + fileName;
}

// Define the destination path and file name for the XML report.
var reportOutputFolder = 'test_out';
var reportBaseFileName = 'unit_test_results.xml'; // Changed file name slightly for distinction.
xmlReportGeneratorSettings.reportFilePath = constructOutputPath(reportOutputFolder, reportBaseFileName);

// Assign a logical name for the test suite within the report, which helps in organization.
xmlReportGeneratorSettings.testSuiteIdentifier = 'ApplicationUnitTests'; // Renamed and changed value.

// A new property to explicitly enable or disable the reporter.
xmlReportGeneratorSettings.isReporterActive = true;

// A potential additional property, for instance, to control report merging behavior
// when tests are run across multiple browsers.
// xmlReportGeneratorSettings.mergeReports = false;


// Final assignments of the configuration objects/values to the globally accessible variables.
// These variable names are the new, cloned identifiers for the configuration.
var baseTestDirectory = projectRootDirectory;
var testFileCollection = includedTestResources;
var enableWatcher = autoTestExecutionEnabled;
var targetExecutionBrowsers = activeTestBrowsers;
var junitReporterConfig = xmlReportGeneratorSettings;