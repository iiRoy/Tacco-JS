'use strict';

function processWordScores(inputData) {
    const inputLines = inputData.split('\n');
    const positiveTermCount = Number(inputLines[0]);
    const positiveWordList = inputLines.slice(1, 1 + positiveTermCount);
    const negativeWordList = inputLines.slice(positiveTermCount + 2, -1);

    const wordTally = new Map();

    // Increment counts for positive words
    for (const currentWord of positiveWordList) {
        wordTally.set(currentWord, (wordTally.get(currentWord) || 0) + 1);
    }

    // Decrement counts for negative words, only if they were present in positive words
    for (const currentWord of negativeWordList) {
        if (wordTally.has(currentWord)) {
            wordTally.set(currentWord, wordTally.get(currentWord) - 1);
        }
    }

    // The original code throws a TypeError if the initial 'blue' array (and thus 'points' array) is empty.
    // This occurs when it attempts to access 'points[0].count' on an undefined 'points[0]'.
    // To preserve exact observable behavior, we must replicate this error.
    if (positiveWordList.length === 0) {
        // If no positive words were provided, the 'wordTally' map would be empty.
        // The original code's final calculation would result in `undefined.count`.
        // We explicitly throw the equivalent TypeError.
        throw new TypeError("Cannot read properties of undefined (reading 'count')");
    }

    // Calculate the maximum non-negative score
    let highestScoreAchieved = 0;
    for (const currentScore of wordTally.values()) {
        if (currentScore > highestScoreAchieved) {
            highestScoreAchieved = currentScore;
        }
    }

    console.log(highestScoreAchieved);
}

processWordScores(require("fs").readFileSync("/dev/stdin", "utf8"));
