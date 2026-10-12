function processInput(rawData) {
    // Parse the input string into an array of numbers.
    // The first line contains N and K, the second line contains the array elements.
    const parsedLines = rawData.split("\n").map(function(currentLine) {
        return currentLine.split(" ").map(function(numStr) {
            return parseInt(numStr, 10); // Ensure base 10 for parsing integers
        });
    });

    // Extract K from the first line
    const budgetVal = parsedLines[0][1];
    // Extract the number sequence from the second line
    const numberSequence = parsedLines[1];

    // Find the maximum element in the sequence
    const maximumElement = findMaximum(numberSequence);

    // Determine the upper bound for the divisor search.
    // It's the minimum of (max element + K) and the sum of all elements.
    const maximumDivisorCandidate = Math.min(maximumElement + budgetVal, calculateSum(numberSequence));

    // Iterate downwards from the maximum possible divisor candidate
    for (let divisorCandidate = maximumDivisorCandidate; divisorCandidate > 1; divisorCandidate--) {
        // Check if the current candidate is a valid divisor
        if (checkDivisibility(divisorCandidate, numberSequence, budgetVal)) {
            // If a valid divisor is found, print it and exit
            return console.log(divisorCandidate);
        }
    }

    // If no divisor greater than 1 is found, the answer is 1
    return console.log(1);
}

/**
 * Finds the maximum value in a given array of numbers.
 * @param {number[]} numberSequence - The array of numbers.
 * @returns {number} The maximum number in the array.
 */
function findMaximum(numberSequence) {
    return numberSequence.reduce(function(accumulator, currentValue) {
        return Math.max(accumulator, currentValue);
    });
}

/**
 * Calculates the sum of all elements in a given array of numbers.
 * @param {number[]} numberSequence - The array of numbers.
 * @returns {number} The sum of the array elements.
 */
function calculateSum(numberSequence) {
    return numberSequence.reduce(function(currentSum, elementValue) {
        return currentSum + elementValue;
    }, 0); // Initialize sum to 0
}

/**
 * Checks if a given number 'currentDivisor' can be a valid divisor for the 'numberSequence'
 * within the given 'budgetVal'.
 * @param {number} currentDivisor - The potential divisor.
 * @param {number[]} numberSequence - The array of numbers.
 * @param {number} budgetVal - The allowed budget for modifications.
 * @returns {boolean} True if 'currentDivisor' is a valid divisor, false otherwise.
 */
function checkDivisibility(currentDivisor, numberSequence, budgetVal) {
    const remainderPairs = []; // Stores [mod1, mod2] for elements not divisible by currentDivisor
    let remainingBudget = 2 * budgetVal; // Total budget for both increasing and decreasing operations

    // Iterate through each number in the sequence
    for (let idx = 0; idx < numberSequence.length; idx++) {
        const firstRemainder = numberSequence[idx] % currentDivisor;

        // If the number is already divisible, no cost incurred, skip it
        if (firstRemainder === 0) {
            continue;
        }

        // Calculate the cost to make it divisible by increasing (mod2) or decreasing (mod1)
        const secondRemainder = currentDivisor - firstRemainder;

        // If the minimum cost to make it divisible is greater than the individual budget,
        // then this currentDivisor is not possible.
        if (budgetVal < Math.min(firstRemainder, secondRemainder)) {
            return false;
        }

        // Deduct the minimum cost from the total remaining budget
        remainingBudget -= Math.min(firstRemainder, secondRemainder);

        // If the total remaining budget goes negative, this currentDivisor is not possible.
        if (remainingBudget < 0) {
            return false;
        }

        // Store the pair of remainders for further path exploration
        remainderPairs.push([firstRemainder, secondRemainder]);
    }

    // After processing all numbers, explore paths to balance costs within the budget
    return explorePaths(remainderPairs, 0, 0, 0, budgetVal);
}

/**
 * Recursively explores paths to balance the costs (leftCost and rightCost)
 * for making numbers divisible, ensuring they stay within the totalBudget.
 * This is a backtracking function.
 * @param {Array<number[]>} remainderPairs - An array of [mod1, mod2] pairs.
 * @param {number} currentLevel - The current index in remainderPairs being processed.
 * @param {number} costLeft - Accumulated cost for 'left' operations (decreasing numbers).
 * @param {number} costRight - Accumulated cost for 'right' operations (increasing numbers).
 * @param {number} totalBudget - The maximum allowed cost for either left or right operations.
 * @returns {boolean} True if a balanced path is found, false otherwise.
 */
