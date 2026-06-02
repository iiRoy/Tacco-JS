"use strict";

/**
 * Processes raw input data to compute a minimum cost using dynamic programming.
 * This function reads a sequence of numbers and applies a specific cost calculation
 * based on parity and previous states.
 *
 * @param {string} rawInputContent - The complete input string, typically from standard input.
 */
function processData(rawInputContent) {
  // Divide the input string into separate lines.
  const inputLines = rawInputContent.split("\n");
  // The first line indicates the total count of subsequent data items.
  const sequenceLength = Number(inputLines[0]);

  // Initialize an array to hold the numeric values from the input.
  const numericSequence = [];
  // Iterate through the input lines, starting from the second line,
  // to populate the numeric sequence array.
  for (let index = 0; index < sequenceLength; index++) {
    numericSequence.push(Number(inputLines[index + 1]));
  }

  // Create a 2D array for dynamic programming.
  // It will have (sequenceLength + 1) rows and 5 columns.
  // Each cell is initially filled with 'null' as a placeholder.
  const dpTable = Array(sequenceLength + 1)
    .fill(null)
    .map(() => Array(5).fill(null));

  // Establish the initial state for the DP table at row 0.
  dpTable[0] = [0, 0, 0, 0, 0];

  // Iterate from the first data item up to the last, filling the DP table.
  for (let currentIdx = 1; currentIdx <= sequenceLength; currentIdx++) {
    // Retrieve the current numeric value from the sequence.
    let currentVal = numericSequence[currentIdx - 1];
    // Determine the 'even parity cost' for the current value.
    // If the value is 0, the cost is 2; otherwise, it's the value modulo 2.
    let evenParityCost = numericSequence[currentIdx - 1] === 0 ? 2 : currentVal % 2;
    // Determine the 'odd parity cost' for the current value.
    let oddParityCost = (currentVal + 1) % 2;

    // Calculate the values for the current row of the DP table based on
    // previous states and the calculated costs.
    dpTable[currentIdx][0] = dpTable[currentIdx - 1][0] + currentVal;
    dpTable[currentIdx][1] = Math.min(dpTable[currentIdx - 1][0], dpTable[currentIdx - 1][1]) + evenParityCost;
    dpTable[currentIdx][2] = Math.min(dpTable[currentIdx - 1][0], dpTable[currentIdx - 1][1], dpTable[currentIdx - 1][2]) + oddParityCost;
    dpTable[currentIdx][3] = Math.min(dpTable[currentIdx - 1][2], dpTable[currentIdx - 1][3]) + evenParityCost;
    dpTable[currentIdx][4] = Math.min(dpTable[currentIdx - 1][0], dpTable[currentIdx - 1][1], dpTable[currentIdx - 1][2], dpTable[currentIdx - 1][3], dpTable[currentIdx - 1][4]) + currentVal;
  }

  // Output the minimum value found in the final row of the DP table.
  console.log(Math.min(...dpTable[sequenceLength]));
}

// Read the entire content from standard input (usually a file) and
// then pass it to the main processing function.
processData(require("fs").readFileSync("/dev/stdin", "utf8"));
