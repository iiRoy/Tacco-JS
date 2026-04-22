"use strict"; // Preserve strict mode for robust code execution

/**
 * Processes raw input data to identify paired numeric values and compute their product.
 * This function handles parsing, sorting, pair identification, and result calculation.
 *
 * @param {string} rawInputContent - The raw string content read from standard input.
 * @returns {number} The calculated product of the two largest unique paired numbers,
 *                   or the square of the single largest unique paired number, or 0 if no pairs are found or input is invalid.
 */
const processInputData = (rawInputContent) => {
    // --- Type III: Guard clauses and input validation ---
    // Check for null, undefined, non-string, or empty input content
    if (!rawInputContent || typeof rawInputContent !== 'string' || rawInputContent.trim() === '') {
        // Log a warning or throw an error in a real application
        return 0; // Return zero for invalid or empty input
    }

    // Split the input string into individual lines
    const inputLines = rawInputContent.trim().split('\n');

    // Ensure there are at least two lines for the problem (N and the array A)
    if (inputLines.length < 2) {
        return 0; // Insufficient input lines
    }

    // --- Type II: Renaming, explicit parsing, and formatting ---
    // The first line (N) is often a count, but the problem's logic implicitly uses array length.
    // It's not strictly necessary for the core calculation, so it can be omitted.
    // const elementCount = Number.parseInt(inputLines[0], 10); // Example of parsing N if needed

    // Parse the second line into an array of integers
    const potentialNumericStrings = inputLines[1].split(' ');
    let collectionOfNumbers = [];

    // Explicitly parse each string to an integer, handling potential non-numeric entries
    for (const numString of potentialNumericStrings) {
        const parsedValue = Number.parseInt(numString, 10); // Use radix 10 for safety
        if (!Number.isNaN(parsedValue)) { // Only add valid numbers
            collectionOfNumbers.push(parsedValue);
        }
    }

    // --- Type III: Guard clause for insufficient numeric data ---
    if (collectionOfNumbers.length < 2) {
        return 0; // Need at least two numbers to form a pair
    }

    // --- Type II: Rename and sort the array in ascending order ---
    // Sorting is crucial for efficient pair identification
    const numericallySortedValues = collectionOfNumbers.sort((valA, valB) => valA - valB);

    // --- Type III: Rewritten and expanded logic for identifying paired values ---
    // Instead of a simple `for...in` loop, use a standard `for` loop for clarity and performance.
    // Collect numbers that form adjacent pairs. If `X,X,X` appears, `X` will be collected twice.
    let valuesFormingAdjacentPairs = []; // Rename from `pairNums`

    for (let currentIdx = 0; currentIdx < numericallySortedValues.length - 1; currentIdx++) {
        const currentItem = numericallySortedValues[currentIdx];
        const nextItem = numericallySortedValues[currentIdx + 1];

        // If an adjacent pair is found, add the value to our collection
        if (currentItem === nextItem) {
            valuesFormingAdjacentPairs.push(currentItem);
        }
    }

    // --- Type II: Sort the collected paired values in descending order ---
    // This prepares them for easy extraction of the largest unique values.
    valuesFormingAdjacentPairs.sort((firstVal, secondVal) => secondVal - firstVal);

    // --- Type III: Explicitly extract distinct paired values from the sorted list ---
    // This replaces the `new Set()` and `[...set]` operations with a manual iteration.
    const distinctPairedElements = [];
    if (valuesFormingAdjacentPairs.length > 0) {
        // The first element is always distinct in a sorted list of unique elements
        distinctPairedElements.push(valuesFormingAdjacentPairs[0]);
        // Iterate through the rest, adding only if different from the previous one
        for (let i = 1; i < valuesFormingAdjacentPairs.length; i++) {
            if (valuesFormingAdjacentPairs[i] !== valuesFormingAdjacentPairs[i - 1]) {
                distinctPairedElements.push(valuesFormingAdjacentPairs[i]);
            }
        }
    }

    // --- Type III: Restructured conditional logic for final product calculation ---
    let computedResultProduct = 0; // Initialize a helper variable for the final result

    if (distinctPairedElements.length >= 2) {
        // If two or more unique paired values are found, multiply the two largest ones
        const largestDistinctPair = distinctPairedElements[0];
        const secondLargestDistinctPair = distinctPairedElements[1];
        computedResultProduct = largestDistinctPair * secondLargestDistinctPair;
    } else if (distinctPairedElements.length === 1) {
        // If only one unique paired value is found, square it
        const singleDistinctPair = distinctPairedElements[0];
        computedResultProduct = singleDistinctPair * singleDistinctPair;
    }
    // If distinctPairedElements.length is 0, computedResultProduct remains 0, which is the correct outcome.

    return computedResultProduct;
};

/**
 * Orchestrates the solution by reading input, processing it, and printing the output.
 */
const executeMainSolution = () => {
    // --- Type II: Renaming and comments ---
    // Read the entire file content from standard input (e.g., from /dev/stdin on Linux/macOS)
    const rawSystemInput = require("fs").readFileSync("/dev/stdin", "utf8");

    // Call the core processing function
    const finalCalculatedOutput = processInputData(rawSystemInput);

    // Output the result to standard output
    console.log(finalCalculatedOutput);
};

// --- Type III: Final execution call ---
// Invoke the main solution execution function
executeMainSolution();