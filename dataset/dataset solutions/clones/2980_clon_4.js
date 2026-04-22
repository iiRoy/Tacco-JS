function processor(dataString) {
    const tokens = dataString.split(' ').map(Number);
    const valA = tokens[0];
    const valB = tokens[1];
    const valC = tokens[2];
    const targetValue = tokens[3];

    const coinDenominations = [valA, valB, valC];

    // Initialize a memoization table to store computed results for subproblems.
    // memo[remainingGoal][coinIndex] will store the number of ways.
    // -1 indicates that the subproblem has not been computed yet.
    const memoizationTable = Array(targetValue + 1).fill(null).map(() => Array(coinDenominations.length + 1).fill(-1));

    function enumerateSums(currentGoal, currentCoinIndex, denoms, memo) {
        // Base case 1: If the current goal is 0, we've found one valid combination.
        if (currentGoal === 0) {
            return 1;
        }
        // Base case 2: If the current goal is negative (exceeded target)
        // or if we've run out of denominations to use, there are no valid combinations.
        if (currentGoal < 0 || currentCoinIndex === denoms.length) {
            return 0;
        }

        // Check if this subproblem has already been computed.
        // If so, return the stored result to avoid redundant calculations.
        if (memo[currentGoal][currentCoinIndex] !== -1) {
            return memo[currentGoal][currentCoinIndex];
        }

        let accumulatedCount = 0;
        const currentDenomValue = denoms[currentCoinIndex];

        // Iterate through all possible multiples of the current denomination.
        // For each multiple, recursively find combinations for the remaining goal
        // using the next set of denominations.
        for (let multiplier = 0; ; multiplier++) {
            const remainder = currentGoal - (multiplier * currentDenomValue);
            if (remainder < 0) {
                // If the remainder is negative, this multiplier is too large;
                // further increments would also be too large.
                break;
            }
            // Add the number of ways found by considering the next denomination
            // with the reduced target value.
            accumulatedCount += enumerateSums(remainder, currentCoinIndex + 1, denoms, memo);
        }

        // Store the computed result in the memoization table before returning.
        memo[currentGoal][currentCoinIndex] = accumulatedCount;
        return accumulatedCount;
    }

    const totalSolutions = enumerateSums(targetValue, 0, coinDenominations, memoizationTable);

    console.log(totalSolutions);
}

processor(require('node:fs').readFileSync('/dev/stdin', 'utf8'));