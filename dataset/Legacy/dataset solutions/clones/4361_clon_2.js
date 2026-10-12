"use strict"; // Enforce strict mode for cleaner code.

// This function processes the input string to determine if it contains the digit '9'.
const processInput = (inputString) => {
    // Extract the first line from the provided input string.
    const firstLine = inputString.split("\n")[0];

    // Check if the first line contains the character '9'.
    // It splits the string into individual characters, filters for occurrences of '9',
    // and then evaluates if the resulting array has any elements.
    const containsNine = firstLine.split("").filter(digitChar => digitChar === '9').length > 0;

    // Output "Yes" if the digit '9' is found in the first line, otherwise output "No".
    console.log(containsNine ? "Yes" : "No");
};

// Read the entire content from standard input synchronously using Node.js's 'fs' module
// and then pass this content as a UTF-8 string to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
