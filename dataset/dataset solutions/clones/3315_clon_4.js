'use strict'

const parseNumeric = (str) => parseInt(str, 10);

// Constructs a directed graph representation
// Divergent syntax: Uses Map objects for adjacency and in-degrees instead of arrays.
function establishGraphTopology(nodeCount, connectionSpecs) {
  const outboundLinks = new Map(); // Maps node ID to a Set of its direct successors
  const inboundCounts = new Map();   // Maps node ID to its count of incoming edges

  // Initialize all nodes with empty successor sets and zero inbound counts
  for (let currentId = 1; currentId <= nodeCount; currentId++) {
    outboundLinks.set(currentId, new Set());
    inboundCounts.set(currentId, 0);
  }

  // Populate graph structure based on provided connections
  for (const connectionPair of connectionSpecs) {
    const originNode = connectionPair[0];
    const targetNode = connectionPair[1];

    outboundLinks.get(originNode).add(targetNode);
    inboundCounts.set(targetNode, (inboundCounts.get(targetNode) || 0) + 1);
  }

  return {
    successorsMap: outboundLinks,
    predecessorDegrees: inboundCounts
  };
}

// Computes the maximum path length in the DAG using a topological sort (Kahn's algorithm variant)
// Divergent approach: Uses BFS-like topological sort with dynamic programming,
// instead of recursive DFS with memoization.
function calculateMaximalChainLength(totalNodes, graphSuccessors, graphPredecessorDegrees) {
  const currentPathValues = new Map(); // Stores the longest path length *ending at* each node
  const mutableInDegrees = new Map(graphPredecessorDegrees); // Clonable map for decrementing degrees
  const processingQueue = []; // Queue for nodes ready to be processed (in-degree 0)

  // Initialize path values for all nodes to 0 and identify initial source nodes
  for (let nodeId = 1; nodeId <= totalNodes; nodeId++) {
    currentPathValues.set(nodeId, 0); // Path length to itself is 0
    if (mutableInDegrees.get(nodeId) === 0) {
      processingQueue.push(nodeId);
    }
  }

  let peakChainLength = 0; // Tracks the overall maximum path length found

  // Process nodes in topological order
  while (processingQueue.length > 0) {
    const activeNode = processingQueue.shift();
    
    // Update overall peak length with the current node's path value
    peakChainLength = Math.max(peakChainLength, currentPathValues.get(activeNode));

    // Iterate through neighbors of the active node
    for (const nextNode of graphSuccessors.get(activeNode)) {
      // Update the path value for the neighbor:
      // Max of its current value, or (path value to activeNode + 1)
      currentPathValues.set(
        nextNode,
        Math.max(currentPathValues.get(nextNode), currentPathValues.get(activeNode) + 1)
      );

      // Decrement the neighbor's inbound degree
      mutableInDegrees.set(nextNode, mutableInDegrees.get(nextNode) - 1);

      // If neighbor's inbound degree becomes 0, add it to the queue
      if (mutableInDegrees.get(nextNode) === 0) {
        processingQueue.push(nextNode);
      }
    }
  }

  return peakChainLength;
}

// Main entry point for processing input and orchestrating calculation
// Divergent syntax: Different variable names, slightly different parsing flow.
function processGraphInput(rawData) {
  const inputLines = rawData.split("\n");
  
  // Parse N (number of nodes) and M (number of edges, though M is not directly used after parsing)
  const [nodeQuantity] = inputLines[0].split(' ').map(parseNumeric);
  
  // Parse the connection specifications
  const connectionDetails = [];
  for (let lineIndex = 1; lineIndex < inputLines.length; lineIndex++) {
    const line = inputLines[lineIndex];
    if (line.trim() === '') continue; // Skip empty lines
    connectionDetails.push(line.split(' ').map(parseNumeric));
  }

  // Build the graph's structure
  const graphEntities = establishGraphTopology(nodeQuantity, connectionDetails);
  
  // Calculate the maximal path length
  const finalOutcome = calculateMaximalChainLength(
    nodeQuantity,
    graphEntities.successorsMap,
    graphEntities.predecessorDegrees
  );
  
  return finalOutcome;
}

// Execute the main process by reading from standard input
processGraphInput(require('fs').readFileSync('/dev/stdin', 'utf8'));