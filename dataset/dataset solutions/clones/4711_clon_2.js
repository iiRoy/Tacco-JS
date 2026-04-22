/* This file contains logic for a simple comparison game. */

'use strict'; // Enforce stricter parsing and error handling.

// A utility function to modify specific numeric inputs.
const adjustScore = (currentVal) => {
  // If the input value is '1', it gets a special high score.
  if (currentVal == 1) {
    return 14; // Assign a new, higher value.
  } else {
    // Otherwise, convert to number and return the original value.
    // The subtraction by zero implicitly converts the string to a number.
    return currentVal - 0;
  }
}; // End of adjustScore helper function.

/**
 * Main program entry point.
 * Processes raw input data to determine a winner.
 * @param {string} rawData - A string containing two space-separated numbers.
 */
function runComparison(rawData) {
  // First, split the incoming string by spaces to get individual scores.
  let scoreParts = rawData.split(' ');

  // Process the first part of the input.
  const firstPlayerScore = adjustScore(scoreParts[0]);

  // Process the second part of the input.
  const secondPlayerScore = adjustScore(scoreParts[1]);

  // Compare the adjusted scores to determine the outcome.
  if (firstPlayerScore === secondPlayerScore) {
    // If scores are identical, it's a draw.
    return console.log('Draw');
  }

  // If not a draw, check who has the higher score.
  if (firstPlayerScore > secondPlayerScore) {
    // Player one wins.
    console.log('Alice');
  } else {
    // Player two wins.
    console.log('Bob');
  }
} // End of runComparison function.


// Invoke the main comparison logic using data from standard input.
runComparison(
  require("fs")
  .readFileSync("/dev/stdin", "utf8")
);