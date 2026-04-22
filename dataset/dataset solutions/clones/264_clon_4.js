const maximumDigitCount = 10;
const maximumPossibleSum = 330;
const digitValueRange = 10; // For digits 0 through 9

// Initialize a 3D array to store counts:
// dimension 1: `digitsChosen` (number of digits selected, 0 to 10)
// dimension 2: `chosenDigitsBitmask` (bitmask representing which digits 0-9 have been used)
// dimension 3: `currentWeightedSum` (the sum accumulated so far)
// Each element stores the number of ways to achieve that state.
let stateCombinationsTracker = [];
for (let digitsChosen = 0; digitsChosen <= maximumDigitCount; digitsChosen++) {
    stateCombinationsTracker[digitsChosen] = [];
    for (let chosenDigitsBitmask = 0; chosenDigitsBitmask < (1 << digitValueRange); chosenDigitsBitmask++) {
        stateCombinationsTracker[digitsChosen][chosenDigitsBitmask] = new Uint32Array(maximumPossibleSum + 1);
    }
}

// Base case: 0 digits chosen, no digits used (mask 0), sum is 0. There's 1 way (the empty set).
stateCombinationsTracker[0][0][0] = 1;

// Iteratively build up the combinations for increasing number of digits chosen (position)
for (let currentPosition = 1; currentPosition <= maximumDigitCount; currentPosition++) {
    // Iterate through all possible states from the previous step (currentPosition - 1 digits chosen)
    for (let previousMask = 0; previousMask < (1 << digitValueRange); previousMask++) {
        for (let previousSum = 0; previousSum <= maximumPossibleSum; previousSum++) {
            const waysToReachPreviousState = stateCombinationsTracker[currentPosition - 1][previousMask][previousSum];

            // If there are no ways to reach this previous state, skip
            if (waysToReachPreviousState === 0) {
                continue;
            }

            // Try adding each possible digit (0-9) at the current position
            for (let digitVal = 0; digitVal < digitValueRange; digitVal++) {
                // Check if the current digitVal has already been used in the previous mask
                if (!((previousMask >> digitVal) & 1)) { // If digitVal is NOT set in previousMask
                    const newMask = previousMask | (1 << digitVal); // Mark digitVal as used
                    const newSum = previousSum + (digitVal * currentPosition); // Calculate new weighted sum

                    // If the new sum is within bounds, update the combination tracker
                    if (newSum <= maximumPossibleSum) {
                        stateCombinationsTracker[currentPosition][newMask][newSum] += waysToReachPreviousState;
                    }
                }
            }
        }
    }
}

// Aggregate the results from the 3D tracker into a 2D table,
// where `resultTable[k][S]` is the total count of ways to achieve sum `S` with `k` digits,
// regardless of which specific digits were used (as long as they were distinct).
let resultTable = [];
for (let digitsChosen = 0; digitsChosen <= maximumDigitCount; digitsChosen++) {
    resultTable[digitsChosen] = new Uint32Array(maximumPossibleSum + 1);
    for (let chosenDigitsBitmask = 0; chosenDigitsBitmask < (1 << digitValueRange); chosenDigitsBitmask++) {
        for (let currentWeightedSum = 0; currentWeightedSum <= maximumPossibleSum; currentWeightedSum++) {
            resultTable[digitsChosen][currentWeightedSum] += stateCombinationsTracker[digitsChosen][chosenDigitsBitmask][currentWeightedSum];
        }
    }
}

// Process input and output results
const inputDataContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = inputDataContent.trim().split("\n");

inputLines.forEach(function(currentLine) {
    const numericParts = currentLine.split(" ").map(Number);
    const countQuery = numericParts[0];
    const sumQuery = numericParts[1];
   
    // The original code queries dp[n+1][s].
    // Assuming 'n' (countQuery) ranges from 0 to 9, so n+1 (queryIndex) ranges from 1 to 10.
    const queryIndex = countQuery + 1; 

    // Check if the query index is within the valid range of our result table (0 to 10)
    if (queryIndex > maximumDigitCount || sumQuery > maximumPossibleSum) {
        console.log(0); // If query is out of bounds, no ways (or error in original)
    } else {
        console.log(resultTable[queryIndex][sumQuery]);
    }
});