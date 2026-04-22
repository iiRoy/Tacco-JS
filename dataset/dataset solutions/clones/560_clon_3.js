const DECODE_SHIFT_VALUE = 3;
const UPPERCASE_A_ASCII = 65;
const UPPERCASE_Z_ASCII = 90;
const ALPHABET_SPAN = 26;

/**
 * Deciphers an encoded string using a Caesar cipher with a specific shift.
 * Only processes uppercase English letters, leaving other characters untouched.
 *
 * @param {string} inputString The string to be decoded. Assumed to contain uppercase letters,
 *                             though non-alphabetic characters are preserved.
 * @returns {string} The resulting decrypted string.
 */
function decodeCipher(inputString) {
    // An array is used to accumulate characters for potentially better performance
    // compared to repeated string concatenation in a loop.
    let decodedSegments = [];

    // Iterate through each character of the provided input string by its index.
    for (let currentIdx = 0; currentIdx < inputString.length; currentIdx++) {
        const charCode = inputString.charCodeAt(currentIdx); // Get the ASCII value of the current character.

        // Determine if the current character is an uppercase English letter.
        if (charCode >= UPPERCASE_A_ASCII && charCode <= UPPERCASE_Z_ASCII) {
            // Apply the reverse shift to decrypt the letter.
            let processedCode = charCode - DECODE_SHIFT_VALUE;

            // Handle wrap-around: if the character's code falls below 'A' (e.g., 'A' shifted by -3),
            // it needs to wrap around to the end of the alphabet (e.g., 'X').
            if (processedCode < UPPERCASE_A_ASCII) {
                processedCode += ALPHABET_SPAN; // Add the alphabet size to bring it back into the valid range.
            }
            // Convert the processed ASCII code back to a character and add it to our segments.
            decodedSegments.push(String.fromCharCode(processedCode));
        } else {
            // If the character is not an uppercase letter (e.g., space, punctuation, lowercase, numbers),
            // append it to the result without modification.
            decodedSegments.push(String.fromCharCode(charCode));
        }
    }
    // Concatenate all the processed character segments into a single string.
    return decodedSegments.join('');
}

// --- Input/Output Processing Section for Command-Line Execution ---

// Require the Node.js 'fs' (file system) module for reading input.
const fileSystemModule = require('fs');

// Define the standard input path, which is common for Unix-like systems and competitive programming.
const standardInputFile = '/dev/stdin';

try {
    // Read the entire content of the standard input synchronously.
    // The content is assumed to be UTF-8 encoded text.
    const rawInputContent = fileSystemModule.readFileSync(standardInputFile, 'utf8');

    // Pre-process the raw input:
    // 1. Remove any leading or trailing whitespace (like extra newlines).
    // 2. Split the content into an array of individual lines.
    const inputLinesArray = rawInputContent.trim().split('\n');

    // Iterate over each line obtained from the input.
    inputLinesArray.forEach((currentInputLine) => {
        // Only process non-empty lines to avoid errors or unnecessary operations.
        if (currentInputLine.length > 0) {
            // Call the decryption function with the current line.
            const decipheredResult = decodeCipher(currentInputLine);

            // Output the decrypted string to the standard output.
            console.log(decipheredResult);
        }
    });
} catch (errorReadingInput) {
    // Log any errors that occur during file reading, e.g., if /dev/stdin is not accessible.
    console.error(`Error processing input: ${errorReadingInput.message}`);
    // Optionally, exit with a non-zero status code to indicate failure.
    process.exit(1);
}