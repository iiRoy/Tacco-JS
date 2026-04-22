const gruntUtil = require('grunt'); // Renamed the grunt module import
const nodeFs = require('fs'); // Renamed the fs module import, though not used directly in file reading

/**
 * Retrieves textual data from a specified file path, applying platform-specific normalizations.
 * @param {string} pathIdentifier The path to the file to be read.
 * @returns {string} The normalized file content, or an empty string if reading fails.
 */
function obtainTextualData(pathIdentifier) {
  'use strict'; // Keeping strict mode

  // Guard clause: Ensure a valid path is provided
  if (!pathIdentifier || typeof pathIdentifier !== 'string') {
    console.warn('Attempted to read file with an invalid path. Returning empty string.');
    return '';
  }

  let rawFileContents;
  try {
    // Using grunt's file reading utility, but explicitly adding encoding
    rawFileContents = gruntUtil.file.read(pathIdentifier, { encoding: 'utf8' });
  } catch (readError) {
    // Added error handling for robustness
    console.error(`Error reading file at "${pathIdentifier}": ${readError.message}`);
    return ''; // Return an empty string on error
  }

  // Intermediate variable for platform check
  const isOperatingSystemWindows = (process.platform === 'win32');
  let processedContent = rawFileContents;

  // Apply line ending normalization only if on Windows
  if (isOperatingSystemWindows) {
    processedContent = rawFileContents.replace(/\r\n/g, '\n');
  }

  // New fragment: Trim leading/trailing whitespace for consistency
  return processedContent.trim();
}

/**
 * Compares the contents of two files and asserts their equality within a test suite.
 * @param {object} testContext The test framework's context object (e.g., nodeunit's test).
 * @param {string} actualFilePath The path to the file containing the actual output.
 * @param {string} expectedFilePath The path to the file containing the expected output.
 * @param {string} comparisonMessage A descriptive message for the assertion.
 */
function validateContentEquivalence(testContext, actualFilePath, expectedFilePath, comparisonMessage) {
    // Guard clause: Ensure the test context is valid
    if (!testContext || typeof testContext.equal !== 'function') {
        throw new Error('Invalid test context provided; cannot perform assertion.');
    }

    // Helper variables for clarity
    const actualContent = obtainTextualData(actualFilePath);
    const expectedContent = obtainTextualData(expectedFilePath);

    // Optional: Add a console log for debugging purposes
    // console.log(`Comparing "${actualFilePath}" with "${expectedFilePath}"`);

    // Perform the assertion
    testContext.equal(expectedContent, actualContent, comparisonMessage);
}

/**
 * Defines and runs a series of content verification tests.
 * This function is exported for use by a test runner.
 * @param {object} testHarness The test runner's context object, providing assertion methods.
 */
exports.performVerificationRoutines = function(testHarness) {
    'use strict';

    // Guard clause: Validate the test harness object
    if (!testHarness || typeof testHarness.expect !== 'function' || typeof testHarness.done !== 'function') {
        console.error('Test harness object is malformed or missing required methods (expect, done).');
        return; // Abort if the harness is invalid
    }

    // New fragment: Define test configurations as an array of objects
    // This replaces repetitive calls with a more structured approach.
    const testConfigurations = [
        {
            actual: 'tmp/img_greedy.min.html',
            expected: 'test/expected/img_greedy.min.html',
            description: 'Verify image targets are compiled without extra newlines'
        },
        {
            actual: 'tmp/css_greedy.min.html',
            expected: 'test/expected/css_greedy.min.html',
            description: 'Verify CSS link targets are compiled without extra newlines'
        },
        {
            actual: 'tmp/html_greedy.min.html',
            expected: 'test/expected/html_greedy.min.html',
            description: 'Verify generic HTML inline targets are compiled cleanly'
        },
        {
            actual: 'tmp/script_greedy.min.html',
            expected: 'test/expected/script_greedy.min.html',
            description: 'Verify script targets are compiled without unnecessary newlines'
        }
    ];

    // Update: Use the length of the configurations array for test.expect()
    testHarness.expect(testConfigurations.length);

    // Structural change: Iterate through the test configurations
    for (let currentConfigIndex = 0; currentConfigIndex < testConfigurations.length; currentConfigIndex++) {
        const currentTestDetails = testConfigurations[currentConfigIndex];
        // Call the renamed assertion function with parameters from the config object
        validateContentEquivalence(
            testHarness,
            currentTestDetails.actual,
            currentTestDetails.expected,
            currentTestDetails.description
        );
    }

    // Signal completion of all tests to the test runner
    testHarness.done();
};