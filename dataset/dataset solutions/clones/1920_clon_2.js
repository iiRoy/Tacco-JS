'use strict'; // Enforce strict mode for cleaner code

/**
 * Processes the given raw input to calculate the number of iterations
 * required for a balance to reach a target value with compound interest.
 * @param {string} rawData - The raw input string, typically from stdin.
 */
function processInput(rawData) {
  // Split the input string into an array of lines and parse the target value.
  const
    linesArray = rawData.trim().split('\n'), // Remove leading/trailing whitespace and split by newline
    targetValue = Number(linesArray[0]); // Convert the first line to a number, which is our goal

  // Initialize financial variables.
  let
    currentBalance = 100, // Starting capital
    iterationCount = 0;   // Counter for the number of periods

  // Loop until the current balance meets or exceeds the target value.
  while (currentBalance < targetValue) {
    currentBalance *= 1.01; // Apply a 1% interest rate (compound)
    iterationCount++;       // Increment the period counter
  }

  // Output the final count of iterations to the console.
  console.log(iterationCount);
}

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
