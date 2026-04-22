"use strict";

/**
 * Helper function to safely parse a string into an integer.
 * Provides basic validation and defaults to 0 if parsing fails.
 * @param {string} textValue - The string to parse.
 * @returns {number} The parsed integer, or 0 if invalid.
 */
function obtainInteger(textValue) {
  const parsedNumericValue = parseInt(textValue, 10);
  // Ensure the parsed value is a valid number.
  if (isNaN(parsedNumericValue)) {
    return 0; // Return a default value for invalid numbers.
  }
  return parsedNumericValue;
}

/**
 * Processes a raw text payload containing item lists, calculates net frequencies,
 * and determines the highest positive net count.
 * @param {string} rawTextPayload - The complete input string from stdin.
 */
function processItemCollections(rawTextPayload) {
  // Step 1: Split the entire input string into individual tokens.
  // This handles both newline and space delimiters.
  const allInputTokens = rawTextPayload.split(/\s|\n/);

  // Step 2: Extract the quantity for the first collection of items.
  const firstCollectionSize = obtainInteger(allInputTokens[0]);

  // Step 3: Extract the quantity for the second collection of items.
  // Note: The original code parsed this value but did not explicitly use it
  // for the slice length of the second array, relying on slicing to the end.
  const secondCollectionSize = obtainInteger(allInputTokens[firstCollectionSize + 1]);

  // Step 4: Isolate the items belonging to the first collection.
  // These items will increment their respective counts.
  const positiveItemsList = allInputTokens.slice(1, firstCollectionSize + 1);

  // Step 5: Isolate the items belonging to the second collection.
  // These items will decrement their respective counts.
  const negativeItemsList = allInputTokens.slice(firstCollectionSize + 2);

  // Step 6: Initialize a Map to store the net frequency of each unique item.
  // A Map is used for its flexibility with keys and direct iteration over entries/values.
  const itemNetFrequencies = new Map();

  // Step 7: Iterate through the positive items and update their counts.
  for (const currentPositiveItem of positiveItemsList) {
    const existingFrequency = itemNetFrequencies.get(currentPositiveItem) || 0;
    itemNetFrequencies.set(currentPositiveItem, existingFrequency + 1);
  }

  // Step 8: Iterate through the negative items and update their counts.
  for (const currentNegativeItem of negativeItemsList) {
    const existingFrequency = itemNetFrequencies.get(currentNegativeItem) || 0;
    itemNetFrequencies.set(currentNegativeItem, existingFrequency - 1);
  }

  // Step 9: Determine the maximum net frequency observed across all items.
  // Initialize with 0 to ensure that if all counts are negative, the result remains 0.
  let currentMaximumNetScore = 0;

  // Iterate over the values (net frequencies) stored in the Map.
  for (const itemScoreValue of itemNetFrequencies.values()) {
    currentMaximumNetScore = Math.max(currentMaximumNetScore, itemScoreValue);
  }

  // Step 10: Ensure the final result is not less than zero.
  // This explicitly handles cases where all net counts might be negative.
  const finalCalculatedResult = Math.max(0, currentMaximumNetScore);

  // Step 11: Output the final computed result to the console.
  console.log(finalCalculatedResult);
}

// Entry point for the application when executed in a Node.js environment.
// This self-executing anonymous function handles reading from standard input
// and orchestrates the main processing logic.
(function initiateProcessingFlow() {
  const fileSystemModule = require("fs");
  const standardInputPath = "/dev/stdin";
  const textEncodingFormat = "utf8";

  try {
    // Read the entire content of standard input synchronously.
    const rawStreamContent = fileSystemModule.readFileSync(standardInputPath, textEncodingFormat);
    // Pass the raw content to the main processing function.
    processItemCollections(rawStreamContent);
  } catch (operationError) {
    // Log any errors encountered during file reading or processing.
    console.error("An error occurred during input processing:", operationError.message);
    // Exit the process with a non-zero status code to indicate failure.
    process.exit(1);
  }
})();