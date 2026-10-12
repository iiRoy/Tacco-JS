"use strict";

// This function processes the input data to calculate a specific value.
var ProcessInput = function (initialData) {
  // Clean and parse the raw input string into an array of numbers.
  initialData = initialData.trim().split(/\s+/).map((val) => val - 0);

  // Extract the dimensions of the matrix from the beginning of the array.
  var rowCount = initialData.shift(); // Number of rows (N)
  var colCount = initialData.shift(); // Number of columns (M)

  // Initialize a counter for the rank of the matrix.
  var currentRank = 0;

  // Create a new matrix object using the parsed dimensions and elements.
  var dataMatrix = new BinaryMatrix(rowCount, colCount, initialData);

  // Perform Gaussian elimination-like operations until the matrix is empty.
  while (dataMatrix.dataRows.length > 0) {
    let pivotRowIndex = 0; // Index to find the first row with a '1' in the current column.

    // Search for a row where the first element (current pivot column) is 1.
    for (let rIdx = 0; rIdx < dataMatrix.dataRows.length; rIdx++) {
      if (dataMatrix.dataRows[rIdx][0] === 1) break;
      pivotRowIndex++;
    }

    // If no row has a '1' in the current column, it means this column is linearly dependent.
    if (pivotRowIndex === dataMatrix.dataRows.length) {
      // Move the current column to the end and then delete it.
      dataMatrix.exchangeColumns(0, dataMatrix.dataRows[0].length - 1);
      dataMatrix.removeLastColumn();
    } else {
      // A pivot '1' is found, increment the rank.
      currentRank += 1;

      // Eliminate '1's below the pivot row in the current column using XOR operations.
      while (true) {
        let targetRowIndex = pivotRowIndex + 1; // Index to find the next row with a '1'.

        // Search for the next row below the pivot that also has a '1' in the current column.
        for (let rIdx = pivotRowIndex + 1; rIdx < dataMatrix.dataRows.length; rIdx++) {
          if (dataMatrix.dataRows[rIdx][0] === 1) break;
          targetRowIndex++;
        }

        // If no more '1's are found in the current column below the pivot, break.
        if (targetRowIndex === dataMatrix.dataRows.length) break;

        // XOR the pivot row with the target row to eliminate the '1'.
        dataMatrix.dataRows[targetRowIndex] = rowXOR(
          dataMatrix.dataRows[pivotRowIndex],
          dataMatrix.dataRows[targetRowIndex]
        );
      }

      // Move the processed pivot row to the end and then remove it.
      dataMatrix.exchangeRows(pivotRowIndex, dataMatrix.dataRows.length - 1);
      dataMatrix.removeLastRow();
    }
  }

  // Store the final computed rank.
  var finalRank = currentRank;

  // Define a large prime modulus for calculations.
  var primeMod = 998244353;

  // Initialize terms for power calculations.
  var powerTerm1 = 1;
  var powerTerm2 = 1;

  // Calculate 2^(M+N-1) mod primeMod.
  for (let iter = 1; iter <= colCount + rowCount - 1; iter++) {
    powerTerm1 += powerTerm1 - (2 * powerTerm1 > primeMod ? primeMod : 0);
  }

  // Calculate 2^(M+N-finalRank-1) mod primeMod.
  for (let iter = 1; iter <= colCount + rowCount - finalRank - 1; iter++) {
    powerTerm2 += powerTerm2 - (2 * powerTerm2 > primeMod ? primeMod : 0);
  }

  // Compute the final result as the difference of the two power terms.
  var result = powerTerm1 - powerTerm2;

  // Output the calculated result to the console.
  console.log(result);
};

// Helper function for binary XOR operation.
function binaryXOR(bit1, bit2) {
  return bit1 === bit2 ? 0 : 1;
}

// Helper function to perform XOR operation on two arrays (rows).
function rowXOR(sourceRow, targetRow) {
  return sourceRow.map((element, index) => binaryXOR(element, targetRow[index]));
}

// Constructor function for a BinaryMatrix.
function BinaryMatrix(totalRows, totalCols, flatData) {
  var self = this; // Reference to the current instance.
  self.dataRows = []; // Initialize an array to hold the matrix rows.

  // Initialize empty arrays for each row.
  for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) self.dataRows[rowIndex] = [];

  // Populate the matrix with elements from the flat data array.
  for (let rowIndex = 0; rowIndex < totalRows; rowIndex++) {
    for (let colIndex = 0; colIndex < totalCols; colIndex++) {
      self.dataRows[rowIndex][colIndex] = flatData[rowIndex * totalCols + colIndex];
    }
  }
}

// Generic helper function to swap two elements in an array.
function swapArrayItems(collection, firstIndex, secondIndex) {
  var tempA = collection[firstIndex];
  var tempB = collection[secondIndex];
  collection[firstIndex] = tempB;
  collection[secondIndex] = tempA;
}

// Prototype method to swap two rows in the matrix.
BinaryMatrix.prototype.exchangeRows = function (rowIdx1, rowIdx2) {
  var currentMatrix = this;
  swapArrayItems(currentMatrix.dataRows, rowIdx1, rowIdx2);
};

// Prototype method to remove the last row from the matrix.
BinaryMatrix.prototype.removeLastRow = function () {
  var currentMatrix = this;
  var rowCollection = currentMatrix.dataRows;
  rowCollection.pop(); // Remove the last element (row) from the array.
};

// Prototype method to swap two columns in the matrix.
BinaryMatrix.prototype.exchangeColumns = function (colIdx1, colIdx2) {
  var currentMatrix = this;
  // Iterate through each row and swap the elements at the specified column indices.
  for (let rowIter = 0; rowIter < currentMatrix.dataRows.length; rowIter++) {
    swapArrayItems(currentMatrix.dataRows[rowIter], colIdx1, colIdx2);
  }
};

// Prototype method to remove the last column from the matrix.
BinaryMatrix.prototype.removeLastColumn = function () {
  var currentMatrix = this;
  var rowCollection = currentMatrix.dataRows;
  var currentRowCount = rowCollection.length;

  // If there's only one column left, clear all rows.
  if (rowCollection[0].length === 1) currentMatrix.dataRows = [];

  // For each row, remove the last element (column).
  for (let rowIter = 0; rowIter < currentRowCount; rowIter++) {
    rowCollection[rowIter].pop();
  }
};

// Execute the main processing function with input read from stdin.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
