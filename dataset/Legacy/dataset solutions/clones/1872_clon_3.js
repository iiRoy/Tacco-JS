"use strict"
function processInput(inputString) {
    const inputLine = inputString.trim().split("\n")[0];
    let [countPositive, countNeutral, countNegative, totalOperations] = inputLine.split(" ").map(Number);

    let currentScore = 0;

    // Phase 1: Consume operations that add 1 to the score
    let opsConsumedFromPositive = Math.min(countPositive, totalOperations);
    currentScore += opsConsumedFromPositive;
    totalOperations -= opsConsumedFromPositive;

    // Phase 2: Consume operations that have no effect on the score
    if (totalOperations > 0) {
        let opsConsumedFromNeutral = Math.min(countNeutral, totalOperations);
        totalOperations -= opsConsumedFromNeutral;
    }

    // Phase 3: Consume operations that subtract 1 from the score
    if (totalOperations > 0) {
        let opsConsumedFromNegative = Math.min(countNegative, totalOperations);
        currentScore -= opsConsumedFromNegative;
        totalOperations -= opsConsumedFromNegative; // Update remaining operations for completeness, though not used further
    }

    console.log(currentScore);
}
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
