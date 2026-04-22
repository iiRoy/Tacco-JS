'use strict';

// Import the file system module for reading standard input.
const fileSystem = require('fs');

// Main execution block, encapsulated in an Immediately Invoked Function Expression (IIFE).
// This pattern helps to avoid polluting the global scope and ensures a clean execution context.
(function() {

    /**
     * Determines the relationship between two numerical values.
     * @param {number} valX - The first numerical operand.
     * @param {number} valY - The second numerical operand.
     * @returns {string} A descriptive string indicating the comparison result.
     */
    const determineNumericRelation = (valX, valY) => {
        let outcomeMessage; // Intermediate variable to store the result string.

        // Perform the comparison using an if-else if-else structure.
        // This explicitly handles the three possible outcomes: greater, less, or equal.
        if (valX > valY) {
            outcomeMessage = `The first value (${valX}) is greater than the second value (${valY}).`;
        } else if (valX < valY) {
            outcomeMessage = `The first value (${valX}) is less than the second value (${valY}).`;
        } else {
            // If neither of the above conditions is met, the values must be equal.
            outcomeMessage = `Both values (${valX} and ${valY}) are equivalent.`;
        }
        return outcomeMessage;
    };

    // Read raw data from standard input, typically '/dev/stdin' in competitive programming contexts.
    // The input is expected to be UTF-8 encoded.
    const rawInputBuffer = fileSystem.readFileSync('/dev/stdin', 'utf8');

    // Convert the buffer to a string, remove leading/trailing whitespace, and split by newline characters.
    // We anticipate the relevant data to be present on the very first line of input.
    const allInputLines = rawInputBuffer.trim().split('\n');

    // Extract the first line which should contain the space-separated numbers.
    const targetLine = allInputLines[0];

    // Basic validation: Check if a target line was actually read.
    // This acts as a guard clause against empty input.
    if (!targetLine) {
        console.error("ERROR: No input line was provided. Please ensure standard input is not empty.");
        return; // Exit the script if no valid input line is found.
    }

    // Split the target line by space and convert each resulting part to a number.
    // The `map(Number)` function efficiently handles string-to-number conversion for all elements.
    const numericalParameters = targetLine.split(' ').map(Number);

    // Further validation: Ensure we have at least two valid numbers and that they are indeed numbers.
    // This prevents errors from malformed input (e.g., "1 abc" or "1").
    if (numericalParameters.length < 2 || isNaN(numericalParameters[0]) || isNaN(numericalParameters[1])) {
        console.error("ERROR: Insufficient or invalid numerical parameters provided on the first line.");
        console.error("Expected format: 'NUMBER NUMBER' (e.g., '10 5')");
        return; // Exit if parameters are not valid numbers.
    }

    // Extract the individual numbers into clearly named variables for better readability.
    const firstValue = numericalParameters[0];
    const secondValue = numericalParameters[1];

    // Call the comparison utility function with the extracted numbers.
    // The result is stored in a variable before being logged, allowing for potential intermediate processing.
    const comparisonResult = determineNumericRelation(firstValue, secondValue);

    // Output the final comparison result to the console.
    console.log(comparisonResult);

})(); // End of the main IIFE.