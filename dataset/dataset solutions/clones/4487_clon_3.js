"use strict";

/**
 * Orchestrates the problem-solving process by parsing raw input,
 * analyzing numerical data, and computing a specific combinatorial sum.
 * This function handles input validation, data categorization, and
 * utilizes helper functions for core mathematical operations.
 *
 * @param {string} rawProblemString - The complete input string from stdin,
 *                                    expected to contain configuration on the first line
 *                                    and a sequence of numbers on the second.
 */
function ProcessInputData(rawProblemString) {
    // --- Stage 1: Input Parsing and Initial Validation ---
    const inputLines = rawProblemString.split("\n");

    // Ensure the input has the expected minimum number of lines
    if (inputLines.length < 2) {
        console.error("InputError: Insufficient data lines provided. Expected at least 2 lines.");
        return; // Terminate execution gracefully
    }

    // Parse the first line for configuration parameters
    const configurationTokens = inputLines[0].split(" ");
    if (configurationTokens.length < 2) {
        console.error("InputError: Configuration line malformed. Expected at least 2 numerical parameters.");
        return;
    }

    // Extract and validate the primary numerical parameters from the first line
    const declaredElementCount = parseInt(configurationTokens[0], 10); // Original 'num' - often metadata
    const requiredParityBit = parseInt(configurationTokens[1], 10);    // Original 'amari' - 0 for even, 1 for odd

    // Validate the required parity bit to ensure it's either 0 or 1
    if (isNaN(requiredParityBit) || (requiredParityBit !== 0 && requiredParityBit !== 1)) {
        console.error(`ValidationError: Required parity bit (${requiredParityBit}) must be 0 or 1.`);
        return;
    }

    // Parse the second line, which contains the sequence of numbers
    const rawNumberStrings = inputLines[1].split(" ");
    // Convert string numbers to integers, filtering out any invalid entries (NaN)
    const numericSequence = rawNumberStrings
        .map(str => parseInt(str, 10))
        .filter(val => !isNaN(val));

    // Optional Validation: Compare declared count with actual parsed count
    // The original problem's 'num' variable was unused. Here, we add a check for robustness.
    if (declaredElementCount !== numericSequence.length) {
        console.warn(`DataMismatchWarning: Declared element count (${declaredElementCount}) does not match
                      actual parsed count (${numericSequence.length}). Proceeding with actual count.`);
    }

    // --- Stage 2: Categorize Numbers by Parity ---
    let totalEvenNumbers = 0; // Renamed from 'even'
    let totalOddNumbers = 0;  // Renamed from 'odd'

    // Iterate through the validated numerical sequence to count evens and odds
    for (const currentNumber of numericSequence) { // Using for...of for a different iteration style
        if (currentNumber % 2 === 0) {
            totalEvenNumbers++;
        } else {
            totalOddNumbers++;
        }
    }

    // --- Stage 3: Define Helper Functions for Combinatorial Calculations ---

    /**
     * Computes the factorial of a non-negative integer.
     * Factorial of 0 is 1. Returns 1 for negative inputs with a warning.
     * @param {number} n - The integer for which to calculate the factorial.
     * @returns {number} The factorial value.
     */
    const computeFactorial = (n) => { // Renamed from 'fact', using const arrow function
        if (n < 0) {
            console.warn(`MathWarning: Factorial of negative number (${n}) requested. Returning 1 (conventionally undefined).`);
            return 1;
        }
        if (n === 0) {
            return 1; // Base case: 0! = 1
        }
        let factorialAccumulator = 1; // Renamed from 'ans'
        for (let counter = 1; counter <= n; counter++) { // Renamed 'i' to 'counter'
            factorialAccumulator *= counter;
        }
        return factorialAccumulator;
    };

    /**
     * Calculates the number of combinations (n choose k).
     * C(n, k) = n! / (k! * (n-k)!)
     * @param {number} totalItems - The total number of items (n).
     * @param {number} chosenItems - The number of items to choose (k).
     * @returns {number} The number of combinations. Returns 0 for invalid inputs (e.g., k > n or k < 0).
     */
    const calculateCombinations = (totalItems, chosenItems) => { // Renamed from 'combi', using const arrow function
        // Handle edge cases for combinations
        if (chosenItems < 0 || chosenItems > totalItems) {
            return 0; // Cannot choose a negative number of items or more items than available
        }
        if (chosenItems === 0 || chosenItems === totalItems) {
            return 1; // There's 1 way to choose 0 items or all items
        }
        // Optimization: C(n, k) = C(n, n-k) to reduce calculation size
        if (chosenItems > totalItems / 2) {
            chosenItems = totalItems - chosenItems;
        }

        // Compute factorials for the combination formula
        const numeratorFactorial = computeFactorial(totalItems);
        const denominatorFactorialK = computeFactorial(chosenItems);
        const denominatorFactorialNMinusK = computeFactorial(totalItems - chosenItems);

        // Prevent division by zero, though logic above should largely prevent this for valid inputs
        if (denominatorFactorialK === 0 || denominatorFactorialNMinusK === 0) {
            console.error("CalculationError: Denominator for combinations is zero. Check input values.");
            return 0;
        }

        // The original code used Math.round. Combinations are always integers.
        // This suggests potential floating-point inaccuracies if intermediate factorials are very large.
        // For typical competitive programming constraints, Math.round is often sufficient.
        return Math.round(numeratorFactorial / (denominatorFactorialK * denominatorFactorialNMinusK));
    };

    // --- Stage 4: Compute the Final Result ---

    // Calculate total subsets formed by even numbers.
    // Any subset of even numbers will sum to an even number. The number of such subsets is 2^N_even.
    const numberOfEvenGroupSubsets = Math.pow(2, totalEvenNumbers); // Renamed from 'evenCombi'

    let numberOfOddGroupSubsetsWithDesiredParity = 0; // Renamed from 'oddCombi'

    // Determine the starting point for iterating through odd counts based on required parity
    const loopInitialIndex = (requiredParityBit === 0) ? 0 : 1; // Start with even count (0,2,4..) or odd count (1,3,5..)
    const loopStepIncrement = 2; // Always increment by 2 to maintain the desired parity

    // Sum combinations of odd numbers, choosing 'k' items such that 'k' has the desired parity
    for (let currentChosenCount = loopInitialIndex;
         currentChosenCount <= totalOddNumbers;
         currentChosenCount += loopStepIncrement) {
        numberOfOddGroupSubsetsWithDesiredParity += calculateCombinations(totalOddNumbers, currentChosenCount);
    }

    // The final answer is the product of the number of subsets from even group
    // and the number of subsets from odd group that satisfy the parity condition.
    const finalComputedResult = numberOfEvenGroupSubsets * numberOfOddGroupSubsetsWithDesiredParity;

    // --- Stage 5: Output the Result ---
    console.log(finalComputedResult);
}

// Entry point for execution: Reads input from standard input and delegates to the main processing function.
// This part is typically environment-dependent and kept close to the original for execution compatibility.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));