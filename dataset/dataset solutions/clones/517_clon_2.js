var fs = require('fs');
var fileSize = fs.fstatSync(process.stdin.fd).size;
var dataBuffer = new Buffer(fileSize);
var readBytesCount = fs.readSync(process.stdin.fd, dataBuffer, 0, fileSize, 0);
var inputLines = dataBuffer.toString('utf8', 0, readBytesCount).split('\n');

var maximumValue, nodeCount;
var loopIndex;

/**
 * Initializes an adjacency matrix for a graph with a given number of vertices.
 * All self-loops are 0, and all other paths are set to Infinity.
 * @param {number} vertexCount - The number of vertices in the graph.
 * @returns {Array<Array<number>>} An initialized adjacency matrix.
 */
function createAdjacencyMatrix(vertexCount) {
  var rowIdx, colIdx, adjMatrix;
  adjMatrix = [];
  for (rowIdx = 0; rowIdx < vertexCount; rowIdx++) {
    adjMatrix[rowIdx] = [];
    for (colIdx = 0; colIdx < vertexCount; colIdx++) {
      adjMatrix[rowIdx][colIdx] = rowIdx === colIdx ? 0 : Infinity;
    }
  }
  return adjMatrix;
}

/**
 * Computes all-pairs shortest paths using the Warshall-Floyd algorithm.
 * Modifies the input distance matrix in place.
 * @param {Array<Array<number>>} distanceMatrix - The initial distance matrix.
 * @returns {Array<Array<number>>} The distance matrix with all-pairs shortest paths.
 */
function computeAllPairsShortestPaths(distanceMatrix) {
  var sourceNode, destNode, intermediateNode, matrixSize = distanceMatrix.length;
  for (intermediateNode = 0; intermediateNode < matrixSize; intermediateNode++) {
    for (sourceNode = 0; sourceNode < matrixSize; sourceNode++) {
      for (destNode = 0; destNode < matrixSize; destNode++) {
        // Check if going through intermediateNode provides a shorter path
        if (distanceMatrix[sourceNode][destNode] > distanceMatrix[sourceNode][intermediateNode] + distanceMatrix[intermediateNode][destNode]) {
          distanceMatrix[sourceNode][destNode] = distanceMatrix[sourceNode][intermediateNode] + distanceMatrix[intermediateNode][destNode];
        }
      }
    }
  }
  return distanceMatrix;
}

/**
 * Evaluates if a path exists from the start node (0) to the end node (numNodes + 1)
 * such that all intermediate nodes are reachable from the start, and the end node
 * is reachable from all intermediate nodes.
 * @param {number} maxJump - The maximum jump distance.
 * @param {number} numNodes - The number of intermediate nodes.
 * @param {Array<number>} nodeWeights - An array of weights for each node.
 * @returns {boolean} True if all paths are valid, false otherwise.
 */
function evaluatePathReachability(maxJump, numNodes, nodeWeights) {
    // Create a graph with numNodes + 2 vertices (0 for start, numNodes+1 for end)
    var graphRepresentation = createAdjacencyMatrix(numNodes + 2);
    var currNode, jumpOffset;
    var targetPosition;

    // Populate the graph based on jump rules
    for (currNode = 0; currNode <= numNodes; currNode++) {
        for (jumpOffset = maxJump; jumpOffset--; ) {
            // Calculate the potential target position
            targetPosition = currNode + jumpOffset + (currNode + jumpOffset < numNodes + 1 ? nodeWeights[currNode + jumpOffset] : 0);
            // Clamp the target position within valid bounds
            targetPosition = Math.min(Math.max(targetPosition, 0), numNodes + 1);
            // If the target position is different from the current node, add an edge
            if (targetPosition !== currNode) {
                graphRepresentation[currNode][targetPosition] = 1;
            }
        }
    }

    // Compute all-pairs shortest paths on the constructed graph
    computeAllPairsShortestPaths(graphRepresentation);

    // Check reachability conditions
    for (currNode = 0; currNode <= numNodes; currNode++) {
      // If a node is reachable from the start (0) but the end node (numNodes+1)
      // is not reachable from this node, then the condition is not met.
      if (graphRepresentation[0][currNode] < Infinity && graphRepresentation[currNode][numNodes + 1] === Infinity) {
        return false;
      }
    }
    return true;
}

// Main processing loop
while ((maximumValue = inputLines.shift() - 0) !== 0) {
    var weightsArray = [];
    nodeCount = inputLines.shift() - 0;
    weightsArray[0] = 0; // Start node weight
    weightsArray[nodeCount + 1] = 0; // End node weight

    // Read weights for intermediate nodes
    for (loopIndex = 1; loopIndex <= nodeCount; loopIndex++) {
        weightsArray[loopIndex] = inputLines.shift() - 0;
    }

    // Output result based on path reachability evaluation
    console.log(evaluatePathReachability(maximumValue, nodeCount, weightsArray) ? 'OK' : 'NG');
}
