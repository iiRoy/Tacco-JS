var rawData = '';
process.stdin.resume(); // Keep the process alive for input
process.stdin.setEncoding('utf8'); // Set encoding for incoming data
process.stdin.on('data', function(chunkOfData) {
  // Append each received chunk to the rawData string
  rawData += chunkOfData;
});
process.stdin.on('end', function() {
  // When all input is received, split it by newlines and pass to the main processing function
  processInputData(rawData.split('\n'));
});

// Main function to handle the parsed input lines
function processInputData (inputLines) {
  // Declare variables for maximum jump, number of points, and loop index
  let maximumJump, numPoints;
  let loopIndexA;

  // Loop until the maximum jump value read from input is zero
  while ((maximumJump = inputLines.shift() - 0) !== 0x0) {
    // Initialize an array to store point values
    let pointValues = [];
    // Read the number of points for the current test case
    numPoints = inputLines.shift() - 0;

    // Set boundary values for the pointValues array
    pointValues[0] = 0;
    pointValues[numPoints + 1] = 0;

    // Populate the pointValues array from input, starting from index 1
    for (loopIndexA = 1; loopIndexA <= numPoints; loopIndexA++) {
        pointValues[loopIndexA] = inputLines.shift() - 0;
    }
    // Call the solver function and print 'OK' or 'NG' based on its boolean result
    console.log(determineReachability(maximumJump, numPoints, pointValues) ? 'OK' : 'NG');
  }
}

// Function to create an adjacency matrix for a graph of a given size
function createAdjacencyMatrix(matrixSize){
  let loopIndexA, loopIndexB, adjMatrix;
  adjMatrix = []; // Initialize the 2D array

  // Iterate through rows
  for (loopIndexA = 0; loopIndexA < matrixSize; loopIndexA++) {
    adjMatrix[loopIndexA] = []; // Initialize current row
    // Iterate through columns
    for (loopIndexB = 0; loopIndexB < matrixSize; loopIndexB++) {
      // Set diagonal elements to 0 (distance to self) and others to infinity
      adjMatrix[loopIndexA][loopIndexB] = loopIndexA === loopIndexB ? 0 : Number.POSITIVE_INFINITY;
    }
  }
  return adjMatrix; // Return the initialized adjacency matrix
}

// Function to compute all-pairs shortest paths using the Floyd-Warshall algorithm
function computeAllPairsShortestPaths(distanceMatrix) {
  let loopIndexA, loopIndexB, intermediateNode, matrixDimension = distanceMatrix.length;

  // Iterate through all possible intermediate nodes (k)
  for (intermediateNode = 0; intermediateNode < matrixDimension; intermediateNode++) {
    // Iterate through all possible source nodes (i)
    for (loopIndexA = 0; loopIndexA < matrixDimension; loopIndexA++) {
      // Iterate through all possible destination nodes (j)
      for (loopIndexB = 0; loopIndexB < matrixDimension; loopIndexB++) {
        // Update the shortest path if a shorter path is found via intermediateNode
        if (distanceMatrix[loopIndexA][loopIndexB] > distanceMatrix[loopIndexA][intermediateNode] + distanceMatrix[intermediateNode][loopIndexB]) {
          distanceMatrix[loopIndexA][loopIndexB] = distanceMatrix[loopIndexA][intermediateNode] + distanceMatrix[intermediateNode][loopIndexB];
        }
      }
    }
  }
  return distanceMatrix; // Return the matrix with all-pairs shortest paths
}


// Function to determine if all reachable nodes can eventually reach the end node
function determineReachability(maximumJump, numPoints, pointValues) {
    // Create an adjacency matrix for a graph with numPoints + 2 nodes (start, end, and intermediate points)
    let adjMatrix = createAdjacencyMatrix(numPoints + 2);
    let loopIndexA, loopIndexB;
    let nextPosition; // Variable to store the calculated next position

    // Build the graph based on possible jumps
    for (loopIndexA = 0; loopIndexA <= numPoints; loopIndexA++) {
        for (loopIndexB = 1; loopIndexB <= maximumJump; loopIndexB++) {
            // Calculate the potential next position based on current position, jump, and point value
            nextPosition = loopIndexA + loopIndexB + (loopIndexA + loopIndexB < numPoints + 1 ? pointValues[loopIndexA + loopIndexB] : 0);
            // Ensure nextPosition stays within valid bounds [0, numPoints + 1]
            nextPosition = Math.min(Math.max(nextPosition, 0), numPoints + 1);
            // If the calculated next position is different from the current position, add an edge
            if(nextPosition !== loopIndexA) {
                adjMatrix[loopIndexA][nextPosition] = 1.0; // Edge weight is 1
            }
        }       
    }

    // Compute all-pairs shortest paths on the constructed graph
    computeAllPairsShortestPaths(adjMatrix);

    // Check if any node reachable from the start (node 0) cannot reach the end (node numPoints + 1)
    for (loopIndexA = 0; loopIndexA <= numPoints; loopIndexA++) {
      // If node 'loopIndexA' is reachable from start (0) AND cannot reach the end (numPoints + 1)
      if(adjMatrix[0][loopIndexA] < Number.POSITIVE_INFINITY && adjMatrix[loopIndexA][numPoints + 1] === Number.POSITIVE_INFINITY) {
        return false; // Condition not met, return false
      }
    }
    return true; // All reachable nodes can reach the end
}
