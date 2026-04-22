"use strict";

// This module provides a utility for parsing textual input line by line.
function DataProcessor(inputString , valueConverterFunction) {
  // Store the input string split into individual lines.
  this._sourceLines = inputString .split("\n");
  // Initialize the token position within the current line.
  this._tokenPosition = 0;
  // Initialize the current line number being processed.
  this._lineIndex = 0;
  // Set the function used to convert extracted strings to desired types, defaulting to Number.
  this._valueConverter = valueConverterFunction || Number;
}

// Prototype method to retrieve the next individual item from the input stream.
DataProcessor.prototype.obtainNextElement = function ( ) {
  // Get the text of the current line.
  var currentLineText = this._sourceLines[this._lineIndex];
  // If the line is empty or undefined, there's nothing more to read.
  if (!currentLineText) return;

  // Trim whitespace from the line and split it into tokens.
  var lineTokens = currentLineText.trim().split(" ");
  // Extract the token at the current position.
  var extractedToken = lineTokens[this._tokenPosition];
  // Advance the token position.
  this._tokenPosition++;

  // Check if all tokens on the current line have been consumed.
  if (lineTokens.length === this._tokenPosition) {
    // Reset token position and move to the next line.
    this._tokenPosition = 0;
    this._lineIndex++;
  }
  // Convert and return the extracted token.
  return this._valueConverter(extractedToken);
};

// Prototype method to retrieve all items from the current line.
DataProcessor.prototype.getAllLineElements = function () {
  // Get the text of the current line.
  var currentLineText = this._sourceLines[this._lineIndex];
  // If the line is empty or undefined, return nothing.
  if (!currentLineText) return;

  // Reset token position for a full line read and advance to the next line.
  this._tokenPosition = 0;
  this._lineIndex++;
  // Split the line into tokens and convert each token using the specified function.
  return currentLineText.split(" ").map(this._valueConverter);
};

// Make the DataProcessor constructor available for external use.
module.exports = DataProcessor;

// Main function to perform graph analysis based on provided input.
function executeGraphAnalysis(graphInputContent) {
  // Create an instance of the input parser.
  const parserUtility = new DataProcessor(graphInputContent);

  // Read the total number of nodes (vertices) in the graph.
  const totalNodes = parserUtility.obtainNextElement();
  // Read the total number of edges (connections) in the graph.
  const totalEdges = parserUtility.obtainNextElement();

  // Initialize an adjacency list to store graph connections.
  const connectionMatrix = [];
  // Populate the adjacency list with empty arrays for each node.
  for (let vertexIterator = 1; vertexIterator <= totalNodes; vertexIterator++) {
    connectionMatrix[vertexIterator] = [];
  }

  // Read edge information and build the adjacency list.
  for (let linkIterator = 0; linkIterator < totalEdges; linkIterator++) {
    let firstVertex = parserUtility.obtainNextElement(); // Starting node of an edge
    let secondVertex = parserUtility.obtainNextElement(); // Ending node of an edge
    // Add bidirectional connections for undirected graph.
    connectionMatrix[firstVertex].push(secondVertex);
    connectionMatrix[secondVertex].push(firstVertex);
  }

  // Flag to check if any node has a degree of 6 or more.
  let largeDegreeExists = false;
  // Counter for nodes with a degree of 4 or more (currently unused in final logic).
  let countMidDegree = 0;
  // Flag to check if all node degrees are even.
  let evenDegreesPresent = true;
  // Iterate through all nodes to analyze their degrees.
  for (let vertexIterator = 1; vertexIterator <= totalNodes; vertexIterator++) {
    // Check if the current node's degree is 6 or greater.
    if (connectionMatrix[vertexIterator].length >= 6) {
      largeDegreeExists = true;
    }

    // This section related to 'countMidDegree' was present in the original
    // source but commented out, hence it does not affect the final outcome.
    // if (connectionMatrix[vertexIterator].length >= 4) {
    //   countMidDegree += 1;
    // }

    // Check if the current node's degree is odd.
    if (connectionMatrix[vertexIterator].length % 2 !== 0) {
      evenDegreesPresent = false;
    }
  }

  // Output "Yes" if conditions are met, otherwise "No".
  // The 'countMidDegree' variable remains 0 due to the commented-out logic,
  // so the condition 'countMidDegree >= 2' is always false.
  console.log(((largeDegreeExists || countMidDegree >= 2) && evenDegreesPresent) ? "Yes" : "No");
}

// Execute the graph analysis with input read from standard input.
executeGraphAnalysis(require("fs").readFileSync("/dev/stdin", "utf8"));