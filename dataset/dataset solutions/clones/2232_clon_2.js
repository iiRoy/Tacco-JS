"use strict";
// This module provides utilities for parsing input data.
const DATA_PARSER = (function () {
  /**
   * Factory function to create a new input parser instance.
   * @param {string} inputString - The raw string input to parse.
   * @returns {InputParser} A new parser object.
   */
  function createParser(inputString) {
    return new InputParser(inputString);
  }

  /**
   * Represents an input parser that can read values, lines, or matrices.
   */
  function InputParser(inputDataString) {
    // Store the input string, split into lines and trimmed.
    this._sourceData = inputDataString.trim().split("\n");
    // Keep track of the current line being processed.
    this._currentLineIndex = 0;
  }

  /**
   * Reads and returns the next value from the current line.
   * If the current line is exhausted, moves to the next.
   * @param {boolean} [returnAsString=false] - If true, returns the value as a string; otherwise, as a number.
   * @returns {string|number} The next value.
   */
  InputParser.prototype.getNextValue = function (returnAsString) {
    let sourceArray = this._sourceData;
    let currentLineIndex = this._currentLineIndex;
    let extractedValue;

    // If the current line hasn't been parsed into words yet, do so and reverse for easy popping.
    if (typeof sourceArray[currentLineIndex] === "string") {
      sourceArray[currentLineIndex] = sourceArray[currentLineIndex].split(" ").reverse();
    }
    // Pop the last element (which was originally the first due to reverse).
    extractedValue = sourceArray[currentLineIndex].pop();

    // If the current line is now empty, advance to the next line.
    if (!sourceArray[currentLineIndex].length) {
      this._currentLineIndex++;
    }

    // Return as string or number based on the flag.
    return returnAsString ? extractedValue : +extractedValue;
  };

  /**
   * Reads an entire line and returns its values.
   * @param {boolean} [returnAsString=false] - If true, returns values as strings; otherwise, as numbers.
   * @returns {string[]|number[]} An array of values from the line.
   */
  InputParser.prototype.getLineValues = function (returnAsString) {
    // Get the current line, split by space, and then advance the line index.
    let lineTokens = this._sourceData[this._currentLineIndex++].split(" ");
    // Return as strings or map to numbers.
    return returnAsString ? lineTokens : lineTokens.map((val) => +val);
  };

  /**
   * Reads a matrix of `numRows` lines.
   * @param {number} numRows - The number of rows to read for the matrix.
   * @param {boolean} [returnAsString=false] - If true, returns values as strings; otherwise, as numbers.
   * @returns {string[][]|number[][]} A 2D array representing the matrix.
   */
  InputParser.prototype.getMatrix = function (numRows, returnAsString) {
    // Slice the source data for the specified number of rows, then split each row.
    let matrixRows = this._sourceData.slice(this._currentLineIndex, (this._currentLineIndex += numRows)).map((line) => line.split(" "));
    // Return as strings or map all nested values to numbers.
    return returnAsString ? matrixRows : matrixRows.map((row) => row.map((val) => +val));
  };

  /**
   * Reads a specified number of raw lines without splitting them into values.
   * @param {number} numRows - The number of raw lines to read.
   * @param {boolean} [returnAsString=false] - If true, returns values as strings; otherwise, as numbers (if a single value per line).
   * @returns {string[]|number[]} An array of raw lines or numbers.
   */
  InputParser.prototype.getRawLines = function (numRows, returnAsString) {
    // Slice the source data for the specified number of lines.
    let lineCollection = this._sourceData.slice(this._currentLineIndex, (this._currentLineIndex += numRows));
    // Return as strings or map to numbers (assuming each line is a single number).
    return returnAsString ? lineCollection : lineCollection.map((val) => +val);
  };

  return createParser;
})();

// Initialize the input parser with data from standard input.
const parserInstance = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * This function uses `eval` for dynamic array creation.
 * @param {*} initialValue - The value to initialize all elements with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} A multi-dimensional array.
 */
function makeMultiDimArray(initialValue) {
  const dimensions = arguments;
  let dimLength = dimensions.length;
  // Start building the array creation code string from the innermost dimension.
  let arrayCreationCode = `Array(dimensions[${--dimLength}]).fill(0).map((_)=>initialValue)`;
  // Wrap the expression for each preceding dimension.
  while (--dimLength) {
    arrayCreationCode = `Array(dimensions[${dimLength}]).fill(0).map((_)=>${arrayCreationCode})`;
  }
  // Evaluate the generated code to create the array.
  return eval(arrayCreationCode);
}

// Declare global variables for graph representation and edge bitmasks.
let connectionMap; // Stores adjacency lists for the graph.
let edgeMasks;     // Stores bitmasks associated with each edge, indicating query paths.

// Execute the main processing function and log its output if available.
const finalResult = processNetwork();
if (finalResult !== undefined) {
  console.log(finalResult);
}

/**
 * Main function to process the network problem.
 * It reads graph structure, processes queries, and computes a result using dynamic programming.
 * @returns {number} The final computed value.
 */
