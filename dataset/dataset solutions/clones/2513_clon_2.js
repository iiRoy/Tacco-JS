var DATA_PARSER = (function() {
  /**
   * Factory function to create an input parser instance.
   * @param {string} inputString - The raw input string, typically from stdin.
   * @returns {InputProcessor} A new instance of InputProcessor.
   */
  function createParser(inputString) {
    return new InputProcessor(inputString);
  }

  /**
   * Handles parsing of input data line by line.
   * @param {string} inputString - The raw input string.
   */
  function InputProcessor(inputString) {
    // Store all lines, trimmed and split by newline.
    this._sourceLines = inputString.trim().split("\n");
    // Keep track of the current line being processed.
    this._currentLineIndex = 0;
  }

  /**
   * Reads the next token from the current line. If the current line is exhausted,
   * it moves to the next line. Tokens are space-separated.
   * @param {boolean} returnAsString - If true, returns the token as a string; otherwise, as a number.
   * @returns {string|number} The next token.
   */
  InputProcessor.prototype.readNextToken = function(returnAsString) {
    var allLines = this._sourceLines,
      lineIdx = this._currentLineIndex,
      resultToken;

    // If the current line hasn't been split into tokens yet, do so.
    // Tokens are read from right to left (popped), so reverse the split array.
    if (typeof allLines[lineIdx] === "string") {
      allLines[lineIdx] = allLines[lineIdx].split(" ").reverse();
    }

    // Pop the last token (which was the first in the original order).
    resultToken = allLines[lineIdx].pop();

    // If the current line is now empty, advance to the next line.
    if (!allLines[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return as string or convert to number.
    return returnAsString ? resultToken : +resultToken;
  };

  /**
   * Reads all tokens from the current line and advances to the next line.
   * @param {boolean} returnAsString - If true, returns tokens as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of tokens from the line.
   */
  InputProcessor.prototype.readLineTokens = function(returnAsString) {
    var lineTokens = this._sourceLines[this._currentLineIndex++].split(" ");
    return returnAsString ? lineTokens : lineTokens.map(val => +val);
  };

  /**
   * Reads a matrix of 'numRows' rows, where each row is split by spaces.
   * Advances the line index by 'numRows'.
   * @param {number} numRows - The number of rows to read for the matrix.
   * @param {boolean} returnAsString - If true, returns elements as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} The 2D array (matrix).
   */
  InputProcessor.prototype.readMatrix = function(numRows, returnAsString) {
    var matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numRows)
      .map(line => line.split(" "));
    return returnAsString ? matrixRows : matrixRows.map(row => row.map(val => +val));
  };

  /**
   * Reads 'numLines' lines as individual strings or numbers.
   * Advances the line index by 'numLines'.
   * @param {number} numLines - The number of lines to read.
   * @param {boolean} returnAsString - If true, returns lines as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of lines.
   */
  InputProcessor.prototype.readLines = function(numLines, returnAsString) {
    var linesData = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
    return returnAsString ? linesData : linesData.map(val => +val);
  };

  return createParser;
})();

// Initialize the input parser with data from standard input.
var inputData = DATA_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * The dimensions are passed as subsequent arguments.
 * Example: createMultiDimArray(0, 2, 3) creates [[0,0,0],[0,0,0]]
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var args = arguments,
    argIndex = args.length,
    // Start building the array creation string from the innermost dimension.
    arrayExpressionString = "Array(args[" + --argIndex + "]).fill(0).map(element => { return " + initialValue + "; })";

  // Wrap the expression for each preceding dimension.
  while (--argIndex) {
    arrayExpressionString = "Array(args[" + argIndex + "]).fill(0).map(element => " + arrayExpressionString + ")";
  }
  // Evaluate the constructed string to create the array.
  return eval(arrayExpressionString);
}

// Global variables for graph processing.
var nodeCount, // Total number of nodes in the graph.
  adjMatrix, // Adjacency matrix representing the graph.
  nodeHasIncoming, // Array indicating if a node has any incoming edges.
  isolatedNodeCounter = 0; // Counts nodes with no incoming edges.

// Execute the main logic and print the result.
console.log(executeMainLogic());

/**
 * Main function to orchestrate graph processing.
 * Reads input, determines initial graph properties, and calls the solver.
 * @returns {number} The final calculated result.
 */
