"use strict";

/**
 * Dynamically constructs a multi-dimensional array (or nested arrays)
 * based on the provided dimensions.
 * @param {any} initialValue - The value to fill the innermost array elements with.
 * @param {...number} dimensions - The sizes for each dimension, from outermost to innermost.
 * @returns {Array} A multi-dimensional array initialized with the specified value.
 */
function buildDynamicMatrix(initialValue, ...dimensions) {
  let dimensionCount = dimensions.length;
  // Start with the innermost array construction string.
  // This creates an array of the innermost dimension size, filled with the initial value.
  let matrixCreationString = `Array(dimensions[${--dimensionCount}]).fill(0).map(elementPlaceholder => {return ${initialValue};})`;

  // Iterate backwards through the remaining dimensions to nest the array constructions.
  // Each iteration wraps the previous array construction with another `Array().map()` call.
  while (--dimensionCount >= 0) {
    matrixCreationString = `Array(dimensions[${dimensionCount}]).fill(0).map(elementPlaceholder => ${matrixCreationString})`;
  }
  // Evaluate the constructed string to create the actual multi-dimensional array structure.
  return eval(matrixCreationString);
}

/**
 * Represents a Disjoint Set Union (DSU) data structure, also known as Union-Find.
 * It tracks a set of elements partitioned into a number of disjoint (non-overlapping) sets.
 * @param {number} totalElements - The total number of elements to manage (from 0 up to totalElements-1).
 */
function GroupTracker(totalElements) {
  // Initialize parent array; a negative value indicates a root, and its magnitude is the size of the set.
  this.parentArray = Array(totalElements + 1).fill(-1);
}

// Define prototype methods for the GroupTracker (Disjoint Set Union) class.
GroupTracker.prototype = {
  /**
   * Finds the representative (root) of the set containing the given element.
   * This method applies path compression for optimal efficiency in subsequent lookups.
   * @param {number} elementIndex - The index of the element to find the root for.
   * @returns {number} The index of the representative of the element's set.
   */
  findRepresentative: function (elementIndex) {
    // If the parent array value at elementIndex is negative, it means elementIndex is a root.
    // Otherwise, recursively find the root and update the parent to point directly to the root (path compression).
    return this.parentArray[elementIndex] < 0
      ? elementIndex
      : (this.parentArray[elementIndex] = this.findRepresentative(
          this.parentArray[elementIndex]
        ));
  },

  /**
   * Checks if two elements belong to the same disjoint set.
   * This is done by comparing their set representatives.
   * @param {number} elementA - The index of the first element.
   * @param {number} elementB - The index of the second element.
   * @returns {boolean} True if elements are in the same set, false otherwise.
   */
  areConnected: function (elementA, elementB) {
    return this.findRepresentative(elementA) === this.findRepresentative(elementB);
  },

  /**
   * Merges the sets containing two given elements.
   * This implementation uses union by size to maintain a balanced tree structure.
   * @param {number} elementA - The index of the first element.
   * @param {number} elementB - The index of the second element.
   * @returns {number | undefined} Returns 1 if elements were already in the same set (no merge performed),
   *                               undefined otherwise (merge was successful).
   */
  joinSets: function (elementA, elementB) {
    elementA = this.findRepresentative(elementA);
    elementB = this.findRepresentative(elementB);

    // If both elements already share the same representative, they are in the same set.
    if (elementA === elementB) return 1;

    // Union by size: attach the smaller tree under the root of the larger tree.
    // The parent array stores negative size for roots.
    if (this.parentArray[elementB] <= this.parentArray[elementA]) {
      // If set of B is smaller or equal in size, attach A's set to B's set.
      this.parentArray[elementB] += this.parentArray[elementA]; // Update size of the new root (B).
      this.parentArray[elementA] = elementB; // Make B the parent of A's old root.
    } else {
      // Otherwise, attach B's set to A's set.
      this.parentArray[elementA] += this.parentArray[elementB]; // Update size of the new root (A).
      this.parentArray[elementB] = elementA; // Make A the parent of B's old root.
    }
  },

  /**
   * Returns the size of the set containing the given element.
   * @param {number} elementIndex - The index of the element whose set size is required.
   * @returns {number} The number of elements in the set.
   */
  getSetSize: function (elementIndex) {
    // The value stored at the representative's index is the negative size of its set.
    return -this.parentArray[this.findRepresentative(elementIndex)];
  },
};

