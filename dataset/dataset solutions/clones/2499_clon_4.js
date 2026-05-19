"use strict";

// Helper function to remove the first occurrence of an element from an array.
// This is a different implementation strategy from the original's filter with indexOf,
// using an imperative loop to build a new array.
const exciseFirst = (sourceCollection) => (itemToExclude) => {
  let itemRemoved = false;
  const resultingCollection = [];
  for (let k = 0; k < sourceCollection.length; k++) {
    if (!itemRemoved && sourceCollection[k] === itemToExclude) {
      itemRemoved = true;
    } else {
      resultingCollection.push(sourceCollection[k]);
    }
  }
  return resultingCollection;
};

// Recursive binary search to find the index of the first element
// that is greater than or equal to a given threshold value.
// This is a substantially different implementation strategy (recursion vs. iteration).
const findBoundaryRecursive = (dataPoints, thresholdValue, lowerIndex = 0, upperIndex = dataPoints.length) => {
  // Base case: if the search range is empty or a single element, return the lower bound.
  // This corresponds to the 'ok' value in the original iterative binary search.
  if (lowerIndex === upperIndex) {
    return lowerIndex;
  }

  const middleIndex = Math.floor((lowerIndex + upperIndex) / 2);

  // If the element at the middle index meets the condition,
  // it could be our boundary, or an earlier element could be.
  // So, we search in the lower half (including middleIndex).
  if (dataPoints[middleIndex] >= thresholdValue) {
    return findBoundaryRecursive(dataPoints, thresholdValue, lowerIndex, middleIndex);
  } else {
    // If the element at the middle index does not meet the condition,
    // then the boundary must be in the upper half (excluding middleIndex).
    return findBoundaryRecursive(dataPoints, thresholdValue, middleIndex + 1, upperIndex);
  }
};

// Main processing function, preserving the original entry point name.
const main = (inputData) => {
  const lines = inputData.trim().split("\n");
  const elementCount = parseInt(lines[0], 10);
  // Use Array.prototype.map with Number constructor for parsing,
  // a different approach than a for loop with parseInt.
  const initialSegments = lines[1].split(" ").map(Number);
  initialSegments.sort((a, b) => a - b); // Sort the array in ascending order.

  let totalTriangles = 0;

  // Iterate through all unique pairs (valA, valB) from initialSegments.
  // The loop structure remains similar as it's fundamental to the problem's logic.
  for (let firstIdx = 0; firstIdx < elementCount - 1; firstIdx++) {
    for (let secondIdx = firstIdx + 1; secondIdx < elementCount; secondIdx++) {
      const valA = initialSegments[firstIdx];
      const valB = initialSegments[secondIdx];

      // Calculate the sum and absolute difference of the pair.
      const sumOfSides = valA + valB;
      const diffOfSides = Math.abs(valA - valB);

      // Construct a temporary list by removing specific values from initialSegments.
      // The chained calls to `exciseFirst` ensure that only the first occurrence
      // of each specified value is removed, mimicking the original `rmEl` behavior.
      let currentWorkingList = exciseFirst(initialSegments)(valB);
      currentWorkingList = exciseFirst(currentWorkingList)(valA);
      currentWorkingList = exciseFirst(currentWorkingList)(sumOfSides);
      currentWorkingList = exciseFirst(currentWorkingList)(diffOfSides);

      // Use the recursive binary search to find the count of elements (valC)
      // in `currentWorkingList` that satisfy the triangle inequality:
      // diffOfSides < valC < sumOfSides.
      // `findBoundaryRecursive(list, K)` returns the index of the first element >= K.
      // The difference `upper - lower` gives the count of elements `x` such that `lower_bound <= x < upper_bound`.
      // Since `sumOfSides` and `diffOfSides` are explicitly removed from `currentWorkingList`
      // if they exist, this effectively counts `x` such that `diffOfSides < x < sumOfSides`.
      const upperRangeIndex = findBoundaryRecursive(currentWorkingList, sumOfSides);
      const lowerRangeIndex = findBoundaryRecursive(currentWorkingList, diffOfSides);

      totalTriangles += (upperRangeIndex - lowerRangeIndex);
    }
  }

  // Each triangle (a, b, c) is counted 3 times (as (a,b,c), (a,c,b), (b,c,a)).
  // Divide by 3 to get the unique count.
  console.log(Math.floor(totalTriangles / 3));
};

// Standard input reading, as per the original code's external contract.
main(require('fs').readFileSync('/dev/stdin', 'utf8'));
