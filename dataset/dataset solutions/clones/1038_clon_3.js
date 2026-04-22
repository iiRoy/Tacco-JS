/**
 * Searches for a target value within a sorted collection of numbers using the binary search algorithm.
 * This version returns the index of the element if found, or -1 if the element is not present.
 *
 * @param {number} targetValue - The numeric value to search for.
 * @param {number[]} sortedCollection - The array of numbers, which must be sorted in ascending order.
 * @returns {number} The index of the target value if found, otherwise -1.
 */
const searchForElement = (targetValue, sortedCollection) => {
  // --- Type III: Add guard clauses for invalid input ---
  if (!Array.isArray(sortedCollection) || sortedCollection.length === 0) {
    // If the collection is not an array or is empty, the target cannot be found.
    return -1;
  }

  // Initialize pointers for the search range.
  // 'startIdx' points to the beginning of the current search segment.
  let startIdx = 0;
  // 'endIdx' points to the end of the current search segment.
  // --- Type III: Change binary search loop condition and initial endIdx ---
  let endIdx = sortedCollection.length - 1;

  // Continue searching as long as the start pointer does not exceed the end pointer.
  // This ensures the search range is valid (contains at least one element).
  while (startIdx <= endIdx) {
    // Calculate the middle index of the current search segment.
    // Using this calculation prevents potential integer overflow that (startIdx + endIdx) / 2 might cause
    // for very large indices in some languages, though less critical in JavaScript.
    const middlePoint = Math.floor(startIdx + (endIdx - startIdx) / 2);

    // --- Type III: Introduce a helper variable for the element at middlePoint ---
    const currentElement = sortedCollection[middlePoint];

    // Compare the element at the middle index with the target value.
    if (currentElement === targetValue) {
      // If a match is found, return the index.
      return middlePoint;
    } else if (targetValue < currentElement) {
      // If the target is smaller, it must be in the left half.
      // Adjust the 'endIdx' to exclude the middle element and everything to its right.
      endIdx = middlePoint - 1;
    } else {
      // If the target is larger, it must be in the right half.
      // Adjust the 'startIdx' to exclude the middle element and everything to its left.
      startIdx = middlePoint + 1;
    }
  }

  // If the loop finishes, it means the target value was not found in the collection.
  return -1;
};

/**
 * Parses a string containing space-separated numbers into an array of integers.
 *
 * @param {string} lineContent - The string to parse.
 * @returns {number[]} An array of parsed integers.
 */
const parseNumericLine = (lineContent) => {
  // --- Type III: More explicit parsing with parseInt and radix ---
  return lineContent.split(" ").map(val => parseInt(val.trim(), 10));
};

/**
 * Main function to process standard input, count matches, and output the result.
 * This function encapsulates the input reading, data preparation, and counting logic.
 *
 * @param {string} inputData - The raw string data read from stdin.
 */
const processInputAndCountMatches = (inputData) => {
  // --- Type III: Add validation for input data presence ---
  if (!inputData || inputData.trim().length === 0) {
    console.error("Error: No input data provided.");
    return;
  }

  // Split the input string into individual lines, removing any leading/trailing whitespace.
  const rawInputLines = inputData.trim().split('\n');

  // --- Type III: Add validation for expected number of input lines ---
  if (rawInputLines.length < 4) {
    console.error("Error: Insufficient input lines. Expected at least 4 lines.");
    return;
  }

  // Extract and parse the main dataset (S).
  // This data is expected on the second line (index 1).
  const mainDataSet = parseNumericLine(rawInputLines[1]);

  // Extract and parse the search query numbers (T).
  // These numbers are expected on the fourth line (index 3).
  const searchQueries = parseNumericLine(rawInputLines[3]);

  // --- Type III: Add validation for successfully parsed numbers ---
  const hasInvalidNumbers = mainDataSet.some(isNaN) || searchQueries.some(isNaN);
  if (hasInvalidNumbers) {
    console.error("Error: Input lines contain non-numeric values.");
    return;
  }

  // Initialize a counter for the number of successful matches.
  let matchesFoundCount = 0;

  // --- Type III: Use for...of loop for iterating over query elements ---
  // Iterate through each number in the search query array.
  for (const currentQueryValue of searchQueries) {
    // Perform a binary search for the current query value within the main dataset.
    // The searchForElement function returns the index if found, or -1 otherwise.
    const foundIdx = searchForElement(currentQueryValue, mainDataSet);

    // If the element was found (i.e., foundIdx is not -1), increment the match counter.
    if (foundIdx !== -1) {
      matchesFoundCount++;
    }
  }

  // Output the final count of successful matches to the console.
  console.log(matchesFoundCount);
};

// --- Type III: Restructure IIFE to explicitly call the main processing function ---
// Immediately-invoked function expression (IIFE) to execute the main logic.
(function() {
  try {
    // Read the entire content of standard input synchronously, assuming UTF-8 encoding.
    // This is the entry point for receiving external data.
    const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    // Call the main processing function with the read content.
    processInputAndCountMatches(standardInputContent);
  } catch (error) {
    // --- Type III: Add basic error handling for file reading ---
    console.error("An error occurred while reading input:", error.message);
  }
})();