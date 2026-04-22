'use strict';

// This utility function performs a modified binary search on a sorted array.
// It aims to locate the index of the very first element that is strictly
// greater than the provided 'searchTarget'. If no such element exists
// (i.e., all elements are less than or equal to the target), it returns
// the length of the array, indicating that all elements satisfy the condition.
function findFirstGreaterIndex(sortedCollection, searchTarget) {
  // Initialize the exclusive lower bound to -1 (before the first element)
  let lowerBoundary = -1;
  // Initialize the exclusive upper bound to the array's length (after the last element)
  let upperBoundary = sortedCollection.length;

  // Continue the search as long as there is at least one element
  // between our current lower and upper boundaries.
  // The loop terminates when upperBoundary is exactly one greater than lowerBoundary.
  while ((upperBoundary - lowerBoundary) > 1) {
    // Calculate the middle index. Using Math.floor ensures an integer result.
    const currentMid = Math.floor((lowerBoundary + upperBoundary) / 2);

    // Compare the element at the middle index with our target value.
    if (sortedCollection[currentMid] > searchTarget) {
      // If the middle element is greater than the target, it means
      // the first element greater than the target could be currentMid itself
      // or an element before it. So, we narrow our search to the left half,
      // including currentMid as a potential new upper boundary.
      upperBoundary = currentMid;
    } else {
      // If the middle element is less than or equal to the target,
      // it means all elements up to currentMid (inclusive) are not
      // strictly greater than the target. We need to look in the
      // right half. currentMid becomes the new lower boundary.
      lowerBoundary = currentMid;
    }
  }

  // When the loop finishes, 'upperBoundary' will hold the index of the
  // first element strictly greater than 'searchTarget', or 'sortedCollection.length'
  // if no such element exists.
  return upperBoundary;
}

// This immediately invoked function expression (IIFE) encapsulates the main program logic.
// It processes raw input data, performs calculations, and returns the final result as a string.
console.log((function(inputDataString) {
  // --- Input Validation and Parsing ---

  // Perform basic validation on the input string to ensure it's valid.
  if (typeof inputDataString !== 'string' || inputDataString.length === 0) {
    return 'Error: Input data is empty or not a string.';
  }

  // Split the raw input string into individual lines, removing any leading/trailing whitespace.
  const rawLines = inputDataString.trim().split('\n');

  // Verify that we have enough lines for N, A, B, and C.
  if (rawLines.length < 4) {
      return 'Error: Insufficient data lines provided in input.';
  }

  // Extract the size of the arrays from the first line.
  // We use Number.parseInt with a radix for explicit base-10 conversion.
  const dataSetSize = Number.parseInt(rawLines[0].split(' ')[0], 10);

  // Parse the three arrays (A, B, C) from the subsequent lines.
  // Each line is split by space, and each segment is converted to an integer.
  const primarySet = rawLines[1].split(' ').map(val => Number.parseInt(val, 10));
  const middleSet = rawLines[2].split(' ').map(val => Number.parseInt(val, 10));
  const finalSet = rawLines[3].split(' ').map(val => Number.parseInt(val, 10));

  // --- Pre-processing for Efficiency ---

  // Sort the 'middleSet' and 'finalSet' arrays in ascending order.
  // This step is critical as our `findFirstGreaterIndex` function relies on sorted data
  // for its binary search efficiency.
  middleSet.sort((val1, val2) => val1 - val2);
  finalSet.sort((val1, val2) => val1 - val2);

  // --- Core Logic for Triplet Counting ---

  let totalCombinations = 0; // This variable will accumulate the total count of valid triplets.

  // Iterate through each element in the 'primarySet' (analogous to array A).
  for (let primaryIdx = 0; primaryIdx < dataSetSize; primaryIdx++) {
    const currentPrimaryValue = primarySet[primaryIdx]; // Get the current A[i] value.

    // Use binary search to find the starting index in 'middleSet' (B)
    // where elements are strictly greater than 'currentPrimaryValue'.
    // All elements in middleSet from 'startIdxForMiddle' onwards satisfy A[i] < B[j].
    const startIdxForMiddle = findFirstGreaterIndex(middleSet, currentPrimaryValue);

    // Iterate through the potential 'middleSet' elements (B[j]) that satisfy A[i] < B[j].
    for (let middleIdx = startIdxForMiddle; middleIdx < dataSetSize; middleIdx++) {
      const currentMiddleValue = middleSet[middleIdx]; // Get the current B[j] value.

      // For the current B[j], find the starting index in 'finalSet' (C)
      // where elements are strictly greater than 'currentMiddleValue'.
      const indexForFinal = findFirstGreaterIndex(finalSet, currentMiddleValue);

      // The number of elements in 'finalSet' that are strictly greater than 'currentMiddleValue'
      // is simply the total size of 'finalSet' minus the found index.
      const countOfFinalGreater = dataSetSize - indexForFinal;

      // Add this count to our running total of valid triplets.
      // Each such count represents (A[i], B[j], C[k]) where A[i] < B[j] < C[k].
      totalCombinations = totalCombinations + countOfFinalGreater;
    }
  }

  // --- Output ---

  // Convert the final accumulated count to a string as required.
  return String(totalCombinations);

  // The IIFE is immediately invoked with the input read from standard input.
  // require('fs').readFileSync('/dev/stdin', 'utf8') reads the entire file synchronously.
}(require('fs').readFileSync('/dev/stdin', 'utf8'))));