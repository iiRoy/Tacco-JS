"use strict";

// This script processes some input data
const processInput = (inputData) => {
  // Trim whitespace and split the input into lines
  inputData = inputData.trim().split("\n");

  // Parse the first line for two integer values
  const firstLineParts = inputData[0].split(" ");
  const numElements = parseInt(firstLineParts[0]); // Represents N
  const groupSize = parseInt(firstLineParts[1]);   // Represents K

  // Parse the second line into an array of integers
  const elementArray = inputData[1].split(" ").map((currentNum) => parseInt(currentNum)); // Represents A

  // Calculate and print the result based on the formula
  // The formula is (N - 1 + K - 2) / (K - 1)
  console.log((numElements - 1 + groupSize - 2) / (groupSize - 1));
};

// Read input from standard input and pass it to the processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
