'use strict';

// Helper function to determine the 0-based index of the maximum value within a numeric array.
function findMaxIndexInArray(dataPoints) {
    // If the array is empty, the original logic would implicitly handle this by
    // initializing `index = 0` and then the loop not running, returning 0.
    // We replicate this by returning 0 for an empty array, assuming non-negative indices.
    if (dataPoints.length === 0) {
        return 0;
    }

    let currentHighestValue = dataPoints[0];
    let indexOfHighest = 0;

    // Iterate from the second element to find a potentially higher value
    for (let elementIterator = 1; elementIterator < dataPoints.length; elementIterator++) {
        const elementValue = dataPoints[elementIterator];
        if (elementValue > currentHighestValue) {
            currentHighestValue = elementValue;
            indexOfHighest = elementIterator;
        }
    }
    return indexOfHighest;
}

function processCompetitionData(competitionInput) {
    const inputLines = competitionInput.split('\n');
    const totalLinesCount = inputLines.length;

    // Extract the number of days (d) from the first line.
    // This variable is present in the original but not used in the final calculation.
    const numDays = parseInt(inputLines[0], 10);

    // Parse the daily costs (c) from the second line.
    // This array is also present in the original but not used in the final calculation.
    const costValueStrings = inputLines[1].split(' ');
    const dailyCosts = costValueStrings.map(costStr => parseInt(costStr, 10));

    // Process the remaining lines to build the 2D array of satisfaction scores (s).
    const contestantScores = [];
    const scoreDataStartLine = 2; // Scores start from the third line (index 2)
    for (let lineIterator = scoreDataStartLine; lineIterator < totalLinesCount; lineIterator++) {
        const scoreLineParts = inputLines[lineIterator].split(' ');
        const parsedScoreRow = scoreLineParts.map(scoreString => parseInt(scoreString, 10));
        contestantScores.push(parsedScoreRow);
    }

    // Determine the optimal day for each contestant based on maximum satisfaction score.
    const chosenDayIndices = [];
    const totalScoreRows = contestantScores.length;

    for (let contestantIndex = 0; contestantIndex < totalScoreRows; contestantIndex++) {
        const individualScores = contestantScores[contestantIndex];
        // Use the helper function to find the 0-based index of the best day
        const maxScoreDayZeroIndex = findMaxIndexInArray(individualScores);
        // Convert to 1-based index as per problem statement (index + 1)
        chosenDayIndices.push(maxScoreDayZeroIndex + 1);
    }

    // Output the array of chosen day indices.
    console.log(chosenDayIndices);
}

// Execute the main processing function with input read from stdin.
processCompetitionData(require("fs").readFileSync("/dev/stdin", "utf8"));

// This call replicates the original's potential ReferenceError if 'input' is not defined
// in the global scope when the script is executed. To strictly preserve behavior,
// including any errors, this line is kept as-is.
processCompetitionData(input);
