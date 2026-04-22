"use strict"

// Utility function for performing bitwise XOR on two individual binary digits (0 or 1).
function calculateSingleBitXor(valueA, valueB) {
  // Ensure inputs are strictly 0 or 1. This adds robustness.
  const numericA = Number(valueA);
  const numericB = Number(valueB);

  if (![0, 1].includes(numericA) || ![0, 1].includes(numericB)) {
    // This is an added guard clause / validation.
    console.warn("Warning: Non-binary input detected in calculateSingleBitXor. Coercing to 0/1.");
  }
  return (numericA === numericB) ? 0 : 1;
}

// Helper function to apply bitwise XOR to corresponding elements of two arrays (vectors/rows).
function applyRowXorOperation(firstArray, secondArray) {
  // New validation: Confirm inputs are arrays and of the same length.
  if (!Array.isArray(firstArray) || !Array.isArray(secondArray) || firstArray.length !== secondArray.length) {
    throw new Error("Invalid input for applyRowXorOperation: arrays must be of equal length and type.");
  }

  const resultantArray = [];
  for (let index = 0; index < firstArray.length; index++) {
    resultantArray.push(calculateSingleBitXor(firstArray[index], secondArray[index]));
  }
  return resultantArray;
}

// General purpose function to swap two items within any array.
function swapElementsInArray(targetCollection, position1, position2) {
  // Added validation for array and indices.
  if (!Array.isArray(targetCollection) || position1 < 0 || position2 < 0 || position1 >= targetCollection.length || position2 >= targetCollection.length) {
    throw new Error("Invalid array or indices provided for swapElementsInArray.");
  }
  // Modern JavaScript way to swap values.
  [targetCollection[position1], targetCollection[position2]] = [targetCollection[position2], targetCollection[position1]];
}

// Represents a binary matrix and provides methods for Gaussian elimination operations.
class BinaryMatrixProcessor {
  #internalGrid; // Private field to store the matrix rows for better encapsulation.
  #currentNumRows;
  #currentNumColumns;