// Global simulation state variables and constants.
let currentPathSteps = 0; // Tracks remaining steps on the current movement segment.
let activeNodeId = 0; // Represents the current node (vertex) where the agent is located.
let simulationDay = 0; // The current day in the simulation cycle.
let previousPickupDay = -1; // Stores the last day when new orders were picked up.
let cumulativePoints = 0; // Accumulates the total score throughout the simulation.

const IMPOSSIBLE_DIST = 1e9; // A large value representing an unreachable path or infinite distance.

let nodeCount; // Total number of vertices (nodes) in the graph.
let connectionCount; // Total number of edges (connections) in the graph.

let fullDistanceMatrix; // 2D array storing all-pairs shortest path distances between nodes.
let initialEdgeDistances; // 2D array storing direct edge weights (distances) between connected nodes.
let adjacencyList; // An array of arrays, representing the graph's adjacency list.
let dailyTaskCounts; // An array storing task counts for each day (input, but not directly used in logic).
let maxSimulationDays; // The total duration of the simulation in days.
let timeLimitSq; // The square of maxSimulationDays, used in score calculation.

// Sets to efficiently manage node states.
const pendingDeliveries = new Set(); // Stores node IDs that currently have items awaiting delivery.
const newlyAddedDestinations = new Set(); // Stores node IDs that have received new orders on the current day.

let currentTraversalSequence = []; // An array representing the planned sequence of nodes for delivery.
let itemArrivalTimestamps; // A 2D array: itemArrivalTimestamps[nodeId] stores days items arrived for that node.
const rawInputBuffer = []; // A buffer to store numerical values parsed from input lines.
const dailyActionsLog = []; // An array to log the agent's action (next node ID) for each simulation day.

let readCursor = 0; // An index pointer for reading values from the rawInputBuffer.

/**
 * Retrieves the next numerical value from the global rawInputBuffer.
 * Increments the readCursor after each retrieval.
 * @returns {number} The next value from the input buffer, parsed as a number.
 */
function retrieveNextValue() {
  return +rawInputBuffer[readCursor++];
}

/**
 * Computes a Minimum Spanning Tree (MST) for a given set of nodes,
 * ensuring connectivity to node 0 (the origin). Uses Kruskal's algorithm.
 * @param {Set<number>} deliveryPoints - A set of node IDs representing destinations that need to be connected.
 * @returns {Array<Array<number>>} An array of edges forming the MST, where each edge is [nodeU, nodeV, weight].
 */
function findMinSpanningEdges(deliveryPoints) {
  // Combine all active delivery points with the origin node (node 0) to ensure the MST connects to it.
  const involvedNodes = Array.from(deliveryPoints).concat(0);
  const subsetSize = involvedNodes.length;
  const edgeListForMst = []; // This list will hold all possible edges between involved nodes.

  // Generate all unique pairs of nodes from the 'involvedNodes' set and calculate their shortest path distances.
  for (let idx1 = 0; idx1 < subsetSize; idx1++) {
    for (let idx2 = idx1 + 1; idx2 < subsetSize; idx2++) {
      const u = involvedNodes[idx1];
      const v = involvedNodes[idx2];
      edgeListForMst.push([u, v, fullDistanceMatrix[u][v]]);
    }
  }

  // Sort all candidate edges by their weights (distances) in ascending order.
  edgeListForMst.sort((edgeA, edgeB) => edgeA[2] - edgeB[2]);

  // Initialize a Disjoint Set Union (DSU) data structure to track connected components.
  const disjointSetInstance = new GroupTracker(nodeCount);
  const spanningTreeComponents = []; // This array will store the edges that form the MST.

  // Iterate through the sorted edges. For each edge, if it connects two previously disconnected components,
  // add it to the MST. The loop continues until all 'involvedNodes' are part of a single connected component
  // (specifically, connected to node 0).
  for (let edgeIdx = 0; disjointSetInstance.getSetSize(0) !== subsetSize; edgeIdx++) {
    const [nodeU, nodeV, weight] = edgeListForMst[edgeIdx];
    // Attempt to join the sets of nodeU and nodeV. If they were already connected, joinSets returns 1.
    if (disjointSetInstance.joinSets(nodeU, nodeV)) continue;
    spanningTreeComponents.push([nodeU, nodeV, weight]);
  }
  return spanningTreeComponents;
}

