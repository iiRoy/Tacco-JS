"use strict";

// Entry point for processing financial input data.
const processCoinCombinations = (inputStringData) => {
  // Normalize input: remove leading/trailing whitespace, then split by newline.
  const inputLinesArray = inputStringData.trim().split(`
`);

  // Extract the maximum available counts for each coin denomination.
  const maxFiveHundreds = parseInt(inputLinesArray[0], 10);
  const maxOneHundreds = parseInt(inputLinesArray[1], 10);
  const maxFifties = parseInt(inputLinesArray[2], 10);

  // Retrieve the target monetary value to achieve.
  const targetValue = parseInt(inputLinesArray[3], 10);
  // Initialize a counter for successful combinations.
  let validCombinationCount = 0;

  // Outer loop: iterate through possible quantities of 500-unit coins.
  for (let currentFiveHundreds = 0; currentFiveHundreds <= maxFiveHundreds; currentFiveHundreds++) {
    // Middle loop: iterate through possible quantities of 100-unit coins.
    for (let currentOneHundreds = 0; currentOneHundreds <= maxOneHundreds; currentOneHundreds++) {
      // Inner loop: iterate through possible quantities of 50-unit coins.
      for (let currentFifties = 0; currentFifties <= maxFifties; currentFifties++) {
        // Calculate the total sum for the current coin combination.
        const currentSum = (500 * currentFiveHundreds) + (100 * currentOneHundreds) + (50 * currentFifties);

        // Check if the calculated sum matches the desired target value.
        if (currentSum === targetValue) {
          // If it matches, increment the counter for valid combinations.
          validCombinationCount++;
        }
      }
    }
  }

  // Display the total number of combinations that yield the target value.
  console.log(validCombinationCount);
};

// Acquire input from the standard input stream and pass it to the processing function.
processCoinCombinations(require('node:fs').readFileSync('/dev/stdin', 'utf8'));