"use strict";

/**
 * Helper function to compute the factorial of a number 'val'
 * modulo a specified 'baseModulus'. This is used to prevent
 * integer overflow for large factorials and ensure results
 * remain within the desired range for modular arithmetic.
 *
 * @param {number} val The non-negative integer for which to compute the factorial.
 * @param {number} baseModulus The modulus to apply during multiplication.
 * @returns {number} The result of (val!) % baseModulus.
 */
const calculateFactorialModulo = (val, baseModulus) => {
    let currentFactorialResult = 1; // Initialize the product for factorial calculation
    // Iterate from 1 up to and including 'val'
    for (let factorIndex = 1; factorIndex <= val; factorIndex++) {
        // Multiply the current result by the factor, then apply the modulus.
        // This keeps the intermediate products from becoming too large.
        currentFactorialResult = (currentFactorialResult * factorIndex) % baseModulus;
    }
    return currentFactorialResult;
};

/**
 * Main handler function to process the input for a combinatorial problem.
 * It determines the number of ways to arrange two types of items (e.g., A and B)
 * such that they alternate, given their respective counts.
 *
 * @param {string} inputPayload The raw string input, expected to contain two space-separated integers on the first line.
 */
const processInputForAlternatingSequences = (inputPayload) => {
    // A large prime number used for modulo operations to keep calculations
    // within integer limits and for specific problem requirements.
    const MODULO_CONSTANT = 1000000007; // Represents 1e9 + 7

    // A predefined constant for the result when an alternating arrangement is impossible.
    const IMPOSSIBLE_ARRANGEMENT_COUNT = 0;

    // Pre-process the input string: remove leading/trailing whitespace and split into lines.
    const inputLines = inputPayload.trim().split('\n');

    // Basic validation for input format.
    if (inputLines.length === 0 || inputLines[0].trim().length === 0) {
        // If input is empty or the first line is empty, it's invalid.
        console.error("Input processing error: No valid input line found.");
        console.log(IMPOSSIBLE_ARRANGEMENT_COUNT);
        return;
    }

    // Extract the numerical counts from the first line of the input.
    const countTokens = inputLines[0].split(' ');
    // Parse the first integer count.
    const countOne = parseInt(countTokens[0], 10);
    // Parse the second integer count.
    const countTwo = parseInt(countTokens[1], 10);

    // More robust validation for parsed numerical values.
    if (isNaN(countOne) || isNaN(countTwo) || countOne < 0 || countTwo < 0) {
        // If parsing fails or counts are negative, indicate an error.
        console.error("Input processing error: Invalid or non-positive numerical counts provided.");
        console.log(IMPOSSIBLE_ARRANGEMENT_COUNT);
        return;
    }

    // Calculate the absolute difference between the two counts.
    const absoluteCountDifference = Math.abs(countOne - countTwo);

    // Constraint check: If the difference between the two counts is greater than 1,
    // it's impossible to arrange them in an alternating sequence.
    if (absoluteCountDifference > 1) {
        console.log(IMPOSSIBLE_ARRANGEMENT_COUNT);
        return; // Terminate early as no valid arrangement exists.
    }

    // Calculate the factorial of the first count modulo MODULO_CONSTANT.
    // This represents the number of permutations for items of the first type.
    const permutationsForCountOne = calculateFactorialModulo(countOne, MODULO_CONSTANT);

    // Calculate the factorial of the second count modulo MODULO_CONSTANT.
    // This represents the number of permutations for items of the second type.
    const permutationsForCountTwo = calculateFactorialModulo(countTwo, MODULO_CONSTANT);

    // Combine the permutations: The total number of ways to arrange the two sets of items
    // (without considering the alternating constraint yet, just their individual arrangements).
    let combinedPermutations = (permutationsForCountOne * permutationsForCountTwo) % MODULO_CONSTANT;

    // Determine the final adjustment multiplier based on the relationship between counts.
    // If counts are equal (e.g., 3 A's and 3 B's), there are two ways to start the sequence (A-B-A... or B-A-B...).
    // If counts differ by 1 (e.g., 3 A's and 2 B's), there's only one valid starting type (A-B-A-B-A).
    const sequenceStartMultiplier = (absoluteCountDifference === 0) ? 2 : 1;

    // Apply the final multiplier to the combined permutations, ensuring the result
    // remains within the modulo range.
    const finalCalculatedResult = (combinedPermutations * sequenceStartMultiplier) % MODULO_CONSTANT;

    // Output the computed final arrangement count.
    console.log(finalCalculatedResult);
};

// Entry point: Read all data from standard input (typically '/dev/stdin' in competitive programming environments)
// and pass it to the main processing function.
processInputForAlternatingSequences(require('fs').readFileSync('/dev/stdin', 'utf8'));