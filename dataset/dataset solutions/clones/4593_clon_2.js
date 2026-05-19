"use strict";

// Core module for file system operations.
const fileSystem = require("fs");

// Read the entire standard input as a UTF-8 string.
const fileContent = fileSystem.readFileSync("/dev/stdin", "utf8");

// Split the input content by spaces or newlines to create an array of tokens.
const tokenArray = fileContent.split(/ |\n/);

// Initialize an index to keep track of the current token being processed.
let tokenIndex = 0;

/**
 * Retrieves the next token from the input array and converts it to a number.
 * @returns {number} The next number from the input.
 */
function getNextNumber() {
  return +tokenArray[tokenIndex++];
}

/**
 * Retrieves the next token from the input array as a string.
 * @returns {string} The next string from the input.
 */
function getNextString() {
  return tokenArray[tokenIndex++];
}

/**
 * Retrieves the next token from the input array and converts it to a BigInt.
 * @returns {BigInt} The next BigInt from the input.
 */
function getNextBigInt() {
  return BigInt(tokenArray[tokenIndex++]);
}

/**
 * Retrieves a slice of numbers or strings from the input array.
 * @param {number} count - The number of elements to retrieve.
 * @param {boolean} asStrings - If true, return elements as strings; otherwise, convert to numbers.
 * @returns {Array<number|string>} An array containing the requested elements.
 */
function getNumbersSlice(count, asStrings) {
  if (asStrings) {
    return tokenArray.slice(tokenIndex, (tokenIndex += count));
  } else {
    return tokenArray.slice(tokenIndex, (tokenIndex += count)).map((val) => +val);
  }
}

/**
 * Retrieves a 2D matrix of numbers or strings from the input array.
 * @param {number} rows - The number of rows in the matrix.
 * @param {number} cols - The number of columns in the matrix.
 * @param {boolean} asStrings - If true, return elements as strings; otherwise, convert to numbers.
 * @returns {Array<Array<number|string>>} A 2D array representing the matrix.
 */
function getMatrix(rows, cols, asStrings) {
  const matrixResult = [];
  let rowIndex = 0;
  if (asStrings) {
    for (; rowIndex < rows; rowIndex++) {
      matrixResult.push(tokenArray.slice(tokenIndex, (tokenIndex += cols)));
    }
  } else {
    for (; rowIndex < rows; rowIndex++) {
      matrixResult.push(tokenArray.slice(tokenIndex, (tokenIndex += cols)).map((val) => +val));
    }
  }
  return matrixResult;
}

/**
 * Creates a multi-dimensional array initialized with a given value.
 * This function uses `eval` and is generally for specific use cases.
 * @param {*} initialValue - The value to initialize array elements with.
 * @returns {Array} A multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  const args = arguments;
  let argLength = args.length;
  let evalString = "Array(args[" + --argLength + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--argLength) {
    evalString = "Array(args[" + argLength + "]).fill().map(x=>" + evalString + ")";
  }
  return eval(evalString);
}

/**
 * Calculates the shortest distance from a starting point to all reachable cells in a grid using BFS.
 * @param {Array<Array<string>>} inputGrid - The grid represented as a 2D array of characters.
 * @param {number} startXCoord - The starting X-coordinate.
 * @param {number} startYCoord - The starting Y-coordinate.
 * @returns {Array<Array<number>>} A 2D array where each cell contains the minimum distance from the start, or infinityVal if unreachable.
 */
