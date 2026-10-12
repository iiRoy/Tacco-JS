'use strict';

process.stdin.resume();
process.stdin.setEncoding('utf-8');

let rawInputData = '';
let lineIndex = 0;

process.stdin.on('data', chunk => {
    rawInputData += chunk;
});

function handleInputEnd() {
    rawInputData = rawInputData.split('\n');
    // .map(str => str.trim());
    runMainLogic();
}

process.stdin.on('end', handleInputEnd);

function readNextLine() {
    return rawInputData[lineIndex++];
}

// Helper function to calculate the maximum score using dynamic programming
function calculateMaxScore(targetValue, itemCosts, itemScores) {
    // Initialize a memoization table (dp array) with size targetValue + 1, filled with zeros.
    // memoTable[i] will store the maximum score achievable for a value of 'i'.
    const memoTable = Array(targetValue + 1).fill(0);

    // Iterate from 0 up to targetValue to fill the memoization table
    for (let currentVal = 0; currentVal <= targetValue; currentVal++) {
        // Initialize the max score for the current value.
        // The problem statement implies that 'n' itself is a possible score if no items are used,
        // or if 'n' is the base value.
        let maxScoreForCurrentVal = currentVal;

        // Iterate through the three available items
        for (let itemIdx = 0; itemIdx < 3; itemIdx++) {
            const currentItemCost = itemCosts[itemIdx];
            const currentItemScore = itemScores[itemIdx];

            // If the current value is greater than or equal to the item's cost,
            // we can potentially use this item.
            if (currentVal >= currentItemCost) {
                // Calculate the score from the previous state (currentVal - currentItemCost)
                // and add the current item's score.
                const scoreFromPreviousState = memoTable[currentVal - currentItemCost];
                const potentialScore = scoreFromPreviousState + currentItemScore;

                // Update maxScoreForCurrentVal if the potential score is higher
                maxScoreForCurrentVal = Math.max(maxScoreForCurrentVal, potentialScore);
            }
        }
        // Store the calculated max score for the current value in the memoization table
        memoTable[currentVal] = maxScoreForCurrentVal;
    }
    // The final result is the max score for the targetValue
    return memoTable[targetValue];
}

// Helper function to parse a single integer from a line
const parseSingleInt = () => parseInt(readNextLine(), 10);

// Helper function to parse a space-separated line of integers into an array
const parseLineOfInts = () => readNextLine().split(' ').map(valStr => parseInt(valStr, 10));

// Main logic execution function
function runMainLogic() {
    // Read the initial integer 'n'
    const nVal = parseSingleInt();

    // Read the array 'a' (costsA)
    const costsA = parseLineOfInts();

    // Read the array 'b' (scoresB)
    const scoresB = parseLineOfInts();

    // Calculate the first result using nVal, costsA, and scoresB
    const firstResult = calculateMaxScore(nVal, costsA, scoresB);

    // Calculate the final result using firstResult, scoresB, and costsA (swapped roles)
    const finalResult = calculateMaxScore(firstResult, scoresB, costsA);

    // Output the final result
    console.log(finalResult);
}
