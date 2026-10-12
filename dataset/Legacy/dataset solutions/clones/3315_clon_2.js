'use strict';

// This function performs a Depth-First Search to find the longest path
// starting from a given node in a directed acyclic graph.
function traverseGraph(currentNode, adjacencyMap, cacheResults) {
  // Check if the result for the current node is already computed and cached.
  if (cacheResults[currentNode.toString()]) {
    return cacheResults[currentNode.toString()];
  }

  // If the current node has no outgoing edges, the path length from it is 0.
  if (!adjacencyMap[currentNode].length) {
    return 0;
  }

  // Initialize the maximum path length found from this node.
  let longestPath = 0;

  // Iterate through all neighbors of the current node.
  for (let idx = 0; idx < adjacencyMap[currentNode].length; idx++) {
    // Recursively call DFS for each neighbor and update the maximum path.
    // Add 1 to account for the edge connecting the current node to its neighbor.
    longestPath = Math.max(longestPath, 1 + traverseGraph(adjacencyMap[currentNode][idx], adjacencyMap, cacheResults));
  }

  // Cache the computed maximum path length for the current node.
  cacheResults[currentNode.toString()] = longestPath;
  return longestPath;
}

// This utility function constructs an adjacency list representation of the graph
// and calculates the in-degree for each node.
function buildGraphData(nodeCount, connections) {
  // Initialize an adjacency list where each node has an empty array for its neighbors.
  // The size is nodeCount + 1 to accommodate 1-indexed nodes.
  const graphStructure = new Array(nodeCount + 1).fill(0).map(entry => []);
  // Initialize an array to store the in-degree (number of incoming edges) for each node.
  const inDegreeCounts = new Array(nodeCount + 1).fill(0);

  // Process each edge to populate the adjacency list and in-degree counts.
  for (let edgeIndex = 0; edgeIndex < connections.length; edgeIndex++) {
    const sourceNode = connections[edgeIndex][0];
    const destinationNode = connections[edgeIndex][1];
    // Add the destination node to the source node's adjacency list.
    graphStructure[sourceNode].push(destinationNode);
    // Increment the in-degree count for the destination node.
    inDegreeCounts[destinationNode]++;
  }

  // Return an object containing both the adjacency list and in-degree counts.
  return {
    list: graphStructure, // Property name 'list' must be preserved for Type II
    incoming: inDegreeCounts // Property name 'incoming' must be preserved for Type II
  };
}

// Main function to solve the problem: find the longest path in the graph.
function findLongestPath(totalNodes, graphEdges) {
  // Build the graph's adjacency list and in-degree information.
  const graphInfo = buildGraphData(totalNodes, graphEdges);
  const adjacencies = graphInfo.list;
  const entryDegrees = graphInfo.incoming;

  // Initialize the overall maximum path length found across all starting nodes.
  let overallMaxLen = 0;

  // Iterate through all possible nodes (1-indexed).
  for (let nodeIdentifier = 1; nodeIdentifier <= entryDegrees.length; nodeIdentifier++) {
    // If a node has an in-degree of 0, it means it's a potential starting point for a path.
    if (entryDegrees[nodeIdentifier] === 0) {
      // Initialize a new memoization cache for each DFS traversal starting from a new root.
      const pathCache = {};
      // Perform DFS from this root and update the overall maximum length.
      overallMaxLen = Math.max(overallMaxLen, traverseGraph(nodeIdentifier, adjacencies, pathCache));
    }
  }
  return overallMaxLen;
}

// Entry point function to handle input parsing and call the solver.
function processInput(rawData) {
  // Split the input string into individual lines.
  const inputLines = rawData.split("\n");
  // Parse the first line to get the number of nodes and edges (though only nodes are used here).
  const nodeEdgeCounts = inputLines[0].split(' ').map(val => parseInt(val, 10));
  const numNodes = nodeEdgeCounts[0];
  // Parse the remaining lines to get the list of edges.
  const edgeList = inputLines.slice(1).map(lineStr => lineStr.split(' ').map(elementStr => parseInt(elementStr, 10)));

  // Call the main solver function.
  const finalAnswer = findLongestPath(numNodes, edgeList);
  return finalAnswer;
}

// Read input from stdin and pass it to the main processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
