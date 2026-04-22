'use strict'; // Enable strict mode for better error handling and cleaner code

// A large prime number used for modulo operations to prevent integer overflow.
// This constant ensures results stay within a manageable range for calculations.
const primeDivisor = 1000000007;

/**
 * Performs a Depth-First Search (DFS) traversal on the graph.
 * It calculates two values for each subtree:
 *   - The first value (index 0) represents the number of ways to select nodes
 *     such that the current node is NOT selected, and its children are processed.
 *   - The second value (index 1) represents the number of ways to select nodes
 *     such that the current node IS selected, and its children are processed.
 *
 * @param {number} currentVertex - The identifier of the node currently being visited.
 * @param {Array<Array<number>>} graphNeighbors - The adjacency list representing the graph structure.
 * @param {Array<boolean>} visitedState - An array tracking which nodes have already been visited.
 * @returns {Array<number>} A pair of numbers [waysIfCurrentNotSelected, waysIfCurrentSelected].
 */
function traverseGraph(currentVertex, graphNeighbors, visitedState) {
  // Initialize the result pair for the current node.
  // [1, 1] means:
  // - If currentVertex is NOT selected, there's 1 way (no children yet considered).
  // - If currentVertex IS selected, there's 1 way (no children yet considered).
  const traversalResult = [1, 1];

  // Iterate over all neighbors of the current vertex.
  for (let neighborIdx = 0; neighborIdx < graphNeighbors[currentVertex].length; neighborIdx += 1) {
    const adjacentNode = graphNeighbors[currentVertex][neighborIdx];

    // If the neighbor has not been visited yet, perform a recursive DFS call.
    if (!visitedState[adjacentNode]) {
      visitedState[adjacentNode] = true; // Mark the neighbor as visited before recursion.

      // Recursively get the results for the child subtree.
      const childResult = traverseGraph(adjacentNode, graphNeighbors, visitedState);

      // Update the first value (current node NOT selected):
      // If current node is NOT selected, its children can either be selected or not selected.
      // So, we multiply by the sum of child's results (both cases).
      traversalResult[0] = (traversalResult[0] * (childResult[0] + childResult[1])) % primeDivisor;

      // Update the second value (current node IS selected):
      // If current node IS selected, its children CANNOT be selected.
      // So, we multiply by the child's 'not selected' result.
      traversalResult[1] = (traversalResult[1] * childResult[0]) % primeDivisor;
    }
  }

  // Return the computed pair of results for the current subtree.
  return traversalResult;
}

/**
 * Constructs an adjacency list representation of a graph from a list of edges.
 * The graph is undirected, so each edge adds connections in both directions.
 *
 * @param {number} vertexCount - The total number of nodes in the graph.
 * @param {Array<Array<number>>} edgeList - An array of arrays, where each inner array [u, v] represents an edge between node u and node v.
 * @returns {Array<Array<number>>} The adjacency list, where adjacencyStructure[i] is an array of neighbors of node i.
 */
function buildGraphAdjacency(vertexCount, edgeList) {
  // Initialize an adjacency list with 'vertexCount + 1' empty arrays.
  // We use +1 because nodes are typically 1-indexed.
  const adjacencyStructure = Array.from({
    length: vertexCount + 1
  }, () => []);

  // Iterate through each edge in the provided list.
  for (let edgePointer = 0; edgePointer < edgeList.length; edgePointer++) {
    const currentEdge = edgeList[edgePointer];
    const sourceNodeId = currentEdge[0]; // The first node in the edge pair.
    const destinationNodeId = currentEdge[1]; // The second node in the edge pair.

    // Add the destination node to the source node's adjacency list.
    adjacencyStructure[sourceNodeId].push(destinationNodeId);
    // Add the source node to the destination node's adjacency list (for undirected graph).
    adjacencyStructure[destinationNodeId].push(sourceNodeId);
  }
  return adjacencyStructure;
}

/**
 * Solves the main problem: calculating the total number of ways to select a subset of nodes
 * from a given tree such that no two selected nodes are adjacent.
 *
 * @param {number} nodeTotal - The total number of nodes in the graph (N).
 * @param {Array<Array<number>>} edgesInput - The list of edges connecting the nodes (E).
 * @returns {number} The total count of valid node selections modulo primeDivisor.
 */
function computeSolution(nodeTotal, edgesInput) {
  // First, build the adjacency list from the given node count and edges.
  const generatedAdjacency = buildGraphAdjacency(nodeTotal, edgesInput);

  // Initialize a tracker for visited nodes. All nodes start as unvisited (false).
  // Array size is nodeTotal + 1 to accommodate 1-indexed nodes.
  const nodeVisitedTracker = new Array(nodeTotal + 1).fill(false);

  // Mark the starting node (node 1) as visited before initiating the DFS.
  // This is crucial to prevent infinite recursion in the first call.
  nodeVisitedTracker[1] = true;

  // Perform the DFS traversal starting from node 1.
  // This returns the result pair [waysIf1NotSelected, waysIf1Selected] for the entire tree.
  const overallResult = traverseGraph(1, generatedAdjacency, nodeVisitedTracker);

  // The final answer is the sum of ways when the root is not selected and ways when the root is selected,
  // all taken modulo the prime divisor.
  return (overallResult[0] + overallResult[1]) % primeDivisor;
}

/**
 * The primary entry point for the program.
 * It reads input, parses it, calls the solution function, and prints the result.
 *
 * @param {string} rawInputData - The entire input as a single string.
 */
function processInputAndOutput(rawInputData) {
  // Split the input string into an array of lines.
  const inputStringLines = rawInputData.split("\n");

  // Parse the first line to get the total number of nodes (N).
  const totalNodesCount = parseInt(inputStringLines[0], 10);

  // Parse the remaining lines to get the edge data.
  // Each line is split by space, and elements are converted to integers.
  const parsedEdgesArray = inputStringLines.slice(1).map(currentLine =>
    currentLine.split(' ').map(elementString => parseInt(elementString, 10))
  );

  // Compute the final answer using the parsed N and E.
  const finalOutput = computeSolution(totalNodesCount, parsedEdgesArray);

  // Output the calculated result to the console.
  console.log(finalOutput);
}

// Execute the main function by reading input from standard input.
// This setup is common for competitive programming environments.
processInputAndOutput(require('fs').readFileSync('/dev/stdin', 'utf8'));