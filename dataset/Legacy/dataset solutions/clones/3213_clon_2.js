"use strict";

// This function processes the input data to perform matrix operations
// and calculate a final result based on rank.
var ProcessInput = function (rawData) {
  // Trim whitespace, split by any whitespace, and convert each part to a number.
  rawData = rawData.trim().split(/\s+/).map((val) => val - 0.0);

  // Extract the number of rows and columns from the beginning of the input.
  var numRows = rawData.shift();
  var numCols = rawData.shift();

  // Initialize a counter for the rank of the matrix.
  var currentRank = 0;

  // Create a new binary matrix instance using the provided dimensions and elements.
  var matrixInstance = new BinaryMatrix(numRows, numCols, rawData);

  // Continue processing as long as there are rows in the matrix.
  while (matrixInstance.dataRows.length > 0) {
    let firstOneIndex = 0; // Index to find the first row starting with 1

    // Iterate through the current rows to find one that starts with 1.
    for (let idx = 0; idx < matrixInstance.dataRows.length; idx++) {
      if (matrixInstance.dataRows[idx][0] === 1.0) {
        break; // Found a row starting with 1
      }
      firstOneIndex++;
    }

    // If no row starts with 1 in the current first column.
    if (firstOneIndex === matrixInstance.dataRows.length) {
      // Move the first column to the end and then delete it.
      matrixInstance.exchangeColumns(0, matrixInstance.dataRows[0].length - 1);
      matrixInstance.removeLastColumn();
    } else {
      // A row starting with 1 was found, increment the rank.
      currentRank += 1;

      // Perform XOR operations to eliminate other rows starting with 1 in the first column.
      while (true) {
        let nextOneIndex = firstOneIndex + 1; // Index to find the next row starting with 1

        // Search for another row starting with 1 after the current `firstOneIndex`.
        for (let idx = firstOneIndex + 1; idx < matrixInstance.dataRows.length; idx++) {
          if (matrixInstance.dataRows[idx][0] === 1.0) {
            break; // Found another row starting with 1
          }
          nextOneIndex++;
        }

        // If no more rows starting with 1 are found, break the inner loop.
        if (nextOneIndex === matrixInstance.dataRows.length) {
          break;
        }

        // XOR the current row (at `firstOneIndex`) with the found row (at `nextOneIndex`).
        matrixInstance.dataRows[nextOneIndex] = performVectorXOR(
          matrixInstance.dataRows[firstOneIndex],
          matrixInstance.dataRows[nextOneIndex]
        );
      }

      // Move the processed row to the end and then delete it.
      matrixInstance.exchangeRows(firstOneIndex, matrixInstance.dataRows.length - 1);
      matrixInstance.removeLastRow();
    }
  }

  // Store the final calculated rank.
  var finalRank = currentRank;

  // Calculate the final result using the given formula.
  var resultValue =
    Math.pow(2, numRows + numCols - 1) -
    Math.pow(2, Math.min(numCols, numRows) - finalRank + Math.max(numCols, numRows) - 1);

  // Output the calculated result to the console.
  console.log(resultValue);
};

// Performs a binary XOR operation on two single values.
function binaryXOR(valA, valB) {
  return valA === valB ? 0.0 : 1.0;
}

// Performs a binary XOR operation on two arrays (vectors) element-wise.
function performVectorXOR(vectorOne, vectorTwo) {
  return vectorOne.map((element, index) => binaryXOR(element, vectorTwo[index]));
}

// Constructor for a BinaryMatrix object.
// `rowsCount` is the number of rows, `colsCount` is the number of columns.
// `initialElements` is a flat array of all matrix elements.
function BinaryMatrix(rowsCount, colsCount, initialElements) {
  var currentMatrix = this; // Alias for 'this' to avoid confusion in nested scopes.
  currentMatrix.dataRows = []; // Initialize an array to hold the matrix rows.

  // Initialize the `dataRows` with empty arrays for each row.
  for (let rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
    currentMatrix.dataRows[rowIndex] = [];
  }

  // Populate the matrix with elements from the `initialElements` array.
  for (let rowIndex = 0; rowIndex < rowsCount; rowIndex++) {
    for (let colIndex = 0; colIndex < colsCount; colIndex++) {
      currentMatrix.dataRows[rowIndex][colIndex] = initialElements[rowIndex * colsCount + colIndex];
    }
  }
}

// Helper function to swap two elements in an array.
function exchangeElements(targetArray, indexA, indexB) {
  var tempA = targetArray[indexA];
  var tempB = targetArray[indexB];
  targetArray[indexA] = tempB;
  targetArray[indexB] = tempA;
}

// Prototype method to swap two rows in the matrix.
BinaryMatrix.prototype.exchangeRows = function (rowIdx1, rowIdx2) {
  var thisMatrix = this;
  exchangeElements(thisMatrix.dataRows, rowIdx1, rowIdx2);
};

// Prototype method to remove the last row from the matrix.
BinaryMatrix.prototype.removeLastRow = function () {
  var thisMatrix = this;
  var matrixRows = thisMatrix.dataRows;
  matrixRows.pop(); // Remove the last element (row) from the array.
};

// Prototype method to swap two columns in the matrix.
BinaryMatrix.prototype.exchangeColumns = function (colIdx1, colIdx2) {
  var thisMatrix = this;
  // Iterate through each row and swap the elements at the specified column indices.
  for (let rowIterator = 0; rowIterator < thisMatrix.dataRows.length; rowIterator++) {
    exchangeElements(thisMatrix.dataRows[rowIterator], colIdx1, colIdx2);
  }
};

// Prototype method to remove the last column from the matrix.
BinaryMatrix.prototype.removeLastColumn = function () {
  var thisMatrix = this;
  var matrixRows = thisMatrix.dataRows;
  var numCurrentRows = matrixRows.length;

  // If the matrix becomes empty after removing the last column, clear dataRows.
  if (numCurrentRows > 0 && matrixRows[0].length === 1) {
    thisMatrix.dataRows = [];
    return;
  }

  // For each row, remove the last element (column).
  for (let rowIterator = 0; rowIterator < numCurrentRows; rowIterator++) {
    matrixRows[rowIterator].pop();
  }
};

// Read input from stdin and pass it to the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
