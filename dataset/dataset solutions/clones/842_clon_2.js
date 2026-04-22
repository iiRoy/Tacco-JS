// This script processes a list of numerical pairs from standard input.
// It determines a specific maximum count based on certain conditions.

var rawData = require('fs').readFileSync('/dev/stdin', 'utf8'); // Fetch raw input data from a specific file path.

// Process the acquired data: trim whitespace and split into individual lines.
var lineFragments = (rawData.trim()).split("\n");

// Extract the initial number, which represents the total count of subsequent data entries.
var itemCount = lineFragments.shift() - 0;

// Initialize an array to store structured data elements.
var dataItems = [];


// Loop through each expected data entry.
for (var idx = 0; idx < itemCount; idx++) {
    // For each line, split by space and convert the parts to numbers.
    var pairValues = (lineFragments.shift()).split(" ").map(Number);
    // Add the processed numeric pair to our collection of data items.
    dataItems.push(pairValues);

}

// Sort the collected data items. The sorting criterion is the second element of each pair,
// in descending order.
dataItems.sort(function(firstElement, secondElement) {
    // Access the relevant part for comparison.
    var comparisonA = firstElement[1];
    var comparisonB = secondElement[1];
    // Return the difference for descending sort.
    return comparisonB - comparisonA;
});

// Initialize a variable to keep track of the highest count found.
var overallMaximum = 0;

// Begin the main iterative process, ranging from a starting point up to a large threshold.
for (
  var idx = 2; // Start index from 2
  idx <= 100001; // Continue up to this upper bound
  idx++ // Increment index in each step
) {
    // For each iteration of the outer loop, reset a temporary counter.
    var currentCount = 0;

    // Iterate over each item in the sorted data collection.
    dataItems.forEach(function(currentItem) {
        // Check two conditions:
        // 1. The first value of the current item must be less than or equal to the outer loop's index.
        // 2. Incrementing the current count must not exceed the second value of the current item.
        if (currentItem[0] <= idx && currentCount + 1 <= currentItem[1]) {
            currentCount++; // Increment the temporary counter if both conditions are met.
        }
    });

    // Update the overall maximum if the current temporary count is higher.
    overallMaximum = Math.max(overallMaximum, currentCount);
}

// Output the final computed result, adjusted by subtracting one.
console.log(overallMaximum - 1);