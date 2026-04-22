"use strict";
// Module for file system operations
var acquireModule = require;

// Read raw data from standard input
var dataStream = acquireModule("fs").readFileSync("/dev/stdin", "utf8");

// Split input data into tokens and initialize a token pointer
var tokenBuffer = dataStream.split(/ |\n/),
  tokenIndex = 0;

// Global modulus value for calculations
var modulusValue = 1000000007;

// Function to retrieve the next token from the buffer
function getNextToken(isRaw) {
  return isRaw ? tokenBuffer[tokenIndex++] : +tokenBuffer[tokenIndex++];
}

// Function to retrieve multiple tokens from the buffer
function getMultipleTokens(count, isString) {
  return isString ? tokenBuffer.slice(tokenIndex, tokenIndex += count) : tokenBuffer.slice(tokenIndex, tokenIndex += count).map(val => +val);
}

// Function to retrieve tokens arranged as a matrix
function getMatrixTokens(height, width, isText) {
  let resultArray = [],
    rowIdx = 0;
  if (isText)
    for (; rowIdx < height; rowIdx++)
      resultArray.push(tokenBuffer.slice(tokenIndex, tokenIndex += width));
  else
    for (; rowIdx < height; rowIdx++)
      resultArray.push(tokenBuffer.slice(tokenIndex, tokenIndex += width).map(val => +val));
  return resultArray;
}

// Function to create a multi-dimensional array dynamically
function createMultiDimArray(initialValue) {
  var argsList = arguments,
    argCount = argsList.length,
    arrayCreationString = "Array(argsList[" + --argCount + "]).fill().map(element=>{return " + initialValue + ";})";
  while (--argCount)
    arrayCreationString = "Array(argsList[" + argCount + "]).fill().map(element=>" + arrayCreationString + ")";
  return eval(arrayCreationString);
}

// Function for modular multiplication (unused in this specific problem but part of template)
function performProduct() {
  var factors = arguments,
    currentProduct = factors[0],
    factorIndex = factors.length;
  while (--factorIndex)
    currentProduct = ((currentProduct >> 16) * factors[factorIndex] % modulusValue * 65536 + (currentProduct & 65535) * factors[factorIndex]) % modulusValue;
  return currentProduct;
}

// Execute the main program logic
var finalResult = executeProgram();

// Print the output if available
if (finalResult !== undefined)
  console.log(finalResult);

// Main program function
function executeProgram() {
  var totalNodes = getNextToken(); // Number of nodes
  var nodeX = getNextToken(); // Special node X
  var nodeY = getNextToken(); // Special node Y

  // Initialize an array to store counts of distances
  var distanceCounts = createMultiDimArray(0, totalNodes - 1);

  // Initialize adjacency matrix for path distances with a large value (infinity)
  var adjacencyDistances = createMultiDimArray(Number.MAX_SAFE_INTEGER, totalNodes + 2, totalNodes + 2);

  // Set up initial direct connections
  for (var currNode = 1; currNode <= totalNodes; currNode++) {
    adjacencyDistances[currNode][currNode] = 0; // Distance to self is zero
    adjacencyDistances[currNode][currNode + 1] = 1; // Adjacent nodes have distance 1
    adjacencyDistances[currNode][currNode - 1] = 1; // Adjacent nodes have distance 1
    // Special direct connection between nodeX and nodeY
    if (currNode === nodeX)
      adjacencyDistances[currNode][nodeY] = adjacencyDistances[nodeY][currNode] = 1;
  }

  // First pass of distance calculations (Floyd-Warshall like)
  for (var currNode = 1; currNode <= totalNodes; currNode++) {
    for (var otherNode = currNode + 1; otherNode <= totalNodes; otherNode++) {
      adjacencyDistances[currNode][otherNode] = Math.min(
        adjacencyDistances[currNode][otherNode - 1], // Path via otherNode-1
        adjacencyDistances[currNode][otherNode + 1], // Path via otherNode+1
        adjacencyDistances[currNode - 1][otherNode], // Path via currNode-1
        adjacencyDistances[currNode + 1][otherNode], // Path via currNode+1
        adjacencyDistances[currNode][otherNode] - 1 // Direct path cost reduction
      ) + 1;
    }
  }

  // Second pass for final distance calculations and counting
  for (var currNode = totalNodes - 1; currNode > 0; currNode--) {
    for (var otherNode = totalNodes; otherNode > currNode; otherNode--) {
      adjacencyDistances[currNode][otherNode] = Math.min(
        adjacencyDistances[currNode][otherNode - 1],
        adjacencyDistances[currNode][otherNode + 1],
        adjacencyDistances[currNode - 1][otherNode],
        adjacencyDistances[currNode + 1][otherNode],
        adjacencyDistances[currNode][otherNode] - 1
      ) + 1;
      // Increment the count for the calculated distance
      distanceCounts[adjacencyDistances[currNode][otherNode] - 1]++;
    }
  }

  // Return the distance counts as a newline-separated string
  return distanceCounts.join("\n");
}