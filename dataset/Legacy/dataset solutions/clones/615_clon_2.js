let rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Acquire raw input data from standard input stream

// Process the raw input: trim whitespace and split into an array of lines
const dataLines = (rawData.trim()).split("\n");

// Extract the first line, convert it to a number, and store it.
// Note: This variable 'firstVal' is not used later in the algorithm, but its extraction is part of the original structure.
let firstVal = dataLines.shift() - 0;

// Sort the remaining data lines numerically in ascending order.
dataLines.sort(function(valX, valY) {
    return valX - valY;
});

// Initialize an array to store the computed sums of pairs.
const resultsCollection = [];

// Iterate through the first five elements of the sorted data lines.
for (let idxA = 0; idxA < 5; idxA++) {
    // For each element, iterate through subsequent elements (to form unique pairs).
    for (let idxB = idxA + 1; idxB < 5; idxB++) {
        // Calculate the sum of the current pair (dataLines[idxA] + dataLines[idxB]) and convert to number.
        // Add this sum to the results collection.
        resultsCollection.push((dataLines[idxA] + dataLines[idxB]) - 0);
        // Calculate the sum of the current pair in reverse order (dataLines[idxB] + dataLines[idxA]) and convert to number.
        // Add this sum to the results collection. This effectively adds duplicate sums for this specific problem,
        // but maintains the original algorithm's behavior.
        resultsCollection.push((dataLines[idxB] + dataLines[idxA]) - 0);
    }
}

// Sort the collection of all computed sums numerically in ascending order.
resultsCollection.sort(function(valX, valY) {
    return valX - valY;
});

// Output the element at index 2 (the third smallest sum) from the sorted results collection.
console.log(resultsCollection[2]);
