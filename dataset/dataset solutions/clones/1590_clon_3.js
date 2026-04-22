"use strict";

// This module handles reading input from stdin and processing it to find a solution.

// --- Input Processing Utilities ---
// Read raw input from standard input as a string.
const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
// Split the input into tokens by whitespace (spaces or newlines).
const inputTokens = rawInputData.split(/\s+/);
// Keep track of the current position in the token stream.
let currentTokenIndex = 0;

/**
 * Reads the next token from the input stream and converts it to an integer.
 * @returns {number} The next integer from the input.
 */
function readInteger() {
  return parseInt(inputTokens[currentTokenIndex++], 10);
}

/**
 * Reads the next token from the input stream as a string.
 * @returns {string} The next string from the input.
 */
function readStringToken() {
  return inputTokens[currentTokenIndex++];
}

/**
 * Reads the next token from the input stream and converts it to a BigInt.
 * @returns {BigInt} The next BigInt from the input.
 */
function readBigInteger() {
  return BigInt(inputTokens[currentTokenIndex++]);
}

/**
 * Reads 'count' number of tokens and converts them to integers.
 * @param {number} count The number of integers to read.
 * @returns {number[]} An array of integers.
 */
function readIntegerArray(count) {
  const resultArr = [];
  for (let idx = 0; idx < count; idx++) {
    resultArr.push(parseInt(inputTokens[currentTokenIndex++], 10));
  }
  return resultArr;
}

/**
 * Reads a matrix of dimensions 'height' x 'width' from the input stream.
 * @param {number} height The number of rows in the matrix.
 * @param {number} width The number of columns in the matrix.
 * @returns {number[][]} A 2D array representing the matrix.
 */
function readNumberMatrix(height, width) {
  const matrixRows = [];
  for (let r = 0; r < height; r++) {
    const currentRow = [];
    for (let c = 0; c < width; c++) {
      currentRow.push(parseInt(inputTokens[currentTokenIndex++], 10));
    }
    matrixRows.push(currentRow);
  }
  return matrixRows;
}

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * This function is a safe alternative to the original xArray which used eval.
 * @param {*} initialVal The value to initialize all elements with.
 * @param {...number} dimensions The sizes of each dimension.
 * @returns {Array} A multi-dimensional array.
 */
function createMultiDimArray(initialVal, ...dimensions) {
  if (dimensions.length === 0) {
    return initialVal;
  }

  const currentDimensionSize = dimensions[0];
  const remainingDimensions = dimensions.slice(1);

  const newArray = new Array(currentDimensionSize);
  for (let i = 0; i < currentDimensionSize; i++) {
    newArray[i] = createMultiDimArray(initialVal, ...remainingDimensions);
  }
  return newArray;
}

// --- Main Program Execution ---
const finalSolution = computeOptimalSolution();
if (finalSolution !== undefined) {
  console.log(String(finalSolution));
}

/**
 * The core logic of the program, calculating the optimal solution.
 * @returns {number} The calculated optimal value.
 */
