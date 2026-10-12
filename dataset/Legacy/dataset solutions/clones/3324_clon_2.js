'use strict';
(function(rawData){
  // Normalize and parse the incoming data stream
  rawData = rawData.trim().split(/\n/);

  // Extract the primary problem dimension
  const problemSize = rawData[0] - 0;

  // Parse the array of probability values
  const probabilities = rawData[1].split(/\s+/).map(element => element - 0);

  // Initialize a 2D array for dynamic programming.
  // The dimensions are adjusted to handle specific indexing requirements.
  const memoTable = new Array(problemSize + 3).fill(0).map((_unused, rowIdx) => new Array(rowIdx + 1).fill(0));

  // Establish the initial condition for the DP table.
  memoTable[2][1] = 1;

  // Iterate through the table to compute probabilities based on the recurrence relation.
  for (let outerIdx = 3; outerIdx <= problemSize + 2; outerIdx++) {
    for (let innerIdx = 1; innerIdx <= outerIdx - 1; innerIdx++) {
      // The core recurrence: P(i, j) = p[i-3]*P(i-1, j-1) + (1-p[i-3])*P(i-1, j)
      memoTable[outerIdx][innerIdx] = probabilities[outerIdx - 3] * memoTable[outerIdx - 1][innerIdx - 1] + (1 - probabilities[outerIdx - 3]) * memoTable[outerIdx - 1][innerIdx];
    }
  }

  // Aggregate the final result by summing relevant entries from the DP table.
  let finalResult = 0;
  for (let innerIdx = (problemSize + 3) / 2; innerIdx <= problemSize + 1; innerIdx++) {
    finalResult += memoTable[problemSize + 2][innerIdx];
  }

  // Display the calculated outcome.
  console.log(finalResult);
})(require('fs').readFileSync('/dev/stdin', 'utf8'));
