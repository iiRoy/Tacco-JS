"use strict";

/**
 * This function processes an array of input strings to calculate a specific combinatorial sum.
 * It computes combinations (nCr) and then subtracts two specific combination values from the total sum.
 * The final result is then taken modulo (10^9 + 7).
 * @param {string[]} rawData - An array of strings, where the first element contains space-separated numbers.
 */
function processInput(rawData) {
  // Parse the initial line of input containing N, A, and B.
  let parsedLine = rawData[0].trim().split(" ");
  let totalElements = parseInt(parsedLine[0]); // Represents 'n'
  let firstExclusion = parseInt(parsedLine[1]); // Represents 'a'
  let secondExclusion = parseInt(parsedLine[2]); // Represents 'b'

  // Initialize variables for calculating combinations.
  let denominatorVal = 1; // Corresponds to 'bunbo'
  let numeratorVal = 1;   // Corresponds to 'bunshi'

  // Array to store combination values (nCr for r from 0 to n-1).
  let combinationsArr = []; // Corresponds to 'kumi'
  let totalCombinations = 0; // Corresponds to 'sum'

  // Loop to calculate nCr for r from 1 to n.
  // The loop calculates nC1, nC2, ..., nCn.
  for (let idx = 1; idx < totalElements + 1; idx++) {
    // Update numerator for nCr calculation: n * (n-1) * ... * (n-r+1)
    numeratorVal *= (totalElements + 1 - idx);
    // Update denominator for nCr calculation: r!
    denominatorVal *= idx;
    // Store the current combination value (nCr).
    combinationsArr[idx - 1] = numeratorVal / denominatorVal;
    // Add the current combination to the running total.
    totalCombinations += combinationsArr[idx - 1];
  }

  // Subtract the combination corresponding to 'a' from the total.
  totalCombinations -= combinationsArr[firstExclusion - 1];

  // Subtract the combination corresponding to 'b' from the total.
  totalCombinations -= combinationsArr[secondExclusion - 1];

  // Output the final sum modulo (10^9 + 7).
  console.log(totalCombinations % (Math.pow(10, 9) + 7));
}

// Read input from standard input, process it, and pass to the main function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8').trim().split("\n"));
