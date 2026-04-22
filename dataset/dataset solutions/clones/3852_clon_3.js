/**
 * Entry point for processing the input data stream.
 * This function orchestrates the parsing of raw input,
 * applies a series of transformations, and ensures
 * the process handles potential malformed data gracefully.
 *
 * @param {string} sourceContent - The raw string content read from the input source.
 */
function processInputData(sourceContent) {
  // Split the entire input string into individual lines.
  const contentLines = sourceContent.split('\n');

  // Basic validation: ensure there are at least two lines for numbers and iteration count.
  if (!contentLines || contentLines.length < 2) {
    // In a real application, this might throw an error or log to a specific error stream.
    // For this example, we'll silently exit to match the original's non-output behavior.
    return;
  }

  // The first line contains space-separated initial numeric values.
  const initialNumberSequenceStr = contentLines[0];
  // The second line specifies how many times the core transformation should be applied.
  const operationRepetitions = Number(contentLines[1]);

  // Validate the repetition count. It must be a non-negative number.
  if (isNaN(operationRepetitions) || operationRepetitions < 0) {
    // Similar to above, handle invalid repetition count.
    return;
  }

  // Convert the string of numbers into an array of actual numeric values.
  // Using `Number()` for type conversion, which is an alternative to `parseInt()`.
  let currentNumericSet = initialNumberSequenceStr.split(' ').map(strVal => Number(strVal));

  // Loop through the specified number of repetitions.
  // In each iteration, the set of numbers is transformed by amplifying its peak element.
  for (let iterationIndex = 0; iterationIndex < operationRepetitions; ++iterationIndex) {
    currentNumericSet = amplifyPeakElement(currentNumericSet);
  }

  // The original code had a commented-out console.log for the sum.
  // We maintain the behavior of not printing the final sum to stdout.
}

/**
 * Transforms a given array of numbers by finding its maximum element
 * and doubling that specific element. A new array is returned with the modification.
 *
 * @param {number[]} numericCollection - The array of numbers to be transformed.
 * @returns {number[]} A new array with the highest value doubled.
 */
function amplifyPeakElement(numericCollection) {
  // Early exit for empty or invalid input arrays.
  if (!numericCollection || numericCollection.length === 0) {
    return [];
  }

  // Create a shallow copy of the input array to avoid modifying the original.
  // Using spread syntax for array copying, an alternative to `.concat()`.
  let workingArray = [...numericCollection];

  // Manually find the highest value in the collection.
  // This replaces the use of Math.max.apply() or Math.max(...).
  let highestValue = -Infinity;
  for (const num of workingArray) {
    if (num > highestValue) {
      highestValue = num;
    }
  }

  // Manually find the index of the first occurrence of the highest value.
  // This replaces the use of .indexOf().
  let targetIndex = -1;
  for (let idx = 0; idx < workingArray.length; ++idx) {
    if (workingArray[idx] === highestValue) {
      targetIndex = idx;
      break; // Found the first occurrence, no need to check further.
    }
  }

  // If no highest value was found (shouldn't happen with non-empty array),
  // return the array as is. This acts as an additional safety guard.
  if (targetIndex === -1) {
    return workingArray;
  }

  // Calculate the new, amplified value.
  const amplifiedValue = highestValue * 2;

  // Update the element at the identified index with its new value.
  workingArray[targetIndex] = amplifiedValue;

  // Return the modified array copy.
  return workingArray;
}

// --- Execution Block ---
// This part handles reading the input from standard input and initiating the processing.

// Obtain the Node.js 'fs' (file system) module.
const fileSystemModule = require('fs');
// Define the standard input path for typical Unix-like systems.
const standardInputPath = '/dev/stdin';

let rawInputData; // Variable to hold the content read from stdin.

try {
  // Attempt to synchronously read the entire content of the standard input file.
  // Specify 'utf8' encoding to get a string.
  rawInputData = fileSystemModule.readFileSync(standardInputPath, 'utf8');
} catch (readError) {
  // If an error occurs during file reading (e.g., file not found, permissions),
  // log the error and terminate the program gracefully.
  console.error("Error encountered while reading input stream:", readError.message);
  // Exit the process to indicate failure.
  process.exit(1);
}

// Once the raw input data is successfully obtained, pass it to the main processing function.
processInputData(rawInputData);