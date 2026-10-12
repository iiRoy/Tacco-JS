"use strict";
// This script processes input from standard input to calculate path distances in a graph.

// Acquire all input data from the standard input stream.
const sourceData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the input into tokens using spaces or newlines as delimiters.
// Initialize a pointer for token consumption.
let tokenStream = sourceData.split(/ |\n/);
let tokenIndex = 0;

/**
 * Retrieves the next token from the input stream.
 * @param {boolean} isString - If true, returns the token as a string; otherwise, converts to a number.
 * @returns {string|number} The next token.
 */
function retrieveNext(isString) {
  return isString ? tokenStream[tokenIndex++] : +tokenStream[tokenIndex++];
}

/**
 * Retrieves a specified number of tokens from the input stream.
 * @param {number} count - The number of tokens to retrieve.
 * @param {boolean} isString - If true, returns tokens as strings; otherwise, converts to numbers.
 * @returns {Array<string|number>} An array of tokens.
 */
function retrieveMultiple(count, isString) {
  const currentTokens = tokenStream.slice(tokenIndex, tokenIndex + count);
  tokenIndex += count;
  return isString ? currentTokens : currentTokens.map(val => +val);
}

/**
 * Retrieves a matrix of tokens from the input stream.
 * @param {number} height - The number of rows in the matrix.
 * @param {number} width - The number of columns in the matrix.
 * @param {boolean} isString - If true, returns matrix elements as strings; otherwise, converts to numbers.
 * @returns {Array<Array<string|number>>} The matrix.
 */
function retrieveMatrix(height, width, isString) {
  const resultArray = [];
  let rowIterator = 0;
  if (isString) {
    for (; rowIterator < height; rowIterator++) {
      resultArray.push(tokenStream.slice(tokenIndex, tokenIndex + width));
      tokenIndex += width;
    }
  } else {
    for (; rowIterator < height; rowIterator++) {
      resultArray.push(tokenStream.slice(tokenIndex, tokenIndex + width).map(val => +val));
      tokenIndex += width;
    }
  }
  return resultArray;
}

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  const dimensions = arguments;
  let dimLength = dimensions.length;
  let expressionString = "Array(dimensions[" + --dimLength + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--dimLength) {
    expressionString = "Array(dimensions[" + dimLength + "]).fill().map(x=>" + expressionString + ")";
  }
  return eval(expressionString);
}

/**
 * Performs multiplication of multiple numbers, handling potential large intermediate results
 * using bitwise operations and a modulo. (Note: 'moduloConstant' is not defined in this scope).
 * @param {...number} numbers - The numbers to multiply.
 * @returns {number} The product modulo 'moduloConstant'.
 */
function multiplyLargeNumbers() {
  const numbers = arguments;
  let productValue = numbers[0];
  let loopCounter = numbers.length;
  while (--loopCounter) {
    // This calculation assumes 'moduloConstant' is defined globally or passed.
    // As it's not, this function would throw a ReferenceError if called.
    productValue = ((productValue >> 16) * numbers[loopCounter] % moduloConstant * 65536 + (productValue & 65535) * numbers[loopCounter]) % moduloConstant;
  }
  return productValue;
}

// Execute the main program logic and capture its output.
const programOutput = executeProgram();

// If the program produced output, print it to the console.
if (programOutput !== undefined) {
  console.log(programOutput);
}

/**
 * Main function to solve the problem.
 * Calculates all-pairs shortest paths in a modified graph and counts distances.
 * @returns {string} The counts of each distance, joined by newlines.
 */
