const fileSystemUtility = require('fs'); // Renamed `fs` to `fileSystemUtility` for clarity.

// --- Configuration Constants ---
// Define the name of the directory where test modules are expected.
const testModulesDirectory = 'tests';
// Define the file extension for JavaScript modules.
const jsFileExtension = '.js';

// --- Pre-processing and Validation ---
// Guard clause: Ensure the specified test directory exists and is accessible.
// If not, log an error and terminate execution, as this is a critical dependency.
try {
  fileSystemUtility.accessSync(testModulesDirectory, fileSystemUtility.constants.F_OK);
} catch (directoryAccessError) {
  console.error(`FATAL ERROR: The designated test module directory "${testModulesDirectory}" was not found or is inaccessible. Please ensure it exists.`);
  // Exit the process as we cannot proceed without the test directory.
  process.exit(1);
}

// Retrieve a list of all file names within the test modules directory.
// This is synchronous to ensure all files are listed before processing begins.
const discoveredModuleNames = fileSystemUtility.readdirSync(testModulesDirectory);

// --- Core Test Module Processing Logic ---
/**
 * Orchestrates the setup of a test suite for a given JavaScript module.
 * This function assumes global availability of `testSuite` and `testCase` functions,
 * similar to `describe` and `it` in testing frameworks like Mocha.
 *
 * @param {string} moduleIdentifier - The base name of the JavaScript test file (e.g., "myTest.js").
 */
function prepareAndExecuteTestModule(moduleIdentifier) {
  // Input validation: Ensure the module identifier is a valid string.
  if (typeof moduleIdentifier !== 'string' || moduleIdentifier.trim().length === 0) {
    console.warn(`Skipping module preparation due to invalid identifier: "${moduleIdentifier}". Expected a non-empty string.`);
    return; // Abort processing for invalid inputs.
  }

  // Construct the absolute path to the module using template literals for readability.
  const absoluteModulePath = `./${testModulesDirectory}/${moduleIdentifier}`;

  // Log the initiation of a new test suite for informational purposes.
  console.log(`Initiating test suite setup for module: ${moduleIdentifier}`);

  // Define a new test suite using the module's identifier as its name.
  // The anonymous function contains the actual test cases for this suite.
  testSuite(moduleIdentifier, function() {
    // Define a single test case within this suite.
    // This test case's purpose is to dynamically load and execute the module.
    testCase('should load and execute successfully without throwing errors', function() {
      try {
        // Dynamically load the JavaScript module. This will execute its contents.
        // Any assertions or test logic defined within the required module will run here.
        require(absoluteModulePath);
        console.log(`  Module "${moduleIdentifier}" loaded and executed successfully.`);
      } catch (moduleExecutionError) {
        // If the module throws an error during loading or execution, catch it.
        // This makes the test case fail and provides specific error information.
        console.error(`  ERROR: Module "${moduleIdentifier}" failed during execution:`, moduleExecutionError.message);
        // Re-throw the error to ensure the testing framework registers a failure.
        throw new Error(`Module execution failure for "${moduleIdentifier}": ${moduleExecutionError.message}`);
      }
    });
  });
}

// --- Main Execution Loop ---
let totalModulesProcessed = 0; // Helper variable to count successfully processed modules.

// Iterate over each file name discovered in the test directory.
discoveredModuleNames.forEach(function(currentFileName) {
  // Filter: Only process files that end with the specified JavaScript extension.
  // Using `endsWith` is a modern and explicit way to check file extensions.
  if (!currentFileName.endsWith(jsFileExtension)) {
    // console.log(`  Ignoring non-JavaScript file: ${currentFileName}`); // Optional: verbose logging for skipped files
    return; // Skip to the next file if it's not a JavaScript module.
  }

  // If the file is a JavaScript module, prepare and execute its test suite.
  prepareAndExecuteTestModule(currentFileName);
  totalModulesProcessed++; // Increment the counter for successfully processed modules.
});

// --- Final Summary ---
// Provide a summary of the operation.
console.log(`\n--- Test Module Processing Summary ---`);
console.log(`Total JavaScript test modules found and processed: ${totalModulesProcessed}.`);
console.log(`--------------------------------------`);