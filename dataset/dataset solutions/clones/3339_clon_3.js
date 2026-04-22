'use strict';

// Defines a large prime modulus for calculations, renamed from 'mod'
const PRIME_MODULUS = 1000000007;

/**
 * Ensures a number is positive after modulo operation.
 * JavaScript's % operator can return negative results for negative dividends.
 * This helper function guarantees a positive result within the modulus range.
 *
 * @param {number} value - The number to apply modulo to.
 * @param {number} modulus - The modulus.
 * @returns {number} The positive result of value % modulus.
 */
function getPositiveModulo(value, modulus) {
    return (value % modulus + modulus) % modulus;
}

/**
 * Computes the number of distinct ways to achieve a specified target sum
 * using elements from a given set, where each element has a maximum allowed value.
 * This is a variation of the unbounded knapsack problem, solved using dynamic programming
 * with prefix sums for optimization.
 *
 * @param {number} itemCount - The total number of distinct items available (N).
 * @param {number} targetSum - The exact sum that needs to be achieved (K).
 * @param {number[]} itemLimits - An array where itemLimits[i] specifies the maximum
 *                                value that can be assigned to the i-th item (A).
 * @returns {number} The total count of ways to form the target sum,
 *                   modulo PRIME_MODULUS. Returns 0 if input is invalid.
 */
function calculateCombinations(itemCount, targetSum, itemLimits) {
    // Early exit: if the target sum is 0, there is always one way (by choosing no items).
    if (targetSum === 0) {
        return 1;
    }

    // Input validation: ensure parameters are valid before starting DP.
    if (itemCount <= 0 || targetSum < 0 || !Array.isArray(itemLimits) || itemLimits.length !== itemCount) {
        console.error("Error: Invalid input parameters provided to calculateCombinations. Check itemCount, targetSum, and itemLimits array structure.");
        return 0; // Return 0 for invalid inputs
    }

    // currentWaysRow acts as the DP array for the current item 'i'.
    // It stores ways to achieve each sum 'j' using items processed up to 'i'.
    let currentWaysRow = new Array(targetSum + 1).fill(0);

    // cumulativeSumsMatrix[i][j] stores the sum of currentWaysRow[0] through currentWaysRow[j]
    // for the i-th item. This 2D array is crucial for O(1) range sum queries.
    let cumulativeSumsMatrix = Array.from({ length: itemCount }, () =>
        new Array(targetSum + 1).fill(0)
    );

    // Iterate through each item, from the first (index 0) to the last.
    for (let currentElementIndex = 0; currentElementIndex < itemCount; currentElementIndex++) {
        const currentItemMaxVal = itemLimits[currentElementIndex]; // Cache current item's limit

        // Iterate through each possible sum value, from 0 up to the targetSum.
        for (let currentSumValue = 0; currentSumValue <= targetSum; currentSumValue++) {
            let waysForCurrentSum = 0; // Initialize ways for the current (item, sum) pair

            // Base case: If this is the very first item (index 0).
            if (currentElementIndex === 0) {
                // If the current sum value is less than or equal to the first item's limit,
                // there's 1 way (use the item to form that sum). Otherwise, 0 ways.
                waysForCurrentSum = (currentSumValue <= currentItemMaxVal) ? 1 : 0;
            } else {
                // Recursive step: For subsequent items, use cumulative sums from the previous item.
                // The number of ways to make `currentSumValue` using `currentElementIndex` item
                // is the sum of ways to make `k` using `currentElementIndex - 1` item,
                // where `currentSumValue - currentItemMaxVal <= k <= currentSumValue`.
                // This range sum is efficiently calculated using prefix sums:
                // cumulativeSumsMatrix[prev_idx][currentSumValue] - cumulativeSumsMatrix[prev_idx][currentSumValue - currentItemMaxVal - 1]

                const previousElementIndex = currentElementIndex - 1;
                let prevCumulativeSumAtJ = cumulativeSumsMatrix[previousElementIndex][currentSumValue];

                // Calculate the lower bound index for subtraction.
                // This corresponds to `j - A[i] - 1` in the original formula.
                const lowerBoundSumIndex = currentSumValue - currentItemMaxVal - 1;
                let waysToSubtractFromPrefix = 0;

                // Only subtract if the lower bound index is valid (non-negative).
                if (lowerBoundSumIndex >= 0) {
                    waysToSubtractFromPrefix = cumulativeSumsMatrix[previousElementIndex][lowerBoundSumIndex];
                }
                
                // Calculate ways for current sum, ensuring result is positive after modulo.
                waysForCurrentSum = getPositiveModulo(prevCumulativeSumAtJ - waysToSubtractFromPrefix, PRIME_MODULUS);
            }

            // Store the calculated ways for the current (item, sum) in the temporary row.
            currentWaysRow[currentSumValue] = waysForCurrentSum;

            // Calculate the cumulative sum for the current item up to the current sum value.
            if (currentSumValue > 0) {
                const prevCumulativeVal = cumulativeSumsMatrix[currentElementIndex][currentSumValue - 1];
                cumulativeSumsMatrix[currentElementIndex][currentSumValue] =
                    getPositiveModulo(prevCumulativeVal + waysForCurrentSum, PRIME_MODULUS);
            } else {
                // For sum 0, the cumulative sum is just the ways to make sum 0.
                cumulativeSumsMatrix[currentElementIndex][currentSumValue] = getPositiveModulo(waysForCurrentSum, PRIME_MODULUS);
            }
        }
    }
    
    // The final answer is the number of ways to achieve the targetSum using all items.
    // This value is stored in the last element of the temporary DP row after processing all items.
    return getPositiveModulo(currentWaysRow[targetSum], PRIME_MODULUS);
}

/**
 * Main function responsible for reading input, parsing it,
 * invoking the combination calculation, and displaying the final result.
 *
 * @param {string} rawInput - The raw input string read from stdin.
 */
function processInputAndCompute(rawInput) {
    // Trim whitespace and split the input into individual lines.
    const inputLines = rawInput.trim().split("\n");

    // Validate the number of input lines.
    if (inputLines.length < 2) {
        console.error("Input format error: Expected at least two lines for N, K and A array.");
        return;
    }

    // Parse the first line to get N (itemCount) and K (targetSum).
    const parsedDimensions = inputLines[0].split(' ').map(val => parseInt(val, 10));
    const itemCount = parsedDimensions[0];
    const targetSum = parsedDimensions[1];

    // Validate parsed N and K values.
    if (isNaN(itemCount) || isNaN(targetSum) || itemCount < 0 || targetSum < 0) {
        console.error("Input format error: N or K are not valid non-negative numbers.");
        return;
    }

    // Parse the second line to get the item limits array (A).
    const itemLimits = inputLines[1].split(' ').map(val => parseInt(val, 10));

    // Validate the itemLimits array.
    if (itemLimits.length !== itemCount) {
        console.error(`Input format error: Expected ${itemCount} item limits, but got ${itemLimits.length}.`);
        return;
    }
    for (const limit of itemLimits) {
        if (isNaN(limit) || limit < 0) {
            console.error("Input format error: All item limits must be non-negative integers.");
            return;
        }
    }

    // Call the core logic to calculate combinations.
    const finalResult = calculateCombinations(itemCount, targetSum, itemLimits);
    
    // Output the computed result to the console.
    console.log(finalResult);
}

// Read input from standard input and pass it to the main processing function.
processInputAndCompute(require('fs').readFileSync('/dev/stdin', 'utf8'));