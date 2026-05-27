"use strict";

// Helper function for parsing raw string input into an array of numbers
function parseNumericInput(rawInputString) {
  return rawInputString.trim().split(/\s+/).map(val => Number(val));
}

// Utility function to swap two elements in an array by their indices
function exchangeElements(arr, idx1, idx2) {
  const temp = arr[idx1];
  arr[idx1] = arr[idx2];
  arr[idx2] = temp;
}

// Class representing a binary matrix, providing methods for common matrix operations
class BinaryMatrix {
  constructor(numRows, numCols, matrixElements) {
    this.rows = Array(numRows).fill(null).map(() => Array(numCols));
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        this.rows[r][c] = matrixElements[r * numCols + c];
      }
    }
  }

  // Private static helper for a single binary XOR operation
  static #binaryXor(val1, val2) {
    return val1 === val2 ? 0 : 1;
  }

  // Static method to perform XOR operation between two rows (arrays)
  static xorRows(rowA, rowB) {
    return rowA.map((element, index) => BinaryMatrix.#binaryXor(element, rowB[index]));
  }

  // Swaps two rows of the matrix
  swapRows(idx1, idx2) {
    exchangeElements(this.rows, idx1, idx2);
  }

  // Removes the last row from the matrix
  removeLastRow() {
    this.rows.pop();
  }

  // Swaps two columns of the matrix
  swapColumns(colIdx1, colIdx2) {
    for (let r = 0; r < this.rows.length; r++) {
      exchangeElements(this.rows[r], colIdx1, colIdx2);
    }
  }

  // Removes the last column from the matrix
  removeLastColumn() {
    if (this.rows.length === 0) return; // No rows, nothing to do
    if (this.rows[0].length === 1) { // If only one column remains, the matrix becomes empty
      this.rows = [];
      return;
    }
    for (let r = 0; r < this.rows.length; r++) {
      this.rows[r].pop();
    }
  }
}

// Helper function to calculate 2 raised to an exponent, modulo a given modulus
function calculateModularPowerOfTwo(exponent, modulus) {
  let currentTerm = 1;
  for (let i = 0; i < exponent; i++) {
    currentTerm = (currentTerm * 2) % modulus;
  }
  return currentTerm;
}

// Main function to process input and compute the result
const processInput = function(rawData) {
  const numericData = parseNumericInput(rawData);
  const initialNumRows = numericData.shift();
  const initialNumCols = numericData.shift();
  let matrixRank = 0;

  const matrixInstance = new BinaryMatrix(initialNumRows, initialNumCols, numericData);

  // Main loop for Gaussian elimination to determine the rank of the binary matrix
  while (matrixInstance.rows.length > 0 && matrixInstance.rows[0].length > 0) {
    let currentPivotRowIndex = 0;
    // Search for the first row containing a '1' in the current (first) column
    for (let r = 0; r < matrixInstance.rows.length; r++) {
      if (matrixInstance.rows[r][0] === 1) {
        currentPivotRowIndex = r;
        break;
      }
      currentPivotRowIndex++;
    }

    if (currentPivotRowIndex === matrixInstance.rows.length) { // No '1' found in the current first column
      // If no pivot is found, move the current first column to the end and then remove it
      matrixInstance.swapColumns(0, matrixInstance.rows[0].length - 1);
      matrixInstance.removeLastColumn();
    } else { // A pivot '1' was found at currentPivotRowIndex
      matrixRank += 1;
      // Perform XOR operations to eliminate '1's below the pivot in the current column
      while (true) {
        let targetRowIndex = currentPivotRowIndex + 1; // Reset targetRowIndex for each iteration
        // Find the next row (after currentPivotRowIndex) with a '1' in the current first column
        for (let r = currentPivotRowIndex + 1; r < matrixInstance.rows.length; r++) {
          if (matrixInstance.rows[r][0] === 1) {
            targetRowIndex = r;
            break;
          }
          targetRowIndex++;
        }
        if (targetRowIndex === matrixInstance.rows.length) break; // No more '1's below the pivot
        // XOR the target row with the pivot row to eliminate the '1'
        matrixInstance.rows[targetRowIndex] = BinaryMatrix.xorRows(matrixInstance.rows[currentPivotRowIndex], matrixInstance.rows[targetRowIndex]);
      }
      // After all eliminations for the current pivot, move the pivot row to the end and remove it
      matrixInstance.swapRows(currentPivotRowIndex, matrixInstance.rows.length - 1);
      matrixInstance.removeLastRow();
    }
  }

  const finalRank = matrixRank;
  const modulusVal = 998244353; // The given modulus

  // Calculate 2^(initialNumRows + initialNumCols - 1) modulo modulusVal
  const powerOfTwoNPlusMMinusOne = calculateModularPowerOfTwo(initialNumRows + initialNumCols - 1, modulusVal);

  // Calculate 2^(initialNumRows + initialNumCols - finalRank - 1) modulo modulusVal
  const powerOfTwoNPlusMMinusRankMinusOne = calculateModularPowerOfTwo(initialNumRows + initialNumCols - finalRank - 1, modulusVal);

  // Compute the final result, ensuring it is positive modulo modulusVal
  const resultValue = (powerOfTwoNPlusMMinusOne - powerOfTwoNPlusMMinusRankMinusOne + modulusVal) % modulusVal;

  console.log(resultValue);
};

// Read input from stdin and pass it to the main processing function
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
