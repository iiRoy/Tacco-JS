/**
 * This module provides a solution for finding the largest common divisor 'g'
 * for a given array of numbers, subject to a specific budget constraint 'k'.
 * The core logic involves processing remainders and recursively exploring
 * balancing possibilities within the budget.
 */

/**
 * The primary function to process the raw input string.
 * It parses the input, extracts the numerical sequence and the budget,
 * then initiates the search for the optimal divisor.
 *
 * @param {string} rawInputContent - The complete input string, typically from stdin.
 */
function processInputData(rawInputContent) {
    // Defensive check for null or empty input.
    if (!rawInputContent || rawInputContent.trim().length === 0) {
        // In a competitive programming context, this might be an error or simply lead to default output.
        // For robustness, we'll log an error.
        console.error("Input data is empty or invalid.");
        console.log(1); // Default output if input is non-processable.
        return;
    }

    // Split the entire input content into individual lines.
    const contentLines = rawInputContent.trim().split('\n');

    // Ensure we have enough lines for configuration and the number sequence.
    if (contentLines.length < 2) {
        console.error("Insufficient input lines provided.");
        console.log(1);
        return;
    }

    // Parse the first line to extract the budget threshold.
    // The original structure implied the second element of the first line is 'k'.
    const configNumbers = contentLines[0].split(' ').map(Number);
    // Validate if the budget threshold is a valid number and non-negative.
    const budgetLimit = (configNumbers.length > 1 && !isNaN(configNumbers[1]) && configNumbers[1] >= 0)
                        ? configNumbers[1]
                        : 0; // Default to 0 if invalid or missing.

    // Parse the second line to obtain the array of numbers for processing.
    const numberSequence = contentLines[1].split(' ').map(Number);

    // Validate the number sequence. Ensure all elements are valid numbers.
    if (numberSequence.some(isNaN)) {
        console.error("Number sequence contains invalid numerical entries.");
        console.log(1);
        return;
    }

    // Calculate the maximum element present in the number sequence.
    const maximumElementInSequence = findLargestElement(numberSequence);

    // Determine an upper bound for the divisor search.
    // This bound is the minimum of two values:
    // 1. The maximum element plus the budget limit.
    // 2. A "special maximum" derived from an intricate balancing sum.
    const specialCalculatedMax = determineSpecialMaximum(numberSequence);
    const candidateDivisorUpperBound = Math.min(maximumElementInSequence + budgetLimit, specialCalculatedMax);

    // Iterate downwards from the calculated upper bound.
    // We are looking for the largest possible valid divisor.
    // A divisor of 1 is always valid but we seek something greater if possible.
    for (let currentDivisor = candidateDivisorUpperBound; currentDivisor > 1; --currentDivisor) {
        // If the current divisor candidate satisfies all conditions within the budget,
        // it is the largest such divisor. Print it and exit.
        if (validateCandidateDivisor(currentDivisor, numberSequence, budgetLimit)) {
            console.log(currentDivisor);
            return;
        }
    }

    // If the loop completes without finding any divisor greater than 1,
    // then 1 is the greatest common divisor under the given constraints.
    console.log(1);
}

/**
 * Calculates a specific "special maximum" value from a given array of numbers.
 * This involves sorting the array and iteratively balancing sums from both ends.
 *
 * @param {number[]} inputNumericalElements - The array of numbers.
 * @returns {number} The calculated special maximum. Returns 0 for empty or invalid input.
 */
function determineSpecialMaximum(inputNumericalElements) {
    if (!inputNumericalElements || inputNumericalElements.length === 0) {
        return 0; // No elements, no sum to balance.
    }

    // Create a sorted copy of the array to prevent modifying the original.
    const orderedElements = [...inputNumericalElements].sort((a, b) => a - b);

    let leftAccumulator = 0; // Sum of elements picked from the left.
    let rightAccumulator = 0; // Sum of elements picked from the right.
    let rightIndex = orderedElements.length - 1; // Pointer for the rightmost element.

    // If there's at least one element, initialize the right accumulator with the largest.
    if (rightIndex >= 0) {
        rightAccumulator = orderedElements[rightIndex];
        rightIndex--; // Move the right pointer inwards after using the element.
    } else {
        return 0; // Should not happen if previous check passed, but good for safety.
    }

    // Iterate with a left pointer, adding elements and balancing with the right pointer.
    for (let leftIndex = 0; leftIndex <= rightIndex; ++leftIndex) {
        leftAccumulator += orderedElements[leftIndex]; // Add current left element to left sum. (Bug fix from original: `i` -> `orderedElements[leftIndex]`)

        // While the left sum is greater than the right sum and there are elements
        // remaining on the right side to consider, add them to the right sum.
        while (leftAccumulator > rightAccumulator && rightIndex > leftIndex) {
            rightAccumulator += orderedElements[rightIndex];
            rightIndex--;
        }
    }

    // The result is the minimum of the two accumulated sums after this balancing process.
    return Math.min(leftAccumulator, rightAccumulator);
}

