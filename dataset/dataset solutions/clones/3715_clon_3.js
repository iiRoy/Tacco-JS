function processInputData(rawInputString) {
  // --- Input Validation and Parsing ---
  // Ensure the input is a valid string and not empty.
  if (typeof rawInputString !== 'string' || rawInputString.trim() === '') {
    console.error("Error: Input data is invalid or empty. Please provide a non-empty string.");
    return -1; // Indicate an error condition
  }

  // Split the raw input string into an array of lines.
  const inputLines = rawInputString.split("\n");

  // Parse the total count of elements from the first line.
  // Using parseInt with radix 10 for robust number conversion.
  const totalElementsCount = parseInt(inputLines[0], 10);

  // Validate the total number of elements.
  // The problem requires at least 4 elements for four distinct partitions.
  if (isNaN(totalElementsCount) || totalElementsCount < 4) {
    console.error("Error: The number of elements must be a valid integer and at least 4.");
    return -1;
  }

  // Parse the array of initial numerical values from the second line.
  const initialNumbers = inputLines[1].split(" ").map(val => parseInt(val, 10));

  // Validate the parsed numbers array.
  // Check for NaN values and ensure the array length matches the declared count.
  if (initialNumbers.some(isNaN) || initialNumbers.length !== totalElementsCount) {
    console.error("Error: The array of numbers is malformed or its length does not match the declared count.");
    return -1;
  }

  // --- Prefix Sum Array Calculation ---
  // Create an array to store prefix sums.
  // `prefixSumsArray[k]` will hold the sum of `initialNumbers[0]` through `initialNumbers[k]`.
  const prefixSumsArray = new Array(totalElementsCount);
  prefixSumsArray[0] = initialNumbers[0]; // The first prefix sum is just the first element.

  // Populate the rest of the prefix sums.
  for (let k = 1; k < totalElementsCount; k++) {
    prefixSumsArray[k] = prefixSumsArray[k - 1] + initialNumbers[k];
  }

  // --- Helper Function: Binary Search for Lower Bound ---
  // This function finds the index of the first element in a sorted array segment
  // that is greater than or equal to the target value.
  // `dataArray`: The array to search within (expected to be sorted).
  // `searchStartIdx`: The inclusive starting index for the search.
  // `searchEndIdx`: The inclusive ending index for the search.
  // `targetValue`: The value to search for.
  const findLowerBoundIndex = (dataArray, searchStartIdx, searchEndIdx, targetValue) => {
    let lowPointer = searchStartIdx;
    let highPointer = searchEndIdx;

    // Binary search loop: continues as long as there are at least two elements
    // between `lowPointer` and `highPointer`.
    while (lowPointer + 1 < highPointer) {
      // Calculate the middle index using `Math.floor` for integer division.
      const midPointer = Math.floor((lowPointer + highPointer) / 2);
      if (dataArray[midPointer] < targetValue) {
        lowPointer = midPointer; // If mid value is too small, search in the upper half.
      } else {
        highPointer = midPointer; // Otherwise, search in the lower half (including mid).
      }
    }
    // After the loop, `lowPointer` and `highPointer` are adjacent.
    // Determine which of them is the first element greater than or equal to `targetValue`.
    return dataArray[lowPointer] < targetValue ? highPointer : lowPointer;
  };

  // --- Helper Function: Calculate Difference Between Max and Min ---
  // Computes `max(values) - min(values)` for a given array of numbers.
  const calculateMinMaxDifference = (values) => {
    // Add a guard clause for empty or invalid input arrays.
    if (!Array.isArray(values) || values.length === 0) {
      return Number.MAX_SAFE_INTEGER; // Return a very large value to not affect minDifferenceResult
    }
    return Math.max(...values) - Math.min(...values);
  };

  // --- Main Logic: Finding Optimal Partitions ---
  // Initialize the minimum difference found to the largest possible safe integer value.
  let minDifferenceResult = Number.MAX_SAFE_INTEGER;

  // The main loop iterates through possible split points for the second cut.
  // `splitPointIndex` represents the index *after* which the second segment ends.
  // For 4 segments, `splitPointIndex` must allow for at least one element in each of the first two segments
  // and at least one element in each of the last two segments.
  // Thus, `splitPointIndex` ranges from 2 (meaning initialNumbers[0], initialNumbers[1] are first two segments)
  // up to `totalElementsCount - 2` (meaning initialNumbers[totalElementsCount-1] is part of the last segment).
  for (let splitPointIndex = 2; splitPointIndex < totalElementsCount - 1; splitPointIndex++) {
    // Calculate the sum of elements up to the current `splitPointIndex` (exclusive).
    // This is `sum(initialNumbers[0] ... initialNumbers[splitPointIndex - 1])`.
    const sumOfFirstTwoSegments = prefixSumsArray[splitPointIndex - 1];

    // Calculate the sum of elements from `splitPointIndex` to the end of the array.
    // This is `sum(initialNumbers[splitPointIndex] ... initialNumbers[totalElementsCount - 1])`.
    const sumOfLastTwoSegments = prefixSumsArray[totalElementsCount - 1] - prefixSumsArray[splitPointIndex - 1];

    // Determine target sums for balancing the first two segments and the last two segments.
    // We aim to make the first segment sum approximately half of `sumOfFirstTwoSegments`.
    const targetSumForFirstSegment = Math.floor(sumOfFirstTwoSegments / 2);
    // We aim to make the third segment sum approximately half of `sumOfLastTwoSegments`.
    const targetSumForThirdSegment = Math.floor(sumOfLastTwoSegments / 2);

    // Find the `leftSplitPosition` (end index + 1 for the first segment).
    // This searches for a `prefixSumsArray` value close to `targetSumForFirstSegment`
    // within the range `[1, splitPointIndex - 1]`.
    const leftSplitPosition = findLowerBoundIndex(prefixSumsArray, 1, splitPointIndex - 1, targetSumForFirstSegment);

    // Find the `rightSplitPosition` (end index + 1 for the third segment).
    // This searches for a `prefixSumsArray` value close to `(sumOfFirstTwoSegments + targetSumForThirdSegment)`
    // within the range `[splitPointIndex + 1, totalElementsCount - 1]`.
    // The target value `prefixSumsArray[splitPointIndex - 1] + targetSumForThirdSegment`
    // effectively means `sum(P1+P2) + targetSumForThirdSegment` which is `P1+P2+P3_target`.
    const rightSplitPosition = findLowerBoundIndex(
      prefixSumsArray,
      splitPointIndex + 1,
      totalElementsCount - 1,
      prefixSumsArray[splitPointIndex - 1] + targetSumForThirdSegment
    );

    // --- Calculate Segment Sums for the Initial Configuration ---
    // The four segments are:
    // P1: initialNumbers[0] ... initialNumbers[leftSplitPosition - 1]
    // P2: initialNumbers[leftSplitPosition] ... initialNumbers[splitPointIndex - 1]
    // P3: initialNumbers[splitPointIndex] ... initialNumbers[rightSplitPosition - 1]
    // P4: initialNumbers[rightSplitPosition] ... initialNumbers[totalElementsCount - 1]

    const segment1Sum_config1 = prefixSumsArray[leftSplitPosition - 1];
    const segment2Sum_config1 = prefixSumsArray[splitPointIndex - 1] - prefixSumsArray[leftSplitPosition - 1];
    const segment3Sum_config1 = prefixSumsArray[rightSplitPosition - 1] - prefixSumsArray[splitPointIndex - 1];
    const segment4Sum_config1 = prefixSumsArray[totalElementsCount - 1] - prefixSumsArray[rightSplitPosition - 1];

    const currentPartitionSums_config1 = [
      segment1Sum_config1,
      segment2Sum_config1,
      segment3Sum_config1,
      segment4Sum_config1
    ];
    minDifferenceResult = Math.min(minDifferenceResult, calculateMinMaxDifference(currentPartitionSums_config1));

    // --- Explore Alternative Split Points (Type III: Update/Add logic) ---
    // It's possible that shifting 'leftSplitPosition' or 'rightSplitPosition' by one
    // might yield a better min/max difference, as binary search finds the first best,
    // but adjacent positions might be slightly better.

    // Try shifting 'leftSplitPosition' one step to the right if possible.
    // This check ensures there's at least one element to move from P2 to P1.
    if (splitPointIndex - leftSplitPosition > 1) {
      const segment1Sum_lShifted = prefixSumsArray[leftSplitPosition];
      const segment2Sum_lShifted = prefixSumsArray[splitPointIndex - 1] - prefixSumsArray[leftSplitPosition];

      const currentPartitionSums_lShifted = [
        segment1Sum_lShifted,
        segment2Sum_lShifted,
        segment3Sum_config1, // P3 and P4 remain the same as config 1
        segment4Sum_config1
      ];
      minDifferenceResult = Math.min(minDifferenceResult, calculateMinMaxDifference(currentPartitionSums_lShifted));

      // If 'leftSplitPosition' was shifted, also try shifting 'rightSplitPosition' concurrently.
      // This check ensures there's at least one element to move from P4 to P3.
      if (totalElementsCount - rightSplitPosition > 1) {
        const segment3Sum_lrShifted = prefixSumsArray[rightSplitPosition] - prefixSumsArray[splitPointIndex - 1];
        const segment4Sum_lrShifted = prefixSumsArray[totalElementsCount - 1] - prefixSumsArray[rightSplitPosition];

        const currentPartitionSums_lrShifted = [
          segment1Sum_lShifted,
          segment2Sum_lShifted,
          segment3Sum_lrShifted,
          segment4Sum_lrShifted
        ];
        minDifferenceResult = Math.min(minDifferenceResult, calculateMinMaxDifference(currentPartitionSums_lrShifted));
      }
    }

    // Try shifting 'rightSplitPosition' one step to the right independently.
    // This check ensures there's at least one element to move from P4 to P3.
    if (totalElementsCount - rightSplitPosition > 1) {
      const segment3Sum_rShifted = prefixSumsArray[rightSplitPosition] - prefixSumsArray[splitPointIndex - 1];
      const segment4Sum_rShifted = prefixSumsArray[totalElementsCount - 1] - prefixSumsArray[rightSplitPosition];

      const currentPartitionSums_rShifted = [
        segment1Sum_config1, // P1 and P2 remain the same as config 1
        segment2Sum_config1,
        segment3Sum_rShifted,
        segment4Sum_rShifted
      ];
      minDifferenceResult = Math.min(minDifferenceResult, calculateMinMaxDifference(currentPartitionSums_rShifted));
    }
  }

  // Return the overall minimum difference found across all configurations.
  return minDifferenceResult;
}

// --- Main Execution Block ---
// This immediately invoked function expression (IIFE) handles reading input
// and printing the final result, isolating the execution environment.
(() => {
  try {
    // Read the entire standard input as a UTF-8 string.
    const inputData = require("fs").readFileSync("/dev/stdin", "utf8");

    // Call the main processing function with the input data.
    const finalResult = processInputData(inputData);

    // Output the result if processing was successful.
    if (finalResult !== -1) {
      console.log(finalResult);
    }
  } catch (error) {
    // Catch and log any errors that occur during file reading or processing.
    console.error("An unexpected error occurred during input/output operations or program execution:", error.message);
    // Optionally, exit the process with an error code.
    // process.exit(1);
  }
})();