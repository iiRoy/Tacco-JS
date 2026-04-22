/*
 * Main entry point for the application.
 * This function processes the raw input data to find a specific divisor.
 */
function processInput(rawData) {
    // First, parse the entire input string.
    // It's expected to be multiple lines, with numbers separated by spaces.
    var parsedNumbers = rawData
        .split("\n") // Split the input into an array of strings, one per line.
        .map(function(textLine) { // For each line...
            return textLine
                .split(" ") // Split the line into an array of string numbers.
                .map(function(numericValue) { // For each string number...
                    return parseInt(numericValue); // Convert it to an integer.
                });
        });

    // The second element of the first line is our 'tolerance' parameter.
    var tolerance = parsedNumbers[0][1];

    // The second line of the input provides the main sequence of numbers to analyze.
    var numericSequence = parsedNumbers[1];

    // Calculate the maximum value present in the numeric sequence.
    var maximumElement = findMaximum(numericSequence);

    // Determine an upper bound for the search of the potential divisor.
    // This bound is the minimum of (maximum element + tolerance) and the total sum of the sequence.
    var upperBound = Math.min(maximumElement + tolerance, calculateTotal(numericSequence));

    // Iterate downwards from the calculated upper bound.
    // The goal is to find the largest integer 'G' (currentDivisor) that satisfies the conditions.
    for (var currentDivisor = upperBound; currentDivisor > 1; currentDivisor--) {
        // Check if the current integer 'G' meets the divisibility criteria.
        if (checkDivisibility(currentDivisor, numericSequence, tolerance)) {
            // If a valid 'G' is found, print it to the console and terminate the program.
            return console.log(currentDivisor);
        }
    }

    // If no suitable divisor greater than 1 is found, then 1 is the default result.
    return console.log(1);
}


/*
 * Helper function to find the maximum numerical value within an array.
 * @param {Array<number>} numericSequence - The array of numbers to search.
 * @returns {number} The largest number in the array.
 */
function findMaximum(numericSequence) {
    // Utilizes Array.prototype.reduce to efficiently find the maximum element.
    return numericSequence.reduce(function(accumulator, currentValue) {
        return Math.max(accumulator, currentValue);
    });
}


/*
 * Helper function to compute the sum of all numerical values in an array.
 * @param {Array<number>} numericSequence - The array of numbers to sum.
 * @returns {number} The total sum of the array elements.
 */
function calculateTotal(numericSequence) {
    // Uses Array.prototype.reduce to sum all elements, starting with an initial value of 0.
    return numericSequence.reduce(function(runningSum, elementValue) {
        return runningSum + elementValue;
    }, 0);
}


/*
 * Core logic function to determine if a potential divisor 'G' is valid
 * given a numeric sequence and a modification tolerance.
 * @param {number} potentialDivisor - The integer 'G' being tested.
 * @param {Array<number>} numericSequence - The array of numbers.
 * @param {number} tolerance - The allowed budget for modifications.
 * @returns {boolean} True if 'G' is a valid divisor, false otherwise.
 */
function checkDivisibility(potentialDivisor, numericSequence, tolerance) {
    var remainderPairs = []; // This array will store [mod1, mod2] for each number not divisible by G.
    var remainingTolerance = 2 * tolerance; // A temporary budget, initialized to twice the original tolerance.

    // Iterate through each number in the provided numeric sequence.
    for (var indexPosition = 0; indexPosition < numericSequence.length; indexPosition++) {
        // Calculate the first remainder: number % G.
        var firstRemainder = numericSequence[indexPosition] % potentialDivisor;

        // If the number is already perfectly divisible by 'G', no cost is incurred for this element.
        if (firstRemainder === 0) continue;

        // Calculate the second remainder: G - (number % G).
        // This represents the cost to increase the number to the next multiple of G.
        var secondRemainder = potentialDivisor - firstRemainder;

        // If the minimum cost to adjust this number (either to previous or next multiple of G)
        // exceeds the overall tolerance, then 'G' cannot be a valid divisor.
        if (tolerance < Math.min(firstRemainder, secondRemainder)) return false;

        // Deduct the minimum adjustment cost from our temporary budget.
        remainingTolerance -= Math.min(firstRemainder, secondRemainder);

        // If the temporary budget falls below zero, 'G' is not valid.
        if (remainingTolerance < 0) return false;

        // Store the pair of remainders for subsequent recursive path exploration.
        remainderPairs.push([firstRemainder, secondRemainder]);
    }

    // After processing all numbers, use a recursive backtracking approach
    // to check if the costs can be balanced within the allowed tolerance.
    return explorePaths(remainderPairs, 0, 0, 0, tolerance);
}


