"use strict";

// This Immediately Invoked Function Expression (IIFE) serves as a factory
// for creating an input data parsing utility.
var INPUT_READER_FACTORY = (function () {
  /**
   * Factory function to create a new input data handler.
   * @param {string} rawInputContent - The entire input content as a single string.
   * @returns {InputDataHandler} An instance capable of reading data.
   */
  function createReaderInstance(rawInputContent) {
    return new InputDataHandler(rawInputContent);
  }

  /**
   * Constructor for the InputDataHandler.
   * Manages the state of input reading, line by line.
   * @param {string} contentString - The raw string content to be parsed.
   * @class
   */
  function InputDataHandler(contentString) {
    // Internal storage for all input lines, trimmed and split by newline.
    this._inputLines = contentString.trim().split("\n");
    // Pointer to the current line being processed.
    this._currentLinePointer = 0;
  }

  /**
   * Reads and returns a single item from the current line.
   * Items are processed from right-to-left after splitting the line.
   * Advances the line pointer if the current line becomes empty.
   * @param {boolean} [returnAsText=false] - If true, returns the item as a string; otherwise, as a number.
   * @returns {string|number} The parsed item.
   */
  InputDataHandler.prototype.readNextItem = function (returnAsText) {
    var allInputLines = this._inputLines;
    var currentLineIndex = this._currentLinePointer;
    var extractedItem;

    // If the current line is still a single string, split it into items and reverse for easy popping.
    if (typeof allInputLines[currentLineIndex] === "string") {
      allInputLines[currentLineIndex] = allInputLines[currentLineIndex].split(" ").reverse();
    }

    // Extract the last item (which was the first before reversing).
    extractedItem = allInputLines[currentLineIndex].pop();

    // If the current line is now empty, move to the next line.
    if (!allInputLines[currentLineIndex].length) {
      this._currentLinePointer++;
    }

    // Return the item, optionally converted to a number.
    return returnAsText ? extractedItem : +extractedItem;
  };

  /**
   * Reads an entire line, splits it by space, and returns the items.
   * Advances the line pointer.
   * @param {boolean} [returnAsText=false] - If true, returns items as strings; otherwise, as numbers.
   * @returns {Array<string|number>} An array of items from the line.
   */
  InputDataHandler.prototype.getLineAsItems = function (returnAsText) {
    var lineItems = this._inputLines[this._currentLinePointer++].split(" ");
    return returnAsText ? lineItems : lineItems.map(val => +val);
  };

  /**
   * Reads a specified number of lines and parses them into a 2D array (matrix).
   * Advances the line pointer by `numRowsToRead`.
   * @param {number} numRowsToRead - The count of lines to read for the matrix.
   * @param {boolean} [returnAsText=false] - If true, returns matrix elements as strings; otherwise, as numbers.
   * @returns {Array<Array<string|number>>} A matrix of parsed values.
   */
  InputDataHandler.prototype.getMatrixFromLines = function (numRowsToRead, returnAsText) {
    var matrixData = this._inputLines.slice(this._currentLinePointer, this._currentLinePointer += numRowsToRead)
      .map(line => line.split(" "));
    return returnAsText ? matrixData : matrixData.map(row => row.map(item => +item));
  };

  /**
   * Reads a specified number of lines and returns them as a flat array of values.
   * Advances the line pointer by `numRowsToRead`.
   * @param {number} numRowsToRead - The count of lines to read.
   * @param {boolean} [returnAsText=false] - If true, returns values as strings; otherwise, as numbers.
   * @returns {Array<string|number>} A flat array of parsed values.
   */
  InputDataHandler.prototype.getRowsAsValues = function (numRowsToRead, returnAsText) {
    var rowValues = this._inputLines.slice(this._currentLinePointer, this._currentLinePointer += numRowsToRead);
    return returnAsText ? rowValues : rowValues.map(item => +item);
  };

  return createReaderInstance;
})();

