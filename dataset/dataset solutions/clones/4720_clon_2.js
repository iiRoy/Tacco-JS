"use strict";

const processInput = (inputData) => {
  // Clean up the input string and split it into lines
  inputData = inputData.trim().split("\n");

  // Parse the number of nodes (N) and edges (M) from the first line
  const nodeCount = parseInt(inputData[0].split(" ")[0], 10);
  const edgeCount = parseInt(inputData[0].split(" ")[1], 10);

  // Extract edge information, converting string pairs to integer pairs
  const edgeList = inputData
    .slice(1, nodeCount + 1)
    .map((_item) => _item.split(" ").map((_val) => parseInt(_val, 10)));

  // Initialize an adjacency matrix for the graph
  // All connections are initially set to zero
  const adjacencyMatrix = [...Array(nodeCount)].map(() =>
    [...Array(nodeCount)].fill(0)
  );

  // Populate the adjacency matrix based on the provided edges
  // The graph is undirected, so set connections in both directions
  for (let edgeIndex in edgeList) {
    const sourceNode = edgeList[edgeIndex][0] - 1; // Adjust to 0-indexed
    const targetNode = edgeList[edgeIndex][1] - 1; // Adjust to 0-indexed

    adjacencyMatrix[sourceNode][targetNode] = 1;
    adjacencyMatrix[targetNode][sourceNode] = 1;
  }

  let pathCounter = 0; // Counter for valid paths

  // Depth-First Search (DFS) function to find all Hamiltonian paths
  const explorePaths = (currentNode, visitedNodes) => {
    // If all nodes have been visited, increment the path counter
    if (visitedNodes.every((status) => status === true)) {
      pathCounter++;
    }

    // Iterate through all possible neighbors of the current node
    for (let neighborIndex = 0; neighborIndex < nodeCount; neighborIndex++) {
      // Skip if there's no edge between current and neighbor, or if neighbor is already visited
      if (adjacencyMatrix[currentNode][neighborIndex] === 0) continue;
      if (visitedNodes[neighborIndex]) continue;

      // Mark the neighbor as visited
      visitedNodes[neighborIndex] = true;
      // Recursively call DFS for the neighbor
      explorePaths(neighborIndex, visitedNodes);
      // Backtrack: unmark the neighbor as visited for other path explorations
      visitedNodes[neighborIndex] = false;
    }

    return; // End of current path exploration branch
  };

  // Initialize the visited array for the DFS.
  // The starting node (node 0) is marked as visited.
  const initialVisitedState = [
    true,
    ...[...Array(nodeCount - 1)].map(() => false),
  ];
  // Start the DFS from node 0
  explorePaths(0, initialVisitedState);

  // Output the total count of valid paths
  console.log(pathCounter);
};

// Read input from stdin and pass it to the main processing function
processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
