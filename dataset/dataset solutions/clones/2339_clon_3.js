'use strict'; // Enforce strict parsing and error handling for better code quality.

/**
 * Utility function to retrieve raw input from the standard input stream.
 * This is typically used in environments like competitive programming platforms.
 * @returns {string} The entire input content as a single string.
 */
function acquireSourceData() {
  // Utilizing the Node.js 'fs' module to synchronously read from /dev/stdin.
  return require("fs").readFileSync("/dev/stdin", "utf8");
}

/**
 * Represents a graph traversal utility, specifically designed for distance calculations
 * and managing graph connectivity. It uses an adjacency list internally.
 */
class GraphAnalyzer {
  // Private field to store the adjacency list. Keys are node IDs, values are Sets of connected nodes.
  #nodeConnections;
  // Private field for the total number of nodes in the graph.
  #totalNodes;

  /**
   * Constructs a new GraphAnalyzer instance, initializing its internal structures.
   * @param {number} numNodes - The total count of nodes expected in the graph.
   * @throws {Error} If the number of nodes is less than one.
   */
  constructor(numNodes) {
    if (numNodes < 1) {
      throw new Error("Graph construction requires at least one node. Provided: " + numNodes);
    }
    this.#totalNodes = numNodes;
    // Initialize an empty Map to store node connections. Using Map for keys (node IDs)
    // and Set for values (neighbors) ensures efficient lookups and uniqueness.
    this.#nodeConnections = new Map();
    // Pre-populate the map with empty sets for all nodes to ensure every node has an entry.
    for (let i = 1; i <= this.#totalNodes; ++i) {
      this.#nodeConnections.set(i, new Set());
    }
  }

  /**
   * Establishes an undirected edge (connection) between two specified nodes.
   * Basic validation is performed to ensure nodes are within the graph's bounds.
   * @param {number} nodeAlpha - The identifier of the first node.
   * @param {number} nodeBeta - The identifier of the second node.
   */
  establishConnection(nodeAlpha, nodeBeta) {
    // Validate that both nodes are within the acceptable range [1, #totalNodes].
    if (nodeAlpha < 1 || nodeAlpha > this.#totalNodes || nodeBeta < 1 || nodeBeta > this.#totalNodes) {
      // Log a warning for invalid connections rather than throwing, to allow partial processing.
      console.warn(`Warning: Attempted to connect invalid nodes (${nodeAlpha}, ${nodeBeta}). Skipping this edge.`);
      return;
    }
    // Add bidirectional connections to represent an undirected graph.
    this.#nodeConnections.get(nodeAlpha).add(nodeBeta);
    this.#nodeConnections.get(nodeBeta).add(nodeAlpha);
  }

  /**
   * Executes a Depth-First Search (DFS) traversal starting from a given node
   * to compute the shortest path distance from that node to all other reachable nodes.
   * @param {number} initialVertex - The node from which to start the distance calculation.
   * @param {number[]} distanceArray - An array (pre-initialized, e.g., with -1 for unvisited)
   *                                  where computed distances will be stored.
   * @param {number} [unvisitedMarker=-1] - The value used to indicate an unvisited node in `distanceArray`.
   */
  calculateDistances(initialVertex, distanceArray, unvisitedMarker = -1) {
    // Validate the starting vertex.
    if (initialVertex < 1 || initialVertex > this.#totalNodes) {
      console.error(`Error: Invalid initial vertex for distance calculation: ${initialVertex}.`);
      return;
    }

    // Inner recursive function that performs the actual DFS.
    const recursiveDFS = (currentVertex, parentVertex, currentDepth) => {
      // Assign the current depth (distance) to the current vertex.
      distanceArray[currentVertex] = currentDepth;

      // Iterate through all neighbors of the current vertex.
      // Using `for...of` provides a clean way to iterate over Set elements.
      for (const neighborVertex of this.#nodeConnections.get(currentVertex)) {
        // Only proceed if the neighbor has not been visited yet from this path,
        // or if the neighbor is not the immediate parent (to prevent going back).
        if (neighborVertex !== parentVertex) {
          // Recursively call DFS for the neighbor, incrementing the distance.
          recursiveDFS(neighborVertex, currentVertex, currentDepth + 1);
        }
      }
    };

    // Initiate the DFS. The initial vertex has no logical parent (-1) and a distance of 0.
    recursiveDFS(initialVertex, unvisitedMarker, 0);
  }

  /**
   * Retrieves the total count of nodes managed by this graph analyzer.
   * @returns {number} The total number of nodes.
   */
  getNodeCount() {
    return this.#totalNodes;
  }
}

/**
 * Main execution function responsible for orchestrating the graph processing logic.
 * It parses input, builds the graph, performs dual DFS traversals, and outputs a specific metric.
 * @param {string} rawInputContent - The complete input string obtained from standard input.
 */
