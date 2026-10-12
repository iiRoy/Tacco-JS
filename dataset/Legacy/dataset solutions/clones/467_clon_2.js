function spinMatrix(inputMatrix) {
  // Determine the size of the square matrix (assuming it's square)
  const matrixDimension = inputMatrix.length - 1;
  // Create a new matrix of the same dimensions, initialized with copies of rows
  let rotatedData = inputMatrix.map(function(rowElements) {
    return rowElements.slice();
  });

  // Perform the 90-degree clockwise rotation
  for (let rowIndex = 0; rowIndex <= matrixDimension; rowIndex++) {
    for (let colIndex = 0; colIndex <= matrixDimension; colIndex++) {
      // The element at (rowIndex, colIndex) in the new matrix
      // comes from (matrixDimension - colIndex, rowIndex) in the original.
      rotatedData[rowIndex][colIndex] = inputMatrix[matrixDimension - colIndex][rowIndex];
    }
  }
  return rotatedData; // Return the newly rotated matrix
}

// This function checks if a pattern (currentPattern) matches a subgrid
// within the targetGrid starting at (rowStart, colStart).
// It implicitly uses 'patternDimension', 'targetGrid', and 'currentPattern'
// from the outer scope, as per the original's design.
function verifyPattern(rowStart, colStart) {
  let firstOccurrence = false; // Stores the coordinates of the first non-negative pattern element
  // Iterate through the pattern matrix
  for (let patRowIdx = 0; patRowIdx < patternDimension; patRowIdx++) {
    for (let patColIdx = 0; patColIdx < patternDimension; patColIdx++) {
      // If the pattern element is -1, it's a wildcard, so skip it.
      if (currentPattern[patRowIdx][patColIdx] === -1) continue;

      // If this is the first non-wildcard element found, record its absolute position.
      if (firstOccurrence === false) {
        firstOccurrence = [rowStart + patRowIdx, colStart + patColIdx];
      }

      // Compare the pattern element with the corresponding target grid element.
      // If they don't match, the pattern does not fit here.
      if (targetGrid[rowStart + patRowIdx][colStart + patColIdx] !== currentPattern[patRowIdx][patColIdx]) {
        return false; // Mismatch found, pattern does not fit
      }
    }
  }
  return firstOccurrence; // Return the coordinates of the first non-wildcard match, or false if no match.
}

// Read all input from stdin
const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
// Split input into lines and trim any leading/trailing whitespace
let inputLines = rawInputData.trim().split("\n");

// Main processing loop
while (true) {
  // Read the grid dimensions (N and M) from the first line
  const dimensionsPair = inputLines.shift().split(" ").map(Number);
  const targetGridSize = dimensionsPair[0]; // N
  const patternDimension = dimensionsPair[1]; // M

  // If N and M are both 0, it's the termination condition
  if (targetGridSize === 0 && patternDimension === 0) break;

  // Read the target grid (N x N)
  let targetGrid = [];
  for (let i = 0; i < targetGridSize; i++) {
    const lineValues = inputLines.shift().split(" ").map(Number);
    targetGrid.push(lineValues);
  }

  // Read the pattern grid (M x M)
  let currentPattern = [];
  for (let i = 0; i < patternDimension; i++) {
    const patternLineValues = inputLines.shift().split(" ").map(Number);
    currentPattern.push(patternLineValues);
  }

  // Initialize minimum match coordinates to a value larger than any possible valid coordinate
  let bestMatchCoordinates = [101, 101]; // [row, col] + 1

  // Iterate through 4 possible rotations of the pattern
  for (let rotationIteration = 0; rotationIteration < 4; rotationIteration++) {
    // Iterate through all possible top-left positions for the pattern within the target grid
    for (let searchRowOffset = 0; searchRowOffset <= targetGridSize - patternDimension; searchRowOffset++) {
      for (let searchColOffset = 0; searchColOffset <= targetGridSize - patternDimension; searchColOffset++) {
        // Check if the current pattern (in its current rotation) matches at this offset
        const matchResult = verifyPattern(searchRowOffset, searchColOffset);

        // If a match is found (matchResult is not false)
        if (matchResult !== false) {
          // Update bestMatchCoordinates if this match is "earlier" (smaller row, then smaller column)
          // Note: The original code uses `flag[0]+1` and `flag[1]+1` for comparison,
          // which implies 1-based indexing for output, but `flag` itself is 0-based.
          // The comparison logic `min[0] >= flag[0]+1 && min[1] > flag[1]+1` is a bit unusual.
          // It means: if current min row is greater than or equal to new row, AND current min col is strictly greater than new col.
          // This implies a lexicographical comparison where the column is prioritized if rows are equal.
          // Let's re-evaluate the original logic:
          // `min[0] >= flag[0]+1` (current min row is >= new row + 1)
          // `min[1] > flag[1]+1` (current min col is > new col + 1)
          // This is equivalent to:
          // if (new_row+1 < min_row) OR (new_row+1 == min_row AND new_col+1 < min_col)
          // The original code's condition `min[0] >= flag[0]+1 && min[1] > flag[1]+1` is not a standard lexicographical comparison.
          // It seems to be: if the new row is *strictly smaller* than the current best row, OR
          // if the new row is *equal* to the current best row AND the new column is *strictly smaller* than the current best column.
          // Let's stick to the exact original comparison:
          // `min[0]` is the row component of `bestMatchCoordinates`
          // `min[1]` is the column component of `bestMatchCoordinates`
          // `flag[0]` is the row component of `matchResult`
          // `flag[1]` is the column component of `matchResult`
          // The comparison is `bestMatchCoordinates[0] >= matchResult[0] + 1 && bestMatchCoordinates[1] > matchResult[1] + 1`
          // This is a very specific comparison. Let's trace it:
          // If `bestMatchCoordinates = [101, 101]` and `matchResult = [0, 0]`:
          // `101 >= 0 + 1` (true) AND `101 > 0 + 1` (true) -> `bestMatchCoordinates` becomes `[0+1, 0+1]` = `[1, 1]`
          // If `bestMatchCoordinates = [1, 1]` and `matchResult = [0, 1]`:
          // `1 >= 0 + 1` (true) AND `1 > 1 + 1` (false) -> No update.
          // If `bestMatchCoordinates = [1, 1]` and `matchResult = [1, 0]`:
          // `1 >= 1 + 1` (false) -> No update.
          // This condition is `(new_row_plus_one < current_min_row_plus_one) || (new_row_plus_one == current_min_row_plus_one && new_col_plus_one < current_min_col_plus_one)`
          // The original condition `min[0] >= flag[0]+1 && min[1] > flag[1]+1` is NOT equivalent to standard lexicographical min.
          // It's `(current_min_row >= new_row_plus_one) AND (current_min_col > new_col_plus_one)`.
          // This means it only updates if the new match is *strictly better in column* AND *at least as good in row*.
          // This is a very unusual comparison. I must preserve it exactly.
          if (bestMatchCoordinates[0] >= matchResult[0] + 1 && bestMatchCoordinates[1] > matchResult[1] + 1) {
            bestMatchCoordinates = [matchResult[0] + 1, matchResult[1] + 1];
          }
        }
      }
    }
    // Rotate the pattern for the next iteration
    currentPattern = spinMatrix(currentPattern);
  }

  // Output the result
  // If bestMatchCoordinates is still [101, 101], no match was found, output "NA".
  // Otherwise, output the 1-based column and then row coordinates.
  console.log((bestMatchCoordinates.join("") === "101101") ? "NA" : bestMatchCoordinates[1] + " " + bestMatchCoordinates[0]);
}
