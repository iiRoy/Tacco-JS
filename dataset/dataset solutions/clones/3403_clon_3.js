const InputParserUtility = (function() {

    /**
     * @class DataStreamReader - A specialized utility for sequential reading and parsing of input data.
     *                           It maintains an internal buffer for lines and tokens to support
     *                           both token-by-token and line-by-line consumption, ensuring
     *                           each reading method operates on the appropriate data state.
     */
    class DataStreamReader {
        /**
         * Constructs an instance of DataStreamReader.
         * @param {string} inputText - The complete raw input string to be processed.
         */
        constructor(inputText) {
            // Stores all original input lines as an array of strings.
            this.rawInputLines = inputText.trim().split('\n');
            // Points to the index of the next line to be consumed by line-oriented methods.
            this.globalLineIndex = 0;
            // A temporary buffer to hold tokens when a line is being processed token-by-token.
            this.currentTokenBuffer = [];
            // Tracks the current position within the `currentTokenBuffer`.
            this.currentTokenIndex = 0;

            // A consistent function for converting values to numbers.
            this.numericConverter = val => Number(val);
        }

        /**
         * Ensures that the `currentTokenBuffer` is prepared and loaded with tokens
         * from the current line if it's empty or fully consumed.
         * @private
         */
        _prepareTokenBuffer() {
            // If the current token buffer is exhausted and there are more raw lines,
            // load the next raw line into the token buffer.
            if (this.currentTokenIndex >= this.currentTokenBuffer.length && this.globalLineIndex < this.rawInputLines.length) {
                const currentLineText = this.rawInputLines[this.globalLineIndex];
                this.currentTokenBuffer = currentLineText.split(' ');
                this.currentTokenIndex = 0; // Reset token index for the new line.
            }
        }

        /**
         * Retrieves and consumes the next individual token from the input stream.
         * This method manages its own internal token buffer and advances the `globalLineIndex`
         * only when the current line's tokens are fully exhausted by `retrieveNextToken` calls.
         * @param {boolean} [returnAsString=false] - If true, returns the token as a string; otherwise, as a number.
         * @returns {string|number} The next available token from the input.
         * @throws {Error} If an attempt is made to read past the end of the input.
         */
        retrieveNextToken(returnAsString = false) {
            this._prepareTokenBuffer();

            // If, after preparing, there are still no tokens, the input stream is exhausted.
            if (this.currentTokenIndex >= this.currentTokenBuffer.length) {
                throw new Error("Input stream exhausted. No more tokens available for retrieval.");
            }

            const nextToken = this.currentTokenBuffer[this.currentTokenIndex];
            this.currentTokenIndex++; // Advance token index within the buffer.

            // If all tokens on the current line have been consumed,
            // advance the global line pointer to the next raw line and reset the token buffer state.
            if (this.currentTokenIndex >= this.currentTokenBuffer.length) {
                this.globalLineIndex++;
                this.currentTokenBuffer = []; // Clear buffer.
                this.currentTokenIndex = 0;   // Reset token index.
            }

            return returnAsString ? nextToken : this.numericConverter(nextToken);
        }

        /**
         * Reads an entire line from the input stream, splits it into tokens, and advances the `globalLineIndex`.
         * This method always reads directly from `rawInputLines` and is not affected by `retrieveNextToken`'s
         * internal token buffer, ensuring it always gets the original line content.
         * @param {boolean} [returnAsString=false] - If true, returns tokens as strings; otherwise, as numbers.
         * @returns {Array<string|number>} An array containing all tokens from the consumed line.
         * @throws {Error} If an attempt is made to read past the end of the input.
         */
        readFullLine(returnAsString = false) {
            if (this.globalLineIndex >= this.rawInputLines.length) {
                throw new Error("Input stream exhausted. Cannot read a full line.");
            }

            // Get the current line's raw string content and advance the global line pointer.
            const lineContent = this.rawInputLines[this.globalLineIndex++];

            // Clear any pending token buffer state, as this line is now fully consumed by this method.
            this.currentTokenBuffer = [];
            this.currentTokenIndex = 0;

            const tokens = lineContent.split(' ');
            return returnAsString ? tokens : tokens.map(this.numericConverter);
        }

        /**
         * Reads a specified number of lines, splitting each into tokens, suitable for matrix-like data.
         * @param {number} numRows - The total number of lines to read for the matrix.
         * @param {boolean} [returnAsString=false] - If true, returns tokens as strings; otherwise, as numbers.
         * @returns {Array<Array<string|number>>} A 2D array representing the matrix of tokens.
         * @throws {Error} If an attempt is made to read past the end of the input.
         */
        readMatrixData(numRows, returnAsString = false) {
            if (this.globalLineIndex + numRows > this.rawInputLines.length) {
                throw new Error(`Input stream exhausted. Unable to read ${numRows} lines for matrix data.`);
            }

            const matrixRows = [];
            for (let k = 0; k < numRows; k++) {
                const lineContent = this.rawInputLines[this.globalLineIndex + k];
                const tokens = lineContent.split(' ');
                matrixRows.push(returnAsString ? tokens : tokens.map(this.numericConverter));
            }

            this.globalLineIndex += numRows; // Advance the global line pointer by the number of rows read.
            // Clear any pending token buffer state.
            this.currentTokenBuffer = [];
            this.currentTokenIndex = 0;

            return matrixRows;
        }

        /**
         * Reads a specified number of lines directly without splitting them into individual tokens.
         * @param {number} count - The number of raw lines to read.
         * @param {boolean} [returnAsString=false] - If true, returns lines as strings; otherwise, attempts to convert each line to a number.
         * @returns {Array<string|number>} An array containing the raw (or numerically converted) lines.
         * @throws {Error} If an attempt is made to read past the end of the input.
         */
        readMultipleLines(count, returnAsString = false) {
            if (this.globalLineIndex + count > this.rawInputLines.length) {
                throw new Error(`Input stream exhausted. Unable to read ${count} lines.`);
            }

            const lines = this.rawInputLines.slice(this.globalLineIndex, this.globalLineIndex + count);
            this.globalLineIndex += count; // Advance the global line pointer.
            // Clear any pending token buffer state.
            this.currentTokenBuffer = [];
            this.currentTokenIndex = 0;

            return returnAsString ? lines : lines.map(this.numericConverter);
        }
    }

    // Returns a factory function that creates new DataStreamReader instances.
    return function createInputReader(sourceText) {
        return new DataStreamReader(sourceText);
    };
})();

