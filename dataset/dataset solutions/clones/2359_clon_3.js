"use strict";

// This module provides utility for reading various data types from a string input source.
// It encapsulates the logic for parsing lines and tokens from a raw input string.
const DataStreamReader = (function() {

    /**
     * Internal helper to convert a string value to a number or keep it as string.
     * @param {string} value The string value to potentially convert.
     * @param {boolean} returnAsString If true, returns the string; otherwise, attempts conversion to number.
     * @returns {string|number} The processed value.
     */
    const _processValueType = (value, returnAsString) => returnAsString ? value : Number(value);

    /**
     * Represents a reader for a multi-line string data source, managing line and token pointers.
     * @class
     * @param {string} rawSourceText The entire input string, typically from a file.
     */
    function InputSource(rawSourceText) {
        // All lines of input, trimmed to remove leading/trailing whitespace from the whole block.
        this._allInputLines = rawSourceText.trim().split('\n');
        // Index of the current line being processed.
        this._activeLineIndex = 0;
        // Array of tokens (words) from the _activeLineIndex.
        this._currentLineTokens = [];
        // Index within _currentLineTokens, pointing to the next token to be read.
        this._tokenReadPointer = 0;
    }

    /**
     * Attempts to load the next line from `_allInputLines` into `_currentLineTokens`.
     * Resets `_tokenReadPointer` and increments `_activeLineIndex`.
     * @returns {boolean} True if a new line was successfully loaded, false if end of input.
     */
    InputSource.prototype._advanceToNextLine = function() {
        if (this._activeLineIndex >= this._allInputLines.length) {
            return false; // No more lines available in the input.
        }
        this._currentLineTokens = this._allInputLines[this._activeLineIndex].split(' ');
        this._tokenReadPointer = 0;
        this._activeLineIndex++;
        return true;
    };

    /**
     * Reads and returns the next single token from the input stream.
     * Automatically handles line advancement if the current line's tokens are exhausted.
     * @param {boolean} [returnAsString=false] If true, returns the token as a string; otherwise, as a number.
     * @returns {string|number|undefined} The next token, or `undefined` if the end of input is reached.
     */
    InputSource.prototype.getSingleToken = function(returnAsString) {
        // If all tokens on the current line have been consumed, try to load the next line.
        if (this._tokenReadPointer >= this._currentLineTokens.length) {
            if (!this._advanceToNextLine()) {
                // If no more lines can be loaded, we've reached the end of the input.
                return undefined;
            }
        }
        // Extract the token and advance the token pointer.
        const tokenValue = this._currentLineTokens[this._tokenReadPointer++];
        return _processValueType(tokenValue, returnAsString);
    };

    /**
     * Reads all remaining tokens from the current line and advances the line pointer.
     * This method consumes the entire current line, regardless of how many tokens were previously read.
     * @param {boolean} [returnAsString=false] If true, returns tokens as strings; otherwise, as numbers.
     * @returns {Array<string|number>} An array containing all tokens from the current line. Returns an empty array if no more lines.
     */
    InputSource.prototype.getAllLineTokens = function(returnAsString) {
        // If the current line's tokens are exhausted or this is the first read for a new line, load it.
        if (this._tokenReadPointer >= this._currentLineTokens.length) {
             if (!this._advanceToNextLine()) {
                 return []; // No more lines to read, return an empty array.
             }
        }
        // Map all tokens from the current line to their desired type.
        const processedValues = this._currentLineTokens.map(token => _processValueType(token, returnAsString));
        // Reset tokens and pointer, as this method fully consumes the line.
        this._currentLineTokens = [];
        this._tokenReadPointer = 0;
        return processedValues;
    };

    /**
     * Reads a specified number of lines, treating each line as an array of tokens.
     * Suitable for reading a matrix or a list of arrays.
     * @param {number} numberOfLines The total number of lines to read.
     * @param {boolean} [returnAsString=false] If true, returns tokens as strings; otherwise, as numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of the read values.
     */
    InputSource.prototype.readTokenGrid = function(numberOfLines, returnAsString) {
        const resultGrid = [];
        for (let i = 0; i < numberOfLines; i++) {
            resultGrid.push(this.getAllLineTokens(returnAsString));
        }
        return resultGrid;
    };

    /**
     * Reads a specified number of raw lines without splitting them into individual tokens.
     * Each line is treated as a single value.
     * @param {number} lineCount The number of lines to retrieve.
     * @param {boolean} [returnAsString=false] If true, returns lines as strings; otherwise, attempts to convert each line to a number.
     * @returns {Array<string|number>} An array of the raw line contents.
     */
    InputSource.prototype.getRawLines = function(lineCount, returnAsString) {
        const collectedLines = [];
        for (let i = 0; i < lineCount; i++) {
            if (this._activeLineIndex > this._allInputLines.length) {
                break; // Prevent reading past the end of the input source.
            }
            const lineContent = this._allInputLines[this._activeLineIndex++];
            collectedLines.push(_processValueType(lineContent, returnAsString));
        }
        // After reading raw lines, any partially read token buffer is cleared.
        this._currentLineTokens = [];
        this._tokenReadPointer = 0;
        return collectedLines;
    };

    // The IIFE returns the InputSource constructor for external use.
    return InputSource;
})();


