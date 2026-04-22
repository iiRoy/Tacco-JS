function processValueReduction(initialValue) {
    // This helper function takes a numeric value.
    // If the value is 10 or greater, it reduces it by 9 (e.g., 10 becomes 1, 11 becomes 2).
    // This is a common transformation in checksum algorithms to get a single-digit equivalent.
    if (initialValue >= 10) {
        return initialValue - 9;
    }
    // For values less than 10, no transformation is applied.
    return initialValue;
}

// --- Data Acquisition and Initial Parsing ---

// Utilize the Node.js 'fs' (filesystem) module for synchronous input reading.
// Note: Synchronous I/O can block the event loop; asynchronous methods are generally preferred for production.
const fileSystemModule = require('fs');

// Read the entire content from standard input, remove any surrounding whitespace,
// and then split the content into an array of lines based on newline characters.
const allInputLines = fileSystemModule.readFileSync('/dev/stdin', 'utf8').trim().split('\n');

// The first line of input is consumed but its value is not used in the subsequent logic.
// We explicitly convert it to a number and store it in a variable indicating its non-essential nature.
const initialCountValue = Number(allInputLines.shift());

// The second line contains a sequence of characters, which can be digits or asterisks ('*').
// This sequence is immediately split into individual characters.
const characterInputSequence = allInputLines.shift().split('');

// The third line is also consumed and discarded, similar to the first line.
const secondaryUnusedValue = Number(allInputLines.shift());

// The fourth line contains a space-separated list of numbers.
// These numbers are parsed into an array of integers.
const numericPoolData = allInputLines.shift().split(' ').map(Number);

// --- Pre-computation and Base Sum Determination ---

// This array will store specific multipliers (either 1 or 2) derived from '*' characters
// found in the input character sequence.
const derivedMultipliers = [];

// This variable will accumulate a base sum from the digit characters in the input sequence.
let runningBaseSum = 0;

// Iterate through each character in the input sequence along with its index.
for (let seqIndex = 0; seqIndex < characterInputSequence.length; seqIndex++) {
    const currentSymbol = characterInputSequence[seqIndex];
    // Determine if the current character's position is even or odd (0-indexed).
    const isPositionEven = (seqIndex % 2 === 0);

    if (currentSymbol === '*') {
        // If the symbol is an asterisk, a multiplier is added to `derivedMultipliers`.
        // The multiplier is 1 if the position is even, and 2 if it's odd.
        derivedMultipliers.push(isPositionEven ? 1 : 2);
    } else {
        // If the symbol is a digit, convert it to a numeric value.
        const digitNumericValue = Number(currentSymbol);

        if (isPositionEven) {
            // For even positions, the digit's value is added directly to the running base sum.
            runningBaseSum += digitNumericValue;
        } else {
            // For odd positions, the digit's value is first doubled,
            // then passed through the `processValueReduction` function,
            // and the resulting value is added to the running base sum.
            const processedDoubledValue = processValueReduction(digitNumericValue * 2);
            runningBaseSum += processedDoubledValue;
        }
    }
}

// --- Dynamic Programming Table Initialization ---

// Define the maximum possible sum that can be accumulated.
// We add 1 to accommodate 0-based indexing up to 1,000,000.
const MAXIMUM_ACCUMULATED_SUM = 1000001;

// The number of stages in our DP table. This corresponds to the number of derived multipliers
// plus one for the initial base sum stage.
const DP_TABLE_STAGES = derivedMultipliers.length + 1;

// Initialize a 2D array (DP table) where `dpStates[stage][sum]` will store the count
// of ways to achieve `sum` at a particular `stage`.
// All cells are initialized to 0.
const dpStates = Array.from({ length: DP_TABLE_STAGES }, () => new Array(MAXIMUM_ACCUMULATED_SUM).fill(0));

// Set the base case for the dynamic programming:
// At stage 0 (before processing any derived multipliers), there is 1 way to achieve the `runningBaseSum`.
dpStates[0][runningBaseSum] = 1;

// --- Dynamic Programming Transition Logic ---

// Iterate through each stage, corresponding to each multiplier in `derivedMultipliers`.
for (let currentDpStage = 0; currentDpStage < derivedMultipliers.length; currentDpStage++) {
    const activeMultiplier = derivedMultipliers[currentDpStage];

    // For each stage, iterate through every number available in the `numericPoolData`.
    for (let poolIndex = 0; poolIndex < numericPoolData.length; poolIndex++) {
        const numberFromPool = numericPoolData[poolIndex];

        // Calculate the value that will be added to the sum for this combination.
        // It's the `numberFromPool` multiplied by the `activeMultiplier`,
        // then processed for reduction.
        const effectiveValueToAdd = processValueReduction(numberFromPool * activeMultiplier);

        // Iterate through all possible sums from the *previous* DP stage.
        for (let previousSum = 0; previousSum < MAXIMUM_ACCUMULATED_SUM; previousSum++) {
            // If there were no ways to reach `previousSum` at the prior stage, skip this iteration
            // as it won't contribute to new sums. This is an optimization.
            if (dpStates[currentDpStage][previousSum] === 0) {
                continue;
            }

            // Calculate the new sum for the current DP stage.
            const calculatedNewSum = previousSum + effectiveValueToAdd;

            // Ensure the `calculatedNewSum` does not exceed the maximum allowed sum.
            // This prevents out-of-bounds access for the `dpStates` array.
            if (calculatedNewSum < MAXIMUM_ACCUMULATED_SUM) {
                // Add the count of ways from the `previousSum` to the `calculatedNewSum`
                // in the next DP stage (`currentDpStage + 1`).
                dpStates[currentDpStage + 1][calculatedNewSum] += dpStates[currentDpStage][previousSum];
            }
        }
    }
}

// --- Final Result Aggregation ---

let totalValidCombinations = 0;

// After all DP stages are complete, iterate through all possible sums in the final stage.
// The final stage is `derivedMultipliers.length`.
for (let finalSumCandidate = 0; finalSumCandidate < MAXIMUM_ACCUMULATED_SUM; finalSumCandidate++) {
    // Check if the current sum candidate is a multiple of 10.
    const isDivisibleByTen = (finalSumCandidate % 10 === 0);

    if (isDivisibleByTen) {
        // If the sum is a multiple of 10, add the number of ways to achieve this sum
        // from the final DP stage to our total count.
        totalValidCombinations += dpStates[derivedMultipliers.length][finalSumCandidate];
    }
}

// Output the final computed total number of valid combinations.
console.log(totalValidCombinations);