function executeProgram() {
  // Read graph parameters: number of nodes, and two special nodes X and Y.
  const nodeCount = retrieveNext();
  const startNode = retrieveNext();
  const endNode = retrieveNext();

  // Initialize an array to store counts of each distance.
  // The maximum possible distance is nodeCount - 1.
  const distanceCounts = createMultiDimArray(0, nodeCount - 1);

  // Initialize an adjacency matrix for shortest paths.
  // Use a large number (1e9) for unreachable paths.
  // The matrix size is (nodeCount+2) x (nodeCount+2) to handle 1-based indexing and boundary conditions.
  const adjacencyMatrix = createMultiDimArray(1_000_000_000, nodeCount + 2, nodeCount + 2);

  // Populate initial direct connections in the adjacency matrix.
  // Self-loops have distance 0. Adjacent nodes have distance 1.
  // Special connection between startNode and endNode has distance 1.
  for (let outerLoopIdx = 1; outerLoopIdx <= nodeCount; outerLoopIdx++) {
    adjacencyMatrix[outerLoopIdx][outerLoopIdx] = 0; // Distance to self is zero
    adjacencyMatrix[outerLoopIdx][outerLoopIdx + 1] = 1; // Direct neighbor
    adjacencyMatrix[outerLoopIdx][outerLoopIdx - 1] = 1; // Direct neighbor

    // Add the special edge between startNode and endNode
    if (outerLoopIdx === startNode) {
      adjacencyMatrix[outerLoopIdx][endNode] = 1;
      adjacencyMatrix[endNode][outerLoopIdx] = 1;
    }
  }

  // First pass of Floyd-Warshall-like algorithm (or similar DP approach).
  // This calculates shortest paths considering direct neighbors and the special edge.
  // It iterates from top-left to bottom-right of the upper triangle of the matrix.
  for (let outerLoopIdx = 1; outerLoopIdx <= nodeCount; outerLoopIdx++) {
    for (let innerLoopIdx = outerLoopIdx + 1; innerLoopIdx <= nodeCount; innerLoopIdx++) {
      // Update path from outerLoopIdx to innerLoopIdx using various intermediate steps.
      // This effectively propagates shortest path information.
      adjacencyMatrix[outerLoopIdx][innerLoopIdx] = Math.min(
        adjacencyMatrix[outerLoopIdx][innerLoopIdx - 1], // Path via (innerLoopIdx - 1)
        adjacencyMatrix[outerLoopIdx][innerLoopIdx + 1], // Path via (innerLoopIdx + 1)
        adjacencyMatrix[outerLoopIdx - 1][innerLoopIdx], // Path via (outerLoopIdx - 1)
        adjacencyMatrix[outerLoopIdx + 1][innerLoopIdx], // Path via (outerLoopIdx + 1)
        adjacencyMatrix[outerLoopIdx][innerLoopIdx] - 1 // Direct path (if it was already 1, this makes it 0, then +1 makes it 1)
      ) + 1;
    }
  }

  // Second pass: Refine shortest paths and count distances.
  // This iterates from bottom-right to top-left of the upper triangle.
  for (let outerLoopIdx = nodeCount - 1; outerLoopIdx > 0; outerLoopIdx--) {
    for (let innerLoopIdx = nodeCount; innerLoopIdx > outerLoopIdx; innerLoopIdx--) {
      // Re-calculate shortest path, ensuring all possible intermediate nodes are considered.
      // This step is crucial for the Floyd-Warshall-like behavior.
      adjacencyMatrix[outerLoopIdx][innerLoopIdx] = Math.min(
        adjacencyMatrix[outerLoopIdx][innerLoopIdx - 1],
        adjacencyMatrix[outerLoopIdx][innerLoopIdx + 1],
        adjacencyMatrix[outerLoopIdx - 1][innerLoopIdx],
        adjacencyMatrix[outerLoopIdx + 1][innerLoopIdx],
        adjacencyMatrix[outerLoopIdx][innerLoopIdx] - 1
      ) + 1;

      // Increment the count for the calculated distance.
      // Distances are 1-indexed, so subtract 1 for array access.
      distanceCounts[adjacencyMatrix[outerLoopIdx][innerLoopIdx] - 1]++;
    }
  }

  // Format the distance counts into a newline-separated string for output.
  return distanceCounts.join("\n");
}