// Utility function to create multi-dimensional arrays, avoiding `eval` for safety and performance.
/**
 * Creates and initializes a multi-dimensional array.
 * Each element is populated using a provided initializer.
 * @param {function|any} elementInitializer A function that is called for each new element (e.g., `() => new Set()`),
 *                                          or a static value to fill each element with.
 * @param {...number} dimensions The sizes of each dimension of the array (e.g., `height, width`).
 * @returns {Array} The newly created and initialized multi-dimensional array.
 * @throws {Error} If any dimension size is invalid (non-integer or non-positive).
 */
function createNestingArray(elementInitializer, ...dimensions) {
    if (dimensions.length === 0) {
        // If no dimensions are specified, return a single initialized element.
        return typeof elementInitializer === 'function' ? elementInitializer() : elementInitializer;
    }

    /**
     * Recursive helper to build the nested array structure.
     * @param {number} currentDepth The current depth of nesting (0 for the outermost array).
     * @returns {Array} A portion of the multi-dimensional array.
     */
    const buildArrayRecursively = (currentDepth) => {
        const currentDimensionSize = dimensions[currentDepth];
        // Basic validation for dimension sizes.
        if (currentDimensionSize <= 0 || !Number.isInteger(currentDimensionSize)) {
            throw new Error(`Invalid dimension size: ${currentDimensionSize} encountered at depth ${currentDepth}. Dimensions must be positive integers.`);
        }

        const currentArray = new Array(currentDimensionSize);

        if (currentDepth === dimensions.length - 1) {
            // If this is the innermost dimension, populate with actual elements.
            for (let i = 0; i < currentDimensionSize; i++) {
                currentArray[i] = typeof elementInitializer === 'function' ? elementInitializer() : elementInitializer;
            }
        } else {
            // If not the innermost dimension, recursively create deeper arrays.
            for (let i = 0; i < currentDimensionSize; i++) {
                currentArray[i] = buildArrayRecursively(currentDepth + 1);
            }
        }
        return currentArray;
    };

    return buildArrayRecursively(0);
}

