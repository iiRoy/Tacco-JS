'use strict'; // This directive enforces strict parsing and error handling in the script.

// Define the primary function to process the incoming data.
const processInput = (rawData) => {
    // Split the raw input string by newline, take the first line, then split by space
    // to extract individual parameters.
    const parameters = rawData.split('\n')[0].split(' ');

    // Parse the first parameter as an integer, using base 10.
    const firstValue = parseInt(parameters[0], 10);
    // Parse the second parameter as an integer, using base 10.
    const secondValue = parseInt(parameters[1], 10);

    // Evaluate conditions based on the first parsed value.
    if (firstValue >= 13) {
        // If the first value is 13 or greater, output the second value directly.
        console.log(secondValue);
    } else if (firstValue >= 6) {
        // If the first value is between 6 and 12 (inclusive), output half of the second value.
        console.log(secondValue / 2);
    } else {
        // For any other case (first value less than 6), output zero.
        console.log(0);
    }
};

// Read the entire content from standard input synchronously using Node.js 'fs' module,
// decode it as UTF-8, and then pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
