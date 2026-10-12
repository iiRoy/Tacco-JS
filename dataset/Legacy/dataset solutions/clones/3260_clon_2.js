'use strict'; // Enforce strict mode for cleaner code execution

/**
 * Determines if all elements within a given array are zero.
 * @param {Array<number>} inputArray - The array of numbers to check.
 * @returns {boolean} True if all elements are zero, false otherwise.
 */
function checkAllZeros(inputArray) {
  // Iterate through each element in the provided array.
  for (let currentElement of inputArray) {
    // If any element is not equal to zero, the array is not entirely zeros.
    if (currentElement !== 0) {
      return false; // Found a non-zero element, so return false immediately.
    }
  }
  // If the loop completes, all elements were zero.
  return true;
}

/**
 * Main function to process input data and calculate the minimum operations.
 * @param {string} rawData - The raw input string, typically from stdin.
 */
function processInputData(rawData) {
  // Split the input string into lines and store them temporarily.
  const temporaryLines = Array.from(rawData.split('\n'));

  // Parse the first line to get the number of elements (N).
  // Although N is read, it's not directly used in the current algorithm's loop,
  // but it defines the size of the subsequent array.
  const numberOfElements = parseInt(temporaryLines[0], 10);

  // Parse the second line, splitting by space, and converting each part to an integer.
  const heightsArray = temporaryLines[1].split(' ').map((elementString) => parseInt(elementString, 10));

  let operationCount = 0; // Initialize a counter for the operations performed.

  // Continue processing as long as the heightsArray contains non-zero elements.
  while (!checkAllZeros(heightsArray)) {
    // Find the maximum value currently present in the heights array.
    const currentMaximumValue = heightsArray.reduce((maxAccumulator, currentElement) => Math.max(maxAccumulator, currentElement));

    // Find the index of the first occurrence of the maximum value.
    const maximumValueStartIndex = heightsArray.indexOf(currentMaximumValue);

    // Initialize the end index of the contiguous block of maximum values.
    let maximumValueEndIndex = maximumValueStartIndex;

    // Extend the end index as long as subsequent elements are also equal to the maximum value.
    while (heightsArray[maximumValueEndIndex + 1] === currentMaximumValue) {
      maximumValueEndIndex++;
    }

    // Create an array of indices that correspond to the contiguous block of maximum values.
    // This range includes all indices from maximumValueStartIndex to maximumValueEndIndex.
    const maximumValueIndices = Array.from(new Array(maximumValueEndIndex - maximumValueStartIndex + 1).fill(0).map((_unused, indexOffset) => indexOffset + maximumValueStartIndex));

    // For each index in the identified range of maximum values, decrement the height by one.
    for (let currentMaxIndex of maximumValueIndices) {
      heightsArray[currentMaxIndex]--; // Reduce the height at this specific index.
    }

    // Increment the operation counter after processing one "cut" operation.
    operationCount++;
  }

  // Output the total number of operations required to make all heights zero.
  console.log(operationCount);
}

// Read input from standard input and pass it to the main processing function.
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
