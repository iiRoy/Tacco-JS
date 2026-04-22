// This module provides utilities for interacting with the file system.
const fileSystemHandler = require('fs');

// Define the standard lowercase English alphabet. This string serves as the lookup table
// for Caesar cipher operations, mapping character positions to their shifted counterparts.
const baseAlphabetChars = 'abcdefghijklmnopqrstuvwxyz';
const alphabetSize = baseAlphabetChars.length; // Store the length for efficient modulo operations.

/**
 * Transforms a single character using a Caesar cipher shift.
 * Only lowercase English letters are affected; all other characters (e.g., spaces, punctuation,
 * uppercase letters, numbers) are returned without modification.
 *
 * @param {string} characterToProcess - The character to be potentially shifted.
 * @param {number} encryptionKey - The integer value representing the shift amount.
 * @returns {string} The shifted character if it's a lowercase letter, otherwise the original character.
 */
function applyRotationalCipher(characterToProcess, encryptionKey) {
    // Determine the ASCII code of the character to check if it's within the 'a'-'z' range.
    const charAsciiCode = characterToProcess.charCodeAt(0);

    // ASCII values for 'a' and 'z' are 97 and 122, respectively.
    if (charAsciiCode >= 97 && charAsciiCode <= 122) {
        // Find the zero-based index of the character within our alphabet string.
        const originalCharacterIndex = baseAlphabetChars.indexOf(characterToProcess);
        // Calculate the new index after applying the shift. The modulo operation
        // ensures that the index wraps around from 'z' back to 'a' if it exceeds `alphabetSize - 1`.
        const newCharacterIndex = (originalCharacterIndex + encryptionKey) % alphabetSize;
        // Retrieve the character at the new index from our alphabet string.
        return baseAlphabetChars[newCharacterIndex];
    }
    // If the character is not a lowercase letter, return it as is.
    return characterToProcess;
}

// Regular expression to detect specific common English words ("the", "this", "that").
// This pattern is used to identify potentially meaningful decryptions among the many shifts.
const keywordDetectionPattern = /th(e|is|at)/;

try {
    // Read all contents from standard input, assuming UTF-8 encoding.
    // The path '/dev/stdin' is a common convention for standard input in Unix-like systems.
    const rawInputData = fileSystemHandler.readFileSync('/dev/stdin', 'utf8');

    // Split the entire input data into an array of individual lines.
    // Each element in the 'incomingTextLines' array represents one line from the input.
    const incomingTextLines = rawInputData.split('\n');

    // Process each line from the input independently.
    incomingTextLines.forEach(function(currentInputLine) {
        // Trim whitespace from the current line and check if it's empty.
        // Empty lines do not require any cipher processing.
        if (currentInputLine.trim().length === 0) {
            return; // Skip to the next line.
        }

        // Iterate through all 26 possible Caesar cipher shifts (from 0 to 25).
        // Each iteration attempts to decrypt the line with a different key.
        for (let currentShiftValue = 0; currentShiftValue < alphabetSize; currentShiftValue++) {
            // Convert the current line into an array of individual characters.
            const lineCharacters = currentInputLine.split('');

            // Apply the rotational cipher to each character in the line using the current shift value.
            // This creates an array of shifted characters.
            const shiftedCharactersArray = lineCharacters.map(char =>
                applyRotationalCipher(char, currentShiftValue)
            );

            // Join the array of shifted characters back into a single string.
            // This is our potential decrypted message for the current shift.
            const candidateDecryptedMessage = shiftedCharactersArray.join('');

            // Check if the candidate decrypted message contains any of the predefined keywords.
            // If a match is found, it suggests a successful decryption for this shift value.
            if (keywordDetectionPattern.test(candidateDecryptedMessage)) {
                // Output the successfully decrypted message to the console.
                // The original code implies that all matching shifts should be printed.
                console.log(candidateDecryptedMessage);
            }
        }
    });
} catch (errorDetails) {
    // In case of any errors during file reading or processing, log the error.
    // This is an added robustness feature not present in the original minified code.
    console.error("An error occurred during input processing:", errorDetails.message);
}