// Initialize the data processor by reading the entire content from standard input.
var dataProcessor = INPUT_READER_FACTORY(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Dynamically creates a multi-dimensional array initialized with a specific value.
 * The dimensions are passed as subsequent arguments.
 * @param {*} initialFillValue - The value to initialize all array elements with.
 * @param {...number} arrayDimensions - The sizes of each dimension (e.g., dim1, dim2, dim3).
 * @returns {Array} The newly created multi-dimensional array.
 */
function createNestedArray(initialFillValue) {
  var allArguments = arguments;
  var dimensionCount = allArguments.length;
  // Start building the string for the innermost array.
  var arrayCreationExpression = "Array(allArguments[" + --dimensionCount + "]).fill(0).map(element=>{return " + initialFillValue + ";})";

  // Wrap the expression for each preceding dimension.
  while (--dimensionCount) {
    arrayCreationExpression = "Array(allArguments[" + dimensionCount + "]).fill(0).map(element=>" + arrayCreationExpression + ")";
  }
  // Evaluate the constructed string to create the array.
  return eval(arrayCreationExpression);
}

// A large numerical constant representing infinity for distance calculations.
var MAX_DISTANCE = 1e15;

// Execute the main logic and print its return value to the console.
console.log(executeMainAlgorithm());

/**
 * The primary function containing the problem's solution logic.
 * It reads graph data, applies a modified Floyd-Warshall algorithm twice,
 * and then processes a series of queries.
 * @returns {string} A newline-separated string of results for each query.
 */
function executeMainAlgorithm() {
  // Read graph parameters: number of nodes, number of edges, and maximum allowed path length.
  var numberOfNodes = dataProcessor.readNextItem(); // N
  var numberOfEdges = dataProcessor.readNextItem(); // M
  var pathLengthLimit = dataProcessor.readNextItem(); // L

  // Read the list of edges, each with start node, end node, and weight.
  var edgeConnections = dataProcessor.getMatrixFromLines(numberOfEdges);

  // Read the number of queries.
  var numberOfQueries = dataProcessor.readNextItem(); // Q

  // Read the start and end nodes for each query.
  var queryNodePairs = dataProcessor.getMatrixFromLines(numberOfQueries);

  // Initialize a 2D array (distance matrix) for all-pairs shortest paths.
  // All distances are initially MAX_DISTANCE, representing unreachable paths.
  var shortestPathMatrix = createNestedArray(MAX_DISTANCE, numberOfNodes, numberOfNodes);

  // Set the distance from a node to itself to 0.
  for (var nodeIndex = 0; nodeIndex < numberOfNodes; nodeIndex++) {
    shortestPathMatrix[nodeIndex][nodeIndex] = 0;
  }

  // Populate the initial distances based on the given edges.
  // Node indices are 1-based in input, convert to 0-based.
  for (var currentEdgeIdx = 0; currentEdgeIdx < numberOfEdges; currentEdgeIdx++) {
    var sourceNode = edgeConnections[currentEdgeIdx][0] - 1;
    var destinationNode = edgeConnections[currentEdgeIdx][1] - 1;
    var edgeWeight = edgeConnections[currentEdgeIdx][2];
    shortestPathMatrix[sourceNode][destinationNode] = edgeWeight;
    shortestPathMatrix[destinationNode][sourceNode] = edgeWeight; // Assuming an undirected graph
  }

  // First application of the Floyd-Warshall algorithm.
  // Computes the shortest path between all pairs of nodes using original edge weights.
  for (var intermediateNode = 0; intermediateNode < numberOfNodes; intermediateNode++) {
    for (var startNode = 0; startNode < numberOfNodes; startNode++) {
      for (var endNode = 0; endNode < numberOfNodes; endNode++) {
        // If a path through 'intermediateNode' is shorter than the current direct path, update it.
        if (shortestPathMatrix[startNode][intermediateNode] + shortestPathMatrix[intermediateNode][endNode] < shortestPathMatrix[startNode][endNode]) {
          shortestPathMatrix[startNode][endNode] = shortestPathMatrix[startNode][intermediateNode] + shortestPathMatrix[intermediateNode][endNode];
        }
      }
    }
  }

  // Transform the shortestPathMatrix based on the 'pathLengthLimit'.
  // If a path exists and its length is within the limit, its cost becomes 1.
  // Otherwise, it becomes MAX_DISTANCE (effectively unreachable for the next phase).
  for (var rowIdx = 0; rowIdx < numberOfNodes; rowIdx++) {
    for (var colIdx = 0; colIdx < numberOfNodes; colIdx++) {
      // Only consider paths that are reachable (not MAX_DISTANCE) and not self-loops (not 0).
      if (shortestPathMatrix[rowIdx][colIdx] !== MAX_DISTANCE && shortestPathMatrix[rowIdx][colIdx] !== 0) {
        if (pathLengthLimit < shortestPathMatrix[rowIdx][colIdx]) {
          shortestPathMatrix[rowIdx][colIdx] = MAX_DISTANCE; // Path is too long
        } else {
          shortestPathMatrix[rowIdx][colIdx] = 1; // Valid path, cost 1 "hop"
        }
      }
      // Self-loops (0) and truly unreachable paths (MAX_DISTANCE) remain unchanged.
    }
  }

  // Second application of the Floyd-Warshall algorithm.
  // This time, it computes the minimum number of "hops" (valid connections)
  // between all pairs of nodes based on the transformed costs.
  for (var k_intermediate = 0; k_intermediate < numberOfNodes; k_intermediate++) {
    for (var i_source = 0; i_source < numberOfNodes; i_source++) {
      for (var j_destination = 0; j_destination < numberOfNodes; j_destination++) {
        if (shortestPathMatrix[i_source][k_intermediate] + shortestPathMatrix[k_intermediate][j_destination] < shortestPathMatrix[i_source][j_destination]) {
          shortestPathMatrix[i_source][j_destination] = shortestPathMatrix[i_source][k_intermediate] + shortestPathMatrix[k_intermediate][j_destination];
        }
      }
    }
  }

  // Process each query and store the results.
  var finalOutputResults = [];
  for (var queryCounter = 0; queryCounter < numberOfQueries; queryCounter++) {
    var queryStartNode = queryNodePairs[queryCounter][0] - 1;
    var queryEndNode = queryNodePairs[queryCounter][1] - 1;
    var computedDistance = shortestPathMatrix[queryStartNode][queryEndNode];

    // If the computed distance is still MAX_DISTANCE, it means no valid path exists.
    // The problem expects 0 in this case before subtracting 1.
    if (computedDistance >= MAX_DISTANCE) {
      computedDistance = 0; // Treat as 0 hops for the next step (0-1 = -1)
    }
    finalOutputResults.push(computedDistance - 1);
  }

  // Join all individual results with newline characters for the final output.
  return finalOutputResults.join("\n");
}
