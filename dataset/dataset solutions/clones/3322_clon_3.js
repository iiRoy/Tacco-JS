const InputParserFactory = (function () {
    /**
     * Constructs a new LineReader instance.
     * @param {string} sourceContent - The raw string content to be parsed.
     * @returns {LineReader} An instance of LineReader.
     */
    function createReader(sourceContent) {
        return new LineReader(sourceContent);
    }

    /**
     * Manages reading lines and elements from a provided text buffer.
     * @class
     */
    function LineReader(sourceContent) {
        // Store lines, filtering out empty ones for cleaner processing.
        this.dataLines = sourceContent.split(/\r?\n/).filter(line => line.trim() !== '');
        this.currentLinePointer = 0; // Tracks the current line being processed.
        this.totalLines = this.dataLines.length; // Total number of lines available.
    }

    LineReader.prototype = {
        /**
         * Retrieves the last space-separated element from the current line.
         * Advances the line pointer if the line becomes empty after extraction.
         * @param {boolean} [returnAsString=false] - If true, returns the element as a string; otherwise, as a number.
         * @returns {string|number|null} The last element, or null if no more lines or elements.
         */
        extractLastNumericValue: function (returnAsString = false) {
            if (this.currentLinePointer >= this.totalLines) {
                console.warn("Attempted to read beyond available input lines.");
                return null; // No more lines to read.
            }

            let activeLineContent = this.dataLines[this.currentLinePointer];
            // If the line is still a string, split it into elements.
            if (typeof activeLineContent === "string") {
                // Split by spaces, filter out empty strings, and store back as an array.
                this.dataLines[this.currentLinePointer] = activeLineContent.split(/\s+/).filter(Boolean);
            }

            let lineElements = this.dataLines[this.currentLinePointer];
            if (!lineElements || lineElements.length === 0) {
                this.currentLinePointer++; // Advance if line is already empty.
                return null;
            }

            // Extract the last element.
            const extractedElement = lineElements.pop();
            // If the line is now empty, advance to the next line.
            if (lineElements.length === 0) {
                this.currentLinePointer++;
            }

            return returnAsString ? extractedElement : Number(extractedElement);
        },

        /**
         * Reads the entire current line, splitting it into elements.
         * Advances the line pointer after reading.
         * @param {boolean} [returnAsStrings=false] - If true, returns elements as strings; otherwise, as numbers.
         * @returns {Array<string|number>} An array of elements from the line.
         */
        readNextLineElements: function (returnAsStrings = false) {
            if (this.currentLinePointer >= this.totalLines) {
                console.warn("Attempted to read beyond available input lines.");
                return []; // No more lines to read.
            }

            const currentLine = this.dataLines[this.currentLinePointer++];
            const elements = currentLine.split(/\s+/).filter(Boolean); // Split by any whitespace and remove empty strings.

            if (returnAsStrings) {
                return elements;
            } else {
                return elements.map(item => Number(item));
            }
        },

        /**
         * Reads a specified number of lines as a matrix (array of arrays).
         * Advances the line pointer by the number of lines read.
         * @param {number} numRows - The number of rows (lines) to read.
         * @param {boolean} [returnAsStrings=false] - If true, returns elements as strings; otherwise, as numbers.
         * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
         */
        readMultiLineMatrix: function (numRows, returnAsStrings = false) {
            const resultMatrix = [];
            const endIndex = Math.min(this.currentLinePointer + numRows, this.totalLines);

            // Guard against reading too many lines
            if (this.currentLinePointer >= endIndex) {
                console.warn(`Cannot read ${numRows} rows. Only ${this.totalLines - this.currentLinePointer} lines remaining.`);
                return resultMatrix;
            }

            for (let i = this.currentLinePointer; i < endIndex; i++) {
                const currentLine = this.dataLines[i];
                const rowElements = currentLine.split(/\s+/).filter(Boolean);
                resultMatrix.push(returnAsStrings ? rowElements : rowElements.map(val => Number(val)));
            }
            this.currentLinePointer = endIndex; // Update pointer after reading.
            return resultMatrix;
        },

        /**
         * Reads a specified number of raw lines without splitting them into elements.
         * Advances the line pointer by the number of lines read.
         * @param {number} lineCount - The number of raw lines to read.
         * @param {boolean} [convertAllToNumbers=false] - If true, attempts to convert each line to a number.
         * @returns {Array<string|number>} An array of raw lines or converted numbers.
         */
        readRawLineBlock: function (lineCount, convertAllToNumbers = false) {
            const rawLines = [];
            const startIdx = this.currentLinePointer;
            const endIdx = Math.min(startIdx + lineCount, this.totalLines);

            // Efficiently slice the array for raw lines.
            const slicedLines = this.dataLines.slice(startIdx, endIdx);
            this.currentLinePointer = endIdx; // Update pointer.

            if (convertAllToNumbers) {
                return slicedLines.map(line => Number(line.trim()));
            } else {
                return slicedLines;
            }
        }
    };

    return createReader;
})();

// Initialize the input reader with content from standard input.
// Using 'let' for block scoping and clarity.
let inputReader = InputParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the primary calculation function and output its result.
console.log(calculateExpectedOutcome());

/**
 * Calculates the probability of having at least half successes in a series of trials.
 * @returns {number} The calculated probability.
 */
function calculateExpectedOutcome() {
    // Read the total number of items (N) from the input.
    // Using a more descriptive variable name.
    const totalItems = inputReader.extractLastNumericValue();

    // Basic validation for input.
    if (totalItems === null || totalItems <= 0) {
        console.error("Invalid or missing total number of items.");
        return 0.0;
    }

    // Read the list of individual success probabilities.
    const individualProbabilities = inputReader.readNextLineElements();

    // Ensure the number of probabilities matches the total items.
    if (individualProbabilities.length !== totalItems) {
        console.error("Mismatch between total items and number of probabilities provided.");
        return 0.0;
    }

    // Initialize dynamic programming array.
    // currentDPState[k] will store the probability of exactly 'k' successes.
    // For the first item (index 0):
    // currentDPState[0] = P(0 successes) = 1 - P(first item success)
    // currentDPState[1] = P(1 success) = P(first item success)
    let currentDPState = new Array(totalItems + 1).fill(0);
    const firstItemProb = individualProbabilities[0];
    currentDPState[0] = 1.0 - firstItemProb;
    currentDPState[1] = firstItemProb;

    // Iterate through the remaining items (from the second item onwards).
    for (let itemIdx = 1; itemIdx < totalItems; itemIdx++) {
        const currentItemProb = individualProbabilities[itemIdx];
        const currentItemFailureProb = 1.0 - currentItemProb;

        // Create a temporary array to store the next DP state,
        // preventing overwriting values needed for current calculations.
        // This is an alternative to the in-place right-to-left update seen in the original code.
        let nextDPState = new Array(totalItems + 1).fill(0);

        // Calculate probability of 0 successes for the current item.
        nextDPState[0] = currentDPState[0] * currentItemFailureProb;

        // Calculate probabilities for 1 to `itemIdx + 1` successes.
        for (let successCount = 1; successCount <= itemIdx + 1; successCount++) {
            // Probability of `successCount` successes considering `itemIdx`:
            // 1. `successCount-1` successes in previous `itemIdx-1` items AND current `itemIdx` item is a success.
            // 2. `successCount` successes in previous `itemIdx-1` items AND current `itemIdx` item is a failure.
            const probSuccessPrev = currentDPState[successCount - 1] || 0; // Handle boundary for successCount-1
            const probFailPrev = currentDPState[successCount] || 0;       // Handle boundary for successCount

            nextDPState[successCount] =
                (probSuccessPrev * currentItemProb) +
                (probFailPrev * currentItemFailureProb);
        }
        currentDPState = nextDPState; // Update for the next iteration.
    }

    // Calculate the threshold for "at least half" successes.
    // Using Math.ceil to correctly handle odd numbers (e.g., N=3, ceil(3/2)=2).
    const minimumSuccessesRequired = Math.ceil(totalItems / 2);

    let cumulativeProbability = 0.0;
    // Sum probabilities for outcomes meeting the minimum success requirement.
    for (let sCount = minimumSuccessesRequired; sCount <= totalItems; sCount++) {
        cumulativeProbability += currentDPState[sCount];
    }

    // Return the final computed probability.
    return cumulativeProbability;
}