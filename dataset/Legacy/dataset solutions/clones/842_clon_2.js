var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the raw input string into an array of lines, after trimming any leading/trailing whitespace.
var lineData = (rawData.trim()).split("\n");

// Extract the first line, which represents the number of entries, and convert it to a numeric type.
var numEntries = lineData.shift() - 0;

// Initialize an empty array to store the parsed data points.
var dataPoints = [];

// Loop through the remaining lines to populate the dataPoints array.
for (var idx = 0; idx < numEntries; idx++) {
    // For each line, split it by space, then convert each part to a number.
    var pairValues = (lineData.shift()).split(" ").map(Number);
    // Add the resulting numeric pair to our collection.
    dataPoints.push(pairValues);
}

// Sort the data points. The sorting criterion is based on the second element of each pair
// in descending order.
dataPoints.sort(function(itemA, itemB) {
    // Extract the second element from each item for comparison.
    var valA = itemA[1];
    var valB = itemB[1];
    // Return the difference to achieve descending order (valB - valA).
    return valB - valA;
});

// Initialize a variable to keep track of the maximum count found during processing.
var highestCount = 0;

// Iterate through a specific range of numbers, from 2 up to 100001 (inclusive).
for (var idx = 2; idx <= 100001; idx++) {
    // For each iteration of the outer loop, reset the current total.
    var currentTotal = 0;

    // Iterate over each data point in the sorted array.
    dataPoints.forEach(function(currentPoint) {
        // Check two conditions:
        // 1. The first element of the current data point must be less than or equal to 'idx'.
        // 2. The current total plus one must be less than or equal to the second element of the data point.
        if (currentPoint[0] <= idx && currentTotal + 1 <= currentPoint[1]) {
            currentTotal++; // If both conditions are met, increment the current total.
        }
    });

    // Update 'highestCount' if the 'currentTotal' for the current 'idx' is greater.
    highestCount = Math.max(highestCount, currentTotal);
}

// Output the final result, which is the 'highestCount' decremented by one.
console.log(highestCount - 1);
