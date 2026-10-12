'use strict'; // Enforce strict mode for cleaner code

/**
 * Processes the raw input to find a specific value.
 * This function calculates a value based on an input number and checks if it matches a target.
 *
 * @param {string} rawData - The raw string input, typically from standard input.
 * @returns {string|number} The calculated number if found, otherwise the default error string.
 */
const ProcessInput = (rawData) => {
  // Parse the input string into an integer, removing leading/trailing whitespace.
  const targetValue = parseInt(rawData.trim(), 10); // Base 10 specified for clarity

  // Initialize the final outcome with a default "not found" indicator.
  let finalOutcome = ':(';

  // Iterate from 1 up to the target value to find a match.
  for (let counter = 1; counter <= targetValue; counter++) {
    // Calculate a temporary value by multiplying the current counter by 1.08 and taking the floor.
    // This simulates a price calculation with a tax or markup.
    const calculatedPrice = Math.floor(counter * 1.08);

    // If the calculated price matches the target value, we've found our number.
    if (calculatedPrice === targetValue) {
      finalOutcome = counter; // Store the counter as the successful result.
      // No break here, as per Type II rules, to preserve original loop structure even if a match is found early.
      // The original code does not break, so we must not add a break.
    }
  }

  // Output the final result to the console.
  console.log(finalOutcome);

  // Also return the result for potential external use or testing.
  return finalOutcome;
};

// Read the input from standard input synchronously and pass it to the processing function.
// This part handles the environment-specific input mechanism.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
