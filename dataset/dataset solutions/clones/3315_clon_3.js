let pathCache = {}; // Global cache for memoization across all paths

/**
 * Recursively explores paths from a given node to find the longest one.
 * Utilizes memoization to avoid recomputing paths for already visited nodes.
 * @param {number} currentVertexId The ID of the node currently being processed.
 * @param {Array<Array<number>>} adjacencyGraph A list where index `i` contains an array of nodes reachable from `i`.
 * @returns {number} The length of the longest path starting from `currentVertexId`.
 */
function exploreLongestPath(currentVertexId, adjacencyGraph) {
  // Check if the result for this node is already cached
  if (pathCache[currentVertexId] !== undefined) {
    return pathCache[currentVertexId];
  }

  // If the current node has no outgoing edges, it's a leaf node, path length is 0.
  const outgoingEdges = adjacencyGraph[currentVertexId];
  if (!outgoingEdges || outgoingEdges.length === 0) {
    pathCache[currentVertexId] = 0; // Cache the result
    return 0;
  }

  let currentMaxPathLength = 0;

  // Iterate over all neighbors reachable from the current node
  for (const neighborId of outgoingEdges) {
    // Calculate the path length through this neighbor (1 for the current edge + path from neighbor)
    const pathThroughNeighbor = 1 + exploreLongestPath(neighborId, adjacencyGraph);
    
    // Update the maximum path length found so far
    if (pathThroughNeighbor > currentMaxPathLength) {
      currentMaxPathLength = pathThroughNeighbor;
    }
  }

  // Store and return the computed maximum path length for the current node
  pathCache[currentVertexId] = currentMaxPathLength;
  return currentMaxPathLength;
}

/**
 * Constructs an adjacency list representation of the graph and calculates in-degrees for each node.
 * @param {number} totalNodes The total number of nodes in the graph (1-indexed).
 * @param {Array<Array<number>>} edgeConnections An array of [from, to] edge pairs.
 * @returns {{graphStructure: Array<Array<number>>, inDegreeCounts: Array<number>}} An object containing the adjacency list and in-degree counts.
 */
const prepareGraphData = (totalNodes, edgeConnections) => {
  // Initialize adjacency list for 1-indexed nodes
  const graphStructure = Array.from({ length: totalNodes + 1 }, () => []);
  // Initialize in-degree counts for 1-indexed nodes
  const inDegreeCounts = Array.from({ length: totalNodes + 1 }, () => 0);

  // Process each edge to build the graph
  for (const [sourceNode, destinationNode] of edgeConnections) {
    if (sourceNode < 1 || sourceNode > totalNodes || destinationNode < 1 || destinationNode > totalNodes) {
      console.warn(`Invalid edge detected: [${sourceNode}, ${destinationNode}]. Skipping.`);
      continue; // Skip invalid edges
    }
    graphStructure[sourceNode].push(destinationNode);
    inDegreeCounts[destinationNode]++;
  }

  return { graphStructure, inDegreeCounts };
};

/**
 * Calculates the overall longest path in a Directed Acyclic Graph (DAG).
 * It identifies all source nodes (nodes with no incoming edges) and
 * then runs a DFS-like path exploration from each of them.
 * @param {number} numberOfVertices The total number of vertices in the graph.
 * @param {Array<Array<number>>} graphEdges An array of [startNode, endNode] pairs representing directed edges.
 * @returns {number} The length of the longest path found in the DAG.
 */
function findGlobalLongestPath(numberOfVertices, graphEdges) {
  // Clear the global cache for a fresh computation
  pathCache = {}; 
  
  // Build the graph representation and get in-degree counts
  const { graphStructure, inDegreeCounts } = prepareGraphData(numberOfVertices, graphEdges);

  let overallLongestPath = 0;

  // Iterate through all possible nodes (assuming 1-indexed nodes)
  for (let nodeId = 1; nodeId <= numberOfVertices; nodeId++) {
    // Only start path exploration from source nodes (nodes with no incoming edges)
    // or from any node that hasn't been part of a path calculation yet.
    // If a node has an in-degree of 0, it's a potential start of a longest path.
    if (inDegreeCounts[nodeId] === 0) {
      const pathFromThisSource = exploreLongestPath(nodeId, graphStructure);
      if (pathFromThisSource > overallLongestPath) {
        overallLongestPath = pathFromThisSource;
      }
    }
  }
  return overallLongestPath;
}

/**
 * Entry point for processing input and orchestrating the graph algorithm.
 * Reads graph data from a string input, parses it, and calls the solver.
 * @param {string} rawInput The raw string input containing graph data.
 * @returns {number} The computed longest path length.
 */
const executeGraphAnalysis = (rawInput) => {
  const inputLines = rawInput.split(/\r?\n/).filter(line => line.trim() !== '');

  if (inputLines.length === 0) {
    console.error("No input provided.");
    return 0;
  }

  // Parse the first line for N (number of nodes) and M (number of edges, though M is not used by solve)
  const [numNodes, numEdges] = inputLines[0].split(' ').map(Number);

  if (isNaN(numNodes) || numNodes <= 0) {
    console.error("Invalid number of nodes in input.");
    return 0;
  }

  // Parse the remaining lines to get the edges
  const edgesData = inputLines.slice(1).map(line => {
    const edge = line.split(' ').map(Number);
    if (edge.length !== 2 || isNaN(edge[0]) || isNaN(edge[1])) {
      console.warn(`Skipping malformed edge line: "${line}"`);
      return null;
    }
    return edge;
  }).filter(Boolean); // Remove any nulls from malformed lines

  // Validate the number of edges if needed (optional guard)
  if (edgesData.length !== numEdges) {
    console.warn(`Expected ${numEdges} edges but found ${edgesData.length}. Proceeding with available edges.`);
  }

  // Calculate the longest path using the parsed data
  const finalPathResult = findGlobalLongestPath(numNodes, edgesData);
  return finalPathResult;
};

// Main execution block to read from stdin and print result
try {
  const fileSystem = require('fs');
  const programInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
  const result = executeGraphAnalysis(programInput);
  console.log(result);
} catch (error) {
  console.error("An error occurred during execution:", error.message);
  // Optionally, provide a default or error code
  process.exit(1); 
}