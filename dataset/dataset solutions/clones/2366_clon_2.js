'use strict'

// This function processes the received data to determine a specific value.
const ProcessInput = (sourceText) => {
  // Parse the input string, after trimming any surrounding whitespace, into an integer.
  const targetPrice = parseInt(sourceText.trim());

  // Initialize a variable to hold the final determined answer, defaulting to a "not found" indicator.
  let finalAnswer = ':(';

  // Begin an iterative search, checking values starting from one up to the target price.
  for (let itemCount = 1; itemCount <= targetPrice; itemCount++) {
    // Compute an intermediate cost by multiplying the current item count by a fixed factor (1.08),
    // then taking the floor (integer part) of the result. This factor represents 108%.
    const calculatedCost = Math.floor(itemCount * (108 / 100.0));

    // If the calculated cost matches the target price, then the current item count is our answer.
    if (calculatedCost === targetPrice) {
      finalAnswer = itemCount; // Assign the matching item count to the final answer.
    }
  }

  // Display the computed final answer to the standard output.
  console.log(finalAnswer);
  // Return the result of the computation.
  return finalAnswer;
};

// Invoke the main processing function, providing it with content read from standard input.
// The file system module is used to read the entire file synchronously as a UTF-8 string.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));