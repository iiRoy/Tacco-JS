"use strict";
const dataStream = require("node:fs").readFileSync("/dev/stdin", { encoding: "utf8" });
const tokenBuffer = dataStream.trim().split(/\s+/).filter(token => token !== '');
let tokenPointer = 0;

/**
 * Retrieves the next token from the input buffer and converts it to a number.
 * @returns {number} The next integer.
 */
function retrieveNextInteger() {
    return Number(tokenBuffer[tokenPointer++]);
}

/**
 * Retrieves the next token from the input buffer as a string.
 * @returns {string} The next string.
 */
function retrieveNextString() {
    return tokenBuffer[tokenPointer++];
}

/**
 * Retrieves the next token from the input buffer and converts it to a BigInt.
 * @returns {BigInt} The next BigInt.
 */
function retrieveNextBigInt() {
    return BigInt(tokenBuffer[tokenPointer++]);
}

/**
 * Fetches a sequence of tokens from the input buffer.
 * @param {number} count The number of tokens to fetch.
 * @param {boolean} [asNumbers=true] Whether to convert tokens to numbers.
 * @returns {Array<number|string>} An array containing the fetched tokens.
 */
function fetchNumericSequence(count, asNumbers = true) {
    const startIndex = tokenPointer;
    tokenPointer += count;
    const rawSlice = tokenBuffer.slice(startIndex, tokenPointer);
    return asNumbers ? rawSlice.map(Number) : rawSlice;
}

/**
 * Constructs a 2D grid (matrix) from the input buffer.
 * @param {number} height The number of rows in the grid.
 * @param {number} width The number of columns in the grid.
 * @param {boolean} [convertToNumbers=true] Whether to convert cell values to numbers.
 * @returns {Array<Array<number|string>>} The constructed grid.
 */
function constructGridData(height, width, convertToNumbers = true) {
    const grid = [];
    for (let rowIdx = 0; rowIdx < height; ++rowIdx) {
        const startIndex = tokenPointer;
        tokenPointer += width;
        const rowSlice = tokenBuffer.slice(startIndex, tokenPointer);
        grid.push(convertToNumbers ? rowSlice.map(Number) : rowSlice);
    }
    return grid;
}

/**
 * Recursively initializes a multi-dimensional array with a given default value.
 * @param {*} defaultValue The value to fill array elements with.
 * @param {...number} dimensions The sizes of each dimension.
 * @returns {Array} The initialized multi-dimensional array.
 */
function initializeMultiDimArray(defaultValue, ...dimensions) {
    if (dimensions.length === 0) {
        return defaultValue;
    }
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);
    const newArray = new Array(currentDimensionSize);
    for (let i = 0; i < currentDimensionSize; ++i) {
        newArray[i] = initializeMultiDimArray(defaultValue, ...remainingDimensions);
    }
    return newArray;
}

// Execute the main logic and print the result.
const programOutput = computeSolution();
if (programOutput !== undefined && programOutput !== null) {
    console.log(String(programOutput));
}

/**
 * Main function to compute the solution for the problem.
 * This problem appears to be a dynamic programming approach
 * to find the maximum value of items collected on a grid.
 * @returns {number} The maximum score achievable.
 */
