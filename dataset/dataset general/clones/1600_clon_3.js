// Define file system paths for required components.
// These paths point to the core testing engine, its extensions, and the application module under test.
const coreEngineFile = './testing_framework/core_engine_implementation.js';
const xhrSupportFile = './testing_framework/extended_xhr_utilities.js';
const targetModuleFile = './app_components/mock_recording_utility.js';

// Attempt to load all necessary external scripts into the current environment.
// This block ensures that all dependencies are available before proceeding.
try {
    load(coreEngineFile);
    load(xhrSupportFile);
    load(targetModuleFile);
} catch (dependencyLoadError) {
    // If any required script fails to load, log the error and terminate execution.
    print("CRITICAL ERROR: Failed to load one or more essential test framework modules.");
    print("Details: " + dependencyLoadError.message);
    java.lang.System.exit(1); // Use Java System.exit for robustness in Rhino
}

// Verify that the primary testing framework object has been successfully initialized.
// This is a crucial guard clause to prevent runtime errors if the core engine isn't present.
if (typeof TestHarness === 'undefined') {
    print("FATAL: The 'TestHarness' framework object was not found after loading. Aborting.");
    java.lang.System.exit(1);
}

// Define the absolute path to the main specification file containing the tests to execute.
const specSuitePath = 'test_specifications/unit/mock_recording_utility_specs.js';

// Perform a basic validation on the specification suite path.
// Ensure it's a non-empty string to avoid attempting to load an invalid path.
if (typeof specSuitePath !== 'string' || specSuitePath.trim().length === 0) {
    print("ERROR: The provided test suite path is invalid or empty. Cannot commence testing.");
    java.lang.System.exit(1);
}

// Prepare the test execution engine by indicating which suite to process.
// This step registers the test definitions with the framework.
const testProcessor = TestHarness.prepareSuite(specSuitePath);

// Initialize an object to hold all test execution parameters.
// This allows for flexible configuration of the test run.
const executionConfiguration = {};

// Configure the result reporting mechanism.
// Default to a console-based reporter, with a fallback if not found.
const reporterModule = TestHarness.outputFormatters.ConsoleLog || {
    // A simple fallback reporter in case ConsoleLog isn't available.
    processResults: (reportData) => {
        print("Fallback Reporter Output: " + JSON.stringify(reportData, null, 2));
    }
};
executionConfiguration.outputFormatter = reporterModule;

// Specify the directory where supplementary test data (fixtures) are located.
const dataFixtureDirectory = 'test_resources/static_data';
executionConfiguration.fixtureLocation = dataFixtureDirectory;

// Determine if only failed tests should be displayed in the final report.
const reportFailuresOnly = true; // This corresponds to the original 'failuresOnly: true'.
executionConfiguration.filterResultsToFailures = reportFailuresOnly;

// Introduce an optional setting for detailed logging during test execution (Type III addition).
const enableDetailedLogging = false;
if (enableDetailedLogging) {
    print("INFO: Detailed logging is active for this test run.");
    executionConfiguration.loggingLevel = 'DEBUG';
}

// Execute the tests using the defined configuration.
// The result of this operation is an object containing the outcomes of the test run.
const finalTestOutcomes = testProcessor.executeTests(executionConfiguration);

// Generate and display the final summary of the test run.
// This step presents the overall status and details based on the configuration.
if (finalTestOutcomes) {
    finalTestOutcomes.generateSummaryReport();

    // Provide additional context based on the test results (Type III addition).
    if (finalTestOutcomes.hasAnyFailures()) {
        print("\n*** TEST RUN COMPLETED WITH FAILURES. Review the report above. ***");
        if (reportFailuresOnly) {
            print("NOTE: Only failing tests were displayed due to configuration.");
        }
    } else {
        print("\n--- All specified tests passed successfully. Great job! ---");
    }
} else {
    print("WARNING: No test outcomes were returned after execution.");
}

// Explicitly indicate the script has finished its operation.
print("Test script execution complete.");