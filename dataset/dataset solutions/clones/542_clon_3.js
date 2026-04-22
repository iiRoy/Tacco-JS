const fileSystem = require('fs');

// Define the standard input file path for consistency.
const standardInputFile = '/dev/stdin';

let completeInputString; // Variable to hold the entire content read from stdin.

try {
    // Attempt to synchronously read the content of the standard input file.
    // The 'utf8' encoding ensures proper interpretation of text characters.
    completeInputString = fileSystem.readFileSync(standardInputFile, 'utf8');
} catch (fileReadError) {
    // If any error occurs during the file reading process, log it and terminate.
    console.error("Error encountered while accessing standard input:", fileReadError.message);
    // Exiting with a non-zero status code indicates an abnormal termination.
    process.exit(1);
}

// Verify that some content was actually read. An empty string could indicate an issue.
if (!completeInputString || completeInputString.trim().length === 0) {
    console.error("No valid input data received from standard input. Operation cannot proceed.");
    process.exit(1);
}

// Clean up the input string by removing any leading or trailing whitespace characters.
const processedInput = completeInputString.trim();

// Split the cleaned string into individual parts based on space delimiters.
// This is expected to yield an array of string representations of numbers.
const numericStringSegments = processedInput.split(" ");

// Ensure that exactly two numeric segments were provided in the input.
if (numericStringSegments.length !== 2) {
    console.error("Input format error: Expected two space-separated numbers, but detected", numericStringSegments.length, "segments.");
    process.exit(1);
}

let primaryOperand;   // Corresponds to 'a' in the original problem (denominator).
let secondaryOperand; // Corresponds to 'b' in the original problem (numerator).

// Parse the first string segment into a floating-point number.
primaryOperand = parseFloat(numericStringSegments[0]);

// Parse the second string segment into a floating-point number.
secondaryOperand = parseFloat(numericStringSegments[1]);

// Validate if both parsed values are indeed numbers.
if (isNaN(primaryOperand) || isNaN(secondaryOperand)) {
    console.error("Parsing error: One or both input segments could not be converted to valid numbers.");
    console.error(`Attempted conversion: '${numericStringSegments[0]}' -> ${primaryOperand}, '${numericStringSegments[1]}' -> ${secondaryOperand}`);
    process.exit(1);
}

/**
 * Computes the ceiling of the division of two numbers.
 * Includes a check for division by zero.
 * @param {number} dividend The number to be divided (numerator).
 * @param {number} divisor The number by which to divide (denominator).
 * @returns {number} The smallest integer greater than or equal to the quotient.
 * @throws {Error} If the divisor is zero.
 */
const performCeilingDivision = (dividend, divisor) => {
    // Crucial check to prevent mathematical errors.
    if (divisor === 0) {
        throw new Error("Attempted division by zero. The denominator cannot be zero.");
    }

    // Execute the division operation.
    const rawQuotient = dividend / divisor;

    // Apply the ceiling function to round up to the nearest whole number.
    const finalRoundedResult = Math.ceil(rawQuotient);

    return finalRoundedResult;
};

let calculatedResult; // Variable to store the outcome of the division.

try {
    // Invoke the specialized division function.
    // Note: In the original problem, the operation was Math.ceil(b/a),
    // meaning the second number divided by the first.
    calculatedResult = performCeilingDivision(secondaryOperand, primaryOperand);
} catch (calculationIssue) {
    // Handle any errors thrown by the division function, such as division by zero.
    console.error("An error occurred during the division calculation:", calculationIssue.message);
    process.exit(1);
}

// Output the final computed result to the console, making it clear what the value represents.
console.log("The computed ceiling value of the division is:", calculatedResult);

// Script execution successfully completed.