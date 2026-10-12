"use strict"; // Enforce strict mode for robust code execution.

/**
 * Processes the raw input data to solve a dynamic programming problem.
 * This function calculates the number of ways to form the "ABC" subsequence
 * within a given string, where '?' acts as a wildcard character.
 *
 * @param {string} rawData - The complete input string received from the environment.
 */
function ProcessInput(rawData) {
    // Initialize a data parsing utility to handle input tokens.
    let dataHandler = new TextProcessor(rawData);

    // Retrieve the main sequence string from the parsed input.
    let sourceSequence = dataHandler.getNextString();

    // Determine the total length of the source sequence.
    let sequenceLength = sourceSequence.length;

    // Define the specific target character pattern we are looking for.
    const targetPattern = "ABC";

    // Set the modulus constant to prevent integer overflow during calculations.
    const modulusConstant = 1e9 + 7;

    // Initialize a 2D array for dynamic programming memoization.
    // The dimensions are (sequenceLength + 1) by (targetPattern.length + 1).
    // Each cell is initially filled with zero.
    let memoTable = new Array(sequenceLength + 1).fill(0).map(() => new Array(targetPattern.length + 1).fill(0));

    // Iterate through the source sequence from its end towards the beginning.
    for (let currentPos = sequenceLength; currentPos >= 0; --currentPos) {
        // Iterate through the segments of the target pattern, also from end to beginning.
        for (let patternSegment = targetPattern.length; patternSegment >= 0; --patternSegment) {
            // Base case: If we have reached the end of the source sequence.
            if (currentPos === sequenceLength) {
                // If the pattern segment is also at its end, it means we successfully formed the pattern.
                // Otherwise, it's not possible to form the pattern from this point.
                memoTable[currentPos][patternSegment] = (patternSegment === targetPattern.length ? 1 : 0);
            } else {
                // Recursive step: Calculate the number of ways for the current state.

                // Option 1: The character at currentPos does not contribute to the current patternSegment,
                // or it's a '?' and we choose not to use it for this segment.
                // If sourceSequence[currentPos] is '?', it can be any of 3 characters,
                // so we multiply by 3. Otherwise, it's just 1 way to skip it.
                memoTable[currentPos][patternSegment] = memoTable[currentPos + 1][patternSegment] * (sourceSequence[currentPos] === '?' ? 3 : 1);

                // Option 2: The character at currentPos matches the current patternSegment,
                // or it's a '?' and we choose to use it for this segment.
                // This is only valid if we haven't completed the target pattern yet.
                if (patternSegment < targetPattern.length && (sourceSequence[currentPos] === '?' || sourceSequence[currentPos] === targetPattern[patternSegment])) {
                    // Add the ways from the next position and the next pattern segment.
                    memoTable[currentPos][patternSegment] += memoTable[currentPos + 1][patternSegment + 1];
                }

                // Apply the modulo operation to keep the result within the defined range.
                memoTable[currentPos][patternSegment] %= modulusConstant;
            }
        }
    }

    // Output the final result, which is the number of ways to form the pattern
    // starting from the beginning of the source sequence and the beginning of the target pattern.
    console.log(memoTable[0][0]);
}

/**
 * A helper class designed to parse various data types from a given text input.
 * It tokenizes the input by newlines or spaces and provides methods to retrieve
 * integers and strings sequentially.
 */
class TextProcessor {
    /**
     * Constructs a new TextProcessor instance.
     * @param {string} textInput - The raw string containing space or newline separated values.
     */
    constructor(textInput) {
        // Initialize a pointer to keep track of the current token being read.
        this.readPointer = 0;
        // Split the input text into an array of tokens using newlines or spaces as delimiters.
        this.tokenizedData = textInput.split(/\n|\s/);
    }

    /**
     * Retrieves and parses the next token as an integer.
     * @returns {number} The integer value of the next token.
     */
    getNextInt() {
        // Use the unary plus operator to convert the string token to a number.
        return this.tokenizedData[this.readPointer++] - 0;
    }

    /**
     * Retrieves an array of integers of a specified length.
     * @param {number} count - The number of integers to fetch.
     * @returns {number[]} An array containing the parsed integers.
     */
    fetchIntegerArray(count) {
        let numArray = new Array(count);
        for (let k = 0; k < count; k++) {
            numArray[k] = this.getNextInt();
        }
        return numArray;
    }

    /**
     * Retrieves the next token as a string.
     * @returns {string} The next string token.
     */
    getNextString() {
        return this.tokenizedData[this.readPointer++];
    }

    /**
     * Retrieves an array of string tokens of a specified length.
     * @param {number} count - The number of strings to fetch.
     * @returns {string[]} An array containing the string tokens.
     */
    fetchStringArray(count) {
        let strArray = new Array(count);
        for (let m = 0; m < count; m++) {
            strArray[m] = this.getNextString();
        }
        return strArray;
    }
}

// This block checks if the script is running in a Node.js environment (not a browser).
// If it is, it reads the input from standard input and passes it to the main processing function.
if (typeof window === "undefined") {
    // Use Node.js's 'fs' module to synchronously read the entire content of /dev/stdin.
    // The input is expected to be UTF-8 encoded.
    ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
}
