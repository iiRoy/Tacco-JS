const transformValue = (inputVal) => {
    // This function implements a specific digit transformation,
    // often seen in checksum algorithms like the Luhn algorithm.
    // If the input value is 10 or greater, it effectively sums its digits
    // but with a specific rule: 10 becomes 1, 11 becomes 2, ..., 18 becomes 9, 19 becomes 10.
    const thresholdForTransformation = 10;
    const adjustmentFactor = 9; // Equivalent to (thresholdForTransformation - 1)

    if (inputVal >= thresholdForTransformation) {
        return inputVal - adjustmentFactor;
    }
    return inputVal;
};

// --- Configuration Constants ---
const STANDARD_INPUT_SOURCE = '/dev/stdin';
const MAXIMUM_ACCUMULATED_SUM = 1000000; // Upper bound for the dynamic programming table sums
const CHECKSUM_DIVISOR = 10; // The final sum must be a multiple of this value

// --- Input Processing ---
const fileSystemModule = require('fs');
const rawDataString = fileSystemModule.readFileSync(STANDARD_INPUT_SOURCE, 'utf8');

// Validate raw input content
if (!rawDataString || rawDataString.trim().length === 0) {
    console.error("Error: No input data provided from " + STANDARD_INPUT_SOURCE);
    process.exit(1); // Terminate with an error code
}

const inputLineSegments = rawDataString.trim().split("\n");

// Ensure minimum required lines are present
// Original code expects 4 lines: n, id, a, ary
if (inputLineSegments.length < 4) {
    console.error("Error: Insufficient input lines. Expected at least 4 lines.");
    process.exit(1);
}

// Extract data from lines, discarding unused values as per Type III deletion
const numberOfElementsN = Number(inputLineSegments.shift()); // First line, unused in original logic
const identifierPatternCharacters = inputLineSegments.shift().split(''); // Second line (original 'id')
const auxiliaryValueA = Number(inputLineSegments.shift()); // Third line, unused in original logic
const possibleNumericValues = inputLineSegments.shift().split(' ').map(str => {
    const num = Number(str);
    if (isNaN(num)) {
        console.error(`Error: Invalid number format '${str}' found in potential values.`);
        process.exit(1);
    }
    return num;
}); // Fourth line (original 'ary')

// --- Initial Checksum and Multiplier Sequence Calculation ---
let dynamicMultiplierSequence = []; // Stores multipliers (1 or 2) for wildcard positions (original 'k')
let initialRunningChecksum = 0; // Accumulates sum from non-wildcard digits (original 'sum')

identifierPatternCharacters.forEach((charEntry, charPositionIndex) => {
    const isPositionEven = (charPositionIndex % 2 === 0);

    if (charEntry === "*") {
        // Wildcard: Determines a multiplier for future DP steps
        dynamicMultiplierSequence.push(isPositionEven ? 1 : 2);
    } else {
        // Numeric digit: Contributes to the initial checksum
        const digitValue = parseInt(charEntry, 10);
        if (isNaN(digitValue)) {
            console.error(`Error: Non-digit, non-wildcard character '${charEntry}' in pattern string.`);
            process.exit(1);
        }

        if (isPositionEven) {
            initialRunningChecksum += digitValue;
        } else {
            // Apply the special transformation for odd-positioned digits multiplied by 2
            initialRunningChecksum += transformValue(digitValue * 2);
        }
    }
});

// --- Dynamic Programming Table Setup ---
// The table `combinationsCountTable[step][sum]` stores the number of ways
// to achieve `sum` after processing `step` wildcard positions.
const totalDpSteps = dynamicMultiplierSequence.length + 1; // +1 for the base case (step 0)
const combinationsCountTable = Array.from({ length: totalDpSteps }, () =>
    Array(MAXIMUM_ACCUMULATED_SUM + 1).fill(0)
);

// --- DP Base Case Initialization ---
// At step 0 (before processing any wildcards), there's 1 way to achieve the initial checksum.
if (initialRunningChecksum <= MAXIMUM_ACCUMULATED_SUM) {
    combinationsCountTable[0][initialRunningChecksum] = 1;
} else {
    console.error(`Error: Initial checksum ${initialRunningChecksum} exceeds maximum allowed sum.`);
    process.exit(1);
}

// --- Dynamic Programming Iteration ---
// Loop through each wildcard position (each multiplier in dynamicMultiplierSequence)
for (let currentStepIdx = 0; currentStepIdx < dynamicMultiplierSequence.length; currentStepIdx++) {
    const currentMultiplier = dynamicMultiplierSequence[currentStepIdx];

    // For each possible numeric value that can replace a wildcard
    for (let choiceValIdx = 0; choiceValIdx < possibleNumericValues.length; choiceValIdx++) {
        const selectedNumericValue = possibleNumericValues[choiceValIdx];

        // Calculate the value added to the sum for this specific choice and multiplier
        const valueContribution = transformValue(selectedNumericValue * currentMultiplier);

        // Iterate through all possible sums from the previous step
        for (let previousSum = 0; previousSum <= MAXIMUM_ACCUMULATED_SUM; previousSum++) {
            // If there were no ways to reach `previousSum` at `currentStepIdx`, skip
            if (combinationsCountTable[currentStepIdx][previousSum] === 0) {
                continue;
            }

            const newTotalSum = previousSum + valueContribution;

            // Update the DP table for the next step
            if (newTotalSum <= MAXIMUM_ACCUMULATED_SUM) {
                combinationsCountTable[currentStepIdx + 1][newTotalSum] += combinationsCountTable[currentStepIdx][previousSum];
            }
            // If newTotalSum exceeds the limit, it's effectively discarded (not counted)
        }
    }
}

// --- Final Result Aggregation ---
let totalValidFinalCombinations = 0; // Stores the final answer

// Iterate through all possible sums in the last DP step
// We are interested in sums that are multiples of CHECKSUM_DIVISOR
for (let sumCandidate = 0; sumCandidate <= MAXIMUM_ACCUMULATED_SUM; sumCandidate++) {
    // Check if the current sum is a multiple of the required divisor
    if (sumCandidate % CHECKSUM_DIVISOR === 0) {
        // Add the number of ways to achieve this sum
        totalValidFinalCombinations += combinationsCountTable[dynamicMultiplierSequence.length][sumCandidate];
    }
}

// --- Output ---
console.log(totalValidFinalCombinations);