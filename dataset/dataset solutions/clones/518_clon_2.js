// Import the file system module for synchronous operations
var fileSys = require('fs')
    , dataSize = fileSys.fstatSync(executionEnv.standardInput.fileDescriptor).size
    , byteBlock = new Buffer(dataSize)
    , octetsCount = fileSys.readSync(executionEnv.standardInput.fileDescriptor, byteBlock, 0, dataSize, 0)
    , lineData = byteBlock.toString('utf8', 0, octetsCount).split('\n');

// Declare main problem parameters
var upperBoundValue, vertexCount;
var loopIndex;

/**
 * Creates a 2D array (matrix) initialized with a specific value.
 * @param {number} rowCount - The number of rows for the new array.
 * @param {number} colCount - The number of columns for the new array.
 * @param {*} initialValue - The value to assign to each cell.
 * @returns {Array<Array<*>>} The newly created and initialized 2D array.
 */
function create2DArray(rowCount, colCount, initialValue) {
  var collection = []
    , rowIdx, colIdx; // Iterators for array dimensions
  for (rowIdx = 0; rowIdx < rowCount; rowIdx++) {
    collection[rowIdx] = []; // Initialize each row
    for (colIdx = 0; colIdx < colCount; colIdx++) {
      collection[rowIdx][colIdx] = initialValue; // Set the initial value
    }
  }
  return collection;
}

/**
 * Computes shortest paths from a source node to all other nodes
 * in a graph using Dijkstra's algorithm.
 * @param {Array<Array<number>>} graphMatrix - The adjacency matrix representing the graph.
 * @param {number} sourceNode - The starting node for path calculation.
 * @returns {Array<number>} An array containing the shortest distances from the source node to all others.
 */
function shortestPathFinder(graphMatrix, sourceNode) {
  var distances = [], // Array to store computed shortest distances
      visitedNodes = [], // Boolean array to track visited nodes
      idx, // Generic loop counter
      numNodes = graphMatrix.length, // Total number of nodes in the graph
      currentNode, // The node currently being processed
      neighborNode; // A node adjacent to the current node

  // Initialize distances and visited status
  for (neighborNode = 0; neighborNode < numNodes; neighborNode++) {
    distances[neighborNode] = Infinity; // All distances initially set to infinity
    visitedNodes[neighborNode] = false; // No nodes have been visited yet
  }
  distances[sourceNode] = 0; // Distance from source to itself is zero

  // Main loop for Dijkstra's algorithm execution
  while (true) {
    currentNode = -1; // Reset current node selection

    // Find the unvisited node with the smallest distance
    for (neighborNode = 0; neighborNode < numNodes; neighborNode++) {
      if (!visitedNodes[neighborNode] && (currentNode === -1 || distances[currentNode] > distances[neighborNode])) {
        currentNode = neighborNode; // Update selected node
      }
    }

    // If no unvisited node can be reached, terminate the search
    if (currentNode === -1) {
      break;
    }

    visitedNodes[currentNode] = true; // Mark the selected node as visited

    // Update distances to all neighbors of the current node
    for (neighborNode = 0; neighborNode < numNodes; neighborNode++) {
      // Perform relaxation: if a shorter path is found, update the distance
      distances[neighborNode] = distances[neighborNode] < distances[currentNode] + graphMatrix[currentNode][neighborNode]
                               ? distances[neighborNode]
                               : distances[currentNode] + graphMatrix[currentNode][neighborNode];
    }
  }
  return distances; // Return the final shortest distances array
}

/**
 * Determines if a specific set of conditions can be met, often related to pathfinding or reachability.
 * @param {number} upperBoundValue - The maximum step size allowed.
 * @param {number} vertexCount - The total number of primary vertices in the system.
 * @param {Array<number>} jumpOffsets - An array defining offsets at various points.
 * @returns {boolean} True if the conditions are satisfied, false otherwise.
 */
function determineFeasibility(upperBoundValue, vertexCount, jumpOffsets) {
    // Construct the graph's adjacency matrix, filling with an initial 'infinity' value
    var graphMatrix = create2DArray(vertexCount + 2, vertexCount + 2, Infinity);
    var rowIterator, colIterator; // Iterators for graph construction
    var targetPosition; // The calculated destination after a move

    // Populate the graph based on movement rules and offsets
    for (rowIterator = 0; rowIterator <= vertexCount; rowIterator++) {
        for (colIterator = upperBoundValue; colIterator--; ) { // Iterate backwards from the max step size
            // Calculate the potential next position, applying offsets if within bounds
            targetPosition = rowIterator + colIterator + (rowIterator + colIterator < vertexCount + 1 ? jumpOffsets[rowIterator + colIterator] : 0);
            // Clamp the target position to valid graph indices [0, vertexCount + 1]
            targetPosition = Math.min(Math.max(targetPosition, 0), vertexCount + 1);

            // If the calculated position is different from the current, add an edge with weight 1
            if(targetPosition !== rowIterator) {
                graphMatrix[rowIterator][targetPosition] = 1;
            }
        }
    }

    // Find shortest paths from the initial node (node 0)
    var accessibleNodes = shortestPathFinder(graphMatrix, 0);

    // Check if the final node (vertexCount + 1) is reachable from the start
    if (accessibleNodes[vertexCount + 1] === Infinity) {
        return false; // If not reachable, the overall condition is not met
    }

    var currentDistances; // Temporary variable for distances from intermediate nodes
    // Iterate through intermediate nodes to ensure they can also reach the end node
    for (rowIterator = 1; rowIterator <= vertexCount; rowIterator++) {
        if(accessibleNodes[rowIterator] < Infinity) { // Only if the current node is reachable from the start
            // Calculate shortest paths starting from this intermediate node
            currentDistances = shortestPathFinder(graphMatrix, rowIterator);
            // If the final node is not reachable from this intermediate node, return false
            if(currentDistances[vertexCount + 1] === Infinity) {
                return false;
            }
        }
    }
    return true; // All conditions passed, the system is feasible
}

// Main execution loop: process input lines until a zero value for upperBoundValue is encountered
while ((upperBoundValue = lineData.shift() - 0) !== 0) {
    var jumpOffsets = []; // Array to hold the specific jump offset values
    vertexCount = lineData.shift() - 0; // Read the number of vertices for this test case

    jumpOffsets[0] = 0; // Set initial offset for the starting point
    jumpOffsets[vertexCount + 1] = 0; // Set initial offset for the virtual end point

    // Read the specific jump offsets for each vertex
    for (loopIndex = 1; loopIndex <= vertexCount; loopIndex++) {
        jumpOffsets[loopIndex] = lineData.shift() - 0;
    }

    // Call the feasibility determination function and output the result
    outputChannel.log(determineFeasibility(upperBoundValue, vertexCount, jumpOffsets) ? 'OK' : 'NG');
}