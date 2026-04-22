'use strict' // Enforce strict parsing and error handling in the script.

const PRIME_MOD = 1_000_000_007 // A large prime number used for modulo operations, preventing integer overflow.

/**
 * Performs a Depth-First Search (DFS) on the graph to compute a specific value.
 * This function recursively explores connected components.
 *
 * @param {number} currentNodeId   The identifier of the current node being visited.
 * @param {Array<Array<number>>} adjacencyMap An adjacency list representation of the graph.
 * @param {Array<number>} visitedNodes A boolean-like array indicating if a node has been visited (1 for visited, 0 for not).
 * @returns {Array<number>} An array containing two computed values based on the traversal.
 */
function depthFirstSearch(currentNodeId, adjacencyMap, visitedNodes) {

  // Initialize a pair of results for the current node's subtree.
  let resultsPair = [1, 1]

  // Iterate over all neighbors of the current node.
  for (let k = 0; k < adjacencyMap[currentNodeId].length; ++k) {
    const neighborId = adjacencyMap[currentNodeId][k]

    // If the neighbor has not been visited yet, perform a recursive DFS call.
    if (!visitedNodes[neighborId]) {
      visitedNodes[neighborId] = 1 // Mark the neighbor as visited.

      // Recursively call DFS for the unvisited neighbor.
      const traversalOutput = depthFirstSearch(neighborId, adjacencyMap, visitedNodes)

      // Update the first result component using values from the subtree.
      resultsPair[0] = (resultsPair[0] * (traversalOutput[0] + traversalOutput[1])) % PRIME_MOD

      // Update the second result component using values from the subtree.
      resultsPair[1] = (resultsPair[1] * traversalOutput[0]) % PRIME_MOD
    }
  }

  // Return the computed pair of results for this subtree.
  return resultsPair
}

/**
 * Constructs an adjacency list representation of a graph from a list of edges.
 *
 * @param {number} nodeCount The total number of nodes in the graph.
 * @param {Array<Array<number>>} edgeData An array of arrays, where each inner array represents an edge [source, destination].
 * @returns {Array<Array<number>>} An adjacency list where each index corresponds to a node, and its value is an array of its neighbors.
 */
function buildAdjacencyStructure(nodeCount, edgeData) {

  // Create an array of empty arrays to represent the adjacency list.
  // The size is nodeCount + 1 to accommodate 1-indexed node IDs.
  let connectionMap = Array.from({ length: nodeCount + 1 }, () => [])

  // Process each edge in the input data.
  for (let j = 0; j < edgeData.length; ++j) {
    const sourceNode = edgeData[j][0]      // Extract the source node from the current edge.
    const destinationNode = edgeData[j][1] // Extract the destination node from the current edge.

    // Add the destination to the source's adjacency list (undirected graph).
    connectionMap[sourceNode].push(destinationNode)

    // Add the source to the destination's adjacency list (undirected graph).
    connectionMap[destinationNode].push(sourceNode)
  }

  return connectionMap // Return the complete adjacency list.
}

/**
 * The primary function to process the graph problem.
 * (Note: The original implementation was incomplete, returning 0 directly.
 * This version maintains that structure, with the core logic commented out
 * to match the original's behavior and statement count.)
 *
 * @param {number} numNodes The total number of nodes in the graph.
 * @param {Array<Array<number>>} edges The list of edges defining connections between nodes.
 * @returns {number} A placeholder value, as the original logic was commented out.
 */
function processGraph(numNodes, edges) {
  const graphConnections = buildAdjacencyStructure(numNodes, edges)

  // A boolean array to track visited nodes during traversal.
  // let visitedFlags = new Array(numNodes + 1).fill(0)

  // Mark the initial node (typically node 1) as visited before starting DFS.
  // visitedFlags[1] = 1

  // Execute the depth-first search from node 1.
  // const finalOutcome = depthFirstSearch(1, graphConnections, visitedFlags)

  // The problem's actual solution would likely involve returning something based on 'finalOutcome'.
  // However, mirroring the original, we return 0.
  return 0
}

/**
 * Main entry point for the program, handling input parsing and execution orchestration.
 *
 * @param {string} rawInputText The raw string input read from stdin.
 */
function orchestrateExecution(rawInputText) {
  const dataLines = rawInputText.split('\n') // Split the input into individual lines.

  // Parse the number of vertices from the first line.
  const numberOfVertices = parseInt(dataLines[0])

  // Parse the edges from the remaining lines. Each line is split into two integers.
  const graphEdges = dataLines.slice(1).map(lineText =>
    lineText.split(' ').map(elementStr => parseInt(elementStr))
  )

  // Call the graph processing function with the parsed data.
  const computationalResult = processGraph(numberOfVertices, graphEdges)

  // Output the final result to the console.
  console.log(computationalResult)
}

// Read input from standard input and pass it to the main execution function.
orchestrateExecution(require('node:fs').readFileSync('/dev/stdin', 'utf8'))