/**
 * Determines the agent's next movement action: either progress along a delivery route,
 * or return to the origin (node 0) if no deliveries are pending.
 * @returns {number} The ID of the next node the agent should move to, or -2 if no movement is required/possible.
 */
function planMovementAction() {
  // If there are no pending deliveries, check if the agent is at the origin.
  if (pendingDeliveries.size === 0) {
    if (activeNodeId === 0) return -2; // Agent is at node 0 and nothing to deliver, so idle.
    return findNextHop(0); // Agent needs to return to node 0.
  }

  // If the agent has reached the current endpoint of the planned route segment.
  if (activeNodeId === currentTraversalSequence[currentTraversalSequence.length - 1]) {
    currentTraversalSequence.pop(); // Remove the current node from the route, as it's reached.
    // Continuously remove nodes from the end of the route if they are destinations that have
    // already been "picked up" or processed (part of newlyAddedDestinations).
    while (
      currentTraversalSequence.length &&
      newlyAddedDestinations.has(currentTraversalSequence[currentTraversalSequence.length - 1])
    ) {
      currentTraversalSequence.pop();
    }
    // If the route becomes empty after cleanup, head back to the origin.
    if (currentTraversalSequence.length === 0) return findNextHop(0);
  }
  // Otherwise, continue along the remaining planned route.
  return findNextHop(currentTraversalSequence[currentTraversalSequence.length - 1]);
}

/**
 * Calculates the next intermediate node for the agent to move towards a specific target node.
 * This uses the precomputed all-pairs shortest path matrix.
 * @param {number} targetNode - The final destination node for the current segment of movement.
 * @returns {number} The ID of the next node on the shortest path from activeNodeId to targetNode,
 *                   or -2 if the agent is already at the targetNode.
 */
function findNextHop(targetNode) {
  if (targetNode === activeNodeId) return -2; // Agent is already at the target node.

  // Iterate through all direct neighbors of the current active node.
  for (const nextHopCandidate of adjacencyList[activeNodeId]) {
    // Check if `nextHopCandidate` lies on a shortest path from `activeNodeId` to `targetNode`.
    // This is true if the distance from activeNodeId to targetNode equals the direct distance
    // to nextHopCandidate plus the shortest distance from nextHopCandidate to targetNode.
    if (
      fullDistanceMatrix[activeNodeId][targetNode] ===
      initialEdgeDistances[activeNodeId][nextHopCandidate] +
        fullDistanceMatrix[nextHopCandidate][targetNode]
    ) {
      currentPathSteps = initialEdgeDistances[activeNodeId][nextHopCandidate] - 1; // Decrement path steps.
      return (activeNodeId = nextHopCandidate); // Move the agent to this next hop.
    }
  }
  return -2; // This case should ideally not be reached if a path to targetNode exists.
}

/**
 * Orchestrates the daily operations for the agent:
 * handles movement, item pickup at origin, or item delivery at a destination.
 * @returns {number} The ID of the next node the agent will move towards, or -2 if idle.
 */
function processCurrentDay() {
  // If the agent is currently in transit along a path segment, simply decrement the remaining steps.
  if (currentPathSteps) {
    currentPathSteps--;
    return activeNodeId; // Agent remains at the same node for this 'day' until path steps reach 0.
  }
  // If the agent has reached node 0 (the origin), attempt to handle new order pickups.
  if (activeNodeId === 0) handleNewPickups();
  // Otherwise, if the agent is at any other node, it's a delivery point, so complete the delivery.
  else completeDelivery();

  // After performing an action (pickup or delivery), determine the next movement.
  return planMovementAction();
}

/**
 * Manages the acquisition of new orders at the origin (node 0).
 * This involves processing new daily input, updating pending deliveries,
 * and recalculating the optimal delivery route using an MST-based approach.
 */
