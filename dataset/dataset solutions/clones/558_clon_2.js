'use strict';

// Core decryption routine
function decodeMessage(encodedText) {
    let decryptedText = ''; // Stores the resulting decrypted string

    // Temporary variable to hold character ASCII value
    let charCodeBuffer;

    // Iterate through each character of the input string
    for (let charIndex = 0; charIndex < encodedText.length; charIndex++) {
        // Shift the character code by -3 (Caesar cipher decryption)
        charCodeBuffer = encodedText.charCodeAt(charIndex) - 3;

        // If the character code falls below 'A' (ASCII 65), wrap it around
        // by adding 26 (number of letters in the alphabet)
        if (charCodeBuffer < 65) {
            charCodeBuffer += 26;
        }
        // Append the decrypted character to the result string
        decryptedText += String.fromCharCode(charCodeBuffer);
    }
    
    return decryptedText; // Return the fully decrypted string
}

// Input processing from standard input
/*
// Alternative input method using readline, commented out
require('readline').createInterface({
    input: process.stdin, // Read from standard input
    output: process.stdout // Write to standard output
}).on('line', (lineContent) => console.log(decodeMessage(lineContent.trim())));
*/

// Read entire file from /dev/stdin, process each line
require('fs').readFileSync('/dev/stdin', 'utf8') // Read the file as UTF-8
    .trim() // Remove leading/trailing whitespace from the whole content
    .split('\n') // Split the content into an array of lines
    .forEach(function (inputLine) { // Iterate over each line
        console.log(decodeMessage(inputLine)); // Decrypt and print each line
    });
