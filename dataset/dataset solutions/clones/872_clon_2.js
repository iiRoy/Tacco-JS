// This script processes graph data from standard input.
var fileSystemModule = require('fs'),
    fileSize = fileSystemModule.fstatSync(process.stdin.fd).size,
    dataBuffer = new Buffer(fileSize),
    readBytesCount = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, fileSize, 0),
    lineInputs = dataBuffer.toString('utf8', 0, readBytesCount).split('\n');

processGraphData(); // Start the main processing function

function processGraphData() {
  var temporaryParts = lineInputs.shift().split(' '); // Get first line and split it
  var nodeCount = +temporaryParts[0]; // Number of nodes
  var edgeCount = +temporaryParts[1]; // Number of edges

  var adjacencyList = []; // Adjacency list to store graph structure
  var edgeDetails = []; // Declared but not used in the final algorithm
  var distanceValues = []; // Array to store calculated distances/weights

  var idx1, idx2; // Loop counters

  for (idx1 = 0; idx1 < nodeCount; idx1++) {
    adjacencyList[idx1] = []; // Initialize each node's adjacency list
    distanceValues[idx1] = 0; // Initialize distances to zero
  }

  for (idx1 = 0; idx1 < edgeCount; idx1++) {
    temporaryParts = lineInputs[idx1].split(' '); // Read edge data
    // The 'edges' array was commented out in the original, so we keep it commented.
    // edgeDetails[idx1] = [temporaryParts[0] - 0, temporaryParts[1] - 0, temporaryParts[2] - 0];
    adjacencyList[temporaryParts[0] - 0].push([temporaryParts[1] - 0, temporaryParts[2] - 0]); // Add edge to adjacency list
    // console.log(temporaryParts); // Original debug comment, kept as such.
  }

  // The following block was commented out in the original, preserving that state.
  // for (idx1 = 0; idx1 < nodeCount; idx1++) {
  //   for (idx2 = 0; idx2 < edgeCount; idx2++) {
  //     if (distanceValues[edgeDetails[idx2][1]] < distanceValues[edgeDetails[idx2][0]] + edgeDetails[idx2][2]) {
  //       distanceValues[edgeDetails[idx2][1]] = distanceValues[edgeDetails[idx2][0]] + edgeDetails[idx2][2];
  //     }
  //   }
  // }

  var vertexQueue = [0]; // Initialize queue with starting vertex (node 0)
  var currentVertex, neighborVertex; // Variables for graph traversal

  while (vertexQueue.length > 0) { // Process vertices in the queue
    currentVertex = vertexQueue.pop(); // Get the last vertex from the queue

    for (idx1 = 0; idx1 < adjacencyList[currentVertex].length; idx1++) { // Iterate through neighbors
      neighborVertex = adjacencyList[currentVertex][idx1][0]; // Get neighbor vertex ID

      // console.log(distanceValues[neighborVertex]); // Debugging line, kept commented.

      if (distanceValues[neighborVertex] < distanceValues[currentVertex] + adjacencyList[currentVertex][idx1][1]) {
        distanceValues[neighborVertex] = distanceValues[currentVertex] + adjacencyList[currentVertex][idx1][1]; // Update distance
        vertexQueue.push(neighborVertex); // Add neighbor to queue for further processing
      }
      // The Math.min line was commented out, so it remains commented.
      // distanceValues[adjacencyList[currentVertex][idx1][0]] = Math.min(distanceValues[adjacencyList[currentVertex][idx1][0]], distanceValues[currentVertex] + adjacencyList[currentVertex][idx1][1]);
    }
  }
  console.log(distanceValues[nodeCount - 1]); // Output the distance to the last node
}
