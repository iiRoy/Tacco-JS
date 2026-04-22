"use strict";

// This module provides utility functions for file system operations in Node.js.
const fileSystemModule = require("fs");

/**
 * Calculates the number of unique pairs (combinations of 2) that can be formed
 * from a given count of items. This is equivalent to "n choose 2".
 * @param {number} totalItems - The total number of items.
 * @returns {number} The number of unique pairs. Returns 0 if totalItems is less than 2.
 */
function determinePairsCount(totalItems) {
  // A valid combination of two requires at least two items.
  if (totalItems < 2) {
    return 0;
  }
  // The formula for combinations (n C 2) is n * (n - 1) / 2.
  return (totalItems * (totalItems - 1)) / 2;
}

// Entry point for the script's execution.
try {
  // Read all input from standard input, decode it as UTF-8, and remove
  // any leading or trailing whitespace for cleaner processing.
  const rawInputContent = fileSystemModule.readFileSync("/dev/stdin", "utf8").trim();

  // Implement a guard clause: If no content was read, terminate with an error.
  if (!rawInputContent) {
    console.error("Critical Error: No input data was provided via stdin.");
    process.exit(1); // Exit with a non-zero status code indicating an error.
  }

  // Split the entire input content into individual lines.
  const contentLines = rawInputContent.split('\n');

  // Another guard clause: Ensure there are at least two lines of input
  // (one for count, one for numbers).
  if (contentLines.length < 2) {
    console.error("Critical Error: Insufficient input. Expected at least two lines.");
    process.exit(1);
  }

  // Parse the first line to get the expected quantity of numbers in the sequence.
  const expectedQuantity = parseInt(contentLines[0], 10);

  // Validate the parsed expected quantity. It must be a positive integer.
  if (isNaN(expectedQuantity) || expectedQuantity <= 0) {
    console.error("Critical Error: The specified expected quantity of elements is invalid or non-positive.");
    process.exit(1);
  }

  // Process the second line: split it by spaces, parse each part as an integer.
  // Filter out any invalid (NaN or non-positive) numbers encountered.
  const numericSequence = contentLines[1].split(' ').map(strValue => {
    const parsedNumber = parseInt(strValue, 10);
    // If a value is not a valid positive integer, log a warning and mark it for removal.
    if (isNaN(parsedNumber) || parsedNumber < 1) {
      console.warn(`Warning: Detected an invalid value '${strValue}' in the input sequence. This entry will be skipped.`);
      return null; // Using null as a flag for invalid entries.
    }
    return parsedNumber;
  }).filter(val => val !== null); // Remove all entries that were marked as null.

  // Check if the number of successfully parsed values matches the expected quantity.
  // This is a resilience check; the program can proceed but warns the user.
  if (numericSequence.length !== expectedQuantity) {
    console.warn(`Warning: The actual number of valid values (${numericSequence.length}) found in the input sequence does not match the expected count (${expectedQuantity}).`);
  }

  // Determine the largest number present in the sequence. This is crucial for
  // correctly sizing our frequency tracking array, as numbers are 1-indexed.
  const highestObservedValue = Math.max(...numericSequence);

  // Guard clause: If no positive numbers were found after parsing.
  if (highestObservedValue < 1) {
    console.error("Critical Error: No valid positive numbers were identified in the input sequence.");
    process.exit(1);
  }

  // Initialize an array to keep track of the frequency (occurrences) of each number.
  // The array is sized to `highestObservedValue + 1` because numbers are 1-indexed,
  // meaning index 0 will remain unused, and index `N` will store the count of number `N`.
  const frequencyCounter = new Array(highestObservedValue + 1).fill(0);

  // Iterate through the processed numeric sequence to populate the frequency counter.
  for (const itemValue of numericSequence) {
    // Ensure the item value is within the bounds we expect for our frequency array.
    if (itemValue >= 1 && itemValue <= highestObservedValue) {
      frequencyCounter[itemValue]++; // Increment the count for the specific number.
    } else {
      // This case should ideally be caught by the earlier filter, but acts as a fail-safe.
      console.warn(`Warning: Value ${itemValue} is out of expected range [1, ${highestObservedValue}] during frequency counting. Skipping.`);
    }
  }

  // Calculate the total sum of combinations of pairs across all distinct numbers.
  // This is the initial baseline for our calculations.
  let overallPairsTotalSum = 0;
  // Iterate from index 1 (corresponding to number 1) up to the highest observed value.
  for (let idx = 1; idx < frequencyCounter.length; idx++) {
    const currentFrequency = frequencyCounter[idx];
    // Add the combinations for the current number's frequency to the running total.
    overallPairsTotalSum += determinePairsCount(currentFrequency);
  }

  // Now, for each number in the original input sequence, calculate and print
  // the adjusted total of combinations.
  // This adjustment reflects removing one instance of the current number from its group.
  for (const originalValue of numericSequence) {
    // Get the frequency of the current number from our counter.
    const originalValueFrequency = frequencyCounter[originalValue];

    // Calculate how many pairs would be formed by this number's group if
    // one instance of it were removed.
    const pairsAfterOneRemoval = determinePairsCount(originalValueFrequency - 1);

    // Calculate how many pairs were originally formed by this number's group.
    const originalPairsInGroup = determinePairsCount(originalValueFrequency);

    // The adjusted total is:
    // (Overall total pairs)
    // - (Pairs originally formed by this number's group)
    // + (Pairs formed by this number's group after one instance is removed)
    const finalAdjustedPairs = overallPairsTotalSum - originalPairsInGroup + pairsAfterOneRemoval;

    // Output the calculated adjusted sum for the current number.
    console.log(finalAdjustedPairs);
  }

} catch (runtimeError) {
  // Catch any unexpected runtime errors that might occur during the script's execution.
  console.error(`An unforeseen error occurred during processing: ${runtimeError.message}`);
  process.exit(1); // Indicate an abnormal termination.
}