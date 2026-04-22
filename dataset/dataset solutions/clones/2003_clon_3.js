'use strict';

/**
 * Parses raw input data, processes numerical arrays, and evaluates a specific condition
 * related to a subset of top-performing items against their collective total.
 * The function outputs a binary decision ("Yes" or "No") based on this evaluation.
 *
 * @param {string} rawInputData - A multi-line string containing numerical configuration and data.
 */
function evaluateItemSelectionCriteria(rawInputData) {
    // A utility function to parse a space-separated string of numbers into an array of integers.
    const extractNumbersFromString = (lineInput) => lineInput.split(' ').map(Number);

    // Initial data preparation: remove leading/trailing whitespace and split into individual lines.
    const inputLines = rawInputData.trim().split('\n');

    // Parse the first line to get the primary operational parameters.
    // The first value (N in original context) is read but not used in this specific logic.
    // The second value (M in original context) dictates the number of items to check.
    const operationalParameters = extractNumbersFromString(inputLines[0]);
    const requiredTopItemsCount = operationalParameters[1]; // Corresponds to M

    // Parse the second line to obtain the scores of all candidate items.
    // These scores are then arranged in descending order to easily access the highest values.
    const candidateScoresList = extractNumbersFromString(inputLines[1])
                                 .sort((scoreOne, scoreTwo) => scoreTwo - scoreOne);

    // Initialize a boolean flag to track whether all conditions have been met.
    // We assume success until a failure is encountered.
    let allCriteriaSatisfied = true;

    // Pre-check: If the count of required top items is zero or negative,
    // no items need to be checked against the condition, so it's inherently satisfied.
    if (requiredTopItemsCount <= 0) {
        console.log("Yes");
        return;
    }

    // Calculate the grand total of all scores. This sum is a key component of the threshold calculation.
    const overallScoreSum = candidateScoresList.reduce((currentSum, scoreValue) => currentSum + scoreValue, 0);

    // Compute the common multiplier used in the threshold condition.
    // This value is `4 * M` from the original problem, calculated once for efficiency.
    const thresholdDivisorFactor = 4 * requiredTopItemsCount;

    // Iterate through the specified number of top items to verify each one meets the minimum score threshold.
    // The condition is: A[i] >= Sum / (4 * M)
    // This is rewritten as: A[i] * (4 * M) >= Sum to avoid potential floating-point inaccuracies
    // and for a slightly different structural presentation.
    for (let currentItemIndex = 0; currentItemIndex < requiredTopItemsCount; currentItemIndex++) {
        // If the current item's score, multiplied by the factor, is less than the total sum,
        // it fails the condition.
        if (candidateScoresList[currentItemIndex] * thresholdDivisorFactor < overallScoreSum) {
            allCriteriaSatisfied = false; // Mark as failed.
            break; // No further checks are necessary as the overall result is already "No".
        }
    }

    // Based on the final state of the flag, determine the output message.
    const finalOutcomeMessage = allCriteriaSatisfied ? "Yes" : "No";

    // Output the conclusive message to the console.
    console.log(finalOutcomeMessage);
}

// Standard input handling for Node.js environment:
// Reads the entire content of '/dev/stdin' as a UTF-8 string and passes it
// to the main processing function.
evaluateItemSelectionCriteria(require('fs').readFileSync('/dev/stdin', 'utf8'));