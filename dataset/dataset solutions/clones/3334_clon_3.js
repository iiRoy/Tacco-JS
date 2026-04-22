function solveGameProblem(problemDataString) {
    // Step 1: Parse the raw input string into structured data.
    // This involves splitting by newlines and then by spaces for individual values.
    const processedInputLines = problemDataString.trim().split("\n");

    // Extract the total number of elements from the first line.
    // Renamed 'N' to 'totalElementsCount' for clarity.
    const totalElementsCount = parseInt(processedInputLines[0].split(" ")[0], 10);

    // Extract the array of item scores from the second line.
    // Renamed 'a' to 'arrayOfItemScores'.
    const arrayOfItemScores = processedInputLines[1].split(" ").map(scoreString => parseInt(scoreString, 10));

    // Type III Addition: Implement a basic validation check.
    // Ensure the declared count matches the actual number of parsed scores.
    if (arrayOfItemScores.length !== totalElementsCount) {
        console.error("Input Error: Declared number of elements does not match the provided array length.");
        // Depending on context, might throw an error or exit. For this problem, a simple return is sufficient.
        return;
    }

    // Type III Update: Initialize the memoization table (DP cache).
    // Renamed 'kukanDP' to 'scoreCacheTable'.
    // Changed initialization from Array.from to a traditional loop for structural variation.
    const scoreCacheTable = [];
    for (let i = 0; i < totalElementsCount; i++) {
        // Type III Update: Initialize inner arrays with 'undefined' instead of empty arrays or null.
        scoreCacheTable.push(new Array(totalElementsCount).fill(undefined));
    }

    // Call the core dynamic programming function to find the maximum possible score.
    // Renamed 'DP' to 'computeOptimalGameScore'.
    const finalCalculatedScore = computeOptimalGameScore(0, totalElementsCount - 1, arrayOfItemScores, scoreCacheTable);

    // Output the final computed score.
    console.log(finalCalculatedScore);
}

/**
 * Computes the optimal score for a sub-range of elements using dynamic programming.
 * This function models a game where two players alternately pick elements from either end of an array,
 * aiming to maximize their own score (current element's value minus opponent's optimal score from remaining).
 *
 * @param {number} currentLeftIndex - The starting index of the current sub-range.
 * @param {number} currentRightIndex - The ending index of the current sub-range.
 * @param {number[]} elementValues - The array containing the scores/values of all elements.
 * @param {Array<Array<number|undefined>>} memoizationTable - A 2D array used for caching computed scores.
 * @returns {number} The maximum possible score for the current sub-range.
 */
function computeOptimalGameScore(currentLeftIndex, currentRightIndex, elementValues, memoizationTable) {
    // Type III Update: Check memoization table for pre-computed results.
    // Changed '!= null' to '!== undefined' for strict type checking on cached values.
    if (memoizationTable[currentLeftIndex][currentRightIndex] !== undefined) {
        return memoizationTable[currentLeftIndex][currentRightIndex];
    }

    // Type III Addition: Guard clause for an invalid range (left index greater than right index).
    // This scenario should ideally not occur with correct caller logic but provides robustness.
    if (currentLeftIndex > currentRightIndex) {
        // If the range is invalid, it contributes nothing to the score.
        return 0;
    }

    // Base case: If only one element remains in the sub-range.
    // The player picks this element, and its value is the score for this range.
    if (currentLeftIndex === currentRightIndex) {
        const singleElementScore = elementValues[currentLeftIndex];
        memoizationTable[currentLeftIndex][currentRightIndex] = singleElementScore;
        return singleElementScore;
    }

    // Type III Deletion/Update: The original code had a specific base case for 'r === l + 1'.
    // This case is now implicitly handled by the general recursive step below,
    // as Math.max(A-B, B-A) is equivalent to Math.abs(A-B). This simplifies the logic.

    // Recursive step: For ranges with two or more elements.
    // The current player has two choices:
    // 1. Pick the element at 'currentLeftIndex'.
    // 2. Pick the element at 'currentRightIndex'.

    // Type III Addition: Introduce helper variables for clarity.
    const valueOfLeftmostElement = elementValues[currentLeftIndex];
    const valueOfRightmostElement = elementValues[currentRightIndex];

    // Option A: Player picks the leftmost element.
    // The score obtained is the value of the chosen element minus the opponent's optimal score
    // from the remaining sub-range (currentLeftIndex + 1 to currentRightIndex).
    // Renamed 'tmp1' to 'scoreIfLeftIsChosen'.
    const scoreIfLeftIsChosen = valueOfLeftmostElement - computeOptimalGameScore(currentLeftIndex + 1, currentRightIndex, elementValues, memoizationTable);

    // Option B: Player picks the rightmost element.
    // The score obtained is the value of the chosen element minus the opponent's optimal score
    // from the remaining sub-range (currentLeftIndex to currentRightIndex - 1).
    // Renamed 'tmp2' to 'scoreIfRightIsChosen'.
    const scoreIfRightIsChosen = valueOfRightmostElement - computeOptimalGameScore(currentLeftIndex, currentRightIndex - 1, elementValues, memoizationTable);

    // The current player will choose the option that maximizes their own score.
    // Type III Addition: Store result in a temporary variable before caching.
    const maximumAchievableScoreForRange = Math.max(scoreIfLeftIsChosen, scoreIfRightIsChosen);

    // Cache the computed maximum score for the current sub-range.
    memoizationTable[currentLeftIndex][currentRightIndex] = maximumAchievableScoreForRange;

    // Return the optimal score for this range.
    return maximumAchievableScoreForRange;
}

// Type III Update: Moved the input reading and main function call outside for better separation of concerns.
const rawInputFromFile = require("fs").readFileSync("/dev/stdin", "utf8");
solveGameProblem(rawInputFromFile);