function executeMainLogic() {
  // Read the number of nodes.
  nodeCount = inputData.readNextToken();
  // Read the adjacency matrix (as strings "0" or "1").
  adjMatrix = inputData.readLines(nodeCount, true);
  // Initialize an array to track if each node has an incoming edge.
  nodeHasIncoming = createMultiDimArray(0, nodeCount);

  var graphHasAnyEdges = 0; // Flag to check if the entire graph has at least one edge.

  // Iterate through the adjacency matrix to identify nodes with incoming edges.
  for (var nodeIndexOuter = 0; nodeIndexOuter < nodeCount; nodeIndexOuter++) {
    for (var nodeIndexInner = 0; nodeIndexInner < nodeCount; nodeIndexInner++) {
      // If an edge exists from nodeIndexOuter to nodeIndexInner.
      if (adjMatrix[nodeIndexOuter][nodeIndexInner] === "1") {
        // Mark that nodeIndexOuter has an incoming edge (from some node).
        // Also set the global flag that the graph is not entirely empty.
        graphHasAnyEdges = nodeHasIncoming[nodeIndexOuter] = 1;
        break; // No need to check other outgoing edges from this node for 'hasIncoming'.
      }
    }
    // If after checking all outgoing edges, this node has no incoming edges.
    if (nodeHasIncoming[nodeIndexOuter] === 0) {
      isolatedNodeCounter++; // Increment the count of isolated nodes.
    }
  }

  // If the graph has no edges at all, the result is simply the number of nodes.
  if (graphHasAnyEdges === 0) {
    return nodeCount;
  }

  // Otherwise, proceed to solve the problem for connected components.
  return calculateMaxDistance();
}

/**
 * Solves the problem by finding the maximum distance in the graph's connected components.
 * This function implements a Breadth-First Search (BFS) like approach.
 * @returns {number} The maximum path length found, or -1 if an inconsistency is detected.
 */
function calculateMaxDistance() {
  var maxGraphDistance = 0; // Stores the maximum distance found across all BFS traversals.

  // Iterate through each node to potentially start a BFS from it.
  for (var currentNodeIndex = 0; currentNodeIndex < nodeCount; currentNodeIndex++) {
    // Only consider nodes that have at least one incoming edge (part of a component).
    if (nodeHasIncoming[currentNodeIndex] === 0) {
      continue;
    }

    // Initialize a distance map for the current BFS traversal.
    // -1 means unvisited, 0 means start node, 1 means distance 1, etc.
    var distanceMap = createMultiDimArray(-1, nodeCount);
    distanceMap[currentNodeIndex] = 0; // The starting node has distance 0.

    var currentLevelQueue = []; // Queue for nodes at the current distance level.

    // Initialize the first level of BFS (distance 1 neighbors).
    for (var neighborIndex = 0; neighborIndex < nodeCount; neighborIndex++) {
      // If there's no edge from currentNodeIndex to neighborIndex, skip.
      if (adjMatrix[currentNodeIndex][neighborIndex] === "0") {
        continue;
      }
      distanceMap[neighborIndex] = 1; // Mark neighbor as distance 1.
      currentLevelQueue.push(neighborIndex); // Add to the queue for the next level.
    }

    var currentDistanceLevel = 1; // Current distance level being processed.

    // Perform BFS traversal.
    while (currentLevelQueue.length) {
      var nextLevelQueue = []; // Queue for nodes at the next distance level.

      // Process all nodes at the current distance level.
      while (currentLevelQueue.length) {
        var poppedNode = currentLevelQueue.pop(); // Get a node from the current level.

        // Explore neighbors of the poppedNode.
        for (var connectedNodeIdx = 0; connectedNodeIdx < nodeCount; connectedNodeIdx++) {
          // If there's no edge from poppedNode to connectedNodeIdx, skip.
          if (adjMatrix[poppedNode][connectedNodeIdx] === "0") {
            continue;
          }

          // If the connectedNodeIdx has not been visited yet.
          if (distanceMap[connectedNodeIdx] === -1) {
            distanceMap[connectedNodeIdx] = currentDistanceLevel + 1; // Assign its distance.
            nextLevelQueue.push(connectedNodeIdx); // Add to the next level's queue.
          }
          // If the connectedNodeIdx has been visited, check for consistency.
          // It should either be at the previous level (u-1) or the current level (u+1, if it was added from another path).
          // If it's anything else, it indicates a cycle or inconsistency that makes the graph invalid for this problem.
          else if (distanceMap[connectedNodeIdx] !== currentDistanceLevel - 1 && distanceMap[connectedNodeIdx] !== currentDistanceLevel + 1) {
            return -1; // Inconsistent state detected.
          }
        }
      }
      currentDistanceLevel++; // Move to the next distance level.
      currentLevelQueue = nextLevelQueue; // Set the next level's queue as the current one.
    }

    // After BFS from currentNodeIndex, update the overall maximum distance.
    if (maxGraphDistance < currentDistanceLevel) {
      maxGraphDistance = currentDistanceLevel;
    }
  }

  // The final result is the maximum distance found plus the count of isolated nodes.
  return maxGraphDistance + isolatedNodeCounter;
}
