"use strict";

/*
 * This script determines the number of ways to achieve a specific total amount
 * using a given number of 500-yen, 100-yen, and 50-yen coins.
 */
function CalculateCoinCombinations(rawInputString) {
  // Parse the input string into individual lines.
  const inputLines = rawInputString.trim().split('\n');

  // Extract the maximum available counts for each coin denomination
  // and the target sum from the parsed input.
  const max500YenCoins = Number(inputLines[0]);
  const max100YenCoins = Number(inputLines[1]);
  const max50YenCoins = Number(inputLines[2]);
  const desiredTotal = Number(inputLines[3]);

  // Initialize a counter for the number of valid combinations found.
  let possibleWays = 0;

  // Iterate through all possible counts for 500-yen coins.
  for (let num500 = 0; num500 <= max500YenCoins; ++num500) {
    // For each 500-yen coin count, iterate through all possible 100-yen coin counts.
    for (let num100 = 0; num100 <= max100YenCoins; ++num100) {
      // For each combination of 500-yen and 100-yen coins,
      // iterate through all possible 50-yen coin counts.
      for (let num50 = 0; num50 <= max50YenCoins; ++num50) {
        // Calculate the current sum for the chosen coin combination.
        let currentTotal = (500 * num500) + (100 * num100) + (50 * num50);

        // If the current sum matches the desired total, increment the counter.
        if (desiredTotal === currentTotal) {
          possibleWays++;
        }
      }
    }
  }

  // Output the final count of possible combinations to the console.
  console.log(possibleWays);
}

// Read input from standard input and pass it to the main processing function.
CalculateCoinCombinations(require("fs").readFileSync("/dev/stdin", "utf8"));
