function generateSequence(startVal, endVal) {
  // This function creates an array of numbers from startVal (inclusive) to endVal (exclusive).
  return Array.from(Array(endVal - startVal), (_, idx) => startVal + idx);
}

(function executeProgram() {
  // Read input from standard input, process it, and split into lines.
  const inputDataLines = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // The first line contains the size of the matrix chain.
  const matrixSize = Number(inputDataLines.shift());

  // Parse the dimensions of the matrices.
  // The 'p' array will store p0, p1, ..., pn.
  // The first part extracts p0 to p(n-1) from the first column of each line.
  // The last part appends pn from the second column of the last line.
  const dimensionsArray = inputDataLines
    .map(currentLine => currentLine.split(' ')[0])
    .concat([inputDataLines[matrixSize - 1].split(' ')[1]])
    .map(Number);

  // Initialize a 2D array (matrix) to store minimum scalar multiplications.
  // The matrix will be of size (matrixSize + 1) x (matrixSize + 1).
  const minCostMatrix = Array.from(Array(matrixSize + 1), () => (Array(matrixSize + 1)));

  // Initialize diagonal elements to 0, as multiplying a single matrix costs nothing.
  for (let rowIdx = 0; rowIdx < matrixSize + 1; rowIdx++) {
    minCostMatrix[rowIdx][rowIdx] = 0;
  }

  // Variables for loop control.
  let rowIdx = 0, diagonalOffset = 1;

  // Iterate over the chain length (diagonalOffset).
  // diagonalOffset represents the number of matrices in the subchain minus one.
  for (diagonalOffset = 1; diagonalOffset <= matrixSize - 1; diagonalOffset++) {
    // Iterate over the starting index of the subchain (rowIdx).
    for (rowIdx = 1; rowIdx <= matrixSize - diagonalOffset; rowIdx++) {
      // Calculate the ending index of the subchain.
      const endIdx = rowIdx + diagonalOffset;

      // For each subchain, find the optimal split point.
      // The generateSequence function creates an array of possible split points 'splitPoint'.
      // For each splitPoint, calculate the cost and find the minimum.
      minCostMatrix[rowIdx][endIdx] = generateSequence(rowIdx, endIdx)
        .map(splitPoint => {
          // Cost = cost of left subchain + cost of right subchain + cost of multiplying the two resulting matrices.
          return minCostMatrix[rowIdx][splitPoint] +
                 minCostMatrix[splitPoint + 1][endIdx] +
                 dimensionsArray[rowIdx - 1] * dimensionsArray[splitPoint] * dimensionsArray[endIdx];
        })
        // Sort the calculated costs in ascending order and pick the smallest one.
        .sort((valA, valB) => valA - valB)[0];
    }
  }

  // The final result is the minimum cost to multiply the entire chain of matrices,
  // stored at minCostMatrix[1][matrixSize].
  console.log(minCostMatrix[1][matrixSize]);
})();
