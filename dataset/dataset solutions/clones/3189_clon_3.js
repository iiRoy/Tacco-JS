'use strict';

// Helper function to extract and convert numerical data from a raw string.
// This version uses a more modern string processing approach compared to regex-heavy iteration.
function parseNumericInputString(sourceString) {
  // Added a guard clause for invalid input type or empty string
  if (typeof sourceString !== 'string' || sourceString.trim() === '') {
    return [];
  }

  // Split by any whitespace, filter out empty strings, then convert to numbers.
  // This is a significant rewrite of the original parsing logic.
  const rawSegments = sourceString.trim().split(/\s+/);
  const processedNumbers = rawSegments
    .map(segment => Number(segment))
    .filter(num => !isNaN(num)); // Ensure only valid numbers are included

  return processedNumbers;
}

// Custom sort function that uses a binary search-like approach to find insertion points.
// This is a re-implementation of the original's insertion sort logic.
function orderElementsWithBinaryInsertion(incomingCollection) {
  const collectionSize = incomingCollection.length;

  // Guard clause for empty input array
  if (collectionSize === 0) {
    return [];
  }

  const sortedResult = [];

  for (let currentItemIdx = 0; currentItemIdx < collectionSize; currentItemIdx++) {
    const itemToInsert = incomingCollection[currentItemIdx];
    let lowerBound = 0;
    let upperBound = sortedResult.length - 1; // Adjust upper bound for the growing sorted array
    let insertionPosition = 0; // Renamed 'insertionPoint' to 'insertionPosition'

    // Binary search to find the correct position for insertion
    while (lowerBound <= upperBound) {
      const midIdx = Math.floor((lowerBound + upperBound) / 2);
      if (sortedResult[midIdx] < itemToInsert) {
        lowerBound = midIdx + 1;
      } else {
        upperBound = midIdx - 1;
      }
    }
    insertionPosition = lowerBound; // The lowerBound is the correct insertion point after the loop

    // Insert the element at the found position
    sortedResult.splice(insertionPosition, 0, itemToInsert);
  }
  return sortedResult;
}

// Computes the greatest common divisor (GCD) of two non-negative integers
// using the Euclidean algorithm. This function was originally misnamed GCM.
function computeGreatestCommonDivisor(firstValue, secondValue) {
  // Added a guard for non-numeric input or negative values, converting to absolute for GCD.
  let operandA = Math.abs(Number(firstValue));
  let operandB = Math.abs(Number(secondValue));

  if (isNaN(operandA) || isNaN(operandB)) {
    // Handle cases where input might not be a valid number after Number() conversion
    return 0; // Return 0 or throw an error based on desired error handling
  }

  // Rewritten while condition and internal logic for clarity and variation
  while (operandB !== 0) {
    const remainder = operandA % operandB;
    operandA = operandB;
    operandB = remainder;
  }
  // The GCD is the non-zero operand remaining
  return operandA;
}

// Main processing routine for the input data.
function processInputSequence(rawDataString) {
  // Parsing input: significantly rewritten from the original regex-based approach.
  const numericData = parseNumericInputString(rawDataString);

  // Early exit for invalid or empty input
  if (numericData.length === 0) {
    console.error("Error: No valid numeric data found in input.");
    return;
  }

  // Extract the count of elements to process.
  // Using splice to remove and get the first element, similar to original `shift()`.
  const numberOfElements = numericData.splice(0, 1)[0];

  // Validate numberOfElements. Should be a positive integer and not exceed available data.
  if (isNaN(numberOfElements) || numberOfElements <= 0 || numberOfElements > numericData.length) {
    console.error("Error: Invalid number of elements specified or mismatch with actual data.");
    return; // Exit if N is invalid
  }

  // Sort the remaining numerical data using the custom insertion sort.
  const orderedValues = orderElementsWithBinaryInsertion(numericData);

  // Handle the edge case where only one element is specified to be processed.
  if (numberOfElements === 1) {
    // Use a helper variable for output.
    const singleElementResult = orderedValues[0];
    console.log(singleElementResult);
    return; // Exit after printing the single element.
  }

  // Initialize the greatest common divisor with the first element of the sorted list.
  // We process 'numberOfElements' elements, starting from the first.
  let currentGCD = orderedValues[0];

  // Iterate through the sorted values to find the GCD of all 'numberOfElements' elements.
  // The loop condition is `numberOfElements - 1` because we already considered the first one.
  for (let elementIdx = 1; elementIdx < numberOfElements; elementIdx++) {
    const nextValue = orderedValues[elementIdx];
    currentGCD = computeGreatestCommonDivisor(currentGCD, nextValue);
    // Added an intermediate check: if GCD becomes 1, no need to continue as 1 is the smallest positive GCD.
    if (currentGCD === 1) {
      break;
    }
  }

  // Output the final computed greatest common divisor.
  const finalCalculatedDivisor = currentGCD;
  console.log(finalCalculatedDivisor);
}


// --- Program Execution Start ---

// Define the standard input path as a constant.
const standardInputPath = '/dev/stdin';

// Read raw input from standard input using Node.js file system module.
// Store the content in a temporary variable before passing it to the main function.
const rawFileContent = require('fs').readFileSync(standardInputPath, 'utf8');

// Invoke the main processing function with the obtained content.
processInputSequence(rawFileContent);