"use strict"; // Enforce strict mode for cleaner code execution

/**
 * Creates an input reader utility from standard input.
 * This function reads all lines from /dev/stdin, stores them,
 * and provides methods to access them sequentially.
 * @returns {object} An object with methods to navigate input lines.
 */
const makeInputReader = () => {
    // Read the entire standard input, decode as UTF-8, trim whitespace, and split into an array of lines.
    const dataLines = require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

    // Construct the reader object with line storage, current position, and total line count.
    const readerObject = {
        lineStorage: dataLines, // Array holding all input lines
        currentPosition: 0,    // Current index for line retrieval
        totalLines: dataLines.length, // Total number of lines available

        /**
         * Checks if there are more lines to read.
         * @returns {boolean} True if more lines exist, false otherwise.
         */
        hasMoreData: function() {
            return this.currentPosition < this.totalLines;
        },

        /**
         * Retrieves the next line from the input.
         * Throws an error if no more lines are available.
         * @returns {string} The next line of input.
         * @throws {string} "ArrayIndexOutOfBoundsException" if attempting to read past the end.
         */
        retrieveNextLine: function() {
            if (!this.hasMoreData()) {
                throw "ArrayIndexOutOfBoundsException"; // Indicate out-of-bounds access
            } else {
                return this.lineStorage[this.currentPosition++]; // Return current line and advance position
            }
        }
    };
    return readerObject; // Return the fully configured reader
};

// Initialize the global input handler instance.
const inputHandler = makeInputReader();

// Helper functions for convenient input parsing.

/**
 * Gets the next raw line of input.
 * @returns {string} The next line.
 */
const getNextLine = () => inputHandler.retrieveNextLine();

/**
 * Parses the next line as an integer.
 * @returns {number} The parsed integer.
 */
const parseNextInteger = () => parseInt(inputHandler.retrieveNextLine());

/**
 * Gets the next line and splits it into an array of strings by space.
 * @returns {string[]} An array of strings.
 */
const getNextStringArray = () => inputHandler.retrieveNextLine().split(" ");

/**
 * Gets the next line, splits it by space, and parses each part as an integer.
 * @returns {number[]} An array of integers.
 */
const getNextIntegerArray = () => inputHandler.retrieveNextLine().split(" ").map(el => parseInt(el));

/**
 * Gets the next line and splits it into an array of individual characters.
 * @returns {string[]} An array of characters.
 */
const getNextCharacterArray = () => inputHandler.retrieveNextLine().split("");

/**
 * Checks if there's more data available from the input source.
 * @returns {boolean} True if more data, false otherwise.
 */
const checkMoreData = () => inputHandler.hasMoreData();

/**
 * Custom output function that wraps console.log.
 * @param {...any} outputItems - Items to be logged to the console.
 */
const displayOutput = (...outputItems) => console.log(...outputItems);

/**
 * The primary logic execution function.
 * This function processes the input according to the problem's requirements.
 */
const ProcessMainLogic = () => {
    // Read the first integer, though it's not used in the subsequent logic.
    let lineCount = parseNextInteger();

    // Define the lowercase English alphabet for character indexing.
    const alphabetString = "abcdefghijklmnopqrstuvwxyz";

    // Initialize an array to store the minimum frequency of each character across all input strings.
    // -1 indicates the character hasn't been encountered yet.
    // 0 indicates the character was encountered in a previous string but not in the current one,
    //   meaning its overall frequency limit is 0.
    let charFrequencyLimits = new Array(26).fill(-1);

    // Loop through all remaining input lines.
    while (checkMoreData()) {
        let currentLineText = getNextLine(); // Get the current line as a string.

        // Initialize a frequency counter for characters in the current line.
        let lineCharCounts = new Array(26).fill(0);

        // Count character frequencies for the current line.
        for (let characterElement of currentLineText) {
            let charIndex = alphabetString.indexOf(characterElement); // Get index of character.
            lineCharCounts[charIndex]++; // Increment count for this character.
        }

        // Update the global minimum frequency limits based on the current line's counts.
        for (let loopCounter = 0; loopCounter < charFrequencyLimits.length; loopCounter++) {
            if (lineCharCounts[loopCounter] === 0) {
                // If a character is not in the current string, its overall frequency limit becomes 0.
                charFrequencyLimits[loopCounter] = 0;
            } else if (charFrequencyLimits[loopCounter] === -1 && lineCharCounts[loopCounter] !== 0) {
                // If this is the first time we're seeing this character, set its limit to its current count.
                charFrequencyLimits[loopCounter] = lineCharCounts[loopCounter];
            } else if (charFrequencyLimits[loopCounter] !== 0 && lineCharCounts[loopCounter] !== 0) {
                // If the character has been seen before and is in the current string,
                // update its limit to the minimum of its current limit and the current string's count.
                charFrequencyLimits[loopCounter] = Math.min(charFrequencyLimits[loopCounter], lineCharCounts[loopCounter]);
            }
        }
    }

    // Construct the final result string based on the calculated frequency limits.
    let resultCharacters = [];
    for (let loopCounter = 0; loopCounter < charFrequencyLimits.length; loopCounter++) {
        if (charFrequencyLimits[loopCounter] === 0) {
            // If the limit is 0, this character should not be in the result.
            continue;
        }
        // Add the character to the result array as many times as its frequency limit.
        while (charFrequencyLimits[loopCounter] > 0) {
            resultCharacters.push(alphabetString[loopCounter]);
            charFrequencyLimits[loopCounter]--;
        }
    }

    // Sort the resulting characters alphabetically.
    resultCharacters.sort();

    // Print the final string by joining the characters.
    console.log(resultCharacters.join(""));
};

// Execute the main program logic.
ProcessMainLogic();
