"use strict";

// This section handles reading input data from standard input.
// It is designed to be robust against various input formats and potential errors.

// Node.js file system module for reading files.
const fileSystem = require("fs");

// Reads the entire content of standard input, assuming UTF-8 encoding.
let rawInputData = fileSystem.readFileSync("/dev/stdin", "utf8");

// --- Input Validation: Check for empty or whitespace-only input ---
if (!rawInputData || rawInputData.trim().length === 0) {
    console.error("Error: The input stream is empty or contains only whitespace characters. Please provide valid input.");
    // Exits the process with a non-zero code to signal an error.
    process.exit(1);
}

// Splits the raw input string into an array of tokens.
// It uses a regular expression `\s+` to split by any sequence of whitespace characters (space, tab, newline, etc.).
let tokenizedInputBuffer = rawInputData.trim().split(/\s+/);

// An index to keep track of the current position in the `tokenizedInputBuffer`.
let currentTokenIndex = 0;

/**
 * Retrieves the next numerical token from the global input buffer.
 * It advances the `currentTokenIndex` after reading.
 * This function includes error handling for exhausted buffers and non-numeric tokens.
 *
 * @returns {number} The parsed numerical value of the next token.
 * @throws {Error} If the input buffer runs out of tokens or if a token cannot be parsed as a number.
 */
function getNextParsedValue() {
    // Guard clause: Check if there are any tokens left to read.
    if (currentTokenIndex >= tokenizedInputBuffer.length) {
        throw new Error("Input Buffer Exhaustion: Attempted to read beyond the end of the available input tokens.");
    }

    // Extract the current token string and then increment the index for the next call.
    const tokenString = tokenizedInputBuffer[currentTokenIndex++];
    const parsedNumber = Number(tokenString); // Attempt to convert the string token to a number.

    // Validation: Check if the conversion resulted in a valid number.
    if (isNaN(parsedNumber)) {
        throw new Error(`Input Parsing Error: The token '${tokenString}' could not be converted into a valid number.`);
    }

    return parsedNumber;
}

// The original utility functions `nexts` and `nextm` were not utilized by the main logic.
// As a Type III clone modification (deletion of non-essential fragments), they have been removed
// to simplify the codebase and focus on the problem's core requirements.

/**
 * A recursive helper function to initialize a multi-dimensional array
 * with a specified default value across all its elements.
 * This function is a safer and more readable alternative to the original `eval`-based `xArray`.
 *
 * @param {*} initialVal - The default value to fill all array elements with.
 * @param {...number} dimensions - A sequence of numbers representing the size of each dimension.
 * @returns {Array} A newly created multi-dimensional array initialized with `initialVal`.
 */
function initializeMultiDimArray(initialVal, ...dimensions) {
    // Base case for the recursion: If no more dimensions are specified, return the initial value.
    if (dimensions.length === 0) {
        return initialVal;
    }

    // Extract the size of the current dimension from the list of dimensions.
    const currentDimensionSize = dimensions[0];
    // Prepare the remaining dimensions for the next level of recursion.
    const remainingDimensions = dimensions.slice(1);

    // Create a new array for the current dimension.
    const newDimensionArray = new Array(currentDimensionSize);

    // Populate the current dimension by recursively calling `initializeMultiDimArray`
    // for each element, creating the next level of the multi-dimensional structure.
    for (let k = 0; k < currentDimensionSize; k++) {
        newDimensionArray[k] = initializeMultiDimArray(initialVal, ...remainingDimensions);
    }

    return newDimensionArray;
}

/**
 * Main function that solves the problem using dynamic programming.
 * It calculates the maximum possible score by optimally arranging a sequence of items.
 *
 * @returns {number} The maximum computed score.
 */
