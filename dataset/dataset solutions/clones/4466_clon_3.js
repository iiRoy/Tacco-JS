"use strict";

// Define constant strings for possible outcomes to improve readability and maintainability.
const IMPOSSIBLE_OUTCOME_STRING = "IMPOSSIBLE";
const POSSIBLE_OUTCOME_STRING = "POSSIBLE";

/**
 * Computes the greatest common divisor (GCD) of two non-negative integers using an iterative Euclidean algorithm.
 * This function handles cases where one or both numbers might be zero, returning the non-zero number or zero if both are zero.
 *
 * @param {number} parameterA - The first integer for GCD computation.
 * @param {number} parameterB - The second integer for GCD computation.
 * @returns {number} The greatest common divisor of the two input parameters.
 */
const computeGreatestCommonDivisor = (parameterA, parameterB) => {
    // Ensure inputs are non-negative; absolute values are used as GCD is typically for positive integers.
    // This is an added robustness (Type III change).
    let currentDividend = Math.abs(parameterA);
    let currentDivisor = Math.abs(parameterB);

    // The Euclidean algorithm continues until the divisor becomes zero.
    // The dividend at that point is the GCD.
    while (currentDivisor !== 0) {
        // Store the current divisor in a temporary variable.
        let temporaryStorage = currentDivisor;
        // Calculate the remainder of the dividend divided by the divisor.
        currentDivisor = currentDividend % currentDivisor;
        // Update the dividend to be the value that was previously the divisor.
        currentDividend = temporaryStorage;
    }
    // Return the final dividend, which is the GCD.
    return currentDividend;
};

/**
 * Determines the greatest common divisor (GCD) for a collection of numbers.
 * It iterates through the list, applying the `computeGreatestCommonDivisor` function cumulatively.
 *
 * @param {number[]} inputNumberCollection - An array of numerical values.
 * @returns {number} The GCD of all numbers in the collection, or 0 if the collection is empty or invalid.
 */
const deriveOverallCommonDivisor = (inputNumberCollection) => {
    // Type III: Add extensive input validation for the array.
    if (!Array.isArray(inputNumberCollection) || inputNumberCollection.length === 0) {
        // For an empty or invalid collection, the GCD is conventionally undefined or 0.
        // We'll return 0, as per common mathematical interpretation for such cases.
        console.warn("Warning: Attempted to derive common divisor from an empty or non-array collection. Returning 0.");
        return 0;
    }

    // Use the `reduce` method to apply `computeGreatestCommonDivisor` iteratively across the collection.
    // The initial value for reduction is the first element of the collection.
    const finalCalculatedDivisor = inputNumberCollection.reduce((currentAccumulatedGcd, nextElementInSeries) => {
        // Type III: Add validation for each element within the array during reduction.
        if (typeof nextElementInSeries !== 'number' || isNaN(nextElementInSeries)) {
            console.warn(`Warning: Non-numeric value '${nextElementInSeries}' encountered. This element will be treated as 0 for GCD calculation, which might affect the outcome.`);
            // Treating non-numbers as 0 is one strategy; another is to skip or throw an error.
            return computeGreatestCommonDivisor(currentAccumulatedGcd, 0);
        }
        return computeGreatestCommonDivisor(currentAccumulatedGcd, nextElementInSeries);
    });

    return finalCalculatedDivisor;
};

/**
 * Orchestrates the primary logic: reads input, parses data, performs calculations,
 * and outputs a final "POSSIBLE" or "IMPOSSIBLE" determination.
 *
 * @param {string} rawInputContent - The complete raw string input, typically from stdin.
 */
