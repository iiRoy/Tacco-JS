// This script reads numbers from standard input, calculates a specific value for each, and prints the result.
// It continues processing until there are no more numbers to read.

// Import the 'fs' (file system) module to read input.
var input = require('fs') // Get the file system module.
    .readFileSync('/dev/stdin', 'utf8'); // Read the entire standard input as a UTF-8 string.


// Process the raw input string.
var minvs = input
    .trim() // Remove leading/trailing whitespace from the input string.
    .split('\n'); // Split the string into an array of lines (each line is a number string).


// Loop through the array of numbers until it's empty.
while (minvs.length !== 0) { // Check if there are still elements in the 'minvs' array.

    // Perform calculations and print the result for the current number.
    console.log( // Output the final calculated value to the console.
        Math.ceil( // Round up the result to the nearest integer.
            Math.pow( // Calculate the power of a number.
                +minvs.shift(), // Convert the first element of the array to a number and remove it from the array.
                2 // Raise the number to the power of 2 (square it).
            ) // End of Math.pow()
            + 1 // Add 1 to the squared value.
        ) // End of Math.ceil()
    ); // End of console.log()

} // End of while loop.