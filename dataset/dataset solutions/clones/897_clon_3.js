// This module handles file system operations, specifically reading input from standard input.
const fileSystemInterface = require('fs');

// --- Configuration Constants for Input Processing ---
// Defines the path for reading standard input. In Unix-like systems, this is typically /dev/stdin.
const STANDARD_INPUT_PATH = '/dev/stdin';
// The special character sequence that signals the end of input processing.
const TERMINATION_SEQUENCE = '#';
// The fundamental angular unit used in calculations, representing 90 degrees.
const PRIMARY_ANGULAR_UNIT = 90.0;
// Maximum denominator to search for when simplifying fractions, to prevent excessive computation.
const MAX_FRACTION_DENOMINATOR = 10000;
// A small epsilon value for floating-point comparisons to consider a number an "integer".
const EPSILON_FOR_INTEGER_CHECK = 1e-9;

/**
 * Helper function to determine if a given number is effectively an integer,
 * accounting for potential floating-point inaccuracies.
 * @param {number} valueToCheck - The number to check.
 * @param {number} tolerance - The allowed deviation from the nearest integer.
 * @returns {boolean} True if the number is effectively an integer, false otherwise.
 */
const isApproximatelyInteger = (valueToCheck, tolerance = EPSILON_FOR_INTEGER_CHECK) => {
    return Math.abs(valueToCheck - Math.round(valueToCheck)) < tolerance;
};

// --- Input Acquisition and Preparation ---
// Read the entire content of the standard input file synchronously.
// Ensure it's decoded as UTF-8 text.
let rawInputContent;
try {
    rawInputContent = fileSystemInterface.readFileSync(STANDARD_INPUT_PATH, 'utf8');
} catch (errorReadingFile) {
    // Basic error handling for file reading issues.
    console.error("Error reading input from standard input:", errorReadingFile.message);
    process.exit(1); // Exit with an error code.
}

// Trim leading/trailing whitespace from the raw input and split it into an array of individual lines.
const processedInputLines = rawInputContent.trim().split("\n");

// --- Main Processing Loop for Each Input Line ---
let currentLineIndex = 0; // An index to track the current line being processed, replacing array.shift().

// Continue processing lines as long as there are lines remaining in the buffer.
while (currentLineIndex < processedInputLines.length) {
    // Retrieve the next line from the buffer and advance the index.
    let activeInputLine = processedInputLines[currentLineIndex++];

    // Check if the current line signifies the end of input.
    if (activeInputLine === TERMINATION_SEQUENCE) {
        // Upon encountering the termination marker, exit the processing loop.
        break;
    }

    // --- Line Pre-processing Steps ---
    // Define the regular expression for substrings to be removed.
    // This pattern matches "orth" or "est" globally.
    const removalPattern = /(orth|est)/g;
    // Remove specified substrings from the input line.
    let cleanedLine = activeInputLine.replace(removalPattern, '');

    // Reverse the characters of the cleaned string.
    let reversedLine = cleanedLine.split('').reverse().join('');

    // --- Validation: Check for Empty Line After Pre-processing ---
    if (reversedLine.length === 0) {
        console.warn(`Skipping empty or invalid input segment after processing: "${activeInputLine}"`);
        continue; // Move to the next input line.
    }

    // --- Angle Calculation Logic ---
    let resultantAngle = 0.0; // Initialize the accumulating angle value.
    const initialDirectionChar = reversedLine[0]; // The first character determines the base angle.

    // Determine the initial angle based on the very first character of the reversed segment.
    if (initialDirectionChar === 'n') {
        resultantAngle = 0.0; // 'n' (north) typically implies a base of 0 degrees.
    } else if (initialDirectionChar === 'w') {
        resultantAngle = PRIMARY_ANGULAR_UNIT; // 'w' (west) typically implies a base of 90 degrees.
    } else {
        // If an unexpected character is found at the start, log a warning and proceed with a default.
        console.warn(`Unrecognized initial direction character '${initialDirectionChar}' in "${activeInputLine}". Defaulting to 0 degrees.`);
        resultantAngle = 0.0;
    }

    // Iterate through the rest of the characters to refine the angle.
    // The index 'charPosition' here represents the precision level or depth of the directional instruction.
    for (let charPosition = 1; charPosition < reversedLine.length; charPosition++) {
        const currentDirectionChar = reversedLine[charPosition];
        // Calculate the angular adjustment for the current precision level.
        // This is 90 degrees divided by 2 raised to the power of the character's position (level).
        const angularCorrection = PRIMARY_ANGULAR_UNIT / (2 ** charPosition); // Using exponentiation operator.

        // Adjust the resultant angle based on the current direction character.
        if (currentDirectionChar === 'n') {
            resultantAngle -= angularCorrection; // 'n' subtracts the correction.
        } else if (currentDirectionChar === 'w') {
            resultantAngle += angularCorrection; // 'w' adds the correction.
        } else {
            // Log a warning for any unexpected characters within the sequence.
            console.warn(`Unknown direction character '${currentDirectionChar}' at position ${charPosition} in "${activeInputLine}". Ignoring.`);
        }
    }

    // --- Angle Simplification to Integer or Fraction ---
    let optimalDenominator = 1; // Start searching for the smallest integer denominator from 1.
    let formattedResult; // Variable to hold the final string representation of the angle.

    // Loop to find the smallest integer 'd' such that 'resultantAngle * d' is an integer.
    // This effectively converts the decimal to its simplest fractional form or integer.
    for (let currentDenominator = 1; currentDenominator <= MAX_FRACTION_DENOMINATOR; currentDenominator++) {
        // Check if multiplying the angle by the current denominator yields an integer.
        if (isApproximatelyInteger(resultantAngle * currentDenominator)) {
            optimalDenominator = currentDenominator;
            break; // Found the smallest denominator, so exit the loop.
        }
    }

    // After finding the optimal denominator, format the result.
    if (optimalDenominator === 1) {
        // If the optimal denominator is 1, the angle is an integer.
        formattedResult = Math.round(resultantAngle).toString(); // Round to nearest integer.
    } else {
        // Otherwise, represent it as a fraction (numerator/denominator).
        const numeratorValue = Math.round(resultantAngle * optimalDenominator);
        formattedResult = `${numeratorValue}/${optimalDenominator}`;
    }

    // --- Output the Calculated and Formatted Angle ---
    console.log(formattedResult);
}