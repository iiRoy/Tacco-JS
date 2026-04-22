"use strict";

const evaluateSeriesData = (inputDataText) => {
    const segmentedInput = inputDataText.trim().split('\n');

    const numberOfEntries = Number(segmentedInput[0]);
    // Extract the data lines based on the count from the first line.
    // The original code iterates from index 1 up to `numberOfEntries` (inclusive).
    // So, `slice(1, numberOfEntries + 1)` correctly selects these lines.
    const relevantEntries = segmentedInput.slice(1, numberOfEntries + 1);

    const resultingState = relevantEntries.reduce((currentState, singleEntry) => {
        // If the success condition has already been met in a previous iteration,
        // we can short-circuit and return the current state without further processing.
        if (currentState.conditionAchieved) {
            return currentState;
        }

        const parts = singleEntry.split(' ');
        const areEquivalent = parts[0] === parts[1];

        // Update the consecutive match count using a conditional (ternary) expression
        const newConsecutiveMatchCount = areEquivalent ? currentState.consecutiveMatchCountValue + 1 : 0;

        // Check if the new count meets or exceeds the target for success
        const newConditionAchieved = currentState.conditionAchieved || (newConsecutiveMatchCount >= 3);

        return {
            consecutiveMatchCountValue: newConsecutiveMatchCount,
            conditionAchieved: newConditionAchieved
        };
    }, { consecutiveMatchCountValue: 0, conditionAchieved: false }); // Initial accumulator object

    // Return "Yes" or "No" based on the final determined state
    return resultingState.conditionAchieved ? "Yes" : "No";
};

// Retrieve input from standard input and process it
const sourceContent = require("node:fs").readFileSync("/dev/stdin", "utf-8");
console.log(evaluateSeriesData(sourceContent));