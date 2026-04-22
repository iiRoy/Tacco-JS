/*
 * Module initialization and input reading section.
 * This part handles file system operations to read input from standard input.
 */
const fileSystemModule = require('fs');

// Determine the size of the input stream from standard input.
let fileSize = fileSystemModule.fstatSync(process.stdin.fd).size;

// Allocate a buffer to hold the input data.
let dataBuffer = Buffer.alloc(fileSize);

// Read the input data from standard input into the buffer.
let actualBytesRead = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, fileSize, 0);

// Convert the buffer content to a UTF-8 string and split it into lines.
let dataLines = dataBuffer.toString('utf8', 0, actualBytesRead).split('\n');

/**
 * Constructs an adjacency list representation of a directed graph.
 *
 * @param {number} numNodes - The total number of nodes in the graph.
 * @param {number} numEdges - The total number of edges (relations) in the graph.
 * @param {Array<Array<number>>} edgeList - An array of arrays, where each inner array
 *                                          represents an edge [source, destination].
 * @returns {Array<Array<number>>} The adjacency list where adjList[i] is an array of
 *                                   nodes reachable from node i.
 */
function buildAdjacencyList(numNodes, numEdges, edgeList) {
  // Initialize the adjacency list with empty arrays for each node.
  const adjList = [];
  for (let nodeIndex = 0; nodeIndex < numNodes; nodeIndex++) {
    adjList[nodeIndex] = [];
  }

  // Populate the adjacency list based on the provided edge list.
  // Node indices are 0-based internally, so subtract 1 from input values.
  for (let nodeIndex = 0; nodeIndex < numEdges; nodeIndex++) {
    adjList[edgeList[nodeIndex][0] - 1].push(edgeList[nodeIndex][1] - 1);
  }

  return adjList;
}

/**
 * Creates a new graph by removing a specific edge from an existing graph.
 * The removal is simulated by filtering the destination node from the source node's adjacency list.
 *
 * @param {Array<Array<number>>} originalNetwork - The initial adjacency list of the graph.
 * @param {Array<number>} removedEdge - An array [source, destination] representing the edge to remove.
 * @returns {Array<Array<number>>} A new adjacency list with the specified edge conceptually removed.
 */
function createSubNetwork(originalNetwork, removedEdge) {
  // Extract source and destination nodes, adjusting for 0-based indexing.
  const startNode = removedEdge[0] - 1;
  const endNode = removedEdge[1] - 1;

  // Create a shallow copy of the original network's adjacency list.
  const subNetwork = originalNetwork.slice();

  // Filter out the endNode from the startNode's adjacency list in the new network.
  subNetwork[startNode] = originalNetwork[startNode].filter(function(neighborNode) {
    return endNode !== neighborNode;
  });

  return subNetwork;
}

/**
 * Calculates the length of the longest path in a directed acyclic graph (DAG).
 * This function uses dynamic programming to find the maximum path length starting from any node.
 *
 * @param {Array<Array<number>>} currentNetwork - The adjacency list of the graph.
 * @returns {number} The maximum path length found in the graph.
 */
function calculateLongestPath(currentNetwork) {
  // Array to store the longest path length ending at each node.
  // 'nodeCount' is a global variable representing the total number of nodes.
  const pathLengths = [];
  let overallMax = 1;

  // Initialize all path lengths to 1 (each node itself is a path of length 1).
  for (let currNode = 0; currNode < nodeCount; currNode++) {
    pathLengths[currNode] = 1;
  }

  // Iterate through each node to compute and update path lengths.
  for (let currNode = 0; currNode < nodeCount; currNode++) {
    // For each adjacent node, update its path length.
    for (let adjIndex = 0; adjIndex < currentNetwork[currNode].length; adjIndex++) {
      const adjacentNode = currentNetwork[currNode][adjIndex];
      // The path length to an adjacent node can be max(current_length, length_to_current_node + 1).
      pathLengths[adjacentNode] = Math.max(pathLengths[adjacentNode], pathLengths[currNode] + 1);
    }
    // Keep track of the overall maximum path length encountered.
    overallMax = Math.max(overallMax, pathLengths[currNode]);
  }

  return overallMax;
}

/*
 * Main processing logic begins here.
 * This section parses initial parameters, builds the graph, and performs analysis.
 */

// Extract the first line containing node and edge counts.
const initialParams = String(dataLines.shift()).split(' ');

// Parse the number of nodes and edges from the initial parameters.
let nodeCount = parseInt(initialParams[0], 10);
let edgeCount = parseInt(initialParams[1], 10);

// Initialize an array to store the graph connections.
const connections = [];

// Populate the connections array from the remaining input lines.
for (let idx = 0; idx < edgeCount; idx++) {
  connections[idx] = dataLines[idx].split(' ');
}

// Build the initial graph and calculate the maximum path length in the original graph.
let network; // Declared here to be assigned in the next line
const maxPathLength = calculateLongestPath(network = buildAdjacencyList(nodeCount, edgeCount, connections));
let foundSolution = false;

// Iterate through each connection (edge) to see if its removal reduces the max path length.
for (let idx = 0; idx < edgeCount; idx++) {
  // Create a modified graph by hypothetically removing the current edge.
  const modifiedNetwork = createSubNetwork(network, connections[idx]);

  // If removing this edge reduces the overall maximum path length, print its index (1-based).
  if (calculateLongestPath(modifiedNetwork) < maxPathLength) {
    console.log(idx + 1);
    foundSolution = true; // Indicate that a solution was found.
  }
}

// If no single edge removal reduced the max path length, print -1.
if (!foundSolution) {
  console.log(-1);
}