"use strict"; // Enforce strict mode for cleaner code practices

/**
 * @module InputProcessor
 * @description A robust utility for parsing input data from a multi-line string.
 *              It processes the input into lines and tokens for easy consumption.
 *              This module provides methods to read individual tokens, full lines,
 *              matrices, or raw lines, with optional type conversion.
 */
const InputProcessor = (function() {

    /**
     * Helper function to convert an array of string tokens to numbers.
     * Non-numeric strings will result in NaN, which Number() handles.
     * @param {string[]} tokenArray - An array of string tokens.
     * @returns {number[]} An array of numbers.
     */
    function transformTokensToNumeric(tokenArray) {
        return tokenArray.map(str => Number(str));
    }

    /**
     * Factory function to create a new StreamReader instance.
     * @param {string} sourceData - The raw input string, typically from stdin.
     * @returns {StreamReader} A new instance of StreamReader.
     */
    function createDataStreamReader(sourceData) {
        return new StreamReader(sourceData);
    }

    /**
     * @class StreamReader
     * @description Core class for managing and parsing input data.
     *              Initializes by pre-processing the entire input string.
     */
    function StreamReader(sourceText) {
        // Validate input source to prevent errors later
        if (typeof sourceText !== 'string' || sourceText.trim().length === 0) {
            // Type III change: Added a guard clause for invalid constructor input
            throw new Error("Input source for StreamReader must be a non-empty string.");
        }

        // Store the original source text for potential debugging or raw access (Type III addition)
        this.initialSourceString = sourceText;

        // Store raw lines as an array of strings (Type III addition for grabRawLines)
        this.rawInputLines = sourceText.trim().split('\n');

        // Pre-process all lines into arrays of tokens (significant Type III change)
        // This avoids repeated splitting during token-by-token reading.
        this.tokenizedInputLines = this.rawInputLines.map(line => line.split(' '));

        // Pointers to keep track of the current reading position within the input
        this.currentLinePointer = 0;    // Index of the current line being processed
        this.currentTokenPointer = 0;   // Index of the current token within the current line
    }

    /**
     * Reads the next single token from the input stream.
     * Advances the internal token and line pointers.
     * @param {boolean} [returnAsText=false] - If true, returns the token as a string; otherwise, as a number.
     * @returns {string|number} The next token.
     * @throws {Error} If attempting to read beyond the end of the input stream.
     */
    StreamReader.prototype.fetchNextScalar = function(returnAsText = false) {
        // Type III change: Robust error handling for reading past end of input
        if (this.currentLinePointer >= this.tokenizedInputLines.length) {
            throw new Error("Input stream exhausted: Attempted to read scalar past end of data.");
        }

        let currentLineTokens = this.tokenizedInputLines[this.currentLinePointer];

        // If the current line is exhausted, advance to the next non-empty line
        while (this.currentTokenPointer >= currentLineTokens.length) {
            this.currentLinePointer++;
            this.currentTokenPointer = 0; // Reset token pointer for the new line

            if (this.currentLinePointer >= this.tokenizedInputLines.length) {
                throw new Error("Input stream exhausted: No more tokens available after advancing lines.");
            }
            currentLineTokens = this.tokenizedInputLines[this.currentLinePointer];
            // If the next line is also empty or only whitespace, the loop continues.
            // This ensures we skip empty lines until a valid token is found or stream ends.
        }

        const nextToken = currentLineTokens[this.currentTokenPointer];
        this.currentTokenPointer++; // Advance token pointer

        // If current line is now fully consumed, reset token pointer and increment line pointer for next read
        if (this.currentTokenPointer >= currentLineTokens.length) {
            this.currentLinePointer++;
            this.currentTokenPointer = 0;
        }

        return returnAsText ? nextToken : Number(nextToken);
    };

    /**
     * Reads and returns all tokens from the current line.
     * Advances the internal line pointer. Resets the token pointer.
     * @param {boolean} [returnAsTextArray=false] - If true, returns an array of strings; otherwise, an array of numbers.
     * @returns {string[]|number[]} An array of tokens from the current line.
     * @throws {Error} If attempting to read line beyond the end of the input stream.
     */
    StreamReader.prototype.retrieveLineTokens = function(returnAsTextArray = false) {
        // Type III change: Robust error handling for reading past end of input
        if (this.currentLinePointer >= this.tokenizedInputLines.length) {
            throw new Error("Input stream exhausted: Attempted to read line past end of data.");
        }

        const lineTokens = this.tokenizedInputLines[this.currentLinePointer];
        this.currentLinePointer++; // Advance line pointer for the next read
        this.currentTokenPointer = 0; // Reset token pointer as we've explicitly read a full line

        return returnAsTextArray ? lineTokens : transformTokensToNumeric(lineTokens);
    };

    /**
     * Reads a specified number of lines as a matrix (array of arrays).
     * Each inner array represents a line of tokens.
     * @param {number} rowCount - The number of rows (lines) to read.
     * @param {boolean} [asStringMatrix=false] - If true, returns a matrix of strings; otherwise, of numbers.
     * @returns {string[][]|number[][]} The matrix data.
     * @throws {Error} If rowCount is invalid or not enough lines are available.
     */
    StreamReader.prototype.acquireMatrix = function(rowCount, asStringMatrix = false) {
        // Type III change: Added validation for rowCount
        if (!Number.isInteger(rowCount) || rowCount <= 0) {
            throw new Error(`Invalid 'rowCount': Must be a positive integer. Received: ${rowCount}`);
        }
        if (this.currentLinePointer + rowCount > this.tokenizedInputLines.length) {
            throw new Error(`Input stream exhausted: Cannot acquire matrix of ${rowCount} rows; only ${this.tokenizedInputLines.length - this.currentLinePointer} lines remaining.`);
        }

        const matrixData = [];
        for (let i = 0; i < rowCount; i++) {
            matrixData.push(this.retrieveLineTokens(asStringMatrix));
        }
        return matrixData;
    };

    /**
     * Reads a specified number of raw lines directly from the input.
     * Assumes each line is either a single number or a string.
     * @param {number} numLinesToGrab - The number of raw lines to retrieve.
     * @param {boolean} [returnAsTextArray=false] - If true, returns an array of raw strings; otherwise, an array of numbers.
     * @returns {string[]|number[]} An array of raw lines.
     * @throws {Error} If numLinesToGrab is invalid or not enough lines are available.
     */
    StreamReader.prototype.grabRawLines = function(numLinesToGrab, returnAsTextArray = false) {
        // Type III change: Added validation for numLinesToGrab
        if (!Number.isInteger(numLinesToGrab) || numLinesToGrab <= 0) {
            throw new Error(`Invalid 'numLinesToGrab': Must be a positive integer. Received: ${numLinesToGrab}`);
        }
        if (this.currentLinePointer + numLinesToGrab > this.rawInputLines.length) {
            throw new Error(`Input stream exhausted: Cannot grab ${numLinesToGrab} raw lines; only ${this.rawInputLines.length - this.currentLinePointer} lines remaining.`);
        }

        // Slice directly from the stored raw lines
        const grabbedLines = this.rawInputLines.slice(this.currentLinePointer, this.currentLinePointer + numLinesToGrab);
        this.currentLinePointer += numLinesToGrab; // Advance line pointer
        this.currentTokenPointer = 0; // Reset token pointer as we've explicitly moved lines

        // If not returning as text, attempt to convert each line to a number
        return returnAsTextArray ? grabbedLines : grabbedLines.map(Number);
    };

    return createDataStreamReader; // Export the factory function
})();