function calculateOptimalScore() {
    // Read the total number of elements (N) from the input.
    const totalElementsCount = getNextParsedValue();

    // --- Input Validation: Handle edge cases and invalid `totalElementsCount` ---
    if (totalElementsCount < 0) {
        console.error("Runtime Error: The total number of elements (N) cannot be a negative value.");
        process.exit(1);
    }
    if (totalElementsCount === 0) {
        // If there are no elements, the maximum score is trivially zero.
        return 0;
    }

    // Create an array of objects to store each item's score and its original index.
    // Using `Array.from` provides a cleaner, more functional way to populate the array.
    const itemsWithOriginalPositions = Array.from({ length: totalElementsCount }, (_, initialOrderingIndex) => {
        const itemValue = getNextParsedValue(); // Read the score for the current item.
        // Additional validation for `itemValue` could be added here if specific constraints are known (e.g., non-negative scores).
        return { score: itemValue, initialPosition: initialOrderingIndex };
    });

    // Sort the items in descending order based on their `score`.
    // This sorting step is critical as the dynamic programming approach relies on processing items by their value.
    itemsWithOriginalPositions.sort((itemAlpha, itemBeta) => itemBeta.score - itemAlpha.score);

    // Initialize the dynamic programming table.
    // `dynamicProgrammingTable[k]` will store the maximum score achievable for a subproblem of size `k`.
    // It is initialized with zeros using the custom `initializeMultiDimArray` helper.
    const dynamicProgrammingTable = initializeMultiDimArray(0, totalElementsCount + 1);

    // --- Core Dynamic Programming Loop ---
    // Iterate through each item in the sorted list.
    for (let currentSortedItemIndex = 0; currentSortedItemIndex < totalElementsCount; currentSortedItemIndex++) {
        const currentItem = itemsWithOriginalPositions[currentSortedItemIndex];
        const itemScore = currentItem.score;
        const itemOriginalPosition = currentItem.initialPosition; // The position of this item in the *original* unsorted sequence.

        // --- DP Update Rule 1: Placing the current item at the end of a sub-sequence ---
        // This updates `dynamicProgrammingTable[currentSortedItemIndex + 1]`.
        // It represents considering the current item as the (currentSortedItemIndex + 1)-th item in the final arrangement.
        // The `costFactorForRightPlacement` determines the contribution of the current item to the score.
        const positionAfterPlacement = totalElementsCount - currentSortedItemIndex - 1;
        const costFactorForRightPlacement = positionAfterPlacement - itemOriginalPosition;
        
        dynamicProgrammingTable[currentSortedItemIndex + 1] = 
            dynamicProgrammingTable[currentSortedItemIndex] + costFactorForRightPlacement * itemScore;

        // --- DP Update Rule 2: Inserting the current item within an existing sub-sequence ---
        // This nested loop iterates backward, considering subproblems of decreasing size.
        // `subproblemSize` represents the number of items considered so far in the sub-arrangement.
        // The original loop `for(var j = i; j; j--)` is rephrased as `for (let subproblemSize = currentSortedItemIndex; subproblemSize > 0; subproblemSize--)`
        // for better readability and explicit condition.
        for (let subproblemSize = currentSortedItemIndex; subproblemSize > 0; subproblemSize--) {
            // Calculate the impact of placing the current item at a particular position within the `subproblemSize` arrangement.
            // `effectiveOriginalPositionOffset` captures the relative change in position.
            const effectiveOriginalPositionOffset = itemOriginalPosition - (currentSortedItemIndex - subproblemSize);
            dynamicProgrammingTable[subproblemSize] += effectiveOriginalPositionOffset * itemScore;

            // Consider an alternative state transition:
            // Calculate a `candidateScore` by taking the previous subproblem state (`subproblemSize - 1`)
            // and then placing the current item to its right.
            const remainingElementsCount = totalElementsCount - subproblemSize;
            const candidateScoreFromPreviousState = 
                dynamicProgrammingTable[subproblemSize - 1] + (remainingElementsCount - itemOriginalPosition) * itemScore;
            
            // Update `dynamicProgrammingTable[subproblemSize]` with the maximum of its current value
            // and the `candidateScore` from the previous state.
            dynamicProgrammingTable[subproblemSize] = 
                Math.max(dynamicProgrammingTable[subproblemSize], candidateScoreFromPreviousState);
        }

        // --- DP Update Rule 3: Placing the current item at the very beginning of the sequence ---
        // This specifically updates `dynamicProgrammingTable[0]`.
        // `initialPlacementOffset` calculates the cost contribution for this specific placement.
        const initialPlacementOffset = itemOriginalPosition - currentSortedItemIndex;
        dynamicProgrammingTable[0] += initialPlacementOffset * itemScore;
    }

    // After iterating through all items and updating the DP table,
    // the maximum value within the `dynamicProgrammingTable` represents the overall optimal score.
    return Math.max(...dynamicProgrammingTable);
}

// Execute the main calculation function to get the final result.
const finalComputedResult = calculateOptimalScore();

// Output the computed result to the console.
// The original `if (myOut !== undefined)` check is removed because `calculateOptimalScore`
// is designed to always return a number, or exit the process on critical errors.
console.log(finalComputedResult);