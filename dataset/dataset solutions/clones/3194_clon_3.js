'use strict';

// Helper function to parse raw input string into numbers and extract main parameters
function extractNumericParameters(rawDataString) {
    const numericStrings = rawDataString.split(/\s+/);
    const parsedNumbers = numericStrings.map(Number);

    const targetSum = parsedNumbers.shift();
    const numAvailableDigits = parsedNumbers.shift();
    const availableDigits = parsedNumbers; // Remaining numbers are the digits

    return { targetSum, numAvailableDigits, availableDigits };
}

// Helper function to determine the total count of digits in a solution representation
// A solution is an array where index 0 is a boolean, and indices 1-9 are strings of digits.
function getTotalDigitCount(solutionArray) {
    let totalLength = 0;
    for (let digitIndex = 1; digitIndex <= 9; digitIndex++) {
        totalLength += solutionArray[digitIndex].length;
    }
    return totalLength;
}

// Function to compare two potential solutions and return the "larger" one.
// "Larger" means having more digits, or if the same number of digits, lexicographically larger.
function compareSolutions(solA, solB) {
    // If solA is undefined, solB is the first valid solution for this sum, so it's "larger".
    if (solA === undefined) {
        return solB;
    }

    const lengthA = getTotalDigitCount(solA);
    const lengthB = getTotalDigitCount(solB);

    if (lengthA > lengthB) {
        return solA;
    }
    if (lengthA < lengthB) {
        return solB;
    }

    // If total digit counts are equal, compare digit by digit from 9 down to 1
    for (let digitValue = 9; digitValue > 0; digitValue--) {
        if (solA[digitValue].length > solB[digitValue].length) {
            return solA;
        }
        if (solA[digitValue].length < solB[digitValue].length) {
            return solB;
        }
    }
    // If all digit counts are equal, the solutions are identical in terms of digits,
    // so return the first one (solA) to maintain consistency.
    return solA;
}

function processInput(rawData) {
    const { targetSum, numAvailableDigits, availableDigits } = extractNumericParameters(rawData);

    // Maps a digit (1-9) to its cost (e.g., digit 1 costs 2, digit 2 costs 5)
    const digitCostMap = [false, 2, 5, 5, 4, 5, 6, 3, 7, 6]; // Index 0 unused, indices 1-9 for digits

    // Maps a cost (1-9) to the largest digit that has that cost.
    // Initialized with false, indicating no digit found for that cost yet.
    // Array length 10 to cover costs 1-9, matching digitCostMap indexing.
    const costToLargestDigit = new Array(10).fill(false);

    // Populate costToLargestDigit based on the available digits from input.
    // For each cost, we want to store the largest possible digit.
    for (let k = 0; k < numAvailableDigits; k++) {
        const currentDigit = availableDigits[k];
        const currentCost = digitCostMap[currentDigit];
        // Only update if the currentDigit is larger than what's currently stored for this cost.
        // `(costToLargestDigit[currentCost] || 0)` handles `false` or `undefined` as 0 for comparison.
        if (currentDigit > (costToLargestDigit[currentCost] || 0)) {
            costToLargestDigit[currentCost] = currentDigit;
        }
    }

    // Dynamic Programming table: memoTable[i] stores the best solution for sum 'i'.
    // Each solution is an array: [isReachable (boolean), string_of_1s, ..., string_of_9s].
    // The strings store the concatenated digits (e.g., '555' for three 5s).
    const INITIAL_DP_STATE_FOR_ZERO_SUM = [true, '', '', '', '', '', '', '', '', ''];
    const memoTable = new Array(targetSum + 1).fill(undefined); // Initialize all sums as unreachable
    memoTable[0] = INITIAL_DP_STATE_FOR_ZERO_SUM; // Sum 0 is reachable with no digits

    // Iterate through all possible sums from 1 up to targetSum
    for (let currentSum = 1; currentSum <= targetSum; currentSum++) {
        // Iterate through all possible costs (which correspond to digits 1-9)
        // The loop iterates through indices of digitCostMap, which represent costs.
        for (let costValue = 1; costValue < digitCostMap.length; costValue++) {
            const digitForThisCost = costToLargestDigit[costValue]; // Get the largest digit for this specific cost
            const previousSum = currentSum - costValue;

            // Check if:
            // 1. The previous sum is non-negative.
            // 2. A solution exists for the previous sum (`memoTable[previousSum]` is not undefined).
            // 3. The previous sum is reachable (`memoTable[previousSum][0]` is true).
            // 4. A valid digit exists for the current `costValue` (`digitForThisCost` is not falsy).
            if (previousSum >= 0 && memoTable[previousSum] && memoTable[previousSum][0] && digitForThisCost) {
                // Create a candidate solution by taking the solution for `previousSum` and adding `digitForThisCost`.
                const candidateSolution = memoTable[previousSum].slice(); // Use slice for a shallow copy
                candidateSolution[digitForThisCost] += String(digitForThisCost); // Append the digit as a string

                // Update the memoTable for `currentSum` if `candidateSolution` is better than the existing one.
                memoTable[currentSum] = compareSolutions(memoTable[currentSum], candidateSolution);
            }
        }
    }

    // Construct the final result string from the best solution found for `targetSum`.
    let finalResultString = '';
    const bestSolutionForTargetSum = memoTable[targetSum];

    if (bestSolutionForTargetSum && bestSolutionForTargetSum[0]) { // Ensure a reachable solution was found
        // Concatenate digits from 1 to 9 in reverse order (9s first, then 8s, etc.)
        // This ensures the lexicographically largest number is formed.
        for (let digitValue = 1; digitValue < 10; digitValue++) {
            finalResultString = bestSolutionForTargetSum[digitValue] + finalResultString;
        }
    }
    // If no solution is found, finalResultString remains empty, which is the correct behavior.

    console.log(finalResultString);
}

// Read input from stdin and pass it to the main processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
