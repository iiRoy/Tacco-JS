// Function to compute the greatest common divisor (GCD) of two non-negative integers
// using the Euclidean algorithm. This is a fundamental number theory operation.
const determineGreatestCommonDivisor = (firstValue, secondValue) => {
    // Input validation: Ensure both inputs are numerical and non-negative.
    // While JavaScript is loosely typed, robust code should handle unexpected inputs.
    if (typeof firstValue !== 'number' || typeof secondValue !== 'number' || firstValue < 0 || secondValue < 0) {
        console.error("Error: Invalid input for GCD calculation. Expected non-negative numbers.");
        // Depending on context, could throw an error or return a default/error value.
        // For this problem, we'll assume valid inputs are generally provided.
        return 0; // Return 0 as a placeholder for invalid input, though GCD is usually for positive integers.
    }

    let largerNumber = Math.max(firstValue, secondValue);  // Assign the larger value
    let smallerNumber = Math.min(firstValue, secondValue); // Assign the smaller value

    // The core Euclidean algorithm loop.
    // It continues as long as the smaller number is not zero.
    while (smallerNumber !== 0) {
        const currentRemainder = largerNumber % smallerNumber; // Calculate the remainder of the division
        largerNumber = smallerNumber;                        // The former smaller number becomes the new larger
        smallerNumber = currentRemainder;                    // The remainder becomes the new smaller number
    }
    // When smallerNumber becomes 0, largerNumber holds the GCD.
    return largerNumber;
};

// Helper function to parse a single line of text containing space-separated numbers.
// It converts the string into an array of numbers.
const parseNumericLine = (lineContentString) => {
    // Check for valid string input to prevent errors from non-string or empty lines.
    if (typeof lineContentString !== 'string' || lineContentString.trim() === '') {
        console.warn("Warning: Attempted to parse an empty or invalid line string. Returning empty array.");
        return []; // Return an empty array for problematic input.
    }
    // Split the string by spaces and convert each part to a number.
    return lineContentString.split(" ").map(Number);
};

// --- Main Program Execution Flow ---

// Read all standard input synchronously. This is common in competitive programming.
// The '/dev/stdin' path is standard for Linux/Unix-like systems.
const rawInputBuffer = require('fs').readFileSync('/dev/stdin', 'utf8');

// Pre-process the raw input:
// 1. Trim any leading/trailing whitespace from the entire input.
// 2. Split the input into an array of individual lines.
const processedInputLinesArray = rawInputBuffer.trim().split("\n");

let currentInputLineIndex = 0; // Index to keep track of which line we're currently processing.

// Outer loop to handle multiple test cases (sets of data).
// The loop continues indefinitely until a specific termination condition is met.
while (true) {
    // Read the first number of the current set, which indicates how many pairs follow.
    // The unary plus (+) operator is a concise way to convert a string to a number.
    const currentSetPairCount = +processedInputLinesArray[currentInputLineIndex++];

    // Termination condition: If the number of pairs is 0, it signals the end of input.
    if (currentSetPairCount === 0) {
        break; // Exit the main processing loop.
    }

    // Initialize an array to store the simplified fraction pairs (numerator, denominator).
    const reducedFractionPairs = [];

    // Inner loop to read and process each fraction pair within the current set.
    for (let pairIdx = 0; pairIdx < currentSetPairCount; pairIdx++) {
        // Parse the current line into an array of two numbers (original numerator and denominator).
        const rawFractionComponents = parseNumericLine(processedInputLinesArray[currentInputLineIndex++]);

        // Basic validation for the parsed components.
        // Ensure there are exactly two numbers and they are not NaN.
        if (rawFractionComponents.length !== 2 || isNaN(rawFractionComponents[0]) || isNaN(rawFractionComponents[1])) {
            console.error(`Skipping malformed fraction input at line ${currentInputLineIndex - 1}.`);
            continue; // Skip to the next pair if this one is invalid.
        }

        // Calculate the GCD of the raw numerator and denominator to simplify the fraction.
        const pairGcdResult = determineGreatestCommonDivisor(rawFractionComponents[0], rawFractionComponents[1]);

        // Add the simplified fraction [numerator/gcd, denominator/gcd] to our list.
        reducedFractionPairs.push([
            rawFractionComponents[0] / pairGcdResult,
            rawFractionComponents[1] / pairGcdResult
        ]);
    }

    // Calculate the Least Common Multiple (LCM) of all denominators from the simplified fractions.
    // This LCM will serve as the common denominator for all adjusted fractions.
    let collectiveDenominatorLcm = 1; // Initialize LCM to 1, as LCM(x, 1) = x.

    // Iterate through each simplified fraction to progressively update the collective LCM.
    reducedFractionPairs.forEach(fractionComponents => {
        const currentFractionDenominator = fractionComponents[1]; // Extract the denominator

        // Calculate the GCD between the current fraction's denominator and the accumulated LCM.
        const gcdForLcmCalculation = determineGreatestCommonDivisor(currentFractionDenominator, collectiveDenominatorLcm);

        // Update the collective LCM using the formula: LCM(a, b) = (a * b) / GCD(a, b).
        // The form (a / GCD) * b is used to prevent potential overflow with very large intermediate products.
        collectiveDenominatorLcm = (currentFractionDenominator / gcdForLcmCalculation) * collectiveDenominatorLcm;
    });

    // Now, adjust the numerators of all simplified fractions so they all share
    // the `collectiveDenominatorLcm` as their new denominator.
    // The result is an array containing only these adjusted numerators.
    const transformedNumerators = reducedFractionPairs.map(originalFraction => {
        const originalNumerator = originalFraction[0];
        const originalDenominator = originalFraction[1];

        // Determine the factor needed to scale the original denominator to the common LCM.
        const scalingFactor = collectiveDenominatorLcm / originalDenominator;

        // Multiply the original numerator by this scaling factor to get the adjusted numerator.
        return originalNumerator * scalingFactor;
    });

    // Finally, for each transformed numerator, calculate and print the ratio of
    // the common denominator to that specific numerator.
    // This effectively prints the scaled reciprocal of the adjusted fractions.
    transformedNumerators.forEach(finalNumeratorValue => {
        // Guard against division by zero, although problem constraints might prevent this.
        if (finalNumeratorValue === 0) {
            console.log("0"); // If numerator is zero, the result is zero.
        } else {
            // Output the calculated ratio to standard output.
            console.log(collectiveDenominatorLcm / finalNumeratorValue);
        }
    });
}