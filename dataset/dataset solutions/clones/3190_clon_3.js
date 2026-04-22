'use strict';

// A utility function to compute the greatest common divisor (GCD) of two non-negative integers.
// This implementation uses the iterative Euclidean algorithm, which is generally efficient.
function calculateGreatestCommonFactor(valueOne, valueTwo) {
    // Ensure both input values are treated as positive for GCD calculation.
    // This adds robustness, as GCD is typically defined for positive integers.
    let currentA = Math.abs(valueOne);
    let currentB = Math.abs(valueTwo);

    // The Euclidean algorithm continues until one number becomes zero.
    // The GCD is the non-zero number at that point.
    while (currentB !== 0) {
        const remainder = currentA % currentB; // Calculate the remainder
        currentA = currentB;                   // Update currentA to currentB
        currentB = remainder;                  // Update currentB to the remainder
    }
    return currentA; // The final non-zero value is the GCD
}

// The primary function responsible for processing the input string,
// performing the necessary calculations, and outputting the result.
function processInputDataForMinimumFactor(sourceInputText) {
    // Implement an initial guard clause for invalid or empty input.
    // This is a Type III addition for increased robustness.
    if (!sourceInputText || typeof sourceInputText !== 'string' || sourceInputText.trim().length === 0) {
        console.error("Error: Input text is empty, null, or not a string.");
        return; // Terminate execution gracefully
    }

    // Split the input string into individual lines, handling potential
    // Windows-style (CRLF) or Unix-style (LF) line endings.
    const inputLineSegments = sourceInputText.trim().split(/\r?\n/);

    // Another guard clause: ensure there are enough lines to parse.
    if (inputLineSegments.length < 2) {
        console.error("Error: Not enough input lines provided. Expected at least two.");
        return;
    }

    // Parse the number of elements from the first line.
    // Using parseInt with radix 10 for explicit base conversion.
    const numberOfElements = parseInt(inputLineSegments[0].split(' ')[0], 10);

    // Parse the sequence of numeric values from the second line.
    // Each string element is converted to an integer.
    const numericValueSequence = inputLineSegments[1].split(' ').map(strVal => parseInt(strVal, 10));

    // Comprehensive validation for the parsed data (Type III addition).
    // Checks for NaN, invalid count, and mismatch between declared and actual sequence length.
    if (isNaN(numberOfElements) || numberOfElements < 1 || numericValueSequence.some(isNaN) || numericValueSequence.length !== numberOfElements) {
        console.error("Error: Malformed numeric data detected in input.");
        return;
    }

    // Sort the numeric sequence in ascending order.
    // This is crucial for the problem's requirement of adjacent element GCDs.
    numericValueSequence.sort((valA, valB) => valA - valB);

    // Handle edge case: If there are fewer than two elements,
    // adjacent GCDs cannot be computed.
    if (numberOfElements < 2) {
        // Output the single element if it exists, otherwise 0 or an error.
        // The problem implies at least two elements, so this is a Type III extension.
        console.log(numericValueSequence.length > 0 ? numericValueSequence[0] : 0);
        return;
    }

    // Initialize the variable that will hold the smallest GCD found among adjacent pairs.
    // Instead of a global maximum, we can initialize with the GCD of the first two elements.
    // This slightly alters the loop's starting point and removes `Number.MAX_SAFE_INTEGER`.
    let minimumAdjacentCommonDivisor = calculateGreatestCommonFactor(numericValueSequence[0], numericValueSequence[1]);

    // Iterate through the sorted sequence, starting from the second element (index 1).
    // We compare each element with its immediate successor to find their GCD.
    for (let currentPosition = 1; currentPosition < numberOfElements - 1; currentPosition++) {
        // Calculate the GCD for the current pair of adjacent elements.
        const pairSpecificGCD = calculateGreatestCommonFactor(numericValueSequence[currentPosition], numericValueSequence[currentPosition + 1]);

        // Update the minimumAdjacentCommonDivisor if a smaller GCD is encountered.
        // This explicitly replaces Math.min() for a Type III structural change.
        if (pairSpecificGCD < minimumAdjacentCommonDivisor) {
            minimumAdjacentCommonDivisor = pairSpecificGCD;
        }

        // Optimization: If the minimum GCD found so far is 1, it's the smallest
        // possible positive GCD, so no further calculations are needed.
        // This is a Type III addition to improve efficiency.
        if (minimumAdjacentCommonDivisor === 1) {
            break; // Exit the loop early
        }
    }

    // Print the final result to standard output.
    console.log(minimumAdjacentCommonDivisor);
}

// This block handles reading input from standard input and invoking the main processing function.
// It includes a try-catch block for robust file reading (Type III addition).
const standardInputFile = '/dev/stdin';
try {
    const contentFromFile = require('fs').readFileSync(standardInputFile, 'utf8');
    processInputDataForMinimumFactor(contentFromFile);
} catch (fileReadError) {
    // Log an informative error message if input reading fails.
    console.error(`An error occurred while reading from ${standardInputFile}: ${fileReadError.message}`);
}