var INPUT_PARSER = (function() {
  // Factory function to create an InputReader instance
  function createParser(sourceString) {
    return new InputReader(sourceString);
  }

  // Constructor for the InputReader class
  function InputReader(sourceString) {
    // Store the input string as an array of trimmed lines
    this._sourceLines = sourceString.trim().split("\n");
    // Initialize the current line index
    this._currentLineIndex = 0;
  }

  // Reads the next value from the current line, treating it as space-separated.
  // If the line becomes empty after popping, advances to the next line.
  // 'asString' parameter determines if the value should be returned as a string or number.
  InputReader.prototype.readNextValue = function(asString) {
    var lines = this._sourceLines;
    var lineIdx = this._currentLineIndex;
    var resultValue;

    // If the current line hasn't been split into tokens yet, do so and reverse for easy popping.
    if (typeof lines[lineIdx] === "string") {
      lines[lineIdx] = lines[lineIdx].split(" ").reverse();
    }

    // Pop the last element (which was the first in the original order)
    resultValue = lines[lineIdx].pop();

    // If the current line is now empty, advance to the next line
    if (!lines[lineIdx].length) {
      this._currentLineIndex++;
    }

    // Return as string or convert to number
    return asString ? resultValue : +resultValue;
  };

  // Reads an entire line and splits it into space-separated values.
  // Advances the line index.
  // 'asString' parameter determines if values should be returned as strings or numbers.
  InputReader.prototype.readLineValues = function(asString) {
    var lineTokens = this._sourceLines[this._currentLineIndex++].split(" ");
    return asString ? lineTokens : lineTokens.map(val => +val);
  };

  // Reads 'numLines' lines, splitting each into space-separated values, forming a matrix.
  // Advances the line index by 'numLines'.
  // 'asString' parameter determines if values should be returned as strings or numbers.
  InputReader.prototype.readMatrix = function(numLines, asString) {
    var matrixRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines)
      .map(line => line.split(" "));
    return asString ? matrixRows : matrixRows.map(row => row.map(val => +val));
  };

  // Reads 'numLines' lines as individual values (not split by spaces).
  // Advances the line index by 'numLines'.
  // 'asString' parameter determines if values should be returned as strings or numbers.
  InputReader.prototype.readRows = function(numLines, asString) {
    var rawRows = this._sourceLines.slice(this._currentLineIndex, this._currentLineIndex += numLines);
    return asString ? rawRows : rawRows.map(val => +val);
  };

  return createParser;
})();

// Initialize the input data parser by reading from standard input.
var inputData = INPUT_PARSER(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a given value or expression.
 * @param {string} initialValue - The initial value or expression for the innermost elements.
 * @param {...number} dimensions - The dimensions of the array (e.g., createMultiDimArray("0", 3, 4) for a 3x4 array of zeros).
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var dimensions = arguments;
  var dimCount = dimensions.length;
  var arrayCreationString = "Array(dimensions[" + --dimCount + "]).fill(0).map(x=>{return " + initialValue + ";})";

  // Build the nested array creation string by iterating backwards through dimensions
  while (--dimCount) {
    arrayCreationString = "Array(dimensions[" + dimCount + "]).fill(0).map(x=>" + arrayCreationString + ")";
  }

  // Use eval to create the array dynamically based on the constructed string
  return eval(arrayCreationString);
}

