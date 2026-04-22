var InputReaderUtil = (function() {
    // Private helper for creating new InputHandler instances.
    // This acts as a factory function returned by the IIFE.
    function createInputHandler(textInput) {
        return new InputHandler(textInput);
    }

    /**
     * @class InputHandler
     * @description Manages reading and parsing of text input, line by line or token by token.
     * @param {string} textInput - The raw string content to be processed.
     */
    function InputHandler(textInput) {
        // Store raw input text, split into lines, and trim whitespace from each line.
        // This array will be mutated as tokens are extracted from lines.
        this.sourceLines = textInput.trim().split("\n");
        // Pointer to the current line being processed within `sourceLines`.
        this.currentLineIndex = 0;
    }

    /**
     * @method extractItem
     * @description Extracts a single token (word) from the current line.
     *              Tokens are assumed to be space-separated. The method effectively reads
     *              tokens from left to right by internally reversing the line's word array
     *              and using `pop()`.
     * @param {boolean} returnAsString - If true, returns the token as a string; otherwise, attempts conversion to a number.
     * @returns {string|number} The extracted token.
     */
    InputHandler.prototype.extractItem = function(returnAsString) {
        let lineContents = this.sourceLines[this.currentLineIndex];

        // If the current line is still a string, it hasn't been split into tokens yet.
        // Split it by space and reverse, so 'pop()' can retrieve elements from the "front" of the original line.
        if (typeof lineContents === "string") {
            this.sourceLines[this.currentLineIndex] = lineContents.split(" ").reverse();
        }

        // Retrieve the last element from the reversed array (which was the first in the original line).
        let extractedToken = this.sourceLines[this.currentLineIndex].pop();

        // If the current line array is now empty of tokens, advance the line pointer to the next line.
        if (!this.sourceLines[this.currentLineIndex].length) {
            this.currentLineIndex++;
        }

        // Return the token either as its raw string form or converted to a number.
        return returnAsString ? extractedToken : Number(extractedToken);
    };

    /**
     * @method fetchLine
     * @description Reads an entire line from the input and splits it into an array of tokens.
     *              The line pointer is advanced after reading.
     * @param {boolean} returnRawFormat - If true, returns tokens as strings; otherwise, attempts conversion to numbers.
     * @returns {Array<string|number>} An array of tokens from the line.
     */
    InputHandler.prototype.fetchLine = function(returnRawFormat) {
        // Split the current line into tokens. The postfix increment advances the line pointer after this line is read.
        const lineTokens = this.sourceLines[this.currentLineIndex++].split(" ");

        // Return tokens as strings or as numbers, by mapping the array.
        return returnRawFormat ? lineTokens : lineTokens.map(token => Number(token));
    };

    /**
     * @method extractBlock
     * @description Reads a block of `numLines` from the input, treating each line as an array of tokens.
     *              This results in a 2D array (matrix). The line pointer is advanced by `numLines`.
     * @param {number} numLines - The number of lines to read for the block.
     * @param {boolean} returnRawFormat - If true, returns cells as strings; otherwise, attempts conversion to numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) representing the block of lines.
     */
    InputHandler.prototype.extractBlock = function(numLines, returnRawFormat) {
        const startIndex = this.currentLineIndex;
        const endIndex = startIndex + numLines;

        // Extract a slice of lines from the source and map each line to an array of its tokens.
        const blockOfLines = this.sourceLines.slice(startIndex, endIndex).map(line => line.split(" "));

        // Advance the line pointer to the end of the read block.
        this.currentLineIndex = endIndex;

        // Return the block as a matrix of strings or a matrix of numbers.
        return returnRawFormat ? blockOfLines : blockOfLines.map(row => row.map(cell => Number(cell)));
    };

    /**
     * @method hasMoreData
     * @description Checks if there are more lines available to read in the input buffer.
     * @returns {boolean} True if more lines exist, false otherwise.
     */
    InputHandler.prototype.hasMoreData = function() {
        return this.currentLineIndex < this.sourceLines.length;
    };

    // Expose the factory function for creating InputHandler instances.
    return createInputHandler;
})();

// Instantiate the input processor with content from standard input.
// This reads the entire standard input as a UTF-8 string.
const dataStreamProcessor = InputReaderUtil(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * @function createNthDimArray
 * @description Dynamically creates an N-dimensional array initialized with a specified value.
 *              The dimensions are provided as subsequent arguments.
 *              Note: This function uses `eval()`, which can be a security risk if `initialValue`
 *              or dimension arguments come from untrusted sources.
 * @param {*} initialValue - The value to fill all elements of the array with.
 * @param {...number} dimensions - The sizes of each dimension (e.g., `createNthDimArray(0, 2, 3)` for a 2x3 array).
 * @returns {Array} The newly created N-dimensional array.
 */
function createNthDimArray(initialValue) {
    // Collect all arguments after the first one (initialValue) as the dimensions.
    const dimensions = Array.prototype.slice.call(arguments, 1);
    let currentDimIndex = dimensions.length - 1; // Start from the innermost dimension.

    // Begin constructing the JavaScript code string for the innermost array.
    // The `map(() => initialValue)` ensures deep cloning of the initial value if it's an object,
    // otherwise, `fill()` would suffice for primitives.
    let arrayConstructionString = `Array(dimensions[${currentDimIndex}]).fill(0).map(() => initialValue)`;

    // Loop backwards through the remaining dimensions to wrap the array creation code.
    while (--currentDimIndex >= 0) {
        arrayConstructionString = `Array(dimensions[${currentDimIndex}]).fill(0).map(() => ${arrayConstructionString})`;
    }

    // Execute the dynamically constructed string to create and return the array.
    return eval(arrayConstructionString);
}

// Entry point for the main logic. The result of the challenge is printed to the console.
console.log(solveChallenge());

/**
 * @function solveChallenge
 * @description Implements the core logic to solve the problem.
 * The problem aims to find the minimum of the maximum consecutive non-matching character sequences
 * for each character in the alphabet ('a' through 'z').
 * For each character (e.g., 'a'), it calculates the longest "gap" where that character does not appear.
 * The final answer is the smallest of these maximum gaps across all alphabet characters.
 * @returns {number} The minimum of the maximum consecutive non-matching character gap lengths.
 */
function solveChallenge() {
    // Retrieve the target string input from the data stream. We expect a single string.
    const targetString = dataStreamProcessor.extractItem(true);

    // Guard clause: If the input string is empty or null, there are no characters and thus no gaps.
    // The problem context implies non-empty strings, but this handles edge cases gracefully.
    if (!targetString || targetString.length === 0) {
        return 0;
    }

    const textLength = targetString.length;
    // Initialize the overall minimum maximum gap. A safe upper bound is the full length of the string,
    // as no gap can be longer than the string itself.
    let minOverallGap = textLength;

    // Constants for character processing, making the code more readable and maintainable.
    const ALPHABET_SIZE = 26; // Represents 'a' through 'z'.
    const ASCII_CODE_OF_A = 'a'.charCodeAt(0); // ASCII value of 'a' for offset calculations.

    // Outer loop: Iterate through each character of the alphabet from 'a' (0) to 'z' (25).
    for (let charAlphabetPosition = 0; charAlphabetPosition < ALPHABET_SIZE; charAlphabetPosition++) {
        // `maxGapForChar` will store the longest sequence of characters that are NOT the current `charAlphabetPosition`.
        let maxGapForChar = 0;
        // `currentGapCount` keeps track of the length of the current consecutive sequence of non-matching characters.
        let currentGapCount = 0;

        // Inner loop: Iterate through each character in the input string.
        for (let stringIterator = 0; stringIterator < textLength; stringIterator++) {
            const currentCharCode = targetString.charCodeAt(stringIterator);
            // Determine if the current character in the string matches the alphabet character we are currently testing.
            const isMatch = (currentCharCode - ASCII_CODE_OF_A) === charAlphabetPosition;

            if (isMatch) {
                // If the current character in the string matches, the current gap of non-matching characters ends.
                // Update `maxGapForChar` if the `currentGapCount` was longer than any previously recorded gap for this alphabet character.
                maxGapForChar = Math.max(maxGapForChar, currentGapCount);
                // Reset the counter for the next potential gap.
                currentGapCount = 0;
            } else {
                // If it does not match, increment the counter for the current consecutive gap.
                currentGapCount++;
            }
        }

        // After iterating through the entire string, there might be an active `currentGapCount`
        // if the string ended with non-matching characters. This final segment must also be considered.
        maxGapForChar = Math.max(maxGapForChar, currentGapCount);

        // Update the `minOverallGap`. We are looking for the smallest of all `maxGapForChar` found across
        // all alphabet characters.
        minOverallGap = Math.min(minOverallGap, maxGapForChar);
    }

    // The final result is the minimum of all maximum gaps found for each character of the alphabet.
    return minOverallGap;
}