"use strict";

// Main processing function
var ProcessInput = function(rawData) {
  // Type III: Refactor input parsing slightly, use parseInt explicitly
  const parsedTokens = rawData.trim().split(/\s+/);
  const numRows = parseInt(parsedTokens.shift(), 10);
  const numCols = parseInt(parsedTokens.shift(), 10);
  const matrixElements = parsedTokens.map(val => parseInt(val, 10));

  let matrixRank = 0;
  // Type II: Rename A to currentMatrix
  var currentMatrix = new BinaryMatrix(numRows, numCols, matrixElements);

  // Type III: Refactor the main while loop logic using findIndex and clearer variable names
  while (currentMatrix.rows.length > 0) {
    const currentRows = currentMatrix.rows;

    // Find the index of the first row that has a '1' in the first column
    const firstOneInColIdx = currentRows.findIndex(row => row[0] === 1);

    if (firstOneInColIdx === -1) { // No '1' found in the first column
      // Check if there are columns to process. If not, the matrix is effectively empty.
      if (currentRows.length > 0 && currentRows[0].length > 0) {
        // Move the last column to the first position and delete it.
        // This effectively removes the current first column (all zeros) and shifts the remaining columns.
        currentMatrix.swapColumn(0, currentRows[0].length - 1);
        currentMatrix.deleteColumn();
      } else if (currentRows.length > 0 && currentRows[0].length === 0) {
        // If rows exist but all columns are gone (e.g., matrix is [[]]),
        // then the matrix is effectively empty. Clear it to terminate the loop.
        currentMatrix.rows = [];
      }
    } else {
      matrixRank++;
      let currentPivotRowIdx = firstOneInColIdx; // This is the pivot row

      let nextOneSearchStartIdx = currentPivotRowIdx + 1;
      while (true) {
        // Find the next row below the pivot that has a '1' in the first column
        const nextOneInColIdx = currentRows.findIndex((row, idx) => idx >= nextOneSearchStartIdx && row[0] === 1);

        if (nextOneInColIdx === -1) { // No more '1's below the pivot
          break;
        }
        // XOR the target row with the pivot row
        currentRows[nextOneInColIdx] = applyRowXor(currentRows[currentPivotRowIdx], currentRows[nextOneInColIdx]);
        nextOneSearchStartIdx = nextOneInColIdx + 1; // Continue search from the row after the one just processed
      }
      // Move the pivot row to the end of the matrix and remove it
      currentMatrix.swapLow(currentPivotRowIdx, currentRows.length - 1);
      currentMatrix.deleteLow();
    }
  }

  // Type II: Rename K to modulusVal, term1 to firstTerm, term2 to secondTerm, ans to finalResult
  var modulusVal = 998244353;
  var firstTerm = 1;
  var secondTerm = 1;

  // Type III: Use a helper function for modular doubling
  for (let i = 1; i <= numCols + numRows - 1; i++) {
    firstTerm = doubleAndMod(firstTerm, modulusVal);
  }
  for (let i = 1; i <= numCols + numRows - matrixRank - 1; i++) {
    secondTerm = doubleAndMod(secondTerm, modulusVal);
  }

  var finalResult = firstTerm - secondTerm;
  console.log(finalResult);
};

// Type II: Rename xor to binaryXor
function binaryXor(valA, valB) {
  return valA === valB ? 0 : 1;
}

// Type II: Rename XOR to applyRowXor
function applyRowXor(row1, row2) {
  return row1.map((element, index) => binaryXor(element, row2[index]));
}

// Type II: Rename Matrix to BinaryMatrix
// Type II: Rename elements to matrixElements
function BinaryMatrix(numRows, numCols, matrixElements) {
  var self = this; // Type II: Rename A to self
  self.rows = []; // Type II: Rename A.low to self.rows

  // Type III: Initialize rows directly using Array.from and slice for conciseness
  for (let r = 0; r < numRows; r++) {
    self.rows.push(matrixElements.slice(r * numCols, (r + 1) * numCols));
  }
}

// Type II: Rename swap to exchangeElements
function exchangeElements(arr, idx1, idx2) {
  var tempA = arr[idx1];
  var tempB = arr[idx2];
  arr[idx1] = tempB;
  arr[idx2] = tempA;
}

// Type II: Rename Matrix.prototype.swapLow to BinaryMatrix.prototype.swapLow
BinaryMatrix.prototype.swapLow = function(idx1, idx2) {
  var self = this; // Type II: Rename A to self
  exchangeElements(self.rows, idx1, idx2);
};

// Type II: Rename Matrix.prototype.deleteLow to BinaryMatrix.prototype.deleteLow
BinaryMatrix.prototype.deleteLow = function() { // delete the last row.
  var self = this; // Type II: Rename A to self
  var currentRows = self.rows; // Type II: Rename L to currentRows
  currentRows.pop();
};

// Type II: Rename Matrix.prototype.swapColumn to BinaryMatrix.prototype.swapColumn
BinaryMatrix.prototype.swapColumn = function(colIdx1, colIdx2) {
  var self = this; // Type II: Rename A to self
  for (let r = 0; r < self.rows.length; r++) {
    exchangeElements(self.rows[r], colIdx1, colIdx2);
  }
};

// Type II: Rename Matrix.prototype.deleteColumn to BinaryMatrix.prototype.deleteColumn
BinaryMatrix.prototype.deleteColumn = function() { // delete the last Column.
  var self = this; // Type II: Rename A to self
  var currentRows = self.rows; // Type II: Rename L to currentRows

  if (currentRows.length === 0) {
    return; // No rows, nothing to do
  }

  // Type III: More explicit handling of matrix becoming empty
  // If there's only one column left, deleting it means the matrix becomes 0xN
  // The original code `if(L[0].length===1)A.low=[];` effectively clears the matrix.
  if (currentRows[0].length === 1) {
    self.rows = []; // If this was the last column, the matrix becomes empty
  } else {
    // Otherwise, remove the last element from each row
    for (let r = 0; r < currentRows.length; r++) {
      currentRows[r].pop();
    }
  }
};

// Type III: Add a small helper function for modular arithmetic (doubling)
function doubleAndMod(currentValue, modulus) {
  let nextValue = currentValue + currentValue;
  if (nextValue >= modulus) {
    nextValue -= modulus;
  }
  return nextValue;
}

// Type II: Rename Main to ProcessInput
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
