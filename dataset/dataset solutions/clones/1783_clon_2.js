"use strict";

// Retrieve input data from the file system
var fileSource = require("node:fs").readFileSync("/dev/stdin", "utf8");

// Parse the raw input string into an array of tokens
var parsedTokens = fileSource.split(/ |\n/);
var tokenPointer = 0; // Index to keep track of the current token

/*
 * Function to extract the next numerical value from the token stream.
 * Converts the string token to a number using the unary plus operator.
 */
function obtainNumber() {
    return +parsedTokens[tokenPointer++];
}

// Function to get the next string token directly.
function obtainString() {
    return parsedTokens[tokenPointer++];
}

/**
 * Retrieves the subsequent token and casts it to a BigInt.
 * This is useful for handling integer values beyond the standard Number type's safe range.
 */
function obtainLargeInt() {
    return BigInt(parsedTokens[tokenPointer++]);
}

/*
 * Fetches a specified 'count' of tokens from the input.
 * If 'isStringArray' is true, the tokens are returned as strings;
 * otherwise, they are mapped to numbers.
 */
function obtainMultipleValues(count, isStringArray) {
    if (isStringArray) {
        return parsedTokens.slice(tokenPointer, (tokenPointer += count));
    } else {
        return parsedTokens.slice(tokenPointer, (tokenPointer += count)).map(item => +item);
    }
}

// Reads a 2D matrix of dimensions 'rows' x 'columns' from the token stream.
// 'isStrMatrix' dictates if elements are kept as strings or converted to numbers.
function obtainMatrix(rows, columns, isStrMatrix) {
    let resultGrid = [];
    let currentRow = 0;
    while (currentRow < rows) {
        if (isStrMatrix) {
            resultGrid.push(parsedTokens.slice(tokenPointer, (tokenPointer += columns)));
        } else {
            resultGrid.push(parsedTokens.slice(tokenPointer, (tokenPointer += columns)).map(val => +val));
        }
        currentRow++;
    }
    return resultGrid;
}

// Utility to create a multi-dimensional array dynamically.
// The dimensions are passed as subsequent arguments after the 'initialValue'.
function buildMultiArray(initialValue) {
    var functionArguments = arguments,
        argumentCount = functionArguments.length,
        arrayCreationCode = "Array(functionArguments[" + --argumentCount + "]).fill().map(element => { return " + initialValue + "; })";
    while (--argumentCount) {
        arrayCreationCode = "Array(functionArguments[" + argumentCount + "]).fill().map(element => " + arrayCreationCode + ")";
    }
    return eval(arrayCreationCode);
}


// --- Main Program Execution ---
var executionResult = performCalculation(); // Execute the core logic.
if (executionResult !== undefined) {
    console.log(String(executionResult)); // Output the result if not null or undefined.
}


// The central function containing the problem-solving algorithm (BFS for shortest path).
function performCalculation() {
  const maximumValue = 1_000_000_000; // Represents an unreachable distance (infinity).
  const deltaCoordsX = [0, 1, 0, -1]; // Array for changes in X-coordinate (right, down, left, up).
  const deltaCoordsY = [-1, 0, 1, 0]; // Array for changes in Y-coordinate (up, right, down, left).
  const totalDirections = 4; // Total number of cardinal directions for movement.

  // Read grid dimensions (height, width) and maximum movement length 'k'.
  var [gridRows, gridCols, maxMoveLength] = obtainMultipleValues(3);
  // Read starting (sy, sx) and ending (gy, gx) coordinates.
  var [startYPos, startXPos, endYPos, endXPos] = obtainMultipleValues(4);

  // Construct the map layout with an extra border of obstacles around it.
  var mapLayout = Array(gridRows + 2);
  mapLayout[0] = buildMultiArray("'#'", gridCols + 2).join(""); // Top boundary row.
  for (let rowIterator = 0; rowIterator < gridRows; rowIterator++) {
    mapLayout[rowIterator + 1] = "#" + obtainString() + "#"; // Map rows with left/right boundaries.
  }
  mapLayout[gridRows + 1] = buildMultiArray("'#'", gridCols + 2).join(""); // Bottom boundary row.

  // Initialize a 2D array to store minimum distances, all set to maximumValue initially.
  var distanceRecord = buildMultiArray(maximumValue, gridRows + 2, gridCols + 2);
  distanceRecord[startYPos][startXPos] = 0; // The distance to the starting point is zero.

  // Initialize the BFS queue with the starting coordinates and the current path distance.
  var currentLevelQueue = [startYPos, startXPos];
  var currentPathDistance = 0;

  // Begin the Breadth-First Search process.
  while (currentLevelQueue.length > 0) {
    var nextLevelQueue = []; // This queue will hold nodes for the next distance level.

    // Process all nodes currently in the 'currentLevelQueue'.
    while (currentLevelQueue.length > 0) {
      var currentXCoord = currentLevelQueue.pop(); // Get X-coordinate from the queue.
      var currentYCoord = currentLevelQueue.pop(); // Get Y-coordinate from the queue.

      // Iterate through all possible movement directions.
      for (var directionIndex = 0; directionIndex < totalDirections; directionIndex++) {
        var nextXCoord = currentXCoord; // Temporary X for exploring steps.
        var nextYCoord = currentYCoord; // Temporary Y for exploring steps.

        // For each direction, move up to 'maxMoveLength' steps.
        for (var stepCounter = 0; stepCounter < maxMoveLength; stepCounter++) {
          nextXCoord += deltaCoordsX[directionIndex]; // Update X-coordinate.
          nextYCoord += deltaCoordsY[directionIndex]; // Update Y-coordinate.

          // If the next cell is an obstacle ('#'), cannot move further in this direction.
          if (mapLayout[nextYCoord][nextXCoord] === "#") {
            break;
          }
          // If a path of equal or shorter length to this cell was already found,
          // then this path is not an improvement for future steps, so break.
          if (distanceRecord[nextYCoord][nextXCoord] <= currentPathDistance) {
            break;
          }
          // If a new, shorter path to 'nextYCoord, nextXCoord' is found (currentPathDistance + 1).
          if (distanceRecord[nextYCoord][nextXCoord] > currentPathDistance + 1) {
            nextLevelQueue.push(nextYCoord, nextXCoord); // Add this cell to the next layer's queue.
            distanceRecord[nextYCoord][nextXCoord] = currentPathDistance + 1; // Update its shortest distance.
          }
        }
      }
    }
    currentLevelQueue = nextLevelQueue; // Advance to the next layer of nodes.
    currentPathDistance++; // Increment the path distance level.
  }

  // After BFS, return the shortest distance to the goal, or -1 if it's unreachable.
  return distanceRecord[endYPos][endXPos] === maximumValue ? -1 : distanceRecord[endYPos][endXPos];
}