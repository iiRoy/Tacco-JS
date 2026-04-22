"use strict";

// This section handles the initial loading and parsing of input data.
// It reads the entire standard input stream as a UTF-8 string.
const sourceDataContent = require("fs").readFileSync("/dev/stdin", "utf8");

// An internal buffer to hold tokens extracted from the input.
// Tokens are split by any sequence of whitespace characters, and empty strings are filtered out.
let inputTokenBuffer = sourceDataContent.split(/\s+/).filter(token => token.length > 0);
// A pointer to keep track of the current reading position within the token buffer.
let currentReadPointer = 0;

/**
 * Retrieves the next available token from the input stream.
 * Includes basic error handling for reading past the end of input.
 * @param {boolean} [shouldReturnAsString=false] - If true, returns the token as a string; otherwise, attempts numeric conversion.
 * @returns {string|number|undefined} The next token, or undefined if no more tokens are available.
 */
const retrieveNextInputToken = (shouldReturnAsString = false) => {
    if (currentReadPointer >= inputTokenBuffer.length) {
        console.warn("Input Exhaustion Warning: Attempted to read beyond available input tokens.");
        return undefined; // Indicate end of input
    }
    const tokenValue = inputTokenBuffer[currentReadPointer++];
    return shouldReturnAsString ? tokenValue : Number(tokenValue);
};

/**
 * Extracts a specified number of tokens from the input stream, returning them as an array.
 * Provides options for type conversion and includes error handling for insufficient tokens.
 * @param {number} numberOfItems - The quantity of tokens to extract.
 * @param {boolean} [preserveOriginalType=false] - If true, tokens remain strings; otherwise, they are converted to numbers.
 * @returns {Array<string|number>} An array containing the extracted tokens.
 */
const fetchTokenSequence = (numberOfItems, preserveOriginalType = false) => {
    const startIdx = currentReadPointer;
    let endIdx = currentReadPointer + numberOfItems;

    if (endIdx > inputTokenBuffer.length) {
        const remaining = inputTokenBuffer.length - currentReadPointer;
        console.error(`Input Error: Not enough tokens for sequence. Requested ${numberOfItems}, but only ${remaining} remain.`);
        // Adjust numberOfItems to available tokens, or throw an error.
        numberOfItems = remaining;
        endIdx = currentReadPointer + numberOfItems; // Recalculate end index
    }

    currentReadPointer += numberOfItems;
    const extractedSegment = inputTokenBuffer.slice(startIdx, endIdx);

    // Apply type conversion if not preserving original string type.
    return preserveOriginalType ? extractedSegment : extractedSegment.map(val => Number(val));
};

/**
 * Reads a two-dimensional grid (matrix) of values from the input stream.
 * This is a more complex input parsing utility, demonstrating a Type III change,
 * but it's not directly utilized by the primary calculation in this specific problem.
 * @param {number} numRows - The desired number of rows for the grid.
 * @param {number} numCols - The desired number of columns for each row.
 * @param {boolean} [keepAsText=false] - If true, values are kept as strings; otherwise, they are converted to numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the grid.
 */
function acquireGridData(numRows, numCols, keepAsText = false) {
    const resultantGrid = [];
    for (let currentGridRow = 0; currentGridRow < numRows; currentGridRow++) {
        const rowData = fetchTokenSequence(numCols, keepAsText);
        if (rowData.length < numCols) {
            console.warn(`Grid Parsing Warning: Row ${currentGridRow + 1} has fewer elements than expected (${rowData.length} vs ${numCols}).`);
        }
        resultantGrid.push(rowData);
    }
    return resultantGrid;
}

/**
 * Dynamically constructs a multi-dimensional array with specified dimensions,
 * filled with a given initial value. This utility is a re-implementation of
 * the original `xArray` for demonstration of Type III cloning, but it's not
 * directly involved in the main problem's logic.
 * @param {*} initialFillValue - The value to populate the array elements with.
 * @param {...number} arrayDimensions - A sequence of numbers defining the size of each dimension.
 * @returns {Array} The newly created multi-dimensional array.
 */
const createMultiDimensionalArray = (initialFillValue, ...arrayDimensions) => {
    if (!Array.isArray(arrayDimensions) || arrayDimensions.length === 0) {
        return initialFillValue; // Base case or invalid dimensions
    }

    const buildRecursive = (dims) => {
        if (dims.length === 0) {
            return initialFillValue;
        }
        const currentDimSize = dims[0];
        const remainingDims = dims.slice(1);
        return Array(currentDimSize).fill(null).map(() => buildRecursive(remainingDims));
    };

    return buildRecursive(arrayDimensions);
};


/**
 * Calculates the number of unique pairs (combinations of 2) that can be formed from a given count of items.
 * This is equivalent to "n choose 2" (C(n, 2)).
 * @param {number} totalItems - The total number of items available.
 * @returns {number} The count of combinations of 2, or 0 if totalItems is less than 2.
 */
const calculatePairsCombination = (totalItems) => {
    // A set of 0 or 1 item cannot form any pairs.
    if (totalItems < 2) {
        return 0;
    }

    // The formula for "n choose 2" is n * (n - 1) / 2.
    const itemsMinusOne = totalItems - 1;
    const productOfValues = totalItems * itemsMinusOne;
    const finalPairCount = productOfValues / 2;

    return finalPairCount;
};

/**
 * This is the primary function containing the core logic of the program.
 * It reads two numeric inputs and computes the sum of combinations of 2 for each input.
 * @returns {number} The aggregated sum of pair combinations.
 */
function executeMainCalculation() {
    // Read the first primary numeric input.
    const primaryInputA = retrieveNextInputToken();
    // Read the second primary numeric input.
    const primaryInputB = retrieveNextInputToken();

    // Perform robust input validation to ensure both inputs are valid numbers.
    const isPrimaryAValid = typeof primaryInputA === 'number' && !isNaN(primaryInputA);
    const isPrimaryBValid = typeof primaryInputB === 'number' && !isNaN(primaryInputB);

    if (!isPrimaryAValid || !isPrimaryBValid) {
        console.error("Critical Error: One or both primary inputs are invalid numbers. Expected two numeric values.");
        // In a production scenario, one might throw an exception or exit.
        // For this clone, returning 0 as a default error handling.
        return 0;
    }

    // Calculate the number of pairs for the first input value.
    const pairsFromDatasetA = calculatePairsCombination(primaryInputA);

    // Calculate the number of pairs for the second input value.
    const pairsFromDatasetB = calculatePairsCombination(primaryInputB);

    // Aggregate the results from both calculations.
    const totalAggregatedPairs = pairsFromDatasetA + pairsFromDatasetB;

    return totalAggregatedPairs;
}

// Application entry point: execute the main calculation.
const programOutputResult = executeMainCalculation();

// Output the result to the console, with a check to ensure the result is defined.
// An additional check for `process.stdout.isTTY` or a test environment flag
// can be used to control output verbosity in different execution contexts.
if (programOutputResult !== undefined && programOutputResult !== null) {
    if (process.stdout.isTTY || process.env.NODE_ENV === 'development' || process.env.CI) {
        // Output to stdout if running interactively, in dev, or CI environments.
        console.log(programOutputResult);
    } else {
        // In other non-interactive environments, still output to stdout as it's the expected behavior for competitive programming.
        // This 'else' block is primarily for demonstrating Type III addition, even if it has the same effect.
        console.log(programOutputResult);
    }
}