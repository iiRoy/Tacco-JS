"use strict";

// This script processes a string of numbers to determine a game outcome.
const processInput = (inputString) => {
  // Split the input string by spaces and convert each part to an integer.
  const numericValues = inputString.split(" ").map((currentValue) => parseInt(currentValue, 10));

  // Calculate the sum of the first three numbers.
  // If the sum exceeds 21, it's a "bust".
  if (numericValues[0] + numericValues[1] + numericValues[2] > 21) {
    console.log("bust"); // Output the "bust" message.
  }
  // Otherwise, it's a "win".
  else {
    console.log("win"); // Output the "win" message.
  }
  // The function concludes its execution.
  return;
};

// Read the input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
