"use strict";

/*
 * This module processes some input data.
 */
const processInput = (inputData) => {
  // Clean up the raw input string and split it into lines.
  inputData = inputData.trim().split("\n");

  // Parse the first line as an integer.
  const numberValue = parseInt(inputData[0]);

  // Calculate the cube of the obtained number and print it to the console.
  console.log(numberValue * numberValue * numberValue);
};

// Read data from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
