const InputReader = (function () {
    // Helper function to safely convert a string to a number.
    // Returns null if the conversion results in NaN.
    const convertToNumber = (strValue) => {
        const num = Number(strValue);
        return isNaN(num) ? null : num;
    };

    // The primary factory function to instantiate a new stream reader.
    function createStreamReader(sourceDataString) {
        return new StreamDataHandler(sourceDataString);
    }

    // Class definition for handling the input data stream line by line.
    class StreamDataHandler {
        // Private field to store processed input lines.
        // Each line can be an array of tokens (strings) or a raw string initially.
        #processedInputLines;
        // Private field to keep track of the current line being read.
        #currentReadPointer;

        /**
         * Constructor for StreamDataHandler.
         * Initializes the input stream by trimming and splitting the raw string into lines.
         * @param {string} initialInput The raw string input from the source (e.g., /dev/stdin).
         */
        constructor(initialInput) {
            this.#processedInputLines = initialInput.trim().split("\n");
            this.#currentReadPointer = 0;
        }

        /**
         * Retrieves a single token (value) from the current line.
         * Tokens are extracted from the end of the line (LIFO).
         * Advances to the next line if the current line becomes empty after extraction.
         * @param {boolean} [returnAsString=false] If true, returns the token as a string; otherwise, attempts number conversion.
         * @returns {string|number|null} The extracted token, or null if no valid token/line.
         */
        getSingleToken(returnAsString = false) {
            if (this.#currentReadPointer >= this.#processedInputLines.length) {
                return null; // No more lines to read.
            }

            let activeLineContent = this.#processedInputLines[this.#currentReadPointer];

            // If the current line is still a raw string, split it into tokens and reverse for efficient `pop()`.
            if (typeof activeLineContent === 'string') {
                this.#processedInputLines[this.#currentReadPointer] = activeLineContent.split(" ").reverse();
                activeLineContent = this.#processedInputLines[this.#currentReadPointer];
            }

            if (!activeLineContent || activeLineContent.length === 0) {
                this.#currentReadPointer++; // Skip empty or already exhausted line.
                return null;
            }

            const extractedValue = activeLineContent.pop(); // Get the last token from the reversed array.

            // If the current line is now empty, increment the line pointer.
            if (activeLineContent.length === 0) {
                this.#currentReadPointer++;
            }

            return returnAsString ? extractedValue : convertToNumber(extractedValue);
        }

        /**
         * Reads and processes an entire line of tokens.
         * Advances the line pointer after reading.
         * @param {boolean} [returnAsString=false] If true, returns tokens as strings; otherwise, attempts number conversion.
         * @returns {Array<string|number>} An array of tokens from the line.
         */
        getEntireLineTokens(returnAsString = false) {
            if (this.#currentReadPointer >= this.#processedInputLines.length) {
                return []; // End of stream.
            }

            const rawCurrentLine = this.#processedInputLines[this.#currentReadPointer];
            this.#currentReadPointer++; // Move to the next line immediately.

            const tokens = rawCurrentLine.split(" ");
            return returnAsString ? tokens : tokens.map(convertToNumber);
        }

        /**
         * Reads a specified number of lines and formats them as a 2D matrix.
         * Advances the line pointer by `lineCount`.
         * @param {number} lineCount The number of lines to read for the matrix.
         * @param {boolean} [returnAsString=false] If true, returns matrix elements as strings; otherwise, as numbers.
         * @returns {Array<Array<string|number>>} A 2D array (matrix).
         */
        readMatrixBlock(lineCount, returnAsString = false) {
            if (lineCount <= 0 || !Number.isInteger(lineCount)) {
                console.warn(`Warning: Invalid line count for matrix read: ${lineCount}. Returning empty array.`);
                return [];
            }

            const startIdx = this.#currentReadPointer;
            const endIdx = Math.min(startIdx + lineCount, this.#processedInputLines.length);

            // Extract the relevant lines and then update the global line pointer.
            const rawLinesForMatrix = this.#processedInputLines.slice(startIdx, endIdx);
            this.#currentReadPointer = endIdx; // Advance the pointer to after the matrix block.

            return rawLinesForMatrix.map(line => {
                const tokens = line.split(" ");
                return returnAsString ? tokens : tokens.map(convertToNumber);
            });
        }

        /**
         * Reads a specified number of lines and returns them as a 1D array.
         * Each line becomes an element in the resulting array.
         * Advances the line pointer by `lineCount`.
         * @param {number} lineCount The number of lines to read.
         * @param {boolean} [returnAsString=false] If true, returns elements as strings; otherwise, as numbers.
         * @returns {Array<string|number>} A 1D array of lines.
         */
        readLinesIntoArray(lineCount, returnAsString = false) {
            if (lineCount <= 0 || !Number.isInteger(lineCount)) {
                console.warn(`Warning: Invalid line count for array read: ${lineCount}. Returning empty array.`);
                return [];
            }

            const startIndex = this.#currentReadPointer;
            const endIndex = Math.min(startIndex + lineCount, this.#processedInputLines.length);

            // Fetch the lines and update the current read position.
            const extractedLines = this.#processedInputLines.slice(startIndex, endIndex);
            this.#currentReadPointer = endIndex; // Move pointer past the extracted lines.

            return returnAsString ? extractedLines : extractedLines.map(convertToNumber);
        }
    }

    return createStreamReader; // Expose the factory function.
})();

/**
 * Creates a multi-dimensional array initialized with a specified default value.
 * This function recursively builds the array structure, avoiding `eval`.
 *
 * @param {*} defaultValue The value to initialize all elements with.
 * @param {...number} dimensions A list of integers representing the size of each dimension.
 * @returns {Array} The initialized multi-dimensional array.
 * @throws {Error} If no dimensions are provided or if any dimension is not a non-negative integer.
 */
function initializeMultiDimensionalArray(defaultValue, ...dimensions) {
    if (!dimensions || dimensions.length === 0) {
        throw new Error("Initialization requires at least one dimension.");
    }
    for (const dimSize of dimensions) {
        if (!Number.isInteger(dimSize) || dimSize < 0) {
            throw new Error(`Array dimension must be a non-negative integer. Received: ${dimSize}`);
        }
    }

    // Recursive helper to build the array layer by layer.
    const createDimensionLayer = (currentDimensionIndex) => {
        if (currentDimensionIndex === dimensions.length - 1) {
            // Base case: This is the innermost dimension, fill with defaultValue.
            return Array(dimensions[currentDimensionIndex]).fill(defaultValue);
        } else {
            // Recursive step: Create an array, and for each element, create the next dimension layer.
            const currentLayerSize = dimensions[currentDimensionIndex];
            return Array(currentLayerSize).fill(null).map(() => createDimensionLayer(currentDimensionIndex + 1));
        }
    };

    return createDimensionLayer(0); // Start building from the outermost dimension.
}

// Instantiate the input processor by reading from standard input.
const dataInputProcessor = InputReader(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main logic and print the result.
console.log(executeGridTransformation());

/**
 * Main function orchestrating the grid generation and transformation.
 * Reads input parameters, constructs a grid, applies specific patterns,
 * and formats the output as a string.
 * @returns {string} The formatted transformed grid.
 */
function executeGridTransformation() {
    // Retrieve grid dimensions and split points from the input stream.
    const gridHeight = dataInputProcessor.getSingleToken();
    const gridWidth = dataInputProcessor.getSingleToken();
    const horizontalSplitPoint = dataInputProcessor.getSingleToken();
    const verticalSplitPoint = dataInputProcessor.getSingleToken();

    // Perform basic validation on the obtained input values.
    if ([gridHeight, gridWidth, horizontalSplitPoint, verticalSplitPoint].some(val => val === null || val < 0)) {
        return "Error: One or more input parameters are invalid or missing.";
    }

    // Initialize a 2D array (grid) filled with zeros based on the parsed dimensions.
    const resultGrid = initializeMultiDimensionalArray(0, gridHeight, gridWidth);

    // Flag to control the vertical flipping operation.
    let applyVerticalFlip = false;

    // Iterate through each row of the grid.
    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        // The vertical flip state changes once the rowIndex reaches or exceeds the verticalSplitPoint.
        if (rowIndex >= verticalSplitPoint) {
            applyVerticalFlip = true;
        }

        // Iterate through each column in the current row.
        for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
            // Apply the horizontal pattern: set to 1 if column index is at or beyond horizontalSplitPoint.
            if (colIndex >= horizontalSplitPoint) {
                resultGrid[rowIndex][colIndex] = 1;
            }

            // If vertical flipping is active for this row, XOR the current cell value with 1.
            // This effectively toggles 0 to 1 and 1 to 0.
            if (applyVerticalFlip) {
                resultGrid[rowIndex][colIndex] ^= 1;
            }
        }
    }

    // Format the final grid into a single string.
    // Each row's elements are joined without spaces, and rows are separated by newlines.
    const outputString = resultGrid.map(rowArray => rowArray.join("")).join("\n");

    return outputString;
}