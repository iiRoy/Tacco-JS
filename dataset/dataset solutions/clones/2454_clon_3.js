"use strict";

/**
 * Creates a multi-dimensional array initialized with a given value or factory function.
 * The dimensions are provided as subsequent arguments.
 * @param {*} valueFiller The value to fill array elements with, or a string '[]' to create nested empty arrays.
 * @param {...number} dimensions The sizes of each dimension.
 * @returns {Array} The created multi-dimensional array.
 */
const createMultiDimensionalArray = (valueFiller, ...dimensions) => {
  if (!dimensions || dimensions.length === 0) {
    throw new Error("At least one dimension must be provided for createMultiDimensionalArray.");
  }

  let dimCount = dimensions.length;
  let arrayCreationString = `Array(dimensions[${dimCount - 1}]).fill(0).map(() => { return ${valueFiller}; })`;

  while (--dimCount > 0) {
    arrayCreationString = `Array(dimensions[${dimCount - 1}]).fill(0).map(() => ${arrayCreationString})`;
  }

  // Using new Function to avoid direct eval of user input, slightly safer but still dynamic.
  // For this specific use case, it's effectively the same as eval for array construction.
  const arrayConstructor = new Function('dimensions', `return ${arrayCreationString};`);
  return arrayConstructor(dimensions);
};

/**
 * Implements a Disjoint Set Union (DSU) data structure, also known as Union-Find.
 * Supports finding the representative of a set and uniting two sets.
 */
class DisjointSet {
  /**
   * Initializes the Disjoint Set structure.
   * Each element is initially in its own set, represented by a negative size (root) or parent index.
   * @param {number} nodeCount The total number of elements. Elements are 0-indexed to nodeCount-1.
   */
  constructor(nodeCount) {
    // parentOrSize[i] stores parent of i, or -(size of set) if i is a root.
    this.parentOrSize = new Array(nodeCount + 1).fill(-1);
  }

  /**
   * Finds the representative (root) of the set containing the given node,
   * applying path compression for efficiency.
   * @param {number} nodeIndex The index of the node.
   * @returns {number} The representative (root) of the set.
   */
  findRepresentative(nodeIndex) {
    // If nodeIndex is a root (value is negative), return itself.
    if (this.parentOrSize[nodeIndex] < 0) {
      return nodeIndex;
    }
    // Otherwise, recursively find the root and apply path compression.
    return (this.parentOrSize[nodeIndex] = this.findRepresentative(this.parentOrSize[nodeIndex]));
  }

  /**
   * Checks if two nodes belong to the same set.
   * @param {number} nodeX The first node.
   * @param {number} nodeY The second node.
   * @returns {boolean} True if both nodes are in the same set, false otherwise.
   */
  areConnected(nodeX, nodeY) {
    return this.findRepresentative(nodeX) === this.findRepresentative(nodeY);
  }

  /**
   * Unites the sets containing two given nodes using union by size/rank heuristic.
   * @param {number} nodeX The first node.
   * @param {number} nodeY The second node.
   * @returns {boolean} True if the nodes were already in the same set, false if a union occurred.
   */
  joinSets(nodeX, nodeY) {
    let rootX = this.findRepresentative(nodeX);
    let rootY = this.findRepresentative(nodeY);

    if (rootX === rootY) {
      return true; // Already united
    }

    // Union by size: attach smaller tree under root of larger tree.
    // parentOrSize stores negative size, so smaller absolute value means larger size.
    if (this.parentOrSize[rootY] < this.parentOrSize[rootX]) {
      // rootY's set is larger or equal, swap to ensure rootX is the smaller set.
      [rootX, rootY] = [rootY, rootX];
    }

    this.parentOrSize[rootX] += this.parentOrSize[rootY]; // Add size of rootY's set to rootX's set.
    this.parentOrSize[rootY] = rootX; // Make rootX the parent of rootY.
    return false; // A new union occurred
  }

  /**
   * Returns the size of the set containing the given node.
   * @param {number} nodeIndex The index of the node.
   * @returns {number} The number of elements in the set.
   */
  getSetSize(nodeIndex) {
    return -this.parentOrSize[this.findRepresentative(nodeIndex)];
  }
}

// --- Global Simulation State Variables ---
let remainingPathSteps = 0; // Steps remaining on the current path segment.
let currentLocationNode = 0; // The current node the delivery agent is at.
let currentSimulationDay = 0; // The current day in the simulation.
let lastProcessedOrderDay = -1; // The last day new orders were processed.
let totalDeliveryScore = 0; // Accumulator for the total score.

const MAX_DISTANCE_VAL = 1e9; // Represents infinity for distance calculations.