/**
 * Identifies the largest numerical value within a given collection of numbers.
 *
 * @param {number[]} numericCollection - An array of numbers.
 * @returns {number} The maximum number in the collection, or -Infinity if the collection is empty.
 */
function findLargestElement(numericCollection) {
    // For an empty collection, Math.max() without arguments returns -Infinity.
    // This is a sensible default for finding a maximum.
    if (!numericCollection || numericCollection.length === 0) {
        return -Infinity;
    }
    // Leverage the spread syntax with Math.max for a concise solution.
    return Math.max(...numericCollection);
}

/**
 * Calculates the total sum of all numbers within an array.
 *
 * @param {number[]} valueCollection - The array of numbers to sum.
 * @returns {number} The sum of all elements, or 0 if the array is empty.
 */
function calculateTotalSum(valueCollection) {
    if (!valueCollection || valueCollection.length === 0) {
        return 0; // An empty collection sums to zero.
    }
    // Use the `reduce` method for efficient summation.
    return valueCollection.reduce((currentSum, currentValue) => currentSum + currentValue, 0);
}

/**
 * Determines if a particular candidate divisor 'g' can satisfy the balancing condition
 * for all numbers in an array, given a budget 'k'.
 * It preprocesses the numbers into remainder pairs and then calls a recursive helper.
 *
 * @param {number} candidateDivisorValue - The integer 'g' to be tested as a divisor.
 * @param {number[]} inputNumbersArray - The array of numbers to apply the divisor to.
 * @param {number} maximumBudgetThreshold - The budget 'k' for balancing.
 * @returns {boolean} True if the divisor is valid, false otherwise.
 */
function validateCandidateDivisor(candidateDivisorValue, inputNumbersArray, maximumBudgetThreshold) {
    // A divisor must be a positive integer.
    if (candidateDivisorValue <= 0 || !Number.isInteger(candidateDivisorValue)) {
        return false;
    }

    const remainderPairsList = []; // Stores [cost_to_decrease, cost_to_increase] for each number.
    // The original `tempK = 2*k` suggests a dynamic budget for initial filtering.
    let dynamicRemainingBudget = maximumBudgetThreshold * 2;

    for (let index = 0; index < inputNumbersArray.length; ++index) {
        const currentNumericalValue = inputNumbersArray[index];
        const remainderWhenDivided = currentNumericalValue % candidateDivisorValue;

        // If a number is perfectly divisible, it contributes no cost and requires no balancing.
        if (remainderWhenDivided === 0) {
            continue;
        }

        // Calculate the cost to make the number a multiple of `candidateDivisorValue`.
        // Option 1: Decrease the number (cost is the remainder).
        // Option 2: Increase the number (cost is `divisor - remainder`).
        const costToDecrease = remainderWhenDivided;
        const costToIncrease = candidateDivisorValue - remainderWhenDivided;

        // The minimum cost to adjust this single number.
        const minimumAdjustmentCost = Math.min(costToDecrease, costToIncrease);

        // If the minimum cost for a single adjustment exceeds the *original* budget,
        // then this divisor is fundamentally impossible.
        if (maximumBudgetThreshold < minimumAdjustmentCost) {
            return false;
        }

        // Deduct this minimum adjustment cost from the dynamic budget.
        dynamicRemainingBudget -= minimumAdjustmentCost;

        // If the dynamic budget falls below zero, this overall path is not feasible.
        if (dynamicRemainingBudget < 0) {
            return false;
        }

        // Store the two possible costs for this number for the recursive exploration.
        remainderPairsList.push([costToDecrease, costToIncrease]);
    }

    // After initial filtering, use a recursive backtracking approach to find if
    // an exact balance (left sum === right sum) can be achieved within the original budget.
    return exploreBalancePossibilities(remainderPairsList, 0, 0, 0, maximumBudgetThreshold);
}

/**
 * A recursive helper function that explores different combinations of costs
 * (from `mod1` or `mod2` for each number) to see if the cumulative left and right sums
 * can be made equal, without exceeding the overall budget.
 *
 * @param {Array<[number, number]>} listOfRemainderPairs - Array of [cost_left, cost_right] pairs.
 * @param {number} currentPositionIndex - The index of the current pair being processed.
 * @param {number} accumulatedLeftCost - The sum of 'cost_left' choices made so far.
 * @param {number} accumulatedRightCost - The sum of 'cost_right' choices made so far.
 * @param {number} overallBudgetLimit - The maximum allowed value for either accumulated cost.
 * @returns {boolean} True if a balanced path is found, false otherwise.
 */
