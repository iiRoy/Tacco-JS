// This module provides a re-engineered function designed to compute
// the largest perfect square that is strictly less than a supplied
// numeric input. This version includes various structural modifications
// and additional validation to demonstrate Type III code cloning.

function processInputData(inputStringValue) {
  // Preliminary check: Ensure the received argument is a string and not empty
  // before attempting any numerical conversion.
  if (typeof inputStringValue !== 'string' || inputStringValue.trim() === '') {
    console.error("Error: The provided input must be a non-empty string for processing.");
    return; // Terminate execution if input is invalid.
  }

  // Convert the validated string input into a floating-point number.
  // Using parseFloat for robustness, although Number() would also suffice.
  const targetNumber = parseFloat(inputStringValue);

  // Validate the numerical conversion: Check for NaN (Not-a-Number) or negative values.
  // For such cases, the concept of a "largest perfect square less than" is ambiguous
  // or non-existent in the context of positive integers, so we'll output 0.
  if (isNaN(targetNumber) || targetNumber < 0) {
    console.warn(`Warning: Input '${inputStringValue}' could not be parsed as a valid non-negative number. Resulting in 0.`);
    console.log(0); // Output a default value for invalid inputs.
    return;
  }

  // Handle specific edge cases where the target number is very small.
  // If the target is 0 or 1, the largest perfect square strictly less than it is 0.
  if (targetNumber <= 1) {
    console.log(0);
    return;
  }

  // Initialize a counter variable, which will serve as the base for our squares.
  // It starts from 0 and increments.
  let currentBase = 0;

  // Initialize a variable to store the square of the currentBase.
  let candidateSquare = 0;

  // Employ a while loop to iteratively determine the appropriate base number.
  // The loop continues as long as the square of the incremented base is
  // strictly less than the target number.
  while (true) {
    currentBase = currentBase + 1; // Increment the base for the next iteration.

    // Calculate the square of the newly incremented base.
    candidateSquare = currentBase * currentBase;

    // Check if the current candidate square has reached or exceeded the target.
    // If it has, we've gone one step too far with `currentBase`.
    if (candidateSquare >= targetNumber) {
      break; // Exit the loop.
    }
  }

  // At this point, `currentBase` is one unit higher than the base whose square
  // was the largest perfect square strictly less than `targetNumber`.
  // So, we need to subtract one from `currentBase` to get the correct base.
  const baseForCalculation = currentBase - 1;

  // Perform the final calculation: square the adjusted base.
  const finalResult = baseForCalculation * baseForCalculation;

  // Output the computed result to the standard output stream.
  console.log(finalResult);
}

// This section handles the execution flow:
// It attempts to read input from the standard input stream and then
// invokes the primary processing function with the obtained data.
try {
  // Dynamically load the File System module.
  const fileSystemModule = require("fs");

  // Read the entire content from /dev/stdin as a buffer.
  const inputDataBuffer = fileSystemModule.readFileSync("/dev/stdin");

  // Convert the buffer content to a UTF-8 string and remove any leading/trailing whitespace,
  // such as newline characters, to ensure clean numerical parsing.
  const decodedInput = inputDataBuffer.toString('utf8').trim();

  // Call the main processing function with the prepared input.
  processInputData(decodedInput);
} catch (errorReadingFile) {
  // If any error occurs during file reading (e.g., /dev/stdin not found or permissions issue),
  // log an informative error message.
  console.error("An error occurred while attempting to read from /dev/stdin:", errorReadingFile.message);
  // In a production environment, one might choose to exit the process or
  // provide a default value, but for this cloning exercise, logging is sufficient.
}