// Initialize the input stream by reading from standard input.
const inputDataSource = InputParserUtility(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main grid processing logic and output its result.
console.log(processGridObstacleNavigation());

/**
 * Implements the core logic for navigating a grid with obstacles.
 * This function determines the minimum reachable column index given a set of obstacles.
 * @returns {number} The calculated minimum available column index.
 */
function processGridObstacleNavigation() {
    // Retrieve grid dimensions and the total number of obstacles from the input stream.
    const gridHeight = inputDataSource.retrieveNextToken();
    const gridWidth = inputDataSource.retrieveNextToken();
    const totalObstacles = inputDataSource.retrieveNextToken();

    // Type III: Add input validation for grid dimensions.
    if (gridHeight <= 0 || gridWidth <= 0) {
        // For invalid dimensions, a path cannot be meaningfully calculated.
        // Returning 0 indicates an invalid or unnavigable grid.
        return 0;
    }

    // Initialize the obstacle map using an array of Maps for efficient sparse data storage.
    // Each index (representing a row) holds a Map where keys are obstacle column indices.
    const obstacleLocations = Array.from({ length: gridHeight + 1 }, () => new Map());

    // Populate the obstacle map with data from the input.
    for (let obstacleCounter = 0; obstacleCounter < totalObstacles; obstacleCounter++) {
        const obstacleCoords = inputDataSource.readFullLine();
        const obstacleColumn = obstacleCoords[0];
        const obstacleRow = obstacleCoords[1];

        // Original logic: Skip obstacles where the column index is less than the row index.
        // This effectively filters obstacles that are "too far left" relative to a diagonal path.
        if (obstacleColumn < obstacleRow) {
            continue;
        }

        // Mark the presence of an obstacle at the specified (row, column) using a boolean flag.
        obstacleLocations[obstacleRow].set(obstacleColumn, true);
    }

    // Type III: Add a right boundary obstacle to all rows.
    // This ensures that `minimumReachableColumn` is always bounded and calculable,
    // even if no other obstacles are present in a row.
    const rightmostBoundaryColumn = gridWidth + 1;
    for (let currentGridRow = 1; currentGridRow <= gridHeight; currentGridRow++) {
        obstacleLocations[currentGridRow].set(rightmostBoundaryColumn, true);
    }

    // Initialize `minimumReachableColumn`.
    // This represents the current best (smallest) column index that a path can reach.
    // It's initially set based on the first obstacle in the very first row.
    const firstRowObstacleColumns = Array.from(obstacleLocations[1].keys());
    let minimumReachableColumn;

    if (firstRowObstacleColumns.length === 0) {
        // This case should theoretically not happen due to `rightmostBoundaryColumn`.
        // However, for robustness, if no obstacles are found, the path can reach `gridWidth`.
        minimumReachableColumn = gridWidth;
    } else {
        minimumReachableColumn = Math.min(...firstRowObstacleColumns) - 1;
    }

    // Initialize `pathTraversalColumn`. This pointer tracks the current column
    // being considered for the path in the current row, starting from column 2.
    let pathTraversalColumn = 2;

    // Iterate through the grid rows, starting from the second row.
    for (let currentGridRow = 2; currentGridRow <= gridHeight; currentGridRow++) {
        // Advance `pathTraversalColumn` until it points to the first *free* cell
        // (i.e., not an obstacle) in the current row, moving rightwards.
        while (obstacleLocations[currentGridRow].has(pathTraversalColumn)) {
            pathTraversalColumn++;
        }

        // Optimization: If `pathTraversalColumn` has already exceeded `minimumReachableColumn`,
        // it means we've hit an obstacle further left than our current best path,
        // so we cannot improve the answer. Break early.
        if (pathTraversalColumn > minimumReachableColumn) {
            break;
        }

        // Type III: Retrieve and sort obstacle columns for the current row.
        // Sorting ensures we process obstacles from left to right,
        // allowing us to find the *first* relevant obstacle efficiently.
        const sortedObstaclesInCurrentRow = Array.from(obstacleLocations[currentGridRow].keys()).sort((colA, colB) => colA - colB);

        // Examine each obstacle in the current row to potentially update `minimumReachableColumn`.
        for (const currentObstacleCol of sortedObstaclesInCurrentRow) {
            // If the `pathTraversalColumn` is already at or past this obstacle,
            // this obstacle is not relevant for finding a new, tighter leftmost boundary.
            if (pathTraversalColumn >= currentObstacleCol) {
                continue;
            }

            // If we found an obstacle to the right of `pathTraversalColumn`,
            // check if the column just before this obstacle (`currentObstacleCol - 1`)
            // provides a new, smaller `minimumReachableColumn`.
            if (currentObstacleCol - 1 < minimumReachableColumn) {
                minimumReachableColumn = currentObstacleCol - 1;
            }
            // Once the first relevant obstacle (leftmost one to the right of `pathTraversalColumn`)
            // is found for this row, we can stop searching for others in this row.
            break;
        }

        // Advance `pathTraversalColumn` for the consideration of the next row.
        // This implies a diagonal movement tendency for the path.
        pathTraversalColumn++;
    }

    return minimumReachableColumn;
}