"use strict";

// --- Global Input/Output Utilities ---

/**
 * A utility class for efficient reading of input tokens from a string source.
 * It handles tokenizing the input and provides methods to parse different data types.
 */
class InputProcessor {
    /**
     * @private
     * @type {string[]} Stores all input tokens after splitting.
     */
    #tokens;
    /**
     * @private
     * @type {number} Current index in the tokens array.
     */
    #currentIndex;

    /**
     * Initializes the InputProcessor with raw input string.
     * @param {string} sourceString - The raw input string, typically read from stdin.
     */
    constructor(sourceString) {
        // Split by whitespace (space, tab, newline, carriage return) to tokenize the input.
        this.#tokens = sourceString.split(/\s+/);
        this.#currentIndex = 0;
    }

    /**
     * Reads and returns the next token as an integer.
     * @returns {number} The parsed integer value.
     */
    readInt() {
        return parseInt(this.#tokens[this.#currentIndex++], 10);
    }

    /**
     * Reads and returns the next token as a string.
     * @returns {string} The string token.
     */
    readString() {
        return this.#tokens[this.#currentIndex++];
    }

    /**
     * Reads and returns the next token as a BigInt.
     * @returns {BigInt} The parsed BigInt value.
     */
    readBigInt() {
        return BigInt(this.#tokens[this.#currentIndex++]);
    }

    /**
     * Reads a specified number of tokens and returns them as an array of integers.
     * @param {number} count - The number of integers to read.
     * @returns {number[]} An array containing the parsed integers.
     */
    readIntArray(count) {
        const result = new Array(count);
        for (let i = 0; i < count; ++i) {
            result[i] = this.readInt();
        }
        return result;
    }

    /**
     * Reads a 2D matrix (array of arrays) of integers or strings.
     * @param {number} rows - The number of rows in the matrix.
     * @param {number} columns - The number of columns in each row.
     * @param {boolean} [asStrings=false] - If true, reads tokens as strings; otherwise, as integers.
     * @returns {Array<Array<number|string>>} The parsed matrix.
     */
    readMatrix(rows, columns, asStrings = false) {
        const matrix = new Array(rows);
        for (let r = 0; r < rows; ++r) {
            const row = new Array(columns);
            for (let c = 0; c < columns; ++c) {
                row[c] = asStrings ? this.readString() : this.readInt();
            }
            matrix[r] = row;
        }
        return matrix;
    }
}

// Initialize the input processor by reading all data from stdin.
const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
const inputHandler = new InputProcessor(rawInputContent);

// --- Constants for Problem Parameters ---

/**
 * The maximum allowed weight for any knapsack combination.
 * This corresponds to the `1e5` magic number in the original code.
 * @type {number}
 */
const MAXIMUM_BAG_WEIGHT = 100000;

/**
 * The bit length threshold used to divide the problem into "small N" and "large N" cases.
 * Item counts less than 2^SMALL_PROBLEM_BIT_THRESHOLD are pre-calculated.
 * This corresponds to the `aa = 11` magic number in the original code.
 * @type {number}
 */
const SMALL_PROBLEM_BIT_THRESHOLD = 11;

// --- Utility Functions for Logic ---

/**
 * Computes the floor of log base 2 for a positive integer.
 * This is optimized using `Math.clz32` (Count Leading Zeros 32-bit).
 * For example, `getLog2Floor(1)` is 0, `getLog2Floor(2)` is 1, `getLog2Floor(3)` is 1, `getLog2Floor(4)` is 2.
 * @param {number} value - The number for which to calculate log2 floor (must be > 0).
 * @returns {number} The largest integer `k` such that `2^k <= value`.
 */
function getLog2FloorValue(value) {
    if (value <= 0) {
        // Logarithm is undefined or negative for non-positive numbers.
        // In competitive programming, input constraints usually guarantee positive values.
        return -1; // Or throw an error for invalid input.
    }
    return 31 - Math.clz32(value);
}

/**
 * Filters a list of knapsack states (represented as [value, weight] pairs)
 * to keep only non-dominated states. A state (v1, w1) dominates (v2, w2)
 * if v1 >= v2 and w1 <= w2. The input array is assumed to be sorted by weight.
 *
 * @param {Array<Array<number>>} candidateStates - An array of [value, weight] pairs, sorted by weight.
 * @returns {Array<Array<number>>} A new array containing only the non-dominated states.
 */
function retainNonDominatedStates(candidateStates) {
    if (candidateStates.length === 0) {
        return [];
    }

    const filteredList = [];
    let currentMaxAchievedValue = -1; // Tracks the maximum value seen for current or lesser weight.

    for (let i = 0; i < candidateStates.length; ++i) {
        const [value, weight] = candidateStates[i];
        // If the current state offers a strictly higher value than any previously
        // encountered state (for an equal or lesser weight, due to sorting), it's non-dominated.
        if (value > currentMaxAchievedValue) {
            filteredList.push([value, weight]);
            currentMaxAchievedValue = value;
        }
    }
    return filteredList;
}

// --- Main Problem Solving Logic ---

/**
 * Implements the core logic to solve the knapsack problem with multiple queries
 * using a "meet-in-the-middle" or "binary lifting" dynamic programming approach.
 *
 * @returns {string} A newline-separated string of the maximum achievable values for each query.
 */
function executeKnapsackSolver() {
    const totalItemsCount = inputHandler.readInt();
    // Each item is stored as an array: `[itemValue, itemWeight]`
    const allItemsData = inputHandler.readMatrix(totalItemsCount, 2);

    // Phase 1: Pre-calculate combinations for "small" N values.
    // This builds up combinations for prefixes of items using a binary tree-like structure.
    // `smallNPrefixCombinations[i]` stores the filtered list of [value, weight] pairs
    // for the first `(i + 1)` items.
    const maxSmallNItems = Math.min(totalItemsCount, 1 << SMALL_PROBLEM_BIT_THRESHOLD);
    const smallNPrefixCombinations = new Array(maxSmallNItems);

    // Base case: For the first item (index 0).
    if (maxSmallNItems > 0) {
        smallNPrefixCombinations[0] = [[allItemsData[0][0], allItemsData[0][1]]];
    }

    // Iteratively build `smallNPrefixCombinations` for subsequent items.
    // `currentProcessIdx` represents the 0-indexed count of items (i.e., for `currentProcessIdx + 1` items).
    for (let currentProcessIdx = 1; currentProcessIdx < maxSmallNItems; ++currentProcessIdx) {
        // `parentIdx` refers to the index of the "left child" in the implicit binary tree structure,
        // effectively `floor((currentProcessIdx - 1) / 2)`.
        const parentIdx = Math.floor((currentProcessIdx - 1) / 2);

        // Start with all combinations from the parent node.
        let currentCandidateCombos = [...smallNPrefixCombinations[parentIdx]];

        // The item corresponding to the current processing index.
        const currentItemToAdd = allItemsData[currentProcessIdx];

        // Generate new combinations by adding `currentItemToAdd` to each existing combination
        // from `smallNPrefixCombinations[parentIdx]`.
        const initialParentCombosSize = smallNPrefixCombinations[parentIdx].length;
        for (let comboIteration = 0; comboIteration < initialParentCombosSize; ++comboIteration) {
            const [previousValue, previousWeight] = smallNPrefixCombinations[parentIdx][comboIteration];
            const newValue = previousValue + currentItemToAdd[0];
            const newWeight = previousWeight + currentItemToAdd[1];

            // Only add if the new weight is within the maximum allowed.
            if (newWeight <= MAXIMUM_BAG_WEIGHT) {
                currentCandidateCombos.push([newValue, newWeight]);
            }
        }

        // Also add the `currentItemToAdd` itself as a standalone combination.
        currentCandidateCombos.push([currentItemToAdd[0], currentItemToAdd[1]]);

        // Sort the candidate combinations by weight in ascending order.
        currentCandidateCombos.sort((a, b) => a[1] - b[1]);

        // Filter out dominated states to keep only the most valuable ones for a given weight.
        smallNPrefixCombinations[currentProcessIdx] = retainNonDominatedStates(currentCandidateCombos);
    }

    const totalQueries = inputHandler.readInt();
    const queryResults = new Array(totalQueries);

    // Phase 2: Process each query.
    for (let queryId = 0; queryId < totalQueries; ++queryId) {
        let requestedItemsCount = inputHandler.readInt(); // This is 1-indexed.
        const queryWeightLimit = inputHandler.readInt();

        let maxAchievedValue = 0; // Initialize max value for the current query.

        // Adjust `requestedItemsCount` to be 0-indexed for array access.
        let zeroIndexedRequest = requestedItemsCount - 1;

        // Determine the bit length of the original 1-indexed `requestedItemsCount`.
        const requestBitLength = getLog2FloorValue(requestedItemsCount);

        // Case A: The requested item count is "small enough" to be directly looked up.
        if (requestBitLength < SMALL_PROBLEM_BIT_THRESHOLD) {
            // Retrieve combinations directly from the pre-calculated `smallNPrefixCombinations`.
            const relevantCombos = smallNPrefixCombinations[zeroIndexedRequest];
            for (const [value, weight] of relevantCombos) {
                if (weight <= queryWeightLimit) {
                    maxAchievedValue = Math.max(maxAchievedValue, value);
                }
            }
            queryResults[queryId] = maxAchievedValue;
        } else {
            // Case B: The requested item count is "large", requiring a dynamic combination process.
            // This part combines items from the "large" segment (beyond `SMALL_PROBLEM_BIT_THRESHOLD`)
            // with a pre-calculated "small" segment.

            // `largeSegmentCombinations` will store combinations for the "large" part of the query.
            // Start with an empty knapsack state `[0, 0]` to represent the option of taking no items.
            let largeSegmentCombinations = [[0, 0]];

            // Traverse up the implicit binary tree from `zeroIndexedRequest` until we reach
            // an index that falls within the "small N" range (i.e., `getLog2FloorValue(index + 1) < SMALL_PROBLEM_BIT_THRESHOLD`).
            // In each step, we combine `allItemsData[zeroIndexedRequest]` with `largeSegmentCombinations`.
            while (getLog2FloorValue(zeroIndexedRequest + 1) >= SMALL_PROBLEM_BIT_THRESHOLD) {
                const itemForLargeSegment = allItemsData[zeroIndexedRequest];
                const nextLargeSegmentCombos = [...largeSegmentCombinations]; // Copy existing combinations.

                // Generate new combinations by adding `itemForLargeSegment` to each
                // existing combination from `largeSegmentCombinations`.
                for (const [prevVal, prevWt] of largeSegmentCombinations) {
                    const newVal = prevVal + itemForLargeSegment[0];
                    const newWt = prevWt + itemForLargeSegment[1];
                    if (newWt <= MAXIMUM_BAG_WEIGHT) {
                        nextLargeSegmentCombos.push([newVal, newWt]);
                    }
                }

                // Update `largeSegmentCombinations`, then sort and filter for non-dominated states.
                largeSegmentCombinations = nextLargeSegmentCombos;
                largeSegmentCombinations.sort((a, b) => a[1] - b[1]);
                largeSegmentCombinations = retainNonDominatedStates(largeSegmentCombinations);

                // Move to the parent node in the implicit binary tree (equivalent to `x = (x - 1) >> 1`).
                zeroIndexedRequest = Math.floor((zeroIndexedRequest - 1) / 2);
            }

            // At this point, `zeroIndexedRequest` now points to an index within the "small N" range.
            // `largeSegmentCombinations` holds the combined states for the "large" part.
            const smallSegmentCombos = smallNPrefixCombinations[zeroIndexedRequest];

            // Combine `largeSegmentCombinations` and `smallSegmentCombos` using a two-pointer approach.
            // Both arrays are sorted by weight and contain only non-dominated states.
            let largeSegmentPtr = largeSegmentCombinations.length - 1;
            maxAchievedValue = 0; // Reset for the final combination.

            for (let smallIdx = 0; smallIdx < smallSegmentCombos.length; ++smallIdx) {
                const [smallVal, smallWt] = smallSegmentCombos[smallIdx];

                // Optimization: If the current small segment combination's weight already exceeds
                // the `queryWeightLimit`, no further combinations with the large segment
                // will be valid for this `smallIdx` (since `smallSegmentCombos` is sorted by weight).
                if (smallWt > queryWeightLimit) {
                    break;
                }

                // Move `largeSegmentPtr` to the left as long as the combined weight
                // (current large combo + current small combo) exceeds `queryWeightLimit`.
                // We seek the largest `largeSegmentPtr` such that the combined weight is valid.
                while (largeSegmentPtr >= 0 &&
                       largeSegmentCombinations[largeSegmentPtr][1] + smallWt > queryWeightLimit) {
                    largeSegmentPtr--;
                }

                // If a valid combination from the large segment is found, update `maxAchievedValue`.
                if (largeSegmentPtr >= 0) {
                    const combinedValue = smallVal + largeSegmentCombinations[largeSegmentPtr][0];
                    maxAchievedValue = Math.max(maxAchievedValue, combinedValue);
                }
            }
            queryResults[queryId] = maxAchievedValue;
        }
    }

    // Return the results, joined by newline characters for output.
    return queryResults.join("\n");
}

// Execute the main problem-solving logic and store its output.
const programFinalOutput = executeKnapsackSolver();

// Print the final result to standard output.
if (programFinalOutput !== undefined) {
    console.log(String(programFinalOutput));
}