let totalNodesCount; // Total number of vertices (V in original).
let totalEdgesCount; // Total number of edges (E in original).
let allPairsShortestPaths; // 2D array for all-pairs shortest paths.
let adjacentNodeDistances; // 2D array for direct edge distances.
let adjacencyList; // Adjacency list representation of the graph.
let someInputArray; // Unused in original logic, but read (f in original).
let maxSimulationDays; // Maximum number of simulation days (tmax in original).
let maxSimulationDaysSquared; // maxSimulationDays * maxSimulationDays (tmax2 in original).

const activeDeliveryTargets = new Set(); // Set of nodes that currently have items to deliver.
let deliveryRouteNodes = []; // Stack of nodes representing the current delivery route.
let deliveryPickupDays; // Array of arrays, stores pickup days for items destined for each node.

const parsedInputData = []; // Buffer for parsed input tokens.
const dailyOutputLog = []; // Stores the output node for each day.
let inputDataIndex = 0; // Current index for reading from parsedInputData.

/**
 * Reads and returns the next numerical token from the parsedInputData buffer.
 * Increments the internal inputDataIndex.
 * @returns {number} The next input token as a number.
 * @throws {Error} If attempting to read beyond available input data.
 */
const readNextInputToken = () => {
  if (inputDataIndex >= parsedInputData.length) {
    throw new Error("Attempted to read beyond available input data. Input data exhausted.");
  }
  return Number(parsedInputData[inputDataIndex++]);
};

/**
 * Builds a Minimum Spanning Tree (MST) for the given set of target nodes plus node 0.
 * Uses Kruskal's algorithm.
 * @param {Set<number>} targetNodesSet A set of node indices that need to be connected.
 * @returns {Array<Array<number>>} An array of edges forming the MST, each edge being [node1, node2, weight].
 */
function buildMinimumSpanningTree(targetNodesSet) {
  // Combine target nodes with the starting node (0) to ensure connectivity from start.
  const connectedNodes = Array.from(targetNodesSet).concat(0);
  const numConnectedNodes = connectedNodes.length;
  const edges = [];

  // Generate all possible edges between the connected nodes.
  for (let i = 0; i < numConnectedNodes; ++i) {
    for (let j = i + 1; j < numConnectedNodes; ++j) {
      const nodeA = connectedNodes[i];
      const nodeB = connectedNodes[j];
      edges.push([nodeA, nodeB, allPairsShortestPaths[nodeA][nodeB]]);
    }
  }

  // Sort edges by weight in ascending order.
  edges.sort((edgeA, edgeB) => edgeA[2] - edgeB[2]);

  // Initialize Disjoint Set Union structure for all graph nodes.
  const disjointSetInstance = new DisjointSet(totalNodesCount);
  const minimumSpanningTreeEdges = [];
  let edgeIdx = 0;

  // Kruskal's algorithm: Iterate through sorted edges.
  // Continue until all 'connectedNodes' are connected to node 0, or all edges are processed.
  while (disjointSetInstance.getSetSize(0) < numConnectedNodes && edgeIdx < edges.length) {
    const currentEdge = edges[edgeIdx];
    const [u, v, weight] = currentEdge;

    // If uniting these nodes creates a new connection (they weren't already in the same set),
    // add the edge to the MST.
    if (!disjointSetInstance.joinSets(u, v)) {
      minimumSpanningTreeEdges.push(currentEdge);
    }
    edgeIdx++;
  }

  return minimumSpanningTreeEdges;
}

/**
 * Determines the next move for the delivery agent based on active targets and current route.
 * @returns {number} The next node to move to, or -2 if no move is needed/possible.
 */
function determineNextMove() {
  // If there are no active targets, decide whether to return to node 0 or stay.
  if (activeDeliveryTargets.size === 0) {
    return (currentLocationNode === 0) ? -2 : findNextHopOnPath(0);
  }

  // Check if the current location is the last node on the planned delivery route.
  const routeLength = deliveryRouteNodes.length;
  if (routeLength > 0) {
    const lastNodeInRoute = deliveryRouteNodes[routeLength - 1];
    if (currentLocationNode === lastNodeInRoute) {
      deliveryRouteNodes.pop(); // If so, remove it from the route as it's reached.
    }
  }

  // If the route is empty after potentially popping, go to node 0.
  if (deliveryRouteNodes.length === 0) {
    return findNextHopOnPath(0);
  }

  // Otherwise, go to the next node on the planned route.
  return findNextHopOnPath(deliveryRouteNodes[deliveryRouteNodes.length - 1]);
}

/**
 * Finds the next direct hop from the currentLocationNode towards a targetNode.
 * Assumes shortest paths have been pre-calculated.
 * @param {number} targetNode The destination node.
 * @returns {number} The next node to move to, or -2 if no valid next hop is found
 *                   (e.g., already at target, or no direct path segment).
 */
