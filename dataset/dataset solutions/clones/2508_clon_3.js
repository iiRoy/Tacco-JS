"use strict";
// This module provides a utility for parsing structured input from a string.
const InputParserUtil = (function () {
    /**
     * Factory function to create an InputProcessor instance.
     * @param {string} sourceText - The raw input string, typically from stdin.
     * @returns {InputProcessor} An instance capable of reading various data types.
     */
    function createProcessor(sourceText) {
        // Basic validation for the input source
        if (typeof sourceText !== 'string' || sourceText.length === 0) {
            console.error("Warning: Input source text is empty or invalid. Returning a dummy parser.");
            // Return a dummy processor that always returns 0 or empty arrays
            return new InputProcessor("");
        }
        return new InputProcessor(sourceText);
    }

    /**
     * @class InputProcessor
     * Handles parsing lines and tokens from the input string.
     */
    function InputProcessor(inputString) {
        // Trim whitespace from the start/end of the input, then split into lines.
        // Cache this array for subsequent reads.
        this._linesCache = inputString.trim().split("\n");
        // Pointer to the current line being processed.
        this._linePointer = 0;
        // Cache for tokens of the current line, if already split.
        this._currentLineTokens = [];
    }

    /**
     * Extracts the next token from the current line.
     * If the current line is exhausted, moves to the next line.
     * @param {boolean} returnAsString - If true, returns the token as a string; otherwise, attempts to convert to a number.
     * @returns {string|number} The extracted token.
     */
    InputProcessor.prototype.extractNextToken = function (returnAsString) {
        // Ensure we have tokens to process on the current line.
        // If _currentLineTokens is empty, or this is the first read for a new line,
        // split the current line from _linesCache.
        if (this._currentLineTokens.length === 0) {
            const currentLineContent = this._linesCache[this._linePointer];
            if (typeof currentLineContent !== 'string') {
                // If we run out of lines, return a default value and log a warning for robustness.
                console.warn("Attempted to read beyond available input lines. Returning default value.");
                return returnAsString ? "" : 0;
            }
            // Split the line by spaces.
            this._currentLineTokens = currentLineContent.split(" ");
        }

        // Extract the first token from the array.
        const nextToken = this._currentLineTokens.shift();

        // If after shifting, the current line tokens are exhausted, advance the line pointer.
        // This ensures the next call will load a new line.
        if (this._currentLineTokens.length === 0) {
            this._linePointer++;
        }

        // Convert to number if not explicitly requested as string.
        return returnAsString ? nextToken : Number(nextToken);
    };

    /**
     * Reads and parses a full line of space-separated values.
     * Advances the line pointer.
     * @param {boolean} returnAsStrings - If true, returns an array of strings; otherwise, an array of numbers.
     * @returns {Array<string|number>} An array of parsed values from the line.
     */
    InputProcessor.prototype.parseLineTokens = function (returnAsStrings) {
        const currentLineIndex = this._linePointer++;
        const lineText = this._linesCache[currentLineIndex];

        if (typeof lineText !== 'string') {
            console.warn(`Attempted to read line ${currentLineIndex} which does not exist. Returning empty array.`);
            return []; // Return empty array if line is missing
        }

        const tokens = lineText.split(" ");
        return returnAsStrings ? tokens : tokens.map(Number);
    };

    /**
     * Reads a block of 'numRows' lines, parsing each into an array of values.
     * Advances the line pointer by 'numRows'.
     * @param {number} numRows - The number of lines to read for the matrix.
     * @param {boolean} returnAsStrings - If true, returns a matrix of strings; otherwise, a matrix of numbers.
     * @returns {Array<Array<string|number>>} A 2D array (matrix) of parsed values.
     */
    InputProcessor.prototype.getMultiLineData = function (numRows, returnAsStrings) {
        const startLine = this._linePointer;
        const endLine = this._linePointer + numRows;
        this._linePointer = endLine; // Advance pointer immediately

        const dataBlockLines = this._linesCache.slice(startLine, endLine);
        const processedBlock = dataBlockLines.map(line => {
            const tokens = line.split(" ");
            return returnAsStrings ? tokens : tokens.map(Number);
        });

        return processedBlock;
    };

    /**
     * Reads a block of 'numLines' raw text lines without splitting them into tokens.
     * Advances the line pointer by 'numLines'.
     * @param {number} numLines - The number of lines to read.
     * @param {boolean} returnAsStrings - If true, returns lines as strings; otherwise, attempts to convert each line to a number.
     * @returns {Array<string|number>} An array of raw lines or numbers.
     */
    InputProcessor.prototype.getTextBlock = function (numLines, returnAsStrings) {
        const startIdx = this._linePointer;
        const endIdx = this._linePointer + numLines;
        this._linePointer = endIdx; // Advance pointer

        const rawLines = this._linesCache.slice(startIdx, endIdx);
        return returnAsStrings ? rawLines : rawLines.map(Number);
    };

    return createProcessor;
})();

