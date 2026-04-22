/**
 * This module is designed to meticulously process raw text input,
 * typically received from standard input, to identify and count
 * the number of distinct data entries. It expects a specific input
 * format where the first line specifies the expected total count
 * of subsequent data items, each on its own line.
 */

/**
 * Analyzes a multi-line string to determine the quantity of unique data items.
 * The input string should begin with a header line indicating an expected
 * total item count, followed by individual data elements, each on a new line.
 * Robust error checking and validation are integrated.
 *
 * @param {string} sourceContentBlock - The complete raw string data to be processed.
 * @returns {void} The final count of unique elements is printed to the console.
 *                  Error and warning messages are printed to console.error/warn.
 */
function analyzeDistinctDataSet(sourceContentBlock) {
    // Perform initial validation on the raw input string.
    // Abort if the input is null, not a string, or contains only whitespace.
    if (!sourceContentBlock || typeof sourceContentBlock !== 'string' || sourceContentBlock.trim().length === 0) {
        console.error("Critical Error: The provided source content block is either empty, null, or not a valid string. Cannot proceed.");
        return; // Terminate execution for invalid input.
    }

    // Divide the entire content into an array of individual lines.
    // Using a regex to accommodate both Windows (\r\n) and Unix (\n) newline conventions.
    const contentLines = sourceContentBlock.split(/\r?\n/);

    // Refine the array by removing any lines that are entirely empty after trimming whitespace.
    // This handles cases with extra newlines, especially at the end of the input.
    const substantialLines = contentLines.filter(currentLine => currentLine.trim() !== '');

    // After filtering, verify that there are still meaningful lines to process.
    // At minimum, we anticipate a header line.
    if (substantialLines.length === 0) {
        console.error("Processing Error: No substantial data lines were found after filtering empty entries. Input might be malformed.");
        return;
    }

    // Extract the very first line, which is designated as the header.
    const headerValueString = substantialLines[0];
    let expectedEntryCount = 0; // Placeholder for the parsed numeric header value.

    // Attempt to convert the header string into an integer.
    // Include error handling for non-numeric or invalid header values.
    try {
        expectedEntryCount = parseInt(headerValueString, 10);
        // Additional check: Ensure the parsed number is a valid non-negative integer.
        if (isNaN(expectedEntryCount) || expectedEntryCount < 0) {
            console.warn(`Data Integrity Warning: The header value "${headerValueString}" could not be interpreted as a valid non-negative integer. Header count validation will be skipped.`);
            expectedEntryCount = 0; // Reset to 0 to prevent erroneous comparisons.
        }
    } catch (conversionProblem) {
        console.warn(`Data Integrity Warning: An exception occurred while attempting to parse the header "${headerValueString}". Details: ${conversionProblem.message}. Header validation will be bypassed.`);
        expectedEntryCount = 0; // Reset
    }

    // Collect all subsequent lines as the actual data payload.
    // This excludes the header line (index 0).
    const actualDataEntries = substantialLines.slice(1);

    // Introduce a new validation step: Compare the declared count from the header
    // with the actual number of data entries found.
    if (expectedEntryCount > 0 && actualDataEntries.length !== expectedEntryCount) {
        console.warn(`Consistency Alert: The declared number of items (${expectedEntryCount}) in the header does not match the actual number of data entries found (${actualDataEntries.length}). The system will proceed using the actual data entries.`);
    }

    // The core operation: Identify unique elements.
    // Using a JavaScript Set is a highly efficient method to automatically
    // store only unique values from an array or iterable.
    const uniqueElementSet = new Set(actualDataEntries);

    // The 'size' property of the Set directly provides the count of distinct elements.
    const finalDistinctCount = uniqueElementSet.size;

    // Present the computed result to the standard output.
    console.log(finalDistinctCount);
}

// Main execution block: This section handles reading input and initiating processing.
try {
    // Use Node.js's file system module to synchronously read all content
    // from standard input (/dev/stdin), interpreting it as UTF-8 text.
    const stdinRawBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');
    
    // Invoke our primary function with the data obtained from standard input.
    analyzeDistinctDataSet(stdinRawBuffer);

} catch (runtimeError) {
    // Catch and report any errors that occur during file reading or function execution.
    console.error(`An unexpected runtime error prevented the program from completing successfully: ${runtimeError.message}`);
    // Optionally, output the full stack trace for detailed debugging.
    // console.error(runtimeError.stack);
    
    // Exit the process with a non-zero status code to indicate an error.
    process.exit(1);
}