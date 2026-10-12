/*
 * This file processes graph data to find specific critical edges.
 * It reads graph structure from standard input.
 */
var fileSystemModule = require('fs'),
    // Determine the size of the standard input stream.
    fileSize = fileSystemModule.fstatSync(process.stdin.fd).size,
    // Create a buffer to hold the input data.
    dataBuffer = new Buffer(fileSize),
    // Read data from standard input into the buffer.
    readBytesCount = fileSystemModule.readSync(process.stdin.fd, dataBuffer, 0, fileSize, 0),
    // Convert buffer to string, then split into lines.
    inputLines = dataBuffer.toString('utf8', 0, readBytesCount).split('\n');

// Execute the primary graph processing routine.
processGraphData();

/**
 * Main function to handle graph operations and find critical edges.
 */
function processGraphData() {
  // Parse the first line for node and edge counts.
  var temporaryValues = inputLines.shift().split(' '),
      nodeCount = temporaryValues[0], // Number of nodes in the graph.
      edgeCount = temporaryValues[1], // Number of edges in the graph.
      graphEdges = [],                // Stores all edges as [source, target].
      adjacencyList = [],             // Adjacency list for forward graph traversal.
      reverseAdjacencyList = [],      // Adjacency list for reverse graph traversal.
      longestPathLengths = [],        // Stores the length of the longest path ending at each node.
      nodeIdx,                        // Loop counter for nodes.
      neighborIdx,                    // Loop counter for neighbors.
      currentLength,                  // Stores array length in loops.
      sourceNode,                     // Source node of an edge.
      targetNode;                     // Target node of an edge.

  // Initialize graph structures for each node.
  for (nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    adjacencyList[nodeIdx] = [];
    reverseAdjacencyList[nodeIdx] = [];
    longestPathLengths[nodeIdx] = 0; // Initialize longest path to 0 for all nodes.
  }

  // Read and process each edge from the input.
  for (nodeIdx = 0; nodeIdx < edgeCount; nodeIdx++) {
    temporaryValues = inputLines[nodeIdx].split(' ');
    sourceNode = temporaryValues[0] - 1; // Adjust to 0-indexed.
    targetNode = temporaryValues[1] - 1; // Adjust to 0-indexed.

    graphEdges[nodeIdx] = [sourceNode, targetNode]; // Store the edge.
    adjacencyList[sourceNode].push(targetNode);     // Add to forward adjacency list.
    reverseAdjacencyList[targetNode].push(sourceNode); // Add to reverse adjacency list.
  }

  // Calculate the longest path length to each node using dynamic programming.
  // This assumes a DAG (Directed Acyclic Graph).
  for (nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    for (neighborIdx = 0, currentLength = adjacencyList[nodeIdx].length; neighborIdx < currentLength; neighborIdx++) {
      // If a longer path to the neighbor is found through the current node, update it.
      if (longestPathLengths[adjacencyList[nodeIdx][neighborIdx]] < longestPathLengths[nodeIdx] + 1) {
        longestPathLengths[adjacencyList[nodeIdx][neighborIdx]] = longestPathLengths[nodeIdx] + 1;
      }
    }
  }

  // Find the maximum path length in the entire graph.
  var maximumPathLength = Math.max.apply(null, longestPathLengths),
      criticalNodes = [],       // Boolean array: true if node is part of *any* longest path.
      nodeLevelCounts = [],     // Counts how many critical nodes are at a specific path length.
      foundCriticalEdge = true; // Flag to track if a critical edge is found.

  // Initialize criticalNodes and nodeLevelCounts arrays.
  for (nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    criticalNodes[nodeIdx] = (maximumPathLength === longestPathLengths[nodeIdx]);
    nodeLevelCounts[nodeIdx] = 0; // Initialize counts for each level.
  }

  // Traverse nodes in reverse order to identify all nodes belonging to *a* longest path.
  // Also, count critical nodes at each path length level.
  for (nodeIdx = nodeCount - 1; nodeIdx >= 0; nodeIdx--) {
    if (criticalNodes[nodeIdx]) { // If the current node is part of a longest path...
      for (neighborIdx = 0, currentLength = reverseAdjacencyList[nodeIdx].length; neighborIdx < currentLength; neighborIdx++) {
        // Check if a predecessor node forms a path of length `longestPathLengths[nodeIdx]` ending at `nodeIdx`.
        if (longestPathLengths[reverseAdjacencyList[nodeIdx][neighborIdx]] + 1 === longestPathLengths[nodeIdx]) {
          criticalNodes[reverseAdjacencyList[nodeIdx][neighborIdx]] = true; // Mark predecessor as critical.
          nodeLevelCounts[longestPathLengths[reverseAdjacencyList[nodeIdx][neighborIdx]]]++; // Increment count for its level.
        }
      }
    }
  }

  // Iterate through all original edges to find critical edges.
  for (nodeIdx = 0; nodeIdx < edgeCount; nodeIdx++) {
    // An edge is critical if:
    // 1. Both its source and target nodes are part of *a* longest path.
    // 2. The source node's path length level has only one critical node (itself).
    //    This implies it's a unique path segment at that level.
    if (criticalNodes[graphEdges[nodeIdx][0]] &&
        criticalNodes[graphEdges[nodeIdx][1]] &&
        nodeLevelCounts[longestPathLengths[graphEdges[nodeIdx][0]]] === 1) {
      console.log(nodeIdx + 1); // Output the 1-indexed edge number.
      foundCriticalEdge = false; // A critical edge was found.
    }
  }

  // If no critical edge was found, output -1.
  // Note: The original code uses an assignment `flag = true` which always evaluates to true.
  // This behavior is preserved.
  if (foundCriticalEdge = true) {
    console.log(-1);
  }

  /*
   * The following commented-out blocks are from the original code.
   * They are preserved as comments.
   */
  // for (nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
  //   for (neighborIdx = 0, currentLength = adjacencyList[nodeIdx].length; neighborIdx < currentLength; neighborIdx++) {
  //
  //   }
  // }
  // console.log(longestPathLengths)
  //
  // console.log(criticalNodes)
  // console.log(nodeLevelCounts)
}
