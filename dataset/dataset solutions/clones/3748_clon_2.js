'use strict'; // Activate strict mode for improved code quality

/**
 * Analyzes a given input string to evaluate a specific numerical condition.
 * This function expects the input to contain two space-separated integer values.
 *
 * @param {string} rawData - The unprocessed string input, e.g., "5 7".
 */
function ProcessInput(rawData) {
  // Extract the first numerical component from the input string.
  // The string is split by space, and the first element is converted to a number.
  const firstVal = Number(rawData.split(' ')[0]);

  // Extract the second numerical component from the input string.
  // The string is split by space, and the second element is converted to a number.
  const secondVal = Number(rawData.split(' ')[1]);

  // Evaluate if both extracted numbers are less than or equal to eight.
  if (firstVal <= 8 && secondVal <= 8) {
    // If the condition holds true for both values, output a positive affirmation.
    console.log('Yay!');
  } else {
    // Otherwise, if the condition is not met, output a negative sentiment.
    console.log(':(');
  }
}

// The program's entry point:
// It reads the entire content from standard input,
// decodes it as UTF-8, removes any leading/trailing whitespace,
// and then passes the cleaned string to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim());
