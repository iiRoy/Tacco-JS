'use strict'; // Enforce strict mode for better code quality and error handling

// Define a large prime number for modulo arithmetic, commonly used in combinatorial problems
var primeModulo = 1e9 + 7;

/**
 * Executes a Depth First Search (DFS) traversal on the graph to calculate specific counts.
 * This function computes two values for each subtree rooted at 'currentNode':
 * 1. The number of ways to select nodes such that 'currentNode' itself is chosen.
 * 2. The number of ways to select nodes such that 'currentNode' is NOT chosen.
 *
 * @param {number} currentNode - The identifier of the node currently being processed.
 * @param {Array<Array<number>>} adjacencyMap - The graph represented as an adjacency list.
 * @param {Array<number>} nodeVisited - An array indicating whether a node has been visited (1 for visited, 0 for not).
 * @returns {Array<number>} A pair of integers [waysIfCurrentSelected, waysIfCurrentNotSelected] for the subtree.
 */
function traverseGraph(currentNode, adjacencyMap, nodeVisited) {
  // Initialize the result pair for the current node's subtree.
  // The first element (index 0) is for when 'currentNode' is selected.
  // The second element (index 1) is for when 'currentNode' is NOT selected.
  var resultPair = [1, 1];

  // Iterate through all adjacent nodes (neighbors) of the 'currentNode'
  for (var idx = 0; idx < adjacencyMap[currentNode].length; idx++) {
    var neighborNode = adjacencyMap[currentNode][idx];

    // Check if the neighbor has not been visited yet to prevent infinite loops in undirected graphs
    if (!nodeVisited[neighborNode]) {
      // Mark the neighbor as visited before making the recursive call
      nodeVisited[neighborNode] = 1;

      // Recursively call traverseGraph for the neighbor to get its subtree's results
      var childResult = traverseGraph(neighborNode, adjacencyMap, nodeVisited);

      // Update the first element of 'resultPair' (ways if 'currentNode' is selected):
      // If 'currentNode' is selected, its child 'neighborNode' can either be selected or not selected.
      // So, we multiply by the sum of childResult[0] (child selected) and childResult[1] (child not selected).
      resultPair[0] = (resultPair[0] * (childResult[0] + childResult[1])) % primeModulo;

      // Update the second element of 'resultPair' (ways if 'currentNode' is NOT selected):
      // If 'currentNode' is NOT selected, its child 'neighborNode' MUST be selected.
      // So, we multiply by childResult[0] (child selected).
      resultPair[1] = (resultPair[1] * childResult[0]) % primeModulo;
    }
  }
  // Return the computed result pair for the subtree rooted at 'currentNode'
  return resultPair;
}

/**
 * Constructs an adjacency list representation of an undirected graph from a list of edges.
 *
 * @param {number} nodeCount - The total number of nodes in the graph (1-indexed).
 * @param {Array<Array<number>>} edgeList - An array where each inner array represents an edge [source, destination].
 * @returns {Array<Array<number>>} The adjacency list, where graphStructure[i] contains neighbors of node i.
 */
function buildAdjacencyList(nodeCount, edgeList) {
  // Initialize an array of empty arrays. The size is nodeCount + 1 to accommodate 1-indexed nodes.
  var graphStructure = new Array(nodeCount + 1).fill(0).map(_ => new Array());

  // Iterate through each edge in the provided edge list
  for (var edgeIndex = 0; edgeIndex < edgeList.length; edgeIndex++) {
    var sourceNode = edgeList[edgeIndex][0];
    var destinationNode = edgeList[edgeIndex][1];

    // For an undirected graph, add the connection in both directions
    graphStructure[sourceNode].push(destinationNode);
    graphStructure[destinationNode].push(sourceNode);
  }
  return graphStructure;
}

/**
 * The primary function to orchestrate graph processing.
 * As per the original code, the DFS calculation is commented out,
 * and this function currently returns a fixed value.
 *
 * @param {number} nodeCount - The total number of nodes in the graph.
 * @param {Array<Array<number>>} edgeList - The list of edges defining the graph.
 * @returns {number} The result of the graph processing (currently 0, matching original behavior).
 */
function processGraph(nodeCount, edgeList) {
  // First, construct the adjacency list from the given node count and edges
  var adjacencyGraph = buildAdjacencyList(nodeCount, edgeList);

  // The following lines are commented out in the original source code.
  // They represent the intended logic for calling the DFS function,
  // but are currently inactive.
  // var nodeVisitedStatus = new Array(nodeCount + 1).fill(0); // Initialize visited array
  // nodeVisitedStatus[1] = 1; // Mark the starting node (e.g., node 1) as visited
  // var finalResult = traverseGraph(1, adjacencyGraph, nodeVisitedStatus); // Perform DFS

  // In accordance with the original code's behavior, this function returns 0.
  return 0;
}

/**
 * The main entry point of the program. It handles reading input, parsing it,
 * calling the graph processing function, and printing the final output.
 *
 * @param {string} rawData - The raw string input read from standard input.
 */
function entryPoint(rawData) {
  // Split the entire input string into an array of individual lines
  var inputLines = rawData.split("\n");

  // Parse the first line to get the total number of nodes (N)
  var nodeCount = parseInt(inputLines[0]);

  // Process the remaining lines to extract the edge list.
  // Each line is split by space, and each part is converted to an integer.
  var edgeList = inputLines.slice(1).map(lineStr => lineStr.split(' ').map(edgeVal => parseInt(edgeVal)));

  // Call the graph processing function with the parsed node count and edge list
  var finalAnswer = processGraph(nodeCount, edgeList);

  // Print the computed final answer to the console
  console.log(finalAnswer);
}

// Read the entire content of standard input synchronously using Node.js 'fs' module,
// decode it as UTF-8, and then pass it to the entryPoint function.
entryPoint(require('fs').readFileSync('/dev/stdin', 'utf8'));
