'use strict';

/**
 * A utility function to convert a string into an integer, providing a default
 * value of zero if the conversion is unsuccessful (e.g., the string is not
 * a valid number). This enhances robustness for input parsing.
 *
 * @param {string} stringRepresentation - The string value intended to be parsed as an integer.
 * @returns {number} The successfully parsed integer, or 0 if parsing fails.
 */
const parseNumericValueSafely = (stringRepresentation) => {
    const parsedNumericalEntity = parseInt(stringRepresentation, 10);
    // If the result of parseInt is Not-a-Number, return 0; otherwise, return the parsed number.
    return Number.isNaN(parsedNumericalEntity) ? 0 : parsedNumericalEntity;
};

/**
 * This primary processing routine accepts raw textual input, typically from
 * a standard input stream. It is designed to extract two numerical values
 * from the first line of the input and then apply specific conditional logic
 * to compute and output a final result.
 *
 * The logic is as follows:
 * - If the first number is 13 or greater, the output is the second number.
 * - If the first number is between 6 (inclusive) and 13 (exclusive), the output is half of the second number.
 * - Otherwise (if the first number is less than 6), the output is 0.
 *
 * @param {string} systemInputData - The entire raw string content received from the input source.
 * @returns {void} The function prints the calculated numerical result to the console.
 */
const executeCalculationPipeline = (systemInputData) => {
    // First, isolate the very first line from the potentially multi-line input.
    const firstLineOfData = systemInputData.split('\n')[0];

    // Then, break down this first line into individual string components,
    // using a space character as the delimiter.
    const componentStrings = firstLineOfData.split(' ');

    // --- Input Validity Check ---
    // A guard clause to ensure that there are at least two distinct components
    // available for processing, as required by the problem's logic.
    if (componentStrings.length < 2) {
        // If the input format is insufficient, log a default error-like value (0)
        // and terminate the function's execution gracefully.
        console.log(0);
        return;
    }

    // Extract and safely parse the first numerical component.
    // This value serves as the primary determinant for the conditional logic.
    const primaryCriterion = parseNumericValueSafely(componentStrings[0]);

    // Extract and safely parse the second numerical component.
    // This value acts as the base operand for the calculations.
    const secondaryBaseOperand = parseNumericValueSafely(componentStrings[1]);

    let finalResultantValue; // Declare a variable to hold the outcome of our calculations.

    // --- Core Decision-Making Logic ---
    // Evaluate the 'primaryCriterion' against predefined thresholds to
    // determine the appropriate calculation.
    if (primaryCriterion >= 13) {
        // Condition 1: If the primary criterion meets or exceeds 13.
        // The output is directly the value of the secondary operand.
        finalResultantValue = secondaryBaseOperand;
    } else if (primaryCriterion >= 6) {
        // Condition 2: If the primary criterion is at least 6 but less than 13.
        // The output is half of the secondary operand.
        finalResultantValue = secondaryBaseOperand / 2;
    } else {
        // Condition 3: If the primary criterion is less than 6.
        // The output is a fixed numerical zero.
        finalResultantValue = 0;
    }

    // Output the final computed result to the standard output stream.
    console.log(finalResultantValue);
};

// --- Program Entry Point ---
// Define the standard input file path, common in Unix-like environments.
const standardInputFile = '/dev/stdin';

// Utilize the Node.js 'fs' module to synchronously read the content
// of the standard input file. The 'utf8' encoding ensures proper string handling.
const acquiredRawData = require('fs').readFileSync(standardInputFile, 'utf8');

// Initiate the main processing pipeline by passing the acquired raw data.
executeCalculationPipeline(acquiredRawData);