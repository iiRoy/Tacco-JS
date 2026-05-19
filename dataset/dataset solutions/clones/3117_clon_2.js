"use strict";

/**
 * Utility class for parsing input data.
 * It reads values sequentially from a multi-line string.
 * @param {string} sourceContent - The complete input string.
 * @param {function} valueConverter - A function to convert string tokens to desired types (e.g., Number).
 */
function InputProcessor(sourceContent, valueConverter) {
  // Internal array holding each line of the input.
  this._sourceLines = sourceContent.split("\n");
  // Current token index within the active line.
  this._currentColumn = 0;
  // Current line index being processed.
  this._currentLine = 0;
  // The function used to parse individual string tokens. Defaults to Number.
  this._parserFunction = valueConverter || Number;
}

/**
 * Retrieves the next single value from the input stream.
 * Advances the internal pointers to the next token.
 * @returns {*} The parsed value, or undefined if no more input.
 */
InputProcessor.prototype.getNextValue = function() {
  // Fetch the text of the current line.
  var currentLineText = this._sourceLines[this._currentLine];
  // If the line is empty or undefined, there's no more input.
  if (!currentLineText) return;

  // Split the current line into individual string tokens after trimming whitespace.
  var lineTokens = currentLineText.trim().split(" ");
  // Extract the token at the current column position.
  var parsedToken = lineTokens[this._currentColumn];
  // Increment the column pointer for the next read.
  this._currentColumn++;

  // If all tokens on the current line have been consumed, reset column and advance to the next line.
  if (lineTokens.length === this._currentColumn) {
    this._currentColumn = 0;
    this._currentLine++;
  }
  // Convert and return the extracted token.
  return this._parserFunction(parsedToken);
};

/**
 * Reads all values from the current line and returns them as an array.
 * Advances the internal pointers to the beginning of the next line.
 * @returns {Array<*>} An array of parsed values from the line, or undefined if no more lines.
 */
InputProcessor.prototype.getLineValues = function() {
  // Get the content of the current line.
  var currentLineContent = this._sourceLines[this._currentLine];
  // If the line is empty or undefined, there's no more input.
  if (!currentLineContent) return;

  // Reset the column pointer as a new line is being processed.
  this._currentColumn = 0;
  // Advance to the subsequent line.
  this._currentLine++;
  // Split the line by spaces, parse each part, and return the resulting array.
  return currentLineContent.split(" ").map(this._parserFunction);
};

// Make the InputProcessor class available for other modules.
module.exports = InputProcessor;

/**
 * The primary function that processes the input and solves the problem.
 * @param {string} rawInputData - The entire input content as a single string.
 */
function solveProblem(rawInputData) {
  // Create an instance of the input reader.
  const inputReader = new InputProcessor(rawInputData);

  // Read the total number of nodes and edges from the input.
  const nodeCount = inputReader.getNextValue();
  const edgeCount = inputReader.getNextValue();

  // Initialize an adjacency list to represent the graph.
  // Using 1-based indexing for nodes, so array size is nodeCount + 1.
  const adjacencyList = [];
  for (let k = 1; k <= nodeCount; k++) {
    adjacencyList[k] = []; // Each node starts with an empty list of neighbors.
  }

  // Read all edge connections and populate the adjacency list.
  for (let k = 0; k < edgeCount; k++) {
    let nodeA = inputReader.getNextValue(); // First node of the current edge.
    let nodeB = inputReader.getNextValue(); // Second node of the current edge.
    // Add connections for an undirected graph.
    adjacencyList[nodeA].push(nodeB);
    adjacencyList[nodeB].push(nodeA);
  }

  // Variables to track specific properties of node degrees.
  let hasDegreeSix = false; // Becomes true if any node has exactly 6 neighbors.
  let degreeFourCount = 0; // Counts how many nodes have exactly 4 neighbors.
  let allEvenDegrees = true; // Remains true if all nodes have an even number of neighbors.

  // Iterate through each node to analyze its degree.
  for (let k = 1; k <= nodeCount; k++) {
    // Check if the current node's degree is 6.
    if (adjacencyList[k].length === 6) {
      hasDegreeSix = true;
    }

    // Check if the current node's degree is 4.
    if (adjacencyList[k].length == 4) {
      degreeFourCount += 1;
    }

    // Check if the current node's degree is odd.
    if (adjacencyList[k].length % 2 !== 0) {
      allEvenDegrees = false; // If an odd degree is found, the flag is set to false.
    }
  }

  // Output "Yes" or "No" based on the final conditions.
  // The condition is: (at least one node has degree 6 OR at least two nodes have degree 4) AND all nodes have even degrees.
  console.log(((hasDegreeSix || degreeFourCount >= 2) && allEvenDegrees) ? "Yes" : "No");
}

// Read the input from standard input and pass it to the main problem solver.
solveProblem(require("fs").readFileSync("/dev/stdin", "utf8"));
