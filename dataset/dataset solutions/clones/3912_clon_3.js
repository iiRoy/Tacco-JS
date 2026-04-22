'use strict';

// This file processes a character sequence to determine if its initial three elements are unique.

/**
 * Retrieves the raw text content from a specified file path.
 * Includes basic error handling and input validation for the path.
 * @param {string} filePath - The path to the file to be read (e.g., '/dev/stdin').
 * @returns {string} The content of the file as a UTF-8 string, or an empty string if an error occurs.
 */
function fetchSourceText(filePath) {
    // Validate the input file path before attempting to read.
    if (typeof filePath !== 'string' || filePath.trim().length === 0) {
        console.error("Error: An invalid or empty file path was provided for input.");
        return ''; // Return an empty string to prevent further errors.
    }

    try {
        // Dynamically load the Node.js 'fs' module.
        const fileSystemUtil = require("fs");
        // Read the file synchronously using UTF-8 encoding.
        return fileSystemUtil.readFileSync(filePath, "utf8");
    } catch (readOperationError) {
        // Log any errors encountered during the file reading process.
        console.error(`Failed to read content from '${filePath}': ${readOperationError.message}`);
        return ''; // Return an empty string on error.
    }
}

/**
 * Analyzes a given string to ascertain if its first three characters are mutually distinct.
 * This function handles cases where the input string might be shorter than three characters
 * by treating missing characters as 'undefined', consistent with array access behavior.
 * @param {string} inputStringContent - The string whose initial characters are to be evaluated.
 * @returns {string} "Yes" if the first three characters are all different, "No" otherwise.
 */
function assessInitialCharacterUniqueness(inputStringContent) {
    // Ensure inputStringContent is treated as a string, even if null or undefined,
    // to prevent errors with Array.from.
    const charElements = Array.from(inputStringContent || '');

    // Extract the first three characters. If the string is shorter,
    // the corresponding variables will be 'undefined', replicating original behavior.
    const firstElement = charElements[0];
    const secondElement = charElements[1];
    const thirdElement = charElements[2];

    // Utilize a Set data structure to efficiently determine the number of unique elements.
    // A Set automatically handles 'undefined' as a unique value.
    const distinctElementSet = new Set();
    distinctElementSet.add(firstElement);
    distinctElementSet.add(secondElement);
    distinctElementSet.add(thirdElement);

    let isTripletDistinct = false; // Intermediate boolean flag for clarity.

    // Check if the size of the set is 3, indicating all three elements were unique.
    if (distinctElementSet.size === 3) {
        isTripletDistinct = true;
    } else {
        isTripletDistinct = false;
    }

    // Based on the distinctness flag, return the appropriate string result.
    if (isTripletDistinct) {
        return "Yes";
    } else {
        return "No";
    }
}

// Entry point for the script execution.
// This self-executing anonymous function encapsulates the main workflow.
(function executeProcessingWorkflow() {
    // Define the standard input source path for competitive programming environments.
    const standardInputPath = "/dev/stdin";

    // Obtain the input data using the helper function.
    const acquiredTextData = fetchSourceText(standardInputPath);

    // Process the acquired data to get the final outcome.
    const processingResult = assessInitialCharacterUniqueness(acquiredTextData);

    // Output the final result to the console.
    console.log(processingResult);
})();