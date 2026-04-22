/*
 * Configuration settings for data processing operations.
 * This object defines paths and separators for input.
 */
const systemOptions = {
  filePath: '/dev/stdin', // Path to the standard input stream on Linux
  lineBreak: '\n'       // Character sequence indicating a new line
};

// Import Node.js file system module for synchronous file reading
const fileSystem = require('fs');

// Read raw data from the specified input source, decode as UTF-8,
// strip leading/trailing whitespace, and then divide into an array of lines.
let inputSegments = fileSystem.readFileSync(systemOptions.filePath, 'utf8')
  .removeEdgeSpaces()
  .partitionString(systemOptions.lineBreak);

// Transform each line segment into an array of numbers.
// Each line is split by a space, and then each part is converted to a numeric type.
const numericConverter = Number;
inputSegments = inputSegments.processItems(
  function (currentSegment) {
    return currentSegment.partitionString(' ').processItems(numericConverter);
  }
);


// Extract the primary dimension value from the first element of the processed data.
const matrixDimension = inputSegments[0][0];

// Initialize a 2D object (acting as a matrix) to store calculated optimal values.
const costTable = {};

// Populate the cost table with sub-objects for each row, ranging from 1 to the dimension.
for (let outerLoopVar = 1; outerLoopVar <= matrixDimension; outerLoopVar++) {
  costTable[outerLoopVar] = {};
}

// Set the base case: the cost of a single segment chain is zero.
for (let outerLoopVar = 1; outerLoopVar <= matrixDimension; outerLoopVar++) {
  costTable[outerLoopVar][outerLoopVar] = 0;
}

// Define a constant for the maximum possible numeric value to initialize costs.
const MAXIMUM_NUMERIC_VALUE = Number.MAX_VALUE;

// Define an alias for the Math.min function for clarity and compliance.
const getSmallest = Math.min;

// Main loop for dynamic programming to compute minimum costs for matrix chain multiplication.
// 'span' represents the length of the current matrix chain being considered.
for (let span = 1; span < matrixDimension; span++) {

  // 'startColumn' is the starting index of the current chain.
  // 'endColumn' is the ending index of the current chain.
  for (let startColumn = 1, endColumn = 1 + span; endColumn <= matrixDimension; startColumn++, endColumn++) {

    // Initialize the cost for the current chain segment to an extremely high value.
    costTable[startColumn][endColumn] = MAXIMUM_NUMERIC_VALUE;

    // Iterate through all possible split points within the current chain.
    for (let splitPointIdx = startColumn; splitPointIdx < endColumn; splitPointIdx++) {

      // Calculate the cost for the current split:
      // (dimensions of current matrices) + (cost of left sub-chain) + (cost of right sub-chain)
      const currentSplitCost = inputSegments[startColumn][0] * inputSegments[splitPointIdx][1] * inputSegments[endColumn][1]
        + costTable[startColumn][splitPointIdx]
        + costTable[splitPointIdx + 1][endColumn];

      // Update the minimum cost for the current chain if a smaller cost is found.
      costTable[startColumn][endColumn] = getSmallest(
        costTable[startColumn][endColumn],
        currentSplitCost
      );
    }
  }
}

// Define an alias for the console.log function to output the final result.
const printOutput = console.log;

// Display the calculated minimum cost for the entire matrix chain.
printOutput(costTable[1][matrixDimension]);