// A Type III clone of a JavaScript test suite for a CSS processing module.
// This version includes extensive renaming of identifiers, reformatting,
// and structural enhancements such as added validations, error handling,
// and helper variables to demonstrate significant transformation.

// --- Core Test Framework Dependencies ---
// Import the Chai assertion library for robust test validations.
var assertionUtility = require('chai');
// Configure Chai to use the 'should' assertion style, providing a more fluent API.
assertionUtility.should();

// Note: The 'sinon' mocking framework import has been removed as it was unused
// in the original snippet, demonstrating a deletion of non-essential code.

// --- Application Modules and Utility Functions ---
// Import the primary module under test, which handles CSS conversion logic.
var cssTransformationModule = require('../index.js');
// Import the Node.js 'fs' (file system) module for file and directory operations.
var fileSystemOperations = require('fs');
// Import the Node.js 'path' module for handling and transforming file paths.
var pathManipulation = require('path');

// Create aliases for frequently used file system functions to enhance readability
// and provide an additional layer of abstraction, fulfilling Type II renaming.
var retrieveFileContents = fileSystemOperations.readFileSync;
var listDirectoryEntries = fileSystemOperations.readdirSync;
var verifyPathExistence = fileSystemOperations.existsSync; // Added for Type III validation

// --- Test Suite Definition ---
// Define the main test suite using the framework's 'describe' function.
// The description is made more verbose and explicit, detailing the purpose.
describe('Functional verification of cssTransformationModule.convert(inputString)', function() {

  // Define a constant for the base directory where all test case files reside.
  // This improves maintainability and serves as a helper variable (Type III addition).
  const testCasesRootDirectory = pathManipulation.join('test', 'cases');

  // Retrieve an array of all file and directory names within the test cases root directory.
  // This is the initial step to discover all potential test assets.
  var allDiscoveredFileNames = listDirectoryEntries(testCasesRootDirectory);

  // Iterate over each discovered file name to dynamically generate individual test specifications.
  allDiscoveredFileNames.forEach(function(currentFileEntry) {

    // --- Type III: Skip Guard Clause for Transformed Files ---
    // Transformed files (e.g., 'example_t.css') represent expected outputs, not primary inputs.
    // This condition ensures that only base input files trigger the creation of a new test.
    // The `includes` method is clearer than bitwise `indexOf` (Type III rewrite).
    if (currentFileEntry.includes('_t')) {
      // console.debug(`Debug: Bypassing transformed output file: ${currentFileEntry}`); // Optional logging
      return; // Skip the current iteration and proceed to the next file entry.
    }

    // --- Extract Base File Name ---
    // Extract the core name of the CSS file, stripping its extension.
    // This base name is crucial for constructing paths to both input and expected output files.
    var baseCssFileName = pathManipulation.basename(currentFileEntry, '.css');

    // --- Construct Full Paths for Test Assets ---
    // Build the complete path for the input CSS file that will be processed.
    var sourceCssPath = pathManipulation.join(testCasesRootDirectory, currentFileEntry);
    // Build the complete path for the expected output CSS file, following the '_t.css' convention.
    var targetCssPath = pathManipulation.join(testCasesRootDirectory, baseCssFileName + '_t.css');

    // --- Type III: Pre-Validation of Test Assets ---
    // Before attempting to read, verify that both the input and its corresponding
    // expected output file actually exist on the file system. This robust check
    // prevents test failures due to missing assets (a Type III guard clause).
    if (!verifyPathExistence(sourceCssPath) || !verifyPathExistence(targetCssPath)) {
      console.warn(`Warning: Test assets missing for '${baseCssFileName}'. Skipping this test case.`);
      return; // Abort this test case if either file is not found.
    }

    // --- Define an Individual Test Case ---
    // Use the framework's 'it' function to define a specific test scenario.
    // The test description is made more descriptive, incorporating the file name.
    it(`should accurately convert '${baseCssFileName}.css' to its expected transformed state`, function() {
      var initialCssContent;
      var anticipatedCssResult;

      // --- Type III: Robust File Reading with Error Handling ---
      // Wrap file reading operations in a try-catch block. This enhancement
      // gracefully handles potential I/O errors, preventing a single corrupted
      // test file from crashing the entire test run (a Type III addition).
      try {
        // Read the full content of the input CSS file as a UTF-8 string.
        initialCssContent = retrieveFileContents(sourceCssPath, 'utf8');
        // Read the full content of the expected output CSS file for comparison.
        anticipatedCssResult = retrieveFileContents(targetCssPath, 'utf8');
      } catch (ioError) {
        // If an error occurs during file reading, explicitly fail the test
        // with a detailed message, rather than letting it throw unhandled.
        assertionUtility.expect().fail(`Failed to load test files for '${baseCssFileName}': ${ioError.message}`);
        return; // Terminate this test case early.
      }

      // --- Core Test Logic: Process and Assert ---
      // Invoke the 'convert' method of the CSS transformation module with the input content.
      var actualTransformationOutput = cssTransformationModule.convert(initialCssContent);

      // Assert that the actual output from the module is strictly identical
      // to the anticipated result from the '_t.css' file.
      // This uses the 'should' assertion style configured earlier.
      actualTransformationOutput.should.equal(anticipatedCssResult);

      // console.log(`Info: Test for '${baseCssFileName}.css' passed successfully.`); // Optional success logging
    });
  });
});