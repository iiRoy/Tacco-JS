// This script is designed to process numerical data provided via standard input.
// It reads each line as a separate entry, sorts these entries numerically in descending order,
// and then computes the difference between the largest and smallest values found.

let inputLines = require('fs')
    .readFileSync('/dev/stdin', 'utf8') // Acquire all content from the standard input stream, interpreting it as UTF-8 text.
    .split("\n"); // Divide the acquired text into an array of strings, using the newline character as a delimiter.

// Arrange the array of string-represented numbers.
// The custom comparison function ensures a descending numerical sort by coercing string elements to numbers.
inputLines.sort(function(elementA, elementB) {
    // Return a negative value if elementB should come before elementA (descending order).
    return elementB - elementA;
});

// After sorting, the highest numerical value will be at the first position (index 0).
let highestNumericValue = parseFloat(inputLines[0]);

// The lowest numerical value will be at the last position of the array.
let lowestNumericValue = parseFloat(inputLines[inputLines.length - 1]);

// Calculate the numerical span between the maximum and minimum values.
let calculatedDifference = highestNumericValue - lowestNumericValue;

// Format the resulting difference to precisely two decimal places.
let formattedOutput = calculatedDifference.toFixed(2);

// Display the final formatted result to the standard output.
console.log(formattedOutput);
