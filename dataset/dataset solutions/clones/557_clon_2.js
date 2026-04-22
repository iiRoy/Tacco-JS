'use strict';

// Core decryption logic for a simple shift cipher
function decryptShiftCipher(encodedMessage)
{
    let decodedResult = ''; // Stores the final decoded string

    // This constant defines the shift value for decryption
    const DECRYPTION_OFFSET = 3;

    // This constant represents the ASCII code for 'A' (uppercase start)
    const MIN_UPPERCASE_CODE = 65;

    // This constant represents the total number of letters in the English alphabet
    const ALPHABET_LENGTH = 26;

    let charValue; // Temporary variable to hold character's numerical representation

    for (let charIndex = 0; charIndex < encodedMessage.length; charIndex++)
    {
        // Get the ASCII value of the current character and apply the reverse shift
        charValue = encodedMessage.charCodeAt(charIndex) - DECRYPTION_OFFSET;

        // If the character's value falls below 'A', wrap it around the alphabet
        if (charValue < MIN_UPPERCASE_CODE)
        {
            charValue += ALPHABET_LENGTH; // Add the alphabet length to bring it back into range
        }

        // Convert the numerical value back to a character and append to the result
        decodedResult += String.fromCharCode(charValue);
    }

    return decodedResult; // Return the fully decoded string
}

// Input/Output handling setup
const inputHandler = require('node:readline').createInterface({
    input:  process.stdin,
    output: process.stdout
});

inputHandler.on('line', (inputLine) =>
{
    // Process the received line, remove leading/trailing whitespace, and decrypt
    console.log(decryptShiftCipher(inputLine.trim()));

    // Close the input interface after processing the first line
    inputHandler.close();
});