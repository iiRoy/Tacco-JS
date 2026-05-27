'use strict';

(function (sourceData) {
  // This function processes the provided input string.
  // First, it cleans up the input by trimming whitespace and splitting it into lines.
  sourceData = sourceData.trim().split(/\n/);

  // The first line of input represents the total count of items.
  // The second line contains space-separated numeric values.
  const totalItems = sourceData[0] - 0; // Convert the first line to a numerical value.
  const numericValues = sourceData[1]
    .split(/\s+/) // Divide the second line into an array of strings using whitespace as a delimiter.
    .map(val => val - 0) // Transform each string element into its numerical equivalent.
    .sort((elemA, elemB) => elemA - elemB); // Arrange the numerical elements in ascending order.

  // Compute the difference between two specific elements from the sorted array.
  // For an even number of elements, these are the two middle elements.
  console.log(numericValues[totalItems / 2] - numericValues[totalItems / 2 - 1]);

})(require('fs').readFileSync('/dev/stdin', 'utf8')); // The function is immediately invoked with content read from standard input.
