var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Obtain raw input data from standard input

// Process the raw input: trim whitespace and split into an array of lines
var lineSegments = rawData.trim().split("\n");

// Extract and parse numerical values from the first line of input
// The first line is shifted from the array and then split by space,
// with each part converted to a number.
var [targetValue, factorOne, costOne, factorTwo, costTwo] = lineSegments.shift().split(" ").map(Number);

// Initialize a variable to store the minimum calculated price.
// Start with a very large number (infinity) so any valid price will be smaller.
var lowestPrice = Infinity;

// First optimization loop:
// Iterate from 0 to 1000 (inclusive) to find the minimum cost using factorOne and costOne.
// This loop checks if the product of factorOne and the current index 'idx' meets or exceeds the targetValue.
// If it does, update 'lowestPrice' if the current cost (costOne * idx) is lower.
for (var idx = 0; idx <= 1000; idx++) {
    if (factorOne * idx >= targetValue) {
        lowestPrice = Math.min(lowestPrice, costOne * idx);
    }
}

// Second optimization loop:
// Similar to the first, but uses factorTwo and costTwo.
// This loop also iterates from 0 to 1000 (inclusive).
// It checks if the product of factorTwo and 'idx' meets or exceeds the targetValue.
// If so, it updates 'lowestPrice' if the current cost (costTwo * idx) is lower than the previously found minimum.
for (var idx = 0; idx <= 1000; idx++) {
    if (factorTwo * idx >= targetValue) {
        lowestPrice = Math.min(lowestPrice, costTwo * idx);
    }
}

// Output the final calculated minimum price to the console.
console.log(lowestPrice);
