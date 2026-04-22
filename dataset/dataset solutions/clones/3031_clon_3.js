'use strict';

/**
 * Transforms a string representation into its integer equivalent.
 * This helper function ensures consistent parsing logic throughout.
 * @param {string} stringValue - The input string to be converted.
 * @returns {number} The integer value, or NaN if parsing fails.
 */
const parseNumericString = stringValue => parseInt(stringValue, 10);

/**
 * Analyzes a given set of numeric values to determine if a specific
 * target value lies strictly within the range defined by two other values.
 * This function encapsulates the core business logic.
 * @param {number} valueOne - The first bounding value.
 * @param {number} valueTwo - The second bounding value.
 * @param {number} valueTarget - The value to check against the bounds.
 * @returns {boolean} True if valueTarget is strictly between valueOne and valueTwo (inclusive of min/max selection), false otherwise.
 */
const checkIfTargetIsBetweenBounds = (valueOne, valueTwo, valueTarget) => {
    // Establish the minimum and maximum of the two bounding values.
    // This makes the comparison logic simpler and more robust,
    // handling cases where valueOne might be greater than valueTwo.
    const minimumBound = Math.min(valueOne, valueTwo);
    const maximumBound = Math.max(valueOne, valueTwo);

    // Perform the strict comparison: the target must be greater than the minimum
    // AND less than the maximum.
    return (valueTarget > minimumBound && valueTarget < maximumBound);
};

/**
 * The primary entry point for processing external data.
 * It handles input parsing, data extraction, logic execution, and output generation.
 * @param {string} rawInputContent - The complete raw string content read from the input source.
 */
const processExternalInput = rawInputContent => {
    // Normalize the input: trim whitespace and split into individual lines.
    // Then, for the very first line, split it by spaces and convert each segment to a number.
    // We only care about the first line for this specific problem.
    const [numericSegments] = rawInputContent
        .trim()
        .split('\n')
        .map(line => line.split(' ').map(parseNumericString));

    // Destructure the array of numeric segments to assign meaningful names
    // to the three critical values for clarity.
    const [firstComparativeValue, secondComparativeValue, valueToEvaluate] = numericSegments;

    // Execute the core logic using the extracted values.
    const isConditionMet = checkIfTargetIsBetweenBounds(
        firstComparativeValue,
        secondComparativeValue,
        valueToEvaluate
    );

    // Determine the appropriate message based on the result of the condition check.
    // A ternary operator provides a concise way to select the output string.
    const resultOutput = isConditionMet ? 'Yes' : 'No';

    // Print the final determined result to the standard output.
    console.log(resultOutput);
};

// --- System Interaction and Program Launch ---
// The program reads data from the standard input stream, typically from a file or pipe.
// It specifies 'utf8' encoding to correctly interpret text characters.
// Once the content is read, it's passed to our main processing function.
processExternalInput(require('fs').readFileSync('/dev/stdin', 'utf8'));