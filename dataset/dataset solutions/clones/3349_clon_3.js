'use strict'

// A large prime number used for modulo arithmetic to prevent integer overflow.
const MODULO_CONSTANT = 1_000_000_007; // Renamed 'mod', changed to const, added comment, used numeric separator.

/**
 * Recursively explores the graph using Depth First Search to calculate specific metrics.
 * This function computes two values for the current subtree:
 * - The first value represents a product involving (sum of child's first and second values)
 * - The second value represents a product involving child's first value
 *
 * @param {number} currentNodeIdentifier - The ID of the node currently being visited.
 * @param {Array<Array<number>>} graphStructure - The adjacency list representation of the graph.
 * @param {Set<number>} visitedNodeTracker - A set keeping track of all nodes visited during the current DFS traversal.
 * @returns {Array<number>} An array containing two calculated values [val1, val2] for the current subtree.
 */
function exploreComponent(currentNodeIdentifier, graphStructure, visitedNodeTracker) {
  // Initialize result array for the current node.
  // The initial values (1, 1) are base cases for leaf nodes or isolated nodes.
  let accumulatedResults = [1, 1]; // Renamed 'ans', changed to let.

  // Iterate over all neighbors of the current node.
  for (const neighborId of graphStructure[currentNodeIdentifier]) { // Changed loop style.
    // Check if the neighbor has not been visited yet in this traversal path.
    if (!visitedNodeTracker.has(neighborId)) { // Changed 'visited' to Set, updated check.
      visitedNodeTracker.add(neighborId); // Mark neighbor as visited.
      
      // Recursively call exploreComponent for the unvisited neighbor.
      const childSubtreeResults = exploreComponent(neighborId, graphStructure, visitedNodeTracker); // Renamed 'res', changed to const.

      // Calculate new first component of accumulated results.
      // This involves the sum of the child's two results, multiplied by the current first result.
      const firstComponentUpdate = (accumulatedResults[0] * (childSubtreeResults[0] + childSubtreeResults[1])) % MODULO_CONSTANT; // Renamed, added intermediate variable, explicit modulo.
      
      // Calculate new second component of accumulated results.
      // This involves the child's first result, multiplied by the current second result.
      const secondComponentUpdate = (accumulatedResults[1] * childSubtreeResults[0]) % MODULO_CONSTANT; // Renamed, added intermediate variable, explicit modulo.

      accumulatedResults[0] = firstComponentUpdate; // Update the first result.
      accumulatedResults[1] = secondComponentUpdate; // Update the second result.
    }
  }
  return accumulatedResults; // Return the computed pair of values.
}

/**
 * Constructs an adjacency list representation of an undirected graph.
 *
 * @param {number} totalVertexCount - The total number of vertices in the graph (1-indexed).
 * @param {Array<Array<number>>} listOfEdges - An array where each element is a pair [source, destination] representing an edge.
 * @returns {Array<Array<number>>} The adjacency list, where graphData[i] is an array of neighbors of node i.
 */
function createGraphMap(totalVertexCount, listOfEdges) { // Renamed adjList, N, E.
  // Validate input: ensure vertex count is positive.
  if (totalVertexCount <= 0) {
    console.warn("Warning: totalVertexCount is non-positive. Returning empty graph.");
    return [];
  }

  // Initialize the adjacency list. Each node gets an empty array for its neighbors.
  // Array.from is used for cleaner initialization than fill().map().
  const graphData = Array.from({ length: totalVertexCount + 1 }, () => []); // Renamed 'list', changed to const, updated initialization.

  // Iterate through each edge in the provided list.
  for (let edgeIndex = 0; edgeIndex < listOfEdges.length; ++edgeIndex) { // Renamed 'i', changed to let, changed increment.
    const currentEdge = listOfEdges[edgeIndex]; // Added intermediate variable.
    const sourceNode = currentEdge[0]; // Renamed 'src'.
    const destinationNode = currentEdge[1]; // Renamed 'dest'.

    // Add bidirectional connections as it's an undirected graph.
    // Basic validation for node indices.
    if (sourceNode >= 1 && sourceNode <= totalVertexCount &&
        destinationNode >= 1 && destinationNode <= totalVertexCount) {
      graphData[sourceNode].push(destinationNode);
      graphData[destinationNode].push(sourceNode);
    } else {
      console.warn(`Skipping invalid edge: [${sourceNode}, ${destinationNode}]. Node indices must be between 1 and ${totalVertexCount}.`); // Added guard clause/validation.
    }
  }
  return graphData; // Return the constructed adjacency list.
}

