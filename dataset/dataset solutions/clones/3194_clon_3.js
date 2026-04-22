'use strict';

/**
 * Solves the matchstick number problem using dynamic programming.
 * Finds the largest number (by digit count, then lexicographically)
 * that can be formed using a specific total number of matchsticks,
 * given a set of available digits and their matchstick costs.
 *
 * @param {string} initialInputData - Raw input string containing N, M, and M digits.
 */
function ProcessMatchstickProblem(initialInputData) {
    // --- Input Parsing and Validation (Type III addition/update) ---
    const parsedNumericalInputs = initialInputData.split(/\s+/).map(Number);

    const targetMatchsticks = parsedNumericalInputs.shift();
    const numProvidedDigits = parsedNumericalInputs.shift();
    const availableDigits = parsedNumericalInputs; // Remaining elements are the digits

    // Edge case: If no matchsticks are required or no digits are provided, output an empty string.
    if (targetMatchsticks <= 0 || numProvidedDigits <= 0) {
        console.log('');
        return;
    }

    // --- Define Matchstick Costs for each digit (Type II renaming) ---
    // Using a Map for clearer key-value association and avoiding 0-based array issues.
    const matchstickCostPerDigit = new Map([
        [1, 2], [2, 5], [3, 5], [4, 4], [5, 5],
        [6, 6], [7, 3], [8, 7], [9, 6]
    ]);

    // --- Determine the optimal digit for each matchstick cost (Type III update) ---
    // This map stores the largest digit that can be formed for a given matchstick cost.
    // If multiple digits have the same cost, we prefer the largest digit for lexicographical order.
    const optimalDigitForCost = new Map();
    for (const digitValue of availableDigits) {
        const digitCost = matchstickCostPerDigit.get(digitValue);
        // Only consider digits that have a defined matchstick cost
        if (digitCost !== undefined) {
            // If this cost hasn't been seen yet, or if the current digit is larger
            // than the previously stored digit for this cost, update it.
            if (!optimalDigitForCost.has(digitCost) || digitValue > optimalDigitForCost.get(digitCost)) {
                optimalDigitForCost.set(digitCost, digitValue);
            }
        }
    }

    // If after processing, no valid digits could be mapped to costs, output empty string.
    if (optimalDigitForCost.size === 0) {
        console.log('');
        return;
    }

    // --- Dynamic Programming Table Initialization (Type II renaming, Type III structure) ---
    // `memoizedSolutions` is an array where `memoizedSolutions[k]` stores the best number
    // that can be formed using `k` matchsticks.
    // Each state is an array: `[isReachable, countOf1s, countOf2s, ..., countOf9s]`.
    // `countOfXs` is represented as a string of 'X's (e.g., "77" for two 7s).
    const memoizedSolutions = new Array(targetMatchsticks + 1).fill(undefined);

    // Base case: 0 matchsticks can form an empty number.
    // The first element `true` indicates that this state is reachable.
    memoizedSolutions[0] = [true, '', '', '', '', '', '', '', '', ''];

    // --- Fill the DP table (Type II renaming, Type III structural changes) ---
    // Iterate from 1 up to the target number of matchsticks.
    for (let currentStickTotal = 1; currentStickTotal <= targetMatchsticks; currentStickTotal++) {
        // Iterate through all possible matchstick costs for which we have an optimal digit.
        for (const [costOfDigit, digitRepresented] of optimalDigitForCost.entries()) {
            const previousStickTotal = currentStickTotal - costOfDigit;

            // Check if the previous state is valid and reachable
            if (previousStickTotal >= 0 && memoizedSolutions[previousStickTotal] && memoizedSolutions[previousStickTotal][0]) {
                const previousState = memoizedSolutions[previousStickTotal];

                // Create a potential candidate state by adding the current digit
                // We use concat() to ensure a deep copy of the array for modification.
                const potentialCandidateState = previousState.slice(); // More explicit than concat()
                // Append the current digit to its respective count-string
                potentialCandidateState[digitRepresented] += String(digitRepresented);
                potentialCandidateState[0] = true; // Mark as reachable

                // Compare and update the current `memoizedSolutions[currentStickTotal]`
                // with the new candidate if it's superior.
                memoizedSolutions[currentStickTotal] = determineSuperiorSolution(
                    memoizedSolutions[currentStickTotal],
                    potentialCandidateState
                );
            }
        }
    }

    // --- Reconstruct and Output the Final Result (Type III update) ---
    const finalSolutionState = memoizedSolutions[targetMatchsticks];

    // If the target matchstick count is not reachable, output an empty string.
    if (!finalSolutionState || !finalSolutionState[0]) {
        console.log('');
        return;
    }

    let finalResultBuilder = [];
    // Iterate from largest digit (9) down to smallest (1)
    // to construct the number in lexicographically largest order.
    for (let digit = 9; digit >= 1; digit--) {
        const digitCountString = finalSolutionState[digit]; // e.g., "77" for two 7s
        if (digitCountString) { // If there are instances of this digit
            finalResultBuilder.push(digitCountString);
        }
    }

    console.log(finalResultBuilder.join(''));
}

