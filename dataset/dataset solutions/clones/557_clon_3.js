'use strict';

// Constants for Caesar cipher operations
const DECRYPT_SHIFT_VALUE = 3;
const ALPHABET_LENGTH = 26;
const ASCII_CODE_FOR_A = 65; // 'A' character's ASCII value

// Helper function to calculate the decrypted ASCII value for a single character
function getDecryptedCharAscii(originalCharAscii) {
    let computedAscii = originalCharAscii - DECRYPT_SHIFT_VALUE;
    // If the character wraps around before 'A', adjust it by adding the alphabet length
    if (computedAscii < ASCII_CODE_FOR_A) {
        computedAscii += ALPHABET_LENGTH;
    }
    return computedAscii;
}

// Main function to decode a Caesar cipher encrypted text
function decodeCaesarCipher(encryptedText) {
    const decryptedCharacters = []; // Using an array for efficient string building
    const textLength = encryptedText.length;

    for (let charIndex = 0; charIndex < textLength; charIndex++) {
        const currentCharacterCode = encryptedText.charCodeAt(charIndex);
        const finalDecryptedAscii = getDecryptedCharAscii(currentCharacterCode);
        decryptedCharacters.push(String.fromCharCode(finalDecryptedAscii));
    }

    return decryptedCharacters.join(''); // Combine all decrypted characters into a single string
}

// Input/Output handling using readline module
const inputHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

inputHandler.on('line', (receivedLine) => {
    const trimmedInput = receivedLine.trim();
    const finalDecodedMessage = decodeCaesarCipher(trimmedInput);
    console.log(finalDecodedMessage);
    inputHandler.close();
});
