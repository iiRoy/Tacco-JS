"use strict";

function processData(rawData) {
    // Parse the input string to extract the four numeric values
    let [positiveCards, neutralCards, negativeCards, operationsLimit] = rawData
        .trim()
        .split("\n")[0]
        .split(" ")
        .map(Number);

    let currentScore = 0; // Initialize the score accumulator

    // Phase 1: Process positive cards
    if (positiveCards >= operationsLimit) {
        currentScore = operationsLimit;
        operationsLimit = 0; // All operations used on positive cards
    } else {
        currentScore = positiveCards;
        operationsLimit = operationsLimit - positiveCards; // Remaining operations
    }

    // Phase 2: Process neutral cards
    // Neutral cards do not change the score, only consume operations
    if (neutralCards >= operationsLimit) {
        operationsLimit = 0; // All remaining operations used on neutral cards
    } else {
        operationsLimit = operationsLimit - neutralCards; // Remaining operations
    }

    // Phase 3: Process negative cards
    // Negative cards decrease the score
    if (negativeCards >= operationsLimit) {
        currentScore = currentScore - operationsLimit; // Decrease score by remaining operations
    } else {
        currentScore -= negativeCards; // Decrease score by all available negative cards
    }

    // Output the final calculated score
    console.log(currentScore);
}

// Read input from standard input and pass it to the processing function
processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
