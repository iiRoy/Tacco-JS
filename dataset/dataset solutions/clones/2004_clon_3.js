"use strict";

/**
 * Utility function to safely parse a string into an integer.
 * It handles potential non-numeric inputs by returning 0, though for this problem
 * we assume valid numerical input as per typical competitive programming constraints.
 * @param {string} stringRepresentation - The string value to be converted to a number.
 * @returns {number} The integer representation of the string.
 */
const convertToInteger = (stringRepresentation) => {
    const numericValue = parseInt(stringRepresentation, 10);
    // In a production environment, one might throw an error or log a warning here.
    // For competitive programming, NaN implies invalid input, which is usually not expected.
    return isNaN(numericValue) ? 0 : numericValue;
};

/**
 * Main application logic to determine selection eligibility based on specific criteria.
 * This function processes raw textual input, performs calculations, and prints a result.
 * @param {string} fullInputText - The entire text content read from the standard input.
 */
const evaluateSelectionProcess = (fullInputText) => {
    // Step 1: Prepare the input data.
    // Clean up leading/trailing whitespace and divide the input into separate lines.
    const textLines = fullInputText.trim().split('\n');

    // Essential check: ensure there are at least two lines for parameters and scores.
    if (textLines.length < 2) {
        console.log("Error: Input data is incomplete or malformed.");
        return;
    }

    // Step 2: Extract configuration parameters from the first line.
    const initialParameters = textLines[0].split(' ');
    // Verify that the first line contains the expected number of parameters (N and M).
    if (initialParameters.length < 2) {
        console.log("Error: Configuration parameters are missing.");
        return;
    }

    // Parse the total number of items available and the count of items required for selection.
    const totalAvailableItems = convertToInteger(initialParameters[0]); // Original N
    const requiredItemCount = convertToInteger(initialParameters[1]);   // Original M

    // Step 3: Extract and parse the individual scores from the second line.
    const rawScoreStrings = textLines[1].split(' ');
    const itemScores = rawScoreStrings.map(scoreStr => convertToInteger(scoreStr)); // Original A

    // Guard clause: If the number of required items is zero or less, it trivially passes.
    if (requiredItemCount <= 0) {
        console.log("Yes");
        return;
    }

    // Guard clause: If more items are required than are actually available, it's impossible.
    if (requiredItemCount > itemScores.length) {
        console.log("No");
        return;
    }

    // Step 4: Calculate the aggregate sum of all item scores.
    let accumulatedScoreSum = 0; // Original 'total'
    // Using a for-of loop for sum accumulation.
    for (const scoreValue of itemScores) {
        accumulatedScoreSum += scoreValue;
    }

    // Step 5: Determine the critical threshold for selection.
    // The threshold calculation uses a multiplier derived from the required item count.
    // Using a bitwise left shift (equivalent to multiplying by 4) for the divisor base.
    const thresholdBaseDivisor = requiredItemCount << 2; // Equivalent to requiredItemCount * 4

    // Prevent division by zero if `requiredItemCount` somehow results in a zero divisor.
    if (thresholdBaseDivisor === 0) {
        console.log("No"); // Cannot establish a meaningful threshold.
        return;
    }

    const minimumSelectionThreshold = accumulatedScoreSum / thresholdBaseDivisor; // Original 'thresh'

    // Step 6: Sort the item scores in descending order.
    // Custom comparator function (b - a) ensures values are ordered from highest to lowest.
    itemScores.sort((scoreOne, scoreTwo) => scoreTwo - scoreOne);

    // Step 7: Evaluate if the top 'requiredItemCount' items meet the threshold.
    let allConditionsMet = true; // Assume success initially.

    // Iterate only through the number of items that need to be checked.
    for (let currentCheckIndex = 0; currentCheckIndex < requiredItemCount; currentCheckIndex++) {
        // If an item's score is below the calculated minimum threshold, the condition fails.
        if (itemScores[currentCheckIndex] < minimumSelectionThreshold) {
            allConditionsMet = false; // Mark as failed.
            break; // No need to check further; early exit from loop.
        }
    }

    // Step 8: Output the final determination.
    if (allConditionsMet) {
        console.log("Yes");
    } else {
        console.log("No");
    }
};

// Entry point: Read the input from the standard input stream and pass it to the processing function.
// This setup is typical for JavaScript environments in competitive programming platforms.
evaluateSelectionProcess(require('fs').readFileSync('/dev/stdin', 'utf8'));