// This module provides utilities for searching and processing numerical data.
// It is designed to work with standard input/output patterns found in competitive programming scenarios.

/**
 * Searches for a specified value within a pre-sorted collection of numbers.
 * This implementation employs an iterative binary search algorithm to efficiently locate the target.
 *
 * @param {number} itemToFind The numerical value that the function should attempt to locate.
 * @param {number[]} sortedCollection The array of numbers, which must be arranged in ascending order for the search to function correctly.
 * @returns {0 | 1} Returns 1 if the `itemToFind` is present in the `sortedCollection`, otherwise returns 0.
 */
const locateElementInSortedCollection = (itemToFind, sortedCollection) => {
  // Pre-condition check: If the collection is non-existent or empty, the item cannot possibly be found.
  if (!sortedCollection || sortedCollection.length === 0) {
    return 0; // Indicate no match for an empty data set.
  }

  // Initialize the search boundaries for the binary search.
  // 'lowIndex' represents the inclusive lower bound of the current search segment.
  let lowIndex = 0;
  // 'highIndex' represents the exclusive upper bound of the current search segment (one past the last valid index).
  let highIndex = sortedCollection.length;

  // Continue the search process as long as the lower bound is less than the upper bound.
  while (lowIndex < highIndex) {
    // Calculate the middle index of the current search segment.
    // This calculation method helps prevent potential integer overflow issues with very large numbers
    // by first calculating the difference, though less critical in JavaScript.
    const middleIndex = lowIndex + Math.floor((highIndex - lowIndex) / 2);
    // Retrieve the value at the calculated middle index for comparison.
    const currentValue = sortedCollection[middleIndex];

    // Compare the `itemToFind` with the `currentValue` at the midpoint.
    if (currentValue === itemToFind) {
      // If the values match, the item has been successfully located.
      return 1; // Return 1 to signify a successful match.
    } else if (itemToFind < currentValue) {
      // If the target item is smaller than the middle value, it must reside in the left half of the segment.
      // Adjust the `highIndex` to `middleIndex` to narrow the search to the left sub-segment.
      highIndex = middleIndex;
    } else {
      // If the target item is larger than the middle value, it must reside in the right half of the segment.
      // Adjust the `lowIndex` to `middleIndex + 1` to narrow the search to the right sub-segment.
      lowIndex = middleIndex + 1;
    }
  }

  // If the loop completes without finding the item, it means the item is not present in the collection.
  return 0; // Return 0 to signify no match.
};

/**
 * A utility function designed to parse a string containing space-separated numbers
 * into an array of numerical values.
 *
 * @param {string} numberString A string input where numbers are delimited by spaces.
 * @returns {number[]} An array containing the parsed numerical values. Returns an empty array if the input string is empty or just whitespace.
 */
const parseNumbersFromString = (numberString) => {
  // Ensure robust handling of empty or whitespace-only input strings.
  if (!numberString || numberString.trim() === '') {
    return []; // Return an empty array for invalid inputs.
  }
  // Split the string by spaces and convert each resulting string segment to a number.
  return numberString.split(" ").map(Number);
};

// This immediately-invoked function expression (IIFE) serves as the main entry point
// for processing standard input and orchestrating the search operations.
((sourceStream) => {
  // Pre-process the raw input: remove leading/trailing whitespace and split into an array of lines.
  const inputLines = sourceStream.trim().split('\n');

  // Implement a basic guard clause to ensure the input contains the expected number of lines.
  // The problem typically expects at least 4 lines for array sizes and data.
  if (inputLines.length < 4) {
    console.error("Execution Aborted: Insufficient input lines detected. Expected at least 4 lines.");
    return; // Terminate execution if input format is incorrect.
  }

  // The first line often specifies the count of elements in the primary data set.
  // Although not directly used for array length in this rewritten version, it's parsed for completeness.
  const primaryDataSetCount = Number(inputLines[0]);

  // Parse the second line to obtain the main sorted array of numbers for searching.
  const sortedNumbers = parseNumbersFromString(inputLines[1]);

  // The third line typically provides the count of query elements.
  // Parsed for completeness, but the loop iterates based on the actual length of `targetValues`.
  const queryDataSetCount = Number(inputLines[2]);

  // Parse the fourth line to get the array of target values that need to be searched for.
  const targetValues = parseNumbersFromString(inputLines[3]);

  // Initialize a variable to accumulate the total count of successfully found items.
  let matchTally = 0;

  // Iterate over each target value in the `targetValues` array.
  for (let queryIdx = 0; queryIdx < targetValues.length; ++queryIdx) {
    // Extract the current target value from the array.
    const currentTarget = targetValues[queryIdx];

    // Invoke the `locateElementInSortedCollection` function to determine if the `currentTarget`
    // exists within the `sortedNumbers` array. The function returns 1 for found, 0 for not found.
    // This return value is directly added to `matchTally`.
    matchTally += locateElementInSortedCollection(currentTarget, sortedNumbers);
  }

  // Output the final accumulated count of matches to the console.
  console.log(matchTally);

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // Read input from standard input stream.