function ProcessGraphData(rawInputContent) {
  // Define a constant to represent an unvisited or unreachable node in distance arrays.
  const UNREACHABLE_DISTANCE_VALUE = -1;

  // Normalize and split the raw input into individual lines.
  const allInputLines = rawInputContent.trim().split('\n');

  // Perform basic input validation: ensure there's at least one line.
  if (allInputLines.length === 0) {
    console.error("Critical Error: No input lines were provided. Exiting.");
    return;
  }

  // Parse the first line which contains the total node count (N), and the two starting nodes (U, V).
  const primaryGraphParams = allInputLines[0].split(' ').map(Number);

  // Validate the number of primary parameters.
  if (primaryGraphParams.length < 3) {
    console.error("Critical Error: Insufficient primary parameters (N, U, V). Expected 3, got:", primaryGraphParams.length);
    return;
  }

  // Destructure the parameters for clarity.
  const totalGraphNodes = primaryGraphParams[0];
  const firstStartingNode = primaryGraphParams[1];
  const secondStartingNode = primaryGraphParams[2];

  // Additional validation for node IDs: must be within valid range.
  if (firstStartingNode < 1 || firstStartingNode > totalGraphNodes || secondStartingNode < 1 || secondStartingNode > totalGraphNodes) {
    console.error(`Critical Error: Starting nodes (${firstStartingNode}, ${secondStartingNode}) are out of bounds for ${totalGraphNodes} nodes. Exiting.`);
    return;
  }

  // Instantiate the GraphAnalyzer to manage the graph structure.
  const graphStructure = new GraphAnalyzer(totalGraphNodes);

  // Extract the lines defining the edges (connections) in the graph.
  const edgeDefinitionLines = allInputLines.slice(1);

  // Optional validation: Check if the number of edge lines matches expected for a tree (N-1 edges).
  if (totalGraphNodes > 1 && edgeDefinitionLines.length !== (totalGraphNodes - 1)) {
      console.warn(`Warning: Expected ${totalGraphNodes - 1} edge definitions for ${totalGraphNodes} nodes, but detected ${edgeDefinitionLines.length}. This might not be a simple tree structure.`);
  }

  // Iterate over each line representing an edge and add it to the graph.
  for (const edgeLine of edgeDefinitionLines) {
    const currentEdgeNodes = edgeLine.split(' ').map(Number);
    // Ensure each edge line correctly specifies two nodes.
    if (currentEdgeNodes.length === 2) {
      graphStructure.establishConnection(currentEdgeNodes[0], currentEdgeNodes[1]);
    } else {
      console.warn(`Warning: Skipping malformed edge line "${edgeLine}". Expected two node identifiers.`);
    }
  }

  // Prepare two distinct arrays to store distances from each starting node.
  // Both arrays are initialized with UNREACHABLE_DISTANCE_VALUE to mark all nodes as unvisited.
  const distancesFromA = new Array(totalGraphNodes + 1).fill(UNREACHABLE_DISTANCE_VALUE);
  const distancesFromB = new Array(totalGraphNodes + 1).fill(UNREACHABLE_DISTANCE_VALUE);

  // Execute the first DFS traversal starting from 'firstStartingNode'.
  graphStructure.calculateDistances(firstStartingNode, distancesFromA, UNREACHABLE_DISTANCE_VALUE);
  // Execute the second DFS traversal starting from 'secondStartingNode'.
  graphStructure.calculateDistances(secondStartingNode, distancesFromB, UNREACHABLE_DISTANCE_VALUE);

  // Initialize a variable to track the maximum qualifying distance found.
  let greatestQualifyingDistance = 0; // Distances are non-negative, so 0 is a safe initial value.

  // Iterate through all possible node identifiers (from 1 up to totalGraphNodes)
  // to find the desired metric.
  for (let nodeId = 1; nodeId <= totalGraphNodes; ++nodeId) {
    const distanceToNodeFromA = distancesFromA[nodeId];
    const distanceToNodeFromB = distancesFromB[nodeId];

    // Check two conditions:
    // 1. The node must be reachable from both starting points (not UNREACHABLE_DISTANCE_VALUE).
    // 2. The node must be strictly closer to 'firstStartingNode' than to 'secondStartingNode'.
    if (distanceToNodeFromA !== UNREACHABLE_DISTANCE_VALUE &&
        distanceToNodeFromB !== UNREACHABLE_DISTANCE_VALUE &&
        distanceToNodeFromA < distanceToNodeFromB) {
      // If both conditions are met, update the maximum qualifying distance.
      greatestQualifyingDistance = Math.max(greatestQualifyingDistance, distanceToNodeFromA);
    }
  }

  // Output the final calculated maximum distance to the console.
  console.log(greatestQualifyingDistance);
}

// The script's entry point: acquire the data and then initiate processing.
ProcessGraphData(acquireSourceData());