function findNextHopOnPath(targetNode) {
  // If already at the target node, no move needed.
  if (targetNode === currentLocationNode) {
    return -2;
  }

  // Iterate through direct neighbors of the current location.
  for (const neighborNode of adjacencyList[currentLocationNode]) {
    const distanceToNeighbor = adjacentNodeDistances[currentLocationNode][neighborNode];
    // Check if this neighbor is on the shortest path to the target.
    if (allPairsShortestPaths[currentLocationNode][targetNode] === distanceToNeighbor + allPairsShortestPaths[neighborNode][targetNode]) {
      remainingPathSteps = distanceToNeighbor - 1; // Decrement path steps.
      currentLocationNode = neighborNode; // Move to the neighbor.
      return currentLocationNode; // Return the new current node.
    }
  }
  return -2; // Should not happen if a path exists and graph is connected.
}

/**
 * Executes the operations for a single simulation day.
 * Handles movement, taking new orders, and delivering items.
 * @returns {number} The node where the agent ends up after daily operations.
 */
function executeDailyOperations() {
  // If currently moving along a path segment, just decrement steps.
  if (remainingPathSteps > 0) {
    remainingPathSteps--;
    return currentLocationNode;
  }

  // If at node 0 (the base), process new orders and plan a route.
  if (currentLocationNode === 0) {
    processNewOrdersAndPlanRoute();
  } else {
    // Otherwise, if at a target node, complete delivery.
    completeDeliveryAndUpdateScore();
  }

  // Determine the next move based on the updated state.
  return determineNextMove();
}

/**
 * Processes new orders received on the current day, updates active targets,
 * and plans a new delivery route using an MST-based DFS traversal.
 */
function processNewOrdersAndPlanRoute() {
  deliveryRouteNodes = []; // Clear the previous route.

  // Process all new orders up to the current simulation day.
  while (lastProcessedOrderDay < currentSimulationDay) {
    lastProcessedOrderDay++;
    const ordersToday = readNextInputToken();
    for (let i = 0; i < ordersToday; i++) {
      const targetId = readNextInputToken() - 1; // Node ID (0-indexed).
      const deliveryDay = readNextInputToken() - 1; // Original day of order (0-indexed).
      activeDeliveryTargets.add(deliveryDay); // Add target node to active set.
      deliveryPickupDays[deliveryDay].push(lastProcessedOrderDay); // Record pickup day for this item.
    }
  }

  // If no active targets, no route planning is needed.
  if (activeDeliveryTargets.size === 0) {
    return;
  }

  // Build a Minimum Spanning Tree connecting all active targets to node 0.
  const mstEdges = buildMinimumSpanningTree(activeDeliveryTargets);
  // Create an adjacency list representation of the MST.
  const routeAdjacency = createMultiDimensionalArray("[]", totalNodesCount);
  for (const edge of mstEdges) {
    const [nodeA, nodeB, _] = edge; // Destructure, ignoring weight.
    routeAdjacency[nodeA].push(nodeB);
    routeAdjacency[nodeB].push(nodeA);
  }

  // Perform a Depth-First Search (DFS) on the MST to generate a linear delivery route.
  traverseRouteDFS(0, -1, routeAdjacency); // Start DFS from node 0, no parent.
  deliveryRouteNodes.reverse(); // Reverse to get path from 0 to furthest node, then back.
  deliveryRouteNodes.pop(); // Remove the initial node 0 from the route, as it's the starting point.
}

/**
 * Performs a Depth-First Search (DFS) traversal to build a delivery route.
 * The route is stored in the global `deliveryRouteNodes` array.
 * @param {number} currentNode The node currently being visited.
 * @param {number} parentNode The node from which `currentNode` was visited (to avoid backtracking immediately).
 * @param {Array<Array<number>>} graph The adjacency list of the MST.
 */
function traverseRouteDFS(currentNode, parentNode, graph) {
  deliveryRouteNodes.push(currentNode); // Add current node to the route.

  // Guard clause: if the node has no neighbors in the MST, it's a leaf.
  if (!graph[currentNode]) {
    return;
  }

  // Visit all neighbors.
  for (const neighbor of graph[currentNode]) {
    if (neighbor === parentNode) {
      continue; // Skip the parent node to avoid infinite loops.
    }
    traverseRouteDFS(neighbor, currentNode, graph); // Recurse for unvisited neighbors.
  }
}

/**
 * Completes delivery at the currentLocationNode, updates the score,
 * and removes the node from active delivery targets.
 */
