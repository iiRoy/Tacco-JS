"use strict";
// This class helps in processing input strings line by line and token by token.
function InputProcessor(inputString, parseFn) {
  this._sourceLines = inputString.split("\n"); // Store input as an array of lines.
  this._currentColumn = 0; // Current token index within the current line.
  this._currentLine = 0; // Current line index.
  this._parserFunction = parseFn || Number; // Function to parse tokens, defaults to Number.
}

// Method to read the next single value from the input.
InputProcessor.prototype.readNextValue = function() {
  let lineContent = this._sourceLines[this._currentLine];
  if (!lineContent) {
    return; // No more lines to read.
  }
  let tokens = lineContent.trim().split(" "); // Split the current line into tokens.
  let currentValue = tokens[this._currentColumn]; // Get the token at the current column.
  this._currentColumn++; // Move to the next token.
  if (tokens.length === this._currentColumn) {
    // If all tokens on the current line are consumed, reset column and move to next line.
    this._currentColumn = 0;
    this._currentLine++;
  }
  return this._parserFunction(currentValue); // Parse and return the value.
};

// Method to read all values from the current line.
InputProcessor.prototype.readLineValues = function() {
  let lineContent = this._sourceLines[this._currentLine];
  if (!lineContent) {
    return; // No more lines.
  }
  this._currentColumn = 0; // Reset column for line-based reading.
  this._currentLine++; // Move to the next line after reading this one.
  return lineContent.split(" ").map(this._parserFunction); // Split, parse, and return all values.
};

module.exports = InputProcessor;

// The primary function to process graph-related input and determine a property.
function processGraphData(rawData) {
  // Initialize an input parsing utility.
  const dataReader = new InputProcessor(rawData);

  // Read the number of nodes and edges from the input.
  const nodeCount = dataReader.readNextValue();
  const edgeCount = dataReader.readNextValue();

  // Create an adjacency list to represent the graph.
  const adjacencyList = [];
  // Initialize an empty array for each node's neighbors.
  for (let nodeIdx = 1; nodeIdx <= nodeCount; nodeIdx++) {
    adjacencyList[nodeIdx] = [];
  }

  // Populate the adjacency list based on the given edges.
  for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
    let nodeA = dataReader.readNextValue(); // First node of the edge.
    let nodeB = dataReader.readNextValue(); // Second node of the edge.
    adjacencyList[nodeA].push(nodeB); // Add B to A's neighbors.
    adjacencyList[nodeB].push(nodeA); // Add A to B's neighbors (undirected graph).
  }

  // Variables to track specific graph properties.
  let hasHighDegreeNode = false; // True if any node has degree >= 6.
  let nodesWithDegreeFourOrMore = 0; // Counts nodes with degree >= 4 (this part is commented out in original, so it remains 0).
  let allEvenDegrees = true; // True if all nodes have an even degree.

  // Iterate through each node to check its degree properties.
  for (let nodeIdx = 1; nodeIdx <= nodeCount; nodeIdx++) {
    // Check if any node has a degree of 6 or more.
    if (adjacencyList[nodeIdx].length >= 6) {
      hasHighDegreeNode = true;
    }

    // The following block is commented out in the original,
    // so its effect on 'nodesWithDegreeFourOrMore' is null.
    // if (adjacencyList[nodeIdx].length >= 4) {
    //   nodesWithDegreeFourOrMore += 1;
    // }

    // Check if the current node's degree is odd.
    if (adjacencyList[nodeIdx].length % 2 !== 0) {
      allEvenDegrees = false; // If any node has an odd degree, set flag to false.
    }
  }

  // Output "Yes" or "No" based on the combined conditions.
  // The condition checks if:
  // 1. There's a node with degree >= 6 OR (the count of nodes with degree >= 4 is >= 2, which is always false here due to commented code).
  // 2. AND all nodes have even degrees.
  console.log(((hasHighDegreeNode || nodesWithDegreeFourOrMore >= 2) && allEvenDegrees) ? "Yes" : "No");
}

// Read input from standard input and pass it to the main processing function.
processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
