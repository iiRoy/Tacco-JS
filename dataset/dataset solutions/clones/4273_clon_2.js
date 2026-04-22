'use strict'; // Enforce strict parsing rules for better code quality.

/**
 * Initiates the core processing sequence for the provided raw text input.
 * This function parses, calculates, and then displays the final result.
 * @param {string} rawDataInput - The unprocessed string received from the input source.
 */
const initiateProcessing = (rawDataInput) => {
  // First, transform the incoming raw string into a collection of numerical values.
  // Each line break in the input signifies a new distinct number.
  const numericalCollection = rawDataInput
    .split('\n') // Divide the input string into an array of substrings based on newline characters.
    .map(
      (lineSegment) => {
        // For each segment, convert it from a string representation to an integer.
        // This ensures numerical operations can be performed correctly.
        return parseInt(lineSegment);
      }
    );

  // Extract the specific parameters needed for the calculation from the numerical collection.
  const maximumIterations = numericalCollection[0]; // The first number dictates the loop's upper limit.
  const augmentationFactor = numericalCollection[1]; // The second number acts as a limiting factor for augmentation.

  let currentAccumulatedValue = 1; // Initialize the primary counter with a starting value of one.

  // Commence a loop that runs for a predetermined number of cycles.
  for (let cycleCount = 1; cycleCount <= maximumIterations; cycleCount++) {
    // Determine the quantum of increase for the current cycle.
    // This quantum is the lesser of the augmentation factor or the current accumulated value.
    let growthQuantum = Math.min(augmentationFactor, currentAccumulatedValue);

    // Apply the calculated growth quantum to the accumulated value.
    currentAccumulatedValue += growthQuantum;
  }

  // Display the final computed accumulated value to the standard output.
  console.log(currentAccumulatedValue);
};

// Begin the program execution by reading content from the standard input stream.
// The file system module is used to read the content of '/dev/stdin' as a UTF-8 encoded string.
initiateProcessing(
  require('fs')
    .readFileSync('/dev/stdin', 'utf-8')
);