/*
 * Recursive function to explore different combinations of costs from remainder pairs
 * to see if a balanced state can be reached within the allowed budget.
 * @param {Array<Array<number>>} remainderPairs - Array of [mod1, mod2] pairs.
 * @param {number} currentDepth - The current index/level in the remainderPairs array.
 * @param {number} leftPathCost - Accumulated cost for the 'left' path.
 * @param {number} rightPathCost - Accumulated cost for the 'right' path.
 * @param {number} allowedExpense - The maximum budget for each path cost.
 * @returns {boolean} True if a balanced path is found, false otherwise.
 */
function explorePaths(remainderPairs, currentDepth, leftPathCost, rightPathCost, allowedExpense) {
    // Pruning conditions: If either accumulated cost exceeds the budget, this path is invalid.
    if (leftPathCost > allowedExpense) return false;
    if (rightPathCost > allowedExpense) return false;

    // Base case: If all remainder pairs have been processed.
    if (currentDepth === remainderPairs.length) {
        // A valid solution is found only if the accumulated left and right costs are equal.
        return leftPathCost === rightPathCost;
    }

    // Optimization: Prioritize exploring paths that are more likely to lead to a solution
    // by trying to balance left and right costs or by choosing the path with a smaller cost first.
    if (leftPathCost < rightPathCost) {
        // If left cost is less, try to increase it first to balance.
        return tryLeftOption(remainderPairs, currentDepth, leftPathCost, rightPathCost, allowedExpense) ||
               tryRightOption(remainderPairs, currentDepth, leftPathCost, rightPathCost, allowedExpense);
    } else if (leftPathCost > rightPathCost) {
        // If right cost is less, try to increase it first to balance.
        return tryRightOption(remainderPairs, currentDepth, leftPathCost, rightPathCost, allowedExpense) ||
               tryLeftOption(remainderPairs, currentDepth, leftPathCost, rightPathCost, allowedExpense);
    } else if (remainderPairs[currentDepth][0] > remainderPairs[currentDepth][1]) {
        // If costs are equal, and the first remainder is larger, try the right option first (which uses second remainder).
        return tryRightOption(remainderPairs, currentDepth, leftPathCost, rightPathCost, allowedExpense) ||
               tryLeftOption(remainderPairs, currentDepth, leftPathCost, rightPathCost, allowedExpense);
    } else if (remainderPairs[currentDepth][0] < remainderPairs[currentDepth][1]) {
        // If costs are equal, and the first remainder is smaller, try the left option first (which uses first remainder).
        return tryLeftOption(remainderPairs, currentDepth, leftPathCost, rightPathCost, allowedExpense) ||
               tryRightOption(remainderPairs, currentDepth, leftPathCost, rightPathCost, allowedExpense);
    }
    // This final return false handles the case where leftCost === rightCost AND remainderPairs[currentDepth][0] === remainderPairs[currentDepth][1].
    // It's structurally identical to the original, though logically the two || conditions above would cover this.
    return false;
}


/*
 * Helper function for explorePaths: attempts to take the 'left' path.
 * This means adding the first remainder (remainderPairs[currentDepth][0]) to leftPathCost.
 * @param {Array<Array<number>>} remainderPairs - The array of remainder pairs.
 * @param {number} currentDepth - Current recursion depth.
 * @param {number} leftPathCost - Current accumulated left cost.
 * @param {number} rightPathCost - Current accumulated right cost.
 * @param {number} allowedExpense - The budget.
 * @returns {boolean} Result of the recursive call.
 */
function tryLeftOption(remainderPairs, currentDepth, leftPathCost, rightPathCost, allowedExpense) {
    // Recursively call explorePaths, advancing to the next depth and updating the left cost.
    return explorePaths(remainderPairs,
                        currentDepth + 1,
                        leftPathCost + remainderPairs[currentDepth][0],
                        rightPathCost,
                        allowedExpense);
}


/*
 * Helper function for explorePaths: attempts to take the 'right' path.
 * This means adding the second remainder (remainderPairs[currentDepth][1]) to rightPathCost.
 * @param {Array<Array<number>>} remainderPairs - The array of remainder pairs.
 * @param {number} currentDepth - Current recursion depth.
 * @param {number} leftPathCost - Current accumulated left cost.
 * @param {number} rightPathCost - Current accumulated right cost.
 * @param {number} allowedExpense - The budget.
 * @returns {boolean} Result of the recursive call.
 */
function tryRightOption(remainderPairs, currentDepth, leftPathCost, rightPathCost, allowedExpense) {
    // Recursively call explorePaths, advancing to the next depth and updating the right cost.
    return explorePaths(remainderPairs,
                        currentDepth + 1,
                        leftPathCost,
                        rightPathCost + remainderPairs[currentDepth][1],
                        allowedExpense);
}


// --- Program Execution Start ---
// Read the entire content of standard input as a UTF-8 string.
var fileSystemUtility = require('fs');
var standardInputContent = fileSystemUtility.readFileSync('/dev/stdin', 'utf8');

// Invoke the main processing function with the obtained input.
processInput(standardInputContent);