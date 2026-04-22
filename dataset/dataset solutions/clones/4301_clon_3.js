'use strict';

// Global declarations for graph parameters and state
let nodeCount; // Total number of vertices in the graph
let edgeCount; // Total number of initial edges in the graph
let nodeStatus; // Array to track visited nodes during graph traversals
let connectionMatrix; // Adjacency matrix representing the graph's connections

/**
 * Executes a Depth First Search (DFS) traversal starting from a given node.
 * This function updates the global 'nodeStatus' array, marking nodes as reachable.
 * @param {number} currentNodeIndex - The 0-based index of the node from which to begin the traversal.
 */
const exploreConnections = (currentNodeIndex) => {
  // Defensive check: Ensure the provided node index is valid within the graph's bounds.
  // An invalid index would indicate an error or an attempt to access a non-existent node.
  if (currentNodeIndex < 0 || currentNodeIndex >= nodeCount) {
    return; // Exit if the node index is out of the expected range.
  }

  nodeStatus[currentNodeIndex] = true; // Mark the current node as visited/reachable.

  // Iterate through all potential neighbors of the current node.
  // The graph is represented by an adjacency matrix.
  for (let neighborIndex = 0; neighborIndex < nodeCount; ++neighborIndex) {
    // Determine if the neighbor has already been reached in the current traversal.
    const isNeighborAlreadyVisited = nodeStatus[neighborIndex];
    // Check if there is a direct edge connecting the current node to this neighbor.
    const hasDirectEdge = connectionMatrix[currentNodeIndex][neighborIndex];

    // If the neighbor is already visited OR there is no direct connection,
    // we skip this neighbor and proceed to the next one.
    if (isNeighborAlreadyVisited || !hasDirectEdge) {
      continue;
    }

    // If the neighbor is unvisited and directly connected, recursively call
    // exploreConnections to continue the DFS from this neighbor.
    exploreConnections(neighborIndex);
  }
};

/**
 * The primary function responsible for processing the graph input,
 * constructing the graph, and then identifying "bridges".
 * A bridge is defined as an edge whose removal increases the number of
 * connected components within the graph.
 * @param {string} rawInputData - The raw string input, typically from standard input.
 *                                It contains graph dimensions and edge definitions.
 */
function processGraphData(rawInputData) {
  // Clean and split the input string into individual lines.
  const inputLines = rawInputData.trim().split('\n');

  // The first line of input specifies the total number of nodes (vertices)
  // and the total number of edges initially present in the graph.
  const dimensions = inputLines[0].split(' ').map(Number);
  nodeCount = dimensions[0];
  edgeCount = dimensions[1];

  // Implement a guard clause for trivial graph cases.
  // Graphs with zero or one node cannot have any bridges.
  if (nodeCount <= 1) {
    console.log(0); // Output 0 bridges for trivial graphs.
    return; // Terminate execution as there's nothing more to process.
  }

  // Parse the lines defining the initial edges.
  // The original code used slice(1, -1), implying the last line might be ignored
  // (e.g., if it's an empty line or contains non-edge metadata).
  const initialEdges = inputLines.slice(1, -1).map(line => line.split(' ').map(Number));

  // Initialize the adjacency matrix.
  // It's a 2D array where connectionMatrix[i][j] is true if an edge exists between node i and node j.
  // All entries are initially set to false, indicating no connections.
  connectionMatrix = Array.from({ length: nodeCount }, () =>
    Array(nodeCount).fill(false)
  );

  // Populate the adjacency matrix based on the provided initial edges.
  // Since the graph is undirected, each edge (U, V) is represented by
  // setting both connectionMatrix[U][V] and connectionMatrix[V][U] to true.
  for (let k = 0; k < edgeCount; ++k) {
    const [nodeU, nodeV] = initialEdges[k]; // Destructure the two endpoints of an edge.
    // Adjust node numbers from 1-based (input) to 0-based (array indices).
    const indexU = nodeU - 1;
    const indexV = nodeV - 1;

    // Establish the bidirectional connection in the adjacency matrix.
    connectionMatrix[indexU][indexV] = true;
    connectionMatrix[indexV][indexU] = true;
  }

  // Initialize the 'nodeStatus' array. This array will be reset for each connectivity test.
  nodeStatus = Array(nodeCount).fill(false);

  let bridgeCounter = 0; // This variable will store the total number of bridges found.

  // The core logic: iterate through all possible unique edges in the graph.
  // By iterating 'c' from 'r + 1', we ensure each edge (r, c) is considered only once,
  // preventing redundant checks for (c, r) and thus eliminating the need for final division by 2.
  for (let r = 0; r < nodeCount; ++r) {
    for (let c = r + 1; c < nodeCount; ++c) {
      // Check if an actual edge exists between node 'r' and node 'c'.
      if (connectionMatrix[r][c]) {
        // Temporarily remove this specific edge from the graph.
        // This simulates its deletion to test its "bridge" property.
        connectionMatrix[r][c] = false;
        connectionMatrix[c][r] = false;

        // Reset the 'nodeStatus' array to false for all nodes.
        // This is crucial to ensure a fresh connectivity check after edge removal.
        nodeStatus.fill(false);

        // Perform a DFS traversal from an arbitrary starting node (here, node 0).
        // This checks if the graph remains fully connected after the edge removal.
        const fixedTraversalStartNode = 0;
        exploreConnections(fixedTraversalStartNode);

        // After the DFS, check if all nodes were successfully visited.
        // If not all nodes are true in 'nodeStatus', it means the graph
        // has become disconnected, indicating the removed edge was a bridge.
        const isGraphDisconnectedAfterRemoval = !nodeStatus.every(status => status === true);

        if (isGraphDisconnectedAfterRemoval) {
          bridgeCounter++; // Increment the counter if a bridge is identified.
        }

        // Restore the removed edge to its original state in the adjacency matrix.
        // This is essential for correctly testing subsequent edges.
        connectionMatrix[r][c] = true;
        connectionMatrix[c][r] = true;
      }
    }
  }

  // Output the final count of bridges found in the graph.
  console.log(bridgeCounter);
}

// Read the entire standard input as a UTF-8 string and pass it to the main processing function.
processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));