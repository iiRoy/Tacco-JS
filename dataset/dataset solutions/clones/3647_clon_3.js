"use strict";

/**
 * A utility class for parsing input data from a string,
 * treating spaces and newlines as delimiters.
 * Provides methods to retrieve various data types.
 */
class DataStreamParser {
    /**
     * Initializes the parser with the raw input text.
     * @param {string} sourceText The complete input string to be parsed.
     */
    constructor(sourceText) {
        // Basic validation for the input source text.
        if (typeof sourceText !== 'string' || sourceText.trim().length === 0) {
            console.error("Error: Input source text must be a non-empty string.");
            this.tokenBuffer = [];
            this.currentPointer = 0;
            return;
        }
        // Split the input text into individual tokens.
        // `trim()` removes leading/trailing whitespace, `split(/[\s\n]+/)` handles multiple delimiters,
        // and `filter(Boolean)` removes any empty strings that might result from splitting.
        this.tokenBuffer = sourceText.trim().split(/[\s\n]+/).filter(Boolean);
        this.currentPointer = 0; // Pointer to the next token to be read.
    }

    /**
     * Checks if there are more tokens available in the buffer.
     * @returns {boolean} True if more tokens exist, false otherwise.
     */
    hasMoreTokens() {
        return this.currentPointer < this.tokenBuffer.length;
    }

    /**
     * Retrieves the next token and converts it to an integer.
     * @returns {number} The parsed integer, or NaN if no more tokens or parsing fails.
     */
    retrieveInteger() {
        if (!this.hasMoreTokens()) {
            console.warn("Warning: Attempted to read integer past end of stream.");
            return NaN;
        }
        const nextToken = this.tokenBuffer[this.currentPointer++];
        return Number.parseInt(nextToken, 10);
    }

    /**
     * Retrieves the next token as a string.
     * @returns {string} The next token, or an empty string if no more tokens.
     */
    fetchString() {
        if (!this.hasMoreTokens()) {
            console.warn("Warning: Attempted to read string past end of stream.");
            return "";
        }
        return this.tokenBuffer[this.currentPointer++];
    }

    /**
     * Reads a specified number of integers into an array.
     * @param {number} count The number of integers to read.
     * @returns {number[]} An array containing the parsed integers.
     */
    getIntegerArray(count) {
        const collectedIntegers = new Array(count);
        for (let idx = 0; idx < count; ++idx) {
            collectedIntegers[idx] = this.retrieveInteger();
        }
        return collectedIntegers;
    }

    /**
     * Reads a specified number of strings into an array.
     * @param {number} count The number of strings to read.
     * @returns {string[]} An array containing the fetched strings.
     */
    getStringArray(count) {
        const collectedStrings = new Array(count);
        for (let idx = 0; idx < count; ++idx) {
            collectedStrings[idx] = this.fetchString();
        }
        return collectedStrings;
    }
}

/**
 * Solves the problem of counting "ABC" subsequences with wildcards using dynamic programming.
 * @param {string} rawInputData The raw input string containing the sequence to analyze.
 */
function SolveProblem(rawInputData) {
    let dataReader = new DataStreamParser(rawInputData);
    let inputSequence = dataReader.fetchString(); // The main sequence from input.
    let sequenceLength = inputSequence.length; // The total length of the input sequence.

    // Early exit: If the input sequence is empty, no "ABC" can be formed.
    if (sequenceLength === 0) {
        console.log(0);
        return;
    }

    const targetPattern = "ABC"; // The specific pattern we are searching for.
    const patternSize = targetPattern.length; // Length of the target pattern (which is 3).
    const primeModulus = 1_000_000_007; // A large prime number used for modulo arithmetic.

    // Initialize the dynamic programming table.
    // dpTable[i][j] stores the number of ways to form the prefix of `targetPattern`
    // of length `j` using the suffix of `inputSequence` starting from index `i`.
    // The table dimensions are (sequenceLength + 1) x (patternSize + 1).
    let dpTable = new Array(sequenceLength + 1);
    for (let rowIdx = 0; rowIdx <= sequenceLength; ++rowIdx) {
        dpTable[rowIdx] = new Array(patternSize + 1).fill(0);
    }

    // Iterate through the input sequence in reverse, from the end to the beginning.
    // `currentStrIndex` represents the starting index in `inputSequence`.
    for (let currentStrIndex = sequenceLength; currentStrIndex >= 0; --currentStrIndex) {
        // Iterate through the pattern states in reverse.
        // `currentPatternState` represents how many characters of `targetPattern` we've successfully matched so far.
        // 0: looking for 'A', 1: looking for 'B', 2: looking for 'C', 3: "ABC" found.
        for (let currentPatternState = patternSize; currentPatternState >= 0; --currentPatternState) {

            // Base Case: If we are beyond the end of the input sequence.
            // Only if we have successfully matched all characters of "ABC" (state 3) is there 1 way.
            // Otherwise, there are 0 ways from this point.
            if (currentStrIndex === sequenceLength) {
                dpTable[currentStrIndex][currentPatternState] = (currentPatternState === patternSize ? 1 : 0);
            } else {
                // Recursive Step: Calculate the number of ways for the current state.
                let waysFromCurrentPos = 0;
                const currentChar = inputSequence[currentStrIndex];

                // Contribution 1: The current character `currentChar` does NOT help in forming the `targetPattern`
                // (i.e., it's not the character we're looking for, or it's a '?' used for something else).
                // We propagate the count from the next position in the string, `dpTable[currentStrIndex + 1][currentPatternState]`.
                // If `currentChar` is '?', it can be any of the 3 non-matching characters, so we multiply by 3.
                // Otherwise, it contributes 1 (just moving past it).
                let multiplier = 1;
                if (currentChar === '?') {
                    multiplier = 3;
                }
                waysFromCurrentPos = (dpTable[currentStrIndex + 1][currentPatternState] * multiplier) % primeModulus;

                // Contribution 2: The current character `currentChar` DOES help in forming the `targetPattern`.
                // This occurs if `currentChar` is a '?' (wildcard) or if it exactly matches `targetPattern[currentPatternState]`.
                // If it matches, we transition to the next pattern state: `dpTable[currentStrIndex + 1][currentPatternState + 1]`.
                const canMatchNextPatternChar = (currentPatternState < patternSize);
                const isWildcard = (currentChar === '?');
                const isDirectMatch = (currentChar === targetPattern[currentPatternState]);

                if (canMatchNextPatternChar && (isWildcard || isDirectMatch)) {
                    waysFromCurrentPos = (waysFromCurrentPos + dpTable[currentStrIndex + 1][currentPatternState + 1]) % primeModulus;
                }

                // Store the total ways for the current (string index, pattern state) pair.
                dpTable[currentStrIndex][currentPatternState] = waysFromCurrentPos;
            }
        }
    }

    // The final answer is at dpTable[0][0], representing the number of ways
    // to form "ABC" starting from the beginning of the input sequence
    // and initially looking for the first character ('A').
    const finalResult = dpTable[0][0];
    console.log(finalResult);
}

// Environment detection for execution.
// This block determines if the code is running in Node.js (e.g., competitive programming)
// or another environment (like a web browser).
if (typeof window === "undefined") {
    // Node.js environment detected.
    try {
        const fileSystemModule = require("fs");
        // Read input from standard input file (`/dev/stdin`).
        const inputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8");
        SolveProblem(inputContent); // Execute the main problem-solving function.
    } catch (error) {
        console.error("Failed to read input or execute solution:", error);
        // In a production environment, you might want to exit the process with an error code.
        // process.exit(1);
    }
} else {
    // Browser or other non-Node.js environment detected.
    // For competitive programming, this path is typically not used.
    // In a browser, input would usually come from a DOM element (e.g., textarea).
    console.warn("Running in a non-Node.js environment. Input handling may need adjustment.");
    // Example for browser testing:
    // SolveProblem("?B?C");
}