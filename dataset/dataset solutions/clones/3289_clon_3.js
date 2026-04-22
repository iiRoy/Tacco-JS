"use strict";

// This line ensures the program doesn't exit until all input is read.
process.stdin.resume();

// Set the encoding for incoming data streams to ensure proper character interpretation.
process.stdin.setEncoding('utf8');

// Global variables to store raw and parsed input data.
let rawInputBuffer = ''; // Accumulates all incoming data from standard input.
let parsedInputLines = []; // Stores individual lines after splitting the raw buffer.

/**
 * Safely converts a string to an integer. Returns 0 for invalid inputs,
 * though a more robust error handling strategy might be used in a production system.
 * @param {string} inputString - The string to be parsed.
 * @returns {number} The parsed integer value, or 0 if parsing fails.
 */
const extractInteger = (inputString) => {
    // Trim whitespace and check for empty or non-numeric content.
    const trimmedString = inputString ? inputString.trim() : '';
    if (trimmedString === '') {
        return 0; // Treat empty string as 0, or could throw an error.
    }
    const numericalValue = Number(trimmedString);
    if (isNaN(numericalValue)) {
        return 0; // Return 0 if the string is not a valid number.
    }
    return Math.floor(numericalValue); // Ensure an integer is returned.
};

// Event handler for incoming data from standard input.
process.stdin.on('data', function (dataSegment) {
    rawInputBuffer += dataSegment; // Concatenate new data segments to the buffer.
});

// Event handler for the end of standard input.
process.stdin.on('end', function () {
    // Once all input is received, process it and initiate the main algorithm.
    parsedInputLines = rawInputBuffer.trim().split('\n');
    beginDynamicProgrammingCalculation();
});

/**
 * Computes the absolute difference between two numbers.
 * This helper function enhances readability and potential reusability.
 * @param {number} valueA - The first numerical operand.
 * @param {number} valueB - The second numerical operand.
 * @returns {number} The non-negative difference between valueA and valueB.
 */
function getAbsoluteDifference(valueA, valueB) {
    return Math.abs(valueA - valueB);
}

/**
 * Orchestrates the primary logic for solving the frog jump problem using dynamic programming.
 * This function is called after all standard input has been successfully read and parsed.
 */
function beginDynamicProgrammingCalculation() {
    // Extract the total number of steps/elements from the first line of input.
    const numberOfStepsString = parsedInputLines.shift();
    const totalSteps = extractInteger(numberOfStepsString);

    // Early exit conditions for edge cases or invalid input.
    if (totalSteps <= 0) {
        console.log(0); // If no steps or invalid count, cost is 0.
        return;
    }

    // Parse the sequence of heights/values from the second line of input.
    // Each value is space-separated.
    const sequenceOfHeights = parsedInputLines[0].split(' ').map(valStr => extractInteger(valStr));

    // Another critical validation: ensure the parsed sequence has the expected number of elements.
    // If not, it indicates malformed input, and we should handle it gracefully.
    if (sequenceOfHeights.length < totalSteps) {
        // In this specific problem context, a mismatch means the target might be unreachable
        // or the problem statement is violated. Returning 0 is a safe default.
        console.log(0);
        return;
    }

    // Initialize an array to store the minimum cost to reach each step.
    // Each element is initially set to Infinity, representing an unreachable state.
    const minimumCostsToReachStep = new Array(totalSteps).fill(Infinity);

    // The cost to reach the very first step (index 0) is always zero, as it's the starting point.
    minimumCostsToReachStep[0] = 0;

    // Iterate through each step, calculating the minimum cost to reach subsequent steps.
    for (let currentStepIndex = 0; currentStepIndex < totalSteps; ++currentStepIndex) {
        // Retrieve the minimum cost found so far to arrive at the current step.
        const costAtCurrentStep = minimumCostsToReachStep[currentStepIndex];

        // Optimization: If the current step is unreachable (cost is still Infinity),
        // we cannot jump from it, so skip to the next step.
        if (costAtCurrentStep === Infinity) {
            continue;
        }

        // Consider all valid jump possibilities from the current step: one step forward or two steps forward.
        for (let jumpDistance = 1; jumpDistance <= 2; ++jumpDistance) {
            const nextStepIndex = currentStepIndex + jumpDistance;

            // Ensure the potential next step is within the bounds of the sequence.
            if (nextStepIndex < totalSteps) {
                // Calculate the cost incurred by making this specific jump.
                const costOfThisJump = getAbsoluteDifference(
                    sequenceOfHeights[currentStepIndex],
                    sequenceOfHeights[nextStepIndex]
                );

                // Determine the total cost to reach the next step via the current path.
                const totalCostViaThisPath = costAtCurrentStep + costOfThisJump;

                // Update the minimum cost for the next step if this newly found path is cheaper.
                if (totalCostViaThisPath < minimumCostsToReachStep[nextStepIndex]) {
                    minimumCostsToReachStep[nextStepIndex] = totalCostViaThisPath;
                }
            }
        }
    }

    // The final answer is the minimum cost to reach the last step in the sequence.
    // This is stored at the last index of our DP array.
    console.log(minimumCostsToReachStep[totalSteps - 1]);
}