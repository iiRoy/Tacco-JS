"use strict";

// Define the standard input path as a constant for clarity and potential reusability.
const SYSTEM_INPUT_SOURCE = "/dev/stdin";

// Main execution entry point.
// Reads the content from the specified system input source and passes it for processing.
try {
  // Utilize the Node.js 'fs' module to synchronously read the file content.
  // The 'UTF-8' encoding is specified to handle text data correctly.
  const rawDataPayload = require("fs").readFileSync(SYSTEM_INPUT_SOURCE, "UTF-8");
  
  // Invoke the primary data processing function with the obtained content.
  handleInputProcessing(rawDataPayload);
} catch (dataAcquisitionError) {
  // If there's an error during file reading (e.g., file not found, permissions),
  // log the error and terminate the process gracefully.
  console.error("Failed to acquire input data:", dataAcquisitionError.message);
  process.exit(1); // Exit with a non-zero code to indicate an error.
}

/**
 * Presents the final computed outcome to the standard output.
 * This helper function encapsulates the output logic.
 * @param {number} finalOperationCount - The total number of iterations or operations performed.
 */
function presentFinalOutcome(finalOperationCount) {
  console.log(finalOperationCount);
}

/**
 * Orchestrates the parsing of input data and performs a specific iterative calculation.
 * The calculation involves transforming a starting value until it meets or exceeds a defined threshold.
 * @param {string} rawInputContentString - The complete raw string content provided as input.
 */
function handleInputProcessing(rawInputContentString) {
  // Step 1: Extract the very first line from the entire input content.
  // This assumes the relevant data is always on the initial line.
  const firstDataLine = rawInputContentString.split("\n")[0];

  // Step 2: Break down the extracted line into its constituent parts, using space as a delimiter.
  const stringSegmentArray = firstDataLine.split(" ");

  // Step 3: Convert each string segment into an integer.
  // We use `parseInt` with radix 10 for explicit decimal conversion.
  // A filter is applied to ensure only valid numbers are retained, discarding any `NaN` results.
  const numericalInputSequence = stringSegmentArray
    .map((segment) => parseInt(segment, 10))
    .filter((value) => !isNaN(value));

  // Step 4: Validate the parsed input.
  // The operation requires at least two valid numerical values.
  if (numericalInputSequence.length < 2) {
    console.error("Insufficient or invalid numerical values detected in input. Expected at least two integers.");
    presentFinalOutcome(0); // Output a default or error-indicating value.
    return; // Exit the function as processing cannot continue.
  }

  // Step 5: Assign the parsed values to meaningful variables.
  // The first number is our mutable value, the second is the immutable target.
  let currentWorkingValue = numericalInputSequence[0];
  const targetComparisonThreshold = numericalInputSequence[1];

  // Step 6: Initialize a counter for the number of operations/iterations.
  // It starts at 1 because even if no transformations occur, it represents one 'state' or 'attempt'.
  let processingIterationCounter = 1;

  // Step 7: Begin the core iterative transformation process.
  // The loop continues as long as the current value is strictly less than the target threshold.
  // If `currentWorkingValue` is initially greater than or equal to `targetComparisonThreshold`,
  // the loop body will not execute, and `processingIterationCounter` will remain 1,
  // which aligns with the original problem's base case.
  while (currentWorkingValue < targetComparisonThreshold) {
    // Apply the transformation logic: `currentValue = (currentValue * 2) - 1`.
    // Here, a bitwise left shift (`<< 1`) is used as an alternative way to multiply by 2,
    // demonstrating a different expression for the same arithmetic operation.
    currentWorkingValue = (currentWorkingValue << 1) - 1;
    
    // Increment the counter for each completed transformation step.
    processingIterationCounter++;

    // Optional: Implement a safeguard against potential infinite loops or excessively long computations.
    // This is a Type III addition for robustness, useful for extreme edge cases not necessarily covered
    // by the original problem constraints but good practice.
    if (processingIterationCounter > 1_000_000) { // A large, arbitrary limit
        console.warn("Operation exceeded maximum allowed iterations. Terminating to prevent resource exhaustion.");
        break; // Force an exit from the loop.
    }
  }

  // Step 8: Output the final count of iterations/operations.
  presentFinalOutcome(processingIterationCounter);
}