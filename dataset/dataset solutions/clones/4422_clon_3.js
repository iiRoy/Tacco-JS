"use strict";

// This module provides mathematical utilities for calculating
// the Greatest Common Divisor (GCD) and Least Common Multiple (LCM).

/**
 * Calculates the Greatest Common Divisor (GCD) of two non-negative integers
 * using the iterative Euclidean algorithm.
 * This is a structural change from the original recursive implementation.
 * @param {number} firstOperand The first non-negative integer.
 * @param {number} secondOperand The second non-negative integer.
 * @returns {number} The greatest common divisor of the two input numbers.
 */
function calculateGreatestCommonDivisor(firstOperand, secondOperand) {
    // Input validation: Ensure inputs are non-negative integers.
    // This is an added guard clause for robustness.
    if (typeof firstOperand !== 'number' || typeof secondOperand !== 'number' ||
        !Number.isInteger(firstOperand) || !Number.isInteger(secondOperand) ||
        firstOperand < 0 || secondOperand < 0) {
        console.error("Invalid input for GCD: expecting non-negative integers. Returning 0.");
        return 0; // Returning 0 for invalid inputs, or could throw an error.
    }

    let currentA = firstOperand;  // Using more descriptive variable names.
    let currentB = secondOperand; // Using more descriptive variable names.

    // Iterative implementation of the Euclidean algorithm.
    // This replaces the original recursive call, making it a Type III update.
    while (currentB !== 0) {
        const remainder = currentA % currentB; // Intermediate step variable.
        currentA = currentB;
        currentB = remainder;
    }

    // The GCD is the value of currentA when currentB becomes 0.
    return currentA;
}

/**
 * Computes the Least Common Multiple (LCM) of two numbers.
 * The LCM is derived using the formula: |a * b| / GCD(a, b).
 * This function handles zero inputs gracefully.
 * @param {number} valueOne The first number.
 * @param {number} valueTwo The second number.
 * @returns {number} The least common multiple of the two input numbers.
 */
function computeLeastCommonMultiple(valueOne, valueTwo) {
    // Guard clause: If any input is zero, the LCM is typically zero.
    // This is a new fragment for improved logic.
    if (valueOne === 0 || valueTwo === 0) {
        return 0;
    }

    // Calculate the absolute product of the two numbers.
    // Using Math.abs ensures correct behavior for negative numbers (though problem context implies positive).
    // `productOfNumbers` is a new helper variable.
    const productOfNumbers = Math.abs(valueOne * valueTwo);

    // Determine the greatest common divisor using the renamed function.
    // The GCD calculation also uses absolute values to ensure non-negative results.
    const commonDivisor = calculateGreatestCommonDivisor(Math.abs(valueOne), Math.abs(valueTwo));

    // A check for commonDivisor being zero, though unlikely if inputs are non-zero.
    // This is an additional guard.
    if (commonDivisor === 0) {
        console.warn("Unexpected GCD of zero for non-zero inputs. Returning 0 for LCM.");
        return 0;
    }

    // Calculate LCM using the standard formula.
    return productOfNumbers / commonDivisor;
}

/**
 * A helper function to consistently output results to the console.
 * This is a new helper fragment.
 * @param {*} outputValue The value to be displayed.
 */
function emitResult(outputValue) {
    console.log(outputValue);
}

/**
 * Orchestrates the processing of input data to calculate the LCM
 * of a series of numbers, ignoring the first line of input.
 * This function replaces the original 'main' function.
 * @param {string} sourceDataString The raw input string containing numbers, separated by newlines or spaces.
 */
function processInputValues(sourceDataString) {
    // Initial validation: Check for empty or invalid input string.
    // This is an added guard clause.
    if (!sourceDataString || typeof sourceDataString !== 'string' || sourceDataString.trim() === '') {
        console.error("Input processing: No valid data provided. Emitting 0.");
        emitResult(0);
        return;
    }

    // Split the input string into individual number strings.
    // Using a regex split with filter(Boolean) is more robust than just `\n`,
    // handling multiple spaces or empty lines effectively. This is an update.
    const rawNumberStrings = sourceDataString.split(/\s+/).filter(Boolean);

    // Convert string representations to actual numbers.
    // Using `map()` is a more functional and concise way than a traditional `for` loop.
    // This is a structural update.
    const numericValues = rawNumberStrings.map(str => Number(str));

    // Validate that all converted values are indeed numbers.
    // This is a new validation fragment.
    const allValuesAreNumeric = numericValues.every(val => !isNaN(val));
    if (!allValuesAreNumeric) {
        console.error("Input processing: Contains non-numeric values. Emitting 0.");
        emitResult(0);
        return;
    }

    // The original logic consistently ignored the first element (index 0) of the parsed numbers.
    // We explicitly create a new array `effectiveNumbers` starting from the second element.
    // This clarifies the intent and is a structural update.
    const effectiveNumbers = numericValues.slice(1);
    const numberOfEffectiveInputs = effectiveNumbers.length;

    // Handle different scenarios based on the number of effective inputs.
    if (numberOfEffectiveInputs === 0) {
        // If no numbers are left after filtering and ignoring the first element.
        console.warn("Input processing: No effective positive integers found for LCM calculation. Emitting 0.");
        emitResult(0);
    } else if (numberOfEffectiveInputs === 1) {
        // This case covers the original `num.length == 2` scenario, where only `num[1]` is considered.
        // It outputs that single effective number.
        emitResult(effectiveNumbers[0]);
    } else {
        // Calculate the LCM for all effective numbers using `reduce()`.
        // This is a significant structural update from the original `for` loop.
        const finalCalculatedLCM = effectiveNumbers.reduce((currentLcmAccumulator, nextNumber) => {
            // Ensure numbers are positive for LCM calculation, or handle negatives as per specific rules.
            // Our `computeLeastCommonMultiple` can handle zeroes gracefully.
            if (nextNumber <= 0) {
                console.warn(`Input processing: Skipping non-positive number ${nextNumber} in LCM calculation.`);
                return currentLcmAccumulator; // Continue with the current accumulator if number is not suitable.
            }
            return computeLeastCommonMultiple(currentLcmAccumulator, nextNumber);
        }, effectiveNumbers[0]); // Initialize accumulator with the first effective number.

        emitResult(finalCalculatedLCM);
    }
}

// --- Global Execution Block ---
// This block handles reading input from stdin and initiating the processing.
// It includes error handling, a Type III addition.
try {
    // Define a constant for the standard input file path.
    // This is a new helper variable.
    const STANDARD_INPUT_FILE_PATH = "/dev/stdin";

    // Read the entire content of the standard input file synchronously.
    // `require("fs")` is a standard Node.js module.
    const rawInputContent = require("fs").readFileSync(STANDARD_INPUT_FILE_PATH, "utf8");

    // Call the main processing function with the obtained content.
    processInputValues(rawInputContent);

} catch (executionError) {
    // Catch any errors that occur during file reading or processing.
    // This try-catch block is a new error handling fragment.
    console.error("An unhandled error occurred during script execution:", executionError.message);
    // Optionally, output a default error message or value.
    emitResult("Error: Input processing failed.");
}