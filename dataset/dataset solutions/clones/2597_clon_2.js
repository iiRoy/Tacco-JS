/**
 * This module provides a utility function for analyzing numerical sequences
 * and a script to process input data from standard input.
 */

/**
 * Computes the lengths of consecutive non-increasing subsequences within a given array.
 * A non-increasing subsequence continues as long as each element is greater than or equal to the next.
 *
 * @param {Array<number>} sourceNumericalArray The input array of numbers to analyze.
 * @returns {Array<number>} An array containing the lengths of all identified non-increasing streaks.
 */
const determineStreakLengths = (
  sourceNumericalArray // The primary data set for analysis.
) => {
  // A dynamic list to accumulate the lengths of completed non-increasing sequences.
  const accumulatedStreaks = [];

  // A counter for the elements in the currently observed non-increasing sequence.
  let currentDecreasingCount = 0;

  // Iterate through the array, including an implicit "end" element check for the last streak.
  for (
    let dataIndex = 0; // Initialize loop counter.
    dataIndex <= sourceNumericalArray.length; // Loop until after the last actual element.
    dataIndex++ // Increment index for next iteration.
  ) {
    // Check if the current element is greater than or equal to the subsequent element.
    // This condition signifies the continuation of a non-increasing pattern.
    if (
      sourceNumericalArray[dataIndex] >=
      sourceNumericalArray[dataIndex + 1]
    ) {
      currentDecreasingCount++; // Extend the current streak count.
    } else {
      // The non-increasing sequence has been broken, or we've reached the end of the array.
      accumulatedStreaks.push(currentDecreasingCount); // Record the length of the finished streak.
      currentDecreasingCount = 0; // Reset the counter to begin tracking a new potential streak.
    }
  }

  return accumulatedStreaks; // Deliver the final collection of streak lengths.
};


// --- Main script execution block for processing standard input ---

/**
 * A wrapper function to abstract the module loading process.
 * @param {string} moduleIdentifier The name or path of the module to load.
 * @returns {any} The loaded module.
 */
const retrieveRequiredModule = (moduleIdentifier) => require(moduleIdentifier);

// Access the file system module using our wrapper.
const systemFileHandler = retrieveRequiredModule('fs');

/**
 * A helper function for converting string values to numbers.
 * @param {string} textualNumber The string representation of a number.
 * @returns {number} The numerical value.
 */
const parseNumericString = (textualNumber) => {
  return Number(textualNumber); // Utilizes the native JavaScript Number constructor.
};

// Read all data synchronously from the standard input device, encoded in UTF-8.
const rawInputData = systemFileHandler.readFileSync('/dev/stdin', 'utf8');

// Split the entire input content into an array of individual text lines.
const inputLineSegments = rawInputData.split('\n');

// Extract the second line (index 1), split it by spaces, and convert each part to a number.
// This forms the primary array of height values for processing.
const heightValuesArray = inputLineSegments[1]
  .split(" ")
  .map(individualStringValue => parseNumericString(individualStringValue));

// Invoke our core analysis function with the prepared height data.
// This yields an array of all computed non-increasing streak lengths.
const allComputedStreakMeasurements = determineStreakLengths(heightValuesArray);

/**
 * An object encapsulating mathematical utility functions.
 */
const numericalOperations = {
  /**
   * A method to find the largest value among a set of numbers.
   * @param {...number} elements A variable number of numerical arguments.
   * @returns {number} The maximum value.
   */
  findMaximumElement: (...elements) => Math.max(...elements)
};

/**
 * An object for handling output messages to the console.
 */
const consoleOutputInterface = {
  /**
   * A method to display messages to the standard output.
   * @param {...any} messages A variable number of arguments to print.
   */
  outputMessage: (...messages) => console.log(...messages)
};

// Find the absolute maximum streak length from the results and print it.
consoleOutputInterface.outputMessage(
  numericalOperations.findMaximumElement(...allComputedStreakMeasurements)
);