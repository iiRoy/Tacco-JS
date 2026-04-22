'use strict';

/**
 * Executes the primary computational task based on the provided input string.
 * This function solves a dynamic programming problem involving counting subsets.
 * @param {string} rawInputString - The raw input data as a string.
 */
function processComputationalTask(rawInputString) {
    // Define the prime modulus for all arithmetic operations.
    // This constant is crucial for preventing integer overflow and
    // ensuring calculations are performed in a finite field.
    const MOD_CONSTANT = 998244353;

    // --- Helper functions for modular arithmetic ---
    // These functions ensure that all intermediate results remain within the valid
    // range [0, MOD_CONSTANT - 1] and handle potential negative outcomes from subtraction.

    /**
     * Safely adds two numbers and applies the modulus.
     * @param {number} termA - The first operand.
     * @param {number} termB - The second operand.
     * @param {number} modulus - The modulus value.
     * @returns {number} The modular sum (termA + termB) % modulus.
     */
    const getModSum = (termA, termB, modulus) => (termA + termB) % modulus;

    /**
     * Safely subtracts one number from another and applies the modulus,
     * ensuring the result is non-negative.
     * @param {number} minuend - The number from which to subtract.
     * @param {number} subtrahend - The number to subtract.
     * @param {number} modulus - The modulus value.
     * @returns {number} The modular difference (minuend - subtrahend + modulus) % modulus.
     */
    const getModDifference = (minuend, subtrahend, modulus) => (minuend - subtrahend + modulus) % modulus;

    /**
     * Safely multiplies two numbers and applies the modulus.
     * @param {number} factorA - The first factor.
     * @param {number} factorB - The second factor.
     * @param {number} modulus - The modulus value.
     * @returns {number} The modular product (factorA * factorB) % modulus.
     */
    const getModProduct = (factorA, factorB, modulus) => (factorA * factorB) % modulus;

    /**
     * Calculates (base^exponent) % modulus efficiently using modular exponentiation.
     * @param {number} base - The base number.
     * @param {number} exponent - The exponent.
     * @param {number} modulus - The modulus value.
     * @returns {number} The result of (base^exponent) % modulus.
     */
    const calculateModPower = (base, exponent, modulus) => {
        let result = 1;
        base = base % modulus; // Ensure base is within modulus range
        while (exponent > 0) {
            if (exponent % 2 === 1) { // If exponent is odd, multiply result with base
                result = getModProduct(result, base, modulus);
            }
            base = getModProduct(base, base, modulus); // Square the base
            exponent = Math.floor(exponent / 2); // Halve the exponent
        }
        return result;
    };

    // --- Input Processing ---
    // Clean and parse the input string into an array of numbers.
    const parsedNumbers = rawInputString
        .trim() // Remove leading/trailing whitespace
        .split(/\s+/) // Split by one or more whitespace characters
        .map(str => parseInt(str, 10)); // Convert each string part to an integer

    // Extract the count of elements (N) from the beginning of the array.
    const elementCount = parsedNumbers.shift();

    // Basic validation for elementCount
    if (elementCount === undefined || isNaN(elementCount) || elementCount < 0) {
        console.error("Invalid element count provided.");
        return; // Exit or throw an error
    }
    if (elementCount === 0) { // Edge case: no elements to process
        console.log(1); // Typically, there's 1 way to choose an empty set (sum 0)
        return;
    }

    // Calculate the total sum of the remaining elements.
    const totalSumOfElements = parsedNumbers.reduce((acc, current) => acc + current, 0);

    // Determine the target sum limit for DP tables (half the total sum, floored).
    const targetHalfSum = Math.floor(totalSumOfElements / 2);

    // --- Dynamic Programming Table A (Type One) ---
    // This table `dpTableA_TypeOne[rowIdx][colSum]` stores the number of ways to achieve a sum `colSum`
    // using a subset of the first `rowIdx` elements from `parsedNumbers`.
    // Each element can be chosen twice (e.g., representing two distinct categories).
    // Initialize dpTableA with dimensions (elementCount + 1) x (targetHalfSum + 1), filled with zeros.
    const dpTableA_TypeOne = Array.from({ length: elementCount + 1 }, () =>
        Array.from({ length: targetHalfSum + 1 }, () => 0)
    );

    // Base case: There is one way to achieve a sum of 0 with no elements.
    dpTableA_TypeOne[0][0] = 1;

    // Populate dpTableA using nested loops.
    for (let currentIdx = 0; currentIdx < elementCount; currentIdx++) {
        const currentElementValue = parsedNumbers[currentIdx]; // Get the value of the current element

        for (let currentSum = 0; currentSum <= targetHalfSum; currentSum++) {
            // Option 1: Do not include the current element.
            // Add ways from the previous state (without current element) to the current state.
            dpTableA_TypeOne[currentIdx + 1][currentSum] = getModSum(
                dpTableA_TypeOne[currentIdx + 1][currentSum],
                dpTableA_TypeOne[currentIdx][currentSum],
                MOD_CONSTANT
            );

            // Option 2: Include the current element.
            // Check if adding the current element keeps the sum within the target limit.
            const nextSumWithElement = currentSum + currentElementValue;
            if (nextSumWithElement <= targetHalfSum) {
                // If included, multiply by 2 because there are two distinct ways to choose it.
                const waysToReachPrevSum = dpTableA_TypeOne[currentIdx][currentSum];
                const waysToAddCurrentElement = getModProduct(waysToReachPrevSum, 2, MOD_CONSTANT);

                dpTableA_TypeOne[currentIdx + 1][nextSumWithElement] = getModSum(
                    dpTableA_TypeOne[currentIdx + 1][nextSumWithElement],
                    waysToAddCurrentElement,
                    MOD_CONSTANT
                );
            }
        }
    }

    // --- Initial Calculation of Final Answer ---
    // Start with 3^N, which represents all possible combinations if each element
    // could be chosen in 3 distinct ways.
    let finalCalculatedAnswer = calculateModPower(3, elementCount, MOD_CONSTANT);

    // Subtract contributions from dpTableA.
    // Iterate through all possible sums up to `targetHalfSum` for all elements.
    for (let sumValue = 0; sumValue <= targetHalfSum; sumValue++) {
        const waysForSumValue = dpTableA_TypeOne[elementCount][sumValue];
        finalCalculatedAnswer = getModDifference(
            finalCalculatedAnswer,
            getModProduct(3, waysForSumValue, MOD_CONSTANT),
            MOD_CONSTANT
        );
    }

    // --- Dynamic Programming Table B (Type Two) ---
    // This table `dpTableB_TypeTwo[rowIdx][colSum]` stores the number of ways to achieve a sum `colSum`
    // using a subset of the first `rowIdx` elements from `parsedNumbers`.
    // Each element can be chosen only once.
    // Initialize dpTableB with dimensions (elementCount + 1) x (targetHalfSum + 1), filled with zeros.
    const dpTableB_TypeTwo = Array.from({ length: elementCount + 1 }, () =>
        Array.from({ length: targetHalfSum + 1 }, () => 0)
    );

    // Base case: There is one way to achieve a sum of 0 with no elements.
    dpTableB_TypeTwo[0][0] = 1;

    // Populate dpTableB using nested loops.
    for (let currentIdx = 0; currentIdx < elementCount; currentIdx++) {
        const currentElementValue = parsedNumbers[currentIdx];

        for (let currentSum = 0; currentSum <= targetHalfSum; currentSum++) {
            // Option 1: Do not include the current element.
            dpTableB_TypeTwo[currentIdx + 1][currentSum] = getModSum(
                dpTableB_TypeTwo[currentIdx + 1][currentSum],
                dpTableB_TypeTwo[currentIdx][currentSum],
                MOD_CONSTANT
            );

            // Option 2: Include the current element.
            const nextSumWithElement = currentSum + currentElementValue;
            if (nextSumWithElement <= targetHalfSum) {
                // If included, the number of ways is simply carried over (multiplied by 1).
                dpTableB_TypeTwo[currentIdx + 1][nextSumWithElement] = getModSum(
                    dpTableB_TypeTwo[currentIdx + 1][nextSumWithElement],
                    dpTableB_TypeTwo[currentIdx][currentSum], // No multiplication by 2 here
                    MOD_CONSTANT
                );
            }
        }
    }

    // --- Final Adjustment to the Answer ---
    // If the total sum of elements is even, there's a specific adjustment.
    // This accounts for cases where exactly half the total sum can be formed
    // by choosing elements in a particular way.
    const isTotalSumEven = (totalSumOfElements % 2 === 0);
    if (isTotalSumEven) {
        const waysToReachExactHalf = dpTableB_TypeTwo[elementCount][targetHalfSum];
        finalCalculatedAnswer = getModSum(
            finalCalculatedAnswer,
            getModProduct(3, waysToReachExactHalf, MOD_CONSTANT),
            MOD_CONSTANT
        );
    }

    // Ensure the final answer is positive and within the modulus range.
    // This step is a safeguard, as the modular arithmetic helpers should already ensure this.
    finalCalculatedAnswer = getModDifference(finalCalculatedAnswer, 0, MOD_CONSTANT);

    // Output the computed result.
    console.log(finalCalculatedAnswer);
}

// --- Execution Entry Point ---
// Reads input from standard input and passes it to the main processing function.
// This setup is typical for competitive programming environments.
try {
    const fileSystem = require('fs');
    const inputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');
    processComputationalTask(inputContent);
} catch (error) {
    // A basic error handling mechanism for file reading or processing.
    console.error("An error occurred during input processing:", error.message);
}