var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Read raw input from standard input
// Process the raw input: trim whitespace and split into an array of lines
var dataLines = (rawData.trim()).split("\n");

// Extract the first element, convert it to a number, and store it.
// Note: This variable 'firstVal' is not used later in the script's logic.
var firstVal = dataLines.shift() - 0;

// Initialize an empty array to store the combined numeric results
var resultCombinations = [];

// Outer loop iterates from index 0 up to (but not including) 5
for (var idxA = 0; idxA < 5; idxA++) {
    // Inner loop iterates from 'idxA + 1' up to (but not including) 5
    for (var idxB = idxA + 1; idxB < 5; idxB++) {
        // Concatenate two string elements from 'dataLines', then convert the result to a number
        // and add it to the 'resultCombinations' array.
        resultCombinations.push((dataLines[idxA] + dataLines[idxB]) - 0);
        // Repeat the concatenation and conversion with the elements in reverse order.
        resultCombinations.push((dataLines[idxB] + dataLines[idxA]) - 0);
    }
}

// Sort the 'resultCombinations' array numerically in ascending order
resultCombinations.sort(function(valA, valB) {
    return valA - valB;
});

// Print the element at index 2 (the third smallest value) of the sorted array to the console
console.log(resultCombinations[2]);
