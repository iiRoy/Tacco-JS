"use strict"; // Enforce strict mode for cleaner code

/**
 * Computes all possible sums from subsets of a given array of numbers,
 * then checks if a list of query targets can be formed by these sums.
 *
 * @param {number} itemCount - The number of elements in the itemValues array.
 * @param {number[]} itemValues - An array of numbers from which subsets sums are generated.
 * @param {number} queryCount - The number of elements in the queryTargets array.
 * @param {number[]} queryTargets - An array of numbers to check against the generated sums.
 * @returns {string[]} An array of strings, "yes" if a query target is found, "no" otherwise.
 */
const computeSolutions = (itemCount, itemValues, queryCount, queryTargets) => {
  // This array will store all unique sums that can be formed from subsets of itemValues.
  const possibleSums = [];

  // Iterate through all possible subsets using a bitmask approach.
  // A bitmask from 0 to (2^itemCount - 1) represents each subset.
  for (let combinationMask = 0; combinationMask < (1 << itemCount); combinationMask++) {
    let currentSum = 0; // Initialize sum for the current subset.

    // Check each element of itemValues to see if it's included in the current subset.
    for (let idx = 0; idx < itemCount; idx++) {
      // If the idx-th bit is set in the combinationMask, include itemValues[idx] in the sum.
      if (combinationMask & (1 << idx)) {
        currentSum = currentSum + itemValues[idx];
      }
    }

    // Only add non-zero sums to the list of possible sums.
    // This implicitly handles the empty set sum (which is 0) by not adding it.
    if (currentSum !== 0) {
      possibleSums.push(currentSum);
    }
  }

  // Prepare an array to store the "yes" or "no" outcomes for each query.
  const outcomeList = [];

  // For each query target, check if it exists in the list of possible sums.
  for (let queryIdx = 0; queryIdx < queryCount; queryIdx++) {
    if (possibleSums.indexOf(queryTargets[queryIdx]) !== -1) {
      outcomeList.push("yes"); // Target found among possible sums.
    } else {
      outcomeList.push("no"); // Target not found.
    }
  }

  return outcomeList; // Return the list of outcomes.
};

// Global variables to store input data as it's read line by line.
let lineCounter = 0;
let totalItems = 0;
let itemNumbers = null;
let totalQueries = 0;
let queryNumbers = null;

// Set up the readline interface to process input from standard input.
const inputProcessor = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Event listener for each line of input received.
inputProcessor.on("line", (inputLine) => {
  lineCounter++; // Increment the line counter for tracking input stages.

  if (lineCounter === 1) {
    // First line: number of items (N)
    totalItems = Number(inputLine);
  } else if (lineCounter === 2) {
    // Second line: space-separated item values (A)
    itemNumbers = inputLine.trim().split(" ").map(valStr => Number(valStr));
  } else if (lineCounter === 3) {
    // Third line: number of queries (Q)
    totalQueries = Number(inputLine);
  } else {
    // Fourth line (and final input for this problem): space-separated query targets (M)
    queryNumbers = inputLine.trim().split(" ").map(targetStr => Number(targetStr));

    // Once all input is received, call the main solver function.
    const finalOutcomes = computeSolutions(totalItems, itemNumbers, totalQueries, queryNumbers);

    // Output the results, one per line.
    for (let outputIndex = 0; outputIndex < finalOutcomes.length; outputIndex++) {
      console.log(finalOutcomes[outputIndex]);
    }

    // Terminate the process after all output is printed.
    process.exit(0);
  }
});
