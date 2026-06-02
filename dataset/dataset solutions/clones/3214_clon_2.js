"use strict";

// This function processes the input data to perform matrix operations and calculate a result.
var ProcessInput = function(rawData) {
  // Clean and parse the raw input string into an array of numbers.
  rawData = rawData.trim().split(/\s+/).map(val => val - 0);

  // Extract the dimensions of the matrix.
  var numRows = rawData.shift(); // Number of rows
  var numCols = rawData.shift(); // Number of columns

  var rankCount = 0; // Initialize a counter for the matrix rank.

  // Create a new matrix object using the parsed dimensions and elements.
  var matrixObj = new LinearMatrix(numRows, numCols, rawData);

  // Perform Gaussian elimination-like operations on the matrix.
  // Continue as long as there are rows in the matrix.
  while (matrixObj.dataRows.length > 0) {
    let firstOneIdx = 0; // Index to find the first row with a '1' in the first column.
    // Iterate through the current rows to find a row starting with '1'.
    for (let loopVar = 0; loopVar < matrixObj.dataRows.length; loopVar++) {
      if (matrixObj.dataRows[loopVar][0] === 1) break; // Found a row starting with '1'.
      firstOneIdx++;
    }

    // If no row starts with '1' in the first column, it means the column is all zeros.
    if (firstOneIdx === matrixObj.dataRows.length) {
      // Move the first column to the end and then delete it.
      matrixObj.exchangeColumns(0, matrixObj.dataRows[0].length - 1);
      matrixObj.removeLastColumn();
    } else {
      // A pivot '1' is found, increment the rank.
      rankCount += 1;
      // Perform XOR operations to eliminate other '1's in the first column below the pivot.
      while (true) {
        let secondOneIdx = firstOneIdx + 1; // Index to find the next row with a '1'.
        // Search for the next row with a '1' in the first column.
        for (let loopVar = firstOneIdx + 1; loopVar < matrixObj.dataRows.length; loopVar++) {
          if (matrixObj.dataRows[loopVar][0] === 1) break;
          secondOneIdx++;
        }
        // If no more '1's are found in the column, break the inner loop.
        if (secondOneIdx === matrixObj.dataRows.length) break;

        // XOR the current row with the pivot row to eliminate the '1'.
        matrixObj.dataRows[secondOneIdx] = rowXOR(matrixObj.dataRows[firstOneIdx], matrixObj.dataRows[secondOneIdx]);
      }
      // Move the pivot row to the end and then delete it.
      matrixObj.exchangeRows(firstOneIdx, matrixObj.dataRows.length - 1);
      matrixObj.removeLastRow();
    }
  }

  // After matrix reduction, calculate the final result using modular arithmetic.
  var finalRank = rankCount;
  var modulusVal = 998244353; // A large prime modulus.

  var factorOne = 1; // First term for calculation.
  var factorTwo = 1; // Second term for calculation.

  // Calculate 2^(numCols + numRows - 1) mod modulusVal.
  for (let loopVar = 1; loopVar <= numCols + numRows - 1; loopVar++) {
    factorOne += factorOne - (2 * factorOne >= modulusVal ? modulusVal : 0);
  }

  // Calculate 2^(numCols + numRows - finalRank - 1) mod modulusVal.
  for (let loopVar = 1; loopVar <= numCols + numRows - finalRank - 1; loopVar++) {
    factorTwo += factorTwo - (2 * factorTwo >= modulusVal ? modulusVal : 0);
  }

  // The final answer is the difference of the two terms modulo modulusVal.
  var resultValue = factorOne - factorTwo;
  console.log(resultValue); // Output the computed result.
};

// Helper function for binary XOR operation.
function binaryXOR(valA, valB) {
  return valA === valB ? 0 : 1;
}

// Helper function to perform XOR operation on two arrays (rows).
function rowXOR(arrayOne, arrayTwo) {
  return arrayOne.map((elementVal, indexPos) => binaryXOR(elementVal, arrayTwo[indexPos]));
}

// Constructor for the LinearMatrix object.
function LinearMatrix(rowsCount, colsCount, inputElements) {
  var thisMatrix = this; // Reference to the current instance.
  thisMatrix.dataRows = []; // Initialize an array to hold matrix rows.

  // Initialize rows as empty arrays.
  for (let rowIndex = 0; rowIndex < rowsCount; rowIndex++) thisMatrix.dataRows[rowIndex] = [];

  // Populate the matrix with elements from the input array.
  for (let rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
    for (let colIndex = 0; colIndex < colsCount; colIndex++) {
      thisMatrix.dataRows[rowIndex][colIndex] = inputElements[rowIndex * colsCount + colIndex];
    }
  }
}

// Generic helper function to swap two elements in an array.
function exchangeElements(targetArray, idxA, idxB) {
  var tempA = targetArray[idxA];
  var tempB = targetArray[idxB];
  targetArray[idxA] = tempB;
  targetArray[idxB] = tempA;
}

// Prototype method to swap two rows in the matrix.
LinearMatrix.prototype.exchangeRows = function(rowIdx1, rowIdx2) {
  var currentMatrix = this;
  exchangeElements(currentMatrix.dataRows, rowIdx1, rowIdx2);
};

// Prototype method to remove the last row from the matrix.
LinearMatrix.prototype.removeLastRow = function() {
  var currentMatrix = this;
  var rowCollection = currentMatrix.dataRows;
  rowCollection.pop(); // Remove the last element (row).
};

// Prototype method to swap two columns in the matrix.
LinearMatrix.prototype.exchangeColumns = function(colIdx1, colIdx2) {
  var currentMatrix = this;
  // Iterate through each row and swap the elements at the specified column indices.
  for (let rowIndex = 0; rowIndex < currentMatrix.dataRows.length; rowIndex++) {
    exchangeElements(currentMatrix.dataRows[rowIndex], colIdx1, colIdx2);
  }
};

// Prototype method to remove the last column from the matrix.
LinearMatrix.prototype.removeLastColumn = function() {
  var currentMatrix = this;
  var rowCollection = currentMatrix.dataRows;
  var numRowsInMatrix = rowCollection.length;

  // If there's only one column left, clear all rows.
  if (rowCollection[0].length === 1) currentMatrix.dataRows = [];

  // Otherwise, remove the last element from each row.
  for (let rowIndex = 0; rowIndex < numRowsInMatrix; rowIndex++) {
    rowCollection[rowIndex].pop();
  }
};

// Read input from standard input and pass it to the main processing function.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
