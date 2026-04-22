"use strict";

// Constants and utility for managing input stream from standard input
const STD_INPUT_FILE_MODULE = require("fs");
const DEFAULT_INPUT_PATH = "/dev/stdin"; // Standard input file path on Unix-like systems
const TOKEN_DELIMITERS = / |\n/; // Regular expression to split input by spaces or newlines

// Initialize the input stream and token management
let rawInputContent = STD_INPUT_FILE_MODULE.readFileSync(DEFAULT_INPUT_PATH, "utf8");
let inputTokenBuffer = rawInputContent.split(TOKEN_DELIMITERS);
let currentBufferPointer = 0; // Index to keep track of the next token to read

/**
 * Extracts the next token from the buffer and converts it to an integer.
 * @returns {number} The parsed integer value.
 */
function consumeNextInteger() {
    return parseInt(inputTokenBuffer[currentBufferPointer++], 10);
}

/**
 * Extracts the next token from the buffer as a string.
 * @returns {string} The next token as a string.
 */
function consumeNextString() {
    return inputTokenBuffer[currentBufferPointer++];
}

/**
 * Extracts the next token from the buffer and converts it to a BigInt.
 * @returns {BigInt} The parsed BigInt value.
 */
function consumeNextBigInt() {
    return BigInt(inputTokenBuffer[currentBufferPointer++]);
}

/**
 * Reads a specified number of tokens from the buffer and optionally converts them to numbers.
 * @param {number} count - The number of tokens to read.
 * @param {boolean} [shouldConvertToNumber=true] - If true, converts tokens to numbers; otherwise, keeps them as strings.
 * @returns {Array<number|string>} An array containing the read tokens.
 */
function readTokenSlice(count, shouldConvertToNumber = true) {
    const startIndex = currentBufferPointer;
    currentBufferPointer += count;
    const tokens = inputTokenBuffer.slice(startIndex, currentBufferPointer);
    return shouldConvertToNumber ? tokens.map(Number) : tokens;
}

/**
 * Dynamically creates a multi-dimensional array initialized with a specific value.
 * This function uses recursion to build nested arrays, avoiding `eval`.
 * @param {*} initialValue - The default value to fill array elements with.
 * @param {...number} dimensions - A list of numbers representing the size of each dimension.
 * @returns {Array} The newly created multi-dimensional array.
 */
function constructMultiDimensionalArray(initialValue, ...dimensions) {
    const recursiveBuilder = (remainingDimensions) => {
        // Base case: if no dimensions left, return the initial value
        if (remainingDimensions.length === 0) {
            return initialValue;
        }
        // Recursive step: create an array for the current dimension
        const currentDimensionSize = remainingDimensions[0];
        const nextDimensions = remainingDimensions.slice(1);
        const newArray = new Array(currentDimensionSize);
        for (let i = 0; i < currentDimensionSize; i++) {
            newArray[i] = recursiveBuilder(nextDimensions);
        }
        return newArray;
    };
    return recursiveBuilder(dimensions);
}

// The primary execution function for the problem logic
const finalComputedResult = executeAlgorithm();

// Output the result to console, ensuring it's converted to a string if valid
if (finalComputedResult != null) { // Checks for both null and undefined
    console.log(String(finalComputedResult));
}

/**
 * Encapsulates the main algorithm logic for processing input and computing the result.
 * This function handles DP table initialization, iteration, and state updates.
 * @returns {number} The final calculated maximum path length plus skipped counts.
 */