var BellmanFordAlgorithm = (function() {
  // A large number representing infinity for distance calculations.
  var INFINITY_VAL = 1e9;

  // Factory function to create a BellmanFordSolver instance.
  function initBellmanFord(edgeGraph, startIndex) {
    return new BellmanFordSolver(edgeGraph, startIndex);
  }

  // Constructor for the BellmanFordSolver class.
  function BellmanFordSolver(edgeGraph, startIndex) {
    var nodeCount = edgeGraph.length;
    // The maximum number of iterations for Bellman-Ford.
    // N-1 iterations for shortest paths, plus N more to detect negative cycles.
    var doubleNodeCount = nodeCount * 2;

    // Initialize all distances to infinity, except for the start node.
    var distanceArray = this.distances = Array(nodeCount).fill(INFINITY_VAL);
    distanceArray[startIndex] = 0;

    // Iterate up to 2*N times.
    // The first N-1 iterations find shortest paths.
    // Subsequent iterations detect negative cycles.
    for (var iterationIndex = 0; iterationIndex < doubleNodeCount; iterationIndex++) {
      // Iterate through all nodes in the graph
      for (var currentNode = 0; currentNode < nodeCount; currentNode++) {
        // If the current node is unreachable, skip it as it cannot relax any outgoing edges.
        if (distanceArray[currentNode] === INFINITY_VAL) continue;

        // Iterate through all edges originating from the current node
        for (var edgeIndex = 0; edgeIndex < edgeGraph[currentNode].length; edgeIndex++) {
          var currentEdge = edgeGraph[currentNode][edgeIndex];

          // Relax the edge: if a shorter path to the targetNode is found
          if (distanceArray[currentEdge.targetNode] > distanceArray[currentNode] + currentEdge.edgeWeight) {
            // If we are in the N-th iteration or later, it means a negative cycle is reachable
            // from the start node to this targetNode. Set distance to negative infinity.
            if (iterationIndex >= nodeCount - 1) {
              distanceArray[currentEdge.targetNode] = -INFINITY_VAL;
            } else {
              // Otherwise, update the distance with the shorter path.
              distanceArray[currentEdge.targetNode] = distanceArray[currentNode] + currentEdge.edgeWeight;
            }
          }
        }
      }
    }
  }

  // Prototype method to get the shortest distance to a specific node.
  BellmanFordSolver.prototype.getDistance = function(nodeIdentifier) {
    return this.distances[nodeIdentifier];
  };

  return initBellmanFord;
})();

// Execute the main problem-solving logic and print the result to console.
console.log(solveProblem());

/**
 * Main function to solve the problem using Bellman-Ford algorithm.
 * Reads input, constructs the graph, runs Bellman-Ford, and returns the result.
 */
function solveProblem() {
  // Read problem parameters: number of nodes, number of edges, and a penalty value.
  var numNodes = inputData.readNextValue();
  var numEdges = inputData.readNextValue();
  var penaltyValue = inputData.readNextValue();

  // Initialize an adjacency list for the graph.
  // Each element is an array to store outgoing edges.
  var problemGraph = createMultiDimArray("[]", numNodes);

  // Read edge information for each edge and populate the graph.
  // Edges are stored as objects with 'targetNode' and 'edgeWeight'.
  // The edgeWeight is calculated as penaltyValue - originalCost,
  // transforming a maximization problem into a minimization problem.
  for (var edgeLoopIndex = 0; edgeLoopIndex < numEdges; edgeLoopIndex++) {
    var edgeInput = inputData.readLineValues();
    var sourceNode = edgeInput[0] - 1; // Adjust to 0-indexed
    var destNode = edgeInput[1] - 1; // Adjust to 0-indexed
    var originalCost = edgeInput[2];

    problemGraph[sourceNode].push({
      targetNode: destNode,
      edgeWeight: penaltyValue - originalCost
    });
  }

  // Run the Bellman-Ford algorithm starting from node 0.
  var bellmanFordResult = BellmanFordAlgorithm(problemGraph, 0);

  // Check the distance to the last node (numNodes - 1).
  // If it's -1e9 (negative infinity), it means a negative cycle is reachable from start to end,
  // implying an arbitrarily large score can be achieved.
  if (bellmanFordResult.getDistance(numNodes - 1) === -1e9) {
    return -1; // Indicate that an arbitrarily large score is possible.
  }

  // If the distance to the last node is non-negative, it means no score can be gained (or it's 0).
  // Since we transformed the problem to minimize (penalty - cost), a non-negative result means
  // the total (penalty - cost) is >= 0, so total cost is <= total penalty.
  if (bellmanFordResult.getDistance(numNodes - 1) >= 0) {
    return 0; // Return 0 as the maximum score.
  }

  // Otherwise, the distance is negative. This negative distance represents the minimum
  // (penalty - cost) sum. To get the maximum score (which is total cost - total penalty),
  // we return the negative of this distance.
  return -bellmanFordResult.getDistance(numNodes - 1);
}
