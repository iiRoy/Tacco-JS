process.stdin.resume();
process.stdin.setEncoding('utf8');

// Array to store all input lines
let inputData = [];

// Create an interface for reading input
const inputHandler = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

// Event listener for each line of input
inputHandler.on('line', (currentLine) => {
    inputData.push(currentLine); // Store the received line
});

// Event listener for when the input stream closes
inputHandler.on('close', () => {
    "use strict"; // Enforce strict mode

    // Extract the first two lines as strings
    const firstString = inputData[0];
    const secondString = inputData[1];

    // Initialize a counter for matching characters
    let matchCount = 0;

    // Loop through the first three characters of both strings
    for (let idx = 0; idx < 3; idx++) {
        // If characters at the current index match, increment the counter
        if (firstString[idx] === secondString[idx]) {
            matchCount++;
        }
    }

    // Output the final count of matching characters
    console.log(matchCount);
});
