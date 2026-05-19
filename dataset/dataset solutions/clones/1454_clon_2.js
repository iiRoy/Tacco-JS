var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read raw input from standard input

var lineArray = rawData.trim().split("\n"); // Trim whitespace and split the input into an array of lines

// Get the second line (index 1), split it by spaces, and convert each part to a number
var numArray = lineArray[1].split(" ").map(Number);

// Sort the array of numbers in ascending order using a custom comparison function
numArray.sort(function(valA, valB) {
    return valA - valB; // Standard numerical ascending sort
});

// Join the sorted numbers back into a single string with spaces and print to console
console.log(numArray.join(" "));
