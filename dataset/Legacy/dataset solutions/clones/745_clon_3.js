const fs = require('fs');

const adjustDigitValue = (val) => (val >= 10) ? (val - 10 + 1) : val;

const EVEN_POSITION_MULTIPLIER = 1;
const ODD_POSITION_MULTIPLIER = 2;
const MODULO_CHECK_VALUE = 10;
const MAX_DP_ROWS = 8; // Corresponds to original loop 'i <= 7' for dp table initialization
const MAX_DP_SUM = 1000000; // Corresponds to original loop 's <= 1000000' for sums

const rawInputContent = fs.readFileSync('/dev/stdin', 'utf8');
let inputLines = rawInputContent.trim().split('\n');

// Destructure and parse input lines. Variables '_unusedN' and '_unusedA' are not used later.
const _unusedN = Number(inputLines.shift());
const cardIdentifierDigits = inputLines.shift().split('');
const _unusedA = Number(inputLines.shift());
const baseMultipliers = inputLines.shift().split(' ').map(Number);

let initialCalculatedSum = 0;
const starPositionMultipliers = [];

cardIdentifierDigits.forEach((charDigit, digitIndex) => {
    const isEvenPosition = (digitIndex % ODD_POSITION_MULTIPLIER === 0); // ODD_POSITION_MULTIPLIER is 2 for modulo check
    const digitNumericValue = Number(charDigit);

    if (charDigit === "*") {
        starPositionMultipliers.push(isEvenPosition ? EVEN_POSITION_MULTIPLIER : ODD_POSITION_MULTIPLIER);
    } else {
        if (isEvenPosition) {
            initialCalculatedSum += digitNumericValue;
        } else {
            initialCalculatedSum += adjustDigitValue(digitNumericValue * ODD_POSITION_MULTIPLIER);
        }
    }
});

// Initialize DP table with zeros
const sumCombinationsCount = Array.from({ length: MAX_DP_ROWS }, () =>
    Array(MAX_DP_SUM + 1).fill(0)
);

// Set the initial state for the dynamic programming process
sumCombinationsCount[0][initialCalculatedSum] = 1;

const numStarPositions = starPositionMultipliers.length;
const numBaseMultipliers = baseMultipliers.length;

// Populate the DP table by iterating through star positions and base multipliers
for (let dpRowIndex = 0; dpRowIndex < numStarPositions; dpRowIndex++) {
    for (let baseIdx = 0; baseIdx < numBaseMultipliers; baseIdx++) {
        const currentStarMultiplier = starPositionMultipliers[dpRowIndex];
        const currentBaseValue = baseMultipliers[baseIdx];
        const valueToAdd = adjustDigitValue(currentBaseValue * currentStarMultiplier);

        for (let currentPossibleSum = 0; currentPossibleSum <= MAX_DP_SUM; currentPossibleSum++) {
            // Skip calculations for sums that have no combinations leading to them
            if (sumCombinationsCount[dpRowIndex][currentPossibleSum] === 0) {
                continue;
            }

            const nextSum = currentPossibleSum + valueToAdd;
            // Only consider sums within the defined maximum range
            if (nextSum <= MAX_DP_SUM) {
                sumCombinationsCount[dpRowIndex + 1][nextSum] += sumCombinationsCount[dpRowIndex][currentPossibleSum];
            }
        }
    }
}

let finalValidSumCount = 0;

// Calculate the final answer by summing up counts for sums divisible by 10
for (let currentPossibleSum = 0; currentPossibleSum <= MAX_DP_SUM; currentPossibleSum++) {
    if (currentPossibleSum % MODULO_CHECK_VALUE === 0) {
        finalValidSumCount += sumCombinationsCount[numStarPositions][currentPossibleSum];
    }
}

console.log(finalValidSumCount);
