(function (rawContentStream) {

    /**
     * @typedef {object} InputLineProcessor
     * @property {function(): number} fetchNextInteger - Retrieves and parses the next line as an integer.
     * @property {function(): string} fetchNextContentLine - Retrieves the next line as a string.
     * @property {function(): boolean} hasMoreDataSegments - Checks if there are more lines to process.
     */

    /**
     * Creates a utility to process lines from an input array.
     * This abstracts the input reading, making the main logic cleaner and more robust.
     * @param {string[]} lineArray - An array of input lines.
     * @returns {InputLineProcessor} An object with methods to read input.
     */
    const createInputLineProcessor = (lineArray) => {
        let currentReadIndex = 0; // Tracks the current line being processed.

        return {
            /**
             * Parses and returns the next line as an integer.
             * Throws an error if the end of input is reached or parsing fails.
             * @returns {number} The parsed integer.
             */
            fetchNextInteger: () => {
                if (currentReadIndex >= lineArray.length) {
                    throw new Error("End of input reached when attempting to fetch an integer.");
                }
                const numericalValue = parseInt(lineArray[currentReadIndex++].trim(), 10);
                if (isNaN(numericalValue)) {
                    throw new Error("Invalid integer format encountered: " + lineArray[currentReadIndex - 1]);
                }
                return numericalValue;
            },

            /**
             * Returns the next line as a string.
             * Throws an error if the end of input is reached.
             * @returns {string} The content of the next line.
             */
            fetchNextContentLine: () => {
                if (currentReadIndex >= lineArray.length) {
                    throw new Error("End of input reached when attempting to fetch a content line.");
                }
                return lineArray[currentReadIndex++].trim();
            },

            /**
             * Checks if there are any remaining lines to be processed.
             * @returns {boolean} True if more lines exist, false otherwise.
             */
            hasMoreDataSegments: () => currentReadIndex < lineArray.length
        };
    };

    /**
     * Determines if a square region within a grid is entirely composed of '.' characters.
     * This function's `sideAdjustedLength` parameter represents `(actual_side_length - 1)`.
     * For example, if `sideAdjustedLength` is 1, it checks a 2x2 square.
     *
     * @param {number} startColumn - The starting column index (x-coordinate).
     * @param {number} startRow - The starting row index (y-coordinate).
     * @param {number} sideAdjustedLength - The side length minus one of the square to check.
     * @param {string[]} gridDataMatrix - The 2D grid represented as an array of strings.
     * @param {number} matrixDimension - The dimension (N) of the square grid.
     * @returns {boolean} True if the specified square area is clear, false otherwise.
     */
    const verifySquareRegionClearance = (startColumn, startRow, sideAdjustedLength, gridDataMatrix, matrixDimension) => {
        const actualSideLength = sideAdjustedLength + 1; // Calculate the true side length

        // Pre-check for out-of-bounds: If the square extends beyond the grid, it's not valid.
        if (startRow + actualSideLength > matrixDimension || startColumn + actualSideLength > matrixDimension) {
            return false;
        }

        // Iterate through all cells within the proposed square region
        for (let currentRow = startRow; currentRow < startRow + actualSideLength; currentRow++) {
            for (let currentColumn = startColumn; currentColumn < startColumn + actualSideLength; currentColumn++) {
                // If any character in the square is not a '.', the region is not clear.
                if (gridDataMatrix[currentRow].charAt(currentColumn) !== '.') {
                    return false;
                }
            }
        }
        // If all checks pass, the entire square region is clear.
        return true;
    };

    /**
     * Main processing routine for a single grid block.
     * Finds the largest possible 'clear' square (all '.' characters) within the given grid
     * according to a specific greedy search algorithm.
     *
     * @param {string[]} currentGridMatrix - The N x N grid for current processing.
     * @param {number} currentMatrixDimension - The dimension N of the grid.
     * @returns {number} The `(actual_side_length - 1)` of the largest square found.
     */
    const findMaxClearSquareSideAdjusted = (currentGridMatrix, currentMatrixDimension) => {
        // `maxPossibleSideAdjusted` stores the current candidate for `(actual_side_length - 1)`.
        // It starts at 1, implying a search for a 2x2 square initially.
        let maxPossibleSideAdjusted = 1;

        // Iterate through each row of the grid.
        for (let rowCursor = 0; rowCursor < currentMatrixDimension; rowCursor++) {
            // Iterate through each column. The column cursor advances dynamically.
            for (let colCursor = 0; colCursor < currentMatrixDimension; ) {
                // Check if a square of the current `maxPossibleSideAdjusted` (e.g., 2x2 for value 1)
                // can be placed starting at (colCursor, rowCursor).
                if (verifySquareRegionClearance(colCursor, rowCursor, maxPossibleSideAdjusted, currentGridMatrix, currentMatrixDimension)) {
                    // If a clear square is found, increment `maxPossibleSideAdjusted` to try for a larger one
                    // in the next iteration, potentially at the same (colCursor, rowCursor) if the loop condition allows.
                    maxPossibleSideAdjusted++;
                } else {
                    // If the current candidate square is NOT clear, advance the column cursor
                    // by the current `maxPossibleSideAdjusted` value. This skips the failed region.
                    colCursor += maxPossibleSideAdjusted;
                }
            }
        }
        // Return the final `maxPossibleSideAdjusted` value, which represents `(max_actual_side_length - 1)`.
        return maxPossibleSideAdjusted;
    };

    // --- Program Entry Point ---

    // Normalize line endings and split the raw input into individual lines.
    const normalizedInputLines = rawContentStream.replace(/\r/g, '').split('\n');
    // Initialize the input processor utility.
    const inputProcessor = createInputLineProcessor(normalizedInputLines);

    // Main loop to process multiple grid blocks from the input.
    // The loop continues as long as there's data and the dimension isn't zero.
    while (true) {
        // Read the dimension (N) for the current grid.
        const currentGridDimension = inputProcessor.fetchNextInteger();

        // A dimension of 0 signals the end of input blocks.
        if (currentGridDimension === 0) {
            break;
        }

        // Initialize an array to hold the current grid's data.
        const currentGridData = [];
        // Populate the grid by reading N lines.
        for (let lineIndex = 0; lineIndex < currentGridDimension; lineIndex++) {
            currentGridData.push(inputProcessor.fetchNextContentLine());
        }

        // Process the current grid to find the largest clear square.
        const resultSideAdjusted = findMaxClearSquareSideAdjusted(currentGridData, currentGridDimension);

        // Output the result to the console.
        console.log(resultSideAdjusted);
    }

})(require("fs").readFileSync("/dev/stdin", "utf8")); // Read input from standard input