'use strict';
// This directive enforces strict mode for better code quality.

/*
 * Module for file system operations.
 * Using 'node:fs' for modern Node.js environments.
 */
const sourceReader = require('node:fs');

// Read all lines from standard input, decode as UTF-8, and split by newline character.
const inputDataLines = sourceReader
  .readFileSync(
    '/proc/self/fd/0', // A common path for stdin on Linux systems.
    'utf-8' // Character encoding for the input.
  )
  .split('\n');

/**
 * Parses a string of space-separated numbers into an array of integers.
 * @param {string} inputStringContent - The string to parse.
 * @returns {number[]} An array of parsed integer values.
 */
const processNumericLine = (inputStringContent) => {
  // Split the string by space characters.
  return inputStringContent
    .split(' ')
    .map((singleValueElement) => Number.parseInt(singleValueElement, 10)); // Convert each part to an integer.
};

// Discard the very first line of input, often metadata.
inputDataLines.shift();

// Initialize an object to store counts or quantities for various items.
const itemQuantityMap = {};

/*
 * Process the initial set of items described on the second line of input.
 * Each number on this line represents an item ID, and its count is incremented.
 */
processNumericLine(inputDataLines.shift()).forEach((itemIdentifier) => {
  // Ensure the item exists in the map, initializing with 0n (BigInt zero) if not.
  itemQuantityMap[itemIdentifier] = itemQuantityMap[itemIdentifier] || 0n;
  itemQuantityMap[itemIdentifier] += 1n; // Increment the count for the item.
});

// Discard another line, potentially a separator or another piece of metadata.
inputDataLines.shift();

// Main processing loop: continue as long as there are input lines remaining.
while (inputDataLines.length > 0) {
  // Parse the current line into a pair of numbers (source and destination item IDs).
  const currentNumericPair = processNumericLine(inputDataLines.shift());

  // Check if the source item exists and has a positive quantity.
  if (itemQuantityMap[currentNumericPair[0]]) {
    // Determine the amount to transfer, ensuring it's a BigInt.
    const transferAmount = BigInt(itemQuantityMap[currentNumericPair[0]]);

    // Decrease the quantity of the source item.
    itemQuantityMap[currentNumericPair[0]] -= transferAmount;

    // Ensure the destination item exists in the map, initializing with 0n if not.
    itemQuantityMap[currentNumericPair[1]] =
      itemQuantityMap[currentNumericPair[1]] || 0n;
    // Increase the quantity of the destination item by the transferred amount.
    itemQuantityMap[currentNumericPair[1]] += transferAmount;
  }

  // Output the current aggregate sum calculated from the item quantities.
  console.log(computeAggregateSum());
}

/**
 * Calculates the total sum by iterating through the item quantity map.
 * Each item's ID is added to the sum 'quantity' times.
 * @returns {number} The final calculated sum.
 */
function computeAggregateSum() {
  // Retrieve all unique keys (item IDs) from the quantity map.
  const mapEntryKeys = Object.keys(itemQuantityMap);
  let totalAccumulatedValue = 0; // Initialize the sum.

  // Iterate over each unique item key.
  mapEntryKeys.forEach((entryKeyIdentifier) => {
    // Only process if the item has a positive quantity.
    if (itemQuantityMap[entryKeyIdentifier]) {
      // Loop 'quantity' times for each item.
      for (
        let iterationCounter = 0,
          currentEntryQuantity = itemQuantityMap[entryKeyIdentifier];
        iterationCounter < currentEntryQuantity;
        iterationCounter++
      ) {
        // Add the integer value of the item ID to the total sum.
        totalAccumulatedValue += Number.parseInt(entryKeyIdentifier, 10);
      }
    }
  });
  return totalAccumulatedValue; // Return the final computed sum.
}