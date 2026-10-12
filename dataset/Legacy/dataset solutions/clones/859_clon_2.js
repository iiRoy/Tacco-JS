// This script processes graph data from standard input to find critical edges.
// It identifies edges whose removal reduces the longest path in the graph.

var fileSystemModule = require('fs'); // Import the Node.js file system module.

// Determine the size of the standard input stream.
var dataLength = fileSystemModule.fstatSync(process.stdin.fd).size;

// Create a buffer to hold the input data.
var inputBuffer = new Buffer(dataLength);

// Read data from standard input into the buffer.
var actualBytesRead = fileSystemModule.readSync(process.stdin.fd, inputBuffer, 0, dataLength, 0);

// Convert the buffer content to a UTF-8 string, then split it into lines.
var rawInputLines = inputBuffer.toString('utf8', 0, actualBytesRead).split('\n');


/**
 * Constructs an adjacency list representation of a directed graph.
 * @param {number} nodeCount - The total number of nodes in the graph.
 * @param {number} edgeCount - The total number of edges.
 * @param {Array<Array<number>>} connections - An array of [source, target] pairs for edges.
 * @returns {Array<Array<number>>} The adjacency list.
 */
function constructNetwork(nodeCount, edgeCount, connections) {
  var adjList = []; // Initialize the adjacency list.
  var idx; // Loop counter.

  // Initialize each node with an empty list of neighbors.
  for (idx = 0; idx < nodeCount; idx++) {
    adjList[idx] = [];
  }

  // Populate the adjacency list based on the provided connections.
  for (idx = 0; idx < edgeCount; idx++) {
    // Adjust node indices from 1-based to 0-based.
    adjList[connections[idx][0] - 1].push(connections[idx][1] - 1);
  }

  return adjList; // Return the completed graph structure.
}


/**
 * Creates a new graph by removing a specific edge from an existing graph.
 * @param {Array<Array<number>>} originalAdjList - The original graph's adjacency list.
 * @param {Array<number>} removedConnection - The [source, target] edge to remove (1-based).
 * @returns {Array<Array<number>>} A new adjacency list with the specified edge removed.
 */
function createModifiedNetwork(originalAdjList, removedConnection) {
  // Adjust node indices for the edge to be removed.
  var sourceNode = removedConnection[0] - 1;
  var targetNode = removedConnection[1] - 1;

  // Create a shallow copy of the adjacency list to avoid modifying the original.
  var modifiedAdjList = originalAdjList.slice();

  // Filter out the target node from the source node's adjacency list.
  modifiedAdjList[sourceNode] = originalAdjList[sourceNode].filter(function (currentElement, elementIndex) {
    return targetNode !== currentElement; // Keep elements that are not the target node.
  });

  return modifiedAdjList; // Return the graph with the edge removed.
}


/**
 * Calculates the length of the longest path in a directed acyclic graph (DAG).
 * Assumes 'totalNodes' is globally available or passed.
 * @param {Array<Array<number>>} networkGraph - The adjacency list of the graph.
 * @returns {number} The maximum path length found.
 */
function calculateLongestPath(networkGraph) {
  var pathLengths = []; // Array to store the longest path ending at each node.
  var nodeIdx, neighborIdx; // Loop counters.
  var maximumPath = 1; // Initialize maximum path length to 1 (for a single node).

  // Initialize all path lengths to 1 (each node itself is a path of length 1).
  for (nodeIdx = 0; nodeIdx < totalNodes; nodeIdx++) {
    pathLengths[nodeIdx] = 1;
  }

  // Iterate through nodes to compute longest paths.
  for (nodeIdx = 0; nodeIdx < totalNodes; nodeIdx++) {
    // For each neighbor of the current node:
    for (neighborIdx = 0; neighborIdx < networkGraph[nodeIdx].length; neighborIdx++) {
      // Update the path length to the neighbor if a longer path is found through the current node.
      pathLengths[networkGraph[nodeIdx][neighborIdx]] = Math.max(
        pathLengths[networkGraph[nodeIdx][neighborIdx]],
        pathLengths[nodeIdx] + 1
      );
    }
    // Update the overall maximum path length.
    maximumPath = Math.max(maximumPath, pathLengths[nodeIdx]);
  }

  return maximumPath; // Return the longest path found in the graph.
}


// --- Main program execution starts here ---

// Parse the first line of input to get node and edge counts.
var firstLineParts = rawInputLines.shift().split(' ');
var totalNodes = parseInt(firstLineParts[0], 10); // Number of nodes.
var totalEdges = parseInt(firstLineParts[1], 10); // Number of edges.

var allConnections = []; // Array to store all graph connections.
var initialGraph; // Variable to hold the initial graph.
var tempGraph; // Variable for temporary graph modifications.
var edgeIterator; // Loop counter for iterating through edges.

// Read the remaining input lines to populate the connections array.
for (edgeIterator = 0; edgeIterator < totalEdges; edgeIterator++) {
  allConnections[edgeIterator] = rawInputLines[edgeIterator].split(' ');
}

// Calculate the longest path in the original graph.
var originalMaxPath = calculateLongestPath(initialGraph = constructNetwork(totalNodes, totalEdges, allConnections));
var foundCriticalEdge = false; // Flag to track if a critical edge is found.

// Iterate through each edge to check if its removal reduces the longest path.
for (edgeIterator = 0; edgeIterator < totalEdges; edgeIterator++) {
  // Create a temporary graph with the current edge removed.
  tempGraph = createModifiedNetwork(initialGraph, allConnections[edgeIterator]);

  // If removing this edge shortens the longest path:
  if (calculateLongestPath(tempGraph) < originalMaxPath) {
    console.log(edgeIterator + 1); // Output the 1-based index of the critical edge.
    foundCriticalEdge = true; // Set the flag.
  }
}

// If no critical edge was found, output -1.
if (!foundCriticalEdge) {
  console.log(-1);
}
