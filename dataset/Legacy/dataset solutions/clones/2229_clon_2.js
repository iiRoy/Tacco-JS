"use strict";
// This module provides a utility for parsing structured input from a string.
const INPUT_PROCESSOR = (function () {
  /**
   * Creates a new input reader instance.
   * @param {string} inputStringContent - The raw string content to parse.
   * @returns {InputBuffer} An instance of the InputBuffer.
   */
  function createInputReader(inputStringContent) {
    return new InputBuffer(inputStringContent);
  }

  /**
   * Manages the parsing of input lines and tokens.
   * @class
   */
  function InputBuffer(inputStringContent) {
    // Store all input lines, trimmed and split by newline.
    this._sourceLinesData = inputStringContent.trim().split("\n");
    // Pointer to the current line being processed.
    this._currentLinePointer = 0x0;
  }

  /**
   * Reads the next token from the current line, treating it as an integer by default.
   * If the current line is exhausted, it moves to the next line.
   * @param {boolean} [asString=false] - If true, returns the token as a string; otherwise, as a number.
   * @returns {string|number} The next token.
   */
  InputBuffer.prototype.readInteger = function (asString) {
    let lineData = this._sourceLinesData;
    let linePointer = this._currentLinePointer;
    let extractedValue;

    // If the current line hasn't been split into tokens yet, do so.
    // Tokens are reversed so `pop()` gets them in original order.
    if (typeof lineData[linePointer] === "string") {
      lineData[linePointer] = lineData[linePointer].split(" ").reverse();
    }

    // Extract the last token (which is the next in original order).
    extractedValue = lineData[linePointer].pop();

    // If the current line is now empty, advance to the next line.
    if (!lineData[linePointer].length) {
      this._currentLinePointer++;
    }

    // Return as string or convert to number.
    return asString ? extractedValue : +extractedValue;
  };

  /**
   * Reads an entire line and returns its tokens as an array.
   * @param {boolean} [asString=false] - If true, returns tokens as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of tokens from the line.
   */
  InputBuffer.prototype.readLineOfIntegers = function (asString) {
    // Get the current line, split by space, and then advance the line pointer.
    let lineTokens = this._sourceLinesData[this._currentLinePointer++].split(" ");
    // Return as strings or convert all to numbers.
    return asString ? lineTokens : lineTokens.map(item => +item);
  };

  /**
   * Reads a specified number of lines and parses them into a 2D array (matrix).
   * @param {number} numberOfLines - The count of lines to read.
   * @param {boolean} [asString=false] - If true, returns tokens as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} A matrix of tokens.
   */
  InputBuffer.prototype.readMatrixOfIntegers = function (numberOfLines, asString) {
    // Extract a slice of lines and split each into tokens.
    let matrixRows = this._sourceLinesData.slice(this._currentLinePointer, this._currentLinePointer += numberOfLines).map(item => item.split(" "));
    // Return as strings or convert all elements in the matrix to numbers.
    return asString ? matrixRows : matrixRows.map(item => item.map(subItem => +subItem));
  };

  /**
   * Reads a specified number of lines and returns them as an array of strings or numbers.
   * @param {number} numberOfLines - The count of lines to read.
   * @param {boolean} [asString=false] - If true, returns lines as strings; otherwise, attempts to convert each line to a number.
   * @returns {Array<string|number>} An array of lines.
   */
  InputBuffer.prototype.readLinesAsString = function (numberOfLines, asString) {
    // Extract a slice of lines.
    let linesContent = this._sourceLinesData.slice(this._currentLinePointer, this._currentLinePointer += numberOfLines);
    // Return as strings or convert all to numbers.
    return asString ? linesContent : linesContent.map(item => +item);
  };

  return createInputReader;
})();

// Initialize the input reader by reading from standard input.
const inputReader = INPUT_PROCESSOR(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array with a specified initial value.
 * This function uses `eval` for dynamic array creation based on provided dimensions.
 * @param {*} initialValue - The value to fill the innermost array elements with.
 * @param {...number} dimensions - The sizes of each dimension, from outermost to innermost.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  const dimensions = arguments;
  let dimCount = dimensions.length;
  // Start building the string for the innermost array.
  let arrayCreationString = `Array(dimensions[${--dimCount}]).fill(0x0).map(elementPlaceholder => { return ${initialValue}; })`;

  // Build up the string for outer dimensions.
  while (--dimCount) {
    arrayCreationString = `Array(dimensions[${dimCount}]).fill(0x0).map(elementPlaceholder => ${arrayCreationString})`;
  }

  // Evaluate the string to create the array.
  return eval(arrayCreationString);
}

// Global variables to store graph structure and edge bitmasks.
let adjacencyList;
let edgeBitmasks;

// Execute the main program logic and capture its result.
const programResult = executeProgram();

// If the program returns a value, print it to the console.
if (programResult !== undefined) {
  console.log(programResult);
}

/**
 * The main execution function of the program.
 * It reads graph data, processes queries, and calculates a final result using dynamic programming.
 * @returns {number} The final calculated value.
 */
