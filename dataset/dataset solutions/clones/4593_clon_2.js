"use strict"; /* This directive enforces stricter parsing and error handling in the code. */
// Module to handle file system operations for input acquisition.
const dataStream = require("fs").readFileSync("/dev/stdin", "utf8");
// Array to hold parsed tokens from input, and an index for sequential access.
let tokenArray = dataStream.split(/ |\n/), tokenIndex = 0;

/* Helper function to retrieve the next numerical token. */
function readNum() {
  return Number(tokenArray[tokenIndex++]);
}

/* Helper function to retrieve the next string token. */
function readStr() {
  return tokenArray[tokenIndex++];
}

/* Helper function to retrieve the next BigInt token. */
function readBig() {
  return BigInt(tokenArray[tokenIndex++]);
}

/* Function to read a specified number of tokens into an array.
 * @param {number} elementCount - The number of tokens to read.
 * @param {boolean} asStrings - If true, return as strings; otherwise, convert to numbers. */
function getVec(elementCount, asStrings) {
  if (asStrings) {
    return tokenArray.slice(tokenIndex, tokenIndex += elementCount);
  } else {
    return tokenArray.slice(tokenIndex, tokenIndex += elementCount).map(val => Number(val));
  }
}

/* Function to read a 2D matrix of tokens.
 * @param {number} rowCount - Number of rows.
 * @param {number} colCount - Number of columns.
 * @param {boolean} asStrings - If true, return as strings; otherwise, convert to numbers. */
function getMat(rowCount, colCount, asStrings) {
  const resultMatrix = [];
  let currentMatrixRow = 0;
  if (asStrings) {
    for (; currentMatrixRow < rowCount; currentMatrixRow++) {
      resultMatrix.push(tokenArray.slice(tokenIndex, tokenIndex += colCount));
    }
  } else {
    for (; currentMatrixRow < rowCount; currentMatrixRow++) {
      resultMatrix.push(tokenArray.slice(tokenIndex, tokenIndex += colCount).map(val => Number(val)));
    }
  }
  return resultMatrix;
}

/* Function to create a multi-dimensional array initialized with a value. */
function createNestedArr(initialValue) {
  const args = arguments;
  let currentDimension = args.length - 1;
  let arrayCreationString = `Array(args[${currentDimension}]).fill().map(element => {return ${initialValue};})`;
  while (--currentDimension >= 0) {
    arrayCreationString = `Array(args[${currentDimension}]).fill().map(element => ${arrayCreationString})`;
  }
  return eval(arrayCreationString);
}


/* Computes shortest path distances from a starting point in a grid using BFS.
 * @param {Array<Array<string>>} levelMap - The 2D grid representing the environment.
 * @param {number} startXPos - X-coordinate of the starting point.
 * @param {number} startYPos - Y-coordinate of the starting point.
 * @returns {Array<Array<number>>} A grid with distances from the start point. */
