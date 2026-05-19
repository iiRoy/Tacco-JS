const processingSettings = {
  sourcePath: '/dev/stdin', // Path to the input file for data acquisition
  lineDelimiter: '\n' // Character sequence indicating a new line in the input
};

// Read the input file, convert to ASCII, remove leading/trailing whitespace, and split into an array of lines.
let matrixData = require('fs').readFileSync(processingSettings.sourcePath, 'ascii')
  .trim()
  .split(processingSettings.lineDelimiter);

// Process each line: split by space and convert elements to numbers.
matrixData = matrixData.map(
  function (currentLine) {
    // Each line becomes an array of numbers.
    return currentLine.split(' ').map(Number);
  });

// The first element of the first line determines the dimension of the problem.
const dimension = matrixData[0][0];

// Initialize a 2D object (acting as a map for minimum costs).
const minimumCosts = {};

// Populate the outer level of the minimumCosts object.
for (let idxA = 1; idxA <= dimension; idxA++) {
  minimumCosts[idxA] = {};
}

// Base case: The cost from a point to itself is zero.
for (let idxA = 1; idxA <= dimension; idxA++) {
  minimumCosts[idxA][idxA] = 0;
}

// Dynamic programming approach to calculate minimum costs.
// Iterate over chain lengths (from 1 up to n-1).
for (let chainLength = 1; chainLength < dimension; chainLength++) {
  // Iterate over starting points of the chain.
  for (let startIdx = 1, endIdx = 1 + chainLength; endIdx <= dimension; startIdx++, endIdx++) {
    // Initialize the minimum cost for the current subproblem to a very large value.
    minimumCosts[startIdx][endIdx] = Number.MAX_VALUE;

    // Iterate over all possible split points within the current chain.
    for (let splitPoint = startIdx; splitPoint < endIdx; splitPoint++) {
      // Calculate the cost for the current split and update if it's smaller.
      // The formula represents matrix chain multiplication cost:
      // M[i][0] * M[k][1] * M[j][1] + cost(i, k) + cost(k+1, j)
      const currentCost = matrixData[startIdx][0] * matrixData[splitPoint][1] * matrixData[endIdx][1] +
                          minimumCosts[startIdx][splitPoint] +
                          minimumCosts[splitPoint + 1][endIdx];

      minimumCosts[startIdx][endIdx] = Math.min(
        minimumCosts[startIdx][endIdx],
        currentCost
      );
    }
  }
}

// Output the final minimum cost for the entire chain (from 1 to n).
console.log(minimumCosts[1][dimension]);
