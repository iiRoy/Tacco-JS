'use strict';

function processInputData(sourceText) {
    const allLines = sourceText.split('\n');

    // Extract the maximum allowed execution time from the first line
    const maximumAllowedTime = Number(allLines[0].split(' ').pop());

    // Transform and filter the remaining data records
    const suitableRecords = allLines.slice(1)
        .map(lineContent => lineContent.split(' ').map(Number)) // Convert each line to an array of [cost, time] numbers
        .filter(([currentCost, executionDuration]) => executionDuration <= maximumAllowedTime); // Keep only records within the time limit

    // Determine the lowest cost among the suitable records
    const minimumAchievableCost = suitableRecords.reduce((currentLowest, [currentCost, executionDuration]) => {
        return Math.min(currentLowest, currentCost);
    }, Infinity); // Initialize with a very high value (effectively no minimum found yet)

    // Output the result based on whether a suitable cost was found
    if (minimumAchievableCost === Infinity) {
        console.log("TLE");
    } else {
        console.log(minimumAchievableCost);
    }
}

// Execute the data processing with content from standard input
processInputData(require("node:fs").readFileSync("/dev/stdin", "utf8"));