function handleNewPickups() {
  newlyAddedDestinations.clear(); // Clear the set of destinations marked as "ready" for today.
  currentTraversalSequence = []; // Reset the agent's planned delivery route.

  // Process all new orders that have arrived up to the current simulation day.
  while (previousPickupDay < simulationDay) {
    previousPickupDay++; // Advance the counter for the last day new items were acquired.
    let currentDayOrderCount = retrieveNextValue(); // Get the number of new orders for this day.
    for (let i = 0; i < currentDayOrderCount; i++) {
      let destinationId = retrieveNextValue() - 1; // Read the destination node ID (adjust to 0-indexed).
      let deliveryId = retrieveNextValue() - 1; // Read the item ID (not used directly in this logic).
      pendingDeliveries.add(destinationId); // Add this destination to the set of nodes needing delivery.
      itemArrivalTimestamps[destinationId].push(previousPickupDay); // Record the day the item arrived for this destination.
    }
  }
  // If there are no pending deliveries after processing new orders, there's nothing to do.
  if (pendingDeliveries.size === 0) return;

  // Compute the Minimum Spanning Tree (MST) connecting all pending delivery nodes and the origin (node 0).
  const mstEdges = findMinSpanningEdges(pendingDeliveries);
  // Initialize an adjacency list representation for the computed MST.
  const treeConnections = buildDynamicMatrix("[]", nodeCount);

  // Populate the adjacency list for the MST.
  for (let i = 0; i < mstEdges.length; i++) {
    const nodeU = mstEdges[i][0];
    const nodeV = mstEdges[i][1];
    treeConnections[nodeU].push(nodeV);
    treeConnections[nodeV].push(nodeU);
  }

  // Perform a Depth-First Search (DFS) starting from node 0 on the MST
  // to generate a linear traversal sequence for deliveries.
  exploreTreePath(0, -1, treeConnections);
  currentTraversalSequence.reverse(); // Reverse the path to get a sequence from origin to destinations.
  currentTraversalSequence.pop(); // Remove the initial node (0) as it's the starting point, not a delivery point in this context.
}

/**
 * Performs a Depth-First Search (DFS) on a given tree (represented by an adjacency map)
 * to build a linear traversal sequence stored in `currentTraversalSequence`.
 * @param {number} currentVertex - The node currently being visited in the DFS.
 * @param {number} previousVertex - The parent node of the currentVertex in the DFS traversal (to avoid going back).
 * @param {Array<Array<number>>} adjacencyMap - The adjacency list representing the tree structure.
 */
function exploreTreePath(currentVertex, previousVertex, adjacencyMap) {
  currentTraversalSequence.push(currentVertex); // Add the current node to the planned route.
  // Iterate through all neighbors of the current node.
  for (const neighborNode of adjacencyMap[currentVertex]) {
    if (neighborNode === previousVertex) continue; // Skip the parent node to avoid cycles in tree traversal.
    exploreTreePath(neighborNode, currentVertex, adjacencyMap); // Recursively explore the neighbor.
  }
}

/**
 * Completes the delivery process at the current active node.
 * This involves removing the node from the set of pending deliveries and updating the total score.
 */
function completeDelivery() {
  pendingDeliveries.delete(activeNodeId); // Remove the current node from the set of pending deliveries.
  // Process all items that have arrived for this destination node.
  while (itemArrivalTimestamps[activeNodeId].length) {
    // Calculate the duration an item spent from arrival to delivery.
    const duration = simulationDay - itemArrivalTimestamps[activeNodeId].pop();
    // Update the cumulative score based on the delivery time.
    cumulativePoints += timeLimitSq - duration * duration;
  }
}

// Setup for reading input from standard input line by line using Node.js readline module.
const inputReader = require("readline").createInterface(
  process.stdin, // Read from standard input.
  process.stdout // Write to standard output (for prompts, not used here).
);

