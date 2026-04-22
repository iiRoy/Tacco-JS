/*
 * This module provides a utility for decoding
 * Caesar-shifted text using a fixed shift amount.
 * It primarily handles uppercase English letters,
 * preserving other characters as they are.
 */

// Define constants for the decoding process to improve readability and maintainability.
const DECODING_SHIFT_VALUE = 3;       // The number of positions each letter is shifted back.
const ENGLISH_ALPHABET_LENGTH = 26;   // Total number of letters in the English alphabet.
const ASCII_CODE_OF_A = 'A'.charCodeAt(0); // ASCII value for the character 'A'.
const ASCII_CODE_OF_Z = 'Z'.charCodeAt(0); // ASCII value for the character 'Z'.

/**
 * Decrypts an input string that has been encoded using a Caesar cipher.
 * This function specifically reverses a 3-position forward shift.
 * Non-alphabetic characters are passed through unchanged.
 *
 * @param {string} encodedString - The string to be decrypted.
 * @returns {string} The decrypted string.
 */
function decryptMessage(encodedString) {
    // Implement a guard clause for null, undefined, or empty input strings.
    // An empty string results in an empty decrypted string.
    if (!encodedString || encodedString.length === 0) {
        return '';
    }

    // Use an array to accumulate characters for potentially better performance
    // when dealing with long strings, then join them at the end.
    const decodedCharacters = [];

    // Iterate through each character of the provided encoded text.
    for (let charIndex = 0; charIndex < encodedString.length; charIndex++) {
        const currentCharacter = encodedString.charAt(charIndex);
        const currentAsciiValue = currentCharacter.charCodeAt(0);

        // Check if the current character is an uppercase English letter.
        if (currentAsciiValue >= ASCII_CODE_OF_A && currentAsciiValue <= ASCII_CODE_OF_Z) {
            // Apply the reverse shift.
            let shiftedAscii = currentAsciiValue - DECODING_SHIFT_VALUE;

            // Handle wrap-around for letters that go below 'A' (e.g., 'C' shifted by 3 becomes 'Z').
            if (shiftedAscii < ASCII_CODE_OF_A) {
                shiftedAscii += ENGLISH_ALPHABET_LENGTH;
            }
            decodedCharacters.push(String.fromCharCode(shiftedAscii));
        } else {
            // If the character is not an uppercase letter, append it as is.
            decodedCharacters.push(currentCharacter);
        }
    }

    // Combine all processed characters into a single output string.
    return decodedCharacters.join('');
}


// --- Input/Output Handling Section ---
// This part manages reading a single line from standard input
// and writing the decrypted result to standard output.

const inputReaderInterface = require('readline').createInterface({
    input: process.stdin,  // Direct input stream from the console.
    output: process.stdout // Direct output stream to the console.
});

// Inform the user about the program's purpose.
console.log('// Caesar Cipher Decryptor //');
console.log('Please enter an encoded message (uppercase letters only for full decryption):');

// Set up an event listener to process each line received from the input.
// For this specific application, we expect only one line of input.
inputReaderInterface.on('line', (rawInputLine) => {
    // Sanitize the input by removing leading/trailing whitespace.
    const processedInput = rawInputLine.trim();

    // Perform the decryption using our core logic function.
    const finalDecodedResult = decryptMessage(processedInput);

    // Output the decrypted message to the console.
    console.log(`Decrypted: ${finalDecodedResult}`);

    // Once a line has been processed, close the input interface
    // as we are designed for single-line interaction.
    inputReaderInterface.close();
});

// Optionally, handle the 'close' event for cleanup or final messages.
inputReaderInterface.on('close', () => {
    // console.log('Input stream closed. Exiting.'); // Can be uncommented for debugging
    process.exit(0); // Ensure the process exits cleanly.
});