"use strict";

// This module provides a core utility function to process numerical sequences.
// Its primary purpose is to adjust array elements such that the cumulative sum
// strictly alternates between positive and negative values, counting the total modifications.

/**
 * Orchestrates the numerical sequence transformation.
 * This utility processes a raw string input to achieve a specific alternating sum pattern,
 * and reports the total number of adjustments made.
 *
 * @param {string} rawInputString - The raw input data, expected to be two lines:
 *                                  1. The count of elements (N).
 *                                  2. Space-separated numerical values for the array.
 * @returns {void} Outputs the total adjustment count to the console.
 */
const executeNumericalSequenceAdjustment = (rawInputString) => {
    // Defensive programming: Ensure the input is a string before processing.
    if (typeof rawInputString !== 'string') {
        console.error("Execution Aborted: Input parameter must be a string type.");
        return;
    }

    // Step 1: Pre-process the raw input string.
    // Remove leading/trailing whitespace and split the string into individual lines.
    const processedInputLines = rawInputString.trim().split("\n");

    // Step 2: Extract and validate the total count of elements.
    // Convert the first line to a number, ensuring it's a valid positive integer.
    const numberOfElements = Number(processedInputLines[0]);
    if (isNaN(numberOfElements) || !Number.isInteger(numberOfElements) || numberOfElements < 1) {
        console.error(`Execution Aborted: Invalid element count specified: '${processedInputLines[0]}'. Must be a positive integer.`);
        return;
    }

    // Step 3: Parse and validate the array of numerical values.
    // Split the second line by spaces and convert each part to a number.
    // A check for non-numeric values is included for robustness.
    const numericalDataSet = processedInputLines[1].split(" ").map(elementString => {
        const numericValue = Number(elementString);
        if (isNaN(numericValue)) {
            console.error(`Execution Aborted: Non-numeric value encountered in data set: '${elementString}'.`);
            // Terminate processing if an invalid data element is found.
            throw new Error("Data parsing failure: Non-numeric element.");
        }
        return numericValue;
    });

    // Step 4: Initialize the state variables for calculation.
    // The cumulative aggregate starts with the first element of the data set.
    // Ensure the data set is not empty before accessing the first element.
    if (numericalDataSet.length === 0) {
        console.error("Execution Aborted: The provided data set is empty.");
        return;
    }
    let currentRunningAggregate = numericalDataSet[0];
    // This counter will keep track of all modifications made to array elements.
    let totalModificationTally = 0;

    // Step 5: Iterate through the data set, starting from the second element.
    // The goal is to ensure the `currentRunningAggregate` alternates its sign
    // after each element is added.
    for (let elementIterationIndex = 1; elementIterationIndex < numberOfElements; ++elementIterationIndex) {
        // Retrieve the current element that needs to be potentially adjusted.
        let elementForProcessing = numericalDataSet[elementIterationIndex];

        // Determine the required sign for the `currentRunningAggregate` after adding `elementForProcessing`.
        // If the current aggregate is non-negative (>= 0), the next aggregate must be negative (< 0).
        // If the current aggregate is non-positive (<= 0), the next aggregate must be positive (> 0).
        const nextAggregateMustBeNegative = (currentRunningAggregate >= 0);

        // Calculate the sum if no changes were made to `elementForProcessing`.
        let projectedAggregateValue = currentRunningAggregate + elementForProcessing;

        // Variable to store the number of adjustments needed in this specific iteration.
        let adjustmentsForThisStep = 0;

        if (nextAggregateMustBeNegative) {
            // Target: `projectedAggregateValue` should be less than 0 (e.g., -1, -2, ...).
            // If it's currently non-negative, we need to decrease `elementForProcessing`.
            if (projectedAggregateValue >= 0) {
                // To achieve -1 from `projectedAggregateValue`, we need to decrease by `projectedAggregateValue + 1`.
                adjustmentsForThisStep = projectedAggregateValue + 1;
                numericalDataSet[elementIterationIndex] -= adjustmentsForThisStep;
                totalModificationTally += adjustmentsForThisStep;
            }
        } else { // `currentRunningAggregate` is negative (meaning `currentRunningAggregate < 0`).
            // Target: `projectedAggregateValue` should be greater than 0 (e.g., 1, 2, ...).
            // If it's currently non-positive, we need to increase `elementForProcessing`.
            if (projectedAggregateValue <= 0) {
                // To achieve 1 from `projectedAggregateValue`, we need to increase by `1 - projectedAggregateValue`.
                adjustmentsForThisStep = 1 - projectedAggregateValue;
                numericalDataSet[elementIterationIndex] += adjustmentsForThisStep;
                totalModificationTally += adjustmentsForThisStep;
            }
        }

        // Update the running aggregate with the (potentially modified) current element.
        currentRunningAggregate += numericalDataSet[elementIterationIndex];
    }

    // Step 6: Output the final tally of all adjustments made.
    console.log(totalModificationTally);
};

// Main execution block: Reads input from standard input and invokes the processing function.
// Encapsulated in an immediately invoked function expression (IIFE) for scope isolation.
(() => {
    try {
        const standardInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
        executeNumericalSequenceAdjustment(standardInputData);
    } catch (ioError) {
        // Handle potential errors during file reading or initial data processing.
        console.error("Input/Processing Error:", ioError.message);
        // In a production environment, you might want to exit with a non-zero status code.
        // process.exit(1);
    }
})();