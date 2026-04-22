'use strict';

/**
 * A utility function to safely parse a string of space-separated numeric values
 * into an array of numbers. Handles potential non-numeric inputs by converting them to NaN.
 *
 * @param {string} valueString - The input string containing space-separated numbers.
 * @returns {number[]} An array of parsed numbers. Returns an empty array if input is invalid.
 */
const parseNumericSequence = (valueString) => {
    // Robustness: check if the input is a valid string before proceeding.
    if (typeof valueString !== 'string' || valueString.trim() === '') {
        return [];
    }
    // Use unary plus operator for type conversion, which is concise.
    return valueString.split(' ').map(str => +str);
};

/**
 * Computes the Greatest Common Divisor (GCD) of two non-negative integers using
 * the iterative Euclidean algorithm. Includes explicit handling for zero and negative inputs.
 *
 * @param {number} firstOperand - The first integer.
 * @param {number} secondOperand - The second integer.
 * @returns {number} The greatest common divisor of the two operands.
 */
function computeGreatestCommonDivisor(firstOperand, secondOperand) {
    // Type III change: Ensure inputs are non-negative for standard GCD definition.
    // Taking absolute values ensures consistent behavior.
    let currentA = Math.abs(firstOperand);
    let currentB = Math.abs(secondOperand);

    // Edge cases for GCD:
    // GCD(a, 0) = |a|
    if (currentB === 0) {
        return currentA;
    }
    if (currentA === 0) {
        return currentB;
    }

    let temporaryRemainder; // Variable to hold the remainder during the Euclidean algorithm.

    // Type III change: The original code swapped if m < n. This is not strictly necessary
    // for the Euclidean algorithm's correctness, but it can make the first iteration
    // more predictable (larger % smaller). Let's keep it for clarity.
    if (currentA < currentB) {
        temporaryRemainder = currentA;
        currentA = currentB;
        currentB = temporaryRemainder;
    }

    // The core Euclidean algorithm: repeatedly replace (a, b) with (b, a % b) until b is 0.
    while ((temporaryRemainder = currentA % currentB) !== 0) {
        currentA = currentB;
        currentB = temporaryRemainder;
    }

    // The last non-zero value of currentB is the GCD.
    return currentB;
}

/**
 * The primary function responsible for orchestrating the input parsing,
 * difference calculation, and final GCD determination.
 *
 * @param {string} rawInputPayload - The entire raw string content read from the standard input.
 */
function processInputDataAnalysis(rawInputPayload) {
    // Type III change: Add robust input validation at the entry point.
    if (typeof rawInputPayload !== 'string' || rawInputPayload.trim() === '') {
        // In a competitive programming context, usually input is guaranteed valid,
        // but for Type III, adding robustness is a good modification.
        console.error("Error: No valid input payload provided.");
        return;
    }

    // Split the entire input string into an array of lines.
    const inputContentLines = rawInputPayload.split('\n');

    // Type III change: Guard clause for minimum expected lines.
    if (inputContentLines.length < 2) {
        console.error("Error: Input payload requires at least two lines.");
        return;
    }

    // Parse the first line to extract the total element count and the comparison value.
    const initialParameters = parseNumericSequence(inputContentLines[0]);

    // Type III change: Validate the parsed initial parameters.
    if (initialParameters.length < 2 || !Number.isInteger(initialParameters[0]) || !Number.isInteger(initialParameters[1])) {
        console.error("Error: First line contains invalid or insufficient numeric parameters.");
        return;
    }

    const totalElementsExpected = initialParameters[0]; // Corresponds to N in original code.
    const comparisonReferenceValue = initialParameters[1]; // Corresponds to X in original code.

    // Parse the second line to get the list of quantities.
    const sequenceOfQuantities = parseNumericSequence(inputContentLines[1]);

    // Type III change: Validate that the actual number of elements matches the declared count.
    if (sequenceOfQuantities.length !== totalElementsExpected) {
        console.error(`Error: Mismatch in expected element count. Declared: ${totalElementsExpected}, Found: ${sequenceOfQuantities.length}.`);
        // For Type III, we could either exit or try to proceed with available valid data.
        // Exiting is safer for correctness if input is strictly defined.
        return;
    }

    // Type III change: Use Array.prototype.map for a more functional approach
    // to calculate the absolute differences, replacing the explicit for-loop.
    const calculatedAbsoluteDifferences = sequenceOfQuantities.map(itemValue =>
        Math.abs(itemValue - comparisonReferenceValue)
    );

    // Type III change: Handle the case where the differences array might be empty
    // after processing (e.g., if totalElementsExpected was 0).
    if (calculatedAbsoluteDifferences.length === 0) {
        // Conventionally, GCD of an empty set is sometimes 0, or undefined.
        // Output 0 as a sensible default for this problem context.
        console.log(0);
        return;
    }

    let finalComputedResult;

    // Type III change: A major structural modification - replace the explicit
    // 'if-else' block and the subsequent 'for' loop for GCD calculation
    // with Array.prototype.reduce. This is more concise and idiomatic JavaScript.
    // The 'reduce' method inherently handles the single-element array case
    // (it returns the element itself as the final accumulator).
    finalComputedResult = calculatedAbsoluteDifferences.reduce((accumulatorGcd, currentValue) => {
        return computeGreatestCommonDivisor(accumulatorGcd, currentValue);
    });

    console.log(finalComputedResult);
}

// Standard boilerplate for reading input from stdin in competitive programming.
processInputDataAnalysis(require("fs").readFileSync("/dev/stdin", "utf8").trim());