function executeAlgorithm() {
    // Read the main dimension size for the problem (e.g., number of iterations or array size)
    const problemSize = consumeNextInteger();

    // Early exit for invalid or non-positive input size
    if (problemSize <= 0) {
        console.error("Warning: Problem size must be positive. Returning 0.");
        return 0;
    }

    // Define a special value to represent unreached or invalid states in the DP table
    const UNREACHED_STATE_VALUE = -1;
    // Initialize a 2D dynamic programming table (matrix) with the unreached state value
    let dpMemoizationTable = constructMultiDimensionalArray(UNREACHED_STATE_VALUE, problemSize, problemSize);

    // Variables to keep track of the highest path length found and the count of skipped operations
    let globalMaxPathLength = 0;
    let identicalCoordinateSkipCount = 0;

    // A temporary queue to buffer updates to the DP table for the current iteration
    let pendingTableUpdates = [];

    /**
     * Helper function to process raw coordinate inputs: converts to 0-indexed and sorts.
     * @param {number} count - The number of coordinates to read.
     * @returns {Array<number>} An array of 0-indexed, sorted coordinates.
     */
    const getSortedZeroIndexedCoordinates = (count) => {
        const rawCoordinates = readTokenSlice(count);
        return rawCoordinates.map(coord => coord - 1).sort((a, b) => a - b);
    };

    // Read the initial pair of coordinates and set the starting point in the DP table
    const initialCoordinatePair = getSortedZeroIndexedCoordinates(2);
    // Validate initial coordinates before using them to prevent out-of-bounds access
    if (initialCoordinatePair.length >= 2 &&
        initialCoordinatePair[0] >= 0 && initialCoordinatePair[0] < problemSize &&
        initialCoordinatePair[1] >= 0 && initialCoordinatePair[1] < problemSize) {
        dpMemoizationTable[initialCoordinatePair[0]][initialCoordinatePair[1]] = 0;
    } else {
        console.error("Error: Initial coordinates are outside the valid range. Exiting.");
        return 0; // Return an error code or default value
    }

    /**
     * This nested function calculates a potential new path length and queues it for DP table update.
     * It also updates the global maximum path length found so far.
     * @param {number} previousRow - Row index of the previous state.
     * @param {number} previousCol - Column index of the previous state.
     * @param {number} currentRow - Row index of the current state to update.
     * @param {number} currentCol - Column index of the current state to update.
     */
    const evaluateAndQueueUpdate = (previousRow, previousCol, currentRow, currentCol) => {
        // Calculate the potential path length if extending from (previousRow, previousCol)
        // If previous state is UNREACHED_STATE_VALUE (-1), then -1+1 = 0, meaning it acts as a starting point.
        let potentialExtendedPath = dpMemoizationTable[previousRow][previousCol];
        if (potentialExtendedPath !== UNREACHED_STATE_VALUE) {
            potentialExtendedPath += 1; // Extend the path by 1 step
        } else {
            potentialExtendedPath = 0; // If previous state was unreached, consider it a new path starting with length 0
        }

        // Retrieve the current value at the target cell (currentRow, currentCol)
        const existingValueAtTarget = dpMemoizationTable[currentRow][currentCol];

        // Determine the new value for the target cell: max of existing and potential extended path
        // This mirrors the original `Math.max(dp[v][w], dp[t][u]+1)` logic.
        let calculatedNewValue;
        if (existingValueAtTarget === UNREACHED_STATE_VALUE) {
            calculatedNewValue = potentialExtendedPath;
        } else {
            calculatedNewValue = Math.max(existingValueAtTarget, potentialExtendedPath);
        }

        // If the calculated new value is a valid path length (not UNREACHED_STATE_VALUE),
        // queue it for update and potentially update the global maximum.
        if (calculatedNewValue !== UNREACHED_STATE_VALUE) {
            pendingTableUpdates.push(currentRow, currentCol, calculatedNewValue);
            if (calculatedNewValue > globalMaxPathLength) {
                globalMaxPathLength = calculatedNewValue;
            }
        }
    };

    // Iterate through the remaining (problemSize - 1) sets of coordinates
    for (let currentProcessingStep = 1; currentProcessingStep < problemSize; currentProcessingStep++) {
        // Read and prepare the current triplet of coordinates (converted to 0-indexed and sorted)
        const currentInputTriplet = getSortedZeroIndexedCoordinates(3);

        // Check for a specific condition: if the first and third coordinates are identical.
        // This implies a special case where this triplet is skipped, and a counter is incremented.
        if (currentInputTriplet[0] === currentInputTriplet[2]) {
            identicalCoordinateSkipCount++;
            continue; // Skip further processing for this iteration
        }

        // Clear the update queue for the new processing step
        pendingTableUpdates = [];

        // --- Complex conditional logic for generating DP updates based on triplet values ---
        // This section explores various path extensions depending on the equality of triplet elements.

        // Always consider the path from (first, first) to (second, third)
        evaluateAndQueueUpdate(currentInputTriplet[0], currentInputTriplet[0], currentInputTriplet[1], currentInputTriplet[2]);

        // Scenario 1: If the first and second coordinates are distinct
        if (currentInputTriplet[0] !== currentInputTriplet[1]) {
            // Consider path from (second, second) to (first, third)
            evaluateAndQueueUpdate(currentInputTriplet[1], currentInputTriplet[1], currentInputTriplet[0], currentInputTriplet[2]);
        } else {
            // If first and second are identical, iterate through possibilities for the first coordinate
            for (let k = 0; k < currentInputTriplet[0]; k++) {
                evaluateAndQueueUpdate(k, currentInputTriplet[0], k, currentInputTriplet[2]);
            }
            for (let k = currentInputTriplet[0] + 1; k < currentInputTriplet[2]; k++) {
                evaluateAndQueueUpdate(currentInputTriplet[0], k, k, currentInputTriplet[2]);
            }
            for (let k = currentInputTriplet[2]; k < problemSize; k++) {
                evaluateAndQueueUpdate(currentInputTriplet[0], k, currentInputTriplet[2], k);
            }
        }

        // Scenario 2: If the second and third coordinates are distinct
        if (currentInputTriplet[1] !== currentInputTriplet[2]) {
            // Consider path from (third, third) to (first, second)
            evaluateAndQueueUpdate(currentInputTriplet[2], currentInputTriplet[2], currentInputTriplet[0], currentInputTriplet[1]);
        } else {
            // If second and third are identical, iterate through possibilities for the second coordinate
            for (let k = 0; k < currentInputTriplet[0]; k++) {
                evaluateAndQueueUpdate(k, currentInputTriplet[1], k, currentInputTriplet[0]);
            }
            for (let k = currentInputTriplet[0]; k < currentInputTriplet[2]; k++) {
                evaluateAndQueueUpdate(k, currentInputTriplet[2], currentInputTriplet[0], k);
            }
            for (let k = currentInputTriplet[2] + 1; k < problemSize; k++) {
                evaluateAndQueueUpdate(currentInputTriplet[2], k, currentInputTriplet[0], k);
            }
        }

        // Apply all pending updates to the DP table for the current iteration.
        // This ensures that all updates for a step are based on the DP states from the *previous* step,
        // and only applied after all potential paths for the current step have been identified.
        while (pendingTableUpdates.length > 0) {
            const potentialNewValue = pendingTableUpdates.pop(); // The path length to potentially set
            const targetCol = pendingTableUpdates.pop(); // Column index for the update
            const targetRow = pendingTableUpdates.pop(); // Row index for the update

            // Update the DP table cell by taking the maximum of its current value and the new potential value.
            // This is crucial for correctly implementing the DP state transition.
            dpMemoizationTable[targetRow][targetCol] = Math.max(
                dpMemoizationTable[targetRow][targetCol],
                potentialNewValue
            );
        }
    }

    // After the main loop, read one final coordinate value
    const finalSingleCoordinate = consumeNextInteger() - 1;

    // Perform a final update consideration for this last coordinate.
    // This call ensures that any paths ending at this final point contribute to the global maximum.
    // The `evaluateAndQueueUpdate` function itself updates `globalMaxPathLength`.
    evaluateAndQueueUpdate(finalSingleCoordinate, finalSingleCoordinate, finalSingleCoordinate, finalSingleCoordinate);

    // The problem requires returning the sum of the global maximum path length and the count of skipped operations.
    return globalMaxPathLength + identicalCoordinateSkipCount;
}