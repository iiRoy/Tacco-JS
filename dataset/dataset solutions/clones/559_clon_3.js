'use strict';

// This module contains a function designed to reverse a simple Caesar cipher,
// specifically for a fixed shift value, targeting uppercase English letters.

/**
 * Decodes a string that has been encrypted using a Caesar cipher with a fixed shift.
 * It primarily handles uppercase English letters, leaving other characters unchanged.
 *
 * @param {string} encryptedInput The string to be decoded.
 * @returns {string} The decoded string, or an empty string if input is invalid.
 */
function decodeShiftedText(encryptedInput) {
    // --- Decoding Configuration Constants (Type III addition) ---
    const SHIFT_BACK_AMOUNT = 3;      // The number of positions to shift each character back.
    const ASCII_CODE_FOR_A = 65;      // The ASCII value for the uppercase letter 'A'.
    const ASCII_CODE_FOR_Z = 90;      // The ASCII value for the uppercase letter 'Z'.
    const ALPHABET_SPAN = 26;         // The total number of letters in the English alphabet.

    // --- Input Robustness Check (Type III addition: Guard clauses) ---
    // Ensure the input is a valid string before proceeding.
    if (typeof encryptedInput !== 'string' || encryptedInput === null) {
        console.warn("Warning: Received non-string or null input for decoding. Returning empty string.");
        return ''; // Gracefully handle invalid input by returning an empty string.
    }
    // Handle an empty input string immediately to avoid unnecessary processing.
    if (encryptedInput.length === 0) {
        return '';
    }

    // --- Character Processing (Type III update: using array for efficiency) ---
    // An array is used to build the new string, which can be more efficient than
    // repeated string concatenation in a loop, especially for longer strings.
    let decodedCharacterFragments = [];
    let processedCharCode; // Temporary variable to hold the ASCII code during processing.

    // Iterate through each character of the provided encrypted text.
    for (let charIterator = 0; charIterator < encryptedInput.length; charIterator++) {
        const originalCharacter = encryptedInput.charAt(charIterator); // Extract current character.
        processedCharCode = originalCharacter.charCodeAt(0);          // Convert to its ASCII integer value.

        // --- Conditional Decoding Logic (Type III update: explicit range check) ---
        // Only apply the shift to characters that are uppercase English letters (A-Z).
        // Non-alphabetic characters are passed through without modification.
        if (processedCharCode >= ASCII_CODE_FOR_A && processedCharCode <= ASCII_CODE_FOR_Z) {
            // Apply the reverse shift.
            processedCharCode -= SHIFT_BACK_AMOUNT;

            // Handle wrap-around for letters that go below 'A' after shifting.
            // For example, if 'C' (67) is shifted back by 3, it becomes 'A' (65).
            // If 'A' (65) is shifted back by 3, it becomes 62, which is not a letter.
            // It needs to wrap around to 'X' (65 + 26 - 3 = 88).
            if (processedCharCode < ASCII_CODE_FOR_A) {
                processedCharCode += ALPHABET_SPAN;
            }
        }
        // Add the (potentially modified) character back to our collection.
        decodedCharacterFragments.push(String.fromCharCode(processedCharCode));
    }

    // Concatenate all collected characters into a single decoded string.
    return decodedCharacterFragments.join('');
}

// --- Console Input/Output Handling (Type II renaming, Type III additions) ---

// Acquire the 'readline' native Node.js module to manage interactive console I/O.
const consoleIOManager = require('readline');

// Establish a command-line interface instance for reading user input line by line.
// This setup routes standard input to be read and standard output for responses.
const userConsoleInterface = consoleIOManager.createInterface({
    input: process.stdin,  // Directs input to come from the standard input stream.
    output: process.stdout // Directs output to go to the standard output stream.
});

/**
 * Processes each line of input received from the console.
 * It trims the input, attempts to decode it, and logs the result or any errors.
 *
 * @param {string} rawInputLine The raw line of text received from the console.
 */
const handleInputLineProcessing = (rawInputLine) => {
    // Sanitize the input by removing any leading or trailing whitespace.
    const cleanedLineContent = rawInputLine.trim();

    // --- Robust Error Handling (Type III addition: try-catch block) ---
    // Wrap the decoding process in a try-catch block to gracefully manage potential runtime issues.
    try {
        // Execute the decoding function on the cleaned input.
        const outputDecodedString = decodeShiftedText(cleanedLineContent);
        // Display the final decoded string to the user.
        console.log(outputDecodedString);
    } catch (operationError) {
        // If an error occurs during the decoding process, log the error details.
        console.error(`Error encountered while processing input: ${operationError.message}`);
        // Provide a user-friendly message indicating that processing failed.
        console.log("[Decoding Failed for this line]");
    }
};

// Register 'handleInputLineProcessing' as the callback for the 'line' event.
// This ensures that our function is invoked every time the user enters a line
// and presses Enter in the console.
userConsoleInterface.on('line', handleInputLineProcessing);

// --- Session Termination Hook (Type III addition) ---
// Set up a listener for the 'close' event, which fires when the input stream ends.
// This provides a clean exit message and explicitly terminates the Node.js process.
userConsoleInterface.on('close', () => {
    console.log("Console input session terminated. Exiting application.");
    process.exit(0); // Ensure a clean process exit.
});