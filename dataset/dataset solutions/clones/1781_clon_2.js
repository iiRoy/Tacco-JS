"use strict";
let dataStream = require("node:fs").readFileSync("/dev/stdin", "utf8"); // Reads the entire input file as a UTF-8 string.
let inputBuffer = dataStream.split(/ |\n/); // Splits the input string by spaces or newlines into an array of strings.
let bufferIndex = 0; // Tracks the current position in the inputBuffer.

function readNumericValue() {
  // Retrieves and converts the next element from the buffer to a number.
  return Number(inputBuffer[bufferIndex++]);
}

function readNextWord() {
  // Retrieves the next element from the buffer as a string.
  return inputBuffer[bufferIndex++];
}

function readLargeInteger() {
  // Retrieves and converts the next element from the buffer to a BigInt.
  return BigInt(inputBuffer[bufferIndex++]);
}

function readMultipleValues(countElements, returnAsStrings) {
  // Reads 'countElements' items from the input buffer.
  // If 'returnAsStrings' is true, returns them as strings; otherwise, converts them to numbers.
  if (returnAsStrings) {
    return inputBuffer.slice(bufferIndex, (bufferIndex += countElements));
  } else {
    return inputBuffer.slice(bufferIndex, (bufferIndex += countElements)).map((element) => Number(element));
  }
}

function read2DMatrix(matrixHeight, matrixWidth, keepAsStringsFlag) {
  // Reads a 2D matrix of 'matrixHeight' rows and 'matrixWidth' columns.
  // If 'keepAsStringsFlag' is true, elements remain strings; otherwise, they are converted to numbers.
  const resultMatrix = [];
  let rowCounter = 0;
  if (keepAsStringsFlag) {
    for (; rowCounter < matrixHeight; rowCounter++) {
      resultMatrix.push(inputBuffer.slice(bufferIndex, (bufferIndex += matrixWidth)));
    }
  } else {
    for (; rowCounter < matrixHeight; rowCounter++) {
      resultMatrix.push(inputBuffer.slice(bufferIndex, (bufferIndex += matrixWidth)).map((item) => Number(item)));
    }
  }
  return resultMatrix;
}

function createNestingArray(defaultValue) {
  // Dynamically constructs a multi-dimensional array with a specified default value.
  // The dimensions are passed as subsequent arguments after 'defaultValue'.
  const allDimensions = arguments;
  let dimensionCount = allDimensions.length;
  // Builds the array creation string from the innermost dimension outwards.
  let arrayConstructionString = `Array(allDimensions[${--dimensionCount}]).fill().map(value => {return ${defaultValue};})`;
  while (--dimensionCount) {
    arrayConstructionString = `Array(allDimensions[${dimensionCount}]).fill().map(value => ${arrayConstructionString})`;
  }
  return eval(arrayConstructionString); // Executes the dynamically generated array creation code.
}

let programResult = executeProgram(); // Executes the main program logic.

if (programResult !== undefined) {
  console.log(String(programResult)); // Prints the result if it's not undefined.
}

function executeProgram() {
  // Main program logic for solving a pathfinding problem using Breadth-First Search (BFS).

  const infinityValue = 1e9; // Represents an unreachable state or maximum distance.
  // Delta coordinates for moving in four cardinal directions (up, right, down, left).
  const deltaX = [0, 1, 0, -1],
    deltaY = [-1, 0, 1, 0];
  const directionCount = 4; // Total number of possible movement directions.

  // Read grid dimensions (height, width) and maximum steps allowed per move.
  const [gridHeight, gridWidth, maxMoveDist] = readMultipleValues(3);
  // Read starting (startY, startX) and goal (goalY, goalX) coordinates.
  const [startYCoord, startXCoord, goalYCoord, goalXCoord] = readMultipleValues(4);

  // Initialize the grid map with extra rows/columns for boundary characters.
  const gridMap = Array(gridHeight + 2);
  const boundaryChar = '@'; // Character used to denote impassable boundaries.

  // Create the top boundary row.
  gridMap[0] = createNestingArray(`'${boundaryChar}'`, gridWidth + 2).join("");
  // Populate the actual grid rows, adding boundary characters to each side.
  for (let rowIdx = 0; rowIdx < gridHeight; rowIdx++) {
    gridMap[rowIdx + 1] = boundaryChar + readNextWord() + boundaryChar;
  }
  // Create the bottom boundary row.
  gridMap[gridHeight + 1] = createNestingArray(`'${boundaryChar}'`, gridWidth + 2).join("");

  // Initialize a 2D array to store minimum distances, filled with infinity.
  const distanceGrid = createNestingArray(infinityValue, gridHeight + 2, gridWidth + 2);
  // The distance to the starting point is 0.
  distanceGrid[startYCoord][startXCoord] = 0;

  // Initialize the BFS queue with the starting coordinates.
  let currentLevelQueue = [startYCoord, startXCoord];
  let currentDepth = 0; // Represents the current BFS level (distance from start).

  // Perform BFS. The loop continues as long as there are cells to process in the current level.
  while (currentLevelQueue.length > 0) {
    let nextLevelQueue = []; // Queue to store cells for the next BFS level.
    while (currentLevelQueue.length > 0) {
      // Pop coordinates from the current level queue.
      // Note: The original pushing order was Y then X, so popping order is X then Y.
      let currentXPosition = currentLevelQueue.pop();
      let currentYPosition = currentLevelQueue.pop();

      // Explore all four cardinal directions.
      for (let directionIdx = 0; directionIdx < directionCount; directionIdx++) {
        let nextXPosition = currentXPosition;
        let nextYPosition = currentYPosition;

        // Try moving up to 'maxMoveDist' steps in the current direction.
        for (let stepCount = 0; stepCount < maxMoveDist; stepCount++) {
          nextXPosition += deltaX[directionIdx];
          nextYPosition += deltaY[directionIdx];

          // If the next cell is a boundary, stop moving further in this direction.
          if (gridMap[nextYPosition][nextXPosition] === boundaryChar) break;
          // If a path to this cell with an equal or shorter distance has already been found, stop.
          if (distanceGrid[nextYPosition][nextXPosition] <= currentDepth) break;

          // If this is a new shortest path, update the distance and add to the next level queue.
          distanceGrid[nextYPosition][nextXPosition] = currentDepth + 1;
          nextLevelQueue.push(nextYPosition, nextXPosition);
        }
      }
    }
    currentLevelQueue = nextLevelQueue; // Advance to the next level.
    currentDepth++; // Increment the BFS depth.
  }

  // Return the shortest distance to the goal, or -1 if the goal is unreachable.
  return distanceGrid[goalYCoord][goalXCoord] === infinityValue ? -1 : distanceGrid[goalYCoord][goalXCoord];
}