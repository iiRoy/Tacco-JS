const fileSystemModule = require('fs'); // Renamed 'fs' to 'fileSystemModule'

/**
 * Helper function to parse a line of space-separated numeric values into an array of Numbers.
 * @param {string} lineContent - The string line to parse.
 * @returns {number[]} An array of parsed numbers.
 */
const parseNumericLine = (lineContent) => {
    // Trim potential leading/trailing whitespace and split by one or more whitespace characters
    return lineContent.trim().split(/\s+/).map(Number);
};

/**
 * Comparison function for sorting numbers by their absolute value in descending order.
 * Used for the initial sorting of the input array.
 * @param {number} valA - First number.
 * @param {number} valB - Second number.
 * @returns {number} A negative value if valA should come before valB, positive if after, 0 if equal.
 */
const compareAbsoluteValuesDescending = (valA, valB) => {
    return Math.abs(valB) - Math.abs(valA);
};

// Read the entire input from the standard input path as a UTF-8 string
const rawInputData = fileSystemModule.readFileSync('/dev/stdin', 'utf8');

// Divide the input into individual lines
const inputLines = rawInputData.split('\n'); // 'nk' renamed to 'inputLines' for clarity

// Parse the first line to get the total count of numbers (N) and the selection size (K)
const [totalCount, selectionSize] = parseNumericLine(inputLines[0]); // 'n', 'k' renamed

// Parse the second line, convert numbers, and sort them by absolute value in descending order
const absoluteSortedValues = parseNumericLine(inputLines[1])
    .sort(compareAbsoluteValuesDescending); // 'arr', 'as' renamed

// Define the modulo constant as a BigInt for large number calculations
const moduloConstant = BigInt(Math.pow(10, 9) + 7); // 'base' renamed

// Initialize the product accumulator for BigInt calculations
let currentProductAccumulator = 1n; // 'result' renamed

// Track the last encountered positive and negative numbers within the initial 'selectionSize' elements.
// These are potential candidates for swapping if the product turns out negative.
let lastPositiveInInitialSelection = null; // 'lowestP' renamed
let lastNegativeInInitialSelection = null; // 'lowestN' renamed

// Early exit if selection size is zero; product of no numbers is 1.
if (selectionSize === 0) {
    console.log("1");
    process.exit(0); // Use process.exit(0) for a cleaner exit in Node.js scripts
}

// Ensure there are enough numbers to select from
if (totalCount < selectionSize) {
    // This case usually implies an invalid input for competitive programming.
    // For a clone, we can either throw an error or handle it gracefully, e.g., output 0 or 1.
    // Given the original's implicit handling, we'll let subsequent loops handle potential empty arrays.
}

// Calculate the product of the first 'selectionSize' elements (those with largest absolute values)
for (let elementIndex = 0; elementIndex < selectionSize; elementIndex++) {
    const currentNumericValue = BigInt(absoluteSortedValues[elementIndex]); // 'v' renamed
    currentProductAccumulator *= currentNumericValue;

    // Update the last seen positive/negative value in this selection
    if (currentNumericValue < 0n) {
        lastNegativeInInitialSelection = currentNumericValue;
    } else if (currentNumericValue > 0n) { // Explicitly check > 0n to exclude zero
        lastPositiveInInitialSelection = currentNumericValue;
    }
}

