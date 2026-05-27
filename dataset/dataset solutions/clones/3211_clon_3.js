"use strict";

// Helper function to find the minimum value from a list of numbers.
// This encapsulates the Math.min logic, making the DP transitions slightly cleaner.
const findMinimumOfValues = (...values) => Math.min(...values);

function calculateMinimumCost(rawInputString) {
  // Split the raw input string into an array of lines.
  const inputLines = rawInputString.split("\n");
  
  // The first line contains the length of the sequence.
  const sequenceLength = Number(inputLines[0]);

  // Initialize an array to store the numeric values from the input.
  const numberSequence = [];
  
  // Populate the numberSequence array, starting from the second line of input.
  for (let currentIndex = 0; currentIndex < sequenceLength; currentIndex++) {
    const lineData = inputLines[currentIndex + 1];
    numberSequence.push(Number(lineData));
  }

  // Initialize the dynamic programming table.
  // It will have (sequenceLength + 1) rows and 5 columns.
  // Each cell is initially filled with null, then dp[0] is set, and subsequent cells are computed.
  const costTable = Array(sequenceLength + 1).fill(null).map(() => Array(5).fill(null));
  
  // Set the base case for the first row (index 0) of the DP table.
  // All states at index 0 have a cost of 0.
  costTable[0] = [0, 0, 0, 0, 0];

  // Iterate through the sequence to fill the DP table from row 1 up to sequenceLength.
  for (let currentIndex = 1; currentIndex <= sequenceLength; currentIndex++) {
    // Get the current element's value from the number sequence.
    const currentElementValue = numberSequence[currentIndex - 1];

    // Calculate specific costs based on the current element's parity.
    // costForEven: If currentElementValue is 0, cost is 2. Otherwise, it's currentElementValue % 2.
    const costForEven = currentElementValue === 0 ? 2 : currentElementValue % 2;
    // costForOdd: If currentElementValue is even, cost is 1. If odd, cost is 0.
    // This is an equivalent rewrite of (currentElementValue + 1) % 2.
    const costForOdd = 1 - (currentElementValue % 2); 

    // Retrieve all cost values from the previous row (currentIndex - 1) for calculations.
    const previousRowCosts = costTable[currentIndex - 1];
    const prevCostState0 = previousRowCosts[0];
    const prevCostState1 = previousRowCosts[1];
    const prevCostState2 = previousRowCosts[2];
    const prevCostState3 = previousRowCosts[3];
    const prevCostState4 = previousRowCosts[4];

    // Calculate the costs for the current row (currentIndex) based on previous row costs and current element.
    // State 0: Add current element value to previous state 0 cost.
    costTable[currentIndex][0] = prevCostState0 + currentElementValue;

    // State 1: Minimum of previous state 0 and 1, plus costForEven.
    // Split Math.min for intermediate step.
    const minPrev01 = findMinimumOfValues(prevCostState0, prevCostState1);
    costTable[currentIndex][1] = minPrev01 + costForEven;

    // State 2: Minimum of previous state 0, 1, and 2, plus costForOdd.
    // Reuse minPrev01 for efficiency and clarity.
    const minPrev012 = findMinimumOfValues(minPrev01, prevCostState2);
    costTable[currentIndex][2] = minPrev012 + costForOdd;

    // State 3: Minimum of previous state 2 and 3, plus costForEven.
    const minPrev23 = findMinimumOfValues(prevCostState2, prevCostState3);
    costTable[currentIndex][3] = minPrev23 + costForEven;

    // State 4: Minimum of all previous states (0, 1, 2, 3, 4), plus current element value.
    costTable[currentIndex][4] = findMinimumOfValues(prevCostState0, prevCostState1, prevCostState2, prevCostState3, prevCostState4) + currentElementValue;
  }

  // The final answer is the minimum cost found in the last row of the DP table.
  console.log(findMinimumOfValues(...costTable[sequenceLength]));
}

// Read input from standard input using Node.js 'fs' module and execute the main logic.
calculateMinimumCost(require("fs").readFileSync("/dev/stdin", "utf8"));
