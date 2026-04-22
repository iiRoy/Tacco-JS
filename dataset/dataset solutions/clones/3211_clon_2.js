"use strict";
function processInputData(rawData)
{
  // Split the entire input string by newline characters to get individual lines
  const dataLines = rawData.split('\n');

  // The first line contains the length of the number sequence
  const sequenceLength = Number(dataLines[0]);

  // Initialize an array to store the parsed numerical values
  const numericalValues = [ ];

  // Populate the numericalValues array from the input lines
  for (let k = 0; k < sequenceLength; k++) {
    numericalValues.push( Number(dataLines[k + 1]) );
  }
  
  // Create a 2D array (dynamic programming table)
  // The table dimensions are (sequenceLength + 1) rows by 5 columns
  const costMatrix = Array(sequenceLength + 1).fill().map(() => Array(5).fill(undefined));

  // Set the base case for the DP table (row 0)
  costMatrix[0] = [ 0, 0, 0, 0, 0 ];

  // Iterate through the sequence to fill the DP table
  for (let rowIdx = 1; rowIdx <= sequenceLength; rowIdx++)
  {
    let currentVal = numericalValues[rowIdx - 1]; // Get the current number from the sequence

    // Calculate cost factor based on current number's parity for "even" states
    let evenCostFactor = numericalValues[rowIdx - 1] === 0 ? 2 : currentVal % 2;

    // Calculate cost factor based on current number's parity for "odd" states
    let oddCostFactor = (currentVal + 1) % 2;

    // Update state 0: simple sum with current value
    costMatrix[rowIdx][0] = costMatrix[rowIdx - 1][0] + currentVal;

    // Update state 1: minimum of previous state 0 or 1, plus even cost factor
    costMatrix[rowIdx][1] = Math.min(costMatrix[rowIdx - 1][0], costMatrix[rowIdx - 1][1]) + evenCostFactor;

    // Update state 2: minimum of previous state 0, 1, or 2, plus odd cost factor
    costMatrix[rowIdx][2] = Math.min(costMatrix[rowIdx - 1][0], costMatrix[rowIdx - 1][1], costMatrix[rowIdx - 1][2]) + oddCostFactor;

    // Update state 3: minimum of previous state 2 or 3, plus even cost factor
    costMatrix[rowIdx][3] = Math.min(costMatrix[rowIdx - 1][2], costMatrix[rowIdx - 1][3]) + evenCostFactor;

    // Update state 4: minimum of all previous states, plus current value
    costMatrix[rowIdx][4] = Math.min(costMatrix[rowIdx - 1][0], costMatrix[rowIdx - 1][1], costMatrix[rowIdx - 1][2], costMatrix[rowIdx - 1][3], costMatrix[rowIdx - 1][4]) + currentVal;
  }

  // Output the minimum value from the last row of the DP table
  console.log(Math.min(...costMatrix[sequenceLength]));
}


processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));