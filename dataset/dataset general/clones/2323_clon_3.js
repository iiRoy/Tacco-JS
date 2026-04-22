const testVerifier = require('assert');
const cssMinificationModule = require('./index.js');
const VirtualFile = require('vinyl');

// --- Test Utilities and Configuration ---

// A common timeout for asynchronous operations in test cases, in milliseconds.
const ASYNC_TEST_OPERATION_TIMEOUT = 1200;

/**
 * Executes a CSS minification test, processes an input string, and verifies the output.
 * This helper centralizes the stream handling logic for cleaner test cases.
 *
 * @param {string} inputCssContent - The raw CSS string to be passed to the minifier.
 * @param {string} expectedOutputCssContent - The anticipated minimized CSS string.
 * @param {function} testCompletionCallback - The callback function provided by the test runner (e.g., Mocha's `done`).
 */
function executeAndVerifyCssMinification(inputCssContent, expectedOutputCssContent, testCompletionCallback) {
    // Create a virtual file object representing the input CSS.
    const sourceAsset = new VirtualFile({
        path: 'source-style.css', // Assigning a virtual path for context.
        contents: Buffer.from(inputCssContent, 'utf8') // Ensure content is a Buffer with explicit encoding.
    });

    // Instantiate a new processor stream for CSS minification.
    const minifierProcessorStream = cssMinificationModule();

    let outputDataReceived = false; // Flag to track if the 'data' event has fired.
    let streamErrorEncountered = false; // Flag to track if an 'error' event has fired.

    // Register a one-time listener for the 'data' event from the stream.
    minifierProcessorStream.once('data', (processedOutputAsset) => {
        outputDataReceived = true; // Mark that output data was received.

        // Critical validation: ensure the output asset is not null or undefined.
        if (!processedOutputAsset) {
            streamErrorEncountered = true;
            return testCompletionCallback(new Error('Processed output asset was unexpectedly null or undefined.'));
        }

        // Verify that the output asset retains its buffer type.
        testVerifier.ok(processedOutputAsset.isBuffer(), 'The output asset must be a buffer type.');

        // Convert the buffer content to a string for comparison.
        const actualProcessedContent = processedOutputAsset.contents.toString('utf8');
        // Assert that the actual output matches the expected minimized CSS.
        testVerifier.strictEqual(actualProcessedContent, expectedOutputCssContent, 'Minimized CSS content mismatch detected.');

        // If all checks pass, signal successful test completion.
        testCompletionCallback();
    });

    // Register a one-time listener for any 'error' events from the stream.
    minifierProcessorStream.once('error', (err) => {
        streamErrorEncountered = true;
        // Pass the error directly to the test completion callback.
        testCompletionCallback(err);
    });

    // Push the virtual source asset into the minifier stream.
    minifierProcessorStream.write(sourceAsset);
    // Signal the end of input to the stream, allowing it to finalize processing.
    minifierProcessorStream.end();

    // Implement a fallback timeout to catch tests that hang indefinitely.
    setTimeout(() => {
        if (!outputDataReceived && !streamErrorEncountered) {
            testCompletionCallback(new Error('Test timed out: Neither data nor error event received from the stream within the allowed time.'));
        }
    }, ASYNC_TEST_OPERATION_TIMEOUT);
}

// --- Test Suites for CSS Minification Module ---

// Main test suite for the `cssMinificationModule` utility.
suite('CSS Minification Utility Features', function() {
    // Set a global timeout for all tests within this suite, accounting for the helper's internal timeout.
    this.timeout(ASYNC_TEST_OPERATION_TIMEOUT + 300);

    // Optional hook: Executed before each individual test case.
    beforeEach(function() {
        // console.log(`Initiating test case: "${this.currentTest.title}"`); // Example of a new code fragment (logging).
    });

    // Test group focusing on standard buffer mode operations.
    testGroup('Standard Buffer Processing Mode', function() {
        // Test case: Verifying the minifier correctly processes and reduces complex CSS.
        spec('should accurately minimize a complex CSS payload', function(testCaseDone) {
            // Define the original, unminimized CSS string.
            const initialComplexCss = '@media print {a {color: #ff0000}} @media print {a {color: #f00;}}';
            // Define the expected output after minification.
            const anticipatedReducedCss = '@media print{a{color:red}}';

            // Use the helper function to execute the test and verify results.
            executeAndVerifyCssMinification(initialComplexCss, anticipatedReducedCss, testCaseDone);
        });
    });

    // Test group for handling edge cases, specifically empty input files.
    testGroup('Edge Case: Empty Input File Handling', function() {
        // Test case: Ensuring the utility processes an empty file without errors and returns empty content.
        spec('should gracefully handle an empty CSS file, returning no content and no errors', function(testCaseDone) {
            const emptyInputCssContent = '';
            const expectedEmptyOutputContent = ''; // An empty string is expected from an empty input.

            // Use the helper function for this specific edge case.
            executeAndVerifyCssMinification(emptyInputCssContent, expectedEmptyOutputContent, testCaseDone);
        });
    });

    // Added a new test group to cover error handling or malformed inputs (Type III addition).
    testGroup('Malformed Input and Error Management', function() {
        // Test case: Confirming the minifier can handle syntactically incorrect CSS without crashing.
        // The expected behavior for malformed input might vary (empty output, partial output, or an error).
        // For this clone, we assume it attempts to process and might result in an empty string if parsing fails.
        spec('should not crash when processing malformed CSS, and ideally return empty or partial output', function(testCaseDone) {
            // A CSS string with an unclosed block, making it malformed.
            const malformedCssSnippet = 'section { font-size: 1em; } article { display: block; background-color: #eee;';
            // Assuming the minifier fails to parse this fully and thus returns an empty string or very minimal output.
            // This expectation is an interpretation for a Type III clone, aligning with robust error handling.
            const anticipatedMalformedOutput = '';

            // Utilize the helper for this scenario, expecting an empty result if processing fails.
            executeAndVerifyCssMinification(malformedCssSnippet, anticipatedMalformedOutput, testCaseDone);
        });
    });
});