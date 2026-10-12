let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read input from standard input

// Process the raw string data: remove leading/trailing whitespace,
// split by space, and convert each part to a number.
let numericValues = rawData.trim().split(" ").map(Number);

// Calculate the average of the first two numbers and print it to the console.
console.log((numericValues[0] + numericValues[1]) / 2);
