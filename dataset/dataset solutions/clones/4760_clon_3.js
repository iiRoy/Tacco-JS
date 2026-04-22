'use strict';

/**
 * Reads raw input data from stdin.
 * @returns {string} The content read from standard input.
 */
function retrieveInputData() {
  try {
    // Attempt to read from stdin, assuming it's UTF-8 encoded.
    const fileSystemModule = require('fs');
    return fileSystemModule.readFileSync('/dev/stdin', 'utf8');
  } catch (error) {
    // Handle potential errors during file reading, e.g., file not found or permissions.
    console.error("Error reading input from /dev/stdin:", error.message);
    // Return an empty string or throw the error, depending on desired error handling.
    return '';
  }
}

/**
 * Analyzes a sequence of 'I' (increase) and 'D' (decrease) operations,
 * starting from a base level of zero. The first character of the input
 * string specifies the total number of operations to process.
 * The function then determines and outputs the highest level reached
 * during the sequence.
 *
 * @param {string} rawSequence A string where the first character is
 *                             a digit representing the count of subsequent
 *                             operations, followed by 'I' or 'D' characters.
 *                             Example: "5IDII" means 5 operations, starting
 *                             with I, then D, then I, I, I.
 */
function analyzeFluctuation(rawSequence) {
  // Input validation: Ensure the raw sequence is a non-empty string.
  if (typeof rawSequence !== 'string' || rawSequence.trim().length === 0) {
    console.error("Invalid or empty input sequence provided.");
    return;
  }

  // Convert the input string into an array of individual characters.
  const charArray = Array.from(rawSequence);

  // Extract the number of operations from the first character.
  // Use parseInt with radix 10 for explicit conversion.
  const totalOperations = Number.parseInt(charArray[0], 10);

  // Validate the extracted operation count.
  if (Number.isNaN(totalOperations) || totalOperations < 0 || totalOperations >= charArray.length) {
    console.error(`Invalid operation count detected: ${charArray[0]}. Expected a non-negative integer less than string length.`);
    return;
  }

  // Initialize the current level accumulator.
  let currentAltitude = 0;
  // This array will store all intermediate altitude readings.
  const altitudeReadings = [];

  // Iterate through the operations, starting from the second character
  // up to the total number of operations specified.
  for (let stepIndex = 0; stepIndex < totalOperations; stepIndex++) {
    // Determine the character representing the current operation.
    // The operations start from index 1 in the character array.
    const operationChar = charArray[stepIndex + 1];

    // Apply the operation based on the character.
    // A switch statement is used here for clarity and extensibility.
    switch (operationChar) {
      case 'I': // 'I' indicates an increase in altitude.
        currentAltitude++;
        break;
      case 'D': // 'D' indicates a decrease in altitude.
        currentAltitude--;
        break;
      default: // Handle unexpected characters gracefully.
        console.warn(`Unrecognized operation character '${operationChar}' at position ${stepIndex + 1}. Skipping.`);
        // Optionally, one could choose to break or throw an error here.
        break;
    }

    // Record the current altitude after each operation.
    altitudeReadings.push(currentAltitude);
  }

  // Determine the maximum altitude reached.
  // If no operations were performed (e.g., totalOperations was 0),
  // the array might be empty. In such cases, the max is 0.
  let highestPoint = 0;
  if (altitudeReadings.length > 0) {
    // Use apply for a slightly different way to call Math.max with an array.
    highestPoint = Math.max.apply(null, altitudeReadings);
  }

  // Display the final result.
  console.log(highestPoint);
}

// Execute the analysis process by first retrieving input and then processing it.
analyzeFluctuation(retrieveInputData());