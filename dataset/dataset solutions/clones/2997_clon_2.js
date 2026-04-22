"use strict";

// Utility class for parsing input data streams line by line and token by token.
function StreamParser(sourceText, dataConverter) {
  this._inputSegments = sourceText.split("\n"); // Store input text split by newlines.
  this._tokenPosition = 0; // Current token index within the active line.
  this._linePosition = 0; // Current line index in the input segments.
  this._typeConverter = dataConverter || parseInt; // Default converter for tokens, if none provided.
}

StreamParser.prototype.extractToken = function(valueHandler) {
  // Retrieve the current line from the input segments.
  let currentLine = this._inputSegments[this._linePosition];
  if (currentLine) { // Check if the line exists.
    // Trim whitespace and split the line into individual tokens.
    let parsedTokens = currentLine.trim().split(" ");
    // Get the token at the current position.
    let extractedValue = parsedTokens[this._tokenPosition];
    // Advance the token position for the next read.
    this._tokenPosition++;
    // If all tokens on the current line have been read, reset token position and advance to the next line.
    if (parsedTokens.length === this._tokenPosition) {
      this._tokenPosition = 0;
      this._linePosition++;
    }
    // Apply the provided valueHandler or the default typeConverter to the extracted value.
    return valueHandler ? valueHandler(extractedValue) : this._typeConverter(extractedValue);
  }
};

StreamParser.prototype.extractLine = function(tokenProcessor) {
  // Get the complete text of the current line.
  let entireLine = this._inputSegments[this._linePosition];
  if (entireLine) { // Ensure the line is not undefined.
    this._tokenPosition = 0; // Reset token position for the new line.
    this._linePosition++; // Advance to the next line for subsequent reads.
    // Split the line into tokens and apply the tokenProcessor or default converter to each.
    return entireLine.split(" ").map(tokenProcessor || this._typeConverter);
  }
};

module.exports = StreamParser; // Export the parsing utility.

// Main function to orchestrate the game simulation logic.
function runExecution(programInput) {
  let streamHandler = new StreamParser(programInput); // Initialize input stream handler.

  let vertexCount = streamHandler.extractToken(); // Read the total number of vertices in the graph.

  // Create an adjacency list representation for the graph.
  // The array size is vertexCount + 1 to use 1-based indexing for vertices.
  let graphStructure = Array(vertexCount + 1).fill().map(() => []);
  graphStructure[0] = undefined; // Mark index 0 as unused or undefined.

  // Loop to read and build the edges of the graph.
  for (let iterationIndex = 0; iterationIndex < vertexCount - 1; iterationIndex++) {
    let vertexA = streamHandler.extractToken(); // Read the first vertex of an edge.
    let vertexB = streamHandler.extractToken(); // Read the second vertex of an edge.

    // Add edges to the adjacency list (undirected graph).
    graphStructure[vertexA].push(vertexB);
    graphStructure[vertexB].push(vertexA);
  }

  // Determine the outcome of the game.
  let finalOutcome = calculateOutcome(graphStructure);

  // Output the result based on the game outcome.
  if (finalOutcome === "solved") { // Special condition indicating an immediate win.
    console.log("First");
  } else {
    // If outcome is a number, check parity to determine winner.
    console.log(finalOutcome % 2 === 1 ? "First" : "Second")
  }
}

// Recursive function to determine the game's outcome.
function calculateOutcome(currentStructure) {
  // Base case: If only one active node remains, it's a win for the current player.
  if (currentStructure.filter(graphEntry => graphEntry).length === 1) return 1;

  // Find an index of a node that is a leaf (degree 1) in the current graph.
  let identifiedLeaf = currentStructure.findIndex(nodeElement => nodeElement && nodeElement.length === 1);

  // First scenario: Remove all current leaf nodes from the graph.
  let prunedStructure = clipEndpoints(currentStructure);
  let firstAttemptOutcome; // Variable to store outcome of the first scenario.

  if (prunedStructure.length > 0) { // Proceed if the graph is not empty after pruning.
    firstAttemptOutcome = calculateOutcome(prunedStructure); // Recursive call for the pruned graph.
  }

  // Second scenario: Restore the identified leaf node and its connection to its parent.
  // This simulates a move where only one specific leaf is not removed.
  prunedStructure[identifiedLeaf] = currentStructure[identifiedLeaf];
  // Re-establish the connection from the parent to the restored leaf.
  if (prunedStructure[currentStructure[identifiedLeaf][0]]) {
    prunedStructure[currentStructure[identifiedLeaf][0]].push(identifiedLeaf);
  }
  let secondAttemptOutcome = calculateOutcome(prunedStructure); // Recursive call for this modified graph.

  // Compare outcomes of the two scenarios to determine the current player's best move.
  if (firstAttemptOutcome === undefined) { // If the first scenario led to an empty graph (no outcome).
    return (secondAttemptOutcome + 1) % 2; // Outcome is based solely on the second scenario.
  }
  if (firstAttemptOutcome !== secondAttemptOutcome) { // If the two scenarios yield different results.
    return 1; // Current player can force a win (by choosing the scenario that leads to 1).
  } else { // If both scenarios yield the same result.
    return (firstAttemptOutcome + 1) % 2; // The outcome is the opposite of what both scenarios yield.
  }
}

// Helper function to remove all leaf nodes from a graph.
function clipEndpoints(sourceGraph) {
  let terminalNodes = []; // Array to store indices of leaf nodes.
  // Iterate through the graph to identify all leaf nodes.
  for (let vertexIterator = 0; vertexIterator < sourceGraph.length; vertexIterator++) {
    // A node is a leaf if it exists and has exactly one connection.
    if (sourceGraph[vertexIterator] && sourceGraph[vertexIterator].length === 1) {
      terminalNodes.push(vertexIterator); // Add leaf node's index to the list.
    }
  }

  let prunedStructure = []; // Initialize a new array for the graph without leaves.
  // Iterate over the original graph's adjacency lists.
  sourceGraph.forEach((connectionList, vertexIterator) => {
    // Only process nodes that exist and are not leaves (i.e., have more than one connection).
    if (connectionList && connectionList.length > 1) {
      // Filter out any connections to nodes that were identified as leaves.
      prunedStructure[vertexIterator] = connectionList.filter(connectedVertex => terminalNodes.indexOf(connectedVertex) < 0);
    }
  });

  return prunedStructure; // Return the graph with leaves removed.
}

// Entry point: Read input from standard input and start the program.
runExecution(require("fs").readFileSync("/dev/stdin", "utf8"));