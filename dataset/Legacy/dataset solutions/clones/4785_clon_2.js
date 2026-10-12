let vertexCount = 0; // Global variable to store the total number of vertices.
let edgeCount = 0;   // Global variable to store the total number of edges.

// This array will hold the graph's edge information, where each element is an array [source, destination, weight].
let edgeList = [];

// This array is designated for storing shortest path calculations or related data.
let shortestPaths = [];

// This array serves as a memoization structure, possibly to track visited routes or path segments.
let routeMemory = [];

/**
 * Recursively explores a path from a starting node to an ending node,
 * summing direct edge costs along a specific sequence.
 * @param {number} startNode - The current node from which to begin the path segment.
 * @param {number} endNode - The target node for the path.
 * @returns {number} The cumulative cost of the path segment.
 */
function explorePath(startNode, endNode) {
  // Base condition: If the current node is the destination, the cost for this segment is zero.
  if (startNode === endNode) {
    return 0;
  }
  // Recursive step: Calculate the direct cost from startNode to endNode,
  // then add the cost of exploring the path from the next sequential node (startNode + 1) to endNode.
  return findDirectEdgeCost(startNode, endNode) + explorePath(startNode + 1, endNode);
}

/**
 * Searches the global edge list for a direct connection between two specified nodes
 * and returns the associated cost.
 * @param {number} nodeA - The source node.
 * @param {number} nodeB - The destination node.
 * @returns {number} The weight of the direct edge from nodeA to nodeB, or 0 if no such direct edge is found.
 */
function findDirectEdgeCost(nodeA, nodeB) {
  let directCost = 0; // Initialize the cost for a direct edge.
  // Iterate through the `edgeList` to find a matching edge.
  for (let edgeIndex = 0; edgeIndex < vertexCount; edgeIndex++) {
    // Check if the current edge's source and destination match the input nodes.
    if (edgeList[edgeIndex][0] === nodeA && edgeList[edgeIndex][1] === nodeB) {
      directCost = edgeList[edgeIndex][2]; // If a match is found, retrieve its weight.
      break; // Exit the loop as the direct edge has been found.
    }
  }
  return directCost; // Return the cost of the direct edge.
}

/**
 * The primary function responsible for parsing input data, initializing graph structures,
 * and orchestrating the pathfinding process.
 * @param {string} rawInputData - The complete input string, typically from standard input.
 */
function processGraphData(rawInputData) {
  // Divide the raw input into an array of lines.
  let inputLines = rawInputData.split("\n");

  // Parse the first line to extract the number of vertices and edges.
  let graphDimensions = inputLines[0].split(" ");
  vertexCount = Number.parseInt(graphDimensions[0]); // Assign N from input.
  edgeCount = Number.parseInt(graphDimensions[1]);   // Assign M from input.

  // Re-initialize the edge list to ensure it's empty before population.
  edgeList = [];
  // Populate the `edgeList` with edge data from subsequent input lines.
  for (let lineIndex = 1; lineIndex <= edgeCount; lineIndex++) {
    let currentEdgeParts = inputLines[lineIndex].split(" ");
    // Convert string components of an edge into numerical values.
    let parsedEdgeData = currentEdgeParts.map(component => Number.parseInt(component));
    edgeList.push(parsedEdgeData); // Add the processed edge to the list.
  }

  // Prepare the `shortestPaths` array for path storage.
  shortestPaths = [];
  // Initialize `shortestPaths` with placeholder entries for all unique node pairs (i, j) where i < j.
  for (let nodeIdx = 1; nodeIdx <= vertexCount; nodeIdx++) {
    for (let innerNodeIdx = 1; innerNodeIdx <= vertexCount; innerNodeIdx++) {
      if (nodeIdx !== innerNodeIdx && nodeIdx < innerNodeIdx) {
        shortestPaths.push([nodeIdx, innerNodeIdx, 0]); // Each entry is [source, destination, initial_cost].
      }
    }
  }

  // Assign the initialized `shortestPaths` array to `routeMemory`.
  routeMemory = shortestPaths;

  /*
   * This section contains the main algorithm logic.
   * The objective is to determine the most efficient path between any two distinct vertices (A to B)
   * and record this information within the `shortestPaths` structure.
   * `routeMemory` is intended to log the specific paths utilized.
   * The final step, not fully implemented in the original, would involve counting paths
   * that remain at their initial "0" state in `routeMemory`.
   */

  // Iterate through all possible unique pairs of nodes (outerNode, innerNode) where outerNode is less than innerNode.
  for (let outerNode = 1; outerNode <= vertexCount; outerNode++) {
    for (let innerNode = 1; innerNode <= vertexCount; innerNode++) {
      if (outerNode !== innerNode && outerNode < innerNode) {
        // Execute the path exploration function for the current node pair.
        let calculatedPathValue = explorePath(outerNode, innerNode);

        // Output diagnostic information to the console, preserving original string literals.
        console.log("i=", outerNode, "j=", innerNode, "の最短値は");
        console.log("計算値=", calculatedPathValue);
        console.log("パラメータ=", findDirectEdgeCost(outerNode, innerNode));
        // The original code included a commented-out line for updating shortestPaths,
        // which is omitted here to maintain strict behavioral equivalence.
        // shortestPaths[outerNode][innerNode] = Math.min(calculatedPathValue, findDirectEdgeCost(outerNode, innerNode));
      }
    }
  }
}

// Invoke the main processing function, reading input from the standard input stream.
processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
