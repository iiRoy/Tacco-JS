"use strict"; // Enforce strict mode for modern JavaScript practices and error detection

/**
 * @function analyzeCharacterSequence
 * @description This module's primary function. It processes a given string to determine if,
 *              after sorting its constituent characters alphabetically, any two adjacent characters
 *              are identical. The result is then printed to the console.
 * @param {string} sourceData - The raw string input that needs to be analyzed.
 * @returns {void} The function's output (either "yes" or "no") is directly logged to the console.
 */
const analyzeCharacterSequence = (sourceData) => {
    // --- Input Pre-processing and Validation ---
    // A crucial guard clause: Check if the input is null, undefined, or an empty string
    // after trimming whitespace. If so, log an informative message and terminate early.
    if (!sourceData || sourceData.trim().length === 0) {
        console.log("No meaningful input was provided for character sequence analysis.");
        return; // Exit the function gracefully
    }

    // Step 1: Sanitize the input string by removing any leading or trailing whitespace.
    const cleanedString = sourceData.trim();

    // Step 2: Convert the cleaned string into an array of individual characters.
    // Using Array.from() provides an alternative to the traditional .split('') method.
    const characterCollection = Array.from(cleanedString);

    // Step 3: Sort the array of characters in ascending lexicographical (alphabetical) order.
    // The localeCompare method ensures correct sorting for various character sets,
    // though for simple ASCII characters, the default sort() would yield similar results.
    characterCollection.sort((charA, charB) => charA.localeCompare(charB));

    // --- Core Logic: Adjacent Duplicate Detection ---
    // Initialize a boolean flag. This flag will be set to 'true' if an adjacent duplicate pair
    // is discovered during the iteration, otherwise it will remain 'false'.
    let identifiedAdjacentDuplicate = false;

    // Iterate through the sorted character array. The loop condition ensures that
    // `currentIdx + 1` always refers to a valid index within the array,
    // preventing out-of-bounds errors when checking the next character.
    for (let currentIdx = 0; currentIdx < characterCollection.length - 1; ++currentIdx) {
        // Compare the character at the current index with the character immediately following it.
        if (characterCollection[currentIdx] === characterCollection[currentIdx + 1]) {
            identifiedAdjacentDuplicate = true; // A duplicate pair has been found!
            break; // No need to check further; the condition is met, so we can exit the loop early.
        }
    }

    // --- Final Result Determination and Output ---
    let analysisVerdict; // Declare a variable to store the final message.

    // Based on the state of our boolean flag, determine the appropriate output message.
    if (identifiedAdjacentDuplicate) {
        analysisVerdict = "no"; // Adjacent identical characters were found.
    } else {
        analysisVerdict = "yes"; // No adjacent identical characters were found.
    }

    // Print the final determined message to the standard output console.
    console.log(analysisVerdict);
};

/**
 * @function fetchStandardInput
 * @description Helper utility to safely read data from the standard input stream.
 * @returns {string} The content read from stdin, or an empty string if an error occurs.
 */
const fetchStandardInput = () => {
    try {
        // Utilize Node.js's 'fs' module to synchronously read the entire content
        // of the standard input file descriptor ('/dev/stdin') as a UTF-8 string.
        return require('fs').readFileSync('/dev/stdin', 'utf8');
    } catch (ioError) {
        // In case of any I/O errors (e.g., '/dev/stdin' not accessible, permissions),
        // log the error details and return an empty string to allow the main logic
        // to handle it gracefully via its initial validation.
        console.error("Failed to read from standard input stream:", ioError.message);
        return ""; // Provide a fallback empty string
    }
};

// --- Program Execution Flow ---
// First, retrieve the input string from the standard input stream.
const programInputString = fetchStandardInput();

// Then, invoke the main analysis function with the obtained input.
analyzeCharacterSequence(programInputString);