"use strict";

// This function serves as the primary entry point for processing the input data.
// It implements a dynamic programming approach to solve a variation of the knapsack problem.
const processInput = (inputDataString) => {
    // First, clean up the raw input string by removing leading/trailing whitespace,
    // then split it into an array of individual lines based on newline characters.
    let parsedLines = inputDataString.trim().split("\n");

    // The first line of input contains two space-separated integers:
    // the total number of items (itemCount) and the maximum allowed weight (maxCapacity).
    const itemCount = parseInt(parsedLines[0].split(" ")[0]);
    const maxCapacity = parseInt(parsedLines[0].split(" ")[1]);

    // Subsequent lines (from the second line up to itemCount) contain details for each item.
    // Each item's line has two space-separated integers: its weight and its value.
    // We map these lines to an array of arrays, where each inner array is [weight, value].
    const itemSpecifications = parsedLines.slice(1, itemCount + 1).map(lineContent =>
        lineContent.split(" ").map(numericPart => parseInt(numericPart))
    );

    // Initialize a 2D array, which will serve as our dynamic programming table.
    // The table dimensions are (itemCount + 1) rows by (maxCapacity + 1) columns.
    // All cells are initially filled with zero, representing no value.
    let dpTable = Array(itemCount + 1).fill(null).map(() => Array(maxCapacity + 1).fill(0));

    // Iterate through each item, starting from the first item (index 1 in DP table).
    for (let currentItemIndex = 1; currentItemIndex <= itemCount; currentItemIndex++) {
        // Retrieve the weight and value for the item currently being considered.
        // Note: itemSpecifications is 0-indexed, so we use currentItemIndex - 1.
        const currentItemWeight = itemSpecifications[currentItemIndex - 1][0];
        const currentItemValue = itemSpecifications[currentItemIndex - 1][1];

        // For each item, iterate through all possible capacities from 0 up to maxCapacity.
        for (let currentWeightLimit = 0; currentWeightLimit <= maxCapacity; currentWeightLimit++) {
            // Check if the current item's weight exceeds the current capacity limit.
            if (currentItemWeight > currentWeightLimit) {
                // If the item is too heavy for the current capacity,
                // we cannot include it. So, the maximum value for this
                // (item, capacity) combination is simply the value obtained
                // without considering the current item (from the previous row).
                dpTable[currentItemIndex][currentWeightLimit] = dpTable[currentItemIndex - 1][currentWeightLimit];
            } else {
                // If the item can potentially fit, we have two options:
                // 1. Exclude the current item: The value is what we had for the previous item
                //    at the same capacity (dpTable[currentItemIndex - 1][currentWeightLimit]).
                // 2. Include the current item: The value is the current item's value plus
                //    the maximum value we could get from previous items with the remaining capacity
                //    (currentItemValue + dpTable[currentItemIndex - 1][currentWeightLimit - currentItemWeight]).
                // We choose the option that yields the maximum value.
                dpTable[currentItemIndex][currentWeightLimit] = Math.max(
                    dpTable[currentItemIndex - 1][currentWeightLimit],
                    currentItemValue + dpTable[currentItemIndex - 1][currentWeightLimit - currentItemWeight]
                );
            }
        }
    }

    // After filling the entire DP table, the maximum total value that can be
    // achieved with all items and the given maxCapacity is found at the
    // bottom-right corner of the table.
    console.log(dpTable[itemCount][maxCapacity]);
};

// Read the entire content of standard input synchronously,
// assuming UTF-8 encoding, and then pass it to our processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
