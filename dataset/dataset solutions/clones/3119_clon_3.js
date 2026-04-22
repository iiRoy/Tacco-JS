"use strict";

// This class provides utilities for parsing textual input,
// typically from a file or a string, line by line and token by token.
// It allows for sequential reading of values, converting them to a specified type.
function TokenReader(sourceText, valueConverter) {
  // An array where each element is a line from the input source text.
  this.sourceLines = sourceText.split("\n");

  // Pointer to the current token's index within the currently processed line.
  // This resets to 0 when advancing to a new line.
  this.currentTokenIndex = 0;

  // Pointer to the current line's index in the sourceLines array.
  this.currentLineIndex = 0;

  // The function used to convert raw string tokens into the desired data type.
  // Defaults to the global `Number` constructor if not explicitly provided.
  this.parseFunction = valueConverter || Number;
}

// Prototype method to retrieve and return the next single token from the input stream.
// It automatically manages line and token progression.
TokenReader.prototype.fetchSingleValue = function() {
  // Guard clause: If all lines have been processed, there are no more values.
  if (this.currentLineIndex >= this.sourceLines.length) {
    return undefined; // Signifies end of stream.
  }

  // Get the current line based on the `currentLineIndex`.
  let activeLine = this.sourceLines[this.currentLineIndex];

  // If the current line is empty or just whitespace, skip it and try the next one.
  if (!activeLine || activeLine.trim() === "") {
    this.currentLineIndex++; // Advance to the next line.
    this.currentTokenIndex = 0; // Reset token index for the new line.
    return this.fetchSingleValue(); // Recursively call to get a value from the next valid line.
  }

  // Split the current line into an array of tokens.
  // `/\s+/` handles one or more whitespace characters as delimiters.
  // `.filter(Boolean)` removes any empty strings that might result from extra spaces.
  let tokensOnCurrentLine = activeLine.split(/\s+/).filter(Boolean);

  // Check if all tokens on the current line have already been read.
  if (this.currentTokenIndex >= tokensOnCurrentLine.length) {
    // If so, reset token index and advance to the next line.
    this.currentTokenIndex = 0;
    this.currentLineIndex++;
    // Recursively call to fetch a value from the newly advanced line.
    return this.fetchSingleValue();
  }

  // Extract the raw string token at the current `currentTokenIndex`.
  let rawTokenString = tokensOnCurrentLine[this.currentTokenIndex];

  // Increment the token pointer for the subsequent read operation.
  this.currentTokenIndex++;

  // Convert the raw string token to the target data type using the `parseFunction`.
  let convertedValue = this.parseFunction(rawTokenString);

  return convertedValue;
};

// Prototype method to read and return all tokens from the current line as an array.
// After reading, it advances the line pointer to the next line.
TokenReader.prototype.fetchLineAsArray = function() {
  // Guard clause: If no more lines are available, return undefined.
  if (this.currentLineIndex >= this.sourceLines.length) {
    return undefined; // End of stream.
  }

  // Retrieve the current line string.
  let currentInputLine = this.sourceLines[this.currentLineIndex];

  // Reset the token index as this method processes the entire line.
  this.currentTokenIndex = 0;
  // Advance the line pointer immediately to the next line for future reads.
  this.currentLineIndex++;

  // If the line is empty or consists only of whitespace, return an empty array.
  if (!currentInputLine || currentInputLine.trim() === "") {
      return [];
  }

  // Split the line into tokens, filter out empty strings, and convert each token.
  let processedTokensArray = currentInputLine.split(/\s+/).filter(Boolean).map(this.parseFunction);

  return processedTokensArray;
};

// Export the TokenReader class, making it available for other modules.
module.exports = TokenReader;

