'use strict';

// Core logic for decoding a Caesar cipher
function decodeCaesarShift(encodedMessage) {
    const CAESAR_SHIFT_VALUE = 3;
    const ENGLISH_ALPHABET_SIZE = 26;
    const ASCII_CODE_FOR_A = 65; // 'A' in ASCII

    let resultDecodedMessage = '';
    let processedCharacterAscii; // Holds the ASCII value after shifting

    for (let charIndex = 0; charIndex < encodedMessage.length; charIndex++) {
        let currentCharacterOriginalCode = encodedMessage.charCodeAt(charIndex);
        processedCharacterAscii = currentCharacterOriginalCode - CAESAR_SHIFT_VALUE;

        // If the character's ASCII value falls below 'A', wrap it around
        if (processedCharacterAscii < ASCII_CODE_FOR_A) {
            processedCharacterAscii += ENGLISH_ALPHABET_SIZE;
        }
        resultDecodedMessage += String.fromCharCode(processedCharacterAscii);
    }

    return resultDecodedMessage;
}

// Input/Output handling
const fileSystemModule = require('fs');
const standardInputFilePath = '/dev/stdin';
const fileContentEncoding = 'utf8';

// Read the entire content from standard input
const rawFileContentBuffer = fileSystemModule.readFileSync(standardInputFilePath, fileContentEncoding);

// Process the raw content: trim whitespace and split into individual lines
const trimmedInputString = rawFileContentBuffer.trim();
const arrayOfInputLines = trimmedInputString.split('\n');

// Iterate over each line and apply the decoding function
for (let lineIterator = 0; lineIterator < arrayOfInputLines.length; lineIterator++) {
    const currentInputLine = arrayOfInputLines[lineIterator];
    console.log(decodeCaesarShift(currentInputLine));
}
