// This module provides file system utilities for Node.js
const fileSystemModule = require('fs');
// Define the function responsible for reading data from a file synchronously
const readInputData = fileSystemModule.readFileSync;

// Specify the path for the standard input stream
const standardInputPath = '/dev/stdin';
// Define the character encoding to be used for reading the input
const inputEncoding = 'utf8';

// Retrieve all the raw content from the designated input source
let rawContent = readInputData(standardInputPath, inputEncoding);

// Split the entire content into an array of textual rows, using newline as a delimiter
let textRows = rawContent.split('\n');

// Create an alias for the standard output write function to print individual characters
const charOutputter = process.stdout.write;
// Create an alias for the console log function to print new lines
const lineBreaker = console.log;

// Begin the primary execution loop, which will continue indefinitely until a break condition is met
while (true) {
    // Extract the first line from the array, then divide it into components based on spaces
    let dimensionComponents = textRows.shift().split(' ');

    // Convert the first component into a numerical value representing the grid's height
    let gridHeight = +dimensionComponents[0];
    // Convert the second component into a numerical value representing the grid's width
    let gridWidth = +dimensionComponents[1];

    // Evaluate the termination condition: if the sum of both dimensions is zero
    if (gridHeight + gridWidth === 0) {
        // If the condition is met, exit the main processing loop
        break;
    }

    // Outer loop: iterates through each row index to construct the grid pattern
    for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        // Inner loop: iterates through each column index within the current row
        for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
            // Determine the character to be printed based on the parity of the sum of current indices
            if ((rowIndex + colIndex) % 2 === 0) {
                // If the sum of indices is even, output a hash symbol
                charOutputter('#');
            } else {
                // If the sum of indices is odd, output a dot symbol
                charOutputter('.');
            }
        }
        // After completing all columns for the current row, print a new line character
        lineBreaker();
    }
    // After successfully drawing an entire grid pattern, print an additional new line for visual separation
    lineBreaker();
}