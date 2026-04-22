// This script analyzes a directed graph to determine if the removal of any single edge
// can reduce the length of its longest path. It reads graph definitions from standard input,
// constructs an adjacency list, and then iteratively tests edge removals.

// SECTION 1: System Interaction and Input Processing

// Load the Node.js file system module for synchronous operations.
const fileSystem = require('fs');

// Variable to hold the entire content read from standard input.
let fullInputPayload;

// Attempt to read all data from the standard input stream.
// The 'utf8' encoding ensures proper interpretation of text data.
try {
  fullInputPayload = fileSystem.readFileSync(process.stdin.fd, 'utf8');
} catch (dataReadError) {
  // If an error occurs during input reading, log it and terminate the process.
  console.error('CRITICAL ERROR: Failed to read data from standard input.', dataReadError.message);
  process.exit(1); // Indicate an abnormal termination.
}

// Split the entire input payload into an array of individual lines.
// `.trim()` removes any leading/trailing whitespace, preventing issues with empty lines.
const sourceTextLines = fullInputPayload.trim().split('\n');

// Retrieve and process the very first line, which should contain graph dimensions.
const dimensionLine = sourceTextLines.shift();

// Validate the presence of the dimension line.
if (!dimensionLine) {
  console.error('INPUT PARSING ERROR: The first line containing graph dimensions is missing.');
  process.exit(1);
}

// Parse the dimension line to extract the number of nodes and edges.
const dimensionTokens = dimensionLine.split(' ');

// Ensure that both node count and edge count are provided.
if (dimensionTokens.length < 2) {
  console.error('INPUT PARSING ERROR: Insufficient parameters on the dimension line (expected node_count edge_count).');
  process.exit(1);
}

// Convert string tokens to integers, specifying base 10 for safety.
const numberOfGraphNodes = parseInt(dimensionTokens[0], 10);
const numberOfGraphEdges = parseInt(dimensionTokens[1], 10);

// Perform basic validation on the parsed numerical dimensions.
if (isNaN(numberOfGraphNodes) || numberOfGraphNodes <= 0 || isNaN(numberOfGraphEdges) || numberOfGraphEdges < 0) {
  console.error('INPUT PARSING ERROR: Invalid or non-positive node/edge counts provided.');
  process.exit(1);
}

// Array to store all edge definitions as [source, destination] pairs.
const graphEdgeDefinitions = [];

// Loop through the remaining lines to parse each edge.
for (let currentEdgeIndex = 0; currentEdgeIndex < numberOfGraphEdges; currentEdgeIndex++) {
  const edgeLine = sourceTextLines[currentEdgeIndex];

  // Validate that an edge definition line exists for the current index.
  if (!edgeLine) {
    console.error(`INPUT PARSING ERROR: Missing edge definition for expected edge number ${currentEdgeIndex + 1}.`);
    process.exit(1);
  }

  const edgeComponents = edgeLine.split(' ');

  // Validate the format of the edge definition.
  if (edgeComponents.length < 2) {
    console.error(`INPUT PARSING ERROR: Malformed edge definition on line ${currentEdgeIndex + 2} (expected source_node destination_node).`);
    process.exit(1);
  }

  // Parse the source and destination node IDs for the current edge.
  const sourceNodeIdentifier = parseInt(edgeComponents[0], 10);
  const destinationNodeIdentifier = parseInt(edgeComponents[1], 10);

  // Validate the parsed node identifiers.
  if (isNaN(sourceNodeIdentifier) || sourceNodeIdentifier <= 0 || sourceNodeIdentifier > numberOfGraphNodes ||
      isNaN(destinationNodeIdentifier) || destinationNodeIdentifier <= 0 || destinationNodeIdentifier > numberOfGraphNodes) {
      console.error(`INPUT PARSING ERROR: Invalid node IDs in edge definition on line ${currentEdgeIndex + 2}. Node IDs must be between 1 and ${numberOfGraphNodes}.`);
      process.exit(1);
  }

  // Store the 1-based node IDs as parsed.
  graphEdgeDefinitions.push([sourceNodeIdentifier, destinationNodeIdentifier]);
}

// SECTION 2: Graph Manipulation Functions

/**
 * Generates an adjacency list representation for a directed graph.
 * Node IDs provided in `connections` are 1-based and are converted to 0-based internally.
 * @param {number} vertexCount - The total number of vertices (nodes) in the graph.
 * @param {Array<Array<number>>} connections - An array of [source, destination] pairs, where node IDs are 1-based.
 * @returns {Array<Array<number>>} An array of arrays, where `result[i]` contains all 0-based nodes reachable from node `i`.
 */
function buildAdjacencyStructure(vertexCount, connections) {
  // Initialize an array of arrays, where each inner array represents the neighbors of a vertex.
  // All vertices start with an empty list of neighbors.
  const adjacencyMatrix = Array.from({ length: vertexCount }, () => []);

  // Iterate over each connection to populate the adjacency list.
  for (const currentConnection of connections) {
    // Convert 1-based node IDs from input to 0-based for array indexing.
    const originVertex = currentConnection[0] - 1;
    const targetVertex = currentConnection[1] - 1;

    // Basic bounds checking for robustness.
    if (originVertex >= 0 && originVertex < vertexCount && targetVertex >= 0 && targetVertex < vertexCount) {
      adjacencyMatrix[originVertex].push(targetVertex);
    } else {
      // Log a warning if an edge references a non-existent node.
      console.warn(`WARNING: Edge [${currentConnection[0]}, ${currentConnection[1]}] contains node IDs outside the valid range [1, ${vertexCount}]. This edge will be ignored.`);
    }
  }
  return adjacencyMatrix;
}

