/**
 * This script calculates the shortest path sum from a starting node to two goal nodes
 * in a graph using the Floyd-Warshall algorithm.
 * It reads graph configuration and edge weights from standard input.
 */

// Initialize a variable to accumulate input data from stdin.
let rawData = '';

// Resume the standard input stream to begin receiving data.
process.stdin.resume();

// Set the character encoding for the standard input stream.
process.stdin.setEncoding('utf8');

// Attach an event listener for 'data' events from stdin.
// Each time a chunk of data is received, append it to the rawData string.
process.stdin.on('data', function(dataChunk) {
  rawData += dataChunk;
});

// Attach an event listener for the 'end' event from stdin.
// This signifies that all input data has been received.
process.stdin.on('end', function() {
  // Split the accumulated raw data into an array of lines.
  rawData = rawData.split('\n');

  // Parse the first line of input, which contains graph configuration.
  const initialConfig = rawData.shift().split(' ');
  const nodeCount = +initialConfig[0]; // Total number of nodes (N)
  // const edgeCount = +initialConfig[1]; // Total number of edges (M) - not used after parsing
  const startNode = +initialConfig[2] - 1; // Starting node index (0-based)
  const goal1 = +initialConfig[3] - 1; // First target node index (0-based)
  const goal2 = +initialConfig[4] - 1; // Second target node index (0-based)

  // Initialize the distance matrix for the Floyd-Warshall algorithm.
  // 'distanceMatrix[idxA][idxB]' will store the shortest distance from node 'idxA' to node 'idxB'.
  const distanceMatrix = [];
  let edgeDataLine; // Temporary variable to hold parsed edge data.
  let idxA, idxB, idxC; // Loop counters for matrix operations.

  // Populate the initial distance matrix:
  // - Distance from a node to itself is 0.
  // - All other initial distances are set to Infinity (representing no direct path yet).
  for (idxA = 0; idxA < nodeCount; idxA++) {
    distanceMatrix[idxA] = [];
    for (idxB = 0; idxB < nodeCount; idxB++) {
      distanceMatrix[idxA][idxB] = idxA === idxB ? 0 : Infinity;
    }
  }

  // Read edge weights from the input until a specific termination line is encountered.
  // The termination line is "0 0 0 0 0".
  while (rawData[0] !== '0 0 0 0 0') {
    edgeDataLine = rawData.shift().split(' ');
    // Assign the weight to the corresponding edge in the distance matrix.
    // Node indices from input are 1-based, so convert to 0-based.
    distanceMatrix[+edgeDataLine[0] - 1][+edgeDataLine[1] - 1] = +edgeDataLine[2];
  }

  // Execute the Floyd-Warshall algorithm to compute all-pairs shortest paths.
  // 'idxC' represents the intermediate node in the path.
  for (idxC = 0; idxC < nodeCount; idxC++) {
    // 'idxA' represents the source node.
    for (idxA = 0; idxA < nodeCount; idxA++) {
      // 'idxB' represents the destination node.
      for (idxB = 0; idxB < nodeCount; idxB++) {
        // Update the shortest path if a path through 'idxC' is shorter than the current path.
        distanceMatrix[idxA][idxB] = Math.min(distanceMatrix[idxA][idxB], distanceMatrix[idxA][idxC] + distanceMatrix[idxC][idxB]);
      }
    }
  }

  // Calculate the minimum total path sum from the start node to an intermediate node,
  // and then from that intermediate node to both goal nodes.
  // The path structure is: startNode -> intermediateNode -> goal1
  // AND startNode -> intermediateNode -> goal2.
  // We are looking for an intermediateNode 'idxA' that minimizes:
  // distanceMatrix[startNode][idxA] + distanceMatrix[idxA][goal1] + distanceMatrix[idxA][goal2].
  let minPathSum = Infinity;
  for (idxA = 0; idxA < nodeCount; idxA++) {
    minPathSum = Math.min(minPathSum, distanceMatrix[startNode][idxA] + distanceMatrix[idxA][goal1] + distanceMatrix[idxA][goal2]);
  }

  // Output the calculated minimum path sum to the console.
  console.log(minPathSum);
});