// Initialize the input reader by processing data from standard input.
// Type III change: Encapsulated require and input reading, renamed variable.
const fileSystem = require("fs");
const rawInputBuffer = fileSystem.readFileSync("/dev/stdin", "utf8");
const inputReader = InputProcessor(rawInputBuffer);

/**
 * @constant {Object<number, number>} CATEGORY_POINTS
 * @description A lookup table for points awarded based on individual category selections.
 *              This replaces chained if-statements for better readability and extensibility.
 *              (Type III change: introduced a lookup object).
 */
const CATEGORY_POINTS = {
    1: 300000,
    2: 200000,
    3: 100000
};

/**
 * @constant {Object<string, number>} JOINT_BONUS_POINTS
 * @description A lookup table for bonus points awarded based on specific combined selections.
 *              Keys are formatted as 'selectionA_selectionB'.
 *              (Type III change: introduced a lookup object for bonuses).
 */
const JOINT_BONUS_POINTS = {
    '1_1': 400000 // Special bonus for selecting '1' in both categories
};

/**
 * Calculates the total score based on two category selections.
 * This function embodies the main logic of the program.
 * (Type III change: renamed from 'main' to 'calculateScore' for clarity).
 * @returns {number} The final calculated score.
 */
function calculateScore() {
    // Read the two category selections from the input stream.
    // (Type II change: variable names 'x' and 'y' renamed to be more descriptive).
    const primarySelection = inputReader.fetchNextScalar();
    const secondarySelection = inputReader.fetchNextScalar();

    // Initialize the accumulator for the total points.
    // (Type II change: 'ans' renamed to 'currentTotalPoints').
    let currentTotalPoints = 0;

    /**
     * Helper function to validate if a selection is within the expected range (1 to 3).
     * (Type III addition: introduced a helper for input validation).
     * @param {number} selectionValue - The value to validate.
     * @returns {boolean} True if the selection is valid, false otherwise.
     */
    const isSelectionValid = (selectionValue) => selectionValue >= 1 && selectionValue <= 3;

    // --- Calculate points for the primary selection ---
    // (Type III change: replaced if-else chain with a lookup table).
    if (isSelectionValid(primarySelection)) {
        currentTotalPoints += CATEGORY_POINTS[primarySelection];
    } else {
        // Type III addition: Optional logging/error handling for invalid input
        console.warn(`Warning: Primary selection '${primarySelection}' is out of expected range. No points awarded for this category.`);
    }

    // --- Calculate points for the secondary selection ---
    // (Type III change: replaced if-else chain with a lookup table).
    if (isSelectionValid(secondarySelection)) {
        currentTotalPoints += CATEGORY_POINTS[secondarySelection];
    } else {
        // Type III addition: Optional logging/error handling for invalid input
        console.warn(`Warning: Secondary selection '${secondarySelection}' is out of expected range. No points awarded for this category.`);
    }

    // --- Apply bonus points for specific combinations ---
    // (Type III change: replaced specific if-condition with a lookup table and string key).
    const combinedSelectionKey = `${primarySelection}_${secondarySelection}`;
    const bonusAwarded = JOINT_BONUS_POINTS[combinedSelectionKey] || 0; // Default to 0 if no specific bonus
    currentTotalPoints += bonusAwarded;

    // Introduce an intermediate variable for the final result for clarity (Type III addition)
    const finalAccumulatedScore = currentTotalPoints;

    return finalAccumulatedScore;
}

// Execute the main calculation logic and output the result to console.
// (Type II change: 'main' renamed to 'calculateScore').
console.log(calculateScore());