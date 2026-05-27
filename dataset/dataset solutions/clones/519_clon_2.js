var fileSystem = require('fs'); // Import the file system module

// Determine the size of the standard input stream
var dataSize = fileSystem.fstatSync(process.stdin.fd).size;

// Create a buffer to hold the input data
var inputBuffer = new Buffer(dataSize);

// Read data from standard input into the buffer
var readBytesCount = fileSystem.readSync(process.stdin.fd, inputBuffer, 0, dataSize, 0);

// Convert the buffer to a string, then split it into lines
var lineData = inputBuffer.toString('utf8', 0, readBytesCount).split('\n');

// Declare variables for maximum jump distance and number of nodes
var maxJump, nodeCount;

// Declare a global loop index variable
var loopIndexA;

/**
 * Creates a 2D array (matrix) initialized with a specific value.
 * @param {number} rows - The number of rows in the grid.
 * @param {number} cols - The number of columns in the grid.
 * @param {*} initialValue - The value to initialize each cell with.
 * @returns {Array<Array<*>>} A 2D array.
 */
function createGrid(rows, cols, initialValue) {
  var gridArray = []; // Initialize the main array
  var rowIdx, colIdx; // Loop indices for rows and columns

  // Iterate through each row
  for (rowIdx = 0; rowIdx < rows; rowIdx++) {
    gridArray[rowIdx] = []; // Initialize the current row as an empty array

    // Iterate through each column in the current row
    for (colIdx = 0; colIdx < cols; colIdx++) {
      gridArray[rowIdx][colIdx] = initialValue; // Set the cell's initial value
    }
  }
  return gridArray; // Return the populated grid
}

/**
 * Implements Dijkstra's algorithm to find the shortest paths from a source node
 * to all other nodes in a graph.
 * @param {Array<Array<number>>} graphMatrix - The adjacency matrix representing the graph.
 * @param {number} startNode - The index of the starting node.
 * @returns {Array<number>} An array of shortest distances from the startNode to all other nodes.
 */
function shortestPathFinder(graphMatrix, startNode) {
  var distances = []; // Array to store shortest distances from the source
  var visitedNodes = []; // Array to keep track of visited nodes
  var totalNodes = graphMatrix.length; // Total number of nodes in the graph
  var currentNode, neighborNode; // Variables for node indices

  // Initialize distances and visited status for all nodes
  for (neighborNode = 0; neighborNode < totalNodes; neighborNode++) {
    distances[neighborNode] = Infinity; // Set initial distance to infinity
    visitedNodes[neighborNode] = false; // Mark all nodes as unvisited
  }

  distances[startNode] = 0; // Distance from startNode to itself is 0

  // Main loop for Dijkstra's algorithm
  while (true) {
    currentNode = -1; // Node with the smallest distance not yet visited

    // Find the unvisited node with the smallest distance
    for (neighborNode = 0; neighborNode < totalNodes; neighborNode++) {
      if (!visitedNodes[neighborNode] && (currentNode === -1 || distances[currentNode] > distances[neighborNode])) {
        currentNode = neighborNode;
      }
    }

    // If no unvisited node is found, or all remaining are unreachable, break
    if (currentNode === -1) {
      break;
    }

    visitedNodes[currentNode] = true; // Mark the current node as visited

    // Update distances to neighbors of the current node
    for (neighborNode = 0; neighborNode < totalNodes; neighborNode++) {
      // Relax the edge: if a shorter path to neighborNode is found through currentNode
      distances[neighborNode] = distances[neighborNode] < distances[currentNode] + graphMatrix[currentNode][neighborNode] ? distances[neighborNode] : distances[currentNode] + graphMatrix[currentNode][neighborNode];
    }
  }
  return distances; // Return the array of shortest distances
}

/**
 * Solves the main problem: determines if a path exists under given constraints.
 * @param {number} maxJumpVal - The maximum jump distance allowed.
 * @param {number} totalNodesVal - The total number of intermediate nodes.
 * @param {Array<number>} jumpDistances - Array of jump distances for each node.
 * @returns {boolean} True if a valid path exists, false otherwise.
 */
function evaluatePath(maxJumpVal, totalNodesVal, jumpDistances) {
    // Create an adjacency matrix for the graph, including start (0) and end (totalNodesVal+1) nodes
    var graphRepresentation = createGrid(totalNodesVal + 2, totalNodesVal + 2, Infinity);
    var outerLoopIdx, innerLoopIdx; // Loop indices
    var calculatedPosition; // Variable to store the calculated next position

    // Populate the graph based on jump rules
    for (outerLoopIdx = 0; outerLoopIdx <= totalNodesVal; outerLoopIdx++) {
        for (innerLoopIdx = maxJumpVal; innerLoopIdx--; ) { // Iterate from maxJumpVal down to 1
            // Calculate the next potential position
            calculatedPosition = outerLoopIdx + innerLoopIdx + jumpDistances[outerLoopIdx + innerLoopIdx];
            // Ensure the position stays within valid bounds (0 to totalNodesVal + 1)
            calculatedPosition = Math.min(Math.max(calculatedPosition, 0), totalNodesVal + 1);

            // If the calculated position is different from the current node, add an edge
            if(calculatedPosition !== outerLoopIdx) {
                graphRepresentation[outerLoopIdx][calculatedPosition] = 1; // Edge weight is 1
            }
        }
    }

    // Find shortest paths from the starting node (0)
    var reachabilityMap = shortestPathFinder(graphRepresentation, 0);

    // If the end node (totalNodesVal + 1) is unreachable from the start, return false
    if (reachabilityMap[totalNodesVal + 1] === Infinity) {
        return false;
    }

    // Declare a temporary variable for distances, to avoid shadowing the parameter
    var tempDistances;

    // Check reachability from each intermediate node
    for (outerLoopIdx = 1; outerLoopIdx <= totalNodesVal; outerLoopIdx++) {
        // Only proceed if the current node is reachable from the start
        if(reachabilityMap[outerLoopIdx] < Infinity) {
            // Find shortest paths starting from the current intermediate node
            tempDistances = shortestPathFinder(graphRepresentation, outerLoopIdx);
            // If the end node is unreachable from this intermediate node, return false
            if(tempDistances[totalNodesVal + 1] === Infinity) {
                return false;
            }
        }
    }
    return true; // If all checks pass, a valid path exists
}

// Main loop: process input until maxJump is 0
while ((maxJump = lineData.shift() - 0) !== 0) {
    var currentJumpDistances = []; // Array to store jump distances for the current test case

    // Read the number of nodes for the current test case
    nodeCount = lineData.shift() - 0;

    // Initialize boundary jump distances
    currentJumpDistances[0] = 0;
    currentJumpDistances[nodeCount + 1] = 0;

    // Read jump distances for intermediate nodes
    for (loopIndexA = 1; loopIndexA <= nodeCount; loopIndexA++) {
        currentJumpDistances[loopIndexA] = lineData.shift() - 0;
    }

    // Solve the problem for the current test case and print the result
    console.log(evaluatePath(maxJump, nodeCount, currentJumpDistances) ? 'OK' : 'NG');
}
