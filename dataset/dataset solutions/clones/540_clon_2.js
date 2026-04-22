let rawData = require('node:fs').readFileSync('/dev/stdin', 'utf8');

// Process raw input data from stdin
const lineArray = rawData.trim().split("\n");

// The first line contains the total number of elements, converted to a number
let totalElements = Number(lineArray.shift());

// The second line contains the initial sequence of numbers, parsed from string
const originalSequence = lineArray.shift().split(/\s+/).map(val => parseInt(val, 10));

// Create a sorted version of the original sequence for comparison
const sortedSequence = originalSequence.slice().sort((firstItem, secondItem) => firstItem - secondItem);

// The next line indicates the number of query operations to perform
let queryCount = Number(lineArray.shift());

// Parse the remaining lines as swap operations, adjusting indices to be 0-based
const swapIndices = lineArray.map(itemLine =>
  itemLine.split(' ').map(parseInt).map(val => val - 1)
);

// Prepend a dummy operation at the start for loop indexing convenience
swapIndices.unshift([0, 0]);

// Initialize two objects to store differences between original and sorted sequences
let diffMapInitial = {}; // Stores elements from originalSequence that are out of place
let diffMapTarget = {};  // Stores elements from sortedSequence at those same positions

// Populate the difference maps by comparing original and sorted sequences
for (let idx = 0; idx < originalSequence.length; idx++) {
  // If an element in the original sequence doesn't match the sorted one at the same index
  if (originalSequence[idx] !== sortedSequence[idx]) {
    diffMapInitial[idx] = originalSequence[idx]; // Store the original value
    diffMapTarget[idx] = sortedSequence[idx];    // Store the target value
  }
}

// Convert the target difference map's values into a comma-separated string for easy comparison
const targetMapString = Object.values(diffMapTarget).join(' , ');

// A boolean flag to indicate if a match is found
let isMatchFound = false;

// Iterate through the swap operations, including the dummy one
for (let iterationIndex = 0; iterationIndex <= queryCount; iterationIndex++) {

  // Perform the swap operation on the 'diffMapInitial' object
  // Destructuring assignment is used for concise swapping
  [
    diffMapInitial[swapIndices[iterationIndex][0]],
    diffMapInitial[swapIndices[iterationIndex][1]]
  ] = [
    diffMapInitial[swapIndices[iterationIndex][1]],
    diffMapInitial[swapIndices[iterationIndex][0]]
  ];

  // After each swap, check if the current state of diffMapInitial matches the target state
  if (Object.values(diffMapInitial).join(' , ') === targetMapString) {
    isMatchFound = true; // Set flag to true if a match is found
    break;               // Exit the loop as we found the first matching iteration
  }
}

// Output the result based on whether a match was found
if (isMatchFound) {
  console.log(iterationIndex); // Print the iteration index where the match was found
} else {
  console.log(-1);             // Print -1 if no match was found after all operations
}