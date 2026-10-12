/*
 * This file demonstrates a binary search implementation
 * and its application to count occurrences of query elements
 * within a sorted dataset read from standard input.
 * The code adheres to ES6 standards.
 */

// Function to perform a binary search on a sorted array.
var findValueInSortedArray = function(targetElement, arraySize, sortedCollection) {
  // Initialize pointers for the search range.
  // 'startIndex' points to the beginning, 'endIndex' points just past the end.
  var startIndex = 0;
  var endIndex = arraySize;

  // Continue searching as long as the range is valid.
  while (startIndex < endIndex) {
    // Calculate the middle index of the current search range.
    var middlePoint = Math.floor((startIndex + endIndex) / 2);

    // Check if the element at the middle index is our target.
    if (sortedCollection[middlePoint] === targetElement) {
      return true; // Target found.
    } else if (targetElement < sortedCollection[middlePoint]) {
      // If the target is smaller, narrow the search to the left half.
      endIndex = middlePoint;
    } else {
      // If the target is larger, narrow the search to the right half.
      startIndex = middlePoint + 1;
    }
  }
  return false; // Target not found in the array.
};

// Main execution block, wrapped in an IIFE to handle input/output.
(function(inputDataStream) {
  // Process the raw input string: trim whitespace and split into lines.
  var inputLines = (inputDataStream.trim()).split('\n');

  // Parse the main dataset (second line of input) into an array of numbers.
  var mainDataSet = inputLines[1].split(" ").map(Number);
  // Parse the query elements (fourth line of input) into an array of numbers.
  var queryElements = inputLines[3].split(" ").map(Number);

  // Initialize a counter for the number of found elements.
  var foundCount = 0;

  // Iterate through each query element.
  for (var idx = 0; idx < queryElements.length; idx++) {
    // Perform a binary search for the current query element in the main dataset.
    // The boolean result (true/false) is implicitly converted to 1/0 and added to the count.
    foundCount += findValueInSortedArray(queryElements[idx], mainDataSet.length, mainDataSet);
  }

  // Output the final count of found elements to the console.
  console.log(foundCount);

// Read input from standard input using Node.js 'fs' module.
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
