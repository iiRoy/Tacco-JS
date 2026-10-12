'use strict';

// Function to perform a Caesar cipher decryption
function decodeCipher(encodedMessage) {
    // Initialize an empty string to accumulate the decrypted characters
    let decodedString = '';

    // Variable to temporarily hold the ASCII value of a character
    let charBuffer;

    // Loop through each character of the input encoded message
    for (let idx = 0; idx < encodedMessage.length; idx++) {
        // Get the ASCII code of the current character and subtract 3 (Caesar shift)
        charBuffer = encodedMessage.charCodeAt(idx) - 3;

        // Check if the character has wrapped around before 'A' (ASCII 65)
        if (charBuffer < 65) {
            // If it wrapped, add 26 to bring it back into the uppercase alphabet range
            charBuffer += 26;
        }
        // Convert the adjusted ASCII code back to a character and append it
        decodedString += String.fromCharCode(charBuffer);
    }

    // Return the complete decoded string
    return decodedString;
}

// Set up the readline interface for standard input/output operations
const inputReader = require('readline').createInterface({
    input: process.stdin,  // Use standard input stream
    output: process.stdout // Use standard output stream
});

// Event listener for when a line of input is received
inputReader.on('line', (inputLine) => {
    // Trim any leading/trailing whitespace from the input line
    const trimmedInput = inputLine.trim();
    // Decode the trimmed input using the Caesar decryption function
    const finalOutput = decodeCipher(trimmedInput);
    // Print the decoded result to the console
    console.log(finalOutput);
    // Close the readline interface after processing the first line
    inputReader.close();
});
