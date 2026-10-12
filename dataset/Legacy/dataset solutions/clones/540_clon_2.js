var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input string into an array of lines.
var lineSegments = rawData.trim().split("\n");

// Extract the first number, representing the total count of elements.
var totalCount = lineSegments.shift() - 0;

// Parse the second line into an array of numbers, which is our initial sequence.
var initialSequence = lineSegments.shift().split(" ").map(Number);

// Create a sorted version of the initial sequence for comparison purposes.
var sortedSequence = initialSequence.slice().sort((valA, valB) => valA - valB);

// Extract the number of query operations from the next line.
var queryCount = lineSegments.shift() - 0;

// Parse the remaining lines into an array of swap operations, adjusting indices to be 0-based.
var swapOperations = lineSegments.map(itemStr => itemStr.split(" ").map(Number).map(idxVal => idxVal - 1));

// Prepend a dummy operation at the beginning of the swap operations array.
swapOperations.unshift([0, 0]);

// Initialize two objects to store elements that are out of place in the initial sequence
// and their corresponding sorted values.
var currentMap = {};
var targetMap = {};

// Populate the maps by comparing the initial and sorted sequences.
for (var idx = 0; idx < initialSequence.length; idx++) {
   if (initialSequence[idx] !== sortedSequence[idx]) {
      currentMap[idx] = initialSequence[idx];
      targetMap[idx] = sortedSequence[idx];
   }
}

// Create a comma-separated string of the target map's values for efficient comparison.
var targetMapValuesStr = Object.values(targetMap).join(",");

// A boolean flag to track if a matching state is found.
var foundMatch = false;

// Iterate through each swap operation, applying it and checking if the current state matches the target.
for (var opIndex = 0; opIndex <= queryCount; opIndex++) {
   // Perform the swap operation on the current map.
   [currentMap[swapOperations[opIndex][0]], currentMap[swapOperations[opIndex][1]]] =
      [currentMap[swapOperations[opIndex][1]], currentMap[swapOperations[opIndex][0]]];

   // Check if the current map's values, when joined, match the target string.
   if (Object.values(currentMap).join(",") === targetMapValuesStr) {
      foundMatch = true;
      break; // Exit the loop as soon as a match is found.
   }
}

// Output the index of the operation that resulted in a match, or -1 if no match was found.
if (foundMatch) {
   console.log(opIndex);
} else {
   console.log(-1);
}
