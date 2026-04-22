"use strict"; // Enforce strict parsing and execution rules for the entire script.

// Load the necessary file system module from the environment.
let fileSystemModule = require("fs");

// Read all data from the standard input stream, interpreting it as UTF-8 text.
let rawInputData = fileSystemModule.readFileSync("/dev/stdin", "utf8");

// Split the entire input string by spaces or newlines into an array of tokens.
// Initialize an index to keep track of the current token being processed.
let tokenCollection = rawInputData.split(/ |\n/);
let currentTokenPointer = 0;

/**
 * Function to retrieve the next token from the global collection.
 * @param {boolean} retrieveAsString - If true, returns the token as a string; otherwise, attempts to parse it as a number.
 * @returns {string|number} The next token from the input stream.
 */
function readNextInputToken(retrieveAsString) {
  // Increment pointer after accessing token.
  return retrieveAsString ? tokenCollection[currentTokenPointer++] : +tokenCollection[currentTokenPointer++];
}

/**
 * Function to read a specified 'amount' of tokens from the input stream.
 * @param {number} amount - The number of tokens to extract.
 * @param {function} transformationFunction - An optional function to apply to each extracted token (e.g., parsing to number).
 * @returns {Array<string|number>} An array containing the extracted tokens.
 */
function extractNextTokens(amount, transformationFunction) {
  // Extract a segment of tokens from the collection.
  let startOffset = currentTokenPointer;
  currentTokenPointer += amount;
  let extractedSegment = tokenCollection.slice(startOffset, currentTokenPointer);

  // Apply transformation if a function is given.
  if (transformationFunction) {
    return extractedSegment.map(item => +item); // Convert each item to a number.
  }
  return extractedSegment;
}

/**
 * Function to read a 2D grid (matrix) of specified dimensions from the input.
 * @param {number} numRows - The number of rows in the matrix.
 * @param {number} numCols - The number of columns in the matrix.
 * @param {boolean} isStringMatrix - If true, elements are kept as strings; otherwise, converted to numbers.
 * @returns {Array<Array<string|number>>} A 2D array representing the grid data.
 */
function retrieveGridData(numRows, numCols, isStringMatrix) {
  let gridOutput = [];
  let rowIterator = 0;

  // Iterate through each row and populate the grid.
  if (isStringMatrix) {
    for (; rowIterator < numRows; rowIterator++) {
      gridOutput.push(tokenCollection.slice(currentTokenPointer, currentTokenPointer += numCols));
    }
  } else {
    for (; rowIterator < numRows; rowIterator++) {
      gridOutput.push(tokenCollection.slice(currentTokenPointer, currentTokenPointer += numCols).map(val => +val));
    }
  }
  return gridOutput;
}

/**
 * Utility function to dynamically create a multi-dimensional array.
 * @param {*} fillerValue - The initial value to populate the innermost elements.
 * @param {...number} dimensions - A sequence of numbers defining the sizes of each dimension.
 * @returns {Array} The newly created multi-dimensional array.
 */
function generateNestedArray(fillerValue) {
  let dimensionArguments = arguments;
  let totalDimensions = dimensionArguments.length;
  let currentDimensionIndex = totalDimensions - 1; // Start from innermost dimension.

  // Build the array creation string recursively, from inside out.
  let arrayCreationExpression = "Array(dimensionArguments[" + currentDimensionIndex + "]).fill().map(elem => { return " + fillerValue + "; })";
  while (--currentDimensionIndex) {
    arrayCreationExpression = "Array(dimensionArguments[" + currentDimensionIndex + "]).fill().map(elem => " + arrayCreationExpression + ")";
  }

  // Execute the dynamically built string to create the array structure.
  return eval(arrayCreationExpression);
}

/**
 * Performs a binary search (lower bound) on a sorted array to find the insertion point for a target value.
 * @param {Array<number>} orderedList - The sorted array to search within.
 * @param {number} target - The value for which to find the insertion point.
 * @param {number} [startIndex=0] - The starting index of the search range.
 * @param {number} [endIndex=orderedList.length] - The ending index (exclusive) of the search range.
 * @returns {number} The index where the target value could be inserted to maintain sorted order.
 */
function findLowerBoundIndex(orderedList, target, startIndex = 0, endIndex = orderedList.length) {
  let midPoint;
  // Binary search loop: continues as long as the range has more than one element.
  while (1 < endIndex - startIndex) {
    midPoint = startIndex + endIndex >> 1; // Calculate midpoint using bitwise shift for integer division.
    if (orderedList[midPoint] < target) {
      startIndex = midPoint; // Target is in the upper half.
    } else {
      endIndex = midPoint; // Target is in the lower half or at midpoint.
    }
  }
  // Adjust based on the final comparison of the single remaining element.
  return orderedList[startIndex] < target ? endIndex : startIndex;
}


