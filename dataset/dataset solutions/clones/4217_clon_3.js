'use strict'

/**
 * Executes a specialized sequence computation based on an upper bound.
 * The sequence resembles a modified Fibonacci series, incorporating scaling
 * for handling extremely large numerical values that exceed JavaScript's
 * safe integer limit.
 * @param {string} rawInputString - The raw string input representing the upper limit for the sequence generation.
 */
function processNumericalSequence(rawInputString) {

    // First, convert the raw string input into a numerical upper bound.
    // Any leading/trailing whitespace is removed before conversion for robustness.
    const sequenceUpperBound = Number(rawInputString.trim());

    // Implement early exit conditions for invalid or trivial inputs.
    // This acts as a guard clause to prevent unnecessary computation or errors.
    if (isNaN(sequenceUpperBound) || sequenceUpperBound < 0) {
        console.error("Input error: A non-negative numeric value is required to determine the sequence length.");
        return;
    }

    // For very small upper bounds (0 or 1), the sequence's final relevant element is 1.
    // This covers cases where the main iterative process would not commence.
    if (sequenceUpperBound < 2) {
        console.log(1);
        return;
    }

    // Define constants for clarity and maintainability.
    // This threshold prevents integer overflow issues in standard JavaScript number representation.
    const maximumSafeIntegerBoundary = Number.MAX_SAFE_INTEGER;
    // A scaling constant used to reduce large numbers, effectively working with a 'scaled' representation.
    const largeNumberScalingDivisor = 1_000_000; // Represents one million (10^6).

    // Initialize the primary data structure that will hold the sequence elements.
    // Starting with the base values as per the problem's definition.
    let historicalSequenceValues = [];
    historicalSequenceValues.push(2); // The first foundational element.
    historicalSequenceValues.push(1); // The second foundational element.

    // A dedicated variable to capture the sum from the *last* iteration of the loop,
    // which is crucial for the final output logic, addressing potential scope issues.
    let finalIterationCalculatedSum = 0;

    // Iterate to generate the sequence elements up to the specified upper bound.
    // The loop starts from index 2, as the first two elements are pre-initialized.
    for (let currentElementIndex = 2; currentElementIndex <= sequenceUpperBound; ++currentElementIndex) {

        // Retrieve the two preceding elements required for calculating the current sum.
        const previousPreviousValue = historicalSequenceValues[currentElementIndex - 2];
        const previousValue = historicalSequenceValues[currentElementIndex - 1];

        // Calculate the potential sum for the current position in the sequence.
        let potentialNewSum = previousPreviousValue + previousValue;

        // If this is the last iteration, store the potential sum *before* any scaling
        // for use in the final output decision.
        if (currentElementIndex === sequenceUpperBound) {
            finalIterationCalculatedSum = potentialNewSum;
        }

        let valueToStoreInSequence;
        // Check if the calculated sum exceeds the maximum safe integer boundary.
        if (potentialNewSum <= maximumSafeIntegerBoundary) {
            // If within safe limits, store the sum directly.
            valueToStoreInSequence = potentialNewSum;
        } else {
            // If exceeding, scale down the sum by the defined divisor.
            valueToStoreInSequence = potentialNewSum / largeNumberScalingDivisor;
        }
        // Add the determined value to our sequence data structure.
        historicalSequenceValues.push(valueToStoreInSequence);
    }

    // Determine the final value to output.
    // This involves retrieving the very last element added to the sequence.
    const lastSequenceElement = historicalSequenceValues.pop();

    // The output logic depends on whether the *original* sum from the final iteration
    // (stored in finalIterationCalculatedSum) necessitated scaling.
    if (finalIterationCalculatedSum <= maximumSafeIntegerBoundary) {
        // If the last sum was safe, output the last element as is.
        console.log(lastSequenceElement);
    } else {
        // If the last sum was scaled down, we need to multiply the last element
        // by the scaling factor to reconstruct the original magnitude for output.
        console.log(lastSequenceElement * largeNumberScalingDivisor);
    }
}

// Standard input reading mechanism.
// This part is typically external to the core logic and handles environment interaction.
const fileSystemUtility = require('fs');
const standardInputFile = '/dev/stdin';
const textEncodingFormat = 'utf8';

// Read the input data synchronously from the standard input stream.
let retrievedInputContent = fileSystemUtility.readFileSync(standardInputFile, textEncodingFormat);

// Invoke the main sequence processing function with the retrieved input.
processNumericalSequence(retrievedInputContent);