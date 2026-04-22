"use strict";

// This function serves as the primary entry point for processing the problem's input.
let ProcessInput = function (rawData) {
  // Normalize the input string: remove leading/trailing whitespace, then split by any whitespace,
  // and finally convert each resulting string element into a numeric type.
  let parsedData = rawData.trim().split(/\s+/).map(val => Number(val));

  // Extract the dimensions of the matrix from the beginning of the parsed data array.
  let numRows = parsedData.shift(); // The first element is the number of rows.
  let numCols = parsedData.shift(); // The second element is the number of columns.

  // Initialize a counter for the rank (basis size) of the matrix.
  let basisSize = 0;

  // Create a new binary matrix object using the extracted dimensions and remaining elements.
  let matrixObj = new BinaryMatrix(numRows, numCols, parsedData);

  // Begin Gaussian elimination-like process to determine the rank.
  // Continue as long as there are rows remaining in the matrix.
  while (matrixObj.rowsData.length > 0) {
    let firstOneRowIdx = 0; // Index to track the first row with a '1' in the current leading column.

    // Iterate through the current rows to find the first row that has a '1' in the leading column (index 0).
    for (let rowIndex = 0; rowIndex < matrixObj.rowsData.length; ++rowIndex) {
      if (matrixObj.rowsData[rowIndex][0] === 1) {
        break; // Found a row starting with '1', exit loop.
      }
      firstOneRowIdx++; // Increment index if current row starts with '0'.
    }

    // Check if no row starting with '1' was found in the current leading column.
    if (firstOneRowIdx === matrixObj.rowsData.length) {
      // If all remaining rows start with '0', this column is linearly dependent.
      // Move this column to the end (conceptually) and then remove it.
      matrixObj.exchangeColumns(0, matrixObj.rowsData[0].length - 1);
      matrixObj.removeLastColumn();
    } else {
      // A row starting with '1' was found, indicating this column contributes to the rank.
      basisSize += 1; // Increment the rank counter.

      // Perform XOR operations to eliminate '1's below the pivot element.
      // This loop continues until no more '1's are found below the current pivot row.
      while (true) {
        let nextOneRowIdx = firstOneRowIdx + 1; // Index to search for the next row with '1'.

        // Search for the next row below the pivot row (`firstOneRowIdx`) that also starts with a '1'.
        for (let r = firstOneRowIdx + 1; r < matrixObj.rowsData.length; ++r) {
          if (matrixObj.rowsData[r][0] === 1) {
            break; // Found a row to XOR with the pivot row.
          }
          nextOneRowIdx++; // Move to the next row if current row starts with '0'.
        }

        // If no more rows starting with '1' are found below the current pivot, break the inner loop.
        if (nextOneRowIdx === matrixObj.rowsData.length) {
          break;
        }

        // Apply XOR operation: current row (nextOneRowIdx) becomes XOR of pivot row and itself.
        matrixObj.rowsData[nextOneRowIdx] = BinaryXORVector(
          matrixObj.rowsData[firstOneRowIdx],
          matrixObj.rowsData[nextOneRowIdx]
        );
      }

      // After elimination, move the pivot row to the end of the matrix and then remove it.
      // This effectively processes the row and reduces the matrix size.
      matrixObj.exchangeRows(firstOneRowIdx, matrixObj.rowsData.length - 1);
      matrixObj.removeLastRow();
    }
  }

  // The final rank of the matrix, derived from the Gaussian elimination.
  const finalRank = basisSize;

  // Calculate the final answer using the formula provided, which involves powers of 2 and matrix dimensions.
  let resultVal = Math.pow(2, numRows + numCols - 1) - Math.pow(2, Math.min(numCols, numRows) - finalRank + Math.max(numCols, numRows) - 1);

  // Output the computed result to the console.
  console.log(resultVal);
};

// Helper function to perform a bitwise XOR operation on two individual binary values (0 or 1).
function bitwiseXOR(valA, valB) {
  return valA === valB ? 0 : 1; // Returns 0 if values are the same, 1 if different.
}

// Helper function to perform a bitwise XOR operation on two arrays (vectors) of binary values.
// It applies the `bitwiseXOR` function element-wise.
function BinaryXORVector(vectorOne, vectorTwo) {
  return vectorOne.map((element, index) => bitwiseXOR(element, vectorTwo[index]));
}

// Constructor function for a BinaryMatrix object.
// It initializes a matrix of given dimensions with elements from a flattened array.
function BinaryMatrix(rowsCount, colsCount, flatElements) {
  const currentObject = this; // Reference to the current instance.
  currentObject.rowsData = []; // Initialize an array to hold the matrix rows.

  // Pre-allocate arrays for each row.
  for (let rIdx = 0; rIdx < rowsCount; ++rIdx) {
    currentObject.rowsData[rIdx] = [];
  }

  // Populate the matrix with elements from the flattened input array.
  for (let rIdx = 0; rIdx < rowsCount; ++rIdx) {
    for (let cIdx = 0; cIdx < colsCount; ++cIdx) {
      currentObject.rowsData[rIdx][cIdx] = flatElements[rIdx * colsCount + cIdx];
    }
  }
}

// Generic helper function to swap two elements within any given array.
function performSwap(targetArray, indexOne, indexTwo) {
  let tempA = targetArray[indexOne];
  let tempB = targetArray[indexTwo];
  targetArray[indexOne] = tempB;
  targetArray[indexTwo] = tempA;
}

// Prototype method for BinaryMatrix: Swaps two specified rows.
BinaryMatrix.prototype.exchangeRows = function (rowIdx1, rowIdx2) {
  const instanceRef = this;
  performSwap(instanceRef.rowsData, rowIdx1, rowIdx2);
};

// Prototype method for BinaryMatrix: Removes the last row from the matrix.
BinaryMatrix.prototype.removeLastRow = function () {
  const instanceRef = this;
  const rowCollection = instanceRef.rowsData;
  rowCollection.pop(); // Standard array method to remove the last element.
};

// Prototype method for BinaryMatrix: Swaps two specified columns.
// This requires iterating through each row and swapping elements at the column indices.
BinaryMatrix.prototype.exchangeColumns = function (colIdx1, colIdx2) {
  const instanceRef = this;
  for (let r = 0; r < instanceRef.rowsData.length; ++r) {
    performSwap(instanceRef.rowsData[r], colIdx1, colIdx2);
  }
};

// Prototype method for BinaryMatrix: Removes the rightmost column from the matrix.
BinaryMatrix.prototype.removeLastColumn = function () {
  const instanceRef = this;
  const rowCollection = instanceRef.rowsData;
  const currentRowCount = rowCollection.length;

  // Special case: if there's only one column left, clearing the array is equivalent to removing it.
  if (rowCollection.length > 0 && rowCollection[0].length === 1) {
    instanceRef.rowsData = [];
    return;
  }
  // For each row, remove its last element.
  for (let r = 0; r < currentRowCount; ++r) {
    rowCollection[r].pop();
  }
};

// Execute the main processing function by reading input from standard input.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));