// Instantiate the input processor by reading from standard input.
const dataStream = InputParserUtil(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * This is a recursive helper function to avoid using `eval` for array creation.
 * @param {any} initialValue - The value to initialize all elements with.
 * @param {...number} dimensions - A variadic list of integers representing the size of each dimension.
 * @returns {Array<any>} A multi-dimensional array.
 */
function initializeNestedArray(initialValue, ...dimensions) {
    // Base case: if no dimensions left, return the initial value.
    if (dimensions.length === 0) {
        return initialValue;
    }

    const currentDimensionSize = dimensions[0];
    // Guard clause for invalid dimension size.
    if (!Number.isInteger(currentDimensionSize) || currentDimensionSize < 0) {
        console.error(`Invalid dimension size: ${currentDimensionSize}. Returning empty array.`);
        return [];
    }

    const remainingDimensions = dimensions.slice(1);
    const newArray = new Array(currentDimensionSize);

    for (let i = 0; i < currentDimensionSize; i++) {
        // Recursively fill the current dimension.
        newArray[i] = initializeNestedArray(initialValue, ...remainingDimensions);
    }
    return newArray;
}

// Execute the main problem-solving logic and print the output.
console.log(applicationEntry());

/**
 * Entry point for the application logic.
 * This function encapsulates the main problem-solving process.
 * @returns {string} The computed result formatted as a newline-separated string.
 */
function applicationEntry() {
    // Read the total number of elements 'n' from the input.
    const totalCount = dataStream.extractNextToken();
    if (totalCount <= 0 || !Number.isInteger(totalCount)) {
        // Guard clause: Handle invalid input for totalCount.
        console.error("Invalid totalCount received: " + totalCount + ". Must be a positive integer.");
        return ""; // Return empty string or throw error for invalid input.
    }

    // Read the array 'a' of 'totalCount' elements.
    const dataSequence = dataStream.parseLineTokens();
    if (dataSequence.length !== totalCount) {
        console.error(`Data sequence length mismatch. Expected ${totalCount}, got ${dataSequence.length}.`);
        return ""; // Return empty string for mismatched input.
    }

    // Create a frequency map (or counter array) for elements.
    // Initialize with zeros using the new helper function.
    // Assuming elements are 1-indexed in problem, so map needs size 'totalCount'.
    const elementFrequencies = initializeNestedArray(0, totalCount);

    // Populate the frequency map.
    // The problem implies elements in dataSequence are 1-indexed, so we subtract 1 for array indexing.
    for (let i = 0; i < totalCount; i++) {
        const elementValue = dataSequence[i];
        // Basic validation for element value range.
        if (elementValue < 1 || elementValue > totalCount || !Number.isInteger(elementValue)) {
            console.warn(`Element ${elementValue} at index ${i} is out of expected range [1, ${totalCount}] or not an integer. Skipping.`);
            continue; // Skip invalid elements to prevent errors.
        }
        elementFrequencies[elementValue - 1]++;
    }

    // Filter out zero frequencies and collect non-zero frequencies into a new array.
    // Then sort them in descending order to easily process highest frequencies first.
    const distinctFrequencies = elementFrequencies.filter(count => count > 0);
    distinctFrequencies.sort((a, b) => b - a);

    // Initialize an array to store the results.
    // The problem implicitly defines finalResults[0] (for k=1) as 'totalCount'.
    // The loop then fills finalResults[k-1] for k from 2 to totalCount.
    const finalResults = new Array(totalCount).fill(0);
    finalResults[0] = totalCount; // For 1 group, all 'totalCount' elements can be used.

    // Calculate results for different group sizes (k from 2 to totalCount).
    // 'k' represents the number of groups we are trying to form.
    for (let k = 2; k <= totalCount; k++) {
        // If there are fewer distinct frequency counts than the number of groups 'k',
        // it's impossible to form 'k' groups with distinct frequency counts.
        // Since finalResults is pre-filled with 0, we can just continue.
        if (distinctFrequencies.length < k) {
            continue; // No valid arrangement for this 'k', result remains 0.
        }

        // Initial estimate for the maximum frequency count per group (max_x).
        // This is integer division of `totalCount / k`.
        let currentMaxGroupFrequency = Math.floor(totalCount / k);
        // Represents total elements available after adjustments for frequencies exceeding threshold.
        let effectiveElementCount = totalCount;

        // Iterate through the sorted distinct frequencies (highest first).
        // Adjust `effectiveElementCount` for frequencies that are too high
        // to fit within `currentMaxGroupFrequency` for `k` groups.
        for (let freqIndex = 0; freqIndex < distinctFrequencies.length; freqIndex++) {
            const currentFrequency = distinctFrequencies[freqIndex];

            // If a frequency count is greater than our current maximum allowed per group,
            // we must 'clip' it to currentMaxGroupFrequency. The excess elements cannot be used.
            // This reduces the `effectiveElementCount`.
            if (currentFrequency > currentMaxGroupFrequency) {
                effectiveElementCount -= (currentFrequency - currentMaxGroupFrequency);
            } else {
                // Since `distinctFrequencies` is sorted descending, if currentFrequency is
                // already less than or equal to currentMaxGroupFrequency, all subsequent frequencies
                // will also be less than or equal. So we can break early for efficiency.
                break;
            }
        }

        // Recalculate the maximum frequency count per group based on the adjusted `effectiveElementCount`.
        // This gives the final answer for the current 'k'.
        const finalMaxGroupFrequency = Math.floor(effectiveElementCount / k);
        finalResults[k - 1] = finalMaxGroupFrequency;
    }

    // Format the results as a newline-separated string for output.
    return finalResults.join("\n");
}