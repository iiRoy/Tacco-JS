"use strict";

// Input acquisition and parsing utilities
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");
var tokenStream = rawData.split(/ |\n/);
var tokenIndex = 0;

// Retrieves the next value from the token stream.
// If 'asString' is true, returns it as a string; otherwise, as a number.
function retrieveNextValue(asString) {
  return asString ? tokenStream[tokenIndex++] : +tokenStream[tokenIndex++];
}

// Retrieves a specified number of values from the token stream.
// If 'asStrings' is true, returns them as strings; otherwise, as numbers.
function retrieveMultipleValues(count, asStrings) {
  return asStrings ? tokenStream.slice(tokenIndex, tokenIndex += count) : tokenStream.slice(tokenIndex, tokenIndex += count).map(item => +item);
}

// Retrieves a matrix of values from the token stream.
// 'height' is the number of rows, 'width' is the number of columns per row.
// If 'asStrings' is true, values are strings; otherwise, numbers.
function retrieveMatrix(height, width, asStrings) {
  var matrixRows = [];
  var currentRowIndex = 0;
  if (asStrings) {
    for (; currentRowIndex < height; currentRowIndex++) {
      matrixRows.push(tokenStream.slice(tokenIndex, tokenIndex += width));
    }
  } else {
    for (; currentRowIndex < height; currentRowIndex++) {
      matrixRows.push(tokenStream.slice(tokenIndex, tokenIndex += width).map(item => +item));
    }
  }
  return matrixRows;
}

// Dynamically creates a multi-dimensional array based on provided dimensions.
// 'initialValue' is the value to fill the innermost array elements.
function createMultiDimArray(initialValue) {
  var dimensionArguments = arguments;
  var totalDimensions = dimensionArguments.length;
  var arrayCreationExpression = "Array(dimensionArguments[" + --totalDimensions + "]).fill().map(x=>{return " + initialValue + ";})";
  while (--totalDimensions) {
    arrayCreationExpression = "Array(dimensionArguments[" + totalDimensions + "]).fill().map(x=>" + arrayCreationExpression + ")";
  }
  return eval(arrayCreationExpression);
}

// Global variables for graph data and results
var nodeCount;
var adjacencyList;
var nodeDepths;
var resultArray;

// Performs a Depth-First Search (DFS) traversal on the graph.
// 'currentNode': The node currently being visited.
// 'parentNode': The node from which 'currentNode' was visited (to avoid cycles).
// 'currentDepth': The depth of 'currentNode' from the root.
function exploreTree(currentNode, parentNode, currentDepth) {
  nodeDepths[currentNode] = currentDepth; // Record the depth of the current node
  // Iterate through all neighbors of the current node
  for (var neighborIterator = 0; neighborIterator < adjacencyList[currentNode].length; neighborIterator++) {
    var neighborNode = adjacencyList[currentNode][neighborIterator];
    // If the neighbor is the parent, skip it to prevent backtracking up the tree
    if (neighborNode === parentNode) {
      continue;
    }
    // Recursively call DFS for the neighbor, incrementing the depth
    exploreTree(neighborNode, currentNode, currentDepth + 1);
  }
}