// Global variables for computation results and data structures.
let finalResultArray; // Stores the computed results for each node after traversal.
let activeLisTracker = [0]; // Tracks elements for the Longest Increasing Subsequence (LIS) during DFS.
let graphConnections; // Represents the graph structure using an adjacency list.
let nodeDataValues; // Stores the numerical data associated with each node in the graph.

// Execute the primary logic of the program and capture its output.
let processedOutput = executePrimaryLogic();

// If the program generated an output, print it to the console.
if (processedOutput !== undefined) {
  console.log(processedOutput);
}

/**
 * Main function encapsulating the core logic of the program.
 * Reads input, builds the graph, performs DFS, and compiles results.
 * @returns {string} A newline-separated string of results for each node.
 */
function executePrimaryLogic() {
  // Read the total number of nodes in the graph from the input.
  let totalNodes = readNextInputToken();

  // Read the data values associated with each node.
  nodeDataValues = extractNextTokens(totalNodes, true); // 'true' converts tokens to numbers.

  // Initialize the adjacency list for the graph. Each node starts with an empty list of neighbors.
  graphConnections = generateNestedArray("[]", totalNodes);

  // Read edge connections from input and build the graph's adjacency list.
  for (let currentEdge = 1; currentEdge < totalNodes; currentEdge++) {
    // Read two connected nodes (adjusting to 0-indexed).
    let nodeOne = readNextInputToken() - 1;
    let nodeTwo = readNextInputToken() - 1;

    // Add bidirectional edges to represent connections.
    graphConnections[nodeOne].push(nodeTwo);
    graphConnections[nodeTwo].push(nodeOne);
  }

  // Initialize the array that will store the final results for each node, all set to zero initially.
  finalResultArray = generateNestedArray(0, totalNodes);

  // Start the Depth First Search traversal from the root node (node 0), with no parent (-1).
  depthFirstTraversal(0, -1);

  // Join the results for each node with newline characters and return the combined string.
  return finalResultArray.join("\n");
}

/**
 * Depth First Search function to traverse the tree structure and compute LIS properties.
 * This function maintains a "Longest Increasing Subsequence" (LIS) tracker.
 * @param {number} currentVertex - The identifier of the node currently being visited.
 * @param {number} parentVertex - The identifier of the parent node of the current vertex (or -1 if root).
 */
function depthFirstTraversal(currentVertex, parentVertex) {
  // Find the appropriate index in 'activeLisTracker' where the current node's value could be inserted
  // to maintain the increasing order (lower bound).
  let insertionPoint = findLowerBoundIndex(activeLisTracker, nodeDataValues[currentVertex]);
  let originalValueAtPoint; // Variable to temporarily store a value if it's replaced.

  // Check if the insertion point is within the current bounds of the LIS tracker.
  if (insertionPoint !== activeLisTracker.length) {
    // If an element exists at 'insertionPoint', store its original value.
    originalValueAtPoint = activeLisTracker[insertionPoint];
    // Replace the element at 'insertionPoint' with the current node's data value.
    activeLisTracker[insertionPoint] = nodeDataValues[currentVertex];
  } else {
    // If the insertion point is at the end, it means the current value extends the LIS.
    // Increment the index (conceptually) and append the new value to the tracker.
    insertionPoint++; // Adjust for 0-based index vs array length.
    activeLisTracker.push(nodeDataValues[currentVertex]);
  }

  // Record the length of the current LIS (activeLisTracker.length - 1, as it starts with [0])
  // as the result for the current vertex.
  finalResultArray[currentVertex] = activeLisTracker.length - 1;

  // Iterate through all neighbors of the current vertex.
  for (let neighborIndex = 0; neighborIndex < graphConnections[currentVertex].length; neighborIndex++) {
    let adjacentVertex = graphConnections[currentVertex][neighborIndex];

    // Skip the parent vertex to prevent traversing back up the tree and infinite loops.
    if (adjacentVertex === parentVertex) {
      continue;
    }
    // Recursively call DFS on the neighbor, setting the current vertex as its parent.
    depthFirstTraversal(adjacentVertex, currentVertex);
  }

  // Backtrack: Restore the 'activeLisTracker' to its state before processing 'currentVertex'.
  if (insertionPoint === activeLisTracker.length) {
    // If an element was appended (LIS extended), remove it.
    activeLisTracker.pop();
  } else {
    // If an element was replaced, restore its original value.
    activeLisTracker[insertionPoint] = originalValueAtPoint;
  }
}