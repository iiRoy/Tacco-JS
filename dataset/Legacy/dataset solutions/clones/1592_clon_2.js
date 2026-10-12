"use strict";
// This script processes graph-related data from standard input.

// Read the entire input from stdin.
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the input into tokens by spaces or newlines.
var tokenStream = rawData.split(/ |\n/);
// Pointer to the current token in the stream.
var tokenPointer = 0;

/**
 * Retrieves the next token from the stream and converts it to a number.
 * @returns {number} The next number from the input.
 */
function readNextNumber() {
  return +tokenStream[tokenPointer++];
}

/**
 * Retrieves the next token from the stream as a string.
 * @returns {string} The next string from the input.
 */
function readNextString() {
  return tokenStream[tokenPointer++];
}

/**
 * Retrieves the next token from the stream and converts it to a BigInt.
 * @returns {BigInt} The next BigInt from the input.
 */
function readNextBigInt() {
  return BigInt(tokenStream[tokenPointer++]);
}

/**
 * Reads 'count' numbers from the stream.
 * If 'mapToNum' is true, converts them to numbers; otherwise, returns as strings.
 * @param {number} count - The number of elements to read.
 * @param {boolean} mapToNum - If true, map elements to numbers.
 * @returns {Array<number|string>} An array of the read elements.
 */
function readNumbersArray(count, mapToNum) {
  if (mapToNum) {
    return tokenStream.slice(tokenPointer, tokenPointer += count);
  } else {
    return tokenStream.slice(tokenPointer, tokenPointer += count).map(val => +val);
  }
}

/**
 * Reads a matrix of 'height' rows and 'width' columns from the stream.
 * If 'mapToNum' is true, converts elements to numbers; otherwise, returns as strings.
 * @param {number} height - Number of rows.
 * @param {number} width - Number of columns.
 * @param {boolean} mapToNum - If true, map elements to numbers.
 * @returns {Array<Array<number|string>>} The matrix.
 */
function readMatrix(height, width, mapToNum) {
  var resultMatrix = [],
    rowIdx = 0;
  if (mapToNum) {
    for (; rowIdx < height; rowIdx++) {
      resultMatrix.push(tokenStream.slice(tokenPointer, tokenPointer += width));
    }
  } else {
    for (; rowIdx < height; rowIdx++) {
      resultMatrix.push(tokenStream.slice(tokenPointer, tokenPointer += width).map(val => +val));
    }
  }
  return resultMatrix;
}

/**
 * Creates a multi-dimensional array initialized with a given value.
 * The dimensions are passed as subsequent arguments.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The initialized multi-dimensional array.
 */
function initializeMultiArray(initialValue) {
  var args = arguments,
    argLength = args.length,
    arrayCreationString = "Array(args[" + --argLength + "]).fill().map(elem => {return " + initialValue + ";})";
  while (--argLength) {
    arrayCreationString = "Array(args[" + argLength + "]).fill().map(elem =>" + arrayCreationString + ")";
  }
  return eval(arrayCreationString);
}

// Execute the main program logic.
var finalOutputValue = runSolver();

// If the program returns a value, print it to console.
if (finalOutputValue !== undefined) {
  console.log(String(finalOutputValue));
}

/**
 * Main function containing the core algorithm logic.
 * @returns {number} The final calculated result.
 */
