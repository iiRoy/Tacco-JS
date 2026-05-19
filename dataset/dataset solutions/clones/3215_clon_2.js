"use strict";

// Main processing function for the input data
const ProcessInput = function (rawData) {
  // Clean and parse the input string into an array of numbers
  let parsedData = rawData.trim().split(/\s+/).map(val => Number(val));

  // Extract dimensions: number of rows (N) and columns (M)
  const numRows = parsedData.shift();
  const numCols = parsedData.shift();

  let rankCount = 0; // Initialize rank counter for Gaussian elimination

  // Create a new binary matrix object
  const matrixObj = new BinaryMatrix(numRows, numCols, parsedData);

  // Perform Gaussian elimination until no rows remain
  while (matrixObj.rows.length > 0) {
    let firstOneIdx = 0; // Index to find the first row with a leading '1'

    // Search for the first row where the first element is '1'
    for (let loopIdx = 0; loopIdx < matrixObj.rows.length; loopIdx++) {
      if (matrixObj.rows[loopIdx][0] === 0b1) break; // Found a row starting with 1
      firstOneIdx++;
    }

    // If no row starts with '1' in the current first column
    if (firstOneIdx === matrixObj.rows.length) {
      // Move the first column to the end and then delete it
      matrixObj.exchangeColumn(0, matrixObj.rows[0].length - 0b1);
      matrixObj.removeColumn();
    } else {
      // A leading '1' was found, increment the rank
      rankCount += 0b1;

      // Eliminate '1's below the pivot
      while (true) {
        let secondOneIdx = firstOneIdx + 0b1; // Index to find subsequent rows with a leading '1'

        // Search for the next row (after firstOneIdx) where the first element is '1'
        for (let loopIdx = firstOneIdx + 0b1; loopIdx < matrixObj.rows.length; loopIdx++) {
          if (matrixObj.rows[loopIdx][0] === 0b1) break; // Found another row starting with 1
          secondOneIdx++;
        }

        // If no more '1's are found in the current column below the pivot
        if (secondOneIdx === matrixObj.rows.length) break;

        // XOR the current pivot row with the found row to eliminate the leading '1'
        matrixObj.rows[secondOneIdx] = bitwiseXORRows(matrixObj.rows[firstOneIdx], matrixObj.rows[secondOneIdx]);
      }

      // Move the processed pivot row to the end and remove it
      matrixObj.exchangeRow(firstOneIdx, matrixObj.rows.length - 0b1);
      matrixObj.removeRow();
    }
  }

  const finalRank = rankCount; // The determined rank of the matrix
  const modulusVal = 998_244_353; // A large prime modulus

  let factorOne = 0b1; // First term for calculation
  let factorTwo = 0b1; // Second term for calculation

  // Calculate 2^(M+N-1) mod K
  for (let loopIdx = 0b1; loopIdx <= numCols + numRows - 0b1; loopIdx++) {
    factorOne *= 0b10; // Multiply by 2
    if (factorOne >= modulusVal) factorOne -= modulusVal; // Apply modulo
  }

  // Calculate 2^(M+N-r-1) mod K
  for (let loopIdx = 0b1; loopIdx <= numCols + numRows - finalRank - 0b1; loopIdx++) {
    factorTwo *= 0b10; // Multiply by 2
    if (factorTwo >= modulusVal) factorTwo -= modulusVal; // Apply modulo
  }

  let resultValue = factorOne - factorTwo; // Calculate the difference

  // Ensure the result is positive after modulo operation
  if (resultValue < 0b0) resultValue += modulusVal;

  console.log(resultValue); // Output the final computed value
};

// Performs a single bit XOR operation
function singleBitXOR(bitA, bitB) {
  return bitA === bitB ? 0b0 : 0b1;
}

// Performs bitwise XOR on two arrays (rows)
function bitwiseXORRows(rowOne, rowTwo) {
  return rowOne.map((element, index) => singleBitXOR(element, rowTwo[index]));
}

// Constructor for a BinaryMatrix object
function BinaryMatrix(rowCount, colCount, initialElements) {
  const currentMatrix = this; // Reference to the current instance
  currentMatrix.rows = []; // Initialize an array to hold matrix rows

  // Initialize rows as empty arrays
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    currentMatrix.rows[rowIndex] = [];
  }

  // Populate the matrix with initial elements
  for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
    for (let colIndex = 0; colIndex < colCount; colIndex++) {
      currentMatrix.rows[rowIndex][colIndex] = initialElements[rowIndex * colCount + colIndex];
    }
  }
}

// Helper function to swap two elements in an array
function exchangeElements(targetArray, idx1, idx2) {
  const tempA = targetArray[idx1];
  const tempB = targetArray[idx2];
  targetArray[idx1] = tempB;
  targetArray[idx2] = tempA;
}

// Prototype method to swap two rows in the matrix
BinaryMatrix.prototype.exchangeRow = function (idx1, idx2) {
  const thisMatrix = this;
  exchangeElements(thisMatrix.rows, idx1, idx2);
};

// Prototype method to remove the last row from the matrix
BinaryMatrix.prototype.removeRow = function () {
  const thisMatrix = this;
  const rowCollection = thisMatrix.rows;
  rowCollection.pop(); // Remove the last element (row)
};

// Prototype method to swap two columns in the matrix
BinaryMatrix.prototype.exchangeColumn = function (idx1, idx2) {
  const thisMatrix = this;
  // Iterate through each row and swap elements at specified column indices
  for (let rowIndex = 0; rowIndex < thisMatrix.rows.length; rowIndex++) {
    exchangeElements(thisMatrix.rows[rowIndex], idx1, idx2);
  }
};

// Prototype method to remove the last column from the matrix
BinaryMatrix.prototype.removeColumn = function () {
  const thisMatrix = this;
  const rowCollection = thisMatrix.rows;
  const currentRowCount = rowCollection.length;

  // If there's only one column left, clear all rows
  if (rowCollection[0].length === 0b1) thisMatrix.rows = [];

  // Otherwise, remove the last element (column) from each row
  for (let rowIndex = 0; rowIndex < currentRowCount; rowIndex++) {
    rowCollection[rowIndex].pop();
  }
};

// Read input from stdin and pass it to the main processing function
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
