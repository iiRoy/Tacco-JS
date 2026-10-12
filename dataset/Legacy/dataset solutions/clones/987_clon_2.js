// This script reads input from stdin, parses it, and then performs an insertion sort algorithm.
// It prints the state of the array after each element is correctly placed.
var rawData = require('fs').readFileSync('/dev/stdin', 'utf8') .trim() .split('\n');

// The first line of input is typically the number of elements, though it's not directly used in the sorting logic here.
var count = parseInt(rawData.shift(), 10);

// The second line contains the space-separated numbers that will be sorted.
var dataElements = rawData.shift().split(' ').map(Number);

// Iterate through the array starting from the second element (index 1) to perform insertion sort.
for (var outerIndex = 0; outerIndex < dataElements.length; outerIndex += 1) {
  // Store the current element that needs to be inserted into its correct position in the sorted sub-array.
  var currentValue = dataElements[outerIndex];
  // Initialize an inner index to compare with elements in the sorted sub-array.
  var innerIndex = outerIndex - 1;

  // Move elements of dataElements[0..outerIndex-1], which are greater than currentValue,
  // to one position ahead of their current position.
  while (innerIndex >= 0 && dataElements[innerIndex] > currentValue) {
    dataElements[innerIndex + 1] = dataElements[innerIndex];
    innerIndex -= 1; // Decrement the inner index to check the next element to the left.
  }
  // Place the currentValue at its correct sorted position.
  dataElements[innerIndex + 1] = currentValue;

  // After each insertion, print the current state of the array, with elements joined by spaces.
  console.log(dataElements.join(' '));
}
