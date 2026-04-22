"use strict";

// Helper function to safely convert a string to an integer.
// It handles cases where the input might not be a valid number string
// by returning 0, or the parsed integer value.
const convertToInteger = (inputString) => {
    const parsedValue = Number.parseInt(inputString, 10);
    // Return 0 if parsing results in NaN (Not-a-Number), otherwise return the parsed integer.
    return Number.isNaN(parsedValue) ? 0 : parsedValue;
};

// This module encapsulates functionality for reading and parsing data from an input stream.
// It's designed to handle multi-line string data, extracting various data types.
const StreamDataProcessor = (function() {
    /**
     * Factory function to create a new instance of DataStreamHandler.
     * @param {string} rawTextContent - The entire input text provided as a single string.
     * @returns {DataStreamHandler} An object capable of parsing the input text.
     */
    function createStreamHandler(rawTextContent) {
        return new DataStreamHandler(rawTextContent);
    }

    /**
     * @class DataStreamHandler
     * Manages the internal state and provides methods for sequential reading
     * and processing of lines and tokens from the input stream.
     */
    function DataStreamHandler(rawTextContent) {
        // Split the raw input content into an array of individual lines.
        // Trim whitespace from the content and filter out any empty lines that might result
        // from extra newlines or spaces.
        this.sourceLines = rawTextContent.trim().split("\n").filter(line => line.length > 0);
        // Initialize a pointer to keep track of the current line being processed.
        this.currentLinePointer = 0;
    }

    // Define the prototype methods for the DataStreamHandler class.
    DataStreamHandler.prototype = {
        /**
         * Reads and extracts a single token from the current line of the stream.
         * Tokens are assumed to be separated by one or more spaces and are processed
         * from right to left (as per the original logic: reverse then pop).
         * If the current line becomes empty after extracting a token, the pointer
         * automatically advances to the next line.
         * @param {boolean} [returnAsString=false] - If true, the token is returned as a string;
         *                                           otherwise, it's converted to a number.
         * @returns {string|number} The extracted token.
         */
        retrieveNextToken: function(returnAsString = false) {
            let lineContents = this.sourceLines[this.currentLinePointer];

            // If the current line is still a raw string, it needs to be tokenized and reversed.
            // This prepares it for efficient `pop()` operations from the logical "front" of the line.
            if (typeof lineContents === "string") {
                this.sourceLines[this.currentLinePointer] = lineContents
                                                                .split(/\s+/) // Split by one or more spaces
                                                                .filter(token => token.length > 0) // Remove empty tokens
                                                                .reverse(); // Reverse to pop from the effective "front"
            }

            let tokenArray = this.sourceLines[this.currentLinePointer];
            let extractedToken = tokenArray.pop(); // Get the last token (which was originally the first due to reverse)

            // If the token array for the current line is now empty, move to the next line.
            if (tokenArray.length === 0) {
                this.currentLinePointer++;
            }

            // Return the token, either in its original string form or as a parsed integer.
            return returnAsString ? extractedToken : convertToInteger(extractedToken);
        },

        /**
         * Reads all tokens from the current line and advances the line pointer.
         * @param {boolean} [returnAsStrings=false] - If true, tokens are returned as strings;
         *                                            otherwise, they are converted to numbers.
         * @returns {Array<string|number>} An array containing all tokens from the processed line.
         */
        readTokensFromLine: function(returnAsStrings = false) {
            // Retrieve the current line's data and then increment the line pointer.
            const lineData = this.sourceLines[this.currentLinePointer++];
            // Split the line into tokens, filter out any empty strings, and then apply type conversion.
            const tokens = lineData.split(/\s+/).filter(token => token.length > 0);
            return returnAsStrings ? tokens : tokens.map(convertToInteger);
        },

        /**
         * Reads a specified number of lines and parses them into a 2D array (matrix).
         * Each line is treated as a row in the matrix, and its contents are tokenized.
         * @param {number} numberOfLines - The count of lines to read for the matrix.
         * @param {boolean} [returnAsStrings=false] - If true, tokens are returned as strings;
         *                                            otherwise, they are converted to numbers.
         * @returns {Array<Array<string|number>>} A matrix (array of arrays) of tokens.
         */
        readMatrixData: function(numberOfLines, returnAsStrings = false) {
            // Extract the relevant lines from the source and advance the line pointer.
            const matrixRows = this.sourceLines.slice(this.currentLinePointer, this.currentLinePointer + numberOfLines);
            this.currentLinePointer += numberOfLines;

            // Process each extracted row: split it into tokens and apply type conversion.
            return matrixRows.map(row => {
                const tokens = row.split(/\s+/).filter(token => token.length > 0);
                return returnAsStrings ? tokens : tokens.map(convertToInteger);
            });
        },

        /**
         * Reads a specified number of lines, treating each line's content as a single value.
         * @param {number} numberOfLines - The count of lines to read.
         * @param {boolean} [returnAsStrings=false] - If true, lines are returned as strings;
         *                                            otherwise, they are converted to numbers.
         * @returns {Array<string|number>} An array where each element is the value from a line.
         */
        readLinesAsSingleValues: function(numberOfLines, returnAsStrings = false) {
            // Extract the raw lines and advance the line pointer.
            const rawLines = this.sourceLines.slice(this.currentLinePointer, this.currentLinePointer + numberOfLines);
            this.currentLinePointer += numberOfLines;
            // Return raw strings or convert them to numbers.
            return returnAsStrings ? rawLines : rawLines.map(convertToInteger);
        }
    };

    return createStreamHandler;
})();

