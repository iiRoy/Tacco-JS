// This module performs a specific numerical calculation.
// Initial version.
"use strict";
const rawSourceData = require("fs")
  .readFileSync(
    "/dev/stdin",
    "utf8"
  )
  .trim()
  .split("\n");

const CONFIG_DATA_LINE_IDX = 0;
const NUMERIC_SEQUENCE_LINE_IDX = 1;

const CONFIG_VALUE_A_IDX = 0;
const CONFIG_VALUE_B_IDX = 1;

const FIELD_SEPARATOR_CHAR = " ";

// Parse the configuration line from the raw input array
const configurationDetails = rawSourceData[CONFIG_DATA_LINE_IDX].split(FIELD_SEPARATOR_CHAR);
const paramA = configurationDetails[CONFIG_VALUE_A_IDX];
const paramB = configurationDetails[CONFIG_VALUE_B_IDX];

// Parse the numeric sequence line, converting elements to integers
const numericSequence = rawSourceData[NUMERIC_SEQUENCE_LINE_IDX]
  .split(FIELD_SEPARATOR_CHAR)
  .map(
    currentElement => parseInt(currentElement)
  );

/**
 * Identifies the smallest value in an array of integers and its corresponding index.
 * @param {number[]} integerCollection - The array of numbers to search.
 * @returns {{valueFound: number, elementPosition: number}} An object containing the minimum value and its index.
 */
const locateSmallestValue = (
  integerCollection
) =>
  integerCollection.reduce(
    (accumulatorObject, currentElement, elementPosition) =>
      currentElement < accumulatorObject.valueFound
        ? { valueFound: currentElement, elementPosition: elementPosition }
        : accumulatorObject,
    {
      valueFound: integerCollection[0],
      elementPosition: 0,
    }
  );

/**
 * Computes a final result based on input parameters and a numeric sequence.
 * @param {string} paramA_str - First configuration parameter (as string).
 * @param {string} paramB_str - Second configuration parameter (as string).
 * @param {number[]} numSequence - The array of numbers.
 * @returns {number} The calculated result.
 */
const computeResult = (
  paramA_str,
  paramB_str,
  numSequence
) => {
  const calculationOutcome = locateSmallestValue(numSequence);
  const foundPosition = calculationOutcome.elementPosition; // The index of the smallest element

  // Convert string parameters to integers for arithmetic operations
  const actualParamA = parseInt(paramA_str);
  const actualParamB = parseInt(paramB_str);

  // Perform the ceiling division operations and sum them
  return Math.ceil(foundPosition / (actualParamB - 1)) + Math.ceil(foundPosition / (actualParamA - actualParamB - 1));
};

// Output the final computed value to the console
console.log(computeResult(paramA, paramB, numericSequence));