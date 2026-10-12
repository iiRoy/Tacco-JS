"use strict";

// This section handles input processing from standard input.
// It reads the entire input, splits it into tokens, and provides helper functions
// to parse different data types from the token stream.
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenStream = rawData.split(/ |\n/);
var tokenIndex = 0;

/**
 * Retrieves the next number from the input token stream.
 * @returns {number} The parsed number.
 */
function getNextNumber() {
  return +tokenStream[tokenIndex++];
}

/**
 * Retrieves the next string from the input token stream.
 * @returns {string} The next string token.
 */
function getNextString() {
  return tokenStream[tokenIndex++];
}

/**
 * Retrieves the next BigInt from the input token stream.
 * @returns {BigInt} The parsed BigInt.
 */
function getNextBigInt() {
  return BigInt(tokenStream[tokenIndex++]);
}

/**
 * Retrieves an array of numbers or strings from the input token stream.
 * @param {number} count - The number of elements to retrieve.
 * @param {boolean} asStrings - If true, returns strings; otherwise, returns numbers.
 * @returns {Array<number|string>} An array of parsed elements.
 */
function getNumbersArray(count, asStrings) {
  if (asStrings) {
    return tokenStream.slice(tokenIndex, tokenIndex += count);
  } else {
    return tokenStream.slice(tokenIndex, tokenIndex += count).map(val => +val);
  }
}

/**
 * Retrieves a 2D matrix (array of arrays) from the input token stream.
 * @param {number} height - The number of rows.
 * @param {number} width - The number of columns per row.
 * @param {boolean} asStrings - If true, matrix elements are strings; otherwise, numbers.
 * @returns {Array<Array<number|string>>} The parsed matrix.
 */
function getMatrix(height, width, asStrings) {
  var resultMatrix = [];
  var rowCounter = 0;
  if (asStrings) {
    for (; rowCounter < height; rowCounter++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width));
    }
  } else {
    for (; rowCounter < height; rowCounter++) {
      resultMatrix.push(tokenStream.slice(tokenIndex, tokenIndex += width).map(val => +val));
    }
  }
  return resultMatrix;
}

/**
 * Creates a multi-dimensional array initialized with a given value.
 * This function uses `eval` and should be used with caution.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array.
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var args = arguments;
  var argLength = args.length;
  var evalString = "Array(args[" + --argLength + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--argLength) {
    evalString = "Array(args[" + argLength + "]).fill().map(x=>" + evalString + ")";
  }
  return eval(evalString);
}

// Execute the main logic and print the result if it's not undefined.
var programResult = executeLogic();
if (programResult !== undefined) {
  console.log(programResult);
}

/**
 * The primary function containing the problem-solving logic.
 * This function calculates the total number of nodes in a specific tree structure
 * based on given leaf counts at each level.
 * @returns {string|number} The total number of nodes as a string, or -1 if impossible.
 */
function executeLogic() {
  // Read the number of levels in the tree (excluding the root).
  var nodeCount = getNextNumber();
  // Read the array of leaf counts at each level, including the root (level 0).
  var leafCounts = getNumbersArray(nodeCount + 1);

  // Handle the base case where there's only a root node (n=0).
  if (nodeCount === 0) {
    // If the root itself is a leaf and has count 1, it's valid.
    if (leafCounts[0] === 1) {
      return 1;
    }
    // Otherwise, it's impossible.
    return -1;
  }

  // If the root node (level 0) has any leaves, it's impossible because
  // the root must have children to form a tree with n > 0 levels.
  if (leafCounts[0]) {
    return -1;
  }

  // Define a large value to represent infinity for calculations,
  // preventing overflow while ensuring it's sufficiently large.
  var maxPossibleValue = 1e8 * nodeCount;

  // dp1: Stores the minimum number of nodes required at each level 'i'
  // to support the leaves at level 'i' and all subsequent levels.
  var minNodesRequired = Array(nodeCount + 1);
  minNodesRequired[0] = 1; // The root node always starts with 1 node.

  // Iterate from level 1 up to 'nodeCount' to calculate minimum required nodes.
  for (var currentLevel = 1; currentLevel <= nodeCount; currentLevel++) {
    // Each node at the previous level can branch into at most 2 nodes.
    // So, the maximum possible nodes at the current level is twice the previous level's nodes.
    // We cap this at 'maxPossibleValue' to prevent overflow.
    minNodesRequired[currentLevel] = Math.min(minNodesRequired[currentLevel - 1] * 2, maxPossibleValue);
    // Subtract the leaves at the current level, as these nodes are "consumed" as leaves.
    minNodesRequired[currentLevel] -= leafCounts[currentLevel];
    // If at any point the required nodes become negative, it's impossible to form the tree.
    if (minNodesRequired[currentLevel] < 0) {
      return -1;
    }
  }

  // dp2: Stores the maximum number of nodes that can exist at each level 'i'
  // given the total number of leaves from level 'i+1' to 'nodeCount'.
  var maxNodesAvailable = Array(nodeCount + 1);
  maxNodesAvailable[nodeCount] = 0; // At the last level, no further nodes can branch out.

  // Iterate backwards from 'nodeCount - 1' down to 0 to calculate maximum available nodes.
  for (var currentLevel = nodeCount - 1; currentLevel >= 0; currentLevel--) {
    // The maximum nodes available at the current level is the sum of
    // maximum nodes available at the next level plus the leaves at the next level.
    // This represents the total "capacity" for nodes that can branch from the current level.
    maxNodesAvailable[currentLevel] = maxNodesAvailable[currentLevel + 1] + leafCounts[currentLevel + 1];
  }

  // Calculate the total number of nodes in the tree.
  var totalNodes = 0n; // Use BigInt for the sum to handle potentially large numbers.

  // Sum up the nodes at each level.
  // At each level 'i', the actual number of non-leaf nodes is the minimum of
  // 'minNodesRequired[i]' (nodes needed to support future leaves) and
  // 'maxNodesAvailable[i]' (nodes that can branch from this level).
  // We then add the 'leafCounts[i]' to get the total nodes at that level.
  for (var currentLevel = 0; currentLevel <= nodeCount; currentLevel++) {
    totalNodes += BigInt(Math.min(minNodesRequired[currentLevel], maxNodesAvailable[currentLevel]) + leafCounts[currentLevel]);
  }

  // Return the final total as a string.
  return totalNodes.toString();
}
