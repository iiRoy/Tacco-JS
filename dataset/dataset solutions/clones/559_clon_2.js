'use strict';

// Function to decrypt a Caesar cipher encoded string
function decodeCipher(encodedMessage) {
    // This variable will store the resulting decoded string
    let decodedString = '';

    // charValue will hold the ASCII value of each character after decryption
    let charValue;

    // Iterate through each character of the input encoded message
    for (let idx = 0; idx < encodedMessage.length; idx++) {
        // Get the ASCII code of the current character and shift it back by 3 positions
        charValue = encodedMessage.charCodeAt(idx) - 3;

        // If the character wraps around before 'A' (ASCII 65),
        // adjust it by adding 26 to bring it back into the alphabet range.
        if (charValue < 65) {
            charValue += 26;
        }
        // Append the decrypted character to the result string
        decodedString += String.fromCharCode(charValue);
    }

    // Return the fully decoded string
    return decodedString;
}

// Input/Output handling using Node.js readline module
require('readline').createInterface({
    input: process.stdin,  // Read from standard input
    output: process.stdout // Write to standard output
}).on('line', function (inputLine) {
    // For each line received from input,
    // trim any leading/trailing whitespace,
    // decode it using our function, and print the result.
    console.log(decodeCipher(inputLine.trim()));
});
