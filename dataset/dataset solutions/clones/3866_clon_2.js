function ProcessInput(inputLines) {
  // The input string is first split into individual lines.
  inputLines = inputLines.split("\n");

  // The first line of input provides the dimension for our operations.
  const dimension = +inputLines[0];

  // An array is initialized to hold processed string data.
  let stringMatrix = [];

  // This loop populates the stringMatrix. Each relevant input line (from index 1 to 'dimension')
  // is duplicated and stored at two positions: 'idx' and 'idx + dimension'.
  for (let rowIdx = 0; rowIdx < dimension; rowIdx++) {
    stringMatrix[rowIdx + dimension] = stringMatrix[rowIdx] = inputLines[rowIdx + 1] + inputLines[rowIdx + 1];
  }

  // A variable to accumulate the total count of symmetric configurations.
  let totalCount = 0;

  // Nested loops iterate through all possible starting row and column offsets
  // within the given dimension.
  for (let rowIdx = 0; rowIdx < dimension; rowIdx++) {
    for (let colIdx = 0; colIdx < dimension; colIdx++) {
      // For each pair of offsets, a symmetry check is performed, and its result is added to the total count.
      totalCount += checkSymmetry(rowIdx, colIdx);
    }
  }

  // The final accumulated count is printed to the console.
  console.log(totalCount);

  /**
   * Determines if a sub-matrix, defined by the given offsets, exhibits symmetry.
   * @param {number} rowOffset - The starting row index offset for the sub-matrix.
   * @param {number} colOffset - The starting column index offset for the sub-matrix.
   * @returns {number} Returns 1 if the sub-matrix is symmetric, otherwise returns 0.
   */
  function checkSymmetry(rowOffset, colOffset) {
    // This nested loop iterates through all unique pairs of indices (firstIdx, secondIdx)
    // such that firstIdx is less than secondIdx.
    for (let firstIdx = 0; firstIdx < dimension; firstIdx++) {
      for (let secondIdx = firstIdx + 1; secondIdx < dimension; secondIdx++) {
        // It compares characters at mirrored positions within the stringMatrix,
        // adjusted by the provided row and column offsets.
        // If any pair of characters does not match, the sub-matrix is not symmetric.
        if (stringMatrix[firstIdx + rowOffset][secondIdx + colOffset] !== stringMatrix[secondIdx + colOffset][firstIdx + rowOffset]) {
          return 0; // Asymmetry detected, return 0 immediately.
        }
      }
    }
    return 1; // If all pairs are symmetric, return 1.
  }
}

// The main processing function is invoked with content read from standard input.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
