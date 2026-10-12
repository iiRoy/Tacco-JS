'use strict';

// Define the upper bound for values in the input array
let maximumValue = 109;

/**
 * Sorts an array of non-negative integers using the counting sort algorithm.
 * This implementation assumes values are within [0, maximumValue].
 * @param {number[]} inputNumbers - The array of numbers to be sorted.
 * @returns {number[]} A new array containing the sorted numbers.
 */
function performCountingSort(inputNumbers) {
  // Initialize an array to store the sorted elements
  const orderedElements = [];
  // Create a frequency map (or count array) for each number up to maximumValue
  // All counts are initially zero.
  let frequencyMap = Array.apply(null, { length: maximumValue + 1 }).map(
    (val) => 0
  );

  // Populate the frequency map by counting occurrences of each number
  for (let elementIndex in inputNumbers) {
    frequencyMap[inputNumbers[elementIndex]]++;
  }

  // Reconstruct the sorted array using the frequency map
  for (let elementIndex in frequencyMap) {
    // While there are still occurrences of the current number
    while (frequencyMap[elementIndex]) {
      // Add the number to the sorted list
      orderedElements.push(~~elementIndex);
      // Decrement its count in the frequency map
      frequencyMap[elementIndex]--;
    }
  }

  // Return the fully sorted array
  return orderedElements;
}

/**
 * Main function to process input, perform sorting, and print results based on a median-like value.
 * @param {string} rawData - The raw input string, typically from stdin.
 */
function processInputData(rawData) {
  // Parse the input string into an array of numbers
  let parsedNumbers = rawData.split(/\n|\s/).map((val) => ~~val);

  // The first number in the input is the total count of elements
  const totalCount = parsedNumbers[0];
  // Extract the actual array of numbers to be processed, excluding the count and any trailing empty values
  const originalValues = parsedNumbers.slice(1, -1);

  // Sort the extracted numbers using the counting sort algorithm
  const sortedValues = performCountingSort(originalValues);

  // Calculate the "median" value from the sorted array
  // Note: This uses integer division for the index, which might not be a true median for even counts.
  const medianValue = sortedValues[totalCount / 2];

  // Iterate through the original (unsorted) values
  for (let currentIdx = 0; currentIdx < totalCount; currentIdx++) {
    // If the current original value is less than the calculated medianValue
    if (originalValues[currentIdx] < medianValue) {
      // Print the medianValue
      console.log(medianValue);
    } else {
      // Otherwise, print the element just before the median in the sorted array
      console.log(sortedValues[totalCount / 2 - 1]);
    }
  }
}

// Read input from standard input and pass it to the main processing function
processInputData(require('fs').readFileSync('/dev/stdin', 'utf8'));