/**
 * Creates a new graph (adjacency list) by removing a specified edge from an existing graph.
 * This function performs a deep copy to ensure the original graph remains unaltered.
 * @param {Array<Array<number>>} baseGraph - The original graph's adjacency list (0-based).
 * @param {Array<number>} edgeToRemove - The [source, destination] pair of the edge to be removed (1-based).
 * @returns {Array<Array<number>>} A new adjacency list representing the graph without the specified edge.
 */
function generateGraphWithoutSpecificEdge(baseGraph, edgeToRemove) {
  // Create a deep copy of the base graph's adjacency list.
  // `.map()` creates a new outer array, and `[...nodeConnections]` creates new inner arrays.
  const alteredGraph = baseGraph.map(nodeConnections => [...nodeConnections]);

  // Convert the 1-based edge components to 0-based indices.
  const edgeSourceNode = edgeToRemove[0] - 1;
  const edgeTargetNode = edgeToRemove[1] - 1;

  // Validate the source node index to prevent errors.
  if (edgeSourceNode < 0 || edgeSourceNode >= alteredGraph.length) {
    console.warn(`WARNING: Attempted to remove an edge from an invalid source node index (${edgeToRemove[0]}). No changes applied.`);
    return alteredGraph; // Return the copied graph without any modification.
  }

  // Filter out the target node from the source node's list of connections.
  // This effectively removes the directed edge.
  alteredGraph[edgeSourceNode] = alteredGraph[edgeSourceNode].filter(connectedNeighbor => connectedNeighbor !== edgeTargetNode);

  return alteredGraph;
}

/**
 * Calculates the length of the longest path in a given directed acyclic graph (DAG).
 * This is achieved using a dynamic programming approach, where `maxPathLengths[i]` stores
 * the maximum path length ending at node `i`.
 * @param {Array<Array<number>>} graphAdjacencyList - The adjacency list of the graph (0-based).
 * @param {number} totalVertexCount - The total number of vertices in the graph.
 * @returns {number} The maximum path length found across all paths in the graph.
 */
function computeMaximumPathLength(graphAdjacencyList, totalVertexCount) {
  // Initialize an array to store the maximum path length ending at each node.
  // Each node itself represents a path of length 1.
  const maxPathLengths = new Array(totalVertexCount).fill(1);

  // Initialize the overall maximum path length found.
  let globalMaxPath = 1;

  // Iterate through each node in the graph, processing them in an order that
  // allows dependencies to be resolved (e.g., topological order, or simply iterating).
  for (let currentVertex = 0; currentVertex < totalVertexCount; currentVertex++) {
    // For each neighbor (successor) of the current vertex:
    for (const neighborVertex of graphAdjacencyList[currentVertex]) {
      // Update the max path length for the neighbor.
      // The path length to the neighbor is the path length to the current vertex plus one (for the edge).
      // We take the maximum of the neighbor's current recorded path length and this new potential path.
      maxPathLengths[neighborVertex] = Math.max(maxPathLengths[neighborVertex], maxPathLengths[currentVertex] + 1);
    }
    // After processing all outgoing edges from the current vertex,
    // update the global maximum path length if the current vertex's path is longer.
    globalMaxPath = Math.max(globalMaxPath, maxPathLengths[currentVertex]);
  }

  return globalMaxPath;
}

// SECTION 3: Main Program Execution

// Construct the initial adjacency list for the complete graph.
const originalGraphAdjacency = buildAdjacencyStructure(numberOfGraphNodes, graphEdgeDefinitions);

// Calculate the longest path in the original graph.
const longestPathInOriginalGraph = computeMaximumPathLength(originalGraphAdjacency, numberOfGraphNodes);

// A boolean flag to track if we found any edge whose removal shortens the longest path.
let hasShorteningEdgeBeenIdentified = false;

// Iterate through each edge in the graph's definition.
for (let iterationIndex = 0; iterationIndex < numberOfGraphEdges; iterationIndex++) {
  const currentEdgeUnderConsideration = graphEdgeDefinitions[iterationIndex];

  // Create a temporary version of the graph with the current edge removed.
  const graphWithoutCurrentEdge = generateGraphWithoutSpecificEdge(originalGraphAdjacency, currentEdgeUnderConsideration);

  // Calculate the longest path in this modified graph.
  const longestPathAfterRemoval = computeMaximumPathLength(graphWithoutCurrentEdge, numberOfGraphNodes);

  // Compare the new longest path with the original longest path.
  if (longestPathAfterRemoval < longestPathInOriginalGraph) {
    // If removing this edge shortened the longest path, print its 1-based index.
    // The problem asks to print the first such edge found.
    console.log(iterationIndex + 1);
    hasShorteningEdgeBeenIdentified = true;
    break; // Exit the loop as we've found the first qualifying edge.
  }
}

// If the loop completed without finding any edge that shortens the longest path.
if (!hasShorteningEdgeBeenIdentified) {
  // Output -1 as per the problem specification.
  console.log(-1);
}