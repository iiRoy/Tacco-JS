'use strict';

// A large prime modulus used for calculations to prevent overflow
const primeModulus = 1e9 + 7;

/**
 * Performs a Depth-First Search (DFS) on the graph to calculate two values for each subtree:
 * 1. The number of ways to color the subtree such that the current node is NOT colored.
 * 2. The number of ways to color the subtree such that the current node IS colored.
 *
 * @param {number} currentNode The identifier of the node currently being processed.
 * @param {Array<Array<number>>} adjacencyMap The graph's adjacency list representation.
 * @param {Array<number>} seenNodes An array tracking visited nodes (1 for visited, 0 for not).
 * @returns {Array<number>} A pair of integers [ways_if_current_not_colored, ways_if_current_colored].
 */
function traverseGraph(currentNode, adjacencyMap, seenNodes) {
  // Initialize the result pair for the subtree rooted at 'currentNode'.
  // If 'currentNode' is not colored, there's 1 way (it's not colored).
  // If 'currentNode' is colored, there's 1 way (it's colored).
  let resultPair = [1, 1];

  // Iterate through all adjacent nodes (neighbors) of the current node.
  for (let idx = 0; idx < adjacencyMap[currentNode].length; idx++) {
    const neighborNode = adjacencyMap[currentNode][idx];

    // Check if the neighbor has not been visited yet to prevent cycles in an undirected graph traversal.
    if (!seenNodes[neighborNode]) {
      // Mark the neighbor as visited before making a recursive call.
      seenNodes[neighborNode] = 1;

      // Recursively call traverseGraph for the unvisited neighbor.
      const childResult = traverseGraph(neighborNode, adjacencyMap, seenNodes);

      // Update the resultPair for 'currentNode' based on the child's results.
      // If 'currentNode' is NOT colored (resultPair[0]):
      //   Its children can either be colored or not colored.
      //   So, we multiply by the sum of childResult[0] (child not colored) and childResult[1] (child colored).
      resultPair[0] = (resultPair[0] * (childResult[0] + childResult[1])) % primeModulus;

      // If 'currentNode' IS colored (resultPair[1]):
      //   Its children MUST NOT be colored (due to coloring rules).
      //   So, we multiply by childResult[0] (child not colored).
      resultPair[1] = (resultPair[1] * childResult[0]) % primeModulus;
    }
  }
  // Return the computed pair of ways for the subtree rooted at 'currentNode'.
  return resultPair;
}

/**
 * Constructs an adjacency list representation of a graph from a list of edges.
 *
 * @param {number} nodeCount The total number of nodes in the graph.
 * @param {Array<Array<number>>} edgeList An array where each inner array represents an edge [source, destination].
 * @returns {Array<Array<number>>} The adjacency list, where graphStructure[i] contains an array of neighbors of node i.
 */
function buildAdjacencyList(nodeCount, edgeList) {
  // Initialize an adjacency list. Nodes are 1-indexed, so we create an array of size nodeCount + 1.
  // Each element is initialized as an empty array to store neighbors.
  const graphStructure = new Array(nodeCount + 1).fill(null).map(() => []);

  // Iterate through each edge in the provided edge list.
  for (let edgeIndex = 0; edgeIndex < edgeList.length; edgeIndex++) {
    const sourceNode = edgeList[edgeIndex][0];
    const destinationNode = edgeList[edgeIndex][1];

    // Add bidirectional connections for an undirected graph.
    graphStructure[sourceNode].push(destinationNode);
    graphStructure[destinationNode].push(sourceNode);
  }
  return graphStructure;
}

/**
 * Calculates the total number of valid colorings for the given graph.
 *
 * @param {number} nodeCount The total number of nodes in the graph.
 * @param {Array<Array<number>>} edgeList The list of edges defining the graph.
 * @returns {number} The total count of valid colorings, modulo primeModulus.
 */
function calculateSolution(nodeCount, edgeList) {
  // First, convert the edge list into an adjacency list for efficient traversal.
  const adjacencyMap = buildAdjacencyList(nodeCount, edgeList);

  // Initialize an array to keep track of visited nodes during the DFS traversal.
  // Nodes are 1-indexed, so the array size is nodeCount + 1, filled with 0s (unvisited).
  const seenNodes = new Array(nodeCount + 1).fill(0);

  // Start the DFS traversal from node 1 (assuming the graph is connected and 1-indexed).
  // Mark the starting node as visited before the initial recursive call.
  seenNodes[1] = 1;
  const finalResult = traverseGraph(1, adjacencyMap, seenNodes);

  // The total number of ways to color the entire graph is the sum of:
  // 1. Ways where node 1 is not colored (finalResult[0]).
  // 2. Ways where node 1 is colored (finalResult[1]).
  // The sum is taken modulo primeModulus.
  return (finalResult[0] + finalResult[1]) % primeModulus;
}

/**
 * Main function to handle input parsing, problem solving, and output printing.
 *
 * @param {string} rawData The raw input string read from standard input.
 */
function processInput(rawData) {
  // Split the raw input string into an array of lines.
  const inputLines = rawData.split("\n");

  // Parse the number of nodes from the first line of input.
  const nodeCount = parseInt(inputLines[0], 10);

  // Parse the edge list from the remaining lines.
  // Each line is split by space, and its parts are converted to integers.
  const edgeList = inputLines.slice(1).map(lineStr =>
    lineStr.split(' ').map(numStr => parseInt(numStr, 10))
  );

  // Calculate the final answer using the core solution logic.
  const finalAnswer = calculateSolution(nodeCount, edgeList);

  // Print the computed result to standard output.
  console.log(finalAnswer);
}

// Read the entire content of standard input and pass it to the processing function.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
