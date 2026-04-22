"use strict"; // Enforcing strict JavaScript parsing and execution rules for cleaner code.

/**
 * A robust utility function designed to safely convert a string into an integer.
 * It handles potential parsing failures by returning 0 if the input cannot be
 * converted into a valid number. This enhances the reliability of input processing.
 *
 * @param {string} valueAsString The string representation of a number to be parsed.
 * @returns {number} The successfully parsed integer, or 0 if parsing fails (e.g., input is 'abc').
 */
const safeIntegerConverter = (valueAsString) => {
    // Attempt to parse the string into an integer using base 10 (decimal).
    const convertedNumber = parseInt(valueAsString, 10);
    // Check if the result of parseInt is NaN (Not-a-Number). If it is, return 0; otherwise, return the parsed number.
    return isNaN(convertedNumber) ? 0 : convertedNumber;
};

/**
 * This core function processes raw input data to categorize a list of numbers
 * based on two predefined thresholds. It then calculates and outputs the size
 * of the smallest category. The process involves input validation, data parsing,
 * number categorization, and final result determination.
 *
 * @param {string} rawInputContent The complete input as a single string,
 *                                 expected to contain multiple lines of data.
 */
const analyzeCategoricalCounts = (rawInputContent) => {
    // Trim any leading/trailing whitespace from the input and split it into an array of lines.
    const contentLines = rawInputContent.trim().split('\n');

    // --- Initial Input Validation and Data Extraction ---

    // Ensure that the input contains the minimum required number of lines for processing.
    if (contentLines.length < 3) {
        console.error("ERROR: Input data is incomplete. Expected at least three lines of information.");
        return; // Halt execution if critical input is missing.
    }

    // The first line provides the expected total number of elements.
    const expectedElementQuantity = safeIntegerConverter(contentLines[0]);

    // The second line contains two space-separated threshold values.
    const boundaryValues = contentLines[1].split(" ");
    // Validate that both threshold values are present.
    if (boundaryValues.length < 2) {
        console.error("ERROR: Threshold values (A and B) are missing or improperly formatted.");
        return;
    }
    const lowerBoundary = safeIntegerConverter(boundaryValues[0]); // Corresponds to original 'A'
    const upperBoundary = safeIntegerConverter(boundaryValues[1]); // Corresponds to original 'B'

    // The third line contains the main list of numbers, space-separated.
    // Each string is converted to an integer, and any non-numeric results are filtered out.
    const inputNumericList = contentLines[2]
                                .split(' ')
                                .map(safeIntegerConverter) // Use the robust converter
                                .filter(num => typeof num === 'number' && !isNaN(num)); // Ensure only valid numbers remain

    // --- Categorization Process ---

    // Initialize counters for each of the three categories.
    // Instead of creating arrays, we directly count the elements in each category for efficiency.
    let groupOneTally = 0;   // Elements less than or equal to 'lowerBoundary'
    let groupTwoTally = 0;   // Elements greater than 'lowerBoundary' but less than or equal to 'upperBoundary'
    let groupThreeTally = 0; // Elements strictly greater than 'upperBoundary'

    // Iterate over each number in the processed list to assign it to a category.
    // Using forEach for a clear, functional iteration style.
    inputNumericList.forEach(currentNumberValue => {
        // Apply the categorization rules based on the defined thresholds.
        if (currentNumberValue <= lowerBoundary) {
            groupOneTally++; // Increment count for the first category.
        } else if (currentNumberValue <= upperBoundary) {
            groupTwoTally++; // Increment count for the second category.
        } else {
            groupThreeTally++; // Increment count for the third category.
        }
    });

    // --- Optional Validation and Final Result ---

    // A supplementary check to compare the parsed count of numbers against the declared 'N'.
    // This is an additional layer of robustness, logging a warning if there's a discrepancy.
    if (inputNumericList.length !== expectedElementQuantity) {
        console.warn(`WARNING: Declared element count (${expectedElementQuantity}) differs from actual processed count (${inputNumericList.length}). Proceeding with actual count.`);
    }

    // Calculate the minimum count among the three categorized groups.
    // This value represents the smallest group, which is the final answer.
    const smallestGroupSize = Math.min(groupOneTally, groupTwoTally, groupThreeTally);

    // Output the calculated minimum group size to the standard console.
    console.log(smallestGroupSize);
};

// --- Program Execution Entry Point ---

// This block handles reading input from the standard input stream and initiating the processing.
// A try-catch block is used to gracefully handle potential file system errors or runtime exceptions.
try {
    const fileSystemModule = require('fs'); // Dynamically load the 'fs' module for file operations.
    // Read the entire content of standard input synchronously, interpreting it as UTF-8 text.
    const stdinContent = fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    // Invoke the main processing function with the obtained input.
    analyzeCategoricalCounts(stdinContent);
} catch (executionIssue) {
    // If any error occurs during input reading or function execution, log the error message.
    console.error(`An unexpected error prevented the program from completing: ${executionIssue.message}`);
    // Optionally, an exit code could be set here to signal failure to the operating system.
    // process.exit(1);
}