// The primary function to analyze graph-related data provided as raw input.
function analyzeNetwork(rawInputData) {
  // Instantiate a TokenReader to parse the input data.
  const inputProcessor = new TokenReader(rawInputData);

  // Read the total number of vertices (nodes) in the graph.
  const totalVertices = inputProcessor.fetchSingleValue();
  // Read the total number of edges (connections) in the graph.
  const totalConnections = inputProcessor.fetchSingleValue();

  // Perform basic validation on the initial graph parameters.
  // Ensure that vertex count is a positive number and connection count is non-negative.
  if (isNaN(totalVertices) || totalVertices <= 0 || isNaN(totalConnections) || totalConnections < 0) {
      console.error("Input Error: The number of vertices or connections is invalid.");
      // For this problem, invalid initial input leads to a "No" outcome.
      console.log("No");
      return;
  }

  // Initialize the adjacency list for the graph.
  // `Array.from` creates an array of `totalVertices + 1` elements.
  // Using 1-based indexing for nodes, so index 0 remains unused or empty.
  const graphAdjacencyList = Array.from({ length: totalVertices + 1 }, () => []);

  // Loop through each connection to build the graph's adjacency list.
  for (let connectionCounter = 0; connectionCounter < totalConnections; connectionCounter++) {
    // Read the two endpoints (nodes) of the current edge.
    const nodeEndpoint1 = inputProcessor.fetchSingleValue();
    const nodeEndpoint2 = inputProcessor.fetchSingleValue();

    // Validate that the endpoints are valid node numbers within the graph's bounds.
    if (isNaN(nodeEndpoint1) || isNaN(nodeEndpoint2) ||
        nodeEndpoint1 < 1 || nodeEndpoint1 > totalVertices ||
        nodeEndpoint2 < 1 || nodeEndpoint2 > totalVertices) {
        console.error(`Data Integrity Warning: Invalid edge (${nodeEndpoint1}, ${nodeEndpoint2}) detected. Skipping this edge.`);
        // If an invalid edge is found, the problem context implies a "No" result.
        console.log("No");
        return;
    }

    // Since this is an undirected graph, add each endpoint to the other's adjacency list.
    graphAdjacencyList[nodeEndpoint1].push(nodeEndpoint2);
    graphAdjacencyList[nodeEndpoint2].push(nodeEndpoint1);
  }

  // --- Analysis of Graph Properties ---

  // Flag to track if any node in the graph has a degree (number of connections) exactly equal to 6.
  let hasNodeWithDegreeSix = false;
  // Flag to track if all nodes in the graph have an even degree.
  let allNodesHaveEvenDegrees = true;

  // We are interested in nodes from 1 to `totalVertices`.
  // `slice(1)` creates a new array containing only the relevant node entries,
  // effectively ignoring the unused `graphAdjacencyList[0]`.
  const activeNodeEntries = graphAdjacencyList.slice(1);

  // Determine `hasNodeWithDegreeSix` using `Array.prototype.some`.
  // `some` returns true if at least one element satisfies the condition.
  hasNodeWithDegreeSix = activeNodeEntries.some(neighbors => neighbors.length === 6);

  // Determine `allNodesHaveEvenDegrees` using `Array.prototype.every`.
  // `every` returns true if all elements satisfy the condition.
  allNodesHaveEvenDegrees = activeNodeEntries.every(neighbors => neighbors.length % 2 === 0);

  // Based on the evaluated flags, determine the final output message.
  const finalOutputStatus = (hasNodeWithDegreeSix && allNodesHaveEvenDegrees) ? "Yes" : "No";

  // Print the final result to the console.
  console.log(finalOutputStatus);
}

// Entry point for the script: Reads input from standard input and processes it.
try {
    const fileSystemModule = require("fs");
    // Read the entire content of `/dev/stdin` as a UTF-8 encoded string.
    const rawInputBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");
    // Pass the raw input string to the main analysis function.
    analyzeNetwork(rawInputBuffer);
} catch (errorDetails) {
    // Catch and report any errors that occur during file reading or initial parsing.
    console.error("An unexpected error occurred during input acquisition or initial processing:", errorDetails.message);
    // In case of an error, default to "No" as the output, consistent with problem's implicit error handling.
    console.log("No");
}