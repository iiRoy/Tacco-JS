/*
 * This module contains routines for processing grid-like structures
 * and calculating specific patterns within them.
 */
const calculateMatches = (
  inputGrid,
  gridHeight,
  gridWidth,
  targetCount,
  enableLogging = 0
) => {
  /*
   * Helper function to convert 2D coordinates (row, col)
   * into a single 1D array index for efficient access.
   */
  const computePosition = (rowIdx, colIdx) => rowIdx * gridWidth + colIdx;
  let finalTally = 0; // Initialize a counter for successful configurations

  // Iterate through all possible row selections (2^gridHeight combinations)
  for (let rowCombinations = 0; rowCombinations < 2 ** gridHeight; rowCombinations++) {
    // For each row selection, iterate through all possible column selections (2^gridWidth combinations)
    for (let colCombinations = 0; colCombinations < 2 ** gridWidth; colCombinations++) {
      // Begin counting black entries that survive the current row/column mask
      let elementCounter = 0;
      for (let r = 0; r < gridHeight; r++) {
        for (let c = 0; c < gridWidth; c++) {
          /*
           * Check three conditions for a cell to be counted:
           * 1. The cell at (r, c) in the original grid is 'black' (true).
           * 2. The current row 'r' is selected in the rowCombinations mask.
           * 3. The current column 'c' is selected in the colCombinations mask.
           */
          if (
            inputGrid[computePosition(r, c)] &&
            ((1 << r) & rowCombinations) &&
            ((1 << c) & colCombinations)
          ) {
            elementCounter++; // Increment if all conditions are met
          }
        }
      }

      // If the number of surviving black elements matches our target, increment the overall tally
      if (elementCounter === targetCount) {
        finalTally++;
      }
    }
  }
  return finalTally; // Return the total number of matching configurations
};

/*
 * Main execution function to handle input/output and orchestrate the grid processing.
 */
const executeProcessing = async (inputStream, outputStream) => {
  const lineReaderModule = require('readline');
  const asyncIterator = lineReaderModule.createInterface({ input: inputStream })[
    Symbol.asyncIterator
  ]();
  const fetchLine = async () => (await asyncIterator.next()).value; // Function to get the next line from input
  const fetchMultipleValues = async () => (await fetchLine()).split(' '); // Function to get space-separated values

  // Read the initial dimensions (height, width) and the target count
  const [matrixHeight, matrixWidth, desiredQuantity] = (await fetchMultipleValues()).map(
    parseInt
  );
  // Allocate memory for the grid data, storing boolean values as 0 or 1
  const gridStorage = new Uint8Array(matrixHeight * matrixWidth);
  // A local utility to map 2D coordinates to a 1D array index
  const determineLinearIndex = (rIndex, cIndex) => rIndex * matrixWidth + cIndex;

  // Populate the grid storage based on input lines
  for (let currentRow = 0; currentRow < matrixHeight; currentRow++) {
    const inputLineContent = await fetchLine();
    for (let currentColumn = 0; currentColumn < matrixWidth; currentColumn++) {
      // Store true (1) if the character is '#', false (0) otherwise
      gridStorage[determineLinearIndex(currentRow, currentColumn)] =
        inputLineContent[currentColumn] === '#';
    }
  }
  // Call the core logic function to get the final computed result
  const computedOutcome = calculateMatches(
    gridStorage,
    matrixHeight,
    matrixWidth,
    desiredQuantity
  );
  // Write the computed result to the output stream, followed by a newline
  outputStream.write(`${computedOutcome}\n`);
};

// Standard boilerplate to run the main function when the script is executed directly
if (require.main === module) {
  executeProcessing(process.stdin, process.stdout);
}