const processInputAndDisplayResult = (rawInputContent) => {
    // Type III: Initial guard clause for empty or invalid input content.
    if (typeof rawInputContent !== 'string' || rawInputContent.trim().length === 0) {
        console.log(IMPOSSIBLE_OUTCOME_STRING);
        return;
    }

    // Trim whitespace and split the input string into individual lines.
    const inputLines = rawInputContent.trim().split("\n");

    // Type III: Validate that there are at least two lines of input as expected.
    if (inputLines.length < 2) {
        console.log(IMPOSSIBLE_OUTCOME_STRING);
        return;
    }

    // Process the first line which contains two space-separated integers.
    const firstLineDataTokens = inputLines[0].split(" ").filter(token => token.length > 0); // Filter out potential empty strings from multiple spaces.

    // Type III: Validate that the first line contains exactly two tokens.
    if (firstLineDataTokens.length !== 2) {
        console.log(IMPOSSIBLE_OUTCOME_STRING);
        return;
    }

    // Parse numerical values from the first line. Using `Number()` is an alternative to `parseInt()`.
    const totalElementCount = Number(firstLineDataTokens[0]);
    const desiredTargetValue = Number(firstLineDataTokens[1]);

    // Type III: Validate parsed numerical values from the first line.
    if (isNaN(totalElementCount) || isNaN(desiredTargetValue) || totalElementCount <= 0) { // totalElementCount must be positive.
        console.log(IMPOSSIBLE_OUTCOME_STRING);
        return;
    }

    // Process the second line which contains a series of space-separated integers.
    const numberStringsForArray = inputLines[1].split(" ").filter(str => str.length > 0);

    // Type III: Validate that the number of elements in the array matches `totalElementCount`.
    if (numberStringsForArray.length !== totalElementCount) {
        console.log(IMPOSSIBLE_OUTCOME_STRING);
        return;
    }

    // Type III: Populate the numeric array using a traditional loop instead of `map` for variety.
    const parsedNumericArray = [];
    let currentMaximumElement = -Infinity; // Initialize with negative infinity for finding max.
    for (let currentIdx = 0; currentIdx < numberStringsForArray.length; currentIdx++) {
        const valueAsNumber = Number(numberStringsForArray[currentIdx]);
        // Type III: Validate each individual number in the array.
        if (isNaN(valueAsNumber)) {
            console.log(IMPOSSIBLE_OUTCOME_STRING);
            return;
        }
        parsedNumericArray.push(valueAsNumber);
        // Keep track of the maximum element during parsing (Type III addition/update).
        if (valueAsNumber > currentMaximumElement) {
            currentMaximumElement = valueAsNumber;
        }
    }

    // (Original code sorted to get max, here we found max during parsing, but we still need the sorted array for consistency if we wanted to replicate the original `A[0]` logic exactly,
    // or we could use `Math.max(...parsedNumericArray)` if `currentMaximumElement` wasn't tracked. For Type III, tracking it during loop is a valid alternative.)
    // Let's stick to the original logic of getting the max after sorting the array.
    // Sort the array in descending order to easily access the maximum value at index 0.
    parsedNumericArray.sort((valX, valY) => valY - valX);
    currentMaximumElement = parsedNumericArray[0]; // Re-assign based on sorted array for clarity if needed, or simply use `currentMaximumElement`.

    // Calculate the GCD of all numbers in the processed array.
    const finalArrayGcd = deriveOverallCommonDivisor(parsedNumericArray);

    // Core logic check 1: If the desired target value is greater than the largest element in the array,
    // it is impossible to form the target (assuming positive values and operations).
    if (desiredTargetValue > currentMaximumElement) { // Rephrased from `max < K` to `K > max`.
        console.log(IMPOSSIBLE_OUTCOME_STRING);
        return;
    }

    // Core logic check 2: Determine if the target value is a perfect multiple of the array's GCD.
    // If it's not, then the target cannot be formed using linear combinations of the array elements.
    const isTargetDivisibleByArrayGcd = (desiredTargetValue % finalArrayGcd === 0);

    // Output the final determination.
    if (isTargetDivisibleByArrayGcd) {
        console.log(POSSIBLE_OUTCOME_STRING);
    } else {
        console.log(IMPOSSIBLE_OUTCOME_STRING);
    }
};

// Entry point for the application. Reads input from standard input and delegates to the main processing function.
// Type III: Encapsulate file system operations in a try-catch block for robust error handling.
try {
    const fileSystemHandler = require('fs');
    const systemInputData = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');
    processInputAndDisplayResult(systemInputData);
} catch (fileReadError) {
    // If there's an issue reading the file, log the error and output the 'IMPOSSIBLE' outcome.
    console.error("An error occurred while attempting to read from standard input:", fileReadError.message);
    console.log(IMPOSSIBLE_OUTCOME_STRING); // Fallback output for critical errors.
}