"use strict"; // Enforce stricter parsing and error handling for robust code execution.

// Acquire the Node.js file system module for input operations.
const fileSystemInterface = require('fs');

// Define the standard input file path.
const standardInputPath = '/dev/stdin';

let rawInputBuffer; // Variable to hold the raw content read from the input source.

// Attempt to synchronously read the entire content from the standard input.
try {
    rawInputBuffer = fileSystemInterface.readFileSync(standardInputPath, 'utf8');
} catch (inputReadError) {
    // Log an error and terminate if the input file cannot be accessed or read.
    console.error(`ERROR: Unable to read input from ${standardInputPath}. Details: ${inputReadError.message}`);
    process.exit(1); // Exit with a non-zero code to indicate failure.
}

// Divide the raw input string into an array of individual lines.
const parsedInputLines = rawInputBuffer.split('\n');

// --- Input Validation and Parsing ---

// Ensure a minimum number of input lines are present for processing.
if (parsedInputLines.length < 2) {
    console.error("ERROR: Insufficient input provided. Expected at least two lines of data.");
    process.exit(1);
}

// Parse the first line to determine the total count of elements.
const declaredElementCount = Number.parseInt(parsedInputLines[0], 10); // Explicitly use base 10 for parsing.

// Validate the parsed element count.
if (isNaN(declaredElementCount) || declaredElementCount <= 0) {
    console.error("ERROR: The first line must contain a positive integer representing the number of elements.");
    process.exit(1);
}

// Process the second line to obtain the array of initial integer values.
const currentDataVector = parsedInputLines[1]
    .split(' ') // Split the line by spaces.
    .filter(segment => segment.trim() !== '') // Filter out any empty strings that might result from multiple spaces.
    .map(numericString => Number.parseInt(numericString, 10)); // Convert each non-empty segment to an integer.

// Validate that the actual number of elements matches the declared count.
if (currentDataVector.length !== declaredElementCount) {
    console.error(`ERROR: Mismatch detected! Declared element count (${declaredElementCount}) does not match actual array length (${currentDataVector.length}).`);
    process.exit(1);
}

// --- Core Transformation Logic (Bitwise XOR Operations) ---

// This section iterates through the array to perform conditional bitwise XOR operations.
// The loops run from the declared count down to 1, representing 1-based indexing for clarity
// in the divisibility checks, while array access remains 0-based.

for (let potentialDivisor = declaredElementCount; potentialDivisor >= 1; --potentialDivisor) {
    // Calculate the 0-based index for the element that acts as the divisor.
    const divisorZeroBasedIndex = potentialDivisor - 1;

    // A redundant check for robustness, ensuring index is valid.
    if (divisorZeroBasedIndex < 0 || divisorZeroBasedIndex >= declaredElementCount) {
        continue;
    }

    for (let potentialDividend = declaredElementCount; potentialDividend >= 1; --potentialDividend) {
        // Calculate the 0-based index for the element that acts as the dividend.
        const dividendZeroBasedIndex = potentialDividend - 1;

        // Another redundant check for robustness.
        if (dividendZeroBasedIndex < 0 || dividendZeroBasedIndex >= declaredElementCount) {
            continue;
        }

        // Condition: The dividend must be strictly greater than the divisor.
        // This corresponds to the original `if (i >= j) continue;` logic.
        if (potentialDivisor >= potentialDividend) {
            continue; // Skip if the divisor is not strictly smaller than the dividend.
        }

        // Check if the potentialDividend is perfectly divisible by the potentialDivisor.
        if (potentialDividend % potentialDivisor === 0) {
            // Perform the bitwise XOR operation.
            // The value at the divisor's index is updated with its XOR result with the dividend's value.
            const valueAtDivisorPos = currentDataVector[divisorZeroBasedIndex];
            const valueAtDividendPos = currentDataVector[dividendZeroBasedIndex];
            const resultantXOR = valueAtDivisorPos ^ valueAtDividendPos;
            currentDataVector[divisorZeroBasedIndex] = resultantXOR;
        }
    }
}

// --- Result Aggregation and Output ---

// If, for some reason, the array became empty (unlikely with current logic), handle gracefully.
if (currentDataVector.length === 0) {
    console.log("0"); // Output 0 for the count.
    process.exit(0);
}

// Filter the modified array to find all elements that are strictly equal to 1.
const elementsHavingValueOne = currentDataVector.filter(numericVal => numericVal === 1);

// Count how many such elements were found.
const countOfOnes = elementsHavingValueOne.length;

// Output the total count of '1's.
console.log(countOfOnes);

// If there are any elements with value '1', print them space-separated on a new line.
if (countOfOnes > 0) {
    const formattedOneValues = elementsHavingValueOne.join(' ');
    console.log(formattedOneValues);
}
// An explicit else block can be added here for scenarios where no '1's are found,
// but the current output behavior implicitly handles this by not printing a second line.