"use strict";

/**
 * Helper function to parse a single line of space-separated integer values.
 * It trims whitespace, splits the string, filters out any empty parts
 * resulting from multiple spaces, and converts each part to an integer.
 * @param {string} lineContent - The string line to parse.
 * @returns {number[]} An array of parsed integer values.
 */
const parseLineOfIntegers = (lineContent) => {
  return lineContent
    .trim()
    .split(" ")
    .filter(Boolean) // Remove empty strings that might result from extra spaces
    .map((itemString) => parseInt(itemString, 10));
};

/**
 * Orchestrates the selection and summation of items based on specific criteria.
 * This function processes input lines representing item values and configuration
 * to find the maximum possible sum by choosing items from different categories,
 * with a provision for special items to substitute others.
 * @param {string[]} rawDataLines - An array of strings, where each string is a line of input.
 */
function calculateOptimalSelection(rawDataLines) {
  // Extract configuration parameters from the first line of input.
  // Unused parameters from the original problem (a, b, c) are intentionally omitted.
  const selectionParameters = parseLineOfIntegers(rawDataLines[0]);
  const requiredRedAppleCount = selectionParameters[0];
  const requiredGreenAppleCount = selectionParameters[1];

  // Parse the lists of apple values from subsequent input lines.
  // Using 'let' for lists as they will be re-assigned after slicing.
  let redApplesAvailable = parseLineOfIntegers(rawDataLines[1]);
  let greenApplesAvailable = parseLineOfIntegers(rawDataLines[2]);
  let colorlessApplesAvailable = parseLineOfIntegers(rawDataLines[3]);

  // Sort the red apples in descending order and select the top 'requiredRedAppleCount'.
  redApplesAvailable.sort((valueOne, valueTwo) => valueTwo - valueOne);
  const selectedRedApples = redApplesAvailable.slice(0, requiredRedAppleCount);

  // Sort the green apples in descending order and select the top 'requiredGreenAppleCount'.
  greenApplesAvailable.sort((valueOne, valueTwo) => valueTwo - valueOne);
  const selectedGreenApples = greenApplesAvailable.slice(0, requiredGreenAppleCount);

  // Sort the colorless apples in descending order.
  // The problem implies we only need to consider up to (requiredRedAppleCount + requiredGreenAppleCount)
  // of the best colorless apples as potential replacements.
  colorlessApplesAvailable.sort((valueOne, valueTwo) => valueTwo - valueOne);
  const topColorlessApples = colorlessApplesAvailable.slice(0, requiredRedAppleCount + requiredGreenAppleCount);

  // Combine the initially selected red and green apples with the top colorless apples.
  // This forms a complete pool of all items that could potentially contribute to the maximum sum.
  const allPotentialItems = selectedRedApples
    .concat(selectedGreenApples)
    .concat(topColorlessApples);

  // Sort this combined pool of items in descending order to easily pick the best ones.
  allPotentialItems.sort((valA, valB) => valB - valA);

  // Select only the top (requiredRedAppleCount + requiredGreenAppleCount) items from the sorted pool.
  // This effectively replaces any less valuable red/green apples with more valuable colorless ones.
  const finalOptimalSelection = allPotentialItems.slice(0, requiredRedAppleCount + requiredGreenAppleCount);

  // Calculate the total sum of the values of the final selected items.
  const accumulatedValue = finalOptimalSelection.reduce(
    (currentSum, itemValue) => currentSum + itemValue,
    0
  );

  // Output the final calculated maximum sum.
  console.log(accumulatedValue);
}

// Entry point for the program.
// Reads input from standard input, processes it, and calls the main logic.
try {
  const fs = require('fs');
  const standardInputPath = '/dev/stdin';
  const fileContent = fs.readFileSync(standardInputPath, 'utf8');

  // Basic validation for input content.
  if (!fileContent || fileContent.trim() === '') {
    console.log(0); // If no input, the sum is 0.
    return;
  }

  const processedInputLines = fileContent.trim().split("\n");

  // Ensure there are at least 4 lines of input (parameters + 3 lists).
  if (processedInputLines.length < 4) {
    console.log(0); // Not enough data to compute, assume 0.
    return;
  }

  calculateOptimalSelection(processedInputLines);
} catch (executionError) {
  // In case of any unexpected error during file reading or processing,
  // output 0 as a graceful fallback, common in competitive programming.
  console.log(0);
}