function completeDeliveryAndUpdateScore() {
  activeDeliveryTargets.delete(currentLocationNode); // Remove from active targets.

  // Calculate score for all items delivered to this node.
  while (deliveryPickupDays[currentLocationNode].length > 0) {
    const pickupDay = deliveryPickupDays[currentLocationNode].pop();
    const timeElapsed = currentSimulationDay - pickupDay;
    totalDeliveryScore += maxSimulationDaysSquared - (timeElapsed * timeElapsed);
  }
}

// --- Input/Output Handling with Readline and Generator ---
const readlineInterface = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
 * Generator function to handle asynchronous input reading and simulation flow.
 * Yields control back to the event loop when waiting for a line of input.
 */
const inputProcessingGenerator = (function* () {
  const readNextLineFromRL = () => readlineInterface.once("line", s => inputProcessingGenerator.next(s));

  let lineInput;
  let parts;

  // Read V and E (totalNodesCount, totalEdgesCount)
  lineInput = yield readNextLineFromRL();
  parts = lineInput.split(" ").map(Number);
  totalNodesCount = parts[0];
  totalEdgesCount = parts[1];

  // Initialize distance arrays and adjacency list.
  allPairsShortestPaths = createMultiDimensionalArray(MAX_DISTANCE_VAL, totalNodesCount, totalNodesCount);
  adjacentNodeDistances = createMultiDimensionalArray(MAX_DISTANCE_VAL, totalNodesCount, totalNodesCount);
  adjacencyList = createMultiDimensionalArray("[]", totalNodesCount);

  // Set distance from a node to itself to 0.
  for (let i = 0; i < totalNodesCount; i++) {
    allPairsShortestPaths[i][i] = 0;
  }

  // Read edge data and populate graph structures.
  for (let i = 0; i < totalEdgesCount; i++) {
    lineInput = yield readNextLineFromRL();
    parts = lineInput.split(" ").map(Number);
    const node1 = parts[0] - 1; // 0-indexed.
    const node2 = parts[1] - 1; // 0-indexed.
    const distance = parts[2];

    allPairsShortestPaths[node1][node2] = allPairsShortestPaths[node2][node1] = distance;
    adjacentNodeDistances[node1][node2] = adjacentNodeDistances[node2][node1] = distance;
    adjacencyList[node1].push(node2);
    adjacencyList[node2].push(node1);
  }

  // Floyd-Warshall algorithm to compute all-pairs shortest paths.
  for (let k = 0; k < totalNodesCount; k++) {
    for (let i = 0; i < totalNodesCount; i++) {
      for (let j = 0; j < totalNodesCount; j++) {
        const pathThroughK = allPairsShortestPaths[i][k] + allPairsShortestPaths[k][j];
        if (pathThroughK < allPairsShortestPaths[i][j]) {
          allPairsShortestPaths[i][j] = pathThroughK;
        }
      }
    }
  }

  // Read some other input array (labeled 'f' in original).
  someInputArray = (yield readNextLineFromRL()).split(" ").map(Number);

  // Read max simulation days.
  maxSimulationDays = Number(yield readNextLineFromRL());
  maxSimulationDaysSquared = Math.pow(maxSimulationDays, 2); // Pre-calculate for score.

  // Initialize delivery pickup days structure.
  deliveryPickupDays = createMultiDimensionalArray("[]", totalNodesCount);

  // Main simulation loop for each day.
  for (; currentSimulationDay < maxSimulationDays; currentSimulationDay++) {
    // Read number of orders for today.
    const numOrdersToday = Number(yield readNextLineFromRL());
    parsedInputData.push(numOrdersToday);

    // Read details for each order.
    for (let i = 0; i < numOrdersToday; i++) {
      const orderDetailsLine = (yield readNextLineFromRL()).split(" ").map(Number);
      parsedInputData.push(orderDetailsLine[0], orderDetailsLine[1]);
    }

    // Read and discard some input (not used in logic).
    const numOtherInput1 = Number(yield readNextLineFromRL());
    for (let i = 0; i < numOtherInput1; i++) {
      yield readNextLineFromRL();
    }

    // Execute daily operations and log the result.
    const resultNode = executeDailyOperations() + 1; // Output 1-indexed node.
    dailyOutputLog[currentSimulationDay] = resultNode;
    console.log(dailyOutputLog[currentSimulationDay]);

    // Read simulation status line.
    const statusLine = yield readNextLineFromRL();
    if (!statusLine.startsWith("O")) { // Check if it's not "OK".
      // Simulation ended prematurely or with an error.
      readlineInterface.close(); // Close readline interface.
      return;
    }

    // Read and discard more input.
    const numOtherInput2 = Number(yield readNextLineFromRL());
    for (let i = 0; i < numOtherInput2; i++) {
      yield readNextLineFromRL();
    }
  }

  readlineInterface.close(); // Close readline interface after simulation completes.
})();

// Start the input processing generator.
inputProcessingGenerator.next();