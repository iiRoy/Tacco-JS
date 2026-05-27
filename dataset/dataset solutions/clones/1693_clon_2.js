const calculateCombinations = (inputGrid, gridHeight, gridWidth, targetCount, debugMode = 0) => {
  // Utility function to convert 2D (row, column) coordinates to a 1D array index
  const getFlatIndex = (rowIndex, colIndex) => rowIndex * gridWidth + colIndex;
  let totalValidConfigurations = 0; // This variable will store the final count of valid configurations

  // Iterate through all possible combinations of rows to keep.
  // There are 2^gridHeight possibilities, represented by a bitmask.
  for (let rowMask = 0; rowMask < (1 << gridHeight); rowMask++) {
    // For each row combination, iterate through all possible combinations of columns to keep.
    // There are 2^gridWidth possibilities, also represented by a bitmask.
    for (let colMask = 0; colMask < (1 << gridWidth); colMask++) {
      // Initialize a counter for black cells that remain after applying the current row and column masks.
      let currentBlackCellCount = 0;
      // Iterate through each cell in the original grid.
      for (let rowIndex = 0; rowIndex < gridHeight; rowIndex++) {
        for (let colIndex = 0; colIndex < gridWidth; colIndex++) {
          // Check three conditions for a cell to be counted:
          // 1. The cell was originally a black cell (value is 1 in inputGrid).
          // 2. The current row (rowIndex) is selected in the rowMask.
          //    This is checked by `((1 << rowIndex) & rowMask)`.
          // 3. The current column (colIndex) is selected in the colMask.
          //    This is checked by `((1 << colIndex) & colMask)`.
          if (inputGrid[getFlatIndex(rowIndex, colIndex)] && ((1 << rowIndex) & rowMask) && ((1 << colIndex) & colMask)) {
            currentBlackCellCount++; // Increment the count if all conditions are met.
          }
        }
      }

      // If the number of remaining black cells matches the targetCount (K),
      // then this combination of row and column masks is a valid configuration.
      if (currentBlackCellCount === targetCount) {
        totalValidConfigurations++; // Increment the total count of valid configurations.
      }
    }
  }
  return totalValidConfigurations; // Return the final result.
};

const processInputAndOutput = async (inputStream, outputStream) => {
  // Import the 'readline' module to handle input stream asynchronously.
  const rl = require('readline');
  // Create an asynchronous iterator for reading lines from the input stream.
  const lineIterator = rl.createInterface({ input: inputStream })[Symbol.asyncIterator]();

  // Helper function to fetch the next line from the input.
  const fetchNextLine = async () => (await lineIterator.next()).value;
  // Helper function to fetch a line and split it into space-separated tokens.
  const fetchManyTokens = async () => (await fetchNextLine()).split(' ');

  // Read the first line which contains the grid dimensions (H, W) and the target count (K).
  const [gridHeightVal, gridWidthVal, targetBlackCount] = (await fetchManyTokens()).map(Number);

  // Initialize a Uint8Array to store the grid data efficiently.
  // '#' characters will be stored as 1, and '.' characters as 0.
  const gridData = new Uint8Array(gridHeightVal * gridWidthVal);
  // Define a local helper function for 2D to 1D index conversion, specific to this grid's width.
  const getLinearIndex = (rowIdx, colIdx) => rowIdx * gridWidthVal + colIdx;

  // Read the grid data row by row.
  for (let rowIdx = 0; rowIdx < gridHeightVal; rowIdx++) {
    const currentLine = await fetchNextLine(); // Get the string representation of the current row.
    for (let colIdx = 0; colIdx < gridWidthVal; colIdx++) {
      // Convert '#' to 1 (true) and any other character (implicitly '.') to 0 (false).
      gridData[getLinearIndex(rowIdx, colIdx)] = currentLine[colIdx] === '#';
    }
  }

  // Call the core logic function to calculate the number of valid combinations.
  const finalOutcome = calculateCombinations(gridData, gridHeightVal, gridWidthVal, targetBlackCount);
  // Write the computed result to the output stream, followed by a newline character.
  outputStream.write(`${finalOutcome}\n`);
};

// This block ensures that the 'processInputAndOutput' function is called
// only when the script is executed directly, not when it's imported as a module.
if (require.main === module) {
  // Execute the main processing function, using standard input and standard output streams.
  processInputAndOutput(process.stdin, process.stdout);
}
