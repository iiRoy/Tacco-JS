/*
 * This module processes input data from standard input.
 * It reads multiple test cases, each consisting of a number (N)
 * followed by N strings. For each test case, it performs a
 * series of transformations and calculations to produce an output.
 */

// Import the Node.js file system module for reading input.
const acquireModule = require("fs");

// Read all content from standard input as a UTF-8 string.
let dataStream = acquireModule.readFileSync("/dev/stdin", "utf8");

// Split the entire input content into an array of lines.
dataStream = dataStream.split("\n");

// Initialize a pointer to keep track of the current line being processed
// from the 'dataStream' array.
let readPtr = 0;

/**
 * This function encapsulates the logic for processing a single test case.
 * It reads a batch of strings, transforms them, sorts them, and then
 * calculates a specific metric based on common prefixes.
 *
 * @returns {string | void} Returns the string "break" if the end-of-input
 *                          condition (N=0) is met, otherwise returns nothing.
 */
const iterateCase = function () {
    // Read the first number of the current test case, which indicates
    // how many strings follow. The unary plus converts the string to a number.
    // The 'readPtr' is incremented after use.
    let numItems = +dataStream[readPtr++];

    // If the read number is 0, it signifies the end of all test cases.
    if (numItems === 0) {
        return "break"; // Signal the outer loop to terminate.
    }

    // Create an array to store the original strings for the current batch.
    const nameArray = [];
    // Populate the 'nameArray' with 'numItems' strings from the input stream.
    for (let counter = 0; counter < numItems; counter++) {
        nameArray.push(dataStream[readPtr++]);
    }

    // Process each string in the 'nameArray'. The transformation involves
    // extracting initial characters of "segments". A new segment starts
    // at the beginning of the string or immediately after a vowel.
    const transformedAndSorted = nameArray.map(function (originalText) {
        let processedPart = ""; // Accumulator for the transformed string fragment.
        let addNextChar = true; // Flag to determine if the next character should be appended.

        // Iterate over each character of the original string.
        for (let position = 0; position < originalText.length; position++) {
            const letter = originalText[position];

            // If 'addNextChar' is true, append the current character and reset the flag.
            if (addNextChar) {
                processedPart += letter;
                addNextChar = false;
            }

            // If the current character is a vowel (a, i, u, e, o),
            // set 'addNextChar' to true for the *next* character.
            if (/[aiueo]/.test(letter)) {
                addNextChar = true;
            }
        }
        return processedPart; // Return the resulting transformed fragment.
    }).sort(); // After transformation, sort the fragments alphabetically.

    /**
     * Calculates the length of the common prefix between two given strings.
     *
     * @param {string} firstStr  - The first string for comparison.
     * @param {string} secondStr - The second string for comparison.
     * @returns {number} The length of the common prefix. Returns -1 if both
     *                   strings are identical. Returns the length of the shorter
     *                   string if one is a prefix of the other.
     */
    const determineOverlap = function (firstStr, secondStr) {
        // Determine the length of the shorter of the two strings.
        const shorterLength = Math.min(firstStr.length, secondStr.length);

        // Iterate up to 'numItems' characters.
        // NOTE: The original code uses 'numItems' here instead of 'shorterLength'.
        // This behavior is preserved to maintain Type II cloning fidelity,
        // even if it might be an unidiomatic or potentially buggy pattern.
        for (let idx = 0; idx < numItems; idx++) {
            // If characters at the current index differ, return the index.
            if (firstStr[idx] !== secondStr[idx]) {
                return idx;
            }
        }

        // If the loop completes and both strings have the same length, they are identical.
        if (firstStr.length === secondStr.length) {
            return -1;
        }

        // If one string is a prefix of the other (and they're not identical),
        // return the length of the shorter string.
        return shorterLength;
    };

    let maxCommonality = 0; // Initialize the variable to store the maximum common prefix length found.

    // Iterate through the sorted list of transformed strings, comparing adjacent pairs.
    for (let idx = 0; idx < numItems; idx++) {
        // Skip the first element as there is no preceding element to compare with.
        if (idx === 0) {
            continue;
        }

        // Calculate the common prefix length between the current string and its predecessor.
        const commonPrefixLen = determineOverlap(transformedAndSorted[idx - 1], transformedAndSorted[idx]);

        // If 'commonPrefixLen' is -1, it means two adjacent strings are identical.
        // In this specific scenario, set 'maxCommonality' to -2 and exit the loop.
        if (commonPrefixLen === -1) {
            maxCommonality = -2;
            break;
        }

        // If the current common prefix length is greater than the previously recorded maximum, update it.
        if (commonPrefixLen > maxCommonality) {
            maxCommonality = commonPrefixLen;
        }
    }

    // Output the final calculated metric, incremented by one.
    console.log(maxCommonality + 1);
};


// This is the main application loop. It repeatedly calls 'iterateCase'
// to process test cases until 'iterateCase' signals termination.
while (true) {
    const loopOutcome = iterateCase(); // Execute one batch of processing.
    if (loopOutcome === "break") { // Check if the processing batch indicated to stop.
        break; // Exit the infinite loop.
    }
}