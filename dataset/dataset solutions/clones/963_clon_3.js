// This file orchestrates the calculation of shortest paths within a graph using Dijkstra's algorithm.

// Application configuration settings for input source and line termination.
// Dynamically sets input source based on the operating system for broader compatibility.
const appSettings = {
  inputSource: process.platform === 'win32' ? 'tmp_input.txt' : '/dev/stdin', // Use 'tmp_input.txt' for Windows testing, '/dev/stdin' for Linux
  lineDelimiter: process.platform === 'win32' ? '\r\n' : '\n'
};

// Import the Node.js 'fs' (file system) module for reading input files.
const fileSystem = require('fs');

// Read the entire input file content, decode it as UTF-8, remove any surrounding whitespace,
// and then split the content into an array of individual lines based on the determined delimiter.
const rawInputContent = fileSystem.readFileSync(appSettings.inputSource, 'utf8');
const inputLines = rawInputContent.trim().split(appSettings.lineDelimiter);

// --- Graph Data Structures Initialization ---

// A comprehensive map to store all graph nodes.
// Each key represents a unique node identifier (number), and its value is an object
// containing properties like its ID, calculated shortest distance from the source,
// and its predecessor node in the shortest path.
const graphNodes = {};

// An adjacency list representation for storing edge weights (costs).
// The outer key is the source node's identifier. The inner object maps
// target node identifiers to their respective connection costs.
const edgeWeightsMap = {};

/**
 * Establishes a directed connection (edge) in the adjacency list.
 * This function ensures the source node entry exists before adding the target-cost pair.
 * It also includes a basic validation for connection costs.
 * @param {object} adjacencyList - The graph's adjacency list (e.g., `edgeWeightsMap`).
 * @param {number} sourceId - The unique identifier of the starting node for this connection.
 * @param {number} targetId - The unique identifier of the destination node for this connection.
 * @param {number} connectionCost - The weight or cost associated with traversing this connection.
 */
const establishConnection = (adjacencyList, sourceId, targetId, connectionCost) => {
  // Validate connection cost: Dijkstra's algorithm requires non-negative edge weights.
  if (connectionCost < 0) {
    console.warn(`Warning: Negative edge cost (${connectionCost}) detected for connection from ${sourceId} to ${targetId}. Dijkstra's algorithm guarantees optimality only with non-negative weights.`);
    // In a strict implementation, one might throw an error or use a different algorithm like Bellman-Ford.
  }

  // If the source node doesn't have an entry in the adjacency list yet, initialize it.
  if (!adjacencyList.hasOwnProperty(sourceId)) {
    adjacencyList[sourceId] = {};
  }
  // Assign the connection cost to the target node for the given source.
  adjacencyList[sourceId][targetId] = connectionCost;
};

// --- Graph Population from Input Lines ---

// The first line of input often contains the total number of nodes, but it's not strictly
// required by this Dijkstra implementation, which discovers nodes dynamically.
// We consume it to align with typical input formats, but its value isn't directly used for graph construction.
const initialNodeCountLine = inputLines.shift();
if (initialNodeCountLine !== undefined && initialNodeCountLine.trim().length > 0) {
  const expectedTotalNodes = parseInt(initialNodeCountLine, 10);
  // console.log(`Input indicates an expected total of ${expectedTotalNodes} nodes.`); // Can be uncommented for debugging.
}

// Process each subsequent line from the input to build the graph.
for (const currentLineText of inputLines) {
  // Skip any empty lines to prevent parsing errors.
  if (currentLineText.trim().length === 0) {
    continue;
  }

  // Parse the current line: split by space and convert all parts to numbers.
  const parsedLineData = currentLineText.split(' ').map(Number);

  // The first element in the parsed data is the identifier of the source node for this line's edges.
  const sourceNodeIdentifier = parsedLineData[0];

  // Ensure the source node exists in our `graphNodes` map, initializing its properties if new.
  // All nodes initially have an infinite shortest distance and no known predecessor.
  if (!graphNodes[sourceNodeIdentifier]) {
    graphNodes[sourceNodeIdentifier] = {
      nodeIdentifier: sourceNodeIdentifier,
      shortestDistance: Infinity, // Standard JavaScript `Infinity` constant
      predecessorNode: null
    };
  }

  // Iterate through the rest of the parsed line data to find target nodes and their edge costs.
  // The format is typically: [sourceId, countOfEdges, target1Id, cost1, target2Id, cost2, ...]
  // We start from index 2 because the first two elements are sourceId and (potentially) edge count.
  for (let edgeDataIndex = 2; edgeDataIndex < parsedLineData.length; edgeDataIndex += 2) {
    const targetNodeIdentifier = parsedLineData[edgeDataIndex];
    const edgeCost = parsedLineData[edgeDataIndex + 1];

    // Ensure the target node also exists in `graphNodes`, even if it has no outgoing edges defined yet.
    if (!graphNodes[targetNodeIdentifier]) {
      graphNodes[targetNodeIdentifier] = {
        nodeIdentifier: targetNodeIdentifier,
        shortestDistance: Infinity,
        predecessorNode: null
      };
    }
    // Add the connection to our adjacency list using the helper function.
    establishConnection(edgeWeightsMap, sourceNodeIdentifier, targetNodeIdentifier, edgeCost);
  }
}

