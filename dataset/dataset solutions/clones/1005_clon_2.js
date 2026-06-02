var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Process the raw input string
var lineData = rawData.trim().split("\n");

// Extract the numbers from the second line of input
var numArr = lineData[1].split(' ').map((n) => Number(n));

// Initialize a counter for the number of swaps performed
var swapCounter = 0;

// Outer loop for selection sort: iterate through the array
for (var outerIdx = 0; outerIdx < numArr.length; outerIdx++) {
  // Assume the current element is the minimum
  var minValIdx = outerIdx;

  // Inner loop to find the actual minimum element in the unsorted part
  for (var innerIdx = outerIdx; innerIdx < numArr.length; innerIdx++) {
    // Update minValIdx if a smaller element is found
    minValIdx = numArr[innerIdx] < numArr[minValIdx] ? innerIdx : minValIdx;
  }

  // If the minimum element is not at the current position, swap them
  if (minValIdx !== outerIdx) {
    var tempVal = numArr[minValIdx]; // Store the minimum value temporarily
    numArr[minValIdx] = numArr[outerIdx]; // Move the current element to the minimum's position
    numArr[outerIdx] = tempVal; // Place the minimum value at the current position
    swapCounter++; // Increment the swap counter
  }
}

// Output the sorted array elements joined by a space
console.log(numArr.join(' '));

// Output the total number of swaps performed
console.log(swapCounter);