function computeOptimalSolution() {
  // Read the primary dimension size for our dynamic programming table.
  const problemDimensionN = readInteger();

  // Initialize the dynamic programming table with -1.
  // The table will store maximum values for states (i, j).
  const memoizationTable = createMultiDimArray(-1, problemDimensionN + 1, problemDimensionN + 1);
  // An accumulator for a special type of increment.
  let cumulativeIncrement = 0;

  // Numerical sort comparison function for ascending order.
  const numericalSort = (valA, valB) => valA - valB;

  // Read the initial pair of values and sort them.
  const initialPair = readIntegerArray(2).sort(numericalSort);
  const firstVal = initialPair[0];
  const secondVal = initialPair[1];

  // Initialize base cases in the memoization table.
  // These represent initial states with a value of 0.
  memoizationTable[0][0] = 0;
  memoizationTable[0][firstVal] = 0;
  memoizationTable[0][secondVal] = 0;
  memoizationTable[firstVal][secondVal] = 0;

  // This queue will temporarily hold potential updates to the memoization table.
  // It stores entries as [newValue, colIndex, rowIndex].
  let pendingUpdatesQueue;

  // Process N-1 subsequent sets of three values.
  for (let iterationCount = 1; iterationCount < problemDimensionN; iterationCount++) {
    // Read the next triple of values and sort them.
    const currentTriple = readIntegerArray(3).sort(numericalSort);
    // Destructure for clarity.
    const coordP = currentTriple[0];
    const coordQ = currentTriple[1];
    const coordR = currentTriple[2];

    // Invoke the segment processing function.
    processCoordinateSegment(coordP, coordQ, coordR);
  }

  // Read the final single coordinate for the result calculation.
  const finalCoordinate = readInteger();

  // Calculate the final result.
  // If memoizationTable[finalCoordinate][finalCoordinate] is -1 (unreachable/not set),
  // it implies a value of -1 and then +1 becomes 0, so the max will be dp[0][0].
  // If it's a valid path, it adds 1 to that path's value.
  const finalPathValue = memoizationTable[finalCoordinate][finalCoordinate] !== -1 ?
                         memoizationTable[finalCoordinate][finalCoordinate] + 1 :
                         memoizationTable[0][0]; // If finalCoord path is not set, use dp[0][0] or default logic.

  return Math.max(memoizationTable[0][0], finalPathValue) + cumulativeIncrement;

  /**
   * Processes a segment defined by three coordinates (p, q, r).
   * This function orchestrates updates to the memoization table based on these coordinates.
   * @param {number} p The first coordinate.
   * @param {number} q The second coordinate.
   * @param {number} r The third coordinate.
   */
  function processCoordinateSegment(p, q, r) {
    // If the first and third coordinates are the same, it's a special case,
    // indicating a direct match or simplification, increment the counter.
    if (p === r) {
      cumulativeIncrement++;
      return;
    }

    // Initialize the queue for potential updates for this segment.
    pendingUpdatesQueue = [];

    // Apply updates related to single coordinates.
    applySingleCoordUpdates(p);
    // Only apply for q if it's distinct from p.
    if (p < q) {
      applySingleCoordUpdates(q);
    }
    // Only apply for r if it's distinct from q.
    if (q < r) {
      applySingleCoordUpdates(r);
    }

    // Apply updates related to pairs of coordinates.
    applyPairCoordUpdates(p, q);
    // Only apply for (p, r) if r is distinct from q.
    if (q < r) {
      applyPairCoordUpdates(p, r);
    }
    // Only apply for (q, r) if q is distinct from p.
    if (p < q) {
      applyPairCoordUpdates(q, r);
    }

    // Apply updates related to triples of coordinates.
    applyTripleCoordUpdates(p, q, r);

    // Process all pending updates from the queue.
    // The queue stores [newValue, colIdx, rowIdx] and pops in reverse order.
    while (pendingUpdatesQueue.length > 0) {
      const targetValue = pendingUpdatesQueue.pop(); // This is `z` in original
      const targetColumn = pendingUpdatesQueue.pop(); // This is `y` in original
      const targetRow = pendingUpdatesQueue.pop(); // This is `x` in original

      // Update the memoization table only if the new value is greater.
      if (memoizationTable[targetRow][targetColumn] < targetValue) {
        memoizationTable[targetRow][targetColumn] = targetValue;
      }
    }
  }

  /**
   * Enqueues a potential update to the memoization table without incrementing the value.
   * This is used when copying a value from one state to another if it's greater.
   * @param {number} targetRow The row index of the cell to potentially update.
   * @param {number} targetCol The column index of the cell to potentially update.
   * @param {number} sourceRow The row index of the source cell.
   * @param {number} sourceCol The column index of the source cell.
   */
  function enqueueValueTransfer(targetRow, targetCol, sourceRow, sourceCol) {
    const sourceValue = memoizationTable[sourceRow][sourceCol];
    const currentValue = memoizationTable[targetRow][targetCol];

    // Only enqueue if the source value is valid and greater than the current value.
    if (sourceValue !== -1 && currentValue < sourceValue) {
      pendingUpdatesQueue.push(sourceValue, targetCol, targetRow);
    }
  }

  /**
   * Enqueues a potential update to the memoization table, incrementing the value from the source.
   * This is used when a transition implies an increment.
   * @param {number} targetRow The row index of the cell to potentially update.
   * @param {number} targetCol The column index of the cell to potentially update.
   * @param {number} sourceRow The row index of the source cell.
   * @param {number} sourceCol The column index of the source cell.
   */
  function enqueueIncrementedValue(targetRow, targetCol, sourceRow, sourceCol) {
    const sourceValue = memoizationTable[sourceRow][sourceCol];
    const currentValue = memoizationTable[targetRow][targetCol];

    // Only enqueue if the source value is valid and the incremented value is greater.
    if (sourceValue !== -1 && currentValue < sourceValue + 1) {
      pendingUpdatesQueue.push(sourceValue + 1, targetCol, targetRow);
    }
  }

  /**
   * Applies specific update logic for a single coordinate 'coord'.
   * It populates the update queue based on various combinations involving '0' and 'coord'.
   * @param {number} coord The coordinate being processed.
   */
  function applySingleCoordUpdates(coord) {
    // Update (0,0) based on (coord, coord) with an increment.
    enqueueIncrementedValue(0, 0, coord, coord);

    // Loop through values smaller than 'coord'.
    for (let currentIdx = 0; currentIdx < coord; currentIdx++) {
      // Update (currentIdx, coord) based on (0, currentIdx) without increment.
      enqueueValueTransfer(currentIdx, coord, 0, currentIdx);
    }

    // Loop through values from 'coord' up to problemDimensionN.
    for (let currentIdx = coord; currentIdx <= problemDimensionN; currentIdx++) {
      // Update (coord, currentIdx) based on (0, currentIdx) without increment.
      enqueueValueTransfer(coord, currentIdx, 0, currentIdx);
    }
  }

  /**
   * Applies specific update logic for a pair of coordinates (coordA, coordB).
   * @param {number} coordA The first coordinate.
   * @param {number} coordB The second coordinate.
   */
  function applyPairCoordUpdates(coordA, coordB) {
    // Update (coordA, coordB) based on (0,0) without increment.
    enqueueValueTransfer(coordA, coordB, 0, 0);

    // Update (0, coordB) based on (coordA, coordA) with an increment.
    enqueueIncrementedValue(0, coordB, coordA, coordA);

    // Conditional logic based on whether coordA is less than coordB.
    if (coordA < coordB) {
      // If coordA < coordB, update (0, coordA) based on (coordB, coordB) with an increment.
      enqueueIncrementedValue(0, coordA, coordB, coordB);
    } else { // This implies coordA === coordB because inputs are sorted and unique within a pair (but can be same value if from different triples)
      // If coordA === coordB, iterate and apply further updates.
      for (let currentIdx = 0; currentIdx < coordA; currentIdx++) {
        // Update (0, currentIdx) based on (currentIdx, coordA) with an increment.
        enqueueIncrementedValue(0, currentIdx, currentIdx, coordA);
      }
      for (let currentIdx = coordA; currentIdx <= problemDimensionN; currentIdx++) {
        // Update (0, currentIdx) based on (coordA, currentIdx) with an increment.
        enqueueIncrementedValue(0, currentIdx, coordA, currentIdx);
      }
    }
  }

  /**
   * Applies specific update logic for a triple of coordinates (coordA, coordB, coordC).
   * This is the most complex update step with nested conditions.
   * @param {number} coordA The first coordinate.
   * @param {number} coordB The second coordinate.
   * @param {number} coordC The third coordinate.
   */
  function applyTripleCoordUpdates(coordA, coordB, coordC) {
    // Update (coordB, coordC) based on (coordA, coordA) with an increment.
    enqueueIncrementedValue(coordB, coordC, coordA, coordA);

    if (coordA < coordB) {
      // If coordA < coordB, update (coordA, coordC) based on (coordB, coordB) with an increment.
      enqueueIncrementedValue(coordA, coordC, coordB, coordB);
      if (coordB < coordC) {
        // If coordB < coordC, update (coordA, coordB) based on (coordC, coordC) with an increment.
        enqueueIncrementedValue(coordA, coordB, coordC, coordC);
      } else { // coordB === coordC
        for (let currentIdx = 0; currentIdx < coordA; currentIdx++) {
          enqueueIncrementedValue(currentIdx, coordA, currentIdx, coordC);
        }
        for (let currentIdx = coordA; currentIdx < coordC; currentIdx++) {
          enqueueIncrementedValue(coordA, currentIdx, currentIdx, coordC);
        }
        for (let currentIdx = coordC; currentIdx <= problemDimensionN; currentIdx++) {
          enqueueIncrementedValue(coordA, currentIdx, coordC, currentIdx);
        }
      }
    } else { // coordA === coordB
      // If coordA === coordB, update (coordA, coordA) based on (coordC, coordC) with an increment.
      enqueueIncrementedValue(coordA, coordA, coordC, coordC);
      for (let currentIdx = 0; currentIdx < coordA; currentIdx++) {
        enqueueIncrementedValue(currentIdx, coordC, currentIdx, coordA);
      }
      for (let currentIdx = coordA; currentIdx < coordC; currentIdx++) {
        enqueueIncrementedValue(currentIdx, coordC, coordA, currentIdx);
      }
      for (let currentIdx = coordC; currentIdx <= problemDimensionN; currentIdx++) {
        enqueueIncrementedValue(coordC, currentIdx, coordA, currentIdx);
      }
    }
  }
}