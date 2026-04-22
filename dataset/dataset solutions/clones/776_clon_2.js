/*
 * This module processes graph input from standard input
 * to determine a specific shortest path configuration.
 */

let receivedInputBuffer = ''; // Buffer to collect all incoming data.

// Configure the standard input stream.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Attach an event handler for 'data' events on the input stream.
process.stdin.on('data', function(incomingChunk) {
  receivedInputBuffer += incomingChunk;
});

// Attach an event handler for the 'end' event on the input stream.
process.stdin.on('end', function() {
  // Once all input has been received, parse it.
  let parsedInputLines = receivedInputBuffer.split('\n');

  // Extract the initial graph configuration parameters.
  const graphConfigurationLine = parsedInputLines.shift().split(' ');

  const numberOfVertices = Number(graphConfigurationLine[0]);
  const unusedParam = Number(graphConfigurationLine[1]); // This parameter is not utilized in the algorithm.
  const sourceVertexIdx = Number(graphConfigurationLine[2]) - 1; // Adjust to zero-based indexing.
  const firstGoalVertexIdx = Number(graphConfigurationLine[3]) - 1; // Adjust to zero-based indexing.
  const secondGoalVertexIdx = Number(graphConfigurationLine[4]) - 1; // Adjust to zero-based indexing.

  // Initialize the 2D array for storing shortest path distances.
  let distanceMatrix = [];
  let currentVertexX, currentVertexY, currentVertexZ; // Loop variables for graph traversal.
  let edgeDetails; // Temporary variable to hold parsed edge information.

  // Populate the distance matrix: diagonal elements are 0, others are positive infinity.
  for (currentVertexX = 0; currentVertexX < numberOfVertices; currentVertexX++) {
    distanceMatrix[currentVertexX] = [];
    for (currentVertexY = 0; currentVertexY < numberOfVertices; currentVertexY++) {
      distanceMatrix[currentVertexX][currentVertexY] = (currentVertexX === currentVertexY) ? 0 : Number.POSITIVE_INFINITY;
    }
  }

  // Read and apply edge weights from the input until a sentinel line is encountered.
  while (parsedInputLines[0] !== '0 0 0 0 0') {
    edgeDetails = parsedInputLines.shift().split(' ');
    // Set the weight for the directed edge between two vertices.
    distanceMatrix[Number(edgeDetails[0]) - 1][Number(edgeDetails[1]) - 1] = Number(edgeDetails[2]);
  }

  // Execute the Floyd-Warshall algorithm to compute all-pairs shortest paths.
  for (currentVertexZ = 0; currentVertexZ < numberOfVertices; currentVertexZ++) {
    for (currentVertexX = 0; currentVertexX < numberOfVertices; currentVertexX++) {
      for (currentVertexY = 0; currentVertexY < numberOfVertices; currentVertexY++) {
        distanceMatrix[currentVertexX][currentVertexY] = Math.min(
          distanceMatrix[currentVertexX][currentVertexY],
          distanceMatrix[currentVertexX][currentVertexZ] + distanceMatrix[currentVertexZ][currentVertexY]
        );
      }
    }
  }

  // Determine the minimum total path length from the source to two target nodes,
  // allowing an intermediate stop at any vertex.
  let overallMinPath = Number.POSITIVE_INFINITY;

  for (currentVertexX = 0; currentVertexX < numberOfVertices; currentVertexX++) {
    overallMinPath = Math.min(
      overallMinPath,
      distanceMatrix[sourceVertexIdx][currentVertexX] + distanceMatrix[currentVertexX][firstGoalVertexIdx] + distanceMatrix[currentVertexX][secondGoalVertexIdx]
    );
  }

  // Display the computed minimum path length to the console.
  console.log(overallMinPath);
});