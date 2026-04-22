const DataStreamProcessorFactory = (function () {
    /**
     * Creates an InputProcessor instance to handle structured input data.
     * Provides a robust way to consume lines and tokens from a given text source.
     * @param {string} rawInputContent - The raw string content to be processed.
     * @returns {InputProcessor} A new instance of InputProcessor.
     */
    function createInputProcessor(rawInputContent) {
        // Validate the input content to ensure it's a string and not null/undefined.
        if (typeof rawInputContent !== 'string' || rawInputContent === null || rawInputContent === undefined) {
            console.error("Error: Input content must be a non-null string. Initializing with empty data.");
            rawInputContent = ""; // Fallback to an empty string to prevent errors.
        }
        return new InputProcessor(rawInputContent);
    }

    /**
     * @class InputProcessor
     * @description Manages the parsing and sequential extraction of data from a multi-line string.
     *              Supports reading individual tokens, full lines, or blocks of lines, with optional type conversion.
     */
    class InputProcessor {
        #lineSegments; // Stores all input lines, each split into an array of string tokens.
        #currentLinePosition; // Tracks the index of the line currently being processed.
        #tokenBufferForCurrentLine; // Holds tokens of the current line after splitting, for sequential extraction.

        /**
         * Initializes the InputProcessor with the provided source text.
         * @param {string} sourceText - The complete string content, typically from a file.
         */
        constructor(sourceText) {
            // Pre-process the source text: trim outer whitespace, then split into lines.
            // Each line is further split by spaces into tokens.
            const lines = sourceText.trim().split("\n");
            this.#lineSegments = lines.map(line => line.split(" "));

            this.#currentLinePosition = 0; // Start reading from the very first line.
            this.#tokenBufferForCurrentLine = []; // Initialize an empty buffer for tokens.
        }

        /**
         * Internal utility to safely convert a string value to a number.
         * Returns `NaN` if the conversion fails.
         * @param {string} valueToParse - The string value to convert.
         * @returns {number} The numeric representation or NaN.
         */
        #convertToNumber(valueToParse) {
            return Number(valueToParse);
        }

        /**
         * Extracts the next single token from the input stream. It processes tokens from left to right within a line.
         * Advances to the next line only when all tokens on the current line have been consumed.
         * @param {boolean} [returnAsString=false] - If true, the token is returned as a string; otherwise, it's converted to a number.
         * @returns {string|number|null} The extracted token, or `null` if no more tokens are available.
         */
        extractNextToken(returnAsString = false) {
            // If the token buffer is empty, attempt to load tokens from the next line.
            if (this.#tokenBufferForCurrentLine.length === 0) {
                // Check if there are any more lines left to process.
                if (this.#currentLinePosition >= this.#lineSegments.length) {
                    return null; // No more data to read.
                }
                // Load tokens from the current line into the buffer. Use spread operator for a shallow copy.
                this.#tokenBufferForCurrentLine = [...this.#lineSegments[this.#currentLinePosition]];
            }

            // Extract the first token from the buffer. `shift()` removes it from the array.
            const tokenValue = this.#tokenBufferForCurrentLine.shift();

            // If the buffer is now empty, it means the current line has been fully consumed.
            // Advance the line pointer to prepare for the next line.
            if (this.#tokenBufferForCurrentLine.length === 0) {
                this.#currentLinePosition++;
            }

            // Return the token, converting to number if `returnAsString` is false.
            return returnAsString ? tokenValue : this.#convertToNumber(tokenValue);
        }

        /**
         * Reads and returns all tokens from the current line, then advances to the next line.
         * Any pending tokens in the internal buffer for the current line are discarded.
         * @param {boolean} [stringsOnly=false] - If true, returns tokens as strings; otherwise, attempts conversion to numbers.
         * @returns {Array<string|number>|null} An array of tokens for the current line, or `null` if no more lines.
         */
        consumeLineAsArray(stringsOnly = false) {
            if (this.#currentLinePosition >= this.#lineSegments.length) {
                return null; // No more lines to read.
            }
            // Clear the token buffer as we are consuming the entire line at once.
            this.#tokenBufferForCurrentLine = [];

            const currentLineTokens = this.#lineSegments[this.#currentLinePosition];
            this.#currentLinePosition++; // Immediately advance to the next line.

            // Return tokens based on the `stringsOnly` flag.
            return stringsOnly ? currentLineTokens : currentLineTokens.map(token => this.#convertToNumber(token));
        }

        /**
         * Reads a specified number of consecutive lines, treating each as a single string element.
         * This method is suitable when lines themselves are the data units, potentially containing spaces.
         * @param {number} numLinesToFetch - The count of lines to retrieve.
         * @param {boolean} [retainOriginalFormat=false] - If true, returns line strings; otherwise, attempts to convert each entire line string to a number.
         * @returns {Array<string|number>|null} An array where each element is a line's content, or `null` if not enough lines.
         */
        fetchConsecutiveLines(numLinesToFetch, retainOriginalFormat = false) {
            // Basic validation for requested line count.
            if (numLinesToFetch <= 0) {
                return [];
            }
            if (this.#currentLinePosition + numLinesToFetch > this.#lineSegments.length) {
                console.error(`Warning: Requested ${numLinesToFetch} lines, but only ${this.#lineSegments.length - this.#currentLinePosition} remain.`);
                return null; // Not enough lines available.
            }
            // Clear the token buffer as we are extracting full lines.
            this.#tokenBufferForCurrentLine = [];

            const startingIndex = this.#currentLinePosition;
            const endingIndex = this.#currentLinePosition + numLinesToFetch;

            // Extract the relevant lines, joining their tokens back into single strings.
            const rawLineStrings = this.#lineSegments
                .slice(startingIndex, endingIndex)
                .map(tokens => tokens.join(" ")); // Reconstruct the original line string.

            this.#currentLinePosition = endingIndex; // Update the line pointer.

            // Return lines as strings or attempt numeric conversion based on flag.
            return retainOriginalFormat ? rawLineStrings : rawLineStrings.map(line => this.#convertToNumber(line));
        }

        /**
         * Extracts a block of lines as a 2D array (matrix). Each line is an array of tokens.
         * @param {number} rowCount - The number of rows (lines) to read for the matrix.
         * @param {boolean} [keepStrings=false] - If true, matrix elements are strings; otherwise, converted to numbers.
         * @returns {Array<Array<string|number>>|null} A 2D array representing the matrix, or `null` if insufficient lines.
         */
        extractMatrixBlock(rowCount, keepStrings = false) {
            if (rowCount <= 0) {
                return [];
            }
            if (this.#currentLinePosition + rowCount > this.#lineSegments.length) {
                console.error(`Error: Cannot extract a ${rowCount}-row matrix. Only ${this.#lineSegments.length - this.#currentLinePosition} lines are available.`);
                return null;
            }
            // Clear token buffer.
            this.#tokenBufferForCurrentLine = [];

            const matrixStart = this.#currentLinePosition;
            const matrixEnd = this.#currentLinePosition + rowCount;
            const extractedBlock = this.#lineSegments.slice(matrixStart, matrixEnd);
            this.#currentLinePosition = matrixEnd;

            if (keepStrings) {
                return extractedBlock;
            } else {
                return extractedBlock.map(row => row.map(token => this.#convertToNumber(token)));
            }
        }
    }

    return createInputProcessor; // Expose the factory.
})();

// --- Main Application Logic ---

// Utilize Node.js 'fs' module to read input from standard input stream.
const fileSystemModule = require("fs");
const rawStandardInput = fileSystemModule.readFileSync("/dev/stdin", "utf8");

// Create an instance of our custom input processor.
const inputProcessor = DataStreamProcessorFactory(rawStandardInput);

// Execute the primary algorithm and output the computed result.
console.log(calculateCyclicSymmetryScore());

/**
 * Implements the core algorithm to calculate a symmetry score based on input data.
 * This function reads a dimension N, then N lines of data, and checks for a specific
 * cyclic symmetry property within N x N windows of the data.
 * @returns {number} The total accumulated symmetry score.
 */
function calculateCyclicSymmetryScore() {
    // Read the primary dimension parameter (N) from the input.
    const matrixDimension = inputProcessor.extractNextToken(false); // Expecting a numeric value.

    // Guard clause: Validate the extracted dimension.
    if (typeof matrixDimension !== 'number' || isNaN(matrixDimension) || matrixDimension <= 0) {
        // console.warn("Invalid or non-positive matrix dimension detected. Defaulting to a score of 0.");
        return 0; // No valid processing can occur.
    }

    // Read N lines of string data. The problem implies character-level access.
    // The `true` argument ensures lines are returned as an array of strings.
    let dataSequence = inputProcessor.fetchConsecutiveLines(matrixDimension, true);

    // Another guard clause: Ensure sufficient data was read.
    if (!dataSequence || dataSequence.length !== matrixDimension) {
        // console.error("Insufficient data lines provided for the specified dimension. Exiting.");
        return 0;
    }

    // Extend the `dataSequence` to create a cyclic effect.
    // This allows for simpler modulo-less indexing when checking 'windows' that wrap around.
    // Original: `for(var i = 0; i < n; i++)s[i+n] = s[i];`
    // Type III rewrite: Using modern array concatenation for clarity.
    const extendedDataSequence = dataSequence.concat([...dataSequence]);

    let finalSymmetryTally = 0; // Accumulator for the total score.

    /**
     * Helper function to determine if a specific N x N window within the `extendedDataSequence`
     * exhibits the required symmetry.
     * Symmetry condition: `data[row_actual_idx][col_logical_idx] === data[col_actual_idx][row_logical_idx]`
     * @param {number} windowStartOffset - The starting row index for the current N x N window.
     * @param {Array<string>} dataSource - The full extended data array (e.g., `extendedDataSequence`).
     * @param {number} currentDimension - The size of the square matrix (N).
     * @returns {boolean} True if the window is symmetric, false otherwise.
     */
    const checkWindowForSymmetry = (windowStartOffset, dataSource, currentDimension) => {
        // Iterate through rows of the conceptual N x N sub-matrix.
        for (let logicalRowIndex = 0; logicalRowIndex < currentDimension; logicalRowIndex++) {
            // Iterate through columns, specifically focusing on the upper triangle (col > row)
            // to avoid redundant checks and self-comparisons.
            for (let logicalColIndex = logicalRowIndex + 1; logicalColIndex < currentDimension; logicalColIndex++) {
                // Calculate the actual row indices within the `dataSource`.
                const actualRowIdx1 = logicalRowIndex + windowStartOffset;
                const actualRowIdx2 = logicalColIndex + windowStartOffset;

                // Extract the characters at the symmetric positions.
                // Explicitly converting to String ensures consistent comparison type.
                const charA = String(dataSource[actualRowIdx1][logicalColIndex]);
                const charB = String(dataSource[actualRowIdx2][logicalRowIndex]);

                // If any pair of symmetric elements does not match, the window is not symmetric.
                if (charA !== charB) {
                    return false; // Early exit on first asymmetry found.
                }
            }
        }
        return true; // All checked pairs were symmetric.
    };

    // Iterate through all possible starting positions for the N x N window.
    // There are 'matrixDimension' distinct starting points due to the cyclic extension.
    for (let currentWindowIndex = 0; currentWindowIndex < matrixDimension; currentWindowIndex++) {
        // Use the helper function to perform the symmetry check for the current window.
        if (checkWindowForSymmetry(currentWindowIndex, extendedDataSequence, matrixDimension)) {
            // If the window is symmetric, add the 'matrixDimension' to the total tally.
            finalSymmetryTally += matrixDimension;
        }
    }

    return finalSymmetryTally; // Return the final computed score.
}