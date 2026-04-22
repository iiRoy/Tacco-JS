// This module is responsible for processing textual input, transforming data,
// and analyzing graph structures to determine the number of connected components.

// --- Core Input Mechanism ---

// Utilize Node.js's file system module to read standard input.
// The input is read as a UTF-8 string, trimmed of leading/trailing whitespace,
// and then split into an array of individual lines based on newline characters.
const rawDataLines = require("node:fs").readFileSync("/dev/stdin", "utf8").trim().split("\n");

/**
 * Implements a basic iterator pattern to sequentially access lines from the input source.
 * It manages its internal state (current position) and provides methods to navigate.
 */
let lineIterator = {
  sourceLines: rawDataLines, // The collection of all input lines.
  currentPosition: 0,       // Zero-based index indicating the next line to be retrieved.
  totalLines: rawDataLines.length, // The total number of lines available in the input.

  /**
   * Advances the iterator and returns the next line of input.
   * It performs a check to ensure there are still lines to process.
   * @returns {string} The string content of the next line.
   * @throws {Error} If an attempt is made to retrieve a line when none are left.
   */
  retrieveNext: function() {
    if (!this.canAdvance()) {
      // Custom error message for clarity when input is exhausted.
      throw new Error("InputExhaustedError: Attempted to fetch a line beyond the available input.");
    }
    // Post-increment the currentPosition to point to the subsequent line for the next call.
    return this.sourceLines[this.currentPosition++];
  },

  /**
   * Determines if there are any more lines remaining in the input source that can be retrieved.
   * @returns {boolean} True if more lines are available, false otherwise.
   */
  canAdvance: function() {
    return this.currentPosition < this.totalLines;
  }
};

// --- Convenience Functions for Input Access ---

/**
 * Provides a global, simplified interface to fetch the next line from the input stream.
 * This function acts as a wrapper around the `lineIterator`'s `retrieveNext` method.
 * @returns {string} The next available input line.
 */
function fetchNextLine() {
  return lineIterator.retrieveNext();
}

/**
 * Offers a global, simplified interface to check for the availability of more input lines.
 * This function wraps the `lineIterator`'s `canAdvance` method.
 * @returns {boolean} True if additional input lines exist, false otherwise.
 */
function hasMoreLines() {
  return lineIterator.canAdvance();
}

// --- Output and Error Logging Functions ---

/**
 * Prints the given message to the standard output stream.
 * This function serves as a standardized way to display final results or informational messages.
 * @param {any} message - The data or message to be printed.
 */
function displayResult(message) {
  console.log(message);
}

/**
 * Logs an error message to the standard error stream, prefixed with a precise timestamp.
 * This helps in debugging and tracking issues by providing context about when an error occurred.
 * @param {any} errorMessage - The error details or message to log.
 */
function logError(errorMessage) {
  const currentTimestamp = new Date().toISOString(); // ISO 8601 format for consistency.
  console.error(`[${currentTimestamp}] APPLICATION ERROR: ${errorMessage}`);
}

// --- Versatile Data Transformation Utility ---

/**
 * Transforms an input segment (string or array) based on a specified numerical operation code.
 * This function centralizes various common parsing and formatting operations.
 *
 * @param {string|Array<string>} inputSegment - The data to be transformed.
 * @param {number} transformationCode - An integer specifying the desired transformation:
 *   1: Converts a string to a numeric type.
 *   2: Splits a string by single spaces into an array of strings.
 *   4: Splits a string by single spaces and then converts each part to a number.
 *   6: Breaks a string into an array of individual characters.
 *   7: Breaks a string into individual characters and converts each to a number.
 *   8: Joins an array of strings with a single space as a separator.
 *   9: Joins an array of strings with a newline character as a separator.
 *   0: Joins an array of strings without any separator.
 * @returns {any} The result of the transformation, which could be a number, string, or array.
 * @throws {Error} For unsupported transformation codes or invalid input types for certain operations.
 */
function dataTransformer(inputSegment, transformationCode) {
  try {
    switch (transformationCode) {
      case 1:
        return Number(inputSegment); // `Number()` is more flexible than `parseInt` for floats.
      case 2:
        return String(inputSegment).split(" ");
      case 4: {
        // Explicitly cast to string, split, then map to numbers.
        const stringParts = String(inputSegment).split(" ");
        return stringParts.map(value => Number(value));
      }
      case 6:
        return String(inputSegment).split("");
      case 7: {
        const charArray = String(inputSegment).split("");
        return charArray.map(value => Number(value));
      }
      case 8:
        // Validate input type for join operations.
        if (!Array.isArray(inputSegment)) {
          throw new TypeError("Input must be an array for joining with spaces.");
        }
        return inputSegment.join(" ");
      case 9:
        if (!Array.isArray(inputSegment)) {
          throw new TypeError("Input must be an array for joining with newlines.");
        }
        return inputSegment.join("\n");
      case 0:
        if (!Array.isArray(inputSegment)) {
          throw new TypeError("Input must be an array for joining without a separator.");
        }
        return inputSegment.join("");
      default:
        // If an unrecognized code is provided, throw an error.
        throw new Error(`Unknown or unsupported transformation code: ${transformationCode}.`);
    }
  } catch (operationError) {
    // Log the error with context and return the original segment as a safe fallback.
    logError(`Data transformation failed for segment '${inputSegment}' with code '${transformationCode}': ${operationError.message}`);
    return inputSegment;
  }
}

