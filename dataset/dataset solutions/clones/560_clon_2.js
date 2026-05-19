'use strict';

// This section handles the core processing logic.
function decodeMessage(encryptedInput) {
    let decryptedOutput = ''; // Initialize an empty string for the result.

    // charBuffer will hold the ASCII value after adjustment.
    let charBuffer;

    // Iterate through each character of the provided encrypted string.
    for (let idx = 0; idx < encryptedInput.length; idx++) {
        // Get the ASCII code of the current character and subtract 3 (Caesar shift).
        charBuffer = encryptedInput.charCodeAt(idx) - 3;

        // If the character wraps around before 'A' (ASCII 65),
        // adjust it by adding 26 to bring it back into the alphabet range.
        if (charBuffer < 65) {
            charBuffer += 26;
        }
        // Convert the adjusted ASCII code back to a character and append it to the result.
        decryptedOutput += String.fromCharCode(charBuffer);
    }

    // Return the fully decrypted string.
    return decryptedOutput;
}

// This part manages input/output operations.
/*
 The commented-out block below shows an alternative way to handle input
 using the 'readline' module for interactive line-by-line processing.
 require('readline').createInterface({
     input: process.stdin,
     output: process.stdout
 }).on('line', (inputLine) => console.log(decodeMessage(inputLine.trim())));
*/

// Read the entire input from /dev/stdin, decode it as UTF-8,
// remove leading/trailing whitespace, split it into an array of lines,
// and then process each line.
require('fs')
    .readFileSync('/dev/stdin', 'utf8')
    .trim()
    .split('\n')
    .forEach(function (lineEntry) {
        // For each line, apply the decryption function and print the result to console.
        console.log(decodeMessage(lineEntry));
    });
