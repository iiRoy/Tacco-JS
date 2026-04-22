// This utility function generates a sequence of numbers from startVal up to (but not including) endVal.
function span(startVal, endVal) {
  return Array.from(Array(endVal - startVal), (element, idx) => startVal + idx);
}

// The main execution block of the program, wrapped in an Immediately Invoked Function Expression (IIFE).
(function executeProgram() {
  // Read all input lines from standard input, process them, and store.
  const inputLines = require('node:fs').readFileSync('/dev/stdin', { encoding: 'utf8', flag: 'r' }).trim().split('\n');

  // Extract the total number of matrices from the first line of input.
  const numMatrices = Number(inputLines.shift());

  // Parse the matrix dimensions from the remaining input lines.
  // This involves taking the first part of each line, then the second part of the last line,
  // and converting all to numbers to form the dimension array.
  const matrixDimensions = inputLines
    .map(lineStr => lineStr.split(' ')[0])
    .concat([inputLines[numMatrices - 1].split(' ')[1]])
    .map(Number);

  // Initialize a 2D array to store the minimum multiplication costs.
  // The dimensions are (numMatrices + 1) x (numMatrices + 1).
  const minCostMatrix = Array.from(
    Array(numMatrices + 1),
    () => (new Array(numMatrices + 1).fill(0)) // Initialize inner arrays with 0 for direct diagonal access
  );

  // The cost of multiplying a single matrix by itself is zero.
  for (let rowIdx = 0; rowIdx < numMatrices + 1; rowIdx++) {
    minCostMatrix[rowIdx][rowIdx] = 0;
  }

  // Declare loop control variables.
  let currentStart = 0;
  let chainLength = 1;

  // Iterate over possible chain lengths (d in original)
  for (chainLength = 1; chainLength <= numMatrices - 1; chainLength++) {
    // Iterate over possible starting matrix indices (i in original)
    for (currentStart = 1; currentStart <= numMatrices - chainLength; currentStart++) {
      const currentEnd = currentStart + chainLength; // Calculate the ending index for the current chain

      // Compute the minimum cost for multiplying the matrix chain from currentStart to currentEnd.
      // This involves trying every possible split point 'splitPoint' within the chain.
      minCostMatrix[currentStart][currentEnd] = span(currentStart, currentEnd)
        .map(
          splitPoint =>
            minCostMatrix[currentStart][splitPoint] +
            minCostMatrix[splitPoint + 1][currentEnd] +
            matrixDimensions[currentStart - 1] *
            matrixDimensions[splitPoint] *
            matrixDimensions[currentEnd]
        )
        .sort((costA, costB) => costA - costB)[0]; // Select the minimum cost from all possible splits.
    }
  }

  // Output the final minimum cost for multiplying the entire chain of matrices (from index 1 to numMatrices).
  console.log(minCostMatrix[1][numMatrices]);
})(); // End of the main execution block.