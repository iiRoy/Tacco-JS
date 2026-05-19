"use strict";

// Encapsulates input reading logic, replacing individual global functions.
const inputProcessor = (() => {
    // Reads the entire input from stdin.
    const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
    // Splits the raw input into tokens by spaces or newlines.
    const tokenSequence = rawInputData.split(/ |\n/);
    // Keeps track of the current position in the token sequence.
    let currentTokenPosition = 0;

    // Helper function to convert a token to a number.
    const convertToNumber = (token) => +token;
    // Helper function to convert a token to a BigInt.
    const convertToBigInt = (token) => BigInt(token);

    return {
        // Reads and returns the next token as an integer.
        readInteger: () => convertToNumber(tokenSequence[currentTokenPosition++]),
        // Reads and returns the next token as a string.
        readString: () => tokenSequence[currentTokenPosition++],
        // Reads and returns the next token as a BigInt.
        readBigInteger: () => convertToBigInt(tokenSequence[currentTokenPosition++]),
        // Reads 'count' tokens from the sequence, optionally converting them to numbers.
        readIntegerArray: (count, shouldMapToNumber = true) => {
            const elements = [];
            for (let i = 0; i < count; i++) {
                elements.push(shouldMapToNumber ? convertToNumber(tokenSequence[currentTokenPosition++]) : tokenSequence[currentTokenPosition++]);
            }
            return elements;
        },
        // Reads a matrix of 'height' rows and 'width' columns, optionally converting elements to numbers.
        readMatrix: (height, width, shouldMapToNumber = true) => {
            const matrixData = [];
            for (let r = 0; r < height; r++) {
                const rowElements = [];
                for (let c = 0; c < width; c++) {
                    rowElements.push(shouldMapToNumber ? convertToNumber(tokenSequence[currentTokenPosition++]) : tokenSequence[currentTokenPosition++]);
                }
                matrixData.push(rowElements);
            }
            return matrixData;
        }
    };
})();

// Helper function to create multi-dimensional arrays, replacing the original 'xArray' which used eval.
// Initializes all elements with 'initialFillValue'.
function createMultiDimArray(initialFillValue, ...dimensions) {
    // Base case: if no more dimensions, return the initial value.
    if (dimensions.length === 0) {
        return initialFillValue;
    }
    // Get the size of the current dimension.
    const currentDimensionSize = dimensions[0];
    // Get the remaining dimensions for recursive calls.
    const remainingDimensions = dimensions.slice(1);
    // Create a new array for the current dimension.
    const newArray = new Array(currentDimensionSize);
    // Recursively fill each element of the current array.
    for (let i = 0; i < currentDimensionSize; i++) {
        newArray[i] = createMultiDimArray(initialFillValue, ...remainingDimensions);
    }
    return newArray;
}

// The main program logic, renamed from 'main' to 'executeProgram'.
function executeProgram() {
    // Read grid dimensions and number of items to place.
    const [gridRows, gridCols, numItemsToPlace] = inputProcessor.readIntegerArray(3);

    // Initialize a grid to store item values.
    // Using 'null' as the initial value to signify no item, consistent with original's "{}".
    const itemPlacementGrid = createMultiDimArray(null, gridRows + 1, gridCols + 1);

    // Populate the item grid with values from input.
    for (let itemIdx = 0; itemIdx < numItemsToPlace; itemIdx++) {
        const [itemRow, itemCol, itemValue] = inputProcessor.readIntegerArray(3);
        itemPlacementGrid[itemRow][itemCol] = itemValue;
    }

    // Initialize the DP table. 'currentDPState[col][items_taken]' stores the maximum value.
    // The last dimension '4' allows for 0, 1, 2, or 3 items taken.
    let currentDPState = createMultiDimArray(0, gridCols + 1, 4);

    // Iterate through each row of the grid.
    for (let currentRow = 1; currentRow <= gridRows; currentRow++) {
        // Create a new DP table for the current row's calculations.
        const nextDPState = createMultiDimArray(0, gridCols + 1, 4);

        // Iterate through each column in the current row.
        for (let currentCol = 1; currentCol <= gridCols; currentCol++) {
            // Get the value of the item at the current grid position (if any).
            const currentGridItemValue = itemPlacementGrid[currentRow][currentCol];
            // Retrieve the maximum value from the previous row, ending at this column, having taken 3 items.
            const prevRowMaxVal = currentDPState[currentCol][3];

            // Calculate the DP state for 0 items taken at the current position.
            // This is the maximum of:
            // 1. The max value from the previous row (with 3 items taken, effectively resetting count).
            // 2. The max value from the previous column in the current row (with 0 items taken).
            nextDPState[currentCol][0] = Math.max(prevRowMaxVal, nextDPState[currentCol - 1][0]);

            // Calculate DP states for 1, 2, or 3 items taken at the current position.
            for (let itemsTakenCount = 1; itemsTakenCount <= 3; itemsTakenCount++) {
                // Retrieve values from the previous column in the current row.
                const prevColSameItems = nextDPState[currentCol - 1][itemsTakenCount];
                const prevColLessItems = nextDPState[currentCol - 1][itemsTakenCount - 1];

                if (currentGridItemValue !== null) { // If an item exists at the current grid position
                    // The maximum value is derived from three possibilities:
                    // 1. Taking the current item, combined with the max value from the previous row (3 items).
                    // 2. Taking the current item, combined with the max value from the previous column (one less item).
                    // 3. Not taking the current item, carrying over the max value from the previous column (same items).
                    nextDPState[currentCol][itemsTakenCount] = Math.max(
                        prevRowMaxVal + currentGridItemValue,
                        prevColLessItems + currentGridItemValue,
                        prevColSameItems
                    );
                } else { // If no item exists at the current grid position
                    // The maximum value is derived from two possibilities (cannot take current item):
                    // 1. Carrying over the max value from the previous row (3 items).
                    // 2. Carrying over the max value from the previous column (same items).
                    nextDPState[currentCol][itemsTakenCount] = Math.max(
                        prevRowMaxVal,
                        prevColSameItems
                    );
                }
            }
        }
        // After processing all columns for the current row, update currentDPState for the next row iteration.
        currentDPState = nextDPState;
    }

    // The final result is the maximum value found in the last column of the DP table.
    return Math.max(...currentDPState[gridCols]);
}

// Execute the program and print the result to console if it's not undefined.
const finalProgramOutput = executeProgram();
if (finalProgramOutput !== undefined) {
    console.log(String(finalProgramOutput));
}
