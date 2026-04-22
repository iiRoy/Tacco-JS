const systemConfig = {
  dataSourcePath: '/dev/stdin', // Default input source for execution environment
  lineDelimiter: '\n'             // Standard newline character for Unix-like systems
};

/**
 * Reads and processes raw input data from the specified source.
 * @param {object} settings - Configuration object containing dataSourcePath and lineDelimiter.
 * @returns {Array<Array<number>>} A 2D array of numbers representing matrix dimensions.
 */
const retrieveAndParseDimensions = (settings) => {
  // Access the file system module to read the input
  const fileSystem = require('fs');

  // Read the entire content of the input file as ASCII
  const rawContent = fileSystem.readFileSync(settings.dataSourcePath, 'ascii');

  // If content is empty, throw an error or return an empty array
  if (!rawContent || rawContent.trim().length === 0) {
    console.error("Error: Input file is empty or contains only whitespace.");
    return []; // Return an empty array or handle as appropriate for the application
  }

  // Remove leading/trailing whitespace and split into individual lines
  const contentLines = rawContent.trim().split(settings.lineDelimiter);

  // Helper function to convert a single line string to an array of numbers
  const parseLineToNumbers = (textLine) => {
    // Split each line by space and convert each part to a numeric value
    return textLine.split(' ').map(val => {
      const numVal = Number(val);
      // Basic validation: ensure parsed value is a valid number
      if (isNaN(numVal)) {
        throw new Error(`Invalid numeric input found: '${val}'`);
      }
      return numVal;
    });
  };

  // Transform all content lines into an array of number arrays
  const processedDimensions = contentLines.map(parseLineToNumbers);

  return processedDimensions;
};

// Execute the input retrieval and parsing
const allMatrixSpecs = retrieveAndParseDimensions(systemConfig);

// Extract the total count of matrices from the first line of input
// M[0][0] corresponds to the total number of matrices 'n'
const totalMatrixCount = allMatrixSpecs[0][0];

// Validate the totalMatrixCount
if (totalMatrixCount <= 0 || totalMatrixCount !== Math.floor(totalMatrixCount)) {
  console.error("Error: Invalid number of matrices specified. Must be a positive integer.");
  process.exit(1); // Terminate if input is invalid
}

// Initialize a 2D dynamic programming table (using nested Maps for flexibility)
// This table will store the minimum scalar multiplications for sub-chains
const minimumOpsTable = new Map();

// Populate the DP table with initial values
// For a chain of length 1 (a single matrix), the cost is 0
for (let currentMatrixIdx = 1; currentMatrixIdx <= totalMatrixCount; currentMatrixIdx++) {
  minimumOpsTable.set(currentMatrixIdx, new Map()); // Create inner map for column
  minimumOpsTable.get(currentMatrixIdx).set(currentMatrixIdx, 0); // Cost of multiplying itself is zero
}

// Main dynamic programming loop for matrix chain multiplication
// 'chainLength' represents the length of the sub-chain being considered
for (let chainLength = 2; chainLength <= totalMatrixCount; chainLength++) {
  // 'startMatrixIdx' is the starting index of the current sub-chain
  for (let startMatrixIdx = 1; startMatrixIdx <= totalMatrixCount - chainLength + 1; startMatrixIdx++) {
    // 'endMatrixIdx' is the ending index of the current sub-chain
    const endMatrixIdx = startMatrixIdx + chainLength - 1;

    // Initialize the minimum cost for this sub-chain to a very large value
    // This value will be updated as we find better split points
    minimumOpsTable.get(startMatrixIdx).set(endMatrixIdx, Number.POSITIVE_INFINITY);

    // 'splitPoint' iterates through all possible points to split the sub-chain
    // The sub-chain from startMatrixIdx to endMatrixIdx is split into
    // (startMatrixIdx to splitPoint) and (splitPoint + 1 to endMatrixIdx)
    for (let splitPoint = startMatrixIdx; splitPoint < endMatrixIdx; splitPoint++) {
      // Retrieve dimensions for the current multiplication cost calculation
      // For matrix A_i (dimensions p_i-1 x p_i), M[i][0] is p_i-1 and M[i][1] is p_i
      const rowsOfFirstMatrix = allMatrixSpecs[startMatrixIdx][0]; // p_{startMatrixIdx-1}
      const colsOfSplitMatrix = allMatrixSpecs[splitPoint][1];     // p_{splitPoint}
      const colsOfLastMatrix = allMatrixSpecs[endMatrixIdx][1];   // p_{endMatrixIdx}

      // Calculate the cost of multiplying the two resulting sub-chains
      const costOfLeftSubchain = minimumOpsTable.get(startMatrixIdx).get(splitPoint);
      const costOfRightSubchain = minimumOpsTable.get(splitPoint + 1).get(endMatrixIdx);

      // Calculate the cost of the current multiplication step
      const currentMultiplicationCost = rowsOfFirstMatrix * colsOfSplitMatrix * colsOfLastMatrix;

      // Sum up all costs for this particular split point
      const totalCostForThisSplit = costOfLeftSubchain + costOfRightSubchain + currentMultiplicationCost;

      // Update the minimum cost for the current sub-chain if this split yields a lower cost
      const currentMinCost = minimumOpsTable.get(startMatrixIdx).get(endMatrixIdx);
      if (totalCostForThisSplit < currentMinCost) {
        minimumOpsTable.get(startMatrixIdx).set(endMatrixIdx, totalCostForThisSplit);
      }
    }
  }
}

// The final result is the minimum cost for multiplying the entire chain of matrices
// from the first (index 1) to the last (index totalMatrixCount)
const finalOptimalCost = minimumOpsTable.get(1).get(totalMatrixCount);

// Display the calculated optimal cost to the console
console.log(finalOptimalCost);