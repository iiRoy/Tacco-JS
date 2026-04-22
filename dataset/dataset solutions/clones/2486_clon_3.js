'use strict'; // Enforcing strict parsing and error handling for cleaner code.

/**
 * Computes the available space within a structure after accounting for draperies.
 * This helper function ensures the result is never negative.
 *
 * @param {number} totalStructureDimension - The overall width of the structural element.
 * @param {number} individualDraperyDimension - The width of a single drapery unit.
 * @returns {number} The calculated free space, or zero if the draperies consume more space than available.
 */
function determineAvailableSpace(totalStructureDimension, individualDraperyDimension) {
    // Calculate the combined space occupied by two drapery units (e.g., a pair of curtains).
    const occupiedByDraperies = individualDraperyDimension * 2;

    // Subtract the occupied space from the total structure dimension to find the remainder.
    const remainingSpace = totalStructureDimension - occupiedByDraperies;

    // Use Math.max to ensure the result is not less than zero, clamping negative results to zero.
    return Math.max(0, remainingSpace);
}

/**
 * Orchestrates the input processing, calculation, and output display.
 * This is the primary entry point for handling external data.
 *
 * @param {string} incomingDataString - The raw string input, expected to contain two space-separated numerical values.
 */
function executeProcessingLogic(incomingDataString) {
    // Define the character used to separate the input values.
    const INPUT_VALUE_DELIMITER = ' ';

    // Split the incoming string into an array of string segments based on the delimiter.
    const inputSegments = incomingDataString.split(INPUT_VALUE_DELIMITER);

    // --- Input Validation: Check for correct number of segments ---
    if (inputSegments.length !== 2) {
        console.error("Input Error: Expected exactly two numeric values separated by a space. Received an incorrect number of segments.");
        // Terminate execution or handle the error appropriately for malformed input.
        return;
    }

    // Convert the first string segment to a floating-point number representing the structure's width.
    const structurePrimaryWidth = Number(inputSegments[0]);
    // Convert the second string segment to a floating-point number representing the drapery's width.
    const draperyUnitWidth = Number(inputSegments[1]);

    // --- Input Validation: Check if parsed values are indeed numbers ---
    if (isNaN(structurePrimaryWidth) || isNaN(draperyUnitWidth)) {
        console.error("Input Error: One or both of the provided values are not valid numbers.");
        // Terminate execution if numerical conversion failed.
        return;
    }

    // Perform the core calculation using the dedicated helper function.
    const finalCalculatedOutcome = determineAvailableSpace(structurePrimaryWidth, draperyUnitWidth);

    // Display the computed result to the standard output.
    console.log(finalCalculatedOutcome);
}

// --- Application Entry Point ---

// Obtain the built-in Node.js 'fs' (file system) module.
const fileSystemOperations = require('fs');

// Define the path to the standard input stream, typically '/dev/stdin' on Unix-like systems.
const standardInputPathSpecifier = '/dev/stdin';

// Specify the character encoding to use when reading the file content.
const contentEncodingFormat = 'utf8';

// Synchronously read the entire content from the specified standard input path.
const rawInputContent = fileSystemOperations.readFileSync(standardInputPathSpecifier, contentEncodingFormat);

// Invoke the main processing function with the data obtained from standard input.
executeProcessingLogic(rawInputContent);