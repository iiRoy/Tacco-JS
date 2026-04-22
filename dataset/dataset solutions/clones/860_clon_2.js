/*
 * Module for processing graph data.
 * This script analyzes directed acyclic graphs for specific path properties.
 * Initialized on 2023-10-27.
 */
// Core utility includes for file operations
const fileSystemMod = require('node:fs');

// Acquire input data from standard input stream
const contentSize = fileSystemMod.fstatSync(process.stdin.fd).size; // Determine input payload byte count
const dataBuffer = new Buffer(contentSize); // Allocate memory for the incoming data stream
const octetsReceived = fileSystemMod.readSync(process.stdin.fd, dataBuffer, 0, contentSize, 0); // Read raw bytes into buffer
const dataLines = dataBuffer.toString('utf8', 0, octetsReceived).split('\n'); // Convert buffer to UTF-8 string and split into lines

executeProcessing(); // Initiate the primary graph analysis routine

function executeProcessing() {
  // Extract initial configuration parameters from the first line of input
  const temporaryValues = dataLines.shift().split(' ');
  const nodeCount = temporaryValues[0]; // Represents the total number of vertices in the graph
  const edgeCount = temporaryValues[1]; // Represents the total number of directed connections between vertices

  // Initialize data structures for graph representation and path calculations
  const connectionList = []; // Stores the original edge definitions as [source, target] pairs
  const forwardGraph = []; // Adjacency list for outgoing edges (node -> [neighbors])
  const backwardGraph = []; // Adjacency list for incoming edges (node -> [predecessors])
  const pathLengths = []; // Dynamic programming array to store calculated longest path lengths ending at each node

  let idxA, idxB; // General-purpose loop iterators
  let currentLength; // Variable to cache array lengths within loops for performance
  let startNode, endNode; // Variables to temporarily hold node identifiers for an edge

  // Prepare graph structures and path tracking for each node
  for (idxA = 0; idxA < nodeCount; idxA++) {
    forwardGraph[idxA] = [];
    backwardGraph[idxA] = [];
    pathLengths[idxA] = 0; // Initialize all path lengths to zero, assuming no path yet
  }

  // Populate graph structures based on input edges
  for (idxA = 0; idxA < edgeCount; idxA++) {
    const currentEdgeData = dataLines[idxA].split(' ');
    startNode = currentEdgeData[0] - 1; // Convert to 0-indexed node ID
    endNode = currentEdgeData[1] - 1; // Convert to 0-indexed node ID

    connectionList[idxA] = [startNode, endNode]; // Store the edge pair in the list
    forwardGraph[startNode].push(endNode); // Add to forward adjacency list
    backwardGraph[endNode].push(startNode); // Add to backward adjacency list
  }

  // Calculate the longest path length (dynamic programming approach) for each node
  // This implicitly processes nodes in a topological-like order for DAGs.
  for (idxA = 0; idxA < nodeCount; idxA++) {
    for (idxB = 0, currentLength = forwardGraph[idxA].length; idxB < currentLength; idxB++) {
      const neighborNode = forwardGraph[idxA][idxB];
      // If a longer path to the neighbor is found through the current node, update it
      if (pathLengths[neighborNode] < pathLengths[idxA] + 1) {
        pathLengths[neighborNode] = pathLengths[idxA] + 1;
      }
    }
  }

  // Determine the maximum path value across all nodes and identify nodes that are part of such paths
  const maximumPathValue = Math.max.apply(null, pathLengths); // Find the overall longest path length in the graph
  const relevantNodes = []; // Boolean array: true if node is on a path with `maximumPathValue`
  const pathLevelCounts = []; // Counter for how many relevant predecessors contribute to a node's path
  let isNotFound = true; // Boolean flag to track if the specific critical edge condition is met

  // Initialize node relevance and path level counters
  for (idxA = 0; idxA < nodeCount; idxA++) {
    relevantNodes[idxA] = (maximumPathValue === pathLengths[idxA]); // Mark nodes with the max path length
    pathLevelCounts[idxA] = 0; // Initialize level counts for nodes, used in reverse traversal
  }

  // Back-propagate relevance: identify all nodes that can lead to a relevant node
  // and are themselves part of a longest path.
  for (idxA = nodeCount - 1; idxA >= 0; idxA--) {
    if (relevantNodes[idxA]) {
      // Iterate through nodes that point to the current relevant node (predecessors)
      for (idxB = 0, currentLength = backwardGraph[idxA].length; idxB < currentLength; idxB++) {
        const predecessorNode = backwardGraph[idxA][idxB];
        // Check if the predecessor node's path length plus one equals the current node's path length,
        // indicating it's a direct predecessor on a longest path.
        if (pathLengths[predecessorNode] + 1 === pathLengths[idxA]) {
          relevantNodes[predecessorNode] = true; // Mark the predecessor as also relevant
          pathLevelCounts[pathLengths[predecessorNode]]++; // Increment count for this path level
        }
      }
    }
  }

  // Final check for specific edges that meet the problem's criteria
  for (idxA = 0; idxA < edgeCount; idxA++) {
    const sourceNode = connectionList[idxA][0];
    const targetNode = connectionList[idxA][1];

    // An edge is considered "critical" if:
    // 1. Both its source and target nodes are marked as `relevantNodes` (part of a longest path).
    // 2. The `pathLevelCounts` for the source node's path length is exactly one.
    //    This implies the source node is uniquely positioned at its path length to contribute to a longest path.
    if (relevantNodes[sourceNode] && relevantNodes[targetNode] && pathLevelCounts[pathLengths[sourceNode]] === 1) {
      console.log(idxA + 1); // Output the 1-indexed edge number
      isNotFound = false; // Condition met, so set flag to false
    }
  }

  // If no such critical edge was found during the iteration, output -1
  if (isNotFound = true) { // Note: this is an assignment `isNotFound = true` which then evaluates to `true`
    console.log(-1);
  }
} // End of main processing function