function calculateGridDistances(inputGrid, startXCoord, startYCoord) {
  const pathChar = ".",
    obstacleChar = "#",
    infinityVal = 1_000_000_000; // A large number representing infinity

  const gridHeight = inputGrid.length;
  const gridWidth = inputGrid[0].length;

  // Initialize a 2D array to store distances, filled with infinityVal.
  const distanceMap = Array(gridHeight)
    .fill()
    .map(() => Array(gridWidth).fill(infinityVal));

  // Define directional changes for X and Y coordinates (up, right, down, left).
  const deltaX = [0, 1, 0, -1];
  const deltaY = [-1, 0, 1, 0];
  const directionCount = 4; // Number of possible directions.

  // Initialize the BFS queue with the starting coordinates.
  let currentQueue = [startXCoord, startYCoord];
  let currentDistance = 1; // Distance for the next layer of cells.

  // Set the distance for the starting cell to 0.
  distanceMap[startYCoord][startXCoord] = 0;

  // Perform BFS traversal.
  while (currentQueue.length > 0) {
    let nextQueue = []; // Queue for the next level of BFS.

    // Process all cells in the current level.
    while (currentQueue.length > 0) {
      const currentY = currentQueue.pop(); // Y-coordinate of the current cell.
      const currentX = currentQueue.pop(); // X-coordinate of the current cell.

      // Explore all four possible directions.
      for (let dirIdx = 0; dirIdx < directionCount; dirIdx++) {
        const nextX = currentX + deltaX[dirIdx];
        const nextY = currentY + deltaY[dirIdx];

        // Check if the next cell is within grid boundaries.
        if (nextX < 0 || nextX === gridWidth || nextY < 0 || nextY === gridHeight) {
          continue; // Out of bounds, skip.
        }

        // Check if the next cell is an obstacle or already visited with a shorter path.
        if (inputGrid[nextY][nextX] === obstacleChar || distanceMap[nextY][nextX] !== infinityVal) {
          continue; // Wall or already processed, skip.
        }

        // Update the distance for the next cell and add it to the next queue.
        distanceMap[nextY][nextX] = currentDistance;
        nextQueue.push(nextX, nextY);
      }
    }
    currentDistance++; // Increment distance for the next level.
    currentQueue = nextQueue; // Move to the next level's queue.
  }
  return distanceMap; // Return the completed distance map.
}

// Execute the main logic of the program.
const programOutput = executeMainLogic();

// If the main logic returns a value, print it to the console.
if (programOutput !== undefined) {
  console.log(programOutput);
}

/**
 * Main function to solve the problem.
 * Reads grid dimensions, finds a starting point, calculates distances,
 * and determines the minimum boundary moves.
 * @returns {number} The minimum number of moves to reach a boundary.
 */
function executeMainLogic() {
  const heightVal = getNextNumber();
  const widthVal = getNextNumber();
  const maxSteps = getNextNumber(); // Maximum steps allowed per move.

  // Read the grid data, treating each row as a string.
  const gridData = getNumbersSlice(heightVal, true);

  let startGridX, startGridY; // Coordinates of the starting point 'S'.

  // Find the starting position 'S' in the grid.
  for (let rowIdx = 0; rowIdx < heightVal; rowIdx++) {
    const foundCol = gridData[rowIdx].indexOf("S");
    if (foundCol >= 0) {
      startGridX = foundCol;
      startGridY = rowIdx;
      break; // Found 'S', exit loop.
    }
  }

  // Calculate all-pairs shortest paths from the starting point.
  const calculatedDistances = calculateGridDistances(gridData, startGridX, startGridY);

  let minimumMoves = 1000000000; // Initialize with a very large number.

  // Iterate through each cell in the grid to find the minimum boundary moves.
  for (let currY = 0; currY < heightVal; currY++) {
    for (let currX = 0; currX < widthVal; currX++) {
      // If the cell is unreachable or too far from the start, skip it.
      if (calculatedDistances[currY][currX] > maxSteps) {
        continue;
      }

      // Calculate moves needed to reach each boundary from the current cell.
      const distToTop = Math.ceil(currY / maxSteps);
      const distToLeft = Math.ceil(currX / maxSteps);
      const distToBottom = Math.ceil((heightVal - currY - 1) / maxSteps);
      const distToRight = Math.ceil((widthVal - currX - 1) / maxSteps);

      // The number of moves to reach any boundary from this cell is the minimum of these + 1 (for the current step).
      const currentMinBoundaryMoves = Math.min(distToTop, distToLeft, distToBottom, distToRight) + 1;

      // Update the overall minimum moves if a smaller value is found.
      if (currentMinBoundaryMoves < minimumMoves) {
        minimumMoves = currentMinBoundaryMoves;
      }
    }
  }
  return minimumMoves; // Return the final minimum number of moves.
}
