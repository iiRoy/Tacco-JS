var fileSystemModule = require('fs'); // Import the Node.js file system module
var fileSizeInBytes = fileSystemModule.fstatSync(process.stdin.fd).size; // Get the size of the standard input stream
var inputBuffer = new Buffer(fileSizeInBytes); // Create a buffer to hold the input data
var actualBytesRead = fileSystemModule.readSync(process.stdin.fd, inputBuffer, 0, fileSizeInBytes, 0); // Read data from stdin into the buffer
var inputLinesArray = inputBuffer.toString('utf8', 0, actualBytesRead).split('\n'); // Convert buffer to string, then split into an array of lines

var maxStepSize, numLocations; // Declare variables for maximum step size and number of locations
var loopIndexA; // General purpose loop index

/**
 * Creates and initializes a 2D array (matrix).
 * @param {number} rows - The number of rows.
 * @param {number} cols - The number of columns.
 * @param {*} initialValue - The value to initialize each element with.
 * @returns {Array<Array<*>>} A new 2D array.
 */
function initialize2DArray(rows, cols, initialValue) {
  var twoDArray = []; // Array to store rows
  var loopIndexA, loopIndexB; // Local loop indices

  // Iterate through rows
  for (loopIndexA = 0; loopIndexA < rows; loopIndexA++) {
    twoDArray[loopIndexA] = []; // Initialize current row as an empty array
    // Iterate through columns for the current row
    for (loopIndexB = 0; loopIndexB < cols; loopIndexB++) {
      twoDArray[loopIndexA][loopIndexB] = initialValue; // Set initial value for each cell
    }
  }
  return twoDArray; // Return the created 2D array
}

/**
 * Implements Dijkstra's algorithm to find shortest paths from a source node.
 * @param {Array<Array<number>>} adjacencyMatrix - The graph represented as an adjacency matrix.
 * @param {number} sourceNode - The starting node for path calculation.
 * @returns {Array<number>} An array of shortest distances from the source node to all other nodes.
 */
function calculateShortestPaths(adjacencyMatrix, sourceNode) {
  var distanceArray = []; // Stores shortest distances from source
  var visitedFlags = []; // Tracks visited nodes
  var loopIndexA, // General loop index
      graphSize = adjacencyMatrix.length, // Number of nodes in the graph
      currentVertex, neighborVertex; // Variables for current and neighbor nodes

  // Initialize distances and visited flags for all nodes
  for (neighborVertex = 0; neighborVertex < graphSize; neighborVertex++) {
    distanceArray[neighborVertex] = Infinity; // Set initial distance to infinity
    visitedFlags[neighborVertex] = false; // Mark all nodes as unvisited
  }

  distanceArray[sourceNode] = 0; // Distance from source to itself is zero

  // Main loop for Dijkstra's algorithm
  while (true) {
    currentVertex = -1; // Initialize current vertex to an invalid value

    // Find the unvisited node with the smallest distance
    for (neighborVertex = 0; neighborVertex < graphSize; neighborVertex++) {
      if (!visitedFlags[neighborVertex] && (currentVertex === -1 || distanceArray[currentVertex] > distanceArray[neighborVertex])) {
        currentVertex = neighborVertex; // Update current vertex if a smaller distance is found
      }
    }

    // If no unvisited node is found, break the loop
    if (currentVertex === -1) {
      break;
    }

    visitedFlags[currentVertex] = true; // Mark the current vertex as visited

    // Update distances to neighbors of the current vertex
    for (neighborVertex = 0; neighborVertex < graphSize; neighborVertex++) {
      // Relax the edge: if a shorter path to neighborVertex is found through currentVertex
      distanceArray[neighborVertex] = Math.min(distanceArray[neighborVertex], distanceArray[currentVertex] + adjacencyMatrix[currentVertex][neighborVertex]);
    }
  }
  return distanceArray; // Return the array of shortest distances
}

/**
 * Determines if a path exists under given constraints and if all intermediate points are reachable.
 * @param {number} maxStepSize - The maximum step size allowed.
 * @param {number} numLocations - The total number of locations.
 * @param {Array<number>} displacementValues - Array of displacement values for each location.
 * @returns {boolean} True if the path is feasible, false otherwise.
 */
function determineFeasibility(maxStepSize, numLocations, displacementValues) {
    // Create an adjacency matrix for the graph, including start (0) and end (n+1) nodes
    var adjacencyMatrix = initialize2DArray(numLocations + 2, numLocations + 2, Infinity);
    var loopIndexA, loopIndexB; // Loop indices
    var calculatedPosition; // Variable to store the calculated target position

    // Populate the adjacency matrix based on step sizes and displacement values
    for (loopIndexA = 0; loopIndexA <= numLocations; loopIndexA++) {
        // Iterate backwards from maxStepSize to 1
        for (loopIndexB = maxStepSize; loopIndexB--; ) {
            // Calculate the potential target position
            calculatedPosition = loopIndexA + loopIndexB + (loopIndexA + loopIndexB < numLocations + 1 ? displacementValues[loopIndexA + loopIndexB] : 0);
            // Ensure the position stays within valid bounds [0, numLocations + 1]
            calculatedPosition = Math.min(Math.max(calculatedPosition, 0), numLocations + 1);
            
            // If the calculated position is different from the current position, add an edge
            if(calculatedPosition !== loopIndexA) {
                adjacencyMatrix[loopIndexA][calculatedPosition] = 1; // Edge weight is 1
            }
        }       
    }

    // Calculate shortest paths from the starting node (0) to all other nodes
    var initialReachability = calculateShortestPaths(adjacencyMatrix, 0);
    
    // If the end node (n+1) is not reachable from the start node, the path is not feasible
    if (initialReachability[numLocations + 1] === Infinity) {
        return false;
    }

    var pathDistancesFromNode; // Variable to store distances from an intermediate node

    // Check reachability from each intermediate node (1 to n) to the end node
    for (loopIndexA = 1; loopIndexA <= numLocations; loopIndexA++) {
        // Only proceed if the current intermediate node is reachable from the start
        if(initialReachability[loopIndexA] < Infinity) {
            pathDistancesFromNode = calculateShortestPaths(adjacencyMatrix, loopIndexA); // Calculate paths from this node
            // If the end node is not reachable from this intermediate node, the path is not feasible
            if(pathDistancesFromNode[numLocations + 1] === Infinity) {
                return false;
            }
        }
    }
    return true; // If all checks pass, the path is feasible
}

// Main loop to process input lines
while ((maxStepSize = inputLinesArray.shift() - 0) !== 0) { // Read maxStepSize, convert to number; loop until maxStepSize is 0
    var displacementValues = []; // Array to store displacement values for the current test case
    numLocations = inputLinesArray.shift() - 0; // Read numLocations, convert to number
    
    displacementValues[0] = 0; // Displacement at start node is 0
    displacementValues[numLocations + 1] = 0; // Displacement at end node is 0

    // Read displacement values for intermediate locations (1 to n)
    for (loopIndexA = 1; loopIndexA <= numLocations; loopIndexA++) {
        displacementValues[loopIndexA] = inputLinesArray.shift() - 0; // Convert to number
    }
    
    // Call the solve function and print 'OK' or 'NG' based on the result
    console.log(determineFeasibility(maxStepSize, numLocations, displacementValues) ? 'OK' : 'NG');
}
