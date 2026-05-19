"use strict";

// This script processes some input data.
const processInput = (inputData) => {
  // First, clean up the input string by removing leading/trailing whitespace
  // and then splitting it into an array of lines.
  inputData = inputData.trim().split("\n");

  // Parse the first line as an integer.
  const numericValue = parseInt(inputData[0]);
  // Get the second line as a string.
  const stringValue = inputData[1];

  // Based on a condition, output either the string value or a fixed string.
  // The condition checks if the numeric value is greater than or equal to 3200.
  console.log(numericValue >= 3200 ? stringValue : "red");
};

// Read input from standard input synchronously and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
