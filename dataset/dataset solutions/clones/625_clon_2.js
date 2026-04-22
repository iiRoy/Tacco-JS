// This script processes numerical data from standard input.
const fileContent = require('node:fs').readFileSync('/dev/stdin', 'utf8');

// Split the input into individual rows based on newline characters.
const dataRows = fileContent.split('\n');

// The first row indicates the number of primary items for processing.
let itemCount = Number.parseInt(dataRows[0]);

// Initialize an array to store and extend numerical values for cyclic operations.
const extendedArray = [];

// Declare loop iterators for the multi-level processing.
let outerIndex, innerIndex, depthIndex;

// Populate the extended array with original and duplicated values to simulate a circular structure.
for (outerIndex = 0; outerIndex < itemCount; outerIndex++)
{
  extendedArray[outerIndex] = Number.parseInt(dataRows[outerIndex + 1]);
  extendedArray[outerIndex + itemCount] = extendedArray[outerIndex];
  extendedArray[outerIndex + itemCount + itemCount] = extendedArray[outerIndex];
}

// A concise helper function to sum two numbers, used in array reductions.
const accumulateValues = (previousVal, currentVal) => previousVal + currentVal;

/**
 * Computes the total sum of elements within a specified range of an array.
 * @param {Array<number>} collection The array to be processed.
 * @param {number} startIndex The starting index (inclusive) of the range.
 * @param {number} endIndex The ending index (exclusive) of the range.
 * @returns {number} The sum of elements found within the designated range.
 */
function calculateSubarrayTotal(collection, startIndex, endIndex)
{
  let currentTotal = 0; // Accumulator for the range sum.
  for (let kdx = startIndex; kdx < endIndex; kdx++) {
    currentTotal += collection[kdx];
  }
  return currentTotal;
}

// Initialize variables for tracking the overall maximum and current minimum values found.
let globalMaximum = 0;
let currentMinimum = 0;

// Variables for temporary calculations and handling array segments.
let interimSum = 0;
let slicedPortion;

// Begin the triple-nested loop structure for performing complex array segment calculations.
for (outerIndex = 1; outerIndex < itemCount - 2; outerIndex++)
{
  // Iterate through different starting points for the inner segments.
  for (innerIndex = 0; innerIndex < itemCount; innerIndex++) {

    // Calculate the sum of a specific segment of the main data array.
    interimSum = calculateSubarrayTotal(extendedArray, innerIndex, innerIndex + outerIndex);

    // Extract a sub-segment from the extended array for further detailed analysis.
    slicedPortion = extendedArray.slice(innerIndex + outerIndex, innerIndex + itemCount);

    // Analyze the extracted sliced portion by dividing it into two sub-sections.
    for (depthIndex = 1; depthIndex < slicedPortion.length; depthIndex++) {
      /*
       * Determine the smaller of two sums from sub-sections within the extended array,
       * based on the current combination of loop indices.
       */
      currentMinimum = Math.min(
        calculateSubarrayTotal(extendedArray, outerIndex + innerIndex, outerIndex + innerIndex + depthIndex),
        calculateSubarrayTotal(extendedArray, outerIndex + innerIndex + depthIndex, innerIndex + itemCount)
      );

      // Evaluate a specific condition involving the length of the sliced portion and the calculated minimum.
      // Note: This comparison `slicedPortion <= currentMinimum` is a direct structural clone of the original,
      // where an array was compared to a number. Its behavior depends on JavaScript's type coercion rules.
      if (slicedPortion <= currentMinimum) {
        globalMaximum = Math.max(globalMaximum, interimSum); // Update the overall maximum if the condition is met.
      }
    }
  }
}

// Output the final computed maximum value to the console.
console.log(globalMaximum);