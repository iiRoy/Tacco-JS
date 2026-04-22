/*
 * This script handles system input, processes it, and provides an output.
 * It identifies the index of an collection member that is closest to the collection's mean value.
 */

/**
 * Retrieves raw input data from the standard input stream.
 * @returns {string} The entire content read from stdin.
 */
function acquireInputData()
{
  return require("fs").readFileSync("/dev/stdin", "utf8").trim();
}

/**
 * Outputs a given value to the standard output console.
 * @param {any} val The value to be displayed.
 */
function displayResult(val) { console.log(val); }

/**
 * Reports an error message to the standard error stream.
 * @param {string} msg The error message to log.
 */
function reportError(msg) { console.error(msg); }

// Data processing options:
// 0: No alteration, return as is
// 1: Convert to integer number
// 2: Divide string by spaces
// 3: Divide string by newlines
// 4: Divide by spaces, then convert parts to numbers
// 5: Divide by newlines, then convert parts to numbers
// 6: Split into individual characters
// 7: Split into individual characters, then convert to numbers
/**
 * Transforms a source string based on a specified option code.
 * @param {string} source The input string to process.
 * @param {number} optionCode The numeric code indicating the transformation to apply.
 * @returns {any} The processed data, which could be a string, number, or array.
 */
function transformData(source, optionCode) {
  switch (optionCode) {
    case 0:
      return source;
    case 1:
      return parseInt(source, 10);
    case 2:
      return source.split(" ");
    case 3:
      return source.split("\n");
    case 4:
      return source.split(" ").map((element) => Number(element));
    case 5:
      return source.split("\n").map((element) => Number(element));
    case 6:
      return source.split("");
    case 7:
      return source.split("").map((element) => Number(element));
  }
}

/**
 * The primary execution function of the application.
 * It orchestrates input reading, data processing, and result output.
 * @param {string} rawInput The initial raw input string.
 */
function executePrimaryLogic(rawInput)
{
  rawInput = transformData(rawInput, 3); // Split input by newlines

  var totalCount = transformData(rawInput[0], 1); // First line is N, convert to integer
  var dataCollection = transformData(rawInput[1], 4); // Second line is list, split by spaces and convert to numbers

  var calculatedMean = calculateMean(dataCollection); // Determine the average of the number collection

  var finalResult = 0; // Stores the index of the element closest to the mean
  var smallestDifference = 101; // Tracks the minimum absolute difference found so far (initialized high)

  // Iterate through the data collection to find the element closest to the mean
  for (var idx = 0; idx < totalCount; idx++) {
    // Calculate the absolute difference between the current element and the mean
    var currentDifference = Math.abs(dataCollection[idx] - calculatedMean);

    if (smallestDifference > currentDifference) {
      smallestDifference = currentDifference; // Update the smallest difference
      finalResult = idx; // Store the index of this closest element
    }
  }

  displayResult(finalResult); // Output the final determined index
}

/**
 * Computes the arithmetic mean (average) of a collection of numbers.
 * @param {number[]} dataItems An array of numbers for which to calculate the mean.
 * @returns {number} The calculated average of the numbers.
 */
function calculateMean(dataItems)
{
  var totalSum = 0; // Accumulator for the sum of elements
  for (var j = 0; j < dataItems.length; j++) {
    totalSum += dataItems[j]; // Add each item to the total sum
  }
  return totalSum / dataItems.length; // Return sum divided by count
}

// Initiate the application by calling the main logic with input from stdin.
executePrimaryLogic(acquireInputData());