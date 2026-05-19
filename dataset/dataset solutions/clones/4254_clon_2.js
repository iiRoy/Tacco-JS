'use strict';

/**
 * This function processes a numerical input to find a specific square value.
 * It determines the largest perfect square that is strictly less than the provided number.
 * @param {string} inputString The string representation of the number to be processed.
 */
function processInput(inputString) {
  // Convert the incoming string data into a numerical target for calculations.
  const targetValue = Number(inputString);

  // Initialize a variable to hold the current square being evaluated, starting from zero.
  let currentSquare = 0;
  // Initialize a counter variable, which will be the base for squaring operations.
  let counter = 0;

  // Begin a loop that continues as long as the current square is less than the target value.
  // The goal is to find the smallest 'counter' whose square is greater than or equal to 'targetValue'.
  while (currentSquare < targetValue) {
    // Increment the counter for the next iteration.
    counter += 1;
    // Calculate the square of the incremented counter.
    currentSquare = Math.pow(counter, 2);
  }

  // After the loop, 'counter' is the smallest integer such that counter^2 >= targetValue.
  // To find the largest perfect square *less than* targetValue, we need to use (counter - 1).
  const resultSquare = Math.pow(counter - 1, 2);

  // Output the final calculated square value to the standard console.
  console.log(resultSquare);
}

// Read the entire content from standard input, assuming it's UTF-8 encoded,
// and then pass this content as a string to our processing function.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