// --- Dijkstra's Algorithm Core Logic ---

// Initialize the starting node for Dijkstra's. The problem statement implies node with ID 0 is the source.
let hasSourceNodeBeenFound = false;
for (const nodeKey in graphNodes) {
  // It's good practice to use hasOwnProperty when iterating with `for...in` to avoid inherited properties.
  if (graphNodes.hasOwnProperty(nodeKey)) {
    const nodeInformation = graphNodes[nodeKey];
    if (nodeInformation.nodeIdentifier === 0) {
      nodeInformation.shortestDistance = 0; // Set the starting node's distance to zero.
      hasSourceNodeBeenFound = true;
      break; // Found the source node, no need to check further.
    }
  }
}

// Critical guard clause: if the designated source node (ID 0) is not present in the graph,
// the algorithm cannot proceed. Terminate the program with an error.
if (!hasSourceNodeBeenFound) {
  console.error("Critical Error: The designated source node (ID 0) was not found in the graph. Cannot compute shortest paths.");
  process.exit(1); // Exit with a non-zero status code indicating an error.
}

/**
 * Performs the 'relax' operation, attempting to update the shortest distance to a target vertex
 * if a shorter path is discovered via the current source vertex.
 * @param {object} sourceVertex - The node currently being processed (often denoted as 'u').
 * @param {object} targetVertex - A neighbor node connected to the source (often denoted as 'v').
 * @param {object} allEdgeWeights - The complete adjacency list containing all edge weights.
 */
function updateDistanceIfShorter(sourceVertex, targetVertex, allEdgeWeights) {
  // Calculate the weight of the direct path from source to target.
  const pathSegmentWeight = allEdgeWeights[sourceVertex.nodeIdentifier][targetVertex.nodeIdentifier];
  // Calculate the potential new shortest distance to the target via the source.
  const candidateNewDistance = sourceVertex.shortestDistance + pathSegmentWeight;

  // Introduce an intermediate variable for readability and clarity.
  const isPathThroughSourceShorter = targetVertex.shortestDistance > candidateNewDistance;

  // If a shorter path is found, update the target node's shortest distance and predecessor.
  if (isPathThroughSourceShorter) {
    targetVertex.shortestDistance = candidateNewDistance;
    targetVertex.predecessorNode = sourceVertex; // Record the predecessor for path reconstruction.
  }
}

/**
 * Implements Dijkstra's algorithm to find the shortest paths from the source node (ID 0)
 * to all other reachable nodes in the graph.
 * @param {object} allEdgeWeights - The global adjacency list representing the graph's connections.
 */
function computeShortestPaths(allEdgeWeights) {
  // Initialize a priority queue with all graph nodes.
  // This implementation uses a simple array and sorts it repeatedly, which is O(N log N) per extraction,
  // making the overall complexity O(E N log N) or O(N^2 log N), less efficient than a true min-priority queue (O(E log V)).
  const priorityQueue = Object.values(graphNodes);

  // Continue the algorithm as long as there are nodes remaining in the priority queue.
  while (priorityQueue.length > 0) {
    // Sort the queue in descending order of `shortestDistance`.
    // This way, `pop()` will retrieve the node with the minimum `shortestDistance`.
    priorityQueue.sort((nodeA, nodeB) => nodeB.shortestDistance - nodeA.shortestDistance);

    // Extract the node with the smallest `shortestDistance` from the queue.
    const currentProcessingNode = priorityQueue.pop();

    // Early exit condition: If the extracted node has an infinite distance, it means
    // it's unreachable from the source. Since Dijkstra processes nodes in increasing
    // order of distance, all subsequent nodes in the queue will also be unreachable
    // or have distances greater than or equal to infinity, so we can stop.
    if (currentProcessingNode.shortestDistance === Infinity) {
        break;
    }

    // Check if the current node has any outgoing edges defined in the adjacency list.
    if (allEdgeWeights[currentProcessingNode.nodeIdentifier]) {
      // Iterate over all neighbors of the current node.
      for (const neighborIdString in allEdgeWeights[currentProcessingNode.nodeIdentifier]) {
        // Convert the string key (neighbor ID) back to a number.
        const neighborId = Number(neighborIdString);
        // Retrieve the full node object for the neighbor from `graphNodes`.
        const neighborNodeObject = graphNodes[neighborId];

        // Apply the relaxation step to update distances for the neighbor.
        updateDistanceIfShorter(currentProcessingNode, neighborNodeObject, allEdgeWeights);
      }
    }
  }
}

// --- Execution and Final Output ---

// Execute Dijkstra's algorithm to calculate the shortest paths from node 0.
computeShortestPaths(edgeWeightsMap);

// Print a header for the results.
console.log("--- Shortest Path Calculation Results ---");

// Iterate through all nodes in the graph and print their final shortest distances.
Object.entries(graphNodes).forEach(([nodeIdentifierKey, nodeData]) => {
  const finalCalculatedDistance = nodeData.shortestDistance;
  const outputResult = finalCalculatedDistance === Infinity
    ? `Node ${nodeIdentifierKey}: Unreachable` // Custom message for nodes that could not be reached.
    : `Node ${nodeIdentifierKey}: ${finalCalculatedDistance}`;
  console.log(outputResult);
});

// Print a footer for the results.
console.log("--- End of Path Computation ---");