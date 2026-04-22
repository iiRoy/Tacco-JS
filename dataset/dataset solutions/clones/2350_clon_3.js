/**
 * @file This script processes a given input string to determine the minimum
 *       number of character modifications required to transform it into a palindrome.
 *       It achieves this by comparing the string with its reverse and counting
 *       the characters that do not match their symmetric counterparts.
 */

/**
 * Orchestrates the primary logic for analyzing an input string for palindrome characteristics.
 * This function takes raw string data, cleans it, converts it to a character sequence,
 * and then computes the necessary changes for palindromic symmetry.
 *
 * @param {string} rawData - The unprocessed string input that needs to be analyzed.
 */
function processInputData(rawData) {
    // Step 1: Normalize the input string.
    // Remove any leading or trailing whitespace to ensure that only significant
    // characters are considered in the palindrome assessment.
    const cleanedString = rawData.trim();

    // Step 2: Decompose the string into an array of individual characters.
    // This allows for indexed access and character-by-character comparison,
    // which is crucial for determining symmetric differences.
    const charSequence = Array.from(cleanedString);

    // Step 3: Ascertain the total length of the character sequence.
    // This length is used for loop boundaries and for calculating symmetric indices.
    const sequenceLength = charSequence.length;

    // Step 4: Initialize a counter for differing characters.
    // This counter is initially set to the total length of the sequence.
    // It will be decremented for each character that is already in its
    // correct palindrome position (i.e., matches its symmetric counterpart).
    let mismatchTally = sequenceLength;

    // Step 5: Iterate through the character sequence to identify mismatches.
    // The loop progresses from the beginning to the end of the sequence.
    for (let currentIdx = 0; currentIdx < sequenceLength; currentIdx++) {
        // For each character at `currentIdx`, compare it with the character
        // positioned symmetrically from the end of the sequence.
        // The symmetric index is calculated as `(sequenceLength - 1 - currentIdx)`.
        if (charSequence[currentIdx] === charSequence[sequenceLength - 1 - currentIdx]) {
            // If the character at `currentIdx` is identical to its symmetric pair,
            // it signifies that this character pair already contributes to the
            // palindromic structure. Thus, it does not require a change,
            // and the `mismatchTally` is reduced.
            mismatchTally--;
        }
    }

    // Step 6: Calculate and display the final result.
    // The `mismatchTally` at this point represents the total count of characters
    // that are not in their correct palindrome positions. Since each required
    // change involves a pair of characters (one on each side of the string),
    // the total tally must be divided by two to get the minimum number of
    // *operations* (character changes) needed.
    console.log(mismatchTally / 2);
}

// Global execution block:
// This section is responsible for setting up the environment to read input
// from the standard input stream and then invoking the main processing function.

// Obtain a reference to the Node.js file system module.
const fileSystemModule = require("fs");

// Define the standard input path for Unix-like systems.
const standardInputPath = "/dev/stdin";

// Specify the character encoding for reading the input file.
const encodingFormat = "utf8";

// Read the entire contents of the standard input file synchronously.
// The data is read as a string using the specified encoding.
const rawInputData = fileSystemModule.readFileSync(standardInputPath, encodingFormat);

// Initiate the core processing logic by passing the raw input data.
processInputData(rawInputData);