// Initialize the input data parser.
// It reads the entire content of standard input (`/dev/stdin`) as a UTF-8 string.
const inputParser = StreamDataProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// Define a constant for the fixed number of items (3) involved in the problem's initial filtering steps.
const NUMBER_OF_FIXED_ITEMS = 3;

/**
 * Main function to orchestrate the problem-solving logic.
 * It reads initial parameters, applies a two-phase item selection and optimization process,
 * and returns the final calculated optimal value.
 * @returns {number} The ultimate optimal resource value determined by the problem's logic.
 */
function processProblemSolution() {
    // Read the initial total capacity or resource amount from the input stream.
    let initialResourceAmount = inputParser.retrieveNextToken();
    // Read the first array of values (e.g., costs) from a line.
    const costsArrayOne = inputParser.readTokensFromLine();
    // Read the second array of values (e.g., benefits) from a line.
    const benefitsArrayOne = inputParser.readTokensFromLine();

    // --- Phase 1: Identify and collect items where `costsArrayOne[i]` is less than `benefitsArrayOne[i]`. ---
    // These items represent opportunities where acquiring them directly increases the resource.
    let phaseOneCosts = [];
    let phaseOneBenefits = [];
    for (let currentIdx = 0; currentIdx < NUMBER_OF_FIXED_ITEMS; currentIdx++) {
        if (costsArrayOne[currentIdx] < benefitsArrayOne[currentIdx]) {
            phaseOneCosts.push(costsArrayOne[currentIdx]);
            phaseOneBenefits.push(benefitsArrayOne[currentIdx]);
        }
    }

    // Calculate the intermediate optimal resource value by applying the first set of profitable items.
    let intermediateOptimalValue = findOptimalResourceValue(initialResourceAmount, phaseOneCosts, phaseOneBenefits);

    // --- Phase 2: Identify and collect items where `benefitsArrayOne[i]` is less than `costsArrayOne[i]`. ---
    // These items represent a different set of opportunities. The 'cost' for this phase
    // is the 'benefit' from the original array, and the 'benefit' for this phase is the 'cost' from the original.
    // This effectively swaps roles for items that were 'unprofitable' in the first sense.
    let phaseTwoCosts = [];
    let phaseTwoBenefits = [];
    for (let currentIdx = 0; currentIdx < NUMBER_OF_FIXED_ITEMS; currentIdx++) {
        if (benefitsArrayOne[currentIdx] < costsArrayOne[currentIdx]) {
            // For phase 2, the 'cost' is the original benefit, and the 'benefit' is the original cost.
            phaseTwoCosts.push(benefitsArrayOne[currentIdx]);
            phaseTwoBenefits.push(costsArrayOne[currentIdx]);
        }
    }

    // Calculate the final optimal resource value using the intermediate result and the second set of items.
    return findOptimalResourceValue(intermediateOptimalValue, phaseTwoCosts, phaseTwoBenefits);
}

/**
 * Calculates the maximum attainable resource value using a dynamic programming approach.
 * This function solves a problem similar to the unbounded knapsack or change-making problem,
 * aiming to maximize a resource by 'trading' items (cost for benefit).
 * @param {number} currentResourceCapacity - The initial amount of resource available.
 * @param {Array<number>} itemCosts - An array containing the cost of each item.
 * @param {Array<number>} itemBenefits - An array containing the benefit gained from each item.
 * @returns {number} The maximum resource value that can be achieved.
 */
