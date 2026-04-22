"use strict"; // Enforce strict parsing and error handling for cleaner code.

/**
 * Orchestrates the process of reading input, performing a sequence adjustment calculation,
 * and displaying the final result. This function serves as the primary entry point
 * for the script's logic.
 *
 * @param {string} sourceDataStream - The complete raw input data as a single string,
 *                                    typically read from standard input.
 */
const performSequenceCorrection = function (sourceDataStream) {

  // Preliminary check for valid input type and content.
  if (typeof sourceDataStream !== 'string' || sourceDataStream.trim().length === 0) {
    console.error("Data processing halted: Provided input stream is empty or invalid.");
    return;
  }

  // Divide the input string into individual lines, handling various newline conventions.
  const segmentedInputLines = sourceDataStream.trim().split(/\r?\n/);

  // Validate that there are enough lines for processing.
  if (segmentedInputLines.length < 2) {
    console.error("Data processing halted: Insufficient input lines. Expected at least two lines.");
    return;
  }

  // Extract the declared count of elements from the very first line.
  const declaredElementCount = parseInt(segmentedInputLines[0], 10);

  // Perform validation on the parsed element count.
  if (isNaN(declaredElementCount) || declaredElementCount < 1) {
    console.error("Data processing halted: Invalid or non-positive element count detected in the first line.");
    return;
  }

  // Parse the second line, splitting it into an array of string-represented numbers.
  const rawNumericStrings = segmentedInputLines[1].split(" ");

  // Convert the array of string numbers into an array of actual numeric values.
  // This pre-conversion prevents repeated string-to-number operations within the loop.
  const numericalSequence = rawNumericStrings.map(numStr => parseInt(numStr, 10));

  // A sanity check: compare the declared count with the actual number of elements.
  if (numericalSequence.length !== declaredElementCount) {
    console.warn(`Warning: Declared element count (${declaredElementCount}) does not match actual element count (${numericalSequence.length}). Proceeding with actual count.`);
  }

  // Initialize a variable to accumulate the total amount of adjustments made.
  let accumulatedCorrection = 0;

  // Iterate through the numerical sequence, comparing adjacent elements.
  // The loop runs up to the second-to-last element to always have a next element for comparison.
  for (let currentIdx = 0; currentIdx < numericalSequence.length - 1; currentIdx++) {
    const currentElementValue = numericalSequence[currentIdx];
    let nextElementValue = numericalSequence[currentIdx + 1]; // Use 'let' as this value might be modified.

    // If the current element is strictly greater than the next element, an adjustment is needed.
    if (currentElementValue > nextElementValue) {
      // Calculate the positive difference required to make the next element at least equal to the current.
      const requiredIncrease = currentElementValue - nextElementValue;

      // Add this calculated increase to our running total of corrections.
      accumulatedCorrection += requiredIncrease;

      // Modify the next element in the sequence to be equal to the current element.
      // This ensures the non-decreasing condition is met for this pair.
      numericalSequence[currentIdx + 1] = currentElementValue;
    }
    // No action is required if currentElementValue <= nextElementValue.
  }

  // Output the final computed total accumulated correction to standard output.
  console.log(accumulatedCorrection);
};

// This block handles the execution of the primary function by reading from standard input.
// It includes error handling for file system operations.
try {
  const stdInputData = require("fs").readFileSync("/dev/stdin", "utf-8");
  performSequenceCorrection(stdInputData);
} catch (ioError) {
  // Catch and report any errors encountered during file reading.
  console.error("An I/O error occurred while attempting to read from standard input:", ioError.message);
}