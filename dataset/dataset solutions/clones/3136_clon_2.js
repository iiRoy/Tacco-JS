'use strict'; // Enforce strict mode for cleaner code and error handling

const processInput = (rawData) => {
    // Split the raw input string by newline characters, then further split each line by spaces.
    // This creates a 2D array of string arguments.
    const parsedLines = rawData.split('\n').map(lineStr => lineStr.split(' '));

    // Parse the first height and width values from the first line of input.
    const heightOne = parseInt(parsedLines[0][0], 10); // The first number on the first line
    const widthOne = parseInt(parsedLines[0][1], 10);  // The second number on the first line

    // Parse the second height and width values from the second line of input.
    const heightTwo = parseInt(parsedLines[1][0], 10); // The first number on the second line
    const widthTwo = parseInt(parsedLines[1][1], 10);  // The second number on the second line

    // Calculate the final result based on the given formula and print it to the console.
    // The formula is (heightOne * widthOne) - (widthOne * heightTwo + (heightOne - heightTwo) * widthTwo).
    console.log((heightOne * widthOne) - (widthOne * heightTwo + (heightOne - heightTwo) * widthTwo));
};

// Read the entire content of standard input synchronously using Node.js 'fs' module,
// decode it as UTF-8, and then pass it to our processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
