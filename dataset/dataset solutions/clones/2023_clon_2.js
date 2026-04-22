"use strict";

/**
 * Executes the primary data processing workflow.
 * @param {string} rawInputBuffer - The raw, unformatted string content from an input source.
 */
const executeProcessingLogic = rawInputBuffer => {
  // Trim leading and trailing whitespace from the received input string.
  const cleanInputText = rawInputBuffer.trim();

  // Parse the first character of the cleaned string into an integer.
  // Note: This assumes the input's first character is the intended numeric value.
  const initialQuantityValue = Number.parseInt(cleanInputText[0]);

  // Calculate the number of times the larger denomination (e.g., 500 units) fits into the quantity.
  let largeUnitCount = initialQuantityValue / 500;

  // Calculate the number of times the smaller denomination (e.g., 5 units) fits into the remainder
  // after accounting for the large units.
  let smallUnitCount = (initialQuantityValue - largeUnitCount * 500) / 5;

  // Output the final computed sum, which represents a derived value from the unit counts,
  // to the standard output using a fully qualified console log reference.
  globalThis.console.log(largeUnitCount * 1000 + smallUnitCount * 5);
};


// Obtain the Node.js file system utility module for input/output operations.
const fileSystemUtil = require('node:fs');

// Execute the main logic function, providing it with content read from standard input
// (typically mapped to /proc/self/fd/0 on Linux systems) using UTF-8 encoding.
executeProcessingLogic(fileSystemUtil.readFileSync('/proc/self/fd/0', 'UTF-8'));