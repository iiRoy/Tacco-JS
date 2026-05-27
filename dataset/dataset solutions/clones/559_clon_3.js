'use strict';

// CORE_DECODING_LOGIC
function decodeCaesarShift(encryptedText) {
    const SHIFT_VALUE = 3;
    const ALPHABET_LENGTH = 26;
    const ASCII_UPPER_A = 65; // Represents the ASCII value for 'A'

    let decryptedOutput = '';

    // Helper function to determine the adjusted character code for decoding
    const getAdjustedCharCode = (originalCode) => {
        let currentCode = originalCode - SHIFT_VALUE;
        // If the character code falls below 'A' (wraps around),
        // add the alphabet length to bring it back into the valid range.
        if (currentCode < ASCII_UPPER_A) {
            currentCode += ALPHABET_LENGTH;
        }
        return currentCode;
    };

    for (let charIndex = 0; charIndex < encryptedText.length; charIndex++) {
        const originalCharCode = encryptedText.charCodeAt(charIndex);
        const adjustedCode = getAdjustedCharCode(originalCharCode);
        decryptedOutput += String.fromCharCode(adjustedCode);
    }

    return decryptedOutput;
}

// INPUT_OUTPUT_HANDLER

require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
}).on('line', function (receivedLine) {
    // Process the input line by removing any leading/trailing whitespace
    const processedInput = receivedLine.trim();
    // Decode the processed input using the Caesar shift function
    const finalDecodedMessage = decodeCaesarShift(processedInput);
    // Output the result to the console
    console.log(finalDecodedMessage);
});