function computeSolution() {
    // Read grid dimensions and number of items to place
    const [gridRows, gridCols, totalItems] = fetchNumericSequence(3);

    // Initialize a grid to store item values. Using null to indicate no item.
    // The grid is 1-indexed based on problem constraints (r+1, c+1).
    const itemPlacementGrid = initializeMultiDimArray(null, gridRows + 1, gridCols + 1);

    // Populate the item placement grid with values.
    // Each item has a row, column, and a score.
    for (let itemIdx = 0; itemIdx < totalItems; ++itemIdx) {
        const [itemRow, itemCol, itemScore] = fetchNumericSequence(3);
        itemPlacementGrid[itemRow][itemCol] = itemScore;
    }

    // DP_COL_SIZE defines the maximum number of items (plus one for 0 items)
    // that can be picked from a single cell in the current row.
    // In this problem, it's 3 items + 1 (for 0 items) = 4 states.
    const DP_COL_SIZE = 4;
    const MAX_ITEMS_PER_CELL_PICKED = DP_COL_SIZE - 1; // This value is 3.

    // `currentMaxScores` stores the maximum scores for the previous row processed.
    let currentMaxScores = initializeMultiDimArray(0, gridCols + 1, DP_COL_SIZE);

    // Iterate through each row of the grid, starting from row 1.
    for (let processingRow = 1; processingRow <= gridRows; ++processingRow) {
        // `nextMaxScores` will store the DP states for the current `processingRow`.
        const nextMaxScores = initializeMultiDimArray(0, gridCols + 1, DP_COL_SIZE);

        // Iterate through each column in the current row, starting from col 1.
        for (let processingCol = 1; processingCol <= gridCols; ++processingCol) {
            const currentCellItemValue = itemPlacementGrid[processingRow][processingCol];

            // --- DP State Calculation for current cell (processingRow, processingCol) ---

            // State 0: We don't pick any item from the current cell (processingRow, processingCol).
            // The maximum value for this state can come from two sources:
            // 1. The maximum value achievable at the same column in the previous row,
            //    having picked any number of items from that previous cell (`MAX_ITEMS_PER_CELL_PICKED`).
            // 2. The maximum value achievable at the previous column in the current row,
            //    having picked 0 items from that previous cell.
            const valueFromAboveAnyItems = currentMaxScores[processingCol][MAX_ITEMS_PER_CELL_PICKED];
            const valueFromLeftZeroItems = nextMaxScores[processingCol - 1][0];
            nextMaxScores[processingCol][0] = Math.max(valueFromAboveAnyItems, valueFromLeftZeroItems);

            // States 1 to 3: We pick `itemsPickedFromCurrentCell` from the current cell.
            for (let itemsPickedFromCurrentCell = 1; itemsPickedFromCurrentCell <= MAX_ITEMS_PER_CELL_PICKED; ++itemsPickedFromCurrentCell) {
                // Option A: Don't pick item from current cell.
                // This means we carry over the max from the previous row (any items)
                // or from the previous column (same number of items, without picking from current cell).
                const valueIfCurrentCellSkipped = Math.max(
                    valueFromAboveAnyItems,
                    nextMaxScores[processingCol - 1][itemsPickedFromCurrentCell]
                );

                // Check if there's an item in the current cell to potentially pick.
                if (currentCellItemValue !== null) {
                    // Option B: Pick an item from the current cell.
                    // This involves adding `currentCellItemValue` to a previous state.
                    // 1. Pick from previous row (any items) and add current item.
                    const valuePickingFromAbove = currentMaxScores[processingCol][MAX_ITEMS_PER_CELL_PICKED] + currentCellItemValue;
                    // 2. Pick from previous column, having picked one less item from that cell, and add current item.
                    const valuePickingFromLeft = nextMaxScores[processingCol - 1][itemsPickedFromCurrentCell - 1] + currentCellItemValue;

                    // Take the maximum of all possibilities for this state.
                    nextMaxScores[processingCol][itemsPickedFromCurrentCell] = Math.max(
                        valuePickingFromAbove,
                        valuePickingFromLeft,
                        valueIfCurrentCellSkipped
                    );
                } else {
                    // If no item is present in this cell, we cannot pick one.
                    // So, the value for this state is simply the `valueIfCurrentCellSkipped`.
                    nextMaxScores[processingCol][itemsPickedFromCurrentCell] = valueIfCurrentCellSkipped;
                }
            }
        }
        // After processing all columns for the current row, update `currentMaxScores`
        // to be used as `previous row` states for the next iteration.
        currentMaxScores = nextMaxScores;
    }

    // The final answer is the maximum value in the last column of the last row's DP table.
    // We use reduce to find the maximum value across all possible item counts (0 to 3)
    // in the last cell of the grid (gridCols).
    const finalRowScores = currentMaxScores[gridCols];
    const overallMaximumScore = finalRowScores.reduce((maxAccumulator, currentScore) => {
        return Math.max(maxAccumulator, currentScore);
    }, 0); // Initialize accumulator with 0.

    return overallMaximumScore;
}