// An asynchronous generator function that orchestrates the entire simulation loop
// and handles input parsing.
const mainSimulationLoop = (function* () {
  // Helper function to read the next line from standard input asynchronously.
  const readNextLine = () =>
    inputReader.once("line", (lineData) => mainSimulationLoop.next(lineData));

  // --- Initial Input Processing ---

  // Read the first line which contains nodeCount and connectionCount.
  let lineData = yield readNextLine();
  lineData = lineData.split(" ");
  connectionCount = +lineData[1];
  nodeCount = +lineData[0];

  // Initialize distance matrices and adjacency list with appropriate dimensions and default values.
  fullDistanceMatrix = buildDynamicMatrix(IMPOSSIBLE_DIST, nodeCount, nodeCount);
  initialEdgeDistances = buildDynamicMatrix(IMPOSSIBLE_DIST, nodeCount, nodeCount);
  adjacencyList = buildDynamicMatrix("[]", nodeCount);

  // Set the distance from a node to itself to 0.
  for (let i = 0; i < nodeCount; i++) fullDistanceMatrix[i][i] = 0;

  // Read all edge information and populate the graph data structures.
  for (let i = 0; i < connectionCount; i++) {
    const inputTokens = (yield readNextLine()).split(" ");
    const startVertex = +inputTokens[0] - 1; // Convert to 0-indexed.
    const endVertex = +inputTokens[1] - 1; // Convert to 0-indexed.
    const segmentLength = +inputTokens[2];

    // Store direct edge distances and update initial shortest path.
    fullDistanceMatrix[startVertex][endVertex] = fullDistanceMatrix[endVertex][startVertex] =
      initialEdgeDistances[startVertex][endVertex] =
      initialEdgeDistances[endVertex][startVertex] =
        segmentLength;

    // Add connections to the adjacency list for both directions.
    adjacencyList[startVertex].push(endVertex);
    adjacencyList[endVertex].push(startVertex);
  }

  // --- Floyd-Warshall Algorithm for All-Pairs Shortest Paths ---
  // Computes the shortest path between every pair of nodes in the graph.
  for (let interimNode = 0; interimNode < nodeCount; interimNode++)
    for (let sourceNode = 0; sourceNode < nodeCount; sourceNode++)
      for (let destNode = 0; destNode < nodeCount; destNode++) {
        // If a path from sourceNode to destNode through interimNode is shorter than the current known path.
        if (
          fullDistanceMatrix[sourceNode][interimNode] +
            fullDistanceMatrix[interimNode][destNode] <
          fullDistanceMatrix[sourceNode][destNode]
        )
          // Update the shortest path.
          fullDistanceMatrix[sourceNode][destNode] =
            fullDistanceMatrix[sourceNode][interimNode] + fullDistanceMatrix[interimNode][destNode];
      }

  // Read daily task counts (this input line is consumed but its data not used in the provided logic).
  dailyTaskCounts = (yield readNextLine()).split(" ").map((value) => +value);
  // Read the maximum number of simulation days.
  maxSimulationDays = +(yield readNextLine()); // Example: 10000
  timeLimitSq = maxSimulationDays * maxSimulationDays; // Precompute for score calculation efficiency.
  // Initialize the item arrival timestamps array for all destination nodes.
  itemArrivalTimestamps = buildDynamicMatrix("[]", nodeCount);

  // --- Main Simulation Loop ---
  // Iterates for each day of the simulation.
  for (; simulationDay < maxSimulationDays; simulationDay++) {
    // Read the number of new item entries (orders) for the current day.
    let currentLineParts = +(yield readNextLine());
    rawInputBuffer.push(currentLineParts); // Add this count to the input buffer.

    // Read details for each new item entry.
    for (let i = 0; i < currentLineParts; i++) {
      const lineItems = (yield readNextLine()).split(" ").map((value) => +value);
      rawInputBuffer.push(lineItems[0], lineItems[1]); // Add item ID and destination node to buffer.
      newlyAddedDestinations.add(lineItems[1]); // Mark this destination as having new orders.
    }

    // Read the number of queries for the current day (these queries are ignored in the logic).
    currentLineParts = +(yield readNextLine());
    for (let i = 0; i < currentLineParts; i++) {
      const lineItems = yield readNextLine(); // Read and discard the query line.
    }

    // Execute the daily operations and record the agent's next planned position.
    dailyActionsLog[simulationDay] = processCurrentDay() + 1; // +1 to convert back to 1-indexed for output.
    console.log(dailyActionsLog[simulationDay]);

    // Read the end-of-day status message.
    currentLineParts = yield readNextLine();
    // If the status is not 'OK' (or 'O' for 'OK'), terminate the simulation.
    if (currentLineParts[0] !== "O") return;
    // Read the number of post-action queries (these are also ignored).
    currentLineParts = +(yield readNextLine());
    for (let i = 0; i < currentLineParts; i++) {
      const lineItems = yield readNextLine(); // Read and discard the query line.
    }
  }
})();

// Initiate the asynchronous generator to start the simulation and input processing.
mainSimulationLoop.next();