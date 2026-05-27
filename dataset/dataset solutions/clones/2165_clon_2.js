"use strict"; // Enforce strict mode for the script

function processInput(inputString) {
    // Trim leading/trailing whitespace and split the input into an array of lines
    let parsedLines = inputString.trim().split("\n");

    // The first line contains two parts, separated by a space
    let firstLineParts = parsedLines[0].split(" ");

    // The second line contains two numbers, which are converted to actual numbers
    let numericValues = parsedLines[1].split(" ").map(Number);

    // The third line contains a single character or string to compare
    let targetChar = parsedLines[2];

    // Check if the target character matches the first part of the first line
    if (targetChar === firstLineParts[0]) {
        // If they match, decrement the first numeric value by one
        console.log(String(numericValues[0] - 1) + " " + String(numericValues[1]));
    } else {
        // Otherwise, decrement the second numeric value by one
        console.log(String(numericValues[0]) + " " + String(numericValues[1] - 1));
    }
}

// Read the entire content of standard input synchronously and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
