'use strict';

// This function processes the incoming data stream.
const processInput = (rawData) => {
    // First, split the raw data by newline characters to get individual lines.
    // Then, for each line, split it by spaces to get an array of tokens.
    const parsedLines = rawData.split('\n').map(currentLine => currentLine.split(' '));

    // Extract the first element from the first line's tokens and convert it to an integer.
    const firstValue = parseInt(parsedLines[0][0], 10);

    // Extract the second element from the first line's tokens and convert it to an integer.
    const secondValue = parseInt(parsedLines[0][1], 10);

    // Check if either of the parsed numeric values is greater than eight.
    if (firstValue > 8 || secondValue > 8) {
        // If the condition is met, print a specific error message to the console.
        console.log(':(');
    } else {
        // Otherwise, if both values are within the acceptable range, print a success message.
        console.log('Yay!');
    }
};

// Read the entire content of standard input synchronously using Node.js 'fs' module.
// The input is expected to be UTF-8 encoded.
// Then, pass this content to our processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
