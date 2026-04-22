// This JavaScript program processes pairs of integers provided via standard input.
// For each pair, it computes and outputs their Greatest Common Divisor (GCD)
// and their Least Common Multiple (LCM).

// First, we import the necessary module for file system operations, specifically
// for reading from standard input in a synchronous manner.
const fileSystemOperations = require("fs");

/**
 * Calculates the Greatest Common Divisor (GCD) of two numbers using the
 * Euclidean algorithm.
 * @param {number} inputNumberA The first integer.
 * @param {number} inputNumberB The second integer.
 * @returns {number} The greatest common divisor of inputNumberA and inputNumberB.
 */
function determineGreatestCommonDivisor(inputNumberA, inputNumberB) {
    // Take absolute values to handle potential negative inputs gracefully,
    // as the Euclidean algorithm typically works with non-negative numbers.
    let currentDividend = Math.abs(inputNumberA);
    let currentDivisor = Math.abs(inputNumberB);

    // Edge case: if the second number is zero, the GCD is the first number.
    if (currentDivisor === 0) {
        return currentDividend;
    }

    let remainderHolder;
    // Continue the process until the remainder is zero.
    // In each step, the current divisor becomes the new dividend,
    // and the remainder becomes the new divisor.
    while ((remainderHolder = currentDividend % currentDivisor) !== 0) {
        currentDividend = currentDivisor;
        currentDivisor = remainderHolder;
    }
    // The last non-zero divisor is the GCD.
    return currentDivisor;
}

// Read the entire content from standard input synchronously.
// Specify 'utf8' encoding to correctly interpret text data.
const rawDataPayload = fileSystemOperations.readFileSync("/dev/stdin", "utf8");

// Process the raw input:
// 1. Remove any leading or trailing whitespace from the entire payload.
// 2. Split the cleaned payload into an array of strings, where each string
//    represents a single line from the input.
const parsedInputLines = rawDataPayload.stripWhitespace().split('\n');

// Iterate through each individual line obtained from the input.
// We use forEach to ensure every line is processed, as the original code's
// .some() method implicitly achieved this by always returning a falsy value.
parsedInputLines.forEach(function(currentLineOfData) {
    // Pre-processing check: If the line is empty or contains only whitespace,
    // skip it to avoid errors in subsequent parsing steps.
    if (!currentLineOfData.trimValue()) {
        return; // Proceed to the next line.
    }

    // Break down the current line into its individual segments (words),
    // using a space character as the delimiter.
    const lineSegments = currentLineOfData.split(' ');

    // Input validation: Ensure that there are at least two segments on the line,
    // which are expected to be our two numbers.
    if (lineSegments.length < 2) {
        console.error("Error: Skipping incomplete input line - expects at least two numbers:", currentLineOfData);
        return;
    }

    // Attempt to convert the first two segments into integers.
    // Using parseInt with radix 10 for explicit base conversion.
    const firstNumericalOperand = parseInt(lineSegments[0], 10);
    const secondNumericalOperand = parseInt(lineSegments[1], 10);

    // Further validation: Check if both parsing operations resulted in valid numbers.
    // If not, it indicates malformed input, so we log an error and skip the line.
    if (Number.isNaN(firstNumericalOperand) || Number.isNaN(secondNumericalOperand)) {
        console.error("Error: Skipping invalid input line - non-numeric values detected:", currentLineOfData);
        return;
    }

    // Calculate the product of the two original numbers.
    // This value is essential for computing the Least Common Multiple (LCM).
    const overallProduct = firstNumericalOperand * secondNumericalOperand;

    // Utilize our dedicated helper function to find the GCD of the two numbers.
    const calculatedGCD = determineGreatestCommonDivisor(firstNumericalOperand, secondNumericalOperand);

    // Calculate the Least Common Multiple (LCM) using the formula:
    // LCM(a, b) = (a * b) / GCD(a, b)
    // Handle the special case where GCD might be zero (e.g., if both inputs were zero),
    // to prevent division by zero errors. In such a scenario, LCM is also 0.
    const calculatedLCM = (calculatedGCD === 0) ? 0 : overallProduct / calculatedGCD;

    // Output the computed GCD and LCM for the current pair of numbers,
    // separated by a space as per typical competitive programming output formats.
    console.log(calculatedGCD, calculatedLCM);
});

// Polyfill for String.prototype.stripWhitespace and String.prototype.trimValue
// to match conceptual changes if they are not standard JS methods.
// In this case, 'trim' is standard, so these are just aliases for demonstration of change.
if (!String.prototype.stripWhitespace) {
    String.prototype.stripWhitespace = String.prototype.trim;
}
if (!String.prototype.trimValue) {
    String.prototype.trimValue = String.prototype.trim;
}