function explorePaths(remainderPairs, currentLevel, costLeft, costRight, totalBudget) {
    // Pruning: If either cost exceeds the budget, this path is invalid
    if (costLeft > totalBudget) {
        return false;
    }
    if (costRight > totalBudget) {
        return false;
    }

    // Base case: If all remainder pairs have been processed
    if (currentLevel === remainderPairs.length) {
        // A valid path is found if both costs are equal
        return costLeft === costRight;
    }

    // Recursive step: Explore different branches based on current costs and remainder values

    // Prioritize paths to balance costs
    if (costLeft < costRight) {
        // If left cost is lower, try to increase it first (by taking remainderPairs[currentLevel][0])
        return tryLeftBranch(remainderPairs, currentLevel, costLeft, costRight, totalBudget) ||
               tryRightBranch(remainderPairs, currentLevel, costLeft, costRight, totalBudget);
    } else if (costLeft > costRight) {
        // If right cost is lower, try to increase it first (by taking remainderPairs[currentLevel][1])
        return tryRightBranch(remainderPairs, currentLevel, costLeft, costRight, totalBudget) ||
               tryLeftBranch(remainderPairs, currentLevel, costLeft, costRight, totalBudget);
    } else if (remainderPairs[currentLevel][0] > remainderPairs[currentLevel][1]) {
        // If costs are equal, and mod1 > mod2, try right branch first (smaller cost)
        return tryRightBranch(remainderPairs, currentLevel, costLeft, costRight, totalBudget) ||
               tryLeftBranch(remainderPairs, currentLevel, costLeft, costRight, totalBudget);
    } else if (remainderPairs[currentLevel][0] < remainderPairs[currentLevel][1]) {
        // If costs are equal, and mod1 < mod2, try left branch first (smaller cost)
        return tryLeftBranch(remainderPairs, currentLevel, costLeft, costRight, totalBudget) ||
               tryRightBranch(remainderPairs, currentLevel, costLeft, costRight, totalBudget);
    }
    // If costs are equal and mod1 == mod2, the order doesn't strictly matter,
    // but the original code had a `return false` here. This implies that if
    // `costLeft === costRight` and `remainderPairs[currentLevel][0] === remainderPairs[currentLevel][1]`,
    // it should fall through to a default behavior. However, the original code's structure
    // implies that one of the `if/else if` conditions will always be met if `currentLevel < array.length`.
    // The final `return false` is unreachable if the logic is exhaustive.
    // To strictly preserve structure, we keep it, but it's effectively dead code given the preceding conditions.
    return false;
}

/**
 * Attempts to take the 'left' path (adding remainderPairs[currentLevel][0] to costLeft)
 * and continues the exploration.
 * @param {Array<number[]>} remainderPairs - An array of [mod1, mod2] pairs.
 * @param {number} currentLevel - The current index in remainderPairs.
 * @param {number} costLeft - Accumulated cost for 'left' operations.
 * @param {number} costRight - Accumulated cost for 'right' operations.
 * @param {number} totalBudget - The maximum allowed cost.
 * @returns {boolean} Result of the recursive call.
 */
function tryLeftBranch(remainderPairs, currentLevel, costLeft, costRight, totalBudget) {
    return explorePaths(remainderPairs, currentLevel + 1, costLeft + remainderPairs[currentLevel][0], costRight, totalBudget);
}

/**
 * Attempts to take the 'right' path (adding remainderPairs[currentLevel][1] to costRight)
 * and continues the exploration.
 * @param {Array<number[]>} remainderPairs - An array of [mod1, mod2] pairs.
 * @param {number} currentLevel - The current index in remainderPairs.
 * @param {number} costLeft - Accumulated cost for 'left' operations.
 * @param {number} costRight - Accumulated cost for 'right' operations.
 * @param {number} totalBudget - The maximum allowed cost.
 * @returns {boolean} Result of the recursive call.
 */
function tryRightBranch(remainderPairs, currentLevel, costLeft, costRight, totalBudget) {
    return explorePaths(remainderPairs, currentLevel + 1, costLeft, costRight + remainderPairs[currentLevel][1], totalBudget);
}

// Read input from stdin and pass it to the main processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
