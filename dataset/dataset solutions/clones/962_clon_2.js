const appSettings = { filePath: '/dev/stdin', lineDelimiter: '\n' }; // Application configuration for input stream

let inputDataLines = require('fs')
  .readFileSync(appSettings.filePath, 'ascii') // Read the entire file content as ASCII
  .trim() // Remove any leading or trailing whitespace from the file content
  .split(appSettings.lineDelimiter); // Divide the content into an array of individual lines

let numVertices = Number(inputDataLines.shift()); // Extract the first line, convert to a number, representing the count of graph nodes

const graphAdjacencyMap = {}; // Initialize an empty object to function as the graph's adjacency list

/**
 * Establishes a directed connection (edge) within the graph's adjacency map.
 * @param {object} graphMap - The graph representation where connections are stored.
 * @param {number} originNode - The starting vertex of the edge.
 * @param {number} destinationNode - The ending vertex of the edge.
 * @param {number} edgeCost - The numerical weight associated with traversing this edge.
 */
function establishConnection(graphMap, originNode, destinationNode, edgeCost) {
  if (!graphMap.hasOwnProperty(originNode)) {
    graphMap[originNode] = {}; // Create a sub-object for the origin node if it doesn't exist
  }
  graphMap[originNode][destinationNode] = edgeCost; // Assign the cost to the edge from origin to destination
}

// Iterate through the remaining input lines to populate the graph
for (let currentLineIdx in inputDataLines) {
  const currentLineSegments = inputDataLines[currentLineIdx].split(' ').map(Number); // Split the line by spaces and convert parts to numbers
  const sourceNode = currentLineSegments[0]; // The first element is the source vertex for this line's edges

  // Loop through the line segments, taking two elements at a time (destination, weight)
  for (let segmentPointer = 2; segmentPointer < currentLineSegments.length; segmentPointer += 2) {
    establishConnection(
      graphAdjacencyMap,
      sourceNode,
      currentLineSegments[segmentPointer],     // The destination vertex
      currentLineSegments[segmentPointer + 1] // The weight of the edge
    );
  }
}

// Arrays to store the computed shortest path distances and predecessor nodes
const shortestPathDistances = new Array(numVertices);
const previousNodes = new Array(numVertices);

/**
 * Prepares the distance and predecessor arrays for a single-source shortest path algorithm.
 * All distances are set to infinity, predecessors to null, except for the starting vertex.
 * @param {number} startVertex - The node from which all paths will be calculated.
 */
function prepareDistances(startVertex) {
  for (let nodeIdx = 0; nodeIdx < numVertices; nodeIdx++) {
    shortestPathDistances[nodeIdx] = Number.POSITIVE_INFINITY; // Mark all nodes as unreachable
    previousNodes[nodeIdx] = null; // No path has been found yet
  }
  shortestPathDistances[startVertex] = 0; // The distance from the start node to itself is zero
}

/**
 * Attempts to "relax" an edge (nodeU, nodeV) with a given weight. If a shorter path
 * to nodeV is found through nodeU, the distance and predecessor are updated.
 * @param {number} nodeU - The source vertex of the edge being relaxed.
 * @param {number} nodeV - The destination vertex of the edge being relaxed.
 * @param {number} edgeWeight - The weight of the edge connecting nodeU to nodeV.
 */
function updatePath(nodeU, nodeV, edgeWeight) {
  // If the path to nodeV via nodeU is shorter than the current known path to nodeV
  if (shortestPathDistances[nodeV] > shortestPathDistances[nodeU] + edgeWeight) {
    shortestPathDistances[nodeV] = shortestPathDistances[nodeU] + edgeWeight; // Update the shortest distance to nodeV
    previousNodes[nodeV] = nodeU; // Set nodeU as the predecessor of nodeV
  }
}

/**
 * Implements the Bellman-Ford algorithm to compute single-source shortest paths
 * in a graph that may contain negative edge weights, and to detect negative cycles.
 * @param {object} graphData - The adjacency map representing the graph.
 * @param {number} sourceVertex - The starting vertex for path calculations.
 * @returns {boolean} Returns `true` if no negative cycles are detected, `false` otherwise.
 */
function computeShortestPaths(graphData, sourceVertex) {
  prepareDistances(sourceVertex); // Initialize all distances and predecessors from the source

  // Repeat the relaxation process V-1 times, where V is the number of vertices
  for (let iterationCount = 1; iterationCount < numVertices; iterationCount++) {
    for (let currentOriginNode in graphData) { // Iterate over all source nodes in the graph
      for (let currentDestinationNode in graphData[currentOriginNode]) { // Iterate over all destination nodes from the current origin
        updatePath(
          Number(currentOriginNode), // Ensure origin node is treated as a number
          Number(currentDestinationNode), // Ensure destination node is treated as a number
          graphData[currentOriginNode][currentDestinationNode] // The weight of the edge
        );
      }
    }
  }

  // After V-1 iterations, perform one more pass to check for negative cycles
  for (let currentOriginNode in graphData) {
    for (let currentDestinationNode in graphData[currentOriginNode]) {
      // If an edge can still be relaxed, it indicates a negative cycle is reachable from the source
      if (shortestPathDistances[Number(currentDestinationNode)] > shortestPathDistances[Number(currentOriginNode)] + graphData[currentOriginNode][currentDestinationNode]) {
        return false; // A negative cycle has been detected
      }
    }
  }
  return true; // No negative cycle was found
}

// Execute the shortest path computation starting from vertex 0
computeShortestPaths(graphAdjacencyMap, 0);

// Output the final shortest distances for each node
for (let nodeResultIdx in shortestPathDistances) {
  console.log("%s %d", nodeResultIdx, shortestPathDistances[nodeResultIdx]);
}