function executeProgram() {
  // Read the total number of nodes in the graph.
  const nodeCount = inputReader.readInteger();

  // Arrays to store the two endpoints of each edge, ensuring min/max order.
  const edgeStartNodes = [];
  const edgeEndNodes = [];

  // Initialize the adjacency list for the graph.
  adjacencyList = createMultiDimArray("[]", nodeCount);
  // Initialize an array to store bitmasks for each edge.
  edgeBitmasks = createMultiDimArray(0x0, nodeCount - 0b1);

  // Read N-1 edges to construct the graph.
  for (let edgeIndex = 0x0; edgeIndex < nodeCount - 0b1; edgeIndex++) {
    // Read two connected nodes (0-indexed).
    const firstNode = inputReader.readInteger() - 0b1;
    const secondNode = inputReader.readInteger() - 0b1;

    // Store edges such that edgeStartNodes[i] <= edgeEndNodes[i].
    edgeStartNodes[edgeIndex] = Math.min(firstNode, secondNode);
    edgeEndNodes[edgeIndex] = Math.max(firstNode, secondNode);

    // Add edges to the adjacency list for both directions.
    adjacencyList[firstNode].push(secondNode);
    adjacencyList[secondNode].push(firstNode);
  }

  // Read the number of queries.
  const queryCount = inputReader.readInteger();

  // Process each query.
  for (let queryIndex = 0x0; queryIndex < queryCount; queryIndex++) {
    // Read the start and end nodes for the current query (0-indexed).
    const querySource = inputReader.readInteger() - 0b1;
    const queryTarget = inputReader.readInteger() - 0b1;

    // Create a unique bitmask for this query.
    const currentQueryBit = 0b1 << queryIndex;

    // Find the path between querySource and queryTarget using DFS.
    const pathNodesList = findPathDFS(querySource, queryTarget, -0b1, []);

    // Iterate through the path to identify edges and update their bitmasks.
    for (let pathSegmentIndex = 0b1; pathSegmentIndex < pathNodesList.length; pathSegmentIndex++) {
      // Get the two nodes forming the current edge segment.
      const nodeA = pathNodesList[pathSegmentIndex - 0b1];
      const nodeB = pathNodesList[pathSegmentIndex];

      // Determine the smaller and larger node of the edge for consistent lookup.
      const smallerNode = Math.min(nodeA, nodeB);
      const largerNode = nodeA + nodeB - smallerNode; // Sum - smaller = larger

      // Find the index of this edge in the stored edge lists.
      for (let edgeLookupIndex = 0x0; ; edgeLookupIndex++) {
        if (edgeStartNodes[edgeLookupIndex] === smallerNode && edgeEndNodes[edgeLookupIndex] === largerNode) {
          // Apply the current query's bitmask to this edge.
          edgeBitmasks[edgeLookupIndex] |= currentQueryBit;
          break; // Edge found, move to next path segment.
        }
      }
    }
  }

  // Calculate the maximum possible bitmask value (2^queryCount).
  const maxBitmaskValue = 0b1 << queryCount;
  // Initialize the dynamic programming table.
  const dynamicProgrammingTable = createMultiDimArray(0x0, maxBitmaskValue);
  // Base case: an empty set of queries (mask 0) has 1 way.
  dynamicProgrammingTable[0x0] = 0b1;

  // Iterate through each edge in the graph.
  for (let currentEdgeIndex = 0x0; currentEdgeIndex < nodeCount - 0b1; currentEdgeIndex++) {
    // If an edge is not part of any query path (bitmask is 0).
    if (edgeBitmasks[currentEdgeIndex] === 0x0) {
      // Each state can be reached in twice as many ways (edge can be chosen or not).
      for (let maskIndex = 0x0; maskIndex < maxBitmaskValue; maskIndex++) {
        dynamicProgrammingTable[maskIndex] *= 0b10; // Multiply by 2
      }
    } else {
      // If the edge is part of one or more query paths.
      // Iterate DP table in reverse to avoid using updated values in the same iteration.
      for (let maskIndex = maxBitmaskValue; maskIndex--;) {
        // If the current mask already includes all bits of the edge's bitmask.
        if ((maskIndex | edgeBitmasks[currentEdgeIndex]) === maskIndex) {
          // This edge doesn't add new query coverage, so it doubles the ways to reach this mask.
          dynamicProgrammingTable[maskIndex] *= 0b10; // Multiply by 2
        } else {
          // This edge adds new query coverage. Add ways from the state without this edge's bits.
          dynamicProgrammingTable[maskIndex | edgeBitmasks[currentEdgeIndex]] += dynamicProgrammingTable[maskIndex];
        }
      }
    }
  }

  // The final result is the number of ways to satisfy all queries (mask maxBitmaskValue - 1).
  return dynamicProgrammingTable[maxBitmaskValue - 0b1];
}

/**
 * Performs a Depth-First Search (DFS) to find a path between a start node and a target node.
 * This function modifies the `currentPath` array in place.
 * @param {number} currentNode - The node currently being visited.
 * @param {number} targetNode - The node to find.
 * @param {number} parentNode - The node from which `currentNode` was visited (to avoid going back).
 * @param {Array<number>} currentPath - The array representing the path found so far.
 * @returns {Array<number>|undefined} The path array if the target is found, otherwise undefined.
 */
function findPathDFS(currentNode, targetNode, parentNode, currentPath) {
  // Add the current node to the path.
  currentPath.push(currentNode);

  // If the current node is the target node, we've found the path.
  if (targetNode === currentNode) {
    return currentPath;
  }

  // Explore neighbors of the current node.
  for (const neighborNode of adjacencyList[currentNode]) {
    // Skip the parent node to avoid cycles in a tree-like traversal.
    if (neighborNode === parentNode) {
      continue;
    }

    // Recursively call DFS for the neighbor.
    const foundPath = findPathDFS(neighborNode, targetNode, currentNode, currentPath);
    // If a path was found in the recursive call, return it immediately.
    if (foundPath) {
      return foundPath;
    }
  }

  // If no path was found through this branch, backtrack by removing the current node.
  currentPath.pop();
  // Return undefined if the target was not found in this branch.
  return undefined;
}
