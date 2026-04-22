"use strict";
// This module provides a solution for counting specific subsequences within an input string.

function ProcessInput(sourceData) {
    // Initialize a parser to handle the raw text input.
    let dataReader = new TextParser(sourceData);

    // Extract the primary string sequence from the input stream.
    let targetSequence = dataReader.fetchString();

    // Determine the total number of characters in the target sequence.
    let sequenceLength = targetSequence.length;

    // Define the constant character pattern we are searching for.
    const PATTERN_CHARS = "ABC";
    // Define a large prime number for modular arithmetic to prevent integer overflow.
    const RESULT_MODULO = 1_000_000_007;

    // Initialize a 2D dynamic programming table (memoization table).
    // The table size is (sequenceLength + 1) by (PATTERN_CHARS.length + 1).
    // Each cell is pre-filled with zero.
    let dynamicCounts = Array.from({
        length: sequenceLength + 1
    }, () => Array(PATTERN_CHARS.length + 1).fill(0));

    // Begin iterating backwards through the target sequence.
    // 'charIndex' represents the current character's position, from end to start.
    for (let charIndex = sequenceLength; charIndex >= 0; --charIndex) {

        // Iterate backwards through the possible states of matching the pattern.
        // 'matchState' indicates how many characters of PATTERN_CHARS have been successfully matched.
        for (let matchState = PATTERN_CHARS.length; matchState >= 0; --matchState) {

            // Base case: If we have reached beyond the end of the sequence.
            if (charIndex === sequenceLength) {
                // If the match state indicates all pattern characters were matched, it's 1 valid way (empty suffix).
                // Otherwise, if the pattern is not fully matched, there are 0 ways.
                dynamicCounts[charIndex][matchState] = (matchState === PATTERN_CHARS.length ? 1 : 0);
            } else {
                // Recursive step: Calculate possibilities for the current character and match state.

                // Option 1: The current character does not contribute to matching the pattern *at this state*.
                // If the character is '?', it can be 'A', 'B', or 'C', so it contributes 3 ways
                // to continue without advancing the pattern match.
                // Otherwise, if it's a specific character that doesn't match, it contributes 1 way.
                dynamicCounts[charIndex][matchState] = dynamicCounts[charIndex + 1][matchState] *
                    (targetSequence[charIndex] === '?' ? 3 : 1);

                // Option 2: The current character *does* contribute to advancing the pattern match.
                // This is possible if we haven't completed the pattern yet (matchState < PATTERN_CHARS.length),
                // AND the current character is '?' OR it exactly matches the next expected character in PATTERN_CHARS.
                if (matchState < PATTERN_CHARS.length &&
                    (targetSequence[charIndex] === '?' || targetSequence[charIndex] === PATTERN_CHARS[matchState])) {
                    // Add the number of ways from the next state (where one more pattern character is matched).
                    dynamicCounts[charIndex][matchState] += dynamicCounts[charIndex + 1][matchState + 1];
                }

                // Apply the modulo operation to keep the result within the desired range.
                dynamicCounts[charIndex][matchState] %= RESULT_MODULO;
            }
        }
    }
    // Output the final count: the number of ways to match the pattern starting from the beginning
    // with an initial match state of zero (no pattern characters matched yet).
    console.log(dynamicCounts[0][0]);
}

// A helper class for parsing various data types from a string.
class TextParser {
    // The constructor initializes the parser with the raw input text.
    constructor(textContent) {
        this.tokenCounter = 0; // Keeps track of the next token to be retrieved.
        // Splits the entire input text into an array of tokens, using newlines or spaces as delimiters.
        this.parsedElements = textContent.split(/\n|\s/);
    }

    // Fetches and returns the next integer from the parsed elements.
    fetchInteger() {
        return parseInt(this.parsedElements[this.tokenCounter++], 10);
    }

    // Fetches and returns an array of 'count' integers.
    fetchIntegerArray(count) {
        let numericList = new Array(count);
        for (let elementIdx = 0; elementIdx < count; elementIdx++) {
            numericList[elementIdx] = this.fetchInteger();
        }
        return numericList;
    }

    // Fetches and returns the next string token.
    fetchString() {
        return this.parsedElements[this.tokenCounter++];
    }

    // Fetches and returns an array of 'count' string tokens.
    fetchStringArray(count) {
        let wordList = new Array(count);
        for (let elementIdx = 0; elementIdx < count; elementIdx++) {
            wordList[elementIdx] = this.fetchString();
        }
        return wordList;
    }
}


// This conditional block checks if the script is running in a Node.js environment
// (i.e., not within a web browser context).
if (typeof globalThis.window === "undefined") {
    // If in Node.js, read the input from standard input (typically '/dev/stdin' on Unix-like systems)
    // and then pass it to the main processing function.
    ProcessInput(require("node:fs").readFileSync("/dev/stdin", "utf8"));
}