"use strict";

// This script processes numerical data from standard input to determine a specific condition.

/**
 * Orchestrates the primary logic for evaluating input data.
 * @param {string} rawInputData - The complete string content read from the input source.
 */
const processData = (rawInputData) => {
    // Clean up the input string by removing leading/trailing whitespace
    // and then splitting it into an array of individual lines.
    const inputLines = rawInputData.trim().split("\n");

    // Extract the first two numerical parameters from the initial line.
    // The first parameter, 'itemCount', represents the total number of available items.
    const itemCount = Number(inputLines[0].split(" ")[0]);
    // The second parameter, 'selectionCount', indicates how many top items need to meet a criterion.
    const selectionCount = Number(inputLines[0].split(" ")[1]);

    // Parse the second line of input, which contains space-separated vote counts for each item.
    // Convert each string representation of a vote into its numerical equivalent.
    const itemScores = inputLines[1].split(" ").map((scoreString) => Number(scoreString));

    // Compute the aggregate sum of all item scores.
    const totalScoreSum = itemScores.reduce((accumulatedSum, currentScore) => accumulatedSum + currentScore);

    // Calculate the minimum required score for an item to be considered 'popular'.
    // This threshold is defined as the total sum of scores divided by (4 * selectionCount).
    const popularityThreshold = totalScoreSum / (4 * selectionCount);

    // Arrange the item scores in descending order to easily access the highest-scoring items.
    itemScores.sort().reverse();

    // Iterate through the 'selectionCount' number of highest-scoring items.
    for (let currentIdx = 0; currentIdx < selectionCount; currentIdx++) {
        // If any of these top items falls below the calculated popularity threshold,
        // the condition is not met.
        if (itemScores[currentIdx] < popularityThreshold) {
            console.log("No"); // Output "No" to indicate failure.
            return; // Terminate execution as the condition is already determined.
        }
    }

    // If the loop completes without any item failing the threshold check,
    // it means all top 'selectionCount' items meet the popularity criterion.
    console.log("Yes"); // Output "Yes" to indicate success.
};

// Read the entire content of standard input synchronously using Node.js's 'fs' module,
// assuming UTF-8 encoding, and then pass it to the main processing function.
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
