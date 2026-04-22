const createNumericSeries = (startValue, endLimit) => {
  // A utility function to generate an array of numbers from startValue (inclusive)
  // up to endLimit (exclusive). Returns an empty array if the range is invalid.
  if (startValue >= endLimit) {
    return []; // Guard clause: invalid or empty range
  }

  const seriesLength = endLimit - startValue;
  const resultSeries = new Array(seriesLength); // Pre-allocate array for potential performance benefits

  // Populate the array with the desired sequence of integers
  for (let currentOffset = 0; currentOffset < seriesLength; currentOffset++) {
    resultSeries[currentOffset] = startValue + currentOffset;
  }
  return resultSeries;
};

// This self-executing anonymous function encapsulates the logic for calculating
// the minimum cost of matrix chain multiplication using dynamic programming.
(function calculateMinMatrixMultiplicationCost() {
  // Define a constant for the standard input file path
  const STANDARD_INPUT_FILE = '/dev/stdin';
  // Explicitly require the 'fs' (file system) module
  const fsModule = require('fs');

  // Read the entire input from standard input, decode as UTF-8, trim whitespace,
  // and split into an array of individual lines.
  const rawInputContent = fsModule.readFileSync(STANDARD_INPUT_FILE, 'utf8').trim();

  // --- Input Validation and Parsing ---
  // Ensure that some input data was actually received.
  if (!rawInputContent) {
    console.error("Error: No input data was provided from standard input.");
    process.exit(1); // Terminate with an error code
  }

  const inputDataLines = rawInputContent.split('\n');

  // The first line of input specifies the total number of matrices 'N'.
  // We extract this and convert it to a number.
  const numberOfMatrices = Number(inputDataLines.shift());

  // Validate the 'numberOfMatrices' value. It must be a positive integer.
  if (isNaN(numberOfMatrices) || numberOfMatrices <= 0) {
    console.error("Error: The first line must specify a positive integer for the number of matrices.");
    process.exit(1);
  }

  // After shifting the first line, the remaining lines should correspond to the matrix dimensions.
  // There should be 'numberOfMatrices' lines, each detailing a pair of dimensions.
  if (inputDataLines.length !== numberOfMatrices) {
      console.error(`Error: Expected ${numberOfMatrices} lines describing matrix dimensions, but found ${inputDataLines.length}.`);
      process.exit(1);
  }

  // Parse matrix dimensions into a single array.
  // For 'N' matrices, there are 'N+1' dimensions (P_0, P_1, ..., P_N).
  // Input format: P_0 P_1 \n P_1 P_2 \n ... \n P_{N-1} P_N
  // We extract P_0, P_1, ..., P_{N-1} from the first elements of each line,
  // then append P_N from the second element of the last line.
  const matrixDimensionsArray = inputDataLines
    .map(lineStr => parseInt(lineStr.split(' ')[0], 10)) // Extract the first dimension (P_i)
    .concat([parseInt(inputDataLines[numberOfMatrices - 1].split(' ')[1], 10)]); // Append the very last dimension (P_N)

  // Final validation for the parsed dimension array.
  if (matrixDimensionsArray.some(isNaN)) {
      console.error("Error: One or more matrix dimensions could not be parsed into valid numbers.");
      process.exit(1);
  }
  if (matrixDimensionsArray.length !== numberOfMatrices + 1) {
      console.error(`Error: The dimension array has an unexpected length. Expected ${numberOfMatrices + 1}, got ${matrixDimensionsArray.length}.`);
      process.exit(1);
  }

  // --- Dynamic Programming Table Initialization ---
  // Create a 2D array (DP table) to store the minimum costs.
  // dpTable[i][j] will hold the minimum scalar multiplications needed to compute
  // the product of matrices A_i through A_j.
  // The table size is (numberOfMatrices + 1) x (numberOfMatrices + 1) to allow for 1-based indexing.
  const dpCostTable = [];
  const tableDimension = numberOfMatrices + 1;

  // Initialize the DP table:
  // - dpCostTable[i][i] is 0, as multiplying a single matrix requires no operations.
  // - Other cells are initialized to Infinity, representing an uncalculated or very high cost.
  for (let rowIndex = 0; rowIndex < tableDimension; rowIndex++) {
    dpCostTable[rowIndex] = new Array(tableDimension).fill(Infinity); // Initialize all costs to a large number
    dpCostTable[rowIndex][rowIndex] = 0; // Cost for a single matrix chain (length 1) is zero
  }

  // --- Main Dynamic Programming Calculation Loop ---
  // The outer loop iterates through possible 'chain lengths' (or subproblem sizes).
  // 'currentChainLength' (analogous to 'd' in common algorithms) varies from 1 to numberOfMatrices - 1.
  for (let currentChainLength = 1; currentChainLength < numberOfMatrices; currentChainLength++) {
    // The inner loop iterates through all possible starting indices for a chain of 'currentChainLength'.
    // 'startMatrixIndex' (analogous to 'i') varies from 1 up to (numberOfMatrices - currentChainLength).
    for (let startMatrixIndex = 1; startMatrixIndex <= numberOfMatrices - currentChainLength; startMatrixIndex++) {
      // Calculate the ending index for the current matrix chain (A_startMatrixIndex ... A_endMatrixIndex).
      const endMatrixIndex = startMatrixIndex + currentChainLength;

      // Now, iterate through all possible 'split points' (partitionIndex, analogous to 'k')
      // within the current chain (A_startMatrixIndex ... A_endMatrixIndex).
      // A split point 'k' means we are considering multiplying (A_i...A_k) then (A_{k+1}...A_j).
      // The split point 'k' can range from 'startMatrixIndex' to 'endMatrixIndex - 1'.
      const potentialSplitPoints = createNumericSeries(startMatrixIndex, endMatrixIndex);

      // Calculate the cost for each possible split and collect them.
      const individualSplitCosts = potentialSplitPoints.map(partitionIndex => {
        // The cost for a specific split is:
        // Cost(A_i...A_k) + Cost(A_{k+1}...A_j) + Cost of multiplying the two resulting matrices.
        // The cost of multiplying two matrices of dimensions (P_{i-1} x P_k) and (P_k x P_j) is P_{i-1} * P_k * P_j.
        const costOfLeftSubproblem = dpCostTable[startMatrixIndex][partitionIndex];
        const costOfRightSubproblem = dpCostTable[partitionIndex + 1][endMatrixIndex];
        const costOfFinalMultiplication =
          matrixDimensionsArray[startMatrixIndex - 1] *
          matrixDimensionsArray[partitionIndex] *
          matrixDimensionsArray[endMatrixIndex];

        return costOfLeftSubproblem + costOfRightSubproblem + costOfFinalMultiplication;
      });

      // The minimum cost for the current chain (A_startMatrixIndex ... A_endMatrixIndex)
      // is the minimum value among all calculated 'individualSplitCosts'.
      // Using Math.min(...array) is a concise way to find the minimum in an array.
      dpCostTable[startMatrixIndex][endMatrixIndex] = Math.min(...individualSplitCosts);
    }
  }

  // --- Result Output ---
  // The final answer is stored in dpCostTable[1][numberOfMatrices], representing the
  // minimum cost to multiply the entire chain of matrices from the first to the last.
  const totalMinMultiplicationCost = dpCostTable[1][numberOfMatrices];

  // Print the calculated minimum cost to standard output.
  console.log(totalMinMultiplicationCost);

})(); // End of the IIFE