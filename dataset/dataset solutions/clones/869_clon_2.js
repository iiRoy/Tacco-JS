/*
 * This script processes graph data from standard input
 * to find the longest path weights from a source node (node 0).
 * It uses a relaxation-based approach similar to Bellman-Ford or SPFA
 * for directed acyclic graphs, but adapted for longest paths.
 */
var fileSystemModule = require('fs'),
    dataSize = fileSystemModule.fstatSync(process.stdin.fd).size,
    inputBuffer = new Buffer(dataSize),
    readBytesCount = fileSystemModule.readSync(process.stdin.fd, inputBuffer, 0, dataSize, 0),
    linesOfInput = inputBuffer.toString('utf8', 0, readBytesCount).split('\n');

// Initiate the graph processing routine
processGraphData();

function processGraphData() {
  // Extract initial graph parameters from the first line of input
  var currentLineParts = linesOfInput.shift().split(' '),
      nodeCount = +currentLineParts[0],
      edgeCount = +currentLineParts[1],
      adjacencyList = [], // Represents the graph as an adjacency list
      maxPathWeights = [], // Stores the maximum path weight to each node from the source
      nodeIndex,
      innerIndex; // Declared but unused, mirroring original structure

  // Initialize the adjacency list and path weights array
  for (nodeIndex = 0; nodeIndex < nodeCount; nodeIndex++) {
    adjacencyList[nodeIndex] = [];
    maxPathWeights[nodeIndex] = 0; // Initialize all path weights to zero
    // Original commented block for initializing with Infinity:
    // for (innerIndex = 0; innerIndex < nodeCount; innerIndex++) {
    //   adjacencyList[nodeIndex][innerIndex] = Infinity;
    // }
  }

  // Populate the adjacency list with edges from the input
  for (nodeIndex = 0; nodeIndex < edgeCount; nodeIndex++) {
    currentLineParts = linesOfInput[nodeIndex].split(' ');
    // Add an edge from currentLineParts[0] to currentLineParts[1] with weight currentLineParts[2]
    adjacencyList[currentLineParts[0] - 0].push([currentLineParts[1] - 0, currentLineParts[2] - 0]);
    // Original commented line:
    // console.log(currentLineParts);
  }

  // Perform a graph traversal to find longest paths
  var processingQueue = [0], // Start processing from node 0
      currentNode,
      neighborNode;

  // Continue as long as there are nodes to process in the queue
  while (processingQueue.length) {
    currentNode = processingQueue.pop(); // Get the next node from the queue

    // Iterate through all neighbors of the current node
    for (nodeIndex = 0; nodeIndex < adjacencyList[currentNode].length; nodeIndex++) {
      neighborNode = adjacencyList[currentNode][nodeIndex][0]; // The identifier of the neighbor node
      // Original commented line:
      // console.log(maxPathWeights[neighborNode]);

      // If a longer path to the neighbor is found through the current node
      if (maxPathWeights[neighborNode] < maxPathWeights[currentNode] + adjacencyList[currentNode][nodeIndex][1]) {
        maxPathWeights[neighborNode] = maxPathWeights[currentNode] + adjacencyList[currentNode][nodeIndex][1];
        processingQueue.push(neighborNode); // Add the neighbor to the queue for further relaxation
      }
      // Original commented line, suggesting a shortest path consideration:
      // maxPathWeights[adjacencyList[currentNode][nodeIndex][0]] = Math.min(maxPathWeights[adjacencyList[currentNode][nodeIndex][0]], maxPathWeights[currentNode] + adjacencyList[currentNode][nodeIndex][1]);
    }
  }
  // Output the final calculated maximum path weights for all nodes
  console.log(maxPathWeights);
}
