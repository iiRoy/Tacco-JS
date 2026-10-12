let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input
let dataRows = rawData.split('\n'); // Split the input string into an array of lines

// Extract the first line, convert it to a number, and store it
let targetValue = dataRows.shift() * 1;

// Calculate the base part of the result
let finalResult = Math.floor(targetValue / 11) * 2;

// Determine the remainder when targetValue is divided by 11
let remainderVal = targetValue % 11;

// Apply conditional adjustments based on the remainder
if (remainderVal === 0) {
    // No adjustment needed for a zero remainder
} else if (remainderVal <= 6) {
    // Add 1 to the result if remainder is between 1 and 6
    finalResult += 1;
} else {
    // Add 2 to the result for remainders greater than 6 (i.e., 7 to 10)
    finalResult += 2;
}

// Output the computed final result to the console
console.log(finalResult);
