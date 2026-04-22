'use strict';

// This module provides a utility function for reversing a specific Caesar cipher
// and handles reading encrypted messages from standard input for decryption.

/**
 * Decrypts a given string using a fixed Caesar cipher shift.
 * This function applies a backward shift of 3 positions to each character's ASCII value.
 * Characters whose shifted value falls below the ASCII value of 'A' (65) are
 * wrapped around by adding 26, effectively cycling through the alphabet.
 * Non-alphabetic characters are also shifted and wrapped according to this rule,
 * mirroring the original implementation's behavior.
 *
 * @param {string} inputCiphertext - The string to be decrypted.
 * @returns {string} The decrypted string. Returns an empty string for invalid input.
 */
function charShiftDecoder(inputCiphertext) {
    // Input validation: Ensure the provided message is a string.
    // Null or non-string inputs are treated as empty for consistent processing.
    if (typeof inputCiphertext !== 'string' || inputCiphertext === null) {
        return '';
    }

    // Define constants to make the decryption logic explicit and easily modifiable.
    const DECRYPTION_SHIFT = 3; // The number of positions to shift characters backward.
    const ASCII_LOWER_BOUND_FOR_WRAP = 'A'.charCodeAt(0); // ASCII value for 'A' (65).
    const ALPHABET_SPAN = 26; // The size of the character range for wrap-around (e.g., A-Z).

    // An array to accumulate the ASCII codes of the decrypted characters.
    // Using an array and then joining is often more performant for many concatenations.
    let processedCharCodes = [];

    // Iterate through each character of the input ciphertext.
    for (let currentPos = 0; currentPos < inputCiphertext.length; currentPos++) {
        // Obtain the ASCII value of the character at the current position.
        let originalCharCodeValue = inputCiphertext.charCodeAt(currentPos);

        // Apply the primary backward shift to the character's ASCII value.
        let shiftedCharCodeValue = originalCharCodeValue - DECRYPTION_SHIFT;

        // Implement the wrap-around logic. If the shifted value drops below the
        // defined lower bound, add the alphabet span to bring it back into range.
        // This handles cases like 'C' (67) shifting to 64, which then wraps to 90 ('Z').
        if (shiftedCharCodeValue < ASCII_LOWER_BOUND_FOR_WRAP) {
            shiftedCharCodeValue += ALPHABET_SPAN;
        }

        // Add the final adjusted ASCII character code to our collection.
        processedCharCodes.push(shiftedCharCodeValue);
    }

    // Convert the array of character codes into an array of actual characters.
    let finalDecodedCharacters = processedCharCodes.map(code => String.fromCharCode(code));

    // Join all the individual characters to form the complete decrypted string.
    return finalDecodedCharacters.join('');
}


// --- Input/Output Handling Section ---
// This part reads input from standard input, processes it, and prints results.

// Import the necessary Node.js 'fs' (file system) module.
const fileSystemHandler = require('fs');

// Specify the standard input path, which is typically '/dev/stdin' on Unix-like systems.
const standardInputFile = '/dev/stdin';

try {
    // Read the entire content of the standard input file synchronously.
    // The content is treated as UTF-8 text and trimmed of surrounding whitespace.
    const allInputData = fileSystemHandler.readFileSync(standardInputFile, 'utf8').trim();

    // Split the raw input data into an array of individual lines.
    // Each element in `sourceLines` represents one line from the input.
    const sourceLines = allInputData.split('\n');

    // Iterate over each line obtained from the input.
    for (const currentInputLine of sourceLines) {
        // Apply the decryption function to the current line of text.
        // The result will be the decrypted version of the line.
        const outputResult = charShiftDecoder(currentInputLine);

        // Print the decrypted line to standard output.
        console.log(outputResult);
    }
} catch (ioError) {
    // Catch and report any errors that occur during file reading or processing.
    console.error("An error was encountered during input/output operations:", ioError.message);
    // Optionally, terminate the process with an error code.
    // process.exit(1);
}