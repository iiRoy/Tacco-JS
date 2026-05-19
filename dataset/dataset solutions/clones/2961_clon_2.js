console.log(function(inputData) {
  // This function processes graph data from a string input to determine node colors.
  // The first line of input specifies the number of nodes (nodeCount).
  // Subsequent lines describe edges, each with two connected nodes and an edge weight.
  const [[nodeCount], ...tempLines] = inputData.trim().split('\n').map(rowStr => rowStr.split(' ').map(valStr => valStr | 0));

  // Initialize an adjacency list to represent the graph.
  // Each element in the list corresponds to a node and contains an array of its neighbors.
  // For each neighbor, we store its index and the parity (0 or 1) of the edge weight.
  const adjacencyList = Array.from({
    length: nodeCount
  }, () => []);

  // Populate the adjacency list by iterating through the edge descriptions.
  // Node indices are adjusted to be 0-based (from 1-based in input).
  // The graph is undirected, so each edge is added to both connected nodes' lists.
  for (let idx = 0; idx < nodeCount - 1; idx++) {
    const [nodeA, nodeB, edgeWeight] = tempLines[idx];
    adjacencyList[nodeA - 1].push([nodeB - 1, edgeWeight & 1]);
    adjacencyList[nodeB - 1].push([nodeA - 1, edgeWeight & 1]);
  }

  // Create an array to store the assigned color for each node.
  // Initially, all nodes are marked as uncolored (NaN).
  const nodeColors = Array.from({
    length: nodeCount
  }, () => NaN);

  // Start a Depth-First Search (DFS) from the first node (index 0).
  // Assign the starting node an initial color (e.g., 0).
  nodeColors[0] = 0;
  const dfsStack = [0]; // The stack holds nodes to be visited.

  // Perform the DFS traversal to color all reachable nodes.
  // The coloring rule depends on the parity of the edge weight.
  while (dfsStack.length > 0) {
    const currentNode = dfsStack.pop(); // Retrieve the next node to process.

    // Iterate through all neighbors of the current node.
    for (const [neighborNode, weightParity] of adjacencyList[currentNode]) {
      // If the neighbor has already been colored, skip it as it's already processed.
      if (isFinite(nodeColors[neighborNode])) {
        continue;
      }

      // If the neighbor is uncolored, add it to the stack for future processing.
      dfsStack.push(neighborNode);

      // Determine the neighbor's color based on the edge weight parity:
      // If weightParity is 1 (odd), the neighbor's color is the opposite of the current node's color.
      // If weightParity is 0 (even), the neighbor's color is the same as the current node's color.
      if (weightParity === 1) {
        nodeColors[neighborNode] = (~nodeColors[currentNode]) & 1; // Bitwise NOT and AND 1 effectively flips 0 to 1 and 1 to 0.
      } else {
        nodeColors[neighborNode] = nodeColors[currentNode];
      }
    }
  }

  // Return the final array of node colors, with each color separated by a newline character.
  return nodeColors.join('\n');
}(require('fs').readFileSync('/dev/stdin', 'utf8')));
