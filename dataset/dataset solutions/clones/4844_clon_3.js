"use strict";

// This module orchestrates the processing of input data and performs
// a specific value adjustment algorithm on a sequence of numbers.

/**
 * Parses the raw input string into a structured object containing
 * the problem's parameters and the initial data sequence.
 *
 * @param {string} rawPayload - The complete string read from standard input.
 * @returns {object} An object containing 'countOfElements', 'maximumSumLimit', and 'initialDataSequence'.
 * @throws {Error} If the input format is invalid or contains non-numeric values.
 */
const parseInputPayload = (rawPayload) => {
    // Standardize input by removing leading/trailing whitespace and splitting into individual lines.
    const inputLines = rawPayload.trim().split("\n");

    // Implement a basic validation to ensure sufficient lines are present for parsing.
    if (inputLines.length < 2) {
        throw new Error("Input must contain at least two lines: parameters and data sequence.");
    }

    // Process the first line to extract N (number of elements) and X (maximum allowed sum).
    const parameterTokens = inputLines[0].split(" ");

    // Ensure there are at least two parameters on the first line.
    if (parameterTokens.length < 2) {
        throw new Error("First line must specify N and X separated by a space.");
    }

    // Convert string tokens to integers, explicitly using radix 10 for safety.
    const totalElementsExpected = Number.parseInt(parameterTokens[0], 10);
    const sumUpperBoundary = Number.parseInt(parameterTokens[1], 10);

    // Validate that the parsed parameters are indeed numbers.
    if (isNaN(totalElementsExpected) || isNaN(sumUpperBoundary)) {
        throw new Error("Invalid numeric values encountered in the first line of input.");
    }

    // Enforce a positive count for elements, as a sequence must have at least one.
    if (totalElementsExpected < 1) {
        // For this specific problem, N-1 iterations are performed, so N=1 implies 0 iterations.
        // Let's allow N=1 but warn if it implies no operations.
        console.warn("Warning: Expected number of elements (N) is less than 1. No pairwise adjustments will occur.");
    }

    // Parse the second line to obtain the array of numeric values.
    const stringValueTokens = inputLines[1].split(" ");
    const parsedNumericSequence = stringValueTokens.map(token => {
        const numericValue = Number.parseInt(token, 10);
        if (isNaN(numericValue)) {
            throw new Error(`Non-numeric value detected in data sequence: '${token}'.`);
        }
        return numericValue;
    });

    // Provide a warning if the actual number of parsed elements doesn't match the declared N.
    // The algorithm will proceed using the actual length of the parsed array,
    // but N is still used for the iteration boundary as per original problem.
    if (parsedNumericSequence.length !== totalElementsExpected) {
        console.warn(`Discrepancy: Declared N is ${totalElementsExpected}, but actual data sequence contains ${parsedNumericSequence.length} elements.`);
    }

    // Return the collected and validated data in a structured format.
    return {
        countOfElements: totalElementsExpected,
        maximumSumLimit: sumUpperBoundary,
        initialDataSequence: parsedNumericSequence
    };
};

/**
 * Executes the core adjustment logic on the provided data sequence.
 * It iterates through adjacent pairs, reducing values if their sum exceeds a threshold.
 *
 * @param {object} processedDataPayload - Structured data from `parseInputPayload`.
 * @returns {number} The total cumulative reduction applied across all adjustments.
 */
const performSequenceAdjustment = (processedDataPayload) => {
    // Extract parameters from the input payload for direct use.
    const { countOfElements, maximumSumLimit, initialDataSequence } = processedDataPayload;

    // Create a mutable copy of the input array, as elements will be modified.
    const currentWorkingSequence = [...initialDataSequence];

    // Initialize a variable to accumulate the total amount reduced.
    let totalReductionAccumulator = 0;

    // Determine the upper bound for the loop. The original problem uses N-1 for the loop.
    // This means the loop iterates from 0 to N-2 (inclusive), accessing elements up to A[N-1].
    // We should use the actual array length if it's smaller than N.
    const effectiveLoopLimit = Math.min(countOfElements, currentWorkingSequence.length);

    // Guard clause: If there are fewer than 2 elements, no adjacent pairs exist for adjustment.
    if (effectiveLoopLimit < 2) {
        console.warn("Not enough elements in sequence for pairwise sum adjustments. Returning 0 reduction.");
        return 0;
    }

    // Iterate through the sequence, considering each element and its immediate successor.
    // The loop runs from the first element up to the second-to-last element.
    for (let currentIdx = 0; currentIdx < effectiveLoopLimit - 1; ++currentIdx) {
        // Fetch the two adjacent values for the current iteration.
        const firstValue = currentWorkingSequence[currentIdx];
        const secondValue = currentWorkingSequence[currentIdx + 1];

        // Calculate the sum of the current adjacent pair.
        const adjacentValuesCombinedSum = firstValue + secondValue;

        // Check if this sum exceeds the allowed maximum threshold.
        if (adjacentValuesCombinedSum > maximumSumLimit) {
            // Determine the excess amount that needs to be reduced from the sum.
            const excessAmount = adjacentValuesCombinedSum - maximumSumLimit;

            // Store the original second value before potential modification.
            const originalSecondValue = currentWorkingSequence[currentIdx + 1];

            // Calculate the new value for the second element.
            // It must be at least 0, even if reducing by 'excessAmount' would make it negative.
            const adjustedSecondValue = Math.max(0, originalSecondValue - excessAmount);

            // Update the second element in the working sequence with its new value.
            currentWorkingSequence[currentIdx + 1] = adjustedSecondValue;

            // Accumulate the full excess amount into the total reduction counter.
            // The problem implies 'cnt' tracks the full 'sum - X' even if the element caps at 0.
            totalReductionAccumulator += excessAmount;
        }
    }

    // After iterating through all pairs, return the accumulated total reduction.
    return totalReductionAccumulator;
};

/**
 * The primary entry point for the script. It reads input, processes it,
 * and prints the final result.
 *
 * @param {string} systemInputRaw - The raw input string, typically from stdin.
 */
const initiateScriptExecution = (systemInputRaw) => {
    try {
        // Step 1: Parse and validate the raw input data.
        const preparedData = parseInputPayload(systemInputRaw);

        // Step 2: Apply the core adjustment algorithm to the prepared data.
        const finalCalculatedReduction = performSequenceAdjustment(preparedData);

        // Step 3: Output the computed total reduction to standard output.
        console.log(finalCalculatedReduction);

    } catch (operationError) {
        // Centralized error handling for any issues during parsing or processing.
        console.error("Critical error during execution:", operationError.message);
        // In a production environment, one might also exit with a non-zero code to indicate failure.
        // process.exit(1);
    }
};

// This line ensures the script is executed when run directly.
// It reads the entire content of stdin as a UTF-8 string and passes it to the initiator.
initiateScriptExecution(require('fs').readFileSync('/dev/stdin', 'utf8'));