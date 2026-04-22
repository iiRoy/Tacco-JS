const fs = require('fs');

// Reads all input data from stdin as a single string.
const rawInputContent = fs.readFileSync('/dev/stdin', 'utf8');

// Splits the entire input content into an array of strings, one for each line.
const parsedInputLines = rawInputContent.split('\n');

// A reusable function to parse a string into an integer.
// This ensures consistent number parsing throughout the script.
const convertToInteger = (stringValue) => {
  // Using parseInt with radix 10 for explicit base.
  // The original code used '- 0', which is a common trick but less explicit.
  return parseInt(stringValue, 10);
};

// --- Initial Configuration Parsing ---
// The first line contains N (number of vertices), M (number of edges), and X (initial resource).
// We use array destructuring to extract these values directly.
const [totalVertexCountStr, totalEdgeCountStr, initialResourceLevelStr] = parsedInputLines[0].split(' ');

const totalVertices = convertToInteger(totalVertexCountStr);
const totalEdges = convertToInteger(totalEdgeCountStr);
const startingResourceLevel = convertToInteger(initialResourceLevelStr);

// A large number to represent an unachievable minimum, similar to Infinity.
const UNREACHABLE_TIME = Infinity;

// --- Graph Data Structures Setup ---
// `vertexCapacities`: An array storing a specific 'resource capacity' or 'height' for each vertex.
// Its size is `totalVertices`.
const vertexCapacities = new Array(totalVertices);

// `graphAdjacencyList`: Represents the graph using an adjacency list.
// Each element `graphAdjacencyList[i]` will be an array of objects,
// where each object describes an edge originating from vertex `i`.
const graphAdjacencyList = new Array(totalVertices);

// Initialize `vertexCapacities` and `graphAdjacencyList`.
// Vertex capacities are read from the input lines following the first configuration line.
for (let vertexIndex = 0; vertexIndex < totalVertices; vertexIndex++) {
  // Vertex capacities are 0-indexed, read from lines 1 to N.
  vertexCapacities[vertexIndex] = convertToInteger(parsedInputLines[vertexIndex + 1]);
  // Initialize each adjacency list entry as an empty array.
  graphAdjacencyList[vertexIndex] = [];
}

// --- Edge Data Population ---
// Edges are read from the input lines after the vertex capacities.
// These lines start from `totalVertices + 1` (0-indexed).
for (let currentEdgeIdx = 0; currentEdgeIdx < totalEdges; currentEdgeIdx++) {
  // Each edge line contains: `u` (source), `v` (destination), `c` (cost/time to traverse).
  const edgeDataComponents = parsedInputLines[currentEdgeIdx + totalVertices + 1].split(' ');
  const sourceVertex = convertToInteger(edgeDataComponents[0]) - 1; // Convert to 0-based index.
  const destinationVertex = convertToInteger(edgeDataComponents[1]) - 1; // Convert to 0-based index.
  const traversalCost = convertToInteger(edgeDataComponents[2]);

  // Add the edge to the adjacency list for both directions, as it's an undirected graph.
  // Each edge object specifies the `target` vertex and the `cost` to reach it.
  graphAdjacencyList[sourceVertex].push({
    target: destinationVertex,
    cost: traversalCost
  });
  graphAdjacencyList[destinationVertex].push({
    target: sourceVertex,
    cost: traversalCost
  });
}

// --- Graph Traversal Implementation (Modified Depth-First Search using a stack) ---
// `explorationStack`: Stores states to be explored. Each state captures a point in a path.
// A state object includes:
// `currentVertex`: The index of the vertex where the path currently is.
// `cumulativeTime`: The total time accumulated to reach this `currentVertex` along this path.
// `currentResourceLevel`: The remaining resource level upon arriving at `currentVertex`.
// `visitedPathNodes`: An array tracking all vertices visited in this specific path,
//                     used to prevent simple cycles and ensure distinct paths.
const explorationStack = [];

// Push the initial state onto the stack: starting from vertex 0.
explorationStack.push({
  currentVertex: 0,
  cumulativeTime: 0,
  currentResourceLevel: startingResourceLevel,
  visitedPathNodes: [0] // Path starts with vertex 0.
});

// `minimalAchievedResult`: Holds the smallest calculated time to reach the target vertex.
let minimalAchievedResult = UNREACHABLE_TIME;

// The target vertex is `totalVertices - 1`.
const finalDestinationVertex = totalVertices - 1;

