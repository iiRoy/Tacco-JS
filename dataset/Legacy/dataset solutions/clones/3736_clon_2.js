"use strict";
// This script processes input data to compute a specific value.
// It reads configuration and a list of numbers from standard input.
const initialDataLines = require("fs")
  .readFileSync("/dev/stdin", "utf8")
  .trim()
  .split("\n");

// Constants for parsing input lines
const CONFIG_LINE_IDX = 0;
const DATA_LINE_IDX = 1;
const CONFIG_N_POS = 0;
const CONFIG_K_POS = 1;
const FIELD_SEPARATOR = " ";

// Extract configuration parameters and the list of numbers
const configParameters = initialDataLines[CONFIG_LINE_IDX].split(FIELD_SEPARATOR);
const totalCount = configParameters[CONFIG_N_POS];
const segmentLength = configParameters[CONFIG_K_POS];
const numericValues = initialDataLines[DATA_LINE_IDX].split(FIELD_SEPARATOR).map(itemStr =>
  parseInt(itemStr)
);

/**
 * Locates the minimum element in a list of integers and returns its value and index.
 * @param {number[]} numberCollection - The array of integers to search.
 * @returns {{value: number, position: number}} An object containing the minimum value and its index.
 */
const locateMinimumElement = (numberCollection) =>
  numberCollection.reduce(
    (currentMinInfo, currentValue, currentIndex) =>
      currentValue < currentMinInfo.value ? { value: currentValue, position: currentIndex } : currentMinInfo,
    {
      value: numberCollection[0],
      position: 0,
    }
  );

/**
 * Computes a result based on the total count, segment length, and a list of numbers.
 * @param {string} totalCountStr - The string representation of N.
 * @param {string} segmentLengthStr - The string representation of K.
 * @param {number[]} dataArray - The array of numbers.
 * @returns {number} The calculated result.
 */
const computeValue = (totalCountStr, segmentLengthStr, dataArray) => {
  const minElementDetails = locateMinimumElement(dataArray);
  const minPosition = minElementDetails.position;
  
  const N_val = parseInt(totalCountStr);
  const K_val = parseInt(segmentLengthStr);

  // The core calculation involves two ceiling divisions
  return Math.ceil(minPosition / (K_val - 1)) + Math.ceil(minPosition / (N_val - K_val - 1));
};

// Execute the main computation and print the result to console.
console.log(computeValue(totalCount, segmentLength, numericValues));
