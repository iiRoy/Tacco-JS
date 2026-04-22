const InputProcessor = (function() {
    // Encapsulates logic for reading and parsing input data from a string source.
    class DataReader {
        #sourceLines; // Stores the input lines as an array. Private field.
        #currentIndex; // Tracks the current line being processed. Private field.

        /**
         * Initializes a new DataReader instance.
         * @param {string} rawInputContent The complete raw input string, typically from a file.
         */
        constructor(rawInputContent) {
            // Validate input type and content.
            if (typeof rawInputContent !== 'string' || rawInputContent.length === 0) {
                console.error("[DataReader] Provided input is not a valid string or is empty.");
                this.#sourceLines = []; // Initialize with an empty array if input is invalid.
            } else {
                // Pre-process the input: trim leading/trailing whitespace, split into lines,
                // and filter out any lines that become empty after splitting (e.g., from multiple newlines).
                this.#sourceLines = rawInputContent.trim().split(/\r?\n/).filter(line => line.length > 0);
            }
            this.#currentIndex = 0; // Start reading from the very first line.
        }

        /**
         * Retrieves a single value from the current line.
         * If the current line is a raw string, it will be parsed into tokens and reversed for efficient popping.
         * Advances the internal line pointer if the current line becomes exhausted after extraction.
         * @param {boolean} [returnAsText=false] If true, returns the value as a string; otherwise, attempts conversion to a number.
         * @returns {number|string} The extracted value, or NaN/empty string if no more input.
         */
        retrieveNextValue(returnAsText = false) {
            // Guard against reading beyond the available input lines.
            if (this.#currentIndex >= this.#sourceLines.length) {
                console.warn("[DataReader] Attempted to retrieve value beyond available input lines.");
                return returnAsText ? "" : NaN;
            }

            let currentLineTokens = this.#sourceLines[this.#currentIndex];

            // If the current line is still a raw string, it means it hasn't been processed
            // for single value extraction yet. Parse and reverse it.
            if (typeof currentLineTokens === 'string') {
                // Split by spaces, filter out empty tokens, and reverse the array.
                this.#sourceLines[this.#currentIndex] = currentLineTokens.split(' ').filter(token => token.length > 0).reverse();
                currentLineTokens = this.#sourceLines[this.#currentIndex];
            }

            // If the processed line has no tokens, advance to the next line and try again.
            if (currentLineTokens.length === 0) {
                this.#currentIndex++;
                // Recursive call to handle empty lines gracefully.
                return this.retrieveNextValue(returnAsText);
            }

            // Extract the last token (due to reversal).
            const extractedToken = currentLineTokens.pop();

            // If the line is now empty after popping, advance to the next line for subsequent reads.
            if (currentLineTokens.length === 0) {
                this.#currentIndex++;
            }

            return returnAsText ? extractedToken : Number(extractedToken);
        }

        /**
         * Reads all tokens from the current line, then advances the line pointer.
         * @param {boolean} [returnTokensAsText=false] If true, returns tokens as strings; otherwise, as numbers.
         * @returns {Array<number|string>} An array containing all values from the read line.
         */
        fetchLineTokens(returnTokensAsText = false) {
            // Guard against reading beyond the available input lines.
            if (this.#currentIndex >= this.#sourceLines.length) {
                console.warn("[DataReader] Attempted to fetch line tokens beyond available input lines.");
                return [];
            }

            const currentLineIdx = this.#currentIndex;
            this.#currentIndex++; // Advance line pointer immediately.
            const rawLineOrTokens = this.#sourceLines[currentLineIdx];

            let tokensToProcess;
            if (typeof rawLineOrTokens === 'string') {
                // If it's a string, split it directly.
                tokensToProcess = rawLineOrTokens.split(' ').filter(token => token.length > 0);
            } else {
                // If it's already an array (e.g., partially consumed by retrieveNextValue),
                // reverse it back to original order and join to re-split consistently.
                // This ensures fetchLineTokens always processes the full original line.
                tokensToProcess = rawLineOrTokens.reverse().join(' ').split(' ').filter(token => token.length > 0);
            }

            if (returnTokensAsText) {
                return tokensToProcess;
            } else {
                const numericTokens = [];
                // Explicit loop for Type III change instead of using `map`.
                for (let i = 0; i < tokensToProcess.length; i++) {
                    numericTokens.push(Number(tokensToProcess[i]));
                }
                return numericTokens;
            }
        }

        /**
         * Reads a specified number of lines, parsing each into an array of tokens, forming a matrix.
         * @param {number} linesCount The number of lines to read for the matrix.
         * @param {boolean} [returnElementsAsText=false] If true, returns elements as strings; otherwise, as numbers.
         * @returns {Array<Array<number|string>>} A 2D array (matrix) of values.
         */
        readBlockOfLines(linesCount, returnElementsAsText = false) {
            if (linesCount <= 0) {
                return [];
            }

            const matrixResult = [];
            // Calculate actual number of lines available to read, preventing out-of-bounds.
            let actualLinesToRead = Math.min(linesCount, this.#sourceLines.length - this.#currentIndex);

            if (actualLinesToRead < linesCount) {
                console.warn(`[DataReader] Requested ${linesCount} lines for block read, but only ${actualLinesToRead} are available.`);
            }

            for (let i = 0; i < actualLinesToRead; i++) {
                const currentLineContent = this.#sourceLines[this.#currentIndex++];
                // Split each line into tokens, filtering out any empty strings.
                const lineTokens = currentLineContent.split(' ').filter(token => token.length > 0);

                if (returnElementsAsText) {
                    matrixResult.push(lineTokens);
                } else {
                    const numericRow = [];
                    // Explicit loop for Type III change.
                    for (let j = 0; j < lineTokens.length; j++) {
                        numericRow.push(Number(lineTokens[j]));
                    }
                    matrixResult.push(numericRow);
                }
            }
            return matrixResult;
        }

        /**
         * Reads a specified number of lines, treating each line as a single value.
         * @param {number} linesCount The number of lines to read.
         * @param {boolean} [returnElementsAsText=false] If true, returns lines as raw strings; otherwise, as numbers.
         * @returns {Array<number|string>} A flat array of values, one per line.
         */
        readRawLines(linesCount, returnElementsAsText = false) {
            if (linesCount <= 0) {
                return [];
            }

            const listResult = [];
            // Calculate actual number of lines available to read.
            let actualLinesToRead = Math.min(linesCount, this.#sourceLines.length - this.#currentIndex);

            if (actualLinesToRead < linesCount) {
                console.warn(`[DataReader] Requested ${linesCount} raw lines, but only ${actualLinesToRead} are available.`);
            }

            for (let i = 0; i < actualLinesToRead; i++) {
                const currentLineContent = this.#sourceLines[this.#currentIndex++];
                if (returnElementsAsText) {
                    listResult.push(currentLineContent);
                } else {
                    listResult.push(Number(currentLineContent)); // Convert entire line to a number.
                }
            }
            return listResult;
        }
    }

    /**
     * Factory function to create and return a DataReader instance.
     * This provides a clean interface for obtaining a reader object.
     * @param {string} inputStringSource The raw input string to be processed.
     * @returns {DataReader} An initialized DataReader object.
     */
    function createInputReader(inputStringSource) {
        return new DataReader(inputStringSource);
    }

    return createInputReader;
})();


// Acquire the Node.js 'fs' (file system) module for reading input.
const fileSystemModule = require("fs");
// Read the entire content of standard input synchronously, decoded as UTF-8.
const programInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");

// Create an instance of our custom input reader with the obtained data.
const dataReaderInstance = InputProcessor(programInputData);

// Execute the main problem-solving routine and print its computed result to standard output.
console.log(solveGridPathProblem());

/**
 * Implements the core logic of the problem: finding the minimum clear path width
 * in a grid with specified obstacles.
 * @returns {number} The calculated minimum clear width.
 */
function solveGridPathProblem() {
    // Read the grid dimensions and the total count of obstacles from input.
    const gridHeight = dataReaderInstance.retrieveNextValue();
    const gridWidth = dataReaderInstance.retrieveNextValue();
    const totalObstaclesCount = dataReaderInstance.retrieveNextValue();

    // Initialize a data structure to represent the grid's obstacle state.
    // We use an array where each index corresponds to a row, and each element is a Map.
    // The Map stores column indices where obstacles are present, mapping them to a boolean `true`.
    // This allows for sparse storage and efficient lookups of obstacles within a row.
    const obstaclePresenceGrid = Array.from({ length: gridHeight + 1 }, () => new Map());

    // Process each obstacle provided in the input.
    for (let currentObstacleIteration = 0; currentObstacleIteration < totalObstaclesCount; currentObstacleIteration++) {
        // Each line represents an obstacle's coordinates: [column, row].
        const obstacleLocation = dataReaderInstance.fetchLineTokens();
        const obstacleColumn = obstacleLocation[0];
        const obstacleRow = obstacleLocation[1];

        // Apply a specific problem constraint:
        // Ignore obstacles where the column index is strictly less than the row index.
        if (obstacleColumn < obstacleRow) {
            continue; // Skip processing this obstacle.
        }

        // Mark the obstacle's presence in the grid.
        // We use `set(column, true)` to indicate an obstacle exists at that (row, column).
        obstaclePresenceGrid[obstacleRow].set(obstacleColumn, true);
    }

    // Introduce virtual obstacles at `gridWidth + 1` for every row.
    // This simplifies boundary checks in the main pathfinding loop, ensuring there's always
    // an obstacle to "stop" the path at the right edge, even if `gridWidth` itself is clear.
    for (let rowIdx = 1; rowIdx <= gridHeight; rowIdx++) {
        obstaclePresenceGrid[rowIdx].set(gridWidth + 1, true);
    }

    // Determine the initial minimum clear path width based on the first row's obstacles.
    // This assumes that the path starts at column 1 and must navigate around obstacles.
    let currentMinimumClearWidth = gridWidth + 1; // Default to the width of the virtual obstacle.

    // Retrieve and sort all obstacle column keys for the first row.
    const firstRowObstacleColumns = Array.from(obstaclePresenceGrid[1].keys()).sort((a, b) => a - b);

    // If there are obstacles in the first row, the initial clear width is determined by the first one.
    if (firstRowObstacleColumns.length > 0) {
        currentMinimumClearWidth = firstRowObstacleColumns[0];
    }
    // The actual path width is one less than the column of the first obstacle.
    let finalAnswerPathWidth = currentMinimumClearWidth - 1;

    // Initialize the current horizontal position for tracing the path.
    // The path conceptually starts from column 1, and we check from column 2 onwards.
    let currentHorizontalPathPosition = 2;

    // Iterate through the grid rows, starting from the second row.
    // The loop continues as long as the current row is within the calculated minimum clear path width
    // and also within the overall grid height.
    for (
        let activeRow = 2;
        activeRow <= finalAnswerPathWidth && activeRow <= gridHeight;
        activeRow++
    ) {
        // Advance `currentHorizontalPathPosition` until it finds a column without an obstacle
        // in the current `activeRow`. This ensures the path is always clear up to this point.
        while (obstaclePresenceGrid[activeRow].has(currentHorizontalPathPosition)) {
            currentHorizontalPathPosition++;
        }

        // Retrieve and sort obstacles for the current row to find the next relevant one.
        const obstaclesInThisRow = Array.from(obstaclePresenceGrid[activeRow].keys()).sort((a, b) => a - b);

        // Iterate through the obstacles in the current row.
        for (const obstacleColPosition of obstaclesInThisRow) {
            // We are only interested in obstacles that are *after* our current path position.
            // If an obstacle is at or before `currentHorizontalPathPosition`, it has already been
            // accounted for by the `while` loop or is not relevant for narrowing the path.
            if (currentHorizontalPathPosition >= obstacleColPosition) {
                continue;
            }

            // If we find an obstacle that is further to the right, it might impose a new,
            // smaller `finalAnswerPathWidth`. The path must end just before this obstacle.
            if (obstacleColPosition - 1 < finalAnswerPathWidth) {
                finalAnswerPathWidth = obstacleColPosition - 1;
            }
            // Once the first relevant obstacle (i.e., the one immediately to the right of `currentHorizontalPathPosition`)
            // is found and potentially updates the `finalAnswerPathWidth`, we can stop checking
            // other obstacles in this row, as they will be even further right.
            break;
        }

        // Increment the horizontal path position for the next row's iteration.
        currentHorizontalPathPosition++;

        // If the `currentHorizontalPathPosition` exceeds the `gridWidth`, it means we've
        // successfully navigated past all relevant obstacles up to the grid boundary.
        // No further rows need to be checked, as the path cannot extend further horizontally.
        if (currentHorizontalPathPosition > gridWidth) {
            break;
        }
    }

    // Return the calculated minimum clear path width.
    return finalAnswerPathWidth;
}