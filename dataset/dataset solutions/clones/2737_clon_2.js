"use strict";

// This script processes input from standard input to perform a specific bitwise operation
// and then filters the results based on a condition.

// Read the entire content from standard input as a UTF-8 encoded string.
const inputContent = require('fs').readFileSync('/dev/stdin', 'UTF-8');

// Divide the received content into an array of individual lines.
const inputLines = inputContent.split('\n');

// Parse the first line to determine the total number of elements for processing.
const countElements = parseInt(inputLines[0]);

// Process the second line: split it by spaces, then convert each segment into an integer.
const dataCollection = inputLines[1].split(' ').map(itemStr => parseInt(itemStr));

// Initiate a nested loop structure to iterate through the data collection.
// The outer loop variable, 'outerIndex', starts from 'countElements' and decrements to 1.
for (let outerIndex = countElements; outerIndex >= 1; outerIndex--) {
  // The inner loop variable, 'innerIndex', also starts from 'countElements' and decrements to 1.
  for (let innerIndex = countElements; innerIndex >= 1; innerIndex--) {
    // If 'outerIndex' is greater than or equal to 'innerIndex', skip the current iteration
    // to avoid redundant or out-of-order comparisons.
    if (outerIndex >= innerIndex) {
      continue;
    }

    // Check if 'innerIndex' is perfectly divisible by 'outerIndex' (i.e., no remainder).
    if (innerIndex % outerIndex === 0) {
      // If divisible, perform a bitwise XOR assignment operation.
      // The element at 'outerIndex - 1' in 'dataCollection' is XORed with the element
      // at 'innerIndex - 1'. (Adjusting for 0-based array indexing).
      dataCollection[outerIndex - 1] ^= dataCollection[innerIndex - 1];
    }
  }
}

// After the loops complete, filter the 'dataCollection' to create a new array
// containing only those elements whose value is strictly equal to 1.
const filteredOnes = dataCollection.filter(elementValue => elementValue === 1);

// Output the total count of elements found in the 'filteredOnes' array.
console.log(filteredOnes.length);

// If there are any elements in 'filteredOnes', print them to the console,
// joined together by a single space character.
if (filteredOnes.length > 0) {
  console.log(filteredOnes.join(' '));
}