// The main loop for graph traversal. Continues as long as there are states to process.
while (explorationStack.length > 0) {
  // Pop the latest state from the stack for processing (DFS-like behavior).
  const currentState = explorationStack.pop();

  // Iterate through all neighbors (edges) of the `currentState.currentVertex`.
  for (let edgeIterator = 0; edgeIterator < graphAdjacencyList[currentState.currentVertex].length; edgeIterator++) {
    const edgeDetails = graphAdjacencyList[currentState.currentVertex][edgeIterator];
    const nextVertex = edgeDetails.target;
    const edgeCost = edgeDetails.cost;

    // --- Path Validity Checks ---
    // 1. Check for immediate cycles within the current path.
    // If `nextVertex` is already in `visitedPathNodes`, skip this edge to avoid infinite loops
    // in simple path finding scenarios.
    if (currentState.visitedPathNodes.includes(nextVertex)) {
      continue;
    }

    // 2. Resource capacity check at the current vertex.
    // This condition means that the intrinsic capacity of the *current* vertex
    // must be at least the cost of traversing this specific edge.
    if (vertexCapacities[currentState.currentVertex] < edgeCost) {
      continue; // Cannot traverse this edge due to insufficient node capacity.
    }

    // --- Calculate New State (Time and Resource) for the Next Vertex ---
    let newCumulativeTime;
    let newResourceLevel;

    // Condition 1: Current resource is significantly high, leading to a 'penalty' for excess.
    // If the current resource level is greater than what's available at the next vertex
    // plus the edge cost, the excess resource is converted into additional time.
    if (vertexCapacities[nextVertex] + edgeCost < currentState.currentResourceLevel) {
      newCumulativeTime = currentState.cumulativeTime + edgeCost + (currentState.currentResourceLevel - (vertexCapacities[nextVertex] + edgeCost));
      newResourceLevel = vertexCapacities[nextVertex]; // Resource level is capped by the next vertex's capacity.
    }
    // Condition 2: Standard resource consumption.
    // This condition ensures there's enough resource to pay for the edge, AND
    // that the potential resource at the next node (its capacity + edge cost) is not less
    // than the current resource level (avoiding the 'excess penalty' from Condition 1).
    // NOTE: The original code had a syntax error here: `h[next + obj.t >= node.height && node.height >= obj.t]`.
    // This has been interpreted and corrected to reflect a logical resource comparison.
    else if (currentState.currentResourceLevel >= edgeCost && vertexCapacities[nextVertex] + edgeCost >= currentState.currentResourceLevel) {
      newCumulativeTime = currentState.cumulativeTime + edgeCost;
      newResourceLevel = currentState.currentResourceLevel - edgeCost; // Resource is simply depleted by the edge cost.
    }
    // Condition 3: Insufficient resource or other complex interaction, leading to a 'time penalty'.
    // If neither of the above conditions is met, it implies a deficit in resource.
    // The time penalty is `edgeCost - currentState.currentResourceLevel`.
    else {
      newCumulativeTime = currentState.cumulativeTime + edgeCost + (edgeCost - currentState.currentResourceLevel);
      newResourceLevel = 0; // Resource is considered completely used up or zero.
    }

    // --- Prepare and Push New State ---
    // Create a new path history by appending the `nextVertex`.
    // Using spread syntax `...` for immutability and clarity.
    const updatedVisitedPathNodes = [...currentState.visitedPathNodes, nextVertex];

    explorationStack.push({
      currentVertex: nextVertex,
      cumulativeTime: newCumulativeTime,
      currentResourceLevel: newResourceLevel,
      visitedPathNodes: updatedVisitedPathNodes
    });

    // --- Check for Reaching the Target Vertex ---
    // If the `nextVertex` is our `finalDestinationVertex`,
    // we calculate the final path time and update `minimalAchievedResult`.
    if (nextVertex === finalDestinationVertex) {
      // The final calculation for the path's total time, as specified in the problem:
      // accumulated time + target node's intrinsic capacity - remaining resource.
      const candidatePathTime = newCumulativeTime + vertexCapacities[finalDestinationVertex] - newResourceLevel;
      minimalAchievedResult = Math.min(minimalAchievedResult, candidatePathTime);
    }
  }
}

// --- Output the Final Result ---
// If `minimalAchievedResult` is still `UNREACHABLE_TIME`, it means no valid path was found.
if (minimalAchievedResult === UNREACHABLE_TIME) {
  console.log(-1); // Output -1 if no path exists.
} else {
  console.log(minimalAchievedResult); // Output the calculated minimum time.
}