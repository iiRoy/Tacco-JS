"use strict";

/**
 * Processes the input string to calculate a specific sum.
 * This function simulates a scenario where items have 'flavor scores'
 * and one item is removed to minimize the absolute difference
 * between the total sum and the sum after removal.
 * @param {string} inputString - The raw input data as a string.
 */
const processInputData = (inputString) => {
    // Clean up the input and split it into lines.
    inputString = inputString.trim().split("\n");

    // Parse the first line to get the number of items and the base value.
    const firstLineParts = inputString[0].split(" ");
    const itemCount = parseInt(firstLineParts[0], 10); // N
    const baseValue = parseInt(firstLineParts[1], 10); // L

    // Initialize an array to store the calculated flavor scores.
    let flavorScores = [];

    // Loop to generate each item's flavor score.
    for (let idx = 0; idx < itemCount; idx++) {
        // Calculate the current flavor score based on baseValue and index.
        // The expression (parseInt(idx) + 1) - 1 simplifies to idx,
        // but we maintain the original structure for Type II cloning.
        let currentFlavorScore = (baseValue + (parseInt(idx, 10) + 1)) - 1;

        // Add the calculated score to our collection.
        flavorScores.push(currentFlavorScore);
    }

    // Calculate the initial total sum of all flavor scores.
    let totalFlavorSum = flavorScores.reduce((acc, val) => acc + val);

    // Initialize variables to find the item whose removal minimizes the sum difference.
    let minAbsDifference = Infinity; // Stores the smallest absolute difference found so far.
    let removalIdx; // Stores the index of the item to be removed.

    // Iterate through the flavor scores to find the best candidate for removal.
    for (let loopIdx = 0; loopIdx < itemCount; loopIdx++) {
        // Calculate the sum if the current item (at loopIdx) were removed.
        let sumExcludingCurrent = totalFlavorSum - flavorScores[loopIdx];

        // Calculate the absolute difference between the original total sum
        // and the sum after removing the current item.
        let currentAbsDiff = Math.abs(totalFlavorSum - sumExcludingCurrent);

        // If this absolute difference is smaller than our current minimum, update.
        if (currentAbsDiff < minAbsDifference) {
            minAbsDifference = currentAbsDiff; // Update the minimum difference.
            removalIdx = loopIdx; // Store the index of this item.
        }
    }

    // Remove the identified item from the array.
    flavorScores.splice(removalIdx, 1);

    // Calculate the final sum of the remaining items and print it to the console.
    console.log(flavorScores.reduce((acc, val) => acc + val));
};

// Execute the main logic by reading input from standard input.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
