"use strict";

/**
 * Utility function to determine if a number is even.
 * @param {number} numericValue - The integer to check for evenness.
 * @returns {boolean} True if the number is even, false otherwise.
 */
const checkParity = (numericValue) => {
    return numericValue % 2 === 0;
};

/**
 * Safely reads the entire content from the standard input stream.
 * This function abstracts away the file system interaction.
 * @returns {string} The input data as a string, or an empty string if an error occurs.
 */
const obtainSystemInput = () => {
    try {
        const fileSystemModule = require("fs");
        return fileSystemModule.readFileSync("/dev/stdin", "utf8");
    } catch (readError) {
        // Log the error to stderr for diagnostic purposes.
        console.error("Input acquisition failed:", readError.message);
        // Return an empty string to allow subsequent parsing to fail gracefully.
        return "";
    }
};

/**
 * Core logic function to solve the problem of finding an equidistant integer.
 * It expects a string containing two space-separated integers.
 * The solution must be an integer 'P' such that:
 * 1. |firstNumber - P| == |secondNumber - P|
 * 2. 0 <= P < |firstNumber - secondNumber|
 * If no such 'P' exists, it outputs "IMPOSSIBLE".
 *
 * @param {string} rawInputString - The string read from the input source.
 */
const resolveEquidistantInteger = (rawInputString) => {
    // Normalize input: trim whitespace and split by any sequence of spaces.
    const numericalStrings = rawInputString.trim().split(/\s+/);

    // Early exit if the input format is incorrect (e.g., not exactly two numbers).
    if (numericalStrings.length !== 2) {
        console.log("IMPOSSIBLE");
        return;
    }

    // Parse the two numbers from their string representations.
    // Using radix 10 explicitly for robust parsing.
    const firstNumber = parseInt(numericalStrings[0], 10);
    const secondNumber = parseInt(numericalStrings[1], 10);

    // Validate that both parsed values are indeed numbers.
    if (isNaN(firstNumber) || isNaN(secondNumber)) {
        console.log("IMPOSSIBLE");
        return;
    }

    // Calculate the sum of the two numbers. This is a key intermediate step.
    const sumOfNumbers = firstNumber + secondNumber;

    // The equidistant point 'P' must satisfy 2P = firstNumber + secondNumber.
    // For 'P' to be an integer, the sumOfNumbers must be even.
    if (!checkParity(sumOfNumbers)) {
        console.log("IMPOSSIBLE");
        return; // No integer equidistant point if the sum is odd.
    }

    // Calculate the potential integer midpoint.
    const candidatePoint = sumOfNumbers / 2;

    // Determine the magnitude of the difference between the two original numbers.
    // This value defines the exclusive upper bound for the candidate point.
    const differenceMagnitude = Math.abs(firstNumber - secondNumber);

    // Apply the problem's specific constraints on the candidate point:
    // It must be non-negative AND strictly less than the absolute difference.
    if (candidatePoint >= 0 && candidatePoint < differenceMagnitude) {
        // If all conditions are satisfied, output the found integer.
        console.log(candidatePoint);
    } else {
        // If the candidate point does not meet the specified range,
        // or if it wasn't an integer (handled by parity check),
        // then no valid solution exists under the given rules.
        console.log("IMPOSSIBLE");
    }
};

// Execute the primary function by first acquiring input from the system.
resolveEquidistantInteger(obtainSystemInput());