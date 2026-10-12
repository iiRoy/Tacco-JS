var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input data
var lineData = rawData.trim().split("\n");

// Extract the initial count (n)
var initialCount = Number(lineData.shift());

// Extract the original sequence of numbers
var originalSequence = lineData.shift().split(" ").map(Number);

// Create a sorted version of the original sequence
var sortedSequence = originalSequence.slice().sort((valA, valB) => valA - valB);

// Extract the number of queries (q)
var queryCount = Number(lineData.shift());

// Parse the swap operations
var swapOperations = lineData.map(itemStr => itemStr.split(" ").map(Number).map(val => val - 1));

// Add a dummy operation at the beginning for 0-based indexing convenience
swapOperations.unshift([0, 0]);

// Initialize objects to store differing elements
var currentMap = {};
var targetMap = {};

// Populate currentMap and targetMap with elements that differ between original and sorted
for (var idx = 0; idx < originalSequence.length; idx++) {
   if (originalSequence[idx] !== sortedSequence[idx]) {
      currentMap[idx] = originalSequence[idx];
      targetMap[idx] = sortedSequence[idx];
   }
}

// Create a string representation of the target map values for comparison
var targetMapString = Object.values(targetMap).join(",");

// Flag to indicate if a match is found
var foundMatch = false;

// Iterate through swap operations
for (var opIdx = 0; opIdx <= queryCount; opIdx++) {
   // Perform the swap on the currentMap
   let tempVal = currentMap[swapOperations[opIdx][0]];
   currentMap[swapOperations[opIdx][0]] = currentMap[swapOperations[opIdx][1]];
   currentMap[swapOperations[opIdx][1]] = tempVal;

   // Check if the currentMap values match the targetMap values
   if (Object.values(currentMap).join(",") === targetMapString) {
      foundMatch = true;
      break; // Exit loop if a match is found
   }
}

// Output the result
if (foundMatch) {
   console.log(opIdx);
} else {
   console.log(-1);
}
