"use strict";

// This class handles parsing input data line by line and token by token.
function InputProcessor(inputStringContent, parseValueFunction) {
  this.sourceLines = inputStringContent.split("\n"); // Stores all lines from the input
  this.currentColumnIndex = 0; // Tracks the current token position within a line
  this.currentLineIndex = 0; // Tracks the current line number
  this.valueConverter = parseValueFunction || Number; // Function to convert tokens, defaults to Number
}

// Method to read the next token from the input
InputProcessor.prototype.readNextToken = function(customConverter) {
  let currentLineText = this.sourceLines[this.currentLineIndex];
  if (currentLineText) {
    let tokensOnLine = currentLineText.trim().split(" ");
    let nextTokenValue = tokensOnLine[this.currentColumnIndex];
    this.currentColumnIndex++; // Move to the next token
    // If all tokens on the current line are consumed, reset column and advance to next line
    if (tokensOnLine.length === this.currentColumnIndex) {
      this.currentColumnIndex = 0;
      this.currentLineIndex++;
    }
    // Apply custom converter or default value converter
    return customConverter ? customConverter(nextTokenValue) : this.valueConverter(nextTokenValue);
  }
};

// Method to read all tokens from the current line as an array
InputProcessor.prototype.readCurrentLineTokens = function(lineTokenConverter) {
  let lineContent = this.sourceLines[this.currentLineIndex];
  if (lineContent) {
    this.currentColumnIndex = 0; // Reset column index for a full line read
    this.currentLineIndex++; // Advance to the next line
    // Split the line and map tokens using the provided converter or default
    return lineContent.split(" ").map(lineTokenConverter || this.valueConverter);
  }
};

module.exports = InputProcessor;

// Main function to orchestrate the graph processing and game outcome determination.
function processGraphInput(rawInputData) {
  // Initialize an input parser instance.
  let dataReader = new InputProcessor(rawInputData);

  // Read the total number of nodes (vertices) in the graph.
  let numberOfNodes = dataReader.readNextToken();

  // Create an adjacency list representation for the graph.
  // The array is sized for numberOfNodes + 1, with index 0 typically unused or undefined.
  let graphAdjacencyList = Array(numberOfNodes + 1).fill().map(() => []);
  graphAdjacencyList[0] = undefined; // Explicitly mark index 0 as unused or invalid.

  // Read N-1 edges to construct the graph.
  // Each edge connects two nodes, making it an undirected graph.
  for (let edgeCounter = 0; edgeCounter < numberOfNodes - 1; edgeCounter++) {
    let nodeOne = dataReader.readNextToken();
    let nodeTwo = dataReader.readNextToken();

    // Add connections to both nodes' adjacency lists.
    graphAdjacencyList[nodeOne].push(nodeTwo);
    graphAdjacencyList[nodeTwo].push(nodeOne);
  }

  // Determine the winner of the game based on the constructed graph.
  let gameOutcome = calculateGameOutcome(graphAdjacencyList);

  // Output the result based on the game outcome.
  if (gameOutcome === "solved") {
    console.log("First"); // Special case for a direct "solved" state.
  } else {
    // For numeric outcomes, determine winner based on parity.
    console.log(gameOutcome % 2 === 1 ? "First" : "Second");
  }
}

// Recursive function to determine the game outcome based on graph properties.
function calculateGameOutcome(currentGraphState) {
  // Base case: If only one active node remains, the current player wins (value 1).
  if (currentGraphState.filter(node => node).length === 1) {
    return 1;
  }

  // Find the index of a node that is a leaf (degree 1).
  let firstLeafNodeIdx = currentGraphState.findIndex(vertex => vertex && vertex.length === 1);

  // Scenario 1: Consider the game state after removing all current leaf nodes.
  let graphAfterPruning = pruneLeaves(currentGraphState);
  let outcomeFromPruning; // Variable to store the result of the first recursive call.

  // Only recurse if the pruned graph still contains nodes.
  if (graphAfterPruning.length > 0) {
    outcomeFromPruning = calculateGameOutcome(graphAfterPruning);
  }

  // Scenario 2: Re-introduce the specific leaf node found earlier and its connection.
  // This simulates a different game path where that leaf is not immediately removed.
  graphAfterPruning[firstLeafNodeIdx] = currentGraphState[firstLeafNodeIdx]; // Restore the leaf node.
  // Restore the connection from the leaf's neighbor back to the leaf.
  if (graphAfterPruning[currentGraphState[firstLeafNodeIdx][0]]) {
    graphAfterPruning[currentGraphState[firstLeafNodeIdx][0]].push(firstLeafNodeIdx);
  }
  let outcomeFromModifiedPruning = calculateGameOutcome(graphAfterPruning); // Second recursive call.

  // Compare the outcomes of the two scenarios to determine the current player's move.
  if (outcomeFromPruning === undefined) {
    // If the first scenario led to an empty graph (no outcome),
    // the outcome is based solely on the second scenario, flipped.
    return (outcomeFromModifiedPruning + 1) % 2;
  }
  if (outcomeFromPruning !== outcomeFromModifiedPruning) {
    // If the outcomes differ, the current player can force a win (value 1).
    return 1;
  } else {
    // If outcomes are the same, the current player's move flips the outcome.
    return (outcomeFromPruning + 1) % 2;
  }
}

// Helper function to create a new graph by removing all current leaf nodes.
function pruneLeaves(originalGraphStructure) {
  let terminalNodes = []; // Collects indices of all leaf nodes.
  for (let nodeIndex = 0; nodeIndex < originalGraphStructure.length; nodeIndex++) {
    // A node is a leaf if it exists and has only one connection.
    if (originalGraphStructure[nodeIndex] && originalGraphStructure[nodeIndex].length === 1) {
      terminalNodes.push(nodeIndex);
    }
  }

  let resultingGraph = []; // This will store the graph after pruning.
  // Iterate over the original graph to build the pruned version.
  originalGraphStructure.forEach((vertexConnections, currentVertexIdx) => {
    // Only consider nodes that are not leaves themselves and have more than one connection.
    if (vertexConnections && vertexConnections.length > 1) {
      // Filter out connections to nodes that are identified as leaves.
      resultingGraph[currentVertexIdx] = vertexConnections.filter(
        connectedNode => terminalNodes.indexOf(connectedNode) < 0
      );
    }
  });
  
  return resultingGraph;
}

// Execute the main processing function with input read from standard input.
processGraphInput(require("fs").readFileSync("/dev/stdin", "utf8"));