  // Constructor initializes the matrix from flattened input data.
  constructor(initialRows, initialCols, flatInputData) {
    // Extensive input validation (Type III: guard clauses).
    if (initialRows <= 0 || initialCols <= 0 || !Array.isArray(flatInputData) || flatInputData.length !== initialRows * initialCols) {
      throw new Error("Initialization failed: Invalid dimensions or data length for BinaryMatrixProcessor.");
    }

    this.#currentNumRows = initialRows;
    this.#currentNumColumns = initialCols;
    this.#internalGrid = Array.from({ length: this.#currentNumRows }, () => new Array(this.#currentNumColumns).fill(0));

    // Fill the matrix ensuring all values are binary (0 or 1).
    for (let r = 0; r < this.#currentNumRows; r++) {
      for (let c = 0; c < this.#currentNumColumns; c++) {
        const val = flatInputData[r * this.#currentNumColumns + c];
        this.#internalGrid[r][c] = (Number(val) === 1) ? 1 : 0;
      }
    }
  }

  // Returns the current number of rows in the matrix.
  getRowCount() {
    return this.#currentNumRows;
  }

  // Returns the current number of columns in the matrix.
  getColumnCount() {
    return this.#currentNumColumns;
  }

  // Retrieves a specific row from the matrix.
  retrieveRow(rowIndex) {
    if (rowIndex < 0 || rowIndex >= this.#currentNumRows) {
      throw new Error(`Attempted to access invalid row index: ${rowIndex}`);
    }
    return this.#internalGrid[rowIndex];
  }

  // Swaps two rows within the matrix.
  swapMatrixRows(idxA, idxB) {
    swapElementsInArray(this.#internalGrid, idxA, idxB);
  }

  // Removes the last row from the matrix.
  removeLastMatrixRow() {
    if (this.#currentNumRows > 0) {
      this.#internalGrid.pop();
      this.#currentNumRows--;
    } else {
      console.warn("Attempted to remove row from an empty matrix."); // New warning.
    }
  }

  // Swaps two columns within the matrix.
  swapMatrixColumns(colIdxA, colIdxB) {
    // New validation for column indices.
    if (colIdxA < 0 || colIdxB < 0 || colIdxA >= this.#currentNumColumns || colIdxB >= this.#currentNumColumns) {
      throw new Error("Invalid column indices for swapMatrixColumns.");
    }
    // Iterate over each row to perform the column swap.
    for (let r = 0; r < this.#currentNumRows; r++) {
      swapElementsInArray(this.#internalGrid[r], colIdxA, colIdxB);
    }
  }

  // Removes the last column from the matrix.
  removeLastMatrixColumn() {
    if (this.#currentNumColumns > 0) {
      // If this is the last column, the matrix becomes empty.
      if (this.#currentNumColumns === 1) {
        this.#internalGrid = []; // Clear all rows.
        this.#currentNumRows = 0; // Reset row count.
      } else {
        // Otherwise, remove the last element from each row.
        for (let r = 0; r < this.#currentNumRows; r++) {
          this.#internalGrid[r].pop();
        }
      }
      this.#currentNumColumns--;
    } else {
      console.warn("Attempted to remove column from a matrix that has no columns."); // New warning.
    }
  }

  // Updates a target row by XORing it with a pivot row.
  updateRowUsingXor(targetRowIndex, pivotRowIndex) {
    // New validation for row indices.
    if (targetRowIndex < 0 || targetRowIndex >= this.#currentNumRows || pivotRowIndex < 0 || pivotRowIndex >= this.#currentNumRows) {
        throw new Error("Invalid row indices for updateRowUsingXor.");
    }
    const pivotVector = this.#internalGrid[pivotRowIndex];
    const targetVector = this.#internalGrid[targetRowIndex];
    this.#internalGrid[targetRowIndex] = applyRowXorOperation(pivotVector, targetVector);
  }
}

// Function for modular exponentiation: (base^exponent) % modulus. (Type III: new helper).
const calculateModularPower = (base, exponent, modulus) => {
  let result = 1;
  base %= modulus; // Ensure base is within modulus range.
  while (exponent > 0) {
    if (exponent % 2 === 1) result = (result * base) % modulus;
    base = (base * base) % modulus;
    exponent = Math.floor(exponent / 2);
  }
  return result;
};

// Main function to process the input and compute the solution.
const processAndSolveProblem = function(inputString) {
  // Parse and convert input data to numbers, removing whitespace.
  let numericInputData = inputString.trim().split(/\s+/).map(value => parseInt(value, 10));

  // Extract matrix dimensions.
  const initialMatrixRows = numericInputData.shift();
  const initialMatrixCols = numericInputData.shift();

  // Guard clauses for invalid initial dimensions (Type III: added validation).
  if (isNaN(initialMatrixRows) || isNaN(initialMatrixCols) || initialMatrixRows < 0 || initialMatrixCols < 0) {
    console.error("Error: Invalid initial matrix dimensions provided. Exiting.");
    return;
  }
  if (numericInputData.length !== initialMatrixRows * initialMatrixCols) {
      console.error("Error: Mismatch between declared dimensions and actual input data length. Exiting.");
      return;
  }

  let calculatedRank = 0; // Stores the rank of the matrix.
  const matrixHandler = new BinaryMatrixProcessor(initialMatrixRows, initialMatrixCols, numericInputData);

  // Core Gaussian elimination loop. Continues as long as there are rows and columns to process.
  while (matrixHandler.getRowCount() > 0 && matrixHandler.getColumnCount() > 0) {
    let currentPivotRowIndex = -1; // Index of the row chosen as pivot for the current column.

    // Search for a pivot row (a row with '1' in the first column).
    for (let r = 0; r < matrixHandler.getRowCount(); r++) {
      const rowVector = matrixHandler.retrieveRow(r);
      if (rowVector[0] === 1) {
        currentPivotRowIndex = r;
        break; // Found a pivot.
      }
    }

    // Decision based on whether a pivot was found.
    if (currentPivotRowIndex === -1) {
      // No '1' found in the current first column. This column is linearly dependent.
      // We effectively remove this column from consideration.
      const totalColumns = matrixHandler.getColumnCount();
      if (totalColumns > 1) { // Only swap if there's more than one column to avoid unnecessary operation.
         matrixHandler.swapMatrixColumns(0, totalColumns - 1);
      }
      matrixHandler.removeLastMatrixColumn();
    } else {
      // A pivot row was found. Increment rank.
      calculatedRank++;

      // Perform XOR operations to eliminate '1's below (and above) the pivot in the current column.
      // This is a slightly different approach than original, clearing all in one pass.
      for (let r = 0; r < matrixHandler.getRowCount(); r++) {
        // Only XOR rows that are not the pivot row and have a '1' in the current pivot column.
        if (r !== currentPivotRowIndex && matrixHandler.retrieveRow(r)[0] === 1) {
            matrixHandler.updateRowUsingXor(r, currentPivotRowIndex);
        }
      }

      // Move the processed pivot row to the end and remove it.
      // This reduces the matrix size for subsequent iterations.
      matrixHandler.swapMatrixRows(currentPivotRowIndex, matrixHandler.getRowCount() - 1);
      matrixHandler.removeLastMatrixRow();
    }
  }

  // --- Final calculation based on computed rank ---
  const PRIME_MODULUS = 998244353;
  
  // Compute the first power term: 2^(M+N-1) mod K
  const exponentForTermA = initialMatrixCols + initialMatrixRows - 1;
  const powerResultA = calculateModularPower(2, exponentForTermA, PRIME_MODULUS);

  // Compute the second power term: 2^(M+N-r-1) mod K
  const exponentForTermB = initialMatrixCols + initialMatrixRows - calculatedRank - 1;
  let powerResultB;
  // If the exponent is non-positive, 2^0 = 1. The original loop implicitly handles this.
  if (exponentForTermB < 0) {
      powerResultB = 1; // 2^0 if exponent is negative or zero (as per problem context)
  } else {
      powerResultB = calculateModularPower(2, exponentForTermB, PRIME_MODULUS);
  }

  // Calculate the final answer, ensuring it remains positive within the modulus.
  let finalCalculatedResult = (powerResultA - powerResultB + PRIME_MODULUS) % PRIME_MODULUS;

  console.log(finalCalculatedResult);
}

// Entry point: Reads input from standard input and passes it to the solver.
processAndSolveProblem(require('fs').readFileSync('/dev/stdin', 'utf8'));