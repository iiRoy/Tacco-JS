"use strict";

const SolutionRunner = function(sourceText) {
  // Prepare the incoming data: trim, split by whitespace, and convert to numbers.
  let processedInput = sourceText.trim().split(/\s+/).map(x => parseInt(x, 10));

  // Extract grid dimensions from the beginning of the processed data.
  const numRows = processedInput.shift();
  const numCols = processedInput.shift();

  let basisCount = 0; // Initialize a counter for the basis (rank of the matrix).
  const targetMatrix = new GridStructure(numRows, numCols, processedInput);

  // Begin the Gaussian elimination process to determine the matrix rank.
  while (targetMatrix.dataRows.length > 0) {
    let pivotRowIdx = 0;
    // Iterate through rows to find a '1' in the current leading column.
    for (let rowIter = 0; rowIter < targetMatrix.dataRows.length; rowIter++) {
      if (targetMatrix.dataRows[rowIter][0] === 1) break; // Found a '1', use this row as pivot.
      pivotRowIdx++; // Move to the next row if '0' is found.
    }

    // If no '1' was found in the current column (all are '0's).
    if (pivotRowIdx === targetMatrix.dataRows.length) {
      // This column is linearly dependent; move it to the end and then remove it.
      targetMatrix.interchangeColumns(0, targetMatrix.dataRows[0].length - 1);
      targetMatrix.removeLastColumn();
    } else {
      // A pivot '1' was found, indicating a new basis vector.
      basisCount++;
      // Proceed to eliminate other '1's in the current column below the pivot.
      while (true) {
        let targetRowIdx = pivotRowIdx + 1;
        // Search for the next row containing a '1' in the current column.
        for (let rowIter = pivotRowIdx + 1; rowIter < targetMatrix.dataRows.length; rowIter++) {
          if (targetMatrix.dataRows[rowIter][0] === 1) break; // Found another '1' to eliminate.
          targetRowIdx++;
        }
        // If no more '1's are present below the current pivot, exit this inner loop.
        if (targetRowIdx === targetMatrix.dataRows.length) break;

        // Apply XOR operation to eliminate the '1' in the target row.
        targetMatrix.dataRows[targetRowIdx] = rowXOR(targetMatrix.dataRows[pivotRowIdx], targetMatrix.dataRows[targetRowIdx]);
      }
      // After processing, move the pivot row to the end and remove it.
      targetMatrix.interchangeRows(pivotRowIdx, targetMatrix.dataRows.length - 1);
      targetMatrix.removeLastRow();
    }
  }

  const computedRank = basisCount; // The final calculated rank.
  const modulus = 998244353; // A prime number used for modular arithmetic.

  let exponentTerm1 = 1;
  let exponentTerm2 = 1;

  // Calculate 2^(numCols + numRows - 1) modulo 'modulus'.
  for (let iterCount = 1; iterCount <= numCols + numRows - 1; iterCount++) {
    exponentTerm1 = exponentTerm1 + exponentTerm1 - (2 * exponentTerm1 > modulus ? modulus : 0);
  }

  // Calculate 2^(numCols + numRows - computedRank - 1) modulo 'modulus'.
  for (let iterCount = 1; iterCount <= numCols + numRows - computedRank - 1; iterCount++) {
    exponentTerm2 = exponentTerm2 + exponentTerm2 - (2 * exponentTerm2 > modulus ? modulus : 0);
  }

  const outputResult = exponentTerm1 - exponentTerm2; // Final computation.
  console.log(outputResult); // Output the result to the console.
};

// Performs a bitwise exclusive OR operation on two binary values.
function exclusiveOrBit(val1, val2) {
  return val1 === val2 ? 0 : 1;
}

// Applies the exclusive OR operation element-wise to two arrays (vectors).
function rowXOR(vectorA, vectorB) {
  return vectorA.map((element, elementIdx) => exclusiveOrBit(element, vectorB[elementIdx]));
}

// Constructor function for creating a GridStructure (binary matrix).
function GridStructure(rows, cols, initialValues) {
  const currentGrid = this;
  currentGrid.dataRows = []; // Internal array to store the matrix rows.

  // Initialize each row as an empty array.
  for (let r = 0; r < rows; r++) {
    currentGrid.dataRows[r] = [];
  }

  // Populate the grid with values from the flattened initialValues array.
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      currentGrid.dataRows[r][c] = initialValues[r * cols + c];
    }
  }
}

// A utility function to swap the positions of two elements within an array.
function swapArrayPositions(targetArray, idxA, idxB) {
  const itemA = targetArray[idxA];
  const itemB = targetArray[idxB];
  targetArray[idxA] = itemB;
  targetArray[idxB] = itemA;
}

// Method to swap two rows within the GridStructure.
GridStructure.prototype.interchangeRows = function(idxA, idxB) {
  const currentContext = this;
  swapArrayPositions(currentContext.dataRows, idxA, idxB);
};

// Method to remove the last row from the GridStructure.
GridStructure.prototype.removeLastRow = function() {
  const currentContext = this;
  const rowCollection = currentContext.dataRows;
  rowCollection.pop(); // Removes the last element (row) from the dataRows array.
};

// Method to swap two columns within the GridStructure.
GridStructure.prototype.interchangeColumns = function(colIdxA, colIdxB) {
  const currentContext = this;
  for (let rowIdx = 0; rowIdx < currentContext.dataRows.length; rowIdx++) {
    swapArrayPositions(currentContext.dataRows[rowIdx], colIdxA, colIdxB);
  }
};

// Method to remove the last column from the GridStructure.
GridStructure.prototype.removeLastColumn = function() {
  const currentContext = this;
  const rowCollection = currentContext.dataRows;
  const numActiveRows = rowCollection.length;

  // Special handling: if only one column remains and is being removed, clear the entire matrix.
  if (numActiveRows > 0 && rowCollection[0].length === 1) {
    currentContext.dataRows = [];
  } else {
    // Otherwise, remove the last element (column entry) from each row.
    for (let rowIdx = 0; rowIdx < numActiveRows; rowIdx++) {
      rowCollection[rowIdx].pop();
    }
  }
};

// Execute the primary logic by reading input from standard input.
SolutionRunner(require('fs').readFileSync('/dev/stdin', 'utf8'));