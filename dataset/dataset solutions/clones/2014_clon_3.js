"use strict";

/**
 * Expert function to compute all positive integer divisors of a given number,
 * including 1 and the number itself, in ascending order.
 * It handles special cases for 0, 1, and non-positive inputs to maintain
 * functional similarity with the original code's implicit behaviors.
 *
 * @param {number} targetNum The integer for which to find divisors.
 * @returns {number[]} An array of sorted unique divisors.
 */
function calculateAllDivisors(targetNum) {
    // Input validation: ensure integer type.
    if (!Number.isInteger(targetNum)) {
        // According to the problem context, inputs are typically integers.
        // Non-integer inputs technically don't have standard integer divisors.
        return [];
    }

    // Special handling for 0 to explicitly match the original code's behavior,
    // which returned [1, 0] for arrayOfDivisors(0).
    if (targetNum === 0) {
        return [1, 0];
    }

    // For negative numbers, return an empty array as positive divisors are usually sought.
    if (targetNum < 0) {
        return [];
    }

    // Handle the special case for 1, which has only one divisor: 1 itself.
    if (targetNum === 1) {
        return [1];
    }

    // Utilizing a Set ensures that each divisor is stored only once,
    // which is useful when handling perfect squares where sqrt(n) would be added twice.
    const uniqueFactors = new Set();
    uniqueFactors.add(1); // 1 is always a divisor for positive integers.
    uniqueFactors.add(targetNum); // The number itself is always a divisor.

    // Optimize the search for divisors by iterating only up to the square root of the number.
    const sqrtLimit = Math.floor(Math.sqrt(targetNum));

    // Iterate from 2 up to the square root.
    for (let candidateFactor = 2; candidateFactor <= sqrtLimit; candidateFactor++) {
        // If candidateFactor divides targetNum, then both candidateFactor and targetNum / candidateFactor are divisors.
        if (targetNum % candidateFactor === 0) {
            uniqueFactors.add(candidateFactor);
            uniqueFactors.add(targetNum / candidateFactor);
        }
    }

    // Convert the Set to an Array and sort numerically to ensure consistent output order.
    const orderedFactors = Array.from(uniqueFactors).sort((a, b) => a - b);

    return orderedFactors;
}

/**
 * Main execution block encapsulated in an immediately invoked function expression (IIFE).
 * This function processes the input data and computes a final sum based on divisor properties.
 *
 * @param {string} rawInputString The raw string input from standard input.
 */
(function processInputData(rawInputString) {
    // Robust input validation: check for string type and non-empty content.
    if (typeof rawInputString !== 'string' || rawInputString.trim().length === 0) {
        console.error("Input processing error: Provided data is not a valid non-empty string.");
        return; // Exit if input is invalid.
    }

    // Parse the primary number from the trimmed input string.
    const primaryInteger = parseInt(rawInputString.trim(), 10);

    // Further input validation: ensure the parsed value is a positive integer.
    if (isNaN(primaryInteger) || primaryInteger <= 0 || !Number.isInteger(primaryInteger)) {
        console.error(`Input processing error: '${rawInputString.trim()}' is not a valid positive integer.`);
        return;
    }

    /**
     * Helper function to efficiently check if a specific factor is present in a list of numbers.
     * Uses a Set for O(1) average time complexity lookup, which is beneficial for potentially large lists.
     *
     * @param {number[]} factorList An array of numbers (divisors).
     * @param {number} targetFactor The factor to search for.
     * @returns {boolean} True if the targetFactor is in the list, false otherwise.
     */
    const isFactorPresent = (factorList, targetFactor) => {
        const lookupSet = new Set(factorList); // Convert to Set for quick lookups.
        return lookupSet.has(targetFactor);
    };

    // --- Calculation for the predecessor value (n-1) ---
    const predecessorValue = primaryInteger - 1;
    const predecessorDivisorList = calculateAllDivisors(predecessorValue);

    // The original logic calculated `length - 1`.
    // For example, if predecessorValue is 12, divisors are [1,2,3,4,6,12]. length is 6. length-1 is 5 (counts 1,2,3,4,6).
    // If predecessorValue is 1, divisors are [1]. length is 1. length-1 is 0.
    // If predecessorValue is 0, divisors are [1,0]. length is 2. length-1 is 1.
    let countForPredecessor = predecessorDivisorList.length - 1;

    // Ensure the count is not negative in cases where calculateAllDivisors returns an empty array (e.g., for negative inputs).
    if (countForPredecessor < 0) {
        countForPredecessor = 0;
    }

    let specialMatchCounter = 0; // Counter for the second set of conditions.

    // Retrieve all divisors of the primary integer.
    const allPrimaryDivisors = calculateAllDivisors(primaryInteger);

    // Iterate through the divisors of the primary integer, skipping the first one (which is always 1).
    // The original code used `divOfN.shift()`, achieving the same effect.
    for (let i = 1; i < allPrimaryDivisors.length; i++) {
        const currentTestedDivisor = allPrimaryDivisors[i];
        let reducedWorkingValue = primaryInteger;

        // Repeatedly divide `reducedWorkingValue` by `currentTestedDivisor`
        // until it is no longer divisible. This effectively removes all factors
        // of `currentTestedDivisor` from `reducedWorkingValue`.
        // The loop continues as long as `reducedWorkingValue` is positive and divisible.
        while (reducedWorkingValue > 0 && reducedWorkingValue % currentTestedDivisor === 0) {
            reducedWorkingValue /= currentTestedDivisor;
        }

        // Apply the first condition: if `reducedWorkingValue` became 1,
        // it implies `primaryInteger` was a pure power of `currentTestedDivisor`.
        if (reducedWorkingValue === 1) {
            specialMatchCounter++;
        } else {
            // Apply the second condition: if `currentTestedDivisor` is a divisor of (`reducedWorkingValue` - 1).
            const targetForCheck = reducedWorkingValue - 1;
            // The `calculateAllDivisors` function is robust for `0` and negative values.
            const divisorsOfTargetForCheck = calculateAllDivisors(targetForCheck);

            if (isFactorPresent(divisorsOfTargetForCheck, currentTestedDivisor)) {
                specialMatchCounter++;
            }
        }
    }

    // Output the final computed sum.
    console.log(countForPredecessor + specialMatchCounter);

})((function retrieveStandardInput() {
    // This helper function abstracts the process of reading standard input,
    // making the main logic cleaner and allowing for potential environment adaptations.
    try {
        // Attempt to use Node.js's 'fs' module for synchronous file reading from stdin.
        // This is the most common setup for competitive programming in Node.js.
        if (typeof require === 'function' && require.resolve && require.resolve('fs')) {
            const fileSystem = require('fs');
            return fileSystem.readFileSync('/dev/stdin', 'utf8');
        }
        // Add more environment-specific input methods here if necessary (e.g., Deno).
        // For this clone, sticking to the original Node.js method is sufficient.
        
        // Fallback for environments where `require` is not available or 'fs' cannot be resolved.
        console.warn("Warning: Standard input reading via Node.js 'fs' module failed or is unavailable. Returning empty string.");
        return '';
    } catch (e) {
        console.error("Error encountered while attempting to read standard input:", e.message);
        return ''; // Return an empty string on error to prevent further crashes.
    }
})());