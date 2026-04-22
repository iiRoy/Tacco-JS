/**
 * @file This script processes a sequence of numbers from standard input,
 *       calculates their minimum, maximum, and sum, and then outputs these
 *       results.
 * @author Code Clone Generator
 * @version 1.0.1
 */

// This file handles the primary data processing logic.

/**
 * Orchestrates the processing of raw input strings into numeric data,
 * performs statistical computations, and prepares the output.
 * @param {string[]} tokenizedInputStrings - An array of strings, where the first element
 *                                         is the count of numbers to expect, followed by
 *                                         the numbers themselves.
 */
function processInputData(tokenizedInputStrings) {
  // Defensive check for input validity.
  if (!Array.isArray(tokenizedInputStrings) || tokenizedInputStrings.length === 0) {
    console.error("No input tokens provided for processing.");
    return;
  }

  // Extract the total number of elements expected.
  // Using parseFloat for robustness, and parseInt for integer count.
  const totalElementsStr = tokenizedInputStrings.shift();
  let totalElements = parseInt(totalElementsStr, 10);

  // Validate the number of elements.
  if (isNaN(totalElements) || totalElements < 0) {
    console.error(`Invalid or missing count of elements: '${totalElementsStr}'. Aborting.`);
    return;
  }

  // Initialize an array to hold the parsed numeric values.
  const numericDataSet = [];

  // Populate the numeric data set based on the expected count.
  for (let loopIndex = 0; loopIndex < totalElements; ++loopIndex) {
    const currentElementStr = tokenizedInputStrings.shift();

    // Guard against premature exhaustion of input tokens.
    if (currentElementStr === undefined) {
      console.warn(`Input stream exhausted after ${numericDataSet.length} elements, expected ${totalElements}.`);
      break; // Exit loop if no more input
    }

    // Attempt to parse the current string token into a floating-point number.
    const parsedValue = parseFloat(currentElementStr);

    // Validate if the parsed value is a valid number.
    if (isNaN(parsedValue)) {
      console.warn(`Skipping non-numeric input token: '${currentElementStr}' at position ${loopIndex + 1}.`);
      // Optionally, you could push a default value like 0, or throw an error.
    } else {
      numericDataSet.push(parsedValue);
    }
  }

  // If no valid numbers were collected, output a message and exit.
  if (numericDataSet.length === 0) {
    console.log("No valid numbers were processed. Outputting defaults: NaN NaN NaN");
    return;
  }

  // Perform statistical calculations using our custom utility library.
  const computedResults = [];
  computedResults.push(ValueOperations.findMinimum(numericDataSet));
  computedResults.push(ValueOperations.findMaximum(numericDataSet));
  computedResults.push(ValueOperations.calculateSum(numericDataSet));

  // Output the results, joined by a space, followed by a newline.
  // Using console.log is a common practice for standard output in Node.js.
  console.log(computedResults.join(' '));
}

// --- Node.js Standard Input Handling ---
// This section sets up the environment to receive input from the command line.

// Ensure the standard input stream is active.
process.stdin.resume();

// Specify the character encoding for the input.
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks from standard input.
process.stdin.on('data', function (inputBufferString) {
  // Split the input string by any whitespace characters to get individual tokens.
  // Filter out any empty strings that might result from multiple spaces.
  const parsedTokens = inputBufferString.split(/\s+/).filter(token => token.length > 0);

  // If there are tokens, pass them to our main processing function.
  if (parsedTokens.length > 0) {
    processInputData(parsedTokens);
  } else {
    console.warn("Received empty or whitespace-only input chunk. No data to process.");
  }
});

// --- Custom Utility Library for Value Operations ---
// This module provides basic statistical functions.

var ValueOperations;
(function (ValueOperations) {
  /**
   * Finds the smallest number in an array.
   * @param {number[]} dataArray - The array of numbers to search.
   * @returns {number | NaN} The minimum value, or NaN if the array is empty or contains no numbers.
   */
  function findMinimum(dataArray) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      console.warn("`findMinimum` called with an empty or invalid array. Returning NaN.");
      return NaN;
    }

    let currentMin = Number.POSITIVE_INFINITY; // Start with a very large number

    // Iterate through the array to find the minimum.
    for (let i = 0; i < dataArray.length; ++i) {
      const value = parseFloat(dataArray[i]); // Ensure element is treated as a number
      if (!isNaN(value) && value < currentMin) {
        currentMin = value;
      }
    }
    // If currentMin is still POSITIVE_INFINITY, it means no valid numbers were found.
    return currentMin === Number.POSITIVE_INFINITY ? NaN : currentMin;
  }
  ValueOperations.findMinimum = findMinimum;

  /**
   * Finds the largest number in an array.
   * @param {number[]} dataArray - The array of numbers to search.
   * @returns {number | NaN} The maximum value, or NaN if the array is empty or contains no numbers.
   */
  function findMaximum(dataArray) {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      console.warn("`findMaximum` called with an empty or invalid array. Returning NaN.");
      return NaN;
    }

    let currentMax = Number.NEGATIVE_INFINITY; // Start with a very small number

    // Iterate through the array to find the maximum.
    for (let idx = 0; idx < dataArray.length; ++idx) {
      const value = parseFloat(dataArray[idx]); // Ensure element is treated as a number
      if (!isNaN(value) && value > currentMax) {
        currentMax = value;
      }
    }
    // If currentMax is still NEGATIVE_INFINITY, it means no valid numbers were found.
    return currentMax === Number.NEGATIVE_INFINITY ? NaN : currentMax;
  }
  ValueOperations.findMaximum = findMaximum;

  /**
   * Applies a function against an accumulator and each element in the array
   * (from left to right) to reduce it to a single value.
   * @param {Array<any>} dataArray - The array to iterate over.
   * @param {function(any, any): any} operationFunction - The function to execute on each element.
   * @param {any} initialValue - The initial value of the accumulator.
   * @returns {any} The accumulated value.
   */
  function aggregateArray(dataArray, operationFunction, initialValue) {
    // Basic validation for inputs.
    if (!Array.isArray(dataArray)) {
      console.error("`aggregateArray`: Input `dataArray` must be an array.");
      return initialValue;
    }
    if (typeof operationFunction !== 'function') {
      console.error("`aggregateArray`: Input `operationFunction` must be a function.");
      return initialValue;
    }

    let accumulator = initialValue;
    // Loop through each element and apply the aggregation function.
    for (let k = 0; k < dataArray.length; ++k) {
      accumulator = operationFunction(accumulator, dataArray[k]);
    }
    return accumulator;
  }
  ValueOperations.aggregateArray = aggregateArray;

  /**
   * Calculates the sum of all numeric elements in an array.
   * Non-numeric elements are ignored.
   * @param {Array<any>} dataArray - The array containing numbers (and potentially other types).
   * @returns {number} The sum of the numeric elements, or 0 if no numbers are found.
   */
  function calculateSum(dataArray) {
    // First, filter and map the input array to ensure we only process valid numbers.
    const numericElements = dataArray
      .map(item => parseFloat(item)) // Convert each item to a float
      .filter(item => !isNaN(item)); // Remove any results that are NaN

    if (numericElements.length === 0 && dataArray.length > 0) {
      console.warn("`calculateSum`: Original array contained elements, but none were valid numbers. Returning 0.");
    }

    // Use the generic aggregation function to sum the numeric values.
    return ValueOperations.aggregateArray(numericElements, (currentTotal, val) => currentTotal + val, 0);
  }
  ValueOperations.calculateSum = calculateSum;

})((ValueOperations || (ValueOperations = {}))); // Initialize or extend the ValueOperations namespace