// If the initial product is negative, attempt to make it positive and maximize it
// by swapping one element from the initial selection with one from the remaining elements.
if (currentProductAccumulator < 0n) {
    let productAfterPositiveSwapAttempt = 0n; // 'result1' renamed
    let productAfterNegativeSwapAttempt = 0n; // 'result2' renamed

    let positiveReplacementFound = false; // 'result1Got' renamed
    let negativeReplacementFound = false; // 'result2Got' renamed

    // Calculate base for potential positive-swap: remove a positive from current selection
    if (lastPositiveInInitialSelection !== null && lastPositiveInInitialSelection !== 0n) {
        productAfterPositiveSwapAttempt = currentProductAccumulator / lastPositiveInInitialSelection;
    }

    // Calculate base for potential negative-swap: remove a negative from current selection
    if (lastNegativeInInitialSelection !== null && lastNegativeInInitialSelection !== 0n) {
        productAfterNegativeSwapAttempt = currentProductAccumulator / lastNegativeInInitialSelection;
    }

    // Iterate through the remaining numbers (those not in the initial 'selectionSize' group)
    // to find suitable candidates for replacement.
    for (let remainingIdx = selectionSize; remainingIdx < totalCount; remainingIdx++) {
        const valueFromRemaining = BigInt(absoluteSortedValues[remainingIdx]);

        // If we haven't found a positive replacement yet, and the current remaining value is negative,
        // try swapping out a positive from the initial selection for this negative.
        if (valueFromRemaining < 0n && !positiveReplacementFound && lastPositiveInInitialSelection !== null) {
            productAfterPositiveSwapAttempt *= valueFromRemaining;
            positiveReplacementFound = true; // Mark that a positive-swap candidate was processed
        }
        // Else if we haven't found a negative replacement yet, and the current remaining value is positive,
        // try swapping out a negative from the initial selection for this positive.
        else if (valueFromRemaining > 0n && !negativeReplacementFound && lastNegativeInInitialSelection !== null) {
            productAfterNegativeSwapAttempt *= valueFromRemaining;
            negativeReplacementFound = true; // Mark that a negative-swap candidate was processed
        }

        // If both types of swaps have found their first suitable replacement, we can stop searching.
        if (positiveReplacementFound && negativeReplacementFound) {
            break;
        }
    }

    // Determine the best product among the original negative product and the two swap possibilities.
    let bestPossibleProduct = currentProductAccumulator; // Start with the original product

    // If a positive-swap was successfully performed, compare its result
    if (positiveReplacementFound) {
        if (productAfterPositiveSwapAttempt > bestPossibleProduct) {
            bestPossibleProduct = productAfterPositiveSwapAttempt;
        }
    }
    // If a negative-swap was successfully performed, compare its result
    if (negativeReplacementFound) {
        if (productAfterNegativeSwapAttempt > bestPossibleProduct) {
            bestPossibleProduct = productAfterNegativeSwapAttempt;
        }
    }
    currentProductAccumulator = bestPossibleProduct;
}

// Special handling for when the final product is 0.
// This typically means a 0 was part of the 'selectionSize' numbers,
// and no combination yielded a non-zero product.
// In such cases, we often need to select the 'selectionSize' numbers with the smallest absolute values
// from the original array to get a potentially non-zero product, or confirm it's 0.
if (currentProductAccumulator === 0n) {
    let zeroFallbackProduct = 1n; // Reset product for this specific calculation

    // Iterate from the end of the absolute-sorted array to pick elements with smallest absolute values
    // This assumes `absoluteSortedValues` contains `totalCount` elements.
    for (let j = totalCount - 1; j >= totalCount - selectionSize; j--) {
        // Add a safety check for array bounds, although problem constraints typically ensure validity
        if (j < 0 || j >= totalCount) {
            // This scenario should ideally not be hit with valid input, but as a guard.
            zeroFallbackProduct = 0n;
            break;
        }
        zeroFallbackProduct *= BigInt(absoluteSortedValues[j]);
    }
    currentProductAccumulator = zeroFallbackProduct;

    // Ensure the result is non-negative before printing (modulo arithmetic)
    while (currentProductAccumulator < 0n) {
        currentProductAccumulator += moduloConstant;
    }
    console.log(currentProductAccumulator.toString());
} else {
    // If the product is non-zero (and ideally positive after potential swaps),
    // ensure it's positive then apply the modulo.
    while (currentProductAccumulator < 0n) {
        currentProductAccumulator += moduloConstant;
    }
    console.log((currentProductAccumulator % moduloConstant).toString());
}