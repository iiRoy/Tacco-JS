"use strict";

/**
 * The primary execution function for the program.
 * It processes input, performs calculations, and outputs results.
 * @param {string} inputString - The raw input string from stdin.
 */
const executeProgram = (inputString) => {
    // Initialize a variable to accumulate results from nested loops.
    var totalSum = 0;

    // Process the raw input string: trim whitespace and split into lines.
    const processedLines = inputString.trim().split("\n");

    // Parse the first line to extract two integer values.
    // The first number (N) determines the exponentiation loop count.
    const firstNum = parseInt(processedLines[0].split(" ")[0]);
    // The second number (K) is the base for exponentiation.
    const secondNum = parseInt(processedLines[0].split(" ")[1]);

    // Initialize a variable for the first major calculation.
    var resultValue = secondNum;

    // Perform exponentiation: K raised to the power of (N+1).
    // The loop runs N times, effectively multiplying by K N times,
    // starting with K itself, so it's K^(N+1).
    for (var loopCounter = 1; loopCounter <= firstNum; loopCounter++) {
        resultValue *= secondNum;
    }

    // Output the result of the first calculation.
    console.log(resultValue);

    // --- Start of the triple-nested loop for GCD calculations ---
    // These loops iterate from 1 up to the calculated 'resultValue'.
    for (var outerLoopVar = 1; outerLoopVar <= resultValue; outerLoopVar++) {
        for (var middleLoopVar = 1; middleLoopVar <= resultValue; middleLoopVar++) {
            for (var innerLoopVar = 1; innerLoopVar <= resultValue; innerLoopVar++) {
                // For each combination of (i, j, k), calculate their greatest common divisor
                // and add it to the running totalSum.
                totalSum += calculateGCD(outerLoopVar, middleLoopVar, innerLoopVar);
            }
        }
    }
    // --- End of the triple-nested loop ---

    // Output the final accumulated sum, divided by a large prime number.
    // Note: The divisor 10000000007 is a prime number often used in competitive programming
    // for modulo operations, though here it's used for division.
    console.log(totalSum / 10000000007);
};

/**
 * Calculates the Greatest Common Divisor (GCD) of an arbitrary number of integers.
 * It uses the Euclidean algorithm recursively.
 * @returns {number} The GCD of all provided arguments.
 */
function calculateGCD() {
    // Helper function implementing the Euclidean algorithm for two numbers.
    // (a, b) => b ? f(b, a % b) : a
    // If b is not zero, recursively call with (b, a % b).
    // If b is zero, a is the GCD.
    var findCommonDivisor = (valA, valB) => valB ? findCommonDivisor(valB, valA % valB) : valA;

    // Initialize the current GCD with the first argument.
    var currentDivisor = arguments[0];

    // Iterate through the rest of the arguments, updating the GCD.
    for (var argIndex = 1; argIndex < arguments.length; argIndex++) {
        currentDivisor = findCommonDivisor(currentDivisor, arguments[argIndex]);
    }

    // Return the final GCD.
    return currentDivisor;
}

// Execute the main program function by reading input from standard input.
executeProgram(require('fs').readFileSync('/dev/stdin', 'utf8'));
