/*
 * This module processes a given string input to find a specific minimum count.
 * It's designed to analyze segments of a sequence based on character occurrences.
 */
const processInput = function (rawData) {
  // Split the raw input string into an array of lines using the newline character as a delimiter.
  let processedLines = rawData.split('\n');

  // Extract the first line from the array, which represents the total number of elements.
  const numElements = processedLines.shift();

  // Join the remaining lines in the array back into a single continuous string.
  const combinedString = processedLines.join('');

  let leftSegment; // This variable will hold the substring to the left of the current split point.
  let leftSegmentFiltered; // This variable will store the left segment after specific characters are removed.
  let rightSegment; // This variable will hold the substring to the right of the current split point.
  let rightSegmentFiltered; // This variable will store the right segment after specific characters are removed.
  let currentMismatchCount; // This variable will temporarily store the calculated count for each iteration.

  // Initialize the minimum count with a large arbitrary value.
  // This ensures that the first valid count found will be smaller and thus become the initial minimum.
  let minimumMismatches = 300000; // Represents 3 * 100000, a sufficiently large upper bound.

  // Iterate through the combined string, considering each possible split point.
  // The loop runs from index 0 up to (but not including) the total number of elements.
  for (let idx = 0; idx < numElements; idx++) {
    // Extract the substring from the beginning of the combined string up to the current index.
    leftSegment = combinedString.slice(0, idx);
    // Extract the substring from the character immediately after the current index to the end.
    rightSegment = combinedString.slice(idx + 1, numElements);

    // Create a filtered version of the left segment by removing all occurrences of the character 'W'.
    leftSegmentFiltered = leftSegment.split('W').join('');
    // Create a filtered version of the right segment by removing all occurrences of the character 'E'.
    rightSegmentFiltered = rightSegment.split('E').join('');

    // Calculate the current mismatch count:
    // It's the sum of 'W's in the left segment and 'E's in the right segment.
    // This is determined by the difference in length before and after filtering.
    currentMismatchCount = (leftSegment.length - leftSegmentFiltered.length) + (rightSegment.length - rightSegmentFiltered.length);

    // Check if the current calculated count is zero (or negative zero, which is numerically equivalent).
    // If it is, this is the absolute minimum possible, so we can stop further iterations.
    if (currentMismatchCount === 0 || currentMismatchCount === -0) {
      minimumMismatches = 0; // Set the minimum to zero.
      break; // Exit the loop immediately.
    }
    // If the current count is not zero, check if it's smaller than the previously recorded minimum.
    else if (currentMismatchCount < minimumMismatches) {
      minimumMismatches = currentMismatchCount; // Update the minimum if a smaller count is found.
    }
  }

  // Output the final determined minimum mismatch count to the standard console.
  console.log(minimumMismatches);

  // Return a numerical status code, typically 0 for successful execution.
  return 0;
};

// This line executes the main processing function.
// It reads the input from standard input, decodes it as UTF-8, and removes any leading/trailing whitespace.
processInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
