"use strict";

// This function processes the input string to find combinations of coins.
const processInput = (inputString) => {
  // Clean up the input and split it into individual lines.
  let processedLines = inputString.trim().split("\n");

  // Parse the maximum counts for each coin denomination.
  const countOfFiveHundredYen = ~~processedLines[0]; // Max 500-yen coins
  const countOfOneHundredYen = ~~processedLines[1]; // Max 100-yen coins
  const countOfFiftyYen = ~~processedLines[2]; // Max 50-yen coins

  // Parse the target total sum.
  const desiredTotalSum = ~~processedLines[3];

  // Initialize a counter for valid combinations.
  let numberOfValidCombinations = 0;

  // Iterate through all possible counts of 500-yen coins.
  for (let currentFiveHundred = 0; currentFiveHundred <= countOfFiveHundredYen; currentFiveHundred++) {
    // Iterate through all possible counts of 100-yen coins.
    for (let currentOneHundred = 0; currentOneHundred <= countOfOneHundredYen; currentOneHundred++) {
      // Iterate through all possible counts of 50-yen coins.
      for (let currentFifty = 0; currentFifty <= countOfFiftyYen; currentFifty++) {
        // Calculate the current sum for this combination.
        const currentSum = (500 * currentFiveHundred) + (100 * currentOneHundred) + (50 * currentFifty);

        // Check if the current sum matches the desired total.
        if (currentSum === desiredTotalSum) {
          // If it matches, increment the counter.
          numberOfValidCombinations++;
        }
      }
    }
  }

  // Output the final count of valid combinations.
  console.log(numberOfValidCombinations);
};

// Read input from standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