/**
 * Orchestrates the graph construction and DFS traversal to compute the final desired metric.
 *
 * @param {number} totalNodesCount - The total number of nodes in the graph.
 * @param {Array<Array<number>>} incomingEdges - The list of edges defining the graph.
 * @returns {number} The final computed value after DFS, modulo MODULO_CONSTANT.
 */
function computeSolution(totalNodesCount, incomingEdges) { // Renamed solve, N, E.
  // Handle edge case for no nodes.
  if (totalNodesCount === 0) {
    return 0; // Or handle as an error, depending on requirements.
  }

  // Build the adjacency list representation of the graph.
  const graphRepresentation = createGraphMap(totalNodesCount, incomingEdges); // Renamed 'adj', changed to const.

  // Initialize a Set to keep track of visited nodes during DFS.
  // Using a Set offers better performance for lookups than an array for sparse graphs, and is a structural change.
  const visitedNodeSet = new Set(); // Renamed 'visited', changed to const, changed to Set.

  // Start the DFS traversal from node 1 (assuming 1-indexed nodes).
  // Node 1 is explicitly marked as visited before the initial DFS call.
  const startingNode = 1; // Added helper variable.
  visitedNodeSet.add(startingNode); // Mark the starting node as visited in the Set.

  // Perform the DFS traversal.
  const finalCalculationResults = exploreComponent(startingNode, graphRepresentation, visitedNodeSet); // Renamed 'res', changed to const.

  // The final answer is the sum of the two results from the root DFS call, modulo MODULO_CONSTANT.
  const overallResult = (finalCalculationResults[0] + finalCalculationResults[1]) % MODULO_CONSTANT; // Renamed, explicit modulo.

  return overallResult;
}

/**
 * Parses the raw input string into structured data (number of nodes and edges)
 * and then computes and prints the solution.
 *
 * @param {string} rawInputString - The complete input string from stdin.
 */
function processInputAndExecute(rawInputString) { // Renamed main, input.
  // Basic input validation: check if input is empty or null.
  if (!rawInputString || rawInputString.trim() === '') {
    console.error("Error: Empty input provided.");
    return;
  }

  // Split the input string into individual lines.
  const inputLines = rawInputString.split("\n"); // Renamed 'lines', changed to const.

  // Parse the number of vertices from the first line.
  // Use parseInt with radix for good practice.
  const numberOfVertices = parseInt(inputLines[0], 10); // Renamed 'N', changed to const, added radix.

  // Validate if N is a valid number.
  if (isNaN(numberOfVertices) || numberOfVertices < 0) {
    console.error("Error: Invalid number of vertices provided.");
    return;
  }

  // Parse the edges from the remaining lines.
  // Filter out any empty lines that might result from split.
  const parsedEdges = inputLines.slice(1) // Renamed 'E', changed to const.
                                .filter(line => line.trim() !== '') // Added filter for empty lines.
                                .map(line => {
                                  const edgeParts = line.split(' ');
                                  // Validate edge parts before parsing.
                                  if (edgeParts.length !== 2) {
                                    console.warn(`Skipping malformed edge line: "${line}". Expected 2 numbers.`);
                                    return null; // Return null for invalid lines.
                                  }
                                  const src = parseInt(edgeParts[0], 10);
                                  const dest = parseInt(edgeParts[1], 10);
                                  if (isNaN(src) || isNaN(dest)) {
                                    console.warn(`Skipping edge with non-numeric values: "${line}".`);
                                    return null;
                                  }
                                  return [src, dest];
                                })
                                .filter(edge => edge !== null); // Remove null entries from invalid lines.

  // Compute the final answer using the parsed data.
  const finalResultValue = computeSolution(numberOfVertices, parsedEdges); // Renamed 'ans', changed to const.

  // Output the result to the console.
  console.log(finalResultValue);
}

// Entry point: read input from stdin and execute the main processing function.
// Using 'require' directly for file system operations.
processInputAndExecute(require('fs').readFileSync('/dev/stdin', 'utf8'));