// --- Main Graph Component Analysis Logic ---

/**
 * This function serves as the primary entry point for the graph analysis application.
 * It reads graph parameters and edge definitions from standard input,
 * constructs an adjacency list representation of the graph,
 * and then identifies and counts the number of disconnected components using Depth First Search (DFS).
 */
function executeGraphAnalysis() {
  // Read the very first line of input, which is expected to contain two integers:
  // N (the number of nodes/vertices in the graph) and M (the number of edges).
  const graphParametersLine = dataTransformer(fetchNextLine(), 4);

  // Perform robust validation on the initial graph parameters.
  if (!Array.isArray(graphParametersLine) || graphParametersLine.length < 2) {
      logError("Critical: Initial graph parameters line is malformed. Expected at least two numbers (N, M).");
      return; // Terminate execution if essential parameters are missing.
  }

  const nodeCount = graphParametersLine[0]; // N: Number of vertices.
  const edgeCount = graphParametersLine[1]; // M: Number of edges.

  // Implement guard clauses for invalid or trivial graph sizes.
  if (nodeCount < 0 || edgeCount < 0) {
      logError(`Invalid graph dimensions: Negative nodeCount (${nodeCount}) or edgeCount (${edgeCount}) detected.`);
      displayResult(0); // A graph with negative dimensions has zero components.
      return;
  }
  if (nodeCount === 0) {
      displayResult(0); // An empty graph (no nodes) has zero connected components.
      return;
  }

  // Initialize the graph's adjacency list structure.
  // Each element in `adjacencyMap` represents a node and stores its neighbors and a visit status.
  const adjacencyMap = Array.from({ length: nodeCount }, () => ({
    neighbors: [],  // An array to store indices of directly connected nodes.
    isVisited: false // A boolean flag to track if the node has been visited during traversal.
  }));

  // Populate the graph with edges by reading subsequent lines of input.
  // Each of the 'M' lines defines an edge between two nodes.
  for (let currentEdgeIndex = 0; currentEdgeIndex < edgeCount; currentEdgeIndex++) {
    const edgeData = dataTransformer(fetchNextLine(), 4);

    // Validate the structure of each edge definition.
    if (!Array.isArray(edgeData) || edgeData.length < 2) {
        logError(`Malformed edge data encountered on line ${currentEdgeIndex + 2}. Skipping. Expected two node indices.`);
        continue; // Skip processing this malformed edge and proceed to the next.
    }

    const nodeU = edgeData[0]; // The first node in the edge pair (1-based index).
    const nodeV = edgeData[1]; // The second node in the edge pair (1-based index).

    // Convert 1-based node indices from input to 0-based for array access.
    const uAdjustedIndex = nodeU - 1;
    const vAdjustedIndex = nodeV - 1;

    // Validate if the adjusted node indices are within the valid range of the graph.
    if (uAdjustedIndex < 0 || uAdjustedIndex >= nodeCount ||
        vAdjustedIndex < 0 || vAdjustedIndex >= nodeCount) {
        logError(`Edge (${nodeU}, ${nodeV}) refers to nodes outside the graph's bounds [0, ${nodeCount - 1}]. Skipping.`);
        continue; // Skip edges with invalid node references.
    }

    // Add connections for an undirected graph: if U is connected to V, V is also connected to U.
    adjacencyMap[uAdjustedIndex].neighbors.push(vAdjustedIndex);
    adjacencyMap[vAdjustedIndex].neighbors.push(uAdjustedIndex);
  }

  let componentCounter = 0; // Initialize a counter for connected components.

  /**
   * Implements a Depth First Search (DFS) traversal starting from a specified vertex.
   * This recursive function explores all reachable nodes from `currentVertex` and marks them as visited.
   * It's defined as a nested function to conveniently access `adjacencyMap` and `nodeCount` from the outer scope.
   * @param {number} currentVertex - The 0-based index of the vertex from which to begin the traversal.
   */
  function depthFirstTraversal(currentVertex) {
    // Robust guard clause: if the vertex is out of bounds or already visited, terminate this path.
    if (currentVertex < 0 || currentVertex >= nodeCount || adjacencyMap[currentVertex].isVisited) {
        return;
    }

    // Mark the current vertex as visited to prevent infinite loops in cycles and redundant processing.
    adjacencyMap[currentVertex].isVisited = true;

    // Retrieve the list of all nodes directly connected to the current vertex.
    const adjacentVertices = adjacencyMap[currentVertex].neighbors;

    // Recursively call DFS for each unvisited neighbor.
    for (let neighborIndex = 0; neighborIndex < adjacentVertices.length; neighborIndex++) {
      depthFirstTraversal(adjacentVertices[neighborIndex]);
    }
  }

  // Iterate through every node in the graph to ensure all components are discovered.
  for (let nodeIterator = 0; nodeIterator < nodeCount; nodeIterator++) {
    // If a node has not yet been visited, it signifies the start of a new, undiscovered connected component.
    if (!adjacencyMap[nodeIterator].isVisited) {
      // Initiate a DFS from this unvisited node to explore and mark all nodes within its component.
      depthFirstTraversal(nodeIterator);
      componentCounter++; // Increment the count of distinct connected components found.
    }
  }

  // Finally, output the total number of connected components identified in the graph.
  displayResult(componentCounter);
}

// Initiate the graph analysis process by calling the main execution function.
executeGraphAnalysis();