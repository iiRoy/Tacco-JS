(function executeProgram() {
  // Read all input from stdin, decode as UTF-8, remove leading/trailing whitespace, and split into an array of lines.
  const inputDataRows = require('fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

  // Parse the first line to get the number of nodes (nodeCount) and edges (edgeCount).
  const [nodeCount, edgeCount] = inputDataRows.shift().split(' ').map(Number);

  // Initialize an adjacency list structure for the graph.
  // Each element is an array representing the neighbors of a node.
  const adjacencyStructure = Array.from(Array(nodeCount), () => []);

  // This variable is declared but not used in the original code.
  // It's kept for structural equivalence.
  const distanceArray = [];

  let startNode, endNode; // Variables to hold node indices for edges.

  // Loop through the next 'edgeCount' lines to populate the adjacency list.
  for (let idx = 0; idx < edgeCount; idx++) {
    // Parse each line to get the two nodes connected by an edge.
    [startNode, endNode] = inputDataRows.shift().split(' ').map(Number);
    // Add edges to the adjacency list (undirected graph).
    adjacencyStructure[startNode].push(endNode);
    adjacencyStructure[endNode].push(startNode);
  }

  /**
   * Checks if there is a path between a source node and a target node using Breadth-First Search (BFS).
   * @param {number} sourceNodeId - The starting node's identifier.
   * @param {number} targetNodeId - The target node's identifier.
   * @returns {boolean} True if a path exists, false otherwise.
   */
  function pathExists(sourceNodeId, targetNodeId) {
    // Define states for nodes during BFS traversal.
    const UNVISITED = 0, VISITING = 1, VISITED = 2; // VISITED (BLACK) is not strictly used but kept for consistency.

    // Initialize the status of all nodes to UNVISITED.
    const nodeStatus = Array.from(adjacencyStructure, () => UNVISITED);

    // Initialize the BFS queue with the source node.
    let bfsQueue = [sourceNodeId];
    let currentNodeId, neighborNodeId; // Variables to hold node IDs during traversal.

    // Perform BFS traversal.
    while ((currentNodeId = bfsQueue.shift()) !== undefined) {
      // Iterate over all neighbors of the current node.
      for (let neighborIndex = 0; neighborIndex < adjacencyStructure[currentNodeId].length; neighborIndex++) {
        neighborNodeId = adjacencyStructure[currentNodeId][neighborIndex];

        // If the neighbor is the target node, a path is found.
        if (neighborNodeId === targetNodeId) {
          return true;
        }

        // If the neighbor has not been visited yet, mark it as VISITING and add to the queue.
        if (nodeStatus[neighborNodeId] === UNVISITED) {
          nodeStatus[neighborNodeId] = VISITING; // Mark as gray (visiting)
          bfsQueue.push(neighborNodeId);
        }
      }
    }
    // If the queue becomes empty and the target was not reached, no path exists.
    return false;
  }

  // Discard one line from the input, likely a separator or empty line before queries.
  inputDataRows.shift();

  // Process the remaining lines as queries.
  // For each query, determine if a path exists between the two specified nodes.
  // The result is 'yes' or 'no', joined by newlines for output.
  console.log(
    inputDataRows
      .map(queryLine => {
        // Parse the query line to get the two nodes for the path check.
        const [queryStart, queryEnd] = queryLine.split(' ').map(Number);
        // Call the pathExists function and return 'yes' or 'no'.
        return pathExists(queryStart, queryEnd) ? 'yes' : 'no';
      })
      .join('\n')
  );
})();