function findOptimalResourceValue(currentResourceCapacity, itemCosts, itemBenefits) {
    const numberOfAvailableItems = itemCosts.length;

    // Guard clause: If there are no items to consider for trade, the resource remains unchanged.
    if (numberOfAvailableItems === 0) {
        return currentResourceCapacity;
    }

    // Special optimization for the case where only a single item is available.
    // This avoids the overhead of creating a large DP table for a simple calculation.
    if (numberOfAvailableItems === 1) {
        const singleItemCost = itemCosts[0];
        const singleItemBenefit = itemBenefits[0];
        const netResourceChangePerItem = singleItemBenefit - singleItemCost;

        // Handle edge cases for item cost:
        if (singleItemCost <= 0) {
            // If an item has zero or negative cost and yields a positive benefit,
            // it implies infinite potential profit.
            if (netResourceChangePerItem > 0) {
                return Number.MAX_SAFE_INTEGER; // Return a very large number to signify infinite gain.
            }
            // If cost is non-positive but benefit is also non-positive or zero, no gain is possible,
            // so resource remains as is.
            return currentResourceCapacity;
        }

        // Calculate how many times the single item can be "purchased" or traded.
        const numTransactions = Math.floor(currentResourceCapacity / singleItemCost);
        // Update the resource capacity by subtracting total cost and adding total benefit.
        currentResourceCapacity += numTransactions * netResourceChangePerItem;
        return currentResourceCapacity;
    }

    // Dynamic Programming approach for multiple items.
    // `memoizationTable[j]` will store the maximum resource value achievable if we
    // have 'spent' exactly `j` units of resource (i.e., sum of costs of chosen items is `j`).
    // Initialize all states to -1, indicating they are unreachable or not yet calculated.
    // The size of the table is `currentResourceCapacity + 1` to include capacity 0 up to `currentResourceCapacity`.
    const memoizationTable = Array.from({ length: currentResourceCapacity + 1 }, () => -1);
    // Base case: Spending 0 units means the resource is still at its initial capacity.
    memoizationTable[0] = currentResourceCapacity;

    // Iterate through each available item.
    for (let itemIndex = 0; itemIndex < numberOfAvailableItems; itemIndex++) {
        const itemCost = itemCosts[itemIndex];
        const itemBenefit = itemBenefits[itemIndex];
        const netChange = itemBenefit - itemCost; // The net change in resource if this item is traded.

        // Iterate through possible 'spent' sums (`currentSpentSum`) from `itemCost` up to `currentResourceCapacity`.
        // This inner loop structure is characteristic of an unbounded knapsack problem,
        // allowing items to be taken multiple times.
        for (let currentSpentSum = itemCost; currentSpentSum <= currentResourceCapacity; currentSpentSum++) {
            // Check if the state `currentSpentSum - itemCost` was previously reachable.
            // If `memoizationTable[currentSpentSum - itemCost]` is -1, it means that state
            // cannot be reached, so we cannot use this item to reach `currentSpentSum`.
            if (memoizationTable[currentSpentSum - itemCost] !== -1) {
                // Calculate the potential new resource value if we take the current item.
                // This is the resource value from the previous state plus the net change from this item.
                const potentialNewResourceValue = memoizationTable[currentSpentSum - itemCost] + netChange;

                // Update the `memoizationTable` if this new path yields a better (higher) resource value
                // or if the current state (`currentSpentSum`) was previously unreachable (-1).
                if (memoizationTable[currentSpentSum] === -1 || potentialNewResourceValue > memoizationTable[currentSpentSum]) {
                    memoizationTable[currentSpentSum] = potentialNewResourceValue;
                }
            }
        }
    }

    // After the DP table is fully populated, we need to find the maximum resource value
    // among all reachable states. The original problem uses a heuristic search window.
    // Let's define this window size explicitly.
    const SEARCH_WINDOW_SIZE = 5000;
    // Initialize the maximum attained resource with the initial capacity, as it's a baseline.
    let maximumAttainedResource = currentResourceCapacity;

    // Determine the starting index for our search window. It should not go below 0.
    const searchStartIndex = Math.max(0, currentResourceCapacity - SEARCH_WINDOW_SIZE);

    // Iterate through the determined search window in the `memoizationTable`.
    // We are looking for the highest `final resource value` stored in `memoizationTable[j]`.
    for (let currentSumIndex = searchStartIndex; currentSumIndex <= currentResourceCapacity; currentSumIndex++) {
        // Only consider states that were actually reachable (not -1).
        if (memoizationTable[currentSumIndex] !== -1) {
            maximumAttainedResource = Math.max(maximumAttainedResource, memoizationTable[currentSumIndex]);
        }
    }

    return maximumAttainedResource;
}

// Execute the main problem-solving logic and print the final result to the console.
console.log(processProblemSolution());