function exploreBalancePossibilities(listOfRemainderPairs, currentPositionIndex, accumulatedLeftCost, accumulatedRightCost, overallBudgetLimit) {
    // Pruning: If either accumulated cost already exceeds the budget, this path is invalid.
    if (accumulatedLeftCost > overallBudgetLimit || accumulatedRightCost > overallBudgetLimit) {
        return false;
    }

    // Base case: If all remainder pairs have been processed.
    // A solution is found if the final accumulated left and right costs are equal.
    if (currentPositionIndex === listOfRemainderPairs.length) {
        return accumulatedLeftCost === accumulatedRightCost;
    }

    // Get the current pair of costs (mod1 and mod2) for the number at `currentPositionIndex`.
    const [costOptionA, costOptionB] = listOfRemainderPairs[currentPositionIndex];

    // Explore two potential paths:
    // 1. Add `costOptionA` to the left sum.
    // 2. Add `costOptionB` to the right sum.

    // Introduce a heuristic: try the path that keeps the two sums closer to each other first.
    // This might lead to finding a solution faster or pruning branches earlier.
    let pathFound = false;
    if (accumulatedLeftCost + costOptionA <= accumulatedRightCost + costOptionB) {
        // Try adding costOptionA to the left sum.
        pathFound = tryPathWithFirstOption(listOfRemainderPairs, currentPositionIndex + 1, accumulatedLeftCost + costOptionA, accumulatedRightCost, overallBudgetLimit);
        if (pathFound) {
            return true; // If a solution is found, propagate true immediately.
        }
        // If the first path didn't lead to a solution, try the second path.
        pathFound = tryPathWithSecondOption(listOfRemainderPairs, currentPositionIndex + 1, accumulatedLeftCost, accumulatedRightCost + costOptionB, overallBudgetLimit);
    } else {
        // Try adding costOptionB to the right sum first.
        pathFound = tryPathWithSecondOption(listOfRemainderPairs, currentPositionIndex + 1, accumulatedLeftCost, accumulatedRightCost + costOptionB, overallBudgetLimit);
        if (pathFound) {
            return true;
        }
        // If the second path didn't work, try the first path.
        pathFound = tryPathWithFirstOption(listOfRemainderPairs, currentPositionIndex + 1, accumulatedLeftCost + costOptionA, accumulatedRightCost, overallBudgetLimit);
    }

    return pathFound; // Return the ultimate outcome of the exploration.
}

/**
 * Helper function for `exploreBalancePossibilities`:
 * Recursively explores the scenario where the 'first option' (cost to decrease, or mod1)
 * for the current number is added to the left accumulated sum.
 *
 * @param {Array<[number, number]>} pairs - List of remainder pairs.
 * @param {number} nextIdx - Index for the next recursive call.
 * @param {number} newLeftSum - Left sum after adding the current element's first option.
 * @param {number} currentRSum - Unchanged right sum.
 * @param {number} budgetMax - Overall budget limit.
 * @returns {boolean} Result of the recursive call.
 */
function tryPathWithFirstOption(pairs, nextIdx, newLeftSum, currentRSum, budgetMax) {
    return exploreBalancePossibilities(pairs, nextIdx, newLeftSum, currentRSum, budgetMax);
}

/**
 * Helper function for `exploreBalancePossibilities`:
 * Recursively explores the scenario where the 'second option' (cost to increase, or mod2)
 * for the current number is added to the right accumulated sum.
 *
 * @param {Array<[number, number]>} pairs - List of remainder pairs.
 * @param {number} nextIdx - Index for the next recursive call.
 * @param {number} currentLSum - Unchanged left sum.
 * @param {number} newRightSum - Right sum after adding the current element's second option.
 * @param {number} budgetMax - Overall budget limit.
 * @returns {boolean} Result of the recursive call.
 */
function tryPathWithSecondOption(pairs, nextIdx, currentLSum, newRightSum, budgetMax) {
    return exploreBalancePossibilities(pairs, nextIdx, currentLSum, newRightSum, budgetMax);
}

// --- Program Execution Entry Point ---
// This section handles reading input from standard input (typically /dev/stdin
// in Unix-like environments, common in competitive programming) or a specified file.
// It ensures the code is executed in a Node.js environment.

// Check if `require` and `module` are defined, indicating a Node.js environment.
// Also, avoid execution if `NODE_ENV` is 'test', allowing unit testing without file I/O.
if (typeof require !== 'undefined' && typeof module !== 'undefined' && process.env.NODE_ENV !== 'test') {
    // Dynamically import the 'fs' (file system) module, using 'node:fs' for clarity in Node.js.
    const fileSystemModule = require('node:fs');

    // Determine the input file path:
    // - If a command-line argument is provided (e.g., `node script.js input.txt`), use it.
    // - Otherwise, default to `/dev/stdin` for standard input.
    const actualInputFilePath = process.argv[2] || '/dev/stdin';

    try {
        // Read the entire file content synchronously.
        const fileContentString = fileSystemModule.readFileSync(actualInputFilePath, { encoding: 'utf8' });
        // Pass the content to the main processing function.
        processInputData(fileContentString);
    } catch (readError) {
        // Log any errors encountered during file reading.
        console.error(`Error reading input from ${actualInputFilePath}: ${readError.message}`);
        // In a real application, you might want to exit or provide a fallback.
        process.exit(1); // Exit with a non-zero code to indicate an error.
    }
}