function processNetwork() {
  const nodeCount = parserInstance.getNextValue(); // Read the number of nodes.

  // Arrays to store the two endpoints of each edge, ensuring a canonical order (min, max).
  const edgeStartNodes = [];
  const edgeEndNodes = [];

  // Initialize the adjacency list for the graph and bitmasks for edges.
  // connectionMap will be an array of arrays, representing adjacency lists.
  // edgeMasks will store an integer for each edge, combining query bits.
  connectionMap = makeMultiDimArray("[]", nodeCount);
  edgeMasks = makeMultiDimArray(0, nodeCount - 1);

  // Read the (nodeCount - 1) edges to construct the graph.
  for (let idx = 0; idx < nodeCount - 1; idx++) {
    const startNode = parserInstance.getNextValue() - 1; // Node indices are 0-based.
    const targetNode = parserInstance.getNextValue() - 1;

    // Store edges in a canonical form (smaller node first).
    edgeStartNodes[idx] = Math.min(startNode, targetNode);
    edgeEndNodes[idx] = Math.max(startNode, targetNode);

    // Add edges to the adjacency list for both directions.
    connectionMap[startNode].push(targetNode);
    connectionMap[targetNode].push(startNode);
  }

  const queryCount = parserInstance.getNextValue(); // Read the number of queries.

  // Process each query.
  for (let idx = 0; idx < queryCount; idx++) {
    const queryStart = parserInstance.getNextValue() - 1; // Query start node (0-based).
    const queryEnd = parserInstance.getNextValue() - 1;   // Query end node (0-based).
    const currentBit = 1 << idx;                          // Unique bit for this query.

    // Find the path between queryStart and queryEnd using DFS.
    // The pathNodes array will contain the sequence of nodes from start to end.
    const pathNodes = depthFirstSearch(queryStart, queryEnd, -1, []);

    // Iterate through the path to identify edges and update their bitmasks.
    for (let pathIdx = 1; pathIdx < pathNodes.length; pathIdx++) {
      const node1 = Math.min(pathNodes[pathIdx - 1], pathNodes[pathIdx]);
      const node2 = pathNodes[pathIdx - 1] + pathNodes[pathIdx] - node1; // The other node, ensures canonical order.

      // Find the index of this edge in the stored edge arrays.
      for (let edgeIdx = 0; ; edgeIdx++) {
        if (edgeStartNodes[edgeIdx] === node1 && edgeEndNodes[edgeIdx] === node2) {
          // Set the current query's bit for this edge.
          edgeMasks[edgeIdx] |= currentBit;
          break; // Move to the next edge in the path.
        }
      }
    }
  }

  // Dynamic Programming section.
  const maxBitmask = 1 << queryCount; // Total possible states for query combinations.
  // dp array where dp[i] stores the number of ways to satisfy queries represented by bitmask i.
  let dynamicProgArray = makeMultiDimArray(0, maxBitmask);
  dynamicProgArray[0] = 1; // Base case: one way to satisfy no queries (empty set).

  // Iterate through each edge in the graph.
  for (let edgeIdx = 0; edgeIdx < nodeCount - 1; edgeIdx++) {
    // If an edge is not part of any query path.
    if (edgeMasks[edgeIdx] === 0) {
      // Each existing state can be achieved in two ways (with or without this edge).
      for (let stateIdx = 0; stateIdx < maxBitmask; stateIdx++) {
        dynamicProgArray[stateIdx] *= 2;
      }
    } else {
      // If an edge is part of one or more query paths.
      // Create a temporary DP array for the current iteration.
      const tempDPArray = makeMultiDimArray(0, maxBitmask);
      for (let stateIdx = 0; stateIdx < maxBitmask; stateIdx++) {
        // Option 1: Don't use this edge. The state remains 'stateIdx'.
        tempDPArray[stateIdx | edgeMasks[edgeIdx]] += dynamicProgArray[stateIdx];
        // Option 2: Use this edge. The state becomes 'stateIdx | edgeMasks[edgeIdx]'.
        tempDPArray[stateIdx] += dynamicProgArray[stateIdx];
      }
      dynamicProgArray = tempDPArray; // Update the main DP array.
    }
  }

  // The final result is the number of ways to satisfy all queries (represented by `maxBitmask - 1`).
  return dynamicProgArray[maxBitmask - 1];
}

/**
 * Performs a Depth First Search to find a path between two nodes.
 * This DFS finds *any* path and returns it.
 * @param {number} currentNode - The current node in the traversal.
 * @param {number} goalNode - The target node to reach.
 * @param {number} parentNode - The node from which `currentNode` was visited, to avoid backtracking immediately.
 * @param {number[]} currentPath - The list of nodes visited so far in the current path.
 * @returns {number[]|undefined} The path from `currentNode` to `goalNode` if found, otherwise undefined.
 */
function depthFirstSearch(currentNode, goalNode, parentNode, currentPath) {
  currentPath.push(currentNode); // Add the current node to the path.

  // If the goal node is reached, return the path.
  if (goalNode === currentNode) {
    return currentPath;
  }

  // Explore neighbors of the current node.
  for (const neighborNode of connectionMap[currentNode]) {
    // Skip if the neighbor is the parent node (avoid immediate backtracking).
    if (neighborNode === parentNode) {
      continue;
    }
    // Recursively call DFS for the neighbor.
    const foundPath = depthFirstSearch(neighborNode, goalNode, currentNode, currentPath);
    // If a path is found in the recursive call, propagate it up.
    if (foundPath) {
      return foundPath;
    }
  }

  // If no path was found from this node, backtrack by removing it from the path.
  currentPath.pop();
  return undefined; // No path found from this branch.
}