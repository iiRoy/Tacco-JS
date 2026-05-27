'use strict';

// Helper function to determine if a specific bit is active within a given mask value.
// Returns 1 if the bit is set, 0 otherwise.
const checkBitStatus = (maskValue, bitPosition) => {
    const BIT_ONE_CONSTANT = 1;
    return (maskValue >> bitPosition) & BIT_ONE_CONSTANT;
};

// This function calculates the number of '#' characters in a subgrid defined by
// row and column selection masks. Rows/columns with a set bit in their respective mask
// are considered "removed" and are not counted.
const computeSubgridHashCount = (matrixData, totalRowsCount, totalColsCount, selectedRowMask, selectedColMask, charToMatch) => {
    const INITIAL_HASH_COUNT = 0;
    let currentHashTotal = INITIAL_HASH_COUNT;
    const START_INDEX = 0;

    // Iterate through each row of the grid
    for (let rIndex = START_INDEX; rIndex < totalRowsCount; rIndex++) {
        // If the rIndex-th bit is set in selectedRowMask, this row is excluded from consideration
        if (checkBitStatus(selectedRowMask, rIndex)) {
            continue; // Skip this row
        }
        // Iterate through each column of the grid for the current row
        for (let cIndex = START_INDEX; cIndex < totalColsCount; cIndex++) {
            // If the cIndex-th bit is set in selectedColMask, this column is excluded from consideration
            if (checkBitStatus(selectedColMask, cIndex)) {
                continue; // Skip this column
            }
            // If the cell at [rIndex][cIndex] contains the target character, increment the count
            if (matrixData[rIndex][cIndex] === charToMatch) {
                currentHashTotal++;
            }
        }
    }
    return currentHashTotal;
};

function ProcessInput(rawData){
  // Trim whitespace and split the raw input into an array of lines
  const processedLines = rawData.trim().split(/\r?\n/g);

  const LINE_SPLIT_DELIMITER = ' ';
  // Extract the first line which contains height, width, and target count
  const firstLineSegments = processedLines.shift().split(LINE_SPLIT_DELIMITER);
  // Convert the segments to numbers
  const [heightValue, widthValue, targetHashCount] = firstLineSegments.map(Number);

  // The remaining lines form the grid data
  const gridData = processedLines;
  let finalResultCount = 0;

  const ZERO_CONSTANT = 0;
  const ONE_CONSTANT = 1;
  const HASH_CHARACTER = "#";

  // Pre-calculate the upper bounds for the bitmask loops
  // (1 << N) gives 2^N, representing all possible combinations for N items
  const maxRowMaskValue = ONE_CONSTANT << heightValue;
  const maxColMaskValue = ONE_CONSTANT << widthValue;

  // Outer loop: Iterate through all possible combinations of row selections
  // Each 'rowSelectionMask' represents a unique set of rows to be "removed"
  for(let rowSelectionMask = ZERO_CONSTANT; rowSelectionMask < maxRowMaskValue; rowSelectionMask++){
    // Inner loop: Iterate through all possible combinations of column selections
    // Each 'colSelectionMask' represents a unique set of columns to be "removed"
    for(let colSelectionMask = ZERO_CONSTANT; colSelectionMask < maxColMaskValue; colSelectionMask++){
      // Calculate the number of '#' characters in the subgrid formed by the current
      // row and column selections (i.e., after "removing" selected rows/columns)
      const currentSubgridHashCount = computeSubgridHashCount(
        gridData,
        heightValue,
        widthValue,
        rowSelectionMask,
        colSelectionMask,
        HASH_CHARACTER
      );

      // If the calculated count matches the target count, increment the final result
      if(currentSubgridHashCount === targetHashCount) {
        finalResultCount++;
      }
    }
  }
  // Output the total number of ways to achieve the target hash count
  console.log(finalResultCount);
}

// Standard input reading and function execution
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