// Main function to process the graph and determine node values.
function processGraph() {
  nodeCount = retrieveNextValue(); // Read the total number of nodes
  adjacencyList = createMultiDimArray("[]", nodeCount); // Initialize adjacency list for each node
  nodeDepths = Array(nodeCount); // Array to store the depth of each node
  resultArray = Array(nodeCount); // Array to store the final assigned values

  // Read 'nodeCount - 1' edges to build the graph
  for (var edgeIterator = 1; edgeIterator < nodeCount; edgeIterator++) {
    var firstNode = retrieveNextValue() - 1; // Read first node of an edge (0-indexed)
    var secondNode = retrieveNextValue() - 1; // Read second node of an edge (0-indexed)
    adjacencyList[firstNode].push(secondNode); // Add edge to adjacency list
    adjacencyList[secondNode].push(firstNode); // Add reverse edge for undirected graph
  }

  // Start DFS from node 0 (arbitrary root), with no parent (-1) and depth 0
  exploreTree(0, -1, 0);

  var oddDepthCount = 0; // Counter for nodes at odd depths
  var evenDepthCount = 0; // Counter for nodes at even depths

  // Determine parity of each node's depth and count them
  for (var nodeIterator = 0; nodeIterator < nodeCount; nodeIterator++) {
    resultArray[nodeIterator] = nodeDepths[nodeIterator] % 2; // 0 for even depth, 1 for odd depth
    if (resultArray[nodeIterator]) {
      oddDepthCount++; // Increment odd depth count
    } else {
      evenDepthCount++; // Increment even depth count
    }
  }

  // Calculate partition sizes for value assignment (unused 'remainingNodes' variable)
  var ceilThird = Math.ceil(nodeCount / 3);
  var floorThird = nodeCount / 3 | 0;
  var remainingNodes = nodeCount - ceilThird - floorThird; // This variable is not used in the original logic

  // Initialize counters for assigning values (1, 2, 3, 4, 5, 6, ...)
  var valueOne = 1; // For numbers of the form 3k+1
  var valueTwo = 2; // For numbers of the form 3k+2
  var valueThree = 3; // For numbers of the form 3k

  // Logic for assigning values based on the counts of odd/even depth nodes
  if (oddDepthCount <= floorThird) { // Case 1: Few odd-depth nodes, assign them 3k values
    for (var nodeIterator = 0; nodeIterator < nodeCount; nodeIterator++) {
      if (resultArray[nodeIterator]) { // If node has odd depth
        resultArray[nodeIterator] = valueThree; // Assign 3k value
        valueThree += 3; // Increment 3k counter
      } else { // If node has even depth
        if (valueOne <= nodeCount) { // Try to assign 3k+1
          resultArray[nodeIterator] = valueOne;
          valueOne += 3;
        } else if (valueTwo <= nodeCount) { // Try to assign 3k+2
          resultArray[nodeIterator] = valueTwo;
          valueTwo += 3;
        } else { // Fallback to 3k if 3k+1 and 3k+2 are exhausted
          resultArray[nodeIterator] = valueThree;
          valueThree += 3;
        }
      }
    }
  } else if (evenDepthCount <= floorThird) { // Case 2: Few even-depth nodes, assign them 3k values
    for (var nodeIterator = 0; nodeIterator < nodeCount; nodeIterator++) {
      if (resultArray[nodeIterator] === 0) { // If node has even depth
        resultArray[nodeIterator] = valueThree; // Assign 3k value
        valueThree += 3;
      } else { // If node has odd depth
        if (valueOne <= nodeCount) { // Try to assign 3k+1
          resultArray[nodeIterator] = valueOne;
          valueOne += 3;
        } else if (valueTwo <= nodeCount) { // Try to assign 3k+2
          resultArray[nodeIterator] = valueTwo;
          valueTwo += 3;
        } else { // Fallback to 3k
          resultArray[nodeIterator] = valueThree;
          valueThree += 3;
        }
      }
    }
  } else { // Case 3: Both odd and even depth nodes are numerous
    for (var nodeIterator = 0; nodeIterator < nodeCount; nodeIterator++) {
      if (resultArray[nodeIterator]) { // If node has odd depth
        if (valueOne <= nodeCount) { // Assign 3k+1
          resultArray[nodeIterator] = valueOne;
          valueOne += 3;
        } else { // Fallback to 3k
          resultArray[nodeIterator] = valueThree;
          valueThree += 3;
        }
      } else { // If node has even depth
        if (valueTwo <= nodeCount) { // Assign 3k+2
          resultArray[nodeIterator] = valueTwo;
          valueTwo += 3;
        } else { // Fallback to 3k
          resultArray[nodeIterator] = valueThree;
          valueThree += 3;
        }
      }
    }
  }

  return resultArray.join(" "); // Return the final assigned values as a space-separated string
}

// Entry point for execution, handling potential stack size issues in competitive programming
if (process.argv.length <= 2) {
  require("child_process").fork("Main.js", ["1"], { execArgv: ["--stack-size=240000"] });
} else {
  var finalOutput = processGraph();
  if (finalOutput !== undefined) {
    console.log(finalOutput);
  }
}
