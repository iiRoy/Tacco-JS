'use strict';

// Constants for the decoding process
const DECODE_SHIFT_VALUE = 3;
const ASCII_CODE_FOR_A = 65;
const ALPHABET_LENGTH = 26;

// Core decoding logic function
function decodeCipher(encodedMessage) {
    let decodedResult = '';
    let currentCharacterCode; // Variable to hold the ASCII code of the current character after processing

    // Iterate through each character of the input message string
    for (let charIndex = 0; charIndex < encodedMessage.length; charIndex++) {
        // Retrieve the original ASCII code of the character at the current index
        let originalCode = encodedMessage.charCodeAt(charIndex);

        // Apply the Caesar cipher shift by subtracting the defined shift value
        currentCharacterCode = originalCode - DECODE_SHIFT_VALUE;

        // Implement wrap-around logic for characters that fall below 'A' (e.g., 'C' shifted by 3 becomes 'Z')
        if (currentCharacterCode < ASCII_CODE_FOR_A) {
            currentCharacterCode += ALPHABET_LENGTH; // Add the alphabet length to wrap it back around
        }

        // Convert the processed ASCII code back to a character and append it to the result string
        decodedResult += String.fromCharCode(currentCharacterCode);
    }

    return decodedResult;
}

// Helper function to encapsulate the processing and output of a single line of input
const processSingleInputLine = (inputLineContent) => {
    // A minor guard to ensure we don't process entirely empty strings if they somehow appear,
    // though `trim().split('\n')` usually handles this gracefully.
    if (inputLineContent.length > 0) {
        const outputString = decodeCipher(inputLineContent);
        console.log(outputString);
    }
};

// Main execution block responsible for reading input from stdin and orchestrating the decoding process
const executeDecodingProcess = () => {
    // Use Node.js 'fs' module to synchronously read the entire content from standard input
    const rawFileContent = require('fs').readFileSync('/dev/stdin', 'utf8');

    // Trim any leading/trailing whitespace from the entire file content, then split it into an array of lines
    const inputLines = rawFileContent.trim().split('\n');

    // Iterate over each line obtained from the input file
    for (const line of inputLines) {
        // Call the helper function to process and print the decoded version of the current line
        processSingleInputLine(line);
    }
};

// Initiate the entire decoding process by calling the main execution function
executeDecodingProcess();