function runSolver() {
  // Read the number of vertices.
  var numVertices = readNextNumber();

  // Initialize a 2D DP table with a very small number.
  // Dimensions are (numVertices + 1) x (numVertices + 1).
  var dynamicProgTable = initializeMultiArray(-1e9, numVertices + 1, numVertices + 1);
  // A counter for additional points.
  var additionalPoints = 0;

  // Read the first two nodes, sort them, and initialize DP table entries.
  var currentInputNodes = readNumbersArray(2).sort((valA, valB) => valA - valB);
  var pendingUpdates = []; // Queue for DP updates.

  // Initialize base cases in the DP table.
  dynamicProgTable[0][0] = dynamicProgTable[0][currentInputNodes[0]] = dynamicProgTable[0][currentInputNodes[1]] = dynamicProgTable[currentInputNodes[0]][currentInputNodes[1]] = 0;

  // Loop through the remaining 'numVertices - 1' sets of nodes.
  for (var loopIndex = 1; loopIndex < numVertices; loopIndex++) {
    // Read the next three nodes and sort them.
    currentInputNodes = readNumbersArray(3).sort((valA, valB) => valA - valB);
    // Process this triplet of nodes.
    processNodeTriplet(...currentInputNodes);
  }

  // Read the final node.
  currentInputNodes = readNextNumber();
  // Calculate the final result based on DP table and additional points.
  return Math.max(dynamicProgTable[0][0], dynamicProgTable[currentInputNodes][currentInputNodes] + 1) + additionalPoints;

  /**
   * Processes a triplet of nodes (nodeOne, nodeTwo, nodeThree) to update the DP table.
   * @param {number} nodeOne - The first node.
   * @param {number} nodeTwo - The second node.
   * @param {number} nodeThree - The third node.
   */
  function processNodeTriplet(nodeOne, nodeTwo, nodeThree) {
    // If all three nodes are identical, increment additional points and return.
    if (nodeOne === nodeThree) {
      return additionalPoints++;
    }

    // Clear the update queue for this triplet.
    pendingUpdates = [];

    // Handle updates related to single nodes.
    updateForSingleNode(nodeOne);
    if (nodeOne < nodeTwo) {
      updateForSingleNode(nodeTwo);
    }
    if (nodeTwo < nodeThree) {
      updateForSingleNode(nodeThree);
    }

    // Handle updates related to pairs of nodes.
    updateForTwoNodes(nodeOne, nodeTwo);
    if (nodeTwo < nodeThree) {
      updateForTwoNodes(nodeOne, nodeThree);
    }
    if (nodeOne < nodeTwo) {
      updateForTwoNodes(nodeTwo, nodeThree);
    }

    // Handle updates related to the triplet of nodes.
    updateForThreeNodes(nodeOne, nodeTwo, nodeThree);

    // Apply all pending updates from the queue to the DP table.
    while (pendingUpdates.length) {
      var potentialScore = pendingUpdates.pop(),
        coordY = pendingUpdates.pop(),
        coordX = pendingUpdates.pop();
      if (dynamicProgTable[coordX][coordY] < potentialScore) {
        dynamicProgTable[coordX][coordY] = potentialScore;
      }
    }
  }

  /**
   * Updates the DP table based on a single node 'nodeVal'.
   * This involves iterating through various combinations with 0 and 'nodeVal'.
   * @param {number} nodeVal - The node value to process.
   */
  function updateForSingleNode(nodeVal) {
    // Update for (0,0) -> (nodeVal, nodeVal)
    enqueueIncrementUpdate(0, 0, nodeVal, nodeVal);
    // Iterate for (i, nodeVal) from (0,0)
    for (var loopIndex = 0; loopIndex < nodeVal; loopIndex++) {
      enqueueSimpleUpdate(loopIndex, nodeVal, 0, loopIndex);
    }
    // Iterate for (nodeVal, i) from (0,i)
    for (var loopIndex = nodeVal; loopIndex <= numVertices; loopIndex++) {
      enqueueSimpleUpdate(nodeVal, loopIndex, 0, loopIndex);
    }
  }

  /**
   * Updates the DP table based on two nodes 'nodeValA' and 'nodeValB'.
   * Handles cases where nodes are equal or different.
   * @param {number} nodeValA - The first node value.
   * @param {number} nodeValB - The second node value.
   */
  function updateForTwoNodes(nodeValA, nodeValB) {
    // Update for (nodeValA, nodeValB) from (0,0)
    enqueueSimpleUpdate(nodeValA, nodeValB, 0, 0);
    // Update for (0, nodeValB) from (nodeValA, nodeValA)
    enqueueIncrementUpdate(0, nodeValB, nodeValA, nodeValA);

    if (nodeValA < nodeValB) {
      // If nodeValA is less than nodeValB, update for (0, nodeValA) from (nodeValB, nodeValB)
      enqueueIncrementUpdate(0, nodeValA, nodeValB, nodeValB);
    } else { // nodeValA === nodeValB
      // If nodes are equal, iterate through combinations.
      for (var loopIndex = 0; loopIndex < nodeValA; loopIndex++) {
        enqueueIncrementUpdate(0, loopIndex, loopIndex, nodeValA);
      }
      for (var loopIndex = nodeValA; loopIndex <= numVertices; loopIndex++) {
        enqueueIncrementUpdate(0, loopIndex, nodeValA, loopIndex);
      }
    }
  }

  /**
   * Updates the DP table based on three nodes 'nodeValA', 'nodeValB', and 'nodeValC'.
   * Handles various permutations and equality conditions.
   * @param {number} nodeValA - The first node value.
   * @param {number} nodeValB - The second node value.
   * @param {number} nodeValC - The third node value.
   */
  function updateForThreeNodes(nodeValA, nodeValB, nodeValC) {
    // Update for (nodeValB, nodeValC) from (nodeValA, nodeValA)
    enqueueIncrementUpdate(nodeValB, nodeValC, nodeValA, nodeValA);

    if (nodeValA < nodeValB) {
      // If nodeValA < nodeValB, update for (nodeValA, nodeValC) from (nodeValB, nodeValB)
      enqueueIncrementUpdate(nodeValA, nodeValC, nodeValB, nodeValB);
      if (nodeValB < nodeValC) {
        // If nodeValB < nodeValC, update for (nodeValA, nodeValB) from (nodeValC, nodeValC)
        enqueueIncrementUpdate(nodeValA, nodeValB, nodeValC, nodeValC);
      } else { // nodeValB === nodeValC
        // If nodeValB and nodeValC are equal, iterate through combinations.
        for (var loopIndex = 0; loopIndex < nodeValA; loopIndex++) {
          enqueueIncrementUpdate(loopIndex, nodeValA, loopIndex, nodeValC);
        }
        for (var loopIndex = nodeValA; loopIndex < nodeValC; loopIndex++) {
          enqueueIncrementUpdate(nodeValA, loopIndex, loopIndex, nodeValC);
        }
        for (var loopIndex = nodeValC; loopIndex <= numVertices; loopIndex++) {
          enqueueIncrementUpdate(nodeValA, loopIndex, nodeValC, loopIndex);
        }
      }
    } else { // nodeValA === nodeValB
      // If nodeValA and nodeValB are equal, update for (nodeValA, nodeValA) from (nodeValC, nodeValC)
      enqueueIncrementUpdate(nodeValA, nodeValA, nodeValC, nodeValC);
      // Iterate through combinations.
      for (var loopIndex = 0; loopIndex < nodeValA; loopIndex++) {
        enqueueIncrementUpdate(loopIndex, nodeValC, loopIndex, nodeValA);
      }
      for (var loopIndex = nodeValA; loopIndex < nodeValC; loopIndex++) {
        enqueueIncrementUpdate(loopIndex, nodeValC, nodeValA, loopIndex);
      }
      for (var loopIndex = nodeValC; loopIndex <= numVertices; loopIndex++) {
        enqueueIncrementUpdate(nodeValC, loopIndex, nodeValA, loopIndex);
      }
    }
  }

  /**
   * Enqueues a simple update to the DP table.
   * If the score at (coordC, coordD) is greater than the current score at (coordA, coordB),
   * it pushes the score and coordinates to the pendingUpdates queue.
   * @param {number} coordA - Row coordinate for the target cell.
   * @param {number} coordB - Column coordinate for the target cell.
   * @param {number} coordC - Row coordinate for the source cell.
   * @param {number} coordD - Column coordinate for the source cell.
   */
  function enqueueSimpleUpdate(coordA, coordB, coordC, coordD) {
    if (dynamicProgTable[coordA][coordB] < dynamicProgTable[coordC][coordD]) {
      pendingUpdates.push(dynamicProgTable[coordC][coordD], coordB, coordA);
    }
  }

  /**
   * Enqueues an incremented update to the DP table.
   * If (score at (coordC, coordD) + 1) is greater than the current score at (coordA, coordB),
   * it pushes the incremented score and coordinates to the pendingUpdates queue.
   * @param {number} coordA - Row coordinate for the target cell.
   * @param {number} coordB - Column coordinate for the target cell.
   * @param {number} coordC - Row coordinate for the source cell.
   * @param {number} coordD - Column coordinate for the source cell.
   */
  function enqueueIncrementUpdate(coordA, coordB, coordC, coordD) {
    if (dynamicProgTable[coordA][coordB] < dynamicProgTable[coordC][coordD] + 1) {
      pendingUpdates.push(dynamicProgTable[coordC][coordD] + 1, coordB, coordA);
    }
  }
}
