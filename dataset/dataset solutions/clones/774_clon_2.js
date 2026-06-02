var fileSystemModule = require('fs');

// Determine the size of the standard input stream
var fileSize = fileSystemModule.fstatSync(process.stdin.fd).size;

// Create a buffer to hold the input data
var dataBuffer = new Buffer(fileSize);

// Read data from standard input into the buffer
var actualBytesRead = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, fileSize, 0);

// Convert buffer to string, then split into an array of lines
var linesOfInput = dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');

// Parse the first line to get graph parameters
var initialConfig = linesOfInput.shift().split(' ');

// Extract number of nodes, number of edges, start node, and two goal nodes
var nodeCount = +initialConfig[0];
var edgeCount = +initialConfig[1];
var startNodeIndex = initialConfig[2] - 1;
var goalNodeOneIndex = initialConfig[3] - 1;
var goalNodeTwoIndex = initialConfig[4] - 1;

// Initialize the distance matrix for Floyd-Warshall algorithm
var distanceMatrix = [];
var currentEdgeData; // Temporary variable for edge data
var idxA, idxB, idxC; // Loop counters

// Populate the distance matrix: 0 for self-loops, Infinity otherwise
for (idxA = 0; idxA < nodeCount; idxA++) {
  distanceMatrix[idxA] = [];
  for (idxB = 0; idxB < nodeCount; idxB++) {
    distanceMatrix[idxA][idxB] = idxA === idxB ? 0 : Infinity;
  }
}

// Read edge weights and update the distance matrix
while (edgeCount--) {
  currentEdgeData = linesOfInput.shift().split(' ');
  distanceMatrix[currentEdgeData[0] - 1][currentEdgeData[1] - 1] = +currentEdgeData[2];
}

// Apply the Floyd-Warshall algorithm to find all-pairs shortest paths
for (idxC = 0; idxC < nodeCount; idxC++) {
  for (idxA = 0; idxA < nodeCount; idxA++) {
    for (idxB = 0; idxB < nodeCount; idxB++) {
      distanceMatrix[idxA][idxB] = Math.min(distanceMatrix[idxA][idxB], distanceMatrix[idxA][idxC] + distanceMatrix[idxC][idxB]);
    }
  }
}

// Calculate the minimum path cost from start node to any intermediate node,
// then to both goal nodes.
var minimumPathCost = Infinity;
for (idxA = 0; idxA < nodeCount; idxA++) {
  minimumPathCost = Math.min(minimumPathCost, distanceMatrix[startNodeIndex][idxA] + distanceMatrix[idxA][goalNodeOneIndex] + distanceMatrix[idxA][goalNodeTwoIndex]);
}

// Output the final minimum path cost
console.log(minimumPathCost);
