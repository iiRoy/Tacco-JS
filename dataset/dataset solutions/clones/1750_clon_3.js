'use strict';

// This module provides file system utilities for reading input.
const fileSystemModule = require('fs');

// Reads the entire input from '/dev/stdin', decodes it as UTF-8,
// and then splits it into an array of individual lines.
const rawInputLines = fileSystemModule.readFileSync('/dev/stdin', 'utf8').split('\n');

/**
 * Utility function to parse a space-separated string of numbers into an array of integers.
 * Includes basic validation for robust parsing.
 * @param {string} lineOfText - The string containing space-separated numbers.
 * @returns {number[]} An array of parsed integers. Returns an empty array if input is invalid.
 */
const parseNumericString = (lineOfText) => {
  // Guard clause: Ensure the input is a non-empty string.
  if (typeof lineOfText !== 'string' || lineOfText.trim() === '') {
    // Return an empty array for invalid or empty input lines to prevent errors.
    return [];
  }

  // Split the string by spaces, filter out any empty strings resulting from multiple spaces,
  // then map each numeric string to its integer representation.
  return lineOfText.split(' ')
    .filter(segment => segment.trim() !== '') // Remove empty segments
    .map(numericStr => {
      const parsedValue = parseInt(numericStr, 10);
      // Basic validation: if parsing fails, return 0 or handle error appropriately.
      if (isNaN(parsedValue)) {
        console.warn(`Warning: Encountered non-numeric data '${numericStr}'. Defaulting to 0.`);
        return 0; // Default to 0 for invalid numbers to maintain program flow.
      }
      return parsedValue;
    });
};

// A Map is used to store the counts of each element. Using Map provides better
// performance and flexibility for dynamic keys compared to a plain object,
// especially if keys were not strictly numeric. Counts are stored as BigInts.
const elementTally = new Map();

// Create a mutable copy of the input lines to safely process them by shifting.
const remainingInputData = [...rawInputLines];

// The first line of input typically indicates the total number of initial elements.
// This line is discarded as its value is not directly used in the logic.
const initialElementCountHeader = remainingInputData.shift();
// Optional: Could add validation for initialElementCountHeader if necessary.

// The next line contains the space-separated values of the initial elements.
const initialElementsDataLine = remainingInputData.shift();

// Process the initial elements if the data line exists.
if (initialElementsDataLine) {
  const initialNumbers = parseNumericString(initialElementsDataLine);

  /**
   * Helper function to increment the count of an element in the elementTally Map.
   * Ensures counts are handled as BigInts.
   * @param {number} valueToCount - The numerical value of the element.
   * @param {BigInt} incrementAmount - The amount to add to the count (defaults to 1n).
   */
  const addElementToTally = (valueToCount, incrementAmount = 1n) => {
    // Retrieve the current count, defaulting to 0n if the element is not yet in the map.
    const currentCount = elementTally.get(valueToCount) || 0n;
    elementTally.set(valueToCount, currentCount + incrementAmount);
  };

  // Add each initial number to our tally.
  initialNumbers.forEach(itemValue => {
    addElementToTally(itemValue);
  });
}

// The next line indicates the number of operations to follow.
// This line is also discarded as its value is not explicitly used for loop control.
const operationCountHeader = remainingInputData.shift();
// Optional: Could add validation for operationCountHeader.

// Main processing loop: iterates through the remaining input lines, each representing an operation.
while (remainingInputData.length > 0) {
  const currentOperationLine = remainingInputData.shift();

  // Skip any empty or whitespace-only lines to prevent parsing errors.
  if (!currentOperationLine || currentOperationLine.trim() === '') {
    continue;
  }

  // Parse the current operation line, expecting two numbers: source and destination elements.
  const operationParameters = parseNumericString(currentOperationLine);

  // Validate that the operation line contains at least two parameters.
  if (operationParameters.length < 2) {
    console.warn(`Skipping malformed operation line due to insufficient parameters: "${currentOperationLine}"`);
    continue; // Move to the next line if the operation is invalid.
  }

  const sourceElementIdentifier = operationParameters[0];
  const destinationElementIdentifier = operationParameters[1];

  // Retrieve the current count of the source element.
  const currentSourceCount = elementTally.get(sourceElementIdentifier);

  // Proceed only if the source element exists and has a positive count to transfer.
  if (currentSourceCount && currentSourceCount > 0n) {
    // The problem statement implies that the *entire* count of the source element
    // is transferred to the destination.
    const amountToTransfer = currentSourceCount;

    // Decrement the source element's count to zero, as its entire count is moved.
    elementTally.set(sourceElementIdentifier, 0n);

    // Increment the destination element's count by the amount transferred.
    // Ensure destination count starts at 0n if it's a new element.
    const currentDestinationCount = elementTally.get(destinationElementIdentifier) || 0n;
    elementTally.set(destinationElementIdentifier, currentDestinationCount + amountToTransfer);
  }

  // After each operation, calculate and output the current sum of all elements.
  console.log(computeAggregateValue());
}

/**
 * Calculates the total aggregate value by summing (element_value * element_count) for all elements.
 * This function optimizes the summation by direct multiplication rather than iterative addition.
 * @returns {number} The total sum of all elements, where each element's value is multiplied by its count.
 */
function computeAggregateValue() {
  let totalAccumulatedValue = 0; // The final sum is expected to be a standard JavaScript Number.

  // Iterate over each key-value pair (element, count) in the elementTally Map.
  for (const [elementKey, elementCountBigInt] of elementTally.entries()) {
    // Only include elements that still have a positive count.
    if (elementCountBigInt > 0n) {
      // Convert BigInt count to a Number for multiplication with the elementKey (which is a Number).
      // This is a Type III optimization: instead of looping `elementCountBigInt` times,
      // we directly multiply, which is much more efficient.
      totalAccumulatedValue += Number(elementKey) * Number(elementCountBigInt);
    }
  }
  return totalAccumulatedValue;
}