function findShortestPaths(levelMap, startXPos, startYPos) {
  // Define grid element types and an unreachable distance constant.
  const emptyCell = ".", obstacleCell = "#", infinityValue = 1_000_000_000;

  // Retrieve dimensions of the map.
  const mapHeight = levelMap.length;
  const mapWidth = levelMap[0].length;

  // Initialize a distance grid with infinity values.
  const distanceGrid = Array(mapHeight).fill().map(() => Array(mapWidth).fill(infinityValue));

  // Define movement vectors for 4 directions (up, right, down, left).
  const deltaXCoords = [0, 1, 0, -1], deltaYCoords = [-1, 0, 1, 0], directionCount = 4;

  // Initialize BFS queue and the current distance level.
  let currentLevelQueue = [startXPos, startYPos], currentDistance = 1;

  // Set the distance for the starting cell to 0.
  distanceGrid[startYPos][startXPos] = 0;

  // Main BFS loop: continues as long as there are cells to process.
  while (currentLevelQueue.length > 0) {
    let nextLevelQueue = []; // Queue for the next level of neighbors.

    // Process all cells in the current level's queue.
    while (currentLevelQueue.length > 0) {
      const currentY = currentLevelQueue.pop(); // Get Y-coordinate.
      const currentX = currentLevelQueue.pop(); // Get X-coordinate.

      // Explore all four possible directions from the current cell.
      for (let directionIdx = 0; directionIdx < directionCount; directionIdx++) {
        const neighborX = currentX + deltaXCoords[directionIdx]; // Calculate neighbor's X.
        const neighborY = currentY + deltaYCoords[directionIdx]; // Calculate neighbor's Y.

        // Check if the neighbor is within grid boundaries.
        if (neighborX < 0 || neighborX === mapWidth || neighborY < 0 || neighborY === mapHeight) {
          continue; // Skip if out of bounds.
        }

        // Check if the neighbor is an obstacle or already visited with a shorter path.
        if (levelMap[neighborY][neighborX] === obstacleCell || distanceGrid[neighborY][neighborX] !== infinityValue) {
          continue; // Skip if obstacle or already processed.
        }

        // Mark the distance for the neighbor and add it to the next level's queue.
        distanceGrid[neighborY][neighborX] = currentDistance;
        nextLevelQueue.push(neighborX, neighborY);
      }
    }
    // Increment distance for the next level and update the current queue.
    currentDistance++;
    currentLevelQueue = nextLevelQueue;
  }
  return distanceGrid; // Return the grid of calculated distances.
}

// Execute the primary logic and store its return value.
const programResult = executeProblem();

// If the program produced an output, print it to the console.
if (programResult !== undefined) {
  console.log(programResult);
}

/* Main function encapsulating the problem's core logic. */
function executeProblem() {
  // Read grid dimensions and the maximum allowed steps.
  const problemHeight = readNum(), problemWidth = readNum(), maxSteps = readNum();
  // Read the input map, treating '1' as a flag for string input in getVec.
  const inputMap = getVec(problemHeight, 1);

  let startCellX, startCellY; // Coordinates for the 'S' (start) cell.

  // Iterate through the input map to locate the starting position 'S'.
  for (let rowIdx = 0; rowIdx < problemHeight; rowIdx++) {
    const sIndex = inputMap[rowIdx].indexOf("S"); // Find 'S' in the current row.
    if (sIndex >= 0) { // If 'S' is found.
      startCellX = sIndex;
      startCellY = rowIdx;
      break; // Exit loop once 'S' is located.
    }
  }

  // Calculate shortest distances from the starting cell to all other cells.
  const allDistances = findShortestPaths(inputMap, startCellX, startCellY);

  let minimumJumps = 1_000_000_000; // Initialize minimum jumps with a large value.

  // Iterate through each cell in the grid to find the minimum required jumps to an edge.
  for (let rowCoord = 0; rowCoord < problemHeight; rowCoord++) {
    for (let colCoord = 0; colCoord < problemWidth; colCoord++) {
      // Consider only cells reachable within 'maxSteps'.
      if (allDistances[rowCoord][colCoord] > maxSteps) {
        continue; // Skip if the cell is too far or unreachable.
      }

      // Calculate jumps needed to reach each of the four boundaries.
      const jumpsTop = Math.ceil(rowCoord / maxSteps);
      const jumpsLeft = Math.ceil(colCoord / maxSteps);
      const jumpsBottom = Math.ceil((problemHeight - rowCoord - 1) / maxSteps);
      const jumpsRight = Math.ceil((problemWidth - colCoord - 1) / maxSteps);

      // The total jumps from this cell is the minimum of these boundary jumps, plus one for the current segment.
      const currentCellJumps = Math.min(jumpsTop, jumpsLeft, jumpsBottom, jumpsRight) + 1;

      // Update the overall minimum jumps if a smaller value is found.
      if (currentCellJumps < minimumJumps) {
        minimumJumps = currentCellJumps;
      }
    }
  }
  return minimumJumps; // Return the final calculated minimum jumps.
}