/**
 * Helper function to calculate the total number of digits in a given state array.
 * This is crucial for comparing numbers by length first.
 * (Type III addition)
 * @param {Array<boolean|string>} stateArray - A DP state array.
 * @returns {number} The total count of digits.
 */
function calculateTotalDigitsInState(stateArray) {
    let totalCount = 0;
    // Iterate from digit 1 to 9
    for (let digit = 1; digit <= 9; digit++) {
        // The length of the string "77" gives the count of 7s (which is 2)
        totalCount += stateArray[digit].length;
    }
    return totalCount;
}

/**
 * Compares two DP states to determine which one represents a "larger" number.
 * Prioritizes numbers with more digits, then lexicographically larger numbers.
 * (Type II renaming, Type III update for robustness)
 *
 * @param {Array<boolean|string>} stateOne - The first DP state to compare.
 * @param {Array<boolean|string>} stateTwo - The second DP state to compare.
 * @returns {Array<boolean|string>} The superior (larger) DP state.
 */
function determineSuperiorSolution(stateOne, stateTwo) {
    // If stateOne is not yet defined/reachable, stateTwo is automatically superior (if reachable).
    if (stateOne === undefined || !stateOne[0]) {
        return stateTwo;
    }
    // If stateTwo is not defined/reachable, stateOne is automatically superior (if reachable).
    if (stateTwo === undefined || !stateTwo[0]) {
        return stateOne;
    }

    // First, compare by the total number of digits. More digits means a larger number.
    const totalDigitsInOne = calculateTotalDigitsInState(stateOne);
    const totalDigitsInTwo = calculateTotalDigitsInState(stateTwo);

    if (totalDigitsInOne > totalDigitsInTwo) {
        return stateOne;
    }
    if (totalDigitsInOne < totalDigitsInTwo) {
        return stateTwo;
    }

    // If the total number of digits is the same, compare lexicographically.
    // Iterate from the largest digit (9) down to the smallest (1).
    // The state with more occurrences of a higher digit is superior.
    for (let digit = 9; digit >= 1; digit--) {
        const countOfDigitInOne = stateOne[digit].length;
        const countOfDigitInTwo = stateTwo[digit].length;

        if (countOfDigitInOne > countOfDigitInTwo) {
            return stateOne;
        }
        if (countOfDigitInOne < countOfDigitInTwo) {
            return stateTwo;
        }
    }

    // If both states have the same number of total digits and the same counts
    // for all individual digits, they represent the same number.
    // In this case, we can return either, stateOne is chosen arbitrarily.
    return stateOne;
}

// Read input from standard input and initiate the process.
ProcessMatchstickProblem(require('fs').readFileSync('/dev/stdin', 'utf8'));