// Instantiate the input reader for standard input, using Node.js 'fs' module.
const consoleInput = new DataStreamReader(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the core problem-solving logic and print the final result.
console.log(calculateMinimumPathDifference());

/**
 * Solves a grid-based dynamic programming problem to find the minimum absolute difference sum.
 * The problem involves traversing a grid, calculating differences between two input matrices,
 * and finding the minimum absolute sum path from top-left to bottom-right.
 * @returns {number} The smallest absolute sum found at the bottom-right cell.
 */
function calculateMinimumPathDifference() {
    // Read the grid dimensions (height and width).
    const gridHeight = consoleInput.getSingleToken();
    const gridWidth = consoleInput.getSingleToken();

    // Input validation for grid dimensions.
    // Ensure dimensions are positive integers; return a default error value if invalid.
    if (gridHeight <= 0 || gridWidth <= 0 || !Number.isInteger(gridHeight) || !Number.isInteger(gridWidth)) {
        console.error(`Error: Invalid grid dimensions provided (H: ${gridHeight}, W: ${gridWidth}). Must be positive integers.`);
        return -1; // Indicate an error state or invalid input.
    }

    // Initialize a 2D array (DP table) where each cell stores a Set of possible absolute sums.
    // Each Set will hold all distinct absolute sums that can be achieved to reach that cell.
    const dpStateTable = createNestingArray(() => new Set(), gridHeight, gridWidth);

    // Read the two input matrices, 'A' and 'B', from the input stream.
    const matrixA = consoleInput.readTokenGrid(gridHeight);
    const matrixB = consoleInput.readTokenGrid(gridHeight);

    // Compute the 'delta' matrix, where each cell C[i][j] = A[i][j] - B[i][j].
    const diffMatrix = createNestingArray(0, gridHeight, gridWidth); // Initialize with 0 for numerical values.
    for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
        for (let colIdx = 0; colIdx < gridWidth; colIdx++) {
            diffMatrix[rowIdx][colIdx] = matrixA[rowIdx][colIdx] - matrixB[rowIdx][colIdx];
        }
    }

    /**
     * Helper function to safely add numerical values to a Set.
     * Filters out non-numeric or NaN values.
     * @param {Set<number>} targetSet The Set to which values should be added.
     * @param {...number} values The values to add.
     */
    const populateSetWithNumbers = (targetSet, ...values) => {
        for (const val of values) {
            if (typeof val === 'number' && !isNaN(val)) {
                targetSet.add(val);
            }
        }
    };

    // Base case for the dynamic programming: initialize the top-left cell (0, 0).
    // The only absolute sum to reach (0,0) is the absolute difference of its own cell.
    populateSetWithNumbers(dpStateTable[0][0], Math.abs(diffMatrix[0][0]));

    // Iterate through the grid to fill the DP table.
    // For each cell (row, col), calculate possible absolute sums from its valid neighbors (top and left).
    for (let row = 0; row < gridHeight; row++) {
        for (let col = 0; col < gridWidth; col++) {
            const currentCellDifference = diffMatrix[row][col];

            // Consider paths coming from the cell directly above (if not in the first row).
            if (row > 0) {
                const sumsFromAbove = dpStateTable[row - 1][col];
                for (const previousPathSum of sumsFromAbove) {
                    // Two possibilities: add or subtract the current cell's difference.
                    populateSetWithNumbers(dpStateTable[row][col],
                                           Math.abs(previousPathSum + currentCellDifference),
                                           Math.abs(previousPathSum - currentCellDifference));
                }
            }

            // Consider paths coming from the cell directly to the left (if not in the first column).
            if (col > 0) {
                const sumsFromLeft = dpStateTable[row][col - 1];
                for (const previousPathSum of sumsFromLeft) {
                    // Again, two possibilities: add or subtract the current cell's difference.
                    populateSetWithNumbers(dpStateTable[row][col],
                                           Math.abs(previousPathSum + currentCellDifference),
                                           Math.abs(previousPathSum - currentCellDifference));
                }
            }
        }
    }

    // After the DP table is fully populated, the result is the minimum value
    // found in the Set at the bottom-right cell of the grid.
    let finalMinimumAbsoluteSum = Infinity;
    const sumsInFinalCell = dpStateTable[gridHeight - 1][gridWidth - 1];

    // Iterate through the set of sums in the target cell to find the minimum.
    for (const sumValue of sumsInFinalCell) {
        if (sumValue < finalMinimumAbsoluteSum) {
            finalMinimumAbsoluteSum = sumValue;
        }
    }

    // If no sums were found (e.g., due to an empty grid or other edge cases), return 0.
    if (finalMinimumAbsoluteSum === Infinity) {
        return 0;
    }

    return finalMinimumAbsoluteSum;
}