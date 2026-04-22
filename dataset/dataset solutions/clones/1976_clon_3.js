"use strict";

// Helper for reading input synchronously, mimicking fs.readFileSync
const acquireInputData = require("fs").readFileSync;

/**
 * @class InputProcessor
 * @description Utility class for processing input tokens from a string.
 * It handles splitting the input and providing tokens one by one,
 * with optional type conversion and basic error handling.
 */
class InputProcessor {
    /**
     * @param {string} inputString The raw input string to process.
     */
    constructor(inputString) {
        // Split input by space or newline characters.
        // The filter ensures that any empty strings resulting from multiple delimiters
        // or leading/trailing delimiters are removed.
        this.dataTokens = inputString.split(/ |\n/).filter(s => s !== '');
        this.tokenPointer = 0; // Initializes the cursor to the first token.
    }

    /**
     * Retrieves the next token from the input stream.
     * @param {boolean} [asString=false] If true, returns the token as a string; otherwise, attempts to parse it as an integer.
     * @returns {string|number} The next token, either as a string or an integer.
     */
    retrieveNext(asString = false) {
        // Check if the token pointer has exceeded the bounds of the dataTokens array.
        if (this.tokenPointer >= this.dataTokens.length) {
            // Log a warning and return a default value to prevent crashes,
            // as this indicates an attempt to read beyond available input.
            console.error("Warning: Attempted to read past the end of the input stream. Returning default value.");
            return asString ? "" : 0;
        }

        // Get the current token and advance the pointer.
        const tokenValue = this.dataTokens[this.tokenPointer++];

        if (asString) {
            return tokenValue;
        } else {
            // Attempt to parse the token as an integer.
            const parsedNum = parseInt(tokenValue, 10);
            // If parsing fails (e.g., token is not a valid number), log a warning
            // and return 0, which might be a sensible default in competitive programming.
            if (isNaN(parsedNum)) {
                console.error(`Warning: Input token '${tokenValue}' could not be parsed as an integer. Returning 0.`);
                return 0;
            }
            return parsedNum;
        }
    }
}

// Read the entire raw input content from standard input (typically "/dev/stdin" in competitive programming environments).
const rawInputContent = acquireInputData("/dev/stdin", "utf8");
// Initialize the InputProcessor with the raw content to manage token retrieval.
const dataStream = new InputProcessor(rawInputContent);

// A common modulo constant used in many programming challenges,
// though it is not utilized in the core logic of this specific problem.
const calculationModulus = 1000000007; // Represents 10^9 + 7

/**
 * @function performMainCalculation
 * @description This is the core algorithm function. It reads a sequence of numbers,
 * partitions them into two subgroups, sorts these subgroups in specific ways,
 * and calculates a weighted sum based on their values and original positions.
 * The goal is to find the maximum possible weighted sum across all valid partitions.
 *
 * The problem constraints involve 'position shifts':
 * - For elements in the right subgroup (sorted descending), their original index
 *   must be greater than or equal to their new index within that subgroup.
 * - For elements in the left subgroup (sorted ascending), their new index
 *   (considering the right subgroup's size) must be greater than or equal to
 *   their original index.
 * If any of these conditions are violated, the partition is deemed invalid.
 *
 * @returns {number} The highest valid score found.
 */
function performMainCalculation() {
    // Read the total number of elements that will follow in the input.
    const totalElementsCount = dataStream.retrieveNext();

    // Implement a guard clause for edge cases where the number of elements is non-positive.
    // In such scenarios, no calculation is possible, so the score is 0.
    if (totalElementsCount <= 0) {
        return 0;
    }

    // Initialize an array to store the input items.
    // Each item is stored as an object containing its numerical value and its initial zero-based index.
    const originalItems = [];
    for (let currentIdx = 0; currentIdx < totalElementsCount; currentIdx++) {
        const itemValue = dataStream.retrieveNext();
        originalItems.push({ value: itemValue, originalIndex: currentIdx });
    }

    let maximumAchievableScore = 0; // This variable will track the highest score found across all partitions.

    // Iterate through all possible partition points.
    // 'partitionIndex' represents the number of elements that will be in the 'leftSubgroup'.
    // It ranges from 1 (left subgroup has 1 element) to totalElementsCount - 1 (left subgroup has N-1 elements).
    for (let partitionIndex = 1; partitionIndex < totalElementsCount; partitionIndex++) {
        // Create the left subgroup: elements from the beginning up to 'partitionIndex - 1'.
        const leftSubgroup = originalItems.slice(0, partitionIndex);
        // Create the right subgroup: elements from 'partitionIndex' to the end of the array.
        const rightSubgroup = originalItems.slice(partitionIndex);

        // Sort the left subgroup by their 'value' in ascending order.
        leftSubgroup.sort((itemA, itemB) => itemA.value - itemB.value);
        // Sort the right subgroup by their 'value' in descending order.
        rightSubgroup.sort((itemA, itemB) => itemB.value - itemA.value);

        let currentIterationScore = 0; // Accumulates the score for the current partition configuration.
        let isConfigurationValid = true; // A boolean flag to determine if the current partition meets all conditions.

        const rightSubgroupSize = rightSubgroup.length;
        const leftSubgroupSize = leftSubgroup.length;

        // Process elements in the right subgroup.
        // For each element, calculate a 'positionShift' and add to the score if valid.
        for (let elementPosInRight = 0; elementPosInRight < rightSubgroupSize; elementPosInRight++) {
            const currentRightItem = rightSubgroup[elementPosInRight];
            // The position shift for the right subgroup is (original index - new index within subgroup).
            // A negative shift indicates an invalid configuration.
            const positionShift = currentRightItem.originalIndex - elementPosInRight;

            if (positionShift < 0) {
                isConfigurationValid = false; // Mark this partition as invalid.
                break; // No need to continue processing this right subgroup.
            }
            // Add the product of position shift and item value to the current score.
            currentIterationScore += positionShift * currentRightItem.value;
        }

        // Only if the right subgroup processing was valid, proceed with the left subgroup.
        if (isConfigurationValid) {
            // Process elements in the left subgroup.
            for (let elementPosInLeft = 0; elementPosInLeft < leftSubgroupSize; elementPosInLeft++) {
                const currentLeftItem = leftSubgroup[elementPosInLeft];
                // The new combined index for a left subgroup item is its position within the left subgroup
                // plus the total number of elements in the right subgroup (which precede it).
                const newCombinedIndex = elementPosInLeft + rightSubgroupSize;
                // The position shift for the left subgroup is (new combined index - original index).
                // A negative shift indicates an invalid configuration.
                const positionShift = newCombinedIndex - currentLeftItem.originalIndex;

                if (positionShift < 0) {
                    isConfigurationValid = false; // Mark this partition as invalid.
                    break; // No need to continue processing this left subgroup.
                }
                // Add the product of position shift and item value to the current score.
                currentIterationScore += positionShift * currentLeftItem.value;
            }
        }

        // After processing both subgroups (if valid), check if this partition's score
        // is higher than the maximum score found so far.
        if (isConfigurationValid && currentIterationScore > maximumAchievableScore) {
            maximumAchievableScore = currentIterationScore; // Update the maximum score.
        }
    }

    return maximumAchievableScore; // Return the overall maximum score.
}

// Execute the main calculation function and store its result.
const programOutput = performMainCalculation();

// If the main calculation returned a defined value, print it to the console.
// This decouples the core logic from the final output mechanism.
if (programOutput !== undefined) {
    console.log(programOutput);
}