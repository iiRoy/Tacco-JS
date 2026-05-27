var rawData = require('fs').readFileSync('/dev/stdin', 'utf8');

// Split the raw input string into an array of lines
var dataRows = rawData.split('\n');

// The first line contains the number of elements, convert to integer
var countElements = parseInt(dataRows[0], 10);

// Initialize an array to store the elements, which will be extended for circular processing
var circularArray = [];

// Declare loop counters
var outerIdx, middleIdx, innerIdx;

// Populate the circular array
// The original array 'a' is extended to 'a[i + n]' and 'a[i + n + n]'
// This effectively creates three copies of the original sequence for circular calculations.
for (outerIdx = 0; outerIdx < countElements; outerIdx++) {
  // Convert each line (starting from the second line) to an integer
  circularArray[outerIdx] = parseInt(dataRows[outerIdx + 1], 10);
  circularArray[outerIdx + countElements] = circularArray[outerIdx];
  circularArray[outerIdx + countElements + countElements] = circularArray[outerIdx];
}

// Helper function to sum two numbers, used with Array.prototype.reduce
var addNumbers = function (accumulator, currentValue) {
  return accumulator + currentValue;
};

// Initialize variables for tracking maximum and minimum sums
var greatestValue = 0;
var smallestPartitionSum = 0;

// Temporary variables for current segment sum and remaining array segment
var currentSegmentSum = 0, remainingSegment;

// Main logic: Iterate through possible segment lengths and positions
// The outer loop determines the length of the first segment (i)
for (outerIdx = 1; outerIdx < countElements - 2; outerIdx++) {
  // The middle loop determines the starting position (j) of the first segment
  for (middleIdx = 0; middleIdx < countElements; middleIdx++) {
    // Calculate the sum of the current segment
    currentSegmentSum = circularArray.slice(middleIdx, middleIdx + outerIdx).reduce(addNumbers, 0);

    // Get the remaining part of the circular array after the current segment
    remainingSegment = circularArray.slice(middleIdx + outerIdx, middleIdx + countElements);

    // The inner loop iterates through possible split points (k) in the remaining segment
    for (innerIdx = 1; innerIdx < remainingSegment.length; innerIdx++) {
      // Calculate the minimum sum of the two partitions of the remaining segment
      smallestPartitionSum = Math.min(
        remainingSegment.slice(0, innerIdx).reduce(addNumbers, 0),
        remainingSegment.slice(innerIdx, remainingSegment.length).reduce(addNumbers, 0)
      );

      // If the current segment sum is less than or equal to the smallest partition sum,
      // update the greatest value found so far.
      if (currentSegmentSum <= smallestPartitionSum) {
        greatestValue = Math.max(greatestValue, currentSegmentSum);
      }
    }
  }
}

// Output the final greatest value
console.log(greatestValue);
