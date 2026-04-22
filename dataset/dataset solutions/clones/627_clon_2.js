const sourceData = require('fs')['readFileSync']('/dev/stdin', 'utf8'); // Acquire file contents from the standard input stream

const contentRows = sourceData['split']('\n'); // Dissect the input string into an array of individual lines
const totalElements = contentRows[0] - 0; // Extract the numerical count of elements from the initial line of input

let numericCollection = []; // Initialize an array to store the processed numeric values
let loopCounterA, loopCounterB, loopCounterC; // Declare variables to serve as loop iterators

// This block populates the primary data collection with the original numbers
// and then appends two additional copies of the entire set, effectively tripling the array's length.
for (loopCounterA = 0; loopCounterA < totalElements; loopCounterA++) {
  numericCollection[loopCounterA] = contentRows[loopCounterA + 1] - 0; // Store the parsed number
  numericCollection[loopCounterA + totalElements] = numericCollection[loopCounterA]; // Duplicate the number at an offset
  numericCollection[loopCounterA + totalElements + totalElements] = numericCollection[loopCounterA]; // Duplicate again at a further offset
}

const addValues = function (firstOperand, secondOperand) { // A concise function to perform addition of two numerical inputs
  return firstOperand + secondOperand;
};

function calculateRangeSum(targetArrayParam, beginIdx, endIdxExclusive) { // Computes the cumulative sum of values within a designated segment of an array
  let currentSum = 0; // Accumulator for the summation
  let iterationIndex; // Loop control variable for traversing the specified range
  for (iterationIndex = beginIdx; iterationIndex < endIdxExclusive; iterationIndex++) {
    currentSum += targetArrayParam[iterationIndex]; // Increment the running total with each element
  }
  return currentSum; // Deliver the final computed sum for the array segment
}

let overallMaximum = 0; // Stores the largest sum encountered across all valid segment configurations

let currentMinimumPartition = 0; // Holds the smallest sum found between two partitioned sub-segments

let temporarySegmentSum = 0, unusedArrayPlaceholder; // `temporarySegmentSum` for current segment calculations; `unusedArrayPlaceholder` is a relic from a commented-out line.

// The outer loop determines the length of the first segment
for (loopCounterA = 1; loopCounterA < totalElements - 2; loopCounterA++) {
  // The middle loop iterates through all possible starting positions for the first segment
  for (loopCounterB = 0; loopCounterB < totalElements; loopCounterB++) {
    temporarySegmentSum = calculateRangeSum(numericCollection, loopCounterB, loopCounterB + loopCounterA); // Calculate the sum of the initial segment

    // The following line was originally commented out and is retained as such to preserve structure.
    // unusedArrayPlaceholder = numericCollection['slice'](loopCounterB + loopCounterA, loopCounterB + totalElements);

    // The inner loop iterates through potential split points for the remainder of the array,
    // forming two subsequent partitions.
    for (loopCounterC = 1; loopCounterC < totalElements - loopCounterA; loopCounterC++) {
      currentMinimumPartition = Math['min']( // Determine the lesser of the sums of the two remaining partitions
        calculateRangeSum(numericCollection, loopCounterA + loopCounterB, loopCounterA + loopCounterB + loopCounterC),
        calculateRangeSum(numericCollection, loopCounterA + loopCounterB + loopCounterC, loopCounterB + totalElements)
      );

      // This debug output was commented in the original and remains so.
      // console['log'](temporarySegmentSum, currentMinimumPartition);

      // If the sum of the first segment is less than or equal to the minimum of the other two partitions,
      // it's a candidate for the overall maximum.
      if (temporarySegmentSum <= currentMinimumPartition) {
        overallMaximum = Math['max'](overallMaximum, temporarySegmentSum); // Update the maximum value if the current segment sum is greater

        // This debug output was commented in the original and remains so.
        // console['log'](numericCollection['slice'](loopCounterB, loopCounterB + loopCounterA), numericCollection['slice'](loopCounterA + loopCounterB, loopCounterA + loopCounterB + loopCounterC), numericCollection['slice'](loopCounterA + loopCounterB + loopCounterC, loopCounterB + totalElements));
      }
    }
  }
}
console['log'](overallMaximum); // Output the largest segment sum found that satisfies the partitioning condition