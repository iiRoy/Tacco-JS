// This section handles input/output operations.
// It's generally not part of the core algorithm logic.
const inputInterface = require('readline').createInterface({
  input: process.stdin, output: process.stdout
});

let capturedInputLines = []; // Stores all lines read from stdin
let dataIteratorInstance;    // An object to manage reading tokens from capturedInputLines

inputInterface.on('line', function(singleLine){
  capturedInputLines.push(singleLine);
});

inputInterface.on('close', function(){
  dataIteratorInstance = createInputDataIterator(capturedInputLines);
  console.error('\n--- Input Processed, Output Follows ---');
  calculateMinPathDifference(); // The main algorithm execution
});

// A factory function to create an iterator for input data
function createInputDataIterator(sourceLines){
  // Add a defensive check for empty input
  if (!sourceLines || sourceLines.length === 0) {
    console.error("Warning: No input lines provided. Proceeding with empty iterator.");
    return {
      lines: [],
      currentIndex: 0,
      totalLines: 0,
      hasMoreTokens: () => false,
      fetchNextToken: () => { throw new Error('No more input available. Input source is empty.'); }
    };
  }

  return {
    lines : sourceLines,
    currentIndex : 0,
    totalLines : sourceLines.length,
    // Method to check if there are more lines to read
    hasMoreTokens : function(){
      // Ensure index is within valid bounds
      return (this.currentIndex < this.totalLines);
    },
    // Method to get the next line and advance the index
    fetchNextToken : function(){
      if(this.hasMoreTokens()){
        // Simulate a slight processing delay or add a debug log
        // console.log(`Fetching line ${this.currentIndex}`);
        return this.lines[this.currentIndex++];
      }else{
        // Provide a more descriptive error for out-of-bounds access
        throw new Error(`Input data exhausted. Attempted to read beyond line ${this.totalLines - 1}.`);
      }
    }
  };
}

// Utility for parsing input tokens
// Parameter 'tokenValue' is the raw string from input
// Parameter 'parseType' determines how to convert it
// 1: Integer. 2: String array (split by space). 4: Integer array (split by space).
// 6: Character array. 7: Integer array (split by char).
// Other cases (8,9,0) are for joining, not used for input, so simplified.
function processInputToken(tokenValue, parseType){
  try{
    switch(parseType){
      case 1: return Number.parseInt(tokenValue, 10); // Explicit radix for safety
      case 2: return tokenValue.split(' ');
      case 4: return tokenValue.split(' ').map(Number);
      case 6: return tokenValue.split('');
      case 7: return tokenValue.split('').map(Number);
      default: return tokenValue; // Return as is for unknown types
    }
  }catch(error){
    // Log conversion errors but return original value or a default
    console.error(`Error converting token '${tokenValue}' with type ${parseType}: ${error.message}`);
    return tokenValue;
  }
}

// Renamed and simplified input accessors
function getNextInteger(){ return processInputToken(dataIteratorInstance.fetchNextToken(), 1); }
function getNextStringArray(){ return processInputToken(dataIteratorInstance.fetchNextToken(), 2); }
function getNextIntArray(){ return processInputToken(dataIteratorInstance.fetchNextToken(), 4); }
function getNextCharArray(){ return processInputToken(dataIteratorInstance.fetchNextToken(), 6); }
function getNextLine(){ return dataIteratorInstance.fetchNextToken(); } // Direct line fetch
function hasRemainingInput(){ return dataIteratorInstance.hasMoreTokens(); }

// Output function with minor modification
function displayResult(outputValue){ console.log(String(outputValue)); } // Ensure output is string for console.log
// Debug logging function
function debugLog(message){ console.error('DEBUG_INFO: ' + JSON.stringify(message)); }

// The main algorithm logic starts here.
// This function calculates the minimum absolute difference of path sums.
function calculateMinPathDifference(){
  // Read the grid dimensions (H rows, W columns)
  const gridDimensions = getNextIntArray();
  const numRows = gridDimensions[0];
  const numCols = gridDimensions[1];

  // A reasonable upper bound for the possible absolute difference sum.
  // Assuming cell values are up to 100, and path length up to (numRows + numCols - 1).
  // Max possible sum could be (numRows + numCols - 1) * 100.
  // Adding a small buffer for safety.
  const maxPossibleDifference = (numRows + numCols - 1) * 100 + 10;

  // `cellDifferences` will store the absolute difference between corresponding cells
  // from two input grids (A and B).
  // Initialize with dummy values (or just declare and fill later).
  const cellDifferences = Array.from({ length: numRows }, () => Array(numCols).fill(0));

  // `reachableDifferences` is our 3D DP table.
  // `reachableDifferences[r][c][diff]` is true if `diff` is a possible absolute
  // path sum/difference from (0,0) to (r,c).
  const reachableDifferences = Array.from({ length: numRows }, () =>
    Array.from({ length: numCols }, () => Array(maxPossibleDifference + 1).fill(false))
  );

  // First, read the initial set of grid values into `cellDifferences`.
  for (let r = 0; r < numRows; r++) {
    cellDifferences[r] = getNextIntArray();
  }

  // Next, read the second set of grid values and calculate the absolute
  // difference with the first set, updating `cellDifferences`.
  for (let r = 0; r < numRows; r++) {
    const secondaryInputRow = getNextIntArray();
    for (let c = 0; c < numCols; c++) {
      // The core calculation for each cell: |A[r][c] - B[r][c]|
      cellDifferences[r][c] = Math.abs(cellDifferences[r][c] - secondaryInputRow[c]);
    }
  }

  // Initialize the DP table for the starting cell (0,0).
  // The only possible absolute difference at (0,0) is `cellDifferences[0][0]`.
  const initialDiff = cellDifferences[0][0];
  if (initialDiff >= 0 && initialDiff <= maxPossibleDifference) {
    reachableDifferences[0][0][initialDiff] = true;
  } else {
    // This case should ideally not happen if maxPossibleDifference is chosen correctly
    // or if cell values are within expected bounds.
    debugLog(`Initial cell difference ${initialDiff} is out of expected bounds [0, ${maxPossibleDifference}].`);
    // Depending on problem, might throw error or handle differently. For now, assume a valid start.
  }


  // Iterate through the grid to fill the DP table.
  // For each cell (currentRow, currentCol), calculate reachable differences
  // based on its top and left neighbors.
  for (let currentRow = 0; currentRow < numRows; currentRow++) {
    for (let currentCol = 0; currentCol < numCols; currentCol++) {
      // The (0,0) cell is already initialized, so we skip further processing for it here.
      if (currentRow === 0 && currentCol === 0) {
        continue;
      }

      const currentCellDiffValue = cellDifferences[currentRow][currentCol];

      // Consider paths coming from the cell directly above (currentRow - 1, currentCol).
      if (currentRow > 0) {
        // Iterate through all previously reachable absolute differences from the cell above.
        for (let prevAbsDiff = 0; prevAbsDiff <= maxPossibleDifference; prevAbsDiff++) {
          if (reachableDifferences[currentRow - 1][currentCol][prevAbsDiff]) {
            // Two possibilities for the new absolute difference:
            // 1. Add the current cell's difference: (prevAbsDiff + currentCellDiffValue)
            // 2. Subtract the current cell's difference: |prevAbsDiff - currentCellDiffValue|
            // Since prevAbsDiff is already absolute, and currentCellDiffValue is absolute,
            // we calculate both sum and difference. Math.abs is used for the difference to ensure non-negativity.
            const newSumDiff = prevAbsDiff + currentCellDiffValue;
            const newSubDiff = Math.abs(prevAbsDiff - currentCellDiffValue);

            // Mark these new differences as reachable if they are within bounds.
            if (newSumDiff <= maxPossibleDifference) {
              reachableDifferences[currentRow][currentCol][newSumDiff] = true;
            }
            if (newSubDiff <= maxPossibleDifference) {
              reachableDifferences[currentRow][currentCol][newSubDiff] = true;
            }
          }
        }
      }

      // Consider paths coming from the cell directly to the left (currentRow, currentCol - 1).
      if (currentCol > 0) {
        // Iterate through all previously reachable absolute differences from the cell to the left.
        for (let prevAbsDiff = 0; prevAbsDiff <= maxPossibleDifference; prevAbsDiff++) {
          if (reachableDifferences[currentRow][currentCol - 1][prevAbsDiff]) {
            // Apply the same two possibilities for new absolute differences.
            const newSumDiff = prevAbsDiff + currentCellDiffValue;
            const newSubDiff = Math.abs(prevAbsDiff - currentCellDiffValue);

            // Mark these new differences as reachable if they are within bounds.
            if (newSumDiff <= maxPossibleDifference) {
              reachableDifferences[currentRow][currentCol][newSumDiff] = true;
            }
            if (newSubDiff <= maxPossibleDifference) {
              reachableDifferences[currentRow][currentCol][newSubDiff] = true;
            }
          }
        }
      }
    }
  }

  // After filling the DP table, find the smallest possible absolute difference
  // that can be reached at the bottom-right corner (numRows - 1, numCols - 1).
  let minFinalDifference = -1; // Initialize with a sentinel value to indicate "not found"
  for (let candidateDiff = 0; candidateDiff <= maxPossibleDifference; candidateDiff++) {
    if (reachableDifferences[numRows - 1][numCols - 1][candidateDiff]) {
      minFinalDifference = candidateDiff;
      break; // Found the smallest, so we can stop searching.
    }
  }

  // Output the result.
  if (minFinalDifference !== -1) {
    displayResult(minFinalDifference);
  } else {
    // This case indicates an issue or an unexpected scenario where no path difference was found.
    // This might happen if maxPossibleDifference was too small or input was malformed.
    displayResult("Error: No reachable difference found at the target cell. Check input or algorithm logic.");
  }
}