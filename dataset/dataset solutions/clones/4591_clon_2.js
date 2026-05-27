'use strict';

// This function processes the input string to calculate a specific outcome.
const ProcessInput = (rawData) => {
  // Split the raw input string by spaces and parse the numeric values.
  const parsedValues = rawData.trim().split(' ');
  let valX = parseInt(parsedValues[0]);
  let valY = parseInt(parsedValues[1]);
  let valZ = parseInt(parsedValues[2]);

  let finalOutcome = 0; // Initialize the result variable.

  // Check for a specific edge case: if all three values are equal and even.
  if (valX === valY && valY === valZ && valX % 2 === 0) {
    finalOutcome = -1; // Set outcome to -1 for this specific condition.
  } else {
    // Loop as long as all three values are even.
    for (let iterationCount = 1; valX % 2 === 0 && valY % 2 === 0 && valZ % 2 === 0; iterationCount++) {
      // Store current values in a temporary array to calculate next state.
      const currentValues = [valX, valY, valZ];

      // Apply the transformation rules for each value.
      valX = currentValues[1] / 2 + currentValues[2] / 2;
      valY = currentValues[0] / 2 + currentValues[2] / 2;
      valZ = currentValues[0] / 2 + currentValues[1] / 2;

      finalOutcome = iterationCount; // Update the outcome with the current iteration count.
    }
  }

  // Output the calculated result to the console.
  console.log(finalOutcome);
  return finalOutcome;
};

// Read input from standard input and pass it to the processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
