'use strict'; // Enforce strict mode for the entire script, promoting cleaner code.

/**
 * This function serves as the primary entry point for processing input data.
 * It takes a raw string argument, processes it according to specific rules,
 * and then outputs the results to the standard console output.
 *
 * @param {string} rawData - The complete raw string content read from the input source, typically stdin.
 */
const processInput = (rawData) => {
    // First, remove any leading or trailing whitespace from the raw input string.
    // Then, split the cleaned string into an array of individual lines based on newline characters.
    const parsedLines = rawData.trim().split('\n');

    // Access the first line from the parsed input.
    // Split this line by spaces to get an array of string representations of numbers.
    // Use the 'map' function to iterate over these string representations and convert each one into an actual number.
    // The 'currentNum' parameter is a temporary variable representing each string element during the mapping process.
    let numericValues = parsedLines[0].split(' ').map(currentNum => Number(currentNum));

    // Sort the array of numeric values in ascending order.
    // The comparison function `(valA, valB) => valA - valB` ensures numerical sorting.
    // 'valA' and 'valB' are temporary parameters representing two elements being compared by the sort method.
    numericValues = numericValues.sort((valA, valB) => valA - valB);

    // Output the final sorted array of numbers to the console.
    // This provides a visual representation of the processed data.
    console.log(numericValues);

    // Perform a conditional check: determine if the third number in the sorted array (at index 2)
    // is exactly equal to the sum of the first two numbers (at indices 0 and 1).
    // Based on the outcome of this comparison, print a specific string to the console.
    if (numericValues[2] === numericValues[0] + numericValues[1]) {
        // If the condition is true, output 'Yes'.
        console.log('Yes');
    } else {
        // If the condition is false, output 'No'.
        console.log('No');
    }
};

// This is the main execution block of the script.
// It uses Node.js's built-in 'fs' module to synchronously read the entire content
// of the standard input file ('/dev/stdin'). The content is read as a UTF-8 encoded string.
// This raw string data is then passed as an argument to the 'processInput' function to begin processing.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
