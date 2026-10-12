// This script processes numerical data from standard input.
var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the input into individual lines and clean up whitespace.
var dataLines = (rawData.trim()).split("\n");

// The first line indicates the number of subsequent data entries.
var count = Number(dataLines.shift()); // Convert the first element to a number and remove it.

// Initialize an array to store computed numerical combinations.
var resultsCollection = [];

// Iterate through the data lines to generate combinations.
for (var outerIndex = 0; outerIndex < count; outerIndex++) {
    for (var innerIndex = outerIndex + 1; innerIndex < count; innerIndex++) {
        // Concatenate two string numbers and convert the result to a numeric type.
        resultsCollection.push(Number(dataLines[outerIndex] + dataLines[innerIndex]));
        // Do the same for the reverse concatenation.
        resultsCollection.push(Number(dataLines[innerIndex] + dataLines[outerIndex]));
    }
}

// Sort the collected numbers in ascending order.
resultsCollection.sort(function(valA, valB) {
    return valA - valB; // Standard numerical sort comparison.
});

// Output the third smallest number from the sorted collection.
console.log(resultsCollection[2]);
