/**
 * This module is responsible for reading text from standard input,
 * analyzing the frequency of each lowercase English alphabet character,
 * and then printing these frequencies to the console.
 */

// Helper function to safely read content from standard input.
// It uses Node.js's 'fs' module for file system operations.
function retrieveSystemInputContent() {
    // Import the 'fs' module, which provides file system capabilities.
    const fileSystemModule = require("fs");
    const standardInputPath = "/dev/stdin"; // Standard path for input in Unix-like systems.
    const encodingFormat = "utf8"; // Specify UTF-8 encoding for text.

    try {
        // Synchronously read the entire content of the standard input.
        const acquiredContent = fileSystemModule.readFileSync(standardInputPath, encodingFormat);
        
        // A basic validation: if input is empty, issue a warning.
        if (acquiredContent.length === 0) {
            console.warn("Heads up: No content was received from standard input.");
        }
        return acquiredContent;
    } catch (inputReadError) {
        // Handle potential errors during input reading, e.g., file not found, permissions.
        console.error(`An error occurred while attempting to read standard input: ${inputReadError.message}`);
        // Return an empty string to prevent further errors downstream, maintaining program flow.
        return "";
    }
}

// A utility function to generate an ordered array of all lowercase English alphabet letters.
const constructAlphabeticalSequence = () => {
    const alphabetLetters = [];
    const asciiCodeForA = 'a'.charCodeAt(0); // ASCII value for 'a'
    const asciiCodeForZ = 'z'.charCodeAt(0); // ASCII value for 'z'

    // Loop from 'a' to 'z' using their ASCII codes.
    for (let charCode = asciiCodeForA; charCode <= asciiCodeForZ; charCode++) {
        alphabetLetters.push(String.fromCharCode(charCode)); // Convert ASCII code back to character.
    }
    return alphabetLetters;
};

// An internal helper to check if a given character is an English alphabet letter.
const isEnglishAlphabetLetter = (characterToValidate) => {
    // Convert the character to lowercase for case-insensitive comparison.
    const lowercaseChar = characterToValidate.toLowerCase();
    // Check if the character falls within the 'a' to 'z' range.
    return lowercaseChar >= 'a' && lowercaseChar <= 'z';
};

// Main execution block: This IIFE (Immediately Invoked Function Expression)
// encapsulates the core logic to prevent global variable pollution.
(function performCharacterFrequencyAnalysis() {
    // First, establish our reference set of alphabet characters.
    const orderedAlphabet = constructAlphabeticalSequence();

    // Retrieve the raw textual data from the system's input stream.
    const rawInputStreamData = retrieveSystemInputContent();

    // If no data was obtained, we might still want to print zeros for all letters,
    // so we proceed, but the frequency map will naturally be empty.

    // Initialize an object to store the frequency counts of each character.
    // We use the `reduce` method to iterate over each character in the input string.
    const characterOccurrenceMap = rawInputStreamData
        .split('') // Break the input string into an array of individual characters.
        .reduce((currentTally, charFromInput) => {
            // Normalize the character to lowercase to count 'A' and 'a' as the same.
            const processedChar = charFromInput.toLowerCase();

            // Only count characters that are identified as English alphabet letters.
            if (isEnglishAlphabetLetter(processedChar)) {
                // Increment the count for the character. If it's the first encounter,
                // initialize its count to 0 before adding 1.
                currentTally[processedChar] = (currentTally[processedChar] || 0) + 1;
            }
            // Return the updated tally object for the next iteration.
            return currentTally;
        }, {}); // The initial value for the accumulator is an empty object.

    // Now, iterate through our predefined alphabet and display the calculated frequencies.
    // This ensures all alphabet letters are displayed, even if they didn't appear in the input.
    for (const alphabetLetter of orderedAlphabet) {
        // Retrieve the count for the current letter from our map.
        // If the letter was not found in the input, its count defaults to 0.
        const frequencyCount = characterOccurrenceMap[alphabetLetter] || 0;
        
        // Output the result in the format "letter : count".
        console.log(`${alphabetLetter} : ${frequencyCount}`);
    }

})(); // End of the main execution block.