"use strict";

// This module provides a flexible input parsing utility to read data efficiently.
// It's structured as an immediately invoked function expression (IIFE) to encapsulate its scope.
const DataParserFactory = (function () {

    /**
     * Creates a new instance of the input stream handler.
     * @param {string} rawInputString - The raw string content read from an input source.
     * @returns {InputBufferHandler} An instance capable of parsing the input.
     */
    function createInputProcessor(rawInputString) {
        return new InputBufferHandler(rawInputString);
    }

    /**
     * Internal class to manage and parse lines from the input string.
     * Stores lines and tracks the current reading position.
     */
    class InputBufferHandler {
        /**
         * Initializes the buffer handler.
         * @param {string} sourceContent - The string content to parse.
         */
        constructor(sourceContent) {
            // Split the content into lines, filter out any empty lines resulting from trim,
            // and store them. Using a regex for cross-platform newline handling.
            this.sourceLines = sourceContent.trim().split(/\r?\n/).filter(Boolean);
            this.currentLinePointer = 0; // Tracks the index of the next line to read.
            this.currentLineTokens = []; // Tokens from the current line being processed.
            this.currentTokenIndex = 0; // Index within currentLineTokens.
        }

        /**
         * Fetches a single value (either number or string) from the input stream.
         * It reads from the current line's tokens. If the current line is exhausted,
         * it advances to the next line.
         * @param {boolean} [returnAsString=false] - If true, returns the value as a string; otherwise, attempts to convert to number.
         * @returns {string|number} The parsed value.
         */
        fetchSingleValue(returnAsString = false) {
            // If the current line's tokens are exhausted or not yet loaded,
            // load the next line and reset the token index.
            if (this.currentTokenIndex >= this.currentLineTokens.length) {
                if (this.currentLinePointer >= this.sourceLines.length) {
                    throw new Error("Attempted to read past end of input. No more lines available.");
                }
                const nextLine = this.sourceLines[this.currentLinePointer++];
                // Split by one or more whitespace characters, filtering out empty strings.
                this.currentLineTokens = nextLine.split(/\s+/).filter(Boolean);
                this.currentTokenIndex = 0;
            }

            const value = this.currentLineTokens[this.currentTokenIndex++];
            return returnAsString ? value : Number(value);
        }

        /**
         * Fetches an entire line of values.
         * @param {boolean} [returnAsStrings=false] - If true, returns values as strings; otherwise, as numbers.
         * @returns {Array<string|number>} An array of parsed values from the line.
         */
        fetchLineValues(returnAsStrings = false) {
            if (this.currentLinePointer >= this.sourceLines.length) {
                throw new Error("Attempted to read past end of input for a full line.");
            }
            const line = this.sourceLines[this.currentLinePointer++];
            const values = line.split(/\s+/).filter(Boolean);
            return returnAsStrings ? values : values.map(val => Number(val));
        }

        /**
         * Fetches 'count' number of lines as a matrix. Each line is split into values.
         * @param {number} count - The number of lines to read.
         * @param {boolean} [returnAsStrings=false] - If true, returns values as strings; otherwise, as numbers.
         * @returns {Array<Array<string|number>>} A 2D array (matrix).
         */
        fetchMatrix(count, returnAsStrings = false) {
            const matrixData = [];
            // Basic validation for the count parameter.
            if (count <= 0) return matrixData;

            for (let i = 0; i < count; i++) {
                matrixData.push(this.fetchLineValues(returnAsStrings));
            }
            return matrixData;
        }

        /**
         * Fetches 'count' number of raw lines without splitting them into values.
         * @param {number} count - The number of raw lines to read.
         * @returns {Array<string>} An array of raw line strings.
         */
        fetchRawLines(count) {
            if (this.currentLinePointer + count > this.sourceLines.length) {
                throw new Error("Attempted to read more raw lines than available.");
            }
            const rawBlock = this.sourceLines.slice(this.currentLinePointer, this.currentLinePointer + count);
            this.currentLinePointer += count;
            return rawBlock;
        }
    }

    return createInputProcessor;
})();


// Initialize the input data stream by reading from stdin.
// Using 'const' for immutability where possible.
const inputReader = DataParserFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically generates a multi-dimensional array with a specified fill value.
 * This function uses a string-based approach which is then evaluated.
 * WARNING: Using eval can be a security risk if the input string is not controlled.
 * @param {string} initialValueExpression - A string expression for the initial value of each element.
 * @returns {Array} A new multi-dimensional array.
 */
function generateNestedArray(initialValueExpression) {
    const dimensionArguments = arguments; // Capture all arguments for array dimensions.
    let dimensionCount = dimensionArguments.length;

    // Guard clause: ensure at least one dimension is provided.
    if (dimensionCount <= 1) { // Changed from 0 to 1 because initialValueExpression is the first argument.
        throw new Error("At least one dimension size must be provided after the initial value expression for generateNestedArray.");
    }

    // Construct the array creation string from inner to outer dimensions.
    // Example: Array(D1).fill(0).map(x=>Array(D2).fill(0).map(x=>initialValueExpression))
    // Note: dimensionArguments[0] is initialValueExpression, so dimensions start from index 1.
    let arrayCreationCode = `Array(dimensionArguments[${--dimensionCount}]).fill(0).map(element => { return ${initialValueExpression}; })`;

    while (--dimensionCount > 0) {
        arrayCreationCode = `Array(dimensionArguments[${dimensionCount}]).fill(0).map(element => ${arrayCreationCode})`;
    }

    // Execute the generated code string.
    // In a production environment, consider a safer alternative to eval.
    return eval(arrayCreationCode);
}


// The primary logic of the application.
// This function encapsulates the main algorithm.
function solveProblem() {
    // Read the problem parameters N and K.
    const totalElements = inputReader.fetchSingleValue();
    const moduloValue = inputReader.fetchSingleValue();

    // Basic validation for N and K.
    if (totalElements < 0 || moduloValue <= 0) {
        // Return 0 or throw an error based on expected behavior for invalid inputs.
        // For this problem, N=0 or K=0/negative would likely mean no valid pairs.
        return 0;
    }

    // Read array 'A' and decrement each element by 1, as per problem requirements.
    // Using a more descriptive variable name.
    const originalValues = inputReader.fetchLineValues().map(val => val - 1);

    // Initialize an array 'B' to store prefix sums modulo K.
    // 'B' will have 'totalElements + 1' elements.
    const cumulativeRemainders = new Array(totalElements + 1);
    cumulativeRemainders[0] = 0; // Base case: prefix sum before any elements is 0.

    // Helper function to ensure positive modulo result.
    const getPositiveModulo = (num, mod) => ((num % mod) + mod) % mod;

    // Calculate prefix sums modulo K.
    // Using 'let' for loop iterator and 'const' for values within the loop.
    for (let currentIdx = 0; currentIdx < totalElements; currentIdx++) {
        const previousRemainder = cumulativeRemainders[currentIdx];
        const currentOriginalValue = originalValues[currentIdx];
        // The JavaScript '%' operator can return negative for negative dividends.
        // We use a helper to ensure the result is always non-negative.
        cumulativeRemainders[currentIdx + 1] = getPositiveModulo(previousRemainder + currentOriginalValue, moduloValue);
    }

    let finalCount = 0; // Stores the final answer.
    // Using a Map for frequency tracking, which is often more robust than plain objects
    // when keys might not be simple strings or integers, or when performance for many keys matters.
    const remainderFrequencyTracker = new Map();

    // Iterate through the cumulative remainders to find pairs.
    // This implements a sliding window approach using prefix sums.
    for (let currentIdx = 0; currentIdx <= totalElements; currentIdx++) {
        const currentRemainder = cumulativeRemainders[currentIdx];

        // If the window has slid past 'moduloValue' elements (i.e., currentIdx is >= moduloValue),
        // decrement the count of the remainder that is now out of the window.
        // This corresponds to `b[i-k]` in the original logic.
        if (currentIdx >= moduloValue) {
            const remainderToRemove = cumulativeRemainders[currentIdx - moduloValue];
            // Get current count, decrement, and update. If the remainder wasn't tracked, it defaults to 0.
            const currentCount = remainderFrequencyTracker.get(remainderToRemove) || 0;
            if (currentCount > 0) { // Only decrement if count is positive.
                remainderFrequencyTracker.set(remainderToRemove, currentCount - 1);
            } else {
                // This case should ideally not be hit if logic is sound, but good for robustness.
                remainderFrequencyTracker.delete(remainderToRemove);
            }
        }

        // Add the current frequency of 'currentRemainder' to the total count.
        // This counts how many previous elements (within the window) form a valid pair with the current one.
        finalCount += remainderFrequencyTracker.get(currentRemainder) || 0;

        // Increment the frequency of the current remainder.
        remainderFrequencyTracker.set(currentRemainder, (remainderFrequencyTracker.get(currentRemainder) || 0) + 1);
    }

    return finalCount;
}

// Execute the main problem-solving function and print its result to the console.
console.log(solveProblem());