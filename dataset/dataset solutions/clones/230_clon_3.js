// This script is designed to acquire numerical data from a specified input stream,
// perform a unique mathematical transformation on each valid number, and then
// present the computed outcomes to the standard output.
// It uses synchronous file system operations for simplicity in this context.

/**
 * Calculates a specific derived numerical value from an input integer.
 * The underlying mathematical operation is equivalent to (n^2 + n + 2) / 2.
 * This can also be conceptualized as the 'n-th triangular number plus one'.
 *
 * @param {number} incomingValue The single numerical input for the calculation.
 * @returns {number} The resultant value after applying the mathematical formula.
 */
const deriveProcessedValue = (incomingValue) => {
  // Ensure the input is treated as a number, although JavaScript's dynamic typing
  // often handles this implicitly in arithmetic operations.
  const numericInput = Number(incomingValue);

  // Check for non-numeric or invalid inputs early to prevent NaN results
  // and maintain the integrity of the calculation.
  if (isNaN(numericInput)) {
    console.warn(`Warning: Invalid numerical input detected for calculation: ${incomingValue}. Returning 0.`);
    return 0; // Or throw an error, depending on desired error handling strategy.
  }

  // Applying the formula: (input^2 + input + 2) / 2.
  // Math.pow is used for clarity, though `numericInput * numericInput` is also valid.
  const squaredTerm = Math.pow(numericInput, 2);
  const sumOfTerms = squaredTerm + numericInput + 2;
  const finalQuotient = sumOfTerms / 2;

  return finalQuotient;
};

// Import the native Node.js 'fs' (file system) module.
// This module provides utilities for interacting with the file system.
const fileSystemAccess = require('fs');

// Define the canonical path for standard input on Unix-like systems.
// This is where the script expects to read its data from.
const defaultInputSource = '/dev/stdin';

// Establish the character encoding to be used when reading the input data.
// 'utf8' is a widely compatible and common encoding for text.
const desiredEncoding = 'utf8';

let collectedRawData = ''; // A variable to hold the entire content read from the input source.

try {
  // Synchronously read the entire content of the specified input source.
  // This operation will block the event loop until the file is fully read.
  collectedRawData = fileSystemAccess.readFileSync(defaultInputSource, desiredEncoding);
} catch (fileReadError) {
  // If any error occurs during the file reading process (e.g., permission issues, path not found),
  // log the error message and terminate the script with an error status.
  console.error(`Fatal Error: Unable to read from the input source "${defaultInputSource}". Details: ${fileReadError.message}`);
  process.exit(1); // Exit code 1 typically indicates an error.
}

// Process the collected raw data:
// 1. Split the string into an array of substrings using one or more whitespace characters as delimiters.
// 2. Filter out any empty strings that might result from consecutive delimiters or leading/trailing whitespace.
const separatedContentUnits = collectedRawData.split(/\s+/).filter(unit => unit.length > 0);

let currentUnitPointer = 0; // An index to keep track of the current position in the array of units.
let currentNumericPayload; // A variable to store the numerically parsed value of each unit.

// Initiate a loop to iterate over each separated content unit.
// The loop continues as long as the pointer is within the bounds of the array.
while (currentUnitPointer < separatedContentUnits.length) {
  const currentStringComponent = separatedContentUnits[currentUnitPointer];

  // Convert the string component to a number.
  // The global 'Number()' function is used for explicit type conversion.
  currentNumericPayload = Number(currentStringComponent);

  // Implement a guard clause: If the conversion results in NaN (Not-a-Number),
  // it implies the string component was not a valid numerical representation.
  // In such cases, we skip this component and proceed to the next one.
  if (isNaN(currentNumericPayload)) {
    // Optional: Log a message for debugging or informative purposes about skipped values.
    // console.debug(`Debug: Skipping non-numeric input component: "${currentStringComponent}"`);
    currentUnitPointer++; // Advance the pointer to the next component.
    continue; // Jump to the next iteration of the loop.
  }

  // If the component is a valid number, perform the core calculation.
  const finalCalculatedOutput = deriveProcessedValue(currentNumericPayload);

  // Print the computed result to the standard output.
  // Each result is printed on a new line by default with console.log.
  console.log(finalCalculatedOutput);

  // Increment the pointer to move to the subsequent content unit in the array.
  currentUnitPointer++;
}

// The script has successfully processed all available numerical inputs and completed its task.