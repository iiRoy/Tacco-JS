'use strict';

/*
 * This module processes a given input string to determine a specific outcome.
 * It parses numerical values and applies conditional logic.
 */
function processInput(inputString) {
  // First, we clean up the input string.
  // We take the first line, then split it by spaces, and convert each part to a number.
  const numericValues = inputString.split('\n')[0].split(' ').map(currentNumStr => Number(currentNumStr));

  // Extract individual numerical components from the parsed array.
  const firstVal = numericValues[0]; // Represents the 'x' value from the original problem.
  const secondVal = numericValues[1]; // Represents the 'a' value.
  const thirdVal = numericValues[2]; // Represents the 'b' value.

  // Initialize a variable to store the final message.
  let resultMessage = '';

  // Apply the core decision-making logic.
  if (secondVal >= thirdVal) {
    // If 'a' is greater than or equal to 'b', the situation is 'delicious'.
    resultMessage = 'delicious';
  } else if (firstVal >= (thirdVal - secondVal)) {
    // Otherwise, if 'x' is greater than or equal to the difference (b - a), it's 'safe'.
    resultMessage = 'safe';
  } else {
    // In all other cases, the situation is deemed 'dangerous'.
    resultMessage = 'dangerous';
  }

  // Output the determined message to the console.
  console.log(resultMessage);
}

// The program starts by reading input from standard input.
// It uses Node.js's 'fs' module to synchronously read the file.
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
