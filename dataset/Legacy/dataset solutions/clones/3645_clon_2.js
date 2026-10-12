"use strict";

/**
 * Primary function to process the provided input and compute the solution.
 * This function implements a dynamic programming approach to count subsequences.
 * @param {string} rawData - The complete input string received from the environment.
 */
function SolveProblem(rawData) {
    // Initialize an input parsing utility to extract tokens from the raw data.
    let inputReader = new TextProcessor(rawData);

    // Retrieve the main sequence string from the input.
    let targetSequence = inputReader.getNextString();
    // Determine the total length of the input sequence.
    let sequenceLength = targetSequence.length;

    // Define the constant string "ABC" which we are looking for as a subsequence.
    const TARGET_CHARS = "ABC";
    // Define the modulo value to prevent integer overflow during calculations.
    const MODULO_VAL = 1_000_000_007; // Using numeric separator for enhanced readability.

    // Initialize a 2D array (dynamic programming table) to store intermediate results.
    // The table dimensions are (sequenceLength + 1) by (TARGET_CHARS.length + 1).
    // Each cell is initialized to 0.
    let memoizationGrid = new Array(sequenceLength + 1).fill(0).map(() => new Array(TARGET_CHARS.length + 1).fill(0));

    // Iterate through the input sequence from right to left (from end to start).
    for (let currentIdx = sequenceLength; currentIdx >= 0; --currentIdx) {
        // Iterate through the target characters "ABC" from right to left (from 'C' to 'A', and an extra state for 'matched all').
        for (let charMatchIdx = TARGET_CHARS.length; charMatchIdx >= 0; --charMatchIdx) {
            // Base case: When we have processed the entire input sequence.
            if (currentIdx === sequenceLength) {
                // If charMatchIdx is equal to TARGET_CHARS.length (meaning "ABC" has been fully matched),
                // then there is 1 way to form the subsequence. Otherwise, 0 ways.
                memoizationGrid[currentIdx][charMatchIdx] = (charMatchIdx === TARGET_CHARS.length ? 1 : 0);
            } else {
                // Recursive step: Calculate the number of ways for the current state (currentIdx, charMatchIdx).

                // Option 1: The character at targetSequence[currentIdx] is NOT used to form the 'ABC' subsequence
                // at the current charMatchIdx position.
                // If targetSequence[currentIdx] is '?', it can be any of 'A', 'B', 'C', or other characters.
                // For the purpose of *not* matching the current charMatchIdx, it can be 3 possibilities ('A', 'B', 'C')
                // if it's a '?', or 1 possibility if it's a specific character that doesn't match.
                // This effectively means we skip targetSequence[currentIdx] for the current charMatchIdx.
                memoizationGrid[currentIdx][charMatchIdx] = memoizationGrid[currentIdx + 1][charMatchIdx] * (targetSequence[currentIdx] === '?' ? 3 : 1);

                // Option 2: The character at targetSequence[currentIdx] IS used to form the 'ABC' subsequence.
                // This is only possible if:
                //   a) We still need to match characters for "ABC" (charMatchIdx < TARGET_CHARS.length).
                //   b) The current character targetSequence[currentIdx] is '?' (wildcard) OR
                //      it exactly matches the character required at TARGET_CHARS[charMatchIdx].
                if (charMatchIdx < TARGET_CHARS.length && (targetSequence[currentIdx] === '?' || targetSequence[currentIdx] === TARGET_CHARS[charMatchIdx])) {
                    // Add the number of ways from the next state, where we have matched one more character of "ABC".
                    memoizationGrid[currentIdx][charMatchIdx] += memoizationGrid[currentIdx + 1][charMatchIdx + 1];
                }

                // Apply the modulo operation to keep the result within the defined range.
                memoizationGrid[currentIdx][charMatchIdx] %= MODULO_VAL;
            }
        }
    }

    // The final result, representing the total number of ways to form "ABC" starting from
    // the beginning of the input sequence and the beginning of "ABC", is at memoizationGrid[0][0].
    console.log(memoizationGrid[0][0]);
}

/**
 * A utility class designed to parse and extract various data types from a raw text string.
 */
class TextProcessor {
    /**
     * Constructs a new TextProcessor instance.
     * @param {string} rawContent - The full string content to be processed.
     */
    constructor(rawContent) {
        this.currentIndex = 0; // Keeps track of the current token's index.
        // Splits the raw content into an array of tokens using newlines or spaces as delimiters.
        this.tokens = rawContent.split(/\n|\s/);
    }

    /**
     * Retrieves the next token from the stream and attempts to convert it to an integer.
     * @returns {number} The parsed integer value.
     */
    getNextInt() {
        // The unary plus operator converts the string token to a number.
        return +this.tokens[this.currentIndex++];
    }

    /**
     * Retrieves an array of integers of a specified size.
     * @param {number} numElements - The count of integers to read.
     * @returns {number[]} An array containing the parsed integers.
     */
    getIntArray(numElements) {
        let integerList = new Array(numElements);
        for (let k = 0; k < numElements; k++) {
            integerList[k] = this.getNextInt();
        }
        return integerList;
    }

    /**
     * Retrieves the next token from the stream as a string.
     * @returns {string} The next string token.
     */
    getNextString() {
        return this.tokens[this.currentIndex++];
    }

    /**
     * Retrieves an array of strings of a specified size.
     * @param {number} numStrings - The count of strings to read.
     * @returns {string[]} An array containing the parsed strings.
     */
    getStrArray(numStrings) {
        let stringList = new Array(numStrings);
        for (let m = 0; m < numStrings; m++) {
            stringList[m] = this.getNextString();
        }
        return stringList;
    }
}

// This block serves as the entry point for the script when executed in a Node.js environment.
// It checks if 'window' is undefined, which is typical for server-side JavaScript.
if (typeof window === "undefined") {
    // Reads the entire content of stdin synchronously and passes it to the main problem solver.
    SolveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
}
