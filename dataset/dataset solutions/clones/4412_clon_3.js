// This module provides a utility to process input data stream.
const InputProcessor = (function() {
    // Helper function to safely convert a value to a number.
    // If conversion results in NaN, the original string value is returned.
    const convertToNumber = (value) => {
        const numericValue = Number(value);
        return isNaN(numericValue) ? value : numericValue;
    };

    // Class to handle parsing lines from the input stream.
    class DataStreamHandler {
        // Private fields for storing the processed lines and the current read position.
        #sourceLines;
        #currentLinePosition;

        /**
         * Constructs a new DataStreamHandler instance.
         * Initializes the input stream by splitting the raw content into lines.
         * @param {string} rawContent - The raw input string, typically from a file,
         *                               expected to be separated by newline characters.
         */
        constructor(rawContent) {
            // Trim leading/trailing whitespace from the content, then split into lines.
            // Empty lines (e.g., from trailing newlines) are filtered out to prevent errors.
            this.#sourceLines = rawContent.trim().split('\n').filter(line => line.length > 0);
            this.#currentLinePosition = 0; // The cursor pointing to the current line to be read.
        }

        /**
         * Extracts a single token (word or number) from the current line.
         * The line cursor advances to the next line if the current line becomes empty after extraction.
         * @param {boolean} [returnAsString=false] - If true, the token is returned as a string;
         *                                           otherwise, an attempt is made to convert it to a number.
         * @returns {string|number|undefined} The next token, or undefined if no more lines or tokens are available.
         */
        fetchSingleValue(returnAsString = false) {
            // Check if all lines have been processed.
            if (this.#currentLinePosition >= this.#sourceLines.length) {
                return undefined;
            }

            let currentLineTokens = this.#sourceLines[this.#currentLinePosition];

            // If the current line hasn't been tokenized yet (it's still a single string),
            // split it by spaces and reverse the array for efficient `pop()` operations.
            if (typeof currentLineTokens === 'string') {
                this.#sourceLines[this.#currentLinePosition] = currentLineTokens.split(' ').reverse();
                currentLineTokens = this.#sourceLines[this.#currentLinePosition];
            }

            const extractedToken = currentLineTokens.pop(); // Retrieve the last token from the reversed array.

            // If the current line is now empty, move the cursor to the next line.
            if (currentLineTokens.length === 0) {
                this.#currentLinePosition++;
            }

            // Return the token, applying number conversion if requested.
            return returnAsString ? extractedToken : convertToNumber(extractedToken);
        }

        /**
         * Reads an entire line and returns its elements as an array.
         * The line cursor is advanced to the subsequent line.
         * @param {boolean} [returnAsString=false] - If true, elements are returned as strings;
         *                                           otherwise, they are converted to numbers.
         * @returns {Array<string|number>|undefined} An array of elements from the line, or undefined if no more lines.
         */
        retrieveLineElements(returnAsString = false) {
            // Check for end of input stream.
            if (this.#currentLinePosition >= this.#sourceLines.length) {
                return undefined;
            }

            // Get the current line content, split it by spaces, and then advance the cursor.
            const lineContent = this.#sourceLines[this.#currentLinePosition++].split(' ');

            // Apply number conversion to all elements if 'returnAsString' is false.
            return returnAsString ? lineContent : lineContent.map(convertToNumber);
        }

        /**
         * Reads a specified number of lines and processes them into a 2D array (matrix).
         * The line cursor is advanced by the 'rowCount'.
         * @param {number} rowCount - The total number of lines to read for the matrix.
         * @param {boolean} [returnAsString=false] - If true, matrix elements are strings;
         *                                           otherwise, they are converted to numbers.
         * @returns {Array<Array<string|number>>} A 2D array representing the matrix.
         */
        fetchMultiLineMatrix(rowCount, returnAsString = false) {
            // Calculate the end index for slicing the source lines.
            const endPosition = this.#currentLinePosition + rowCount;
            // Extract the relevant lines from the source.
            const rawMatrixLines = this.#sourceLines.slice(this.#currentLinePosition, endPosition);
            // Update the line cursor to reflect the lines that have been read.
            this.#currentLinePosition = endPosition;

            // Map each raw line to an array of tokens by splitting it by spaces.
            const processedMatrix = rawMatrixLines.map(line => line.split(' '));

            // If number conversion is needed, apply it to every element in the matrix.
            return returnAsString ? processedMatrix : processedMatrix.map(row => row.map(convertToNumber));
        }

        /**
         * Reads a specified number of lines directly without splitting them into words.
         * The line cursor is advanced by 'count'.
         * @param {number} count - The number of lines to read.
         * @param {boolean} [returnAsString=false] - If true, lines are returned as strings;
         *                                           otherwise, each line is attempted to be converted to a number.
         * @returns {Array<string|number>} An array of lines (as strings or numbers).
         */
        getRawLines(count, returnAsString = false) {
            const endPosition = this.#currentLinePosition + count;
            const extractedLines = this.#sourceLines.slice(this.#currentLinePosition, endPosition);
            this.#currentLinePosition = endPosition;

            return returnAsString ? extractedLines : extractedLines.map(convertToNumber);
        }
    }

    // The public interface of the InputProcessor module is a factory function.
    // This function creates and returns a new DataStreamHandler instance.
    return function createInputHandler(inputString) {
        return new DataStreamHandler(inputString);
    };
})();

// Utility function to generate a 2D array (matrix) of specified dimensions,
// initialized with zeros.
const initializeGrid = (rows, cols) => {
    // Input validation: ensure positive dimensions.
    if (rows <= 0 || cols <= 0) {
        console.warn("Attempted to create a grid with non-positive dimensions. Returning an empty array.");
        return [];
    }
    // Create an array of 'rows' length, then map each element to a new array of 'cols' length,
    // which is filled with zero.
    return Array(rows).fill(null).map(() => Array(cols).fill(0));
};

// Global constant for modulo arithmetic, commonly used in competitive programming
// to prevent integer overflow and handle large results.
const PRIME_MODULO = 1000000007; // Equivalent to 1e9 + 7

// Initialize the data parser by reading input from standard input.
// This setup is typical for competitive programming environments on Unix-like systems.
const dataParser = InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

// Execute the main problem-solving function and print its result to console.
console.log(solveProblem());

/**
 * Solves a combinatorial problem related to tiling or arrangement counting.
 * The problem involves two sequences of characters, `sequenceA` and `sequenceB`,
 * and calculates the number of distinct arrangements based on matching or
 * mismatching characters at each segment position. This often relates to
 * dynamic programming solutions for domino tiling a 2xN board.
 *
 * The logic processes segments sequentially, maintaining a state indicating
 * whether the previous segment was a 'single-column block' (characters matched)
 * or a 'two-column block' (characters differed).
 *
 * @returns {number} The total count of valid arrangements modulo PRIME_MODULO.
 */
function solveProblem() {
    // Read the total number of segments (N) from the input.
    const totalSegments = dataParser.fetchSingleValue();
    // Read the first sequence of characters (S).
    const sequenceA = dataParser.fetchSingleValue(true);
    // Read the second sequence of characters (T).
    const sequenceB = dataParser.fetchSingleValue(true);

    // Guard clause: If there are no segments, there's only 0 way to tile.
    if (totalSegments <= 0) {
        return 0;
    }

    // Initialize variables for the dynamic programming state.
    let currentArrangements = 1; // Represents the number of ways up to the current point.
    let segmentIndex = 0;       // The current column/segment index being processed.
    let wasPreviousBlockDifferent = false; // Flag: true if the last placed block spanned two columns.

    // Handle the initial segment(s) to establish the base state.
    if (sequenceA[0] !== sequenceB[0]) {
        // If the first characters differ, it implies a two-column block.
        // This initial configuration has 6 possible ways.
        currentArrangements = 6;
        wasPreviousBlockDifferent = true; // Mark that the first block covered two columns.
        segmentIndex = 2; // Advance the index by two, as this block uses two columns.
    } else {
        // If the first characters are the same, it implies a single-column block.
        // This initial configuration has 3 possible ways.
        currentArrangements = 3;
        wasPreviousBlockDifferent = false; // Mark that the first block covered one column.
        segmentIndex = 1; // Advance the index by one.
    }

    // Iterate through the remaining segments from the established starting point.
    while (segmentIndex < totalSegments) {
        if (sequenceA[segmentIndex] === sequenceB[segmentIndex]) {
            // Case: Current characters are identical (e.g., 'A' and 'A').
            // This represents a 'single-column block'.
            if (wasPreviousBlockDifferent) {
                // If the previous block was a two-column block,
                // there are 2 ways to connect it to the current single-column block.
                currentArrangements = (currentArrangements * 2) % PRIME_MODULO;
            } else {
                // If the previous block was also a single-column block,
                // there are 2 ways to connect it to the current single-column block.
                // (This is based on the problem's specific rules, not standard tiling).
                currentArrangements = (currentArrangements * 2) % PRIME_MODULO;
            }
            wasPreviousBlockDifferent = false; // The current block is a single-column block.
            segmentIndex++; // Move to the next segment (one column).
        } else {
            // Case: Current characters are different (e.g., 'A' and 'B').
            // This represents a 'two-column block'.
            if (wasPreviousBlockDifferent) {
                // If the previous block was also a two-column block,
                // there are 3 ways to connect to the current two-column block.
                currentArrangements = (currentArrangements * 3) % PRIME_MODULO;
            } else {
                // If the previous block was a single-column block,
                // there are 2 ways to connect to the current two-column block.
                currentArrangements = (currentArrangements * 2) % PRIME_MODULO;
            }
            wasPreviousBlockDifferent = true; // The current block is a two-column block.
            segmentIndex += 2; // Move two segments forward, as this block spans two columns.
        }
    }

    // Return the final count of arrangements modulo PRIME_MODULO.
    return currentArrangements;
}