"use strict";

/*
 * Function to dynamically construct a multi-dimensional array based on provided dimensions.
 * The first argument specifies the initial value for the innermost elements.
 * Subsequent arguments define the size of each dimension, from outermost to innermost.
 *
 * @param {any} initialValue - The value to initialize the innermost elements with (e.g., "[]", 0, 1e9).
 * @param {...number} dimensions - A variable number of arguments representing the sizes of each dimension.
 * @returns {Array} A new multi-dimensional array.
 */
function makeMultiDimArray(initialValue) {
  const allArguments = arguments; // Capture all arguments passed to this function.
  let currentArgumentCount = allArguments.length; // Determine the total number of arguments.
  let dimensionIterator = --currentArgumentCount; // Start iterating from the last dimension argument.

  // Construct the string for creating the innermost array.
  // It fills with null temporarily then maps to the actual initial value.
  let arrayConstructionExpression = "Array(allArguments[" + dimensionIterator + "]).fill(null).map(element => { return " + initialValue + "; })";

  // Loop backwards through the dimensions to build nested array structures.
  while (--dimensionIterator) {
    arrayConstructionExpression = "Array(allArguments[" + dimensionIterator + "]).fill(null).map(element => " + arrayConstructionExpression + ")";
  }
  // Execute the generated string as JavaScript code to create the array.
  return eval(arrayConstructionExpression);
}

/*
 * Represents a Disjoint Set Union (DSU) data structure, also known as Union-Find.
 * It manages a collection of disjoint sets and supports operations to find the
 * representative of a set and merge two sets.
 *
 * @param {number} nodeCount - The total number of elements to manage in the DSU.
 */
function DisjointSet(nodeCount) {
  // Initialize an array where each element stores either its parent's index
  // or (if it's a root) the negative of the size of its set.
  // `nodeCount + 1` is used to allow for 1-based indexing if necessary, or simply
  // to avoid issues with 0-indexed data if `nodeCount` is 0-based max index.
  this.parentOrSize = Array(nodeCount + 1).fill(-1);
}

// Define the prototype methods for the DisjointSet class.
DisjointSet.prototype = {
  /*
   * Finds the representative (root) of the set that contains the given element.
   * This method implements path compression for improved efficiency.
   *
   * @param {number} elementIndex - The index of the element whose set representative is to be found.
   * @returns {number} The index of the representative (root) of the element's set.
   */
  findRepresentative: function(elementIndex) {
    // If the value at parentOrSize[elementIndex] is negative, it means elementIndex is a root.
    if (this.parentOrSize[elementIndex] < 0) {
      return elementIndex;
    }
    // Otherwise, elementIndex has a parent. Recursively find the root and compress the path.
    return this.parentOrSize[elementIndex] = this.findRepresentative(this.parentOrSize[elementIndex]);
  },

  /*
   * Checks if two elements belong to the same disjoint set.
   *
   * @param {number} nodeA - The index of the first element.
   * @param {number} nodeB - The index of the second element.
   * @returns {boolean} True if both elements have the same set representative, false otherwise.
   */
  areConnected: function(nodeA, nodeB) {
    return this.findRepresentative(nodeA) === this.findRepresentative(nodeB);
  },

  /*
   * Merges the sets containing two given elements, itemX and itemY.
   * This method applies the union by size heuristic to maintain a balanced tree structure.
   *
   * @param {number} itemX - The index of an element in the first set.
   * @param {number} itemY - The index of an element in the second set.
   * @returns {number} A constant value (1) indicating the operation completed (whether a merge occurred or not).
   */
  mergeSets: function(itemX, itemY) {
    itemX = this.findRepresentative(itemX); // Get the root of itemX's set.
    itemY = this.findRepresentative(itemY); // Get the root of itemY's set.

    if (itemX === itemY) return 1; // If already in the same set, no merge is needed.

    // Apply union by size: attach the smaller tree to the root of the larger tree.
    if (this.parentOrSize[itemY] <= this.parentOrSize[itemX]) { // If Y's set is larger or equal in size.
      this.parentOrSize[itemY] += this.parentOrSize[itemX]; // Update the size of the new root (itemY).
      this.parentOrSize[itemX] = itemY; // Make itemY's root the parent of itemX's root.
    } else { // If X's set is larger.
      this.parentOrSize[itemX] += this.parentOrSize[itemY]; // Update the size of the new root (itemX).
      this.parentOrSize[itemY] = itemX; // Make itemX's root the parent of itemY's root.
    }
    return 1; // Indicate completion.
  },

  /*
   * Retrieves the size of the set that contains the specified element.
   *
   * @param {number} elementIdx - The index of the element whose set size is required.
   * @returns {number} The total number of elements in the set containing elementIdx.
   */
  getSetSize: function(elementIdx) {
    // The size is stored as a negative value at the root of the set.
    return -this.parentOrSize[this.findRepresentative(elementIdx)];
  },
};

// --- Global Variables for Simulation State ---

var remainingTravelDistance = 0, // Distance still to travel along the current path segment.
  currentLocationNode = 0, // The agent's current node in the graph.
  simulationDay = 0, // Current day of the simulation.
  lastOrderDay = -1; // The last day new orders were processed.
var totalRewardPoints = 0; // Accumulated score throughout the simulation.

const MAX_DISTANCE_VAL = 1e9; // A large value representing infinite distance in graph algorithms.
var numVertices; // Total number of vertices (nodes) in the graph.
var numEdges; // Total number of edges (connections) in the graph.
var shortestPathMatrix; // A 2D array storing all-pairs shortest path distances.
var adjacentDistanceMatrix; // A 2D array storing direct edge distances between adjacent nodes.
var adjacencyList; // An array of arrays representing the graph's adjacency list.
var someInputData; // A generic variable for storing parsed input data.
var maxSimulationDays; // The maximum duration of the simulation in days.
var maxSimulationDaysSquared; // Pre-calculated square of maxSimulationDays for scoring.
const activeDeliveriesSet = new Set(); // A set to keep track of nodes that currently have pending deliveries.
var deliveryRoutePath = []; // An array representing the current planned path for deliveries.
var deliveryScheduleMap; // A 2D array (or array of arrays) mapping delivery nodes to days orders were received.
const inputBufferItems = []; // A buffer to store parsed numerical input values for sequential access.
const outputLogArray = []; // An array to store the agent's actions/output for each day.

var inputBufferIndex = 0; // Current index for reading from the inputBufferItems.

/*
 * Retrieves the next numerical item from the global input buffer and advances the buffer index.
 *
 * @returns {number} The next numerical input item.
 */
function getNextInputItem() {
  return +inputBufferItems[inputBufferIndex++];
}

/*
 * Constructs a Minimum Spanning Tree (MST) that connects a given set of delivery target nodes
 * along with the base node (node 0) using Kruskal's algorithm.
 *
 * @param {Set<number>} deliveryTargetNodes - A Set of node indices that need to be part of the MST.
 * @returns {Array<Array<number>>} An array of edges, where each edge is [node1, node2, weight],
 *                                  representing the MST.
 */
function buildMinimumSpanningTree(deliveryTargetNodes) {
  // Create a combined list of all nodes to be included in the MST (delivery targets + base node 0).
  var allNodesInSet = Array.from(deliveryTargetNodes).concat(0);
  var numSetNodes = allNodesInSet.length;
  var candidateEdges = []; // Will store all possible edges between nodes in `allNodesInSet`.

  // Generate all unique pairs of nodes from `allNodesInSet` and their shortest path distances.
  for (var idx1 = 0; idx1 < numSetNodes; idx1++) {
    for (var idx2 = idx1 + 1; idx2 < numSetNodes; idx2++) {
      candidateEdges.push([allNodesInSet[idx1], allNodesInSet[idx2], shortestPathMatrix[allNodesInSet[idx1]][allNodesInSet[idx2]]]);
    }
  }

  // Sort the candidate edges by their weights in ascending order.
  candidateEdges.sort((edgeA, edgeB) => edgeA[2] - edgeB[2]);

  var disjointSetInstance = new DisjointSet(numVertices); // Initialize DSU for the entire graph.
  var mstEdgesResult = []; // List to store the edges that form the MST.

  // Iterate through the sorted edges to build the MST using the DSU structure.
  // The loop continues until all nodes in `allNodesInSet` are connected to the base node (node 0).
  for (var edgeIdx = 0; disjointSetInstance.getSetSize(0) !== numSetNodes; edgeIdx++) {
    // Attempt to merge the sets of the two nodes connected by the current edge.
    // If mergeSets returns 1, it means they were either already connected or successfully merged.
    // The original code uses this return value to skip if already connected.
    if (disjointSetInstance.mergeSets(candidateEdges[edgeIdx][0], candidateEdges[edgeIdx][1])) continue;
    // If they were not connected and successfully merged, add this edge to the MST result.
    mstEdgesResult.push([candidateEdges[edgeIdx][0], candidateEdges[edgeIdx][1], candidateEdges[edgeIdx][2]]);
  }
  return mstEdgesResult;
}

/*
 * Determines the next target node the agent should move towards.
 * This function handles cases for returning to base, continuing a planned route,
 * or initiating a path to the base if no deliveries are active.
 *
 * @returns {number} The index of the next node to move to, or -2 if the agent is
 *                   at the base with no active deliveries.
 */
function determineNextMoveTarget() {
  // If there are no active deliveries.
  if (activeDeliveriesSet.size === 0) {
    if (currentLocationNode === 0) return -2; // Agent is at base, nothing to do.
    return findShortestStep(0); // Agent needs to return to base.
  }
  // If the agent is currently at the last node of the planned delivery route.
  if (currentLocationNode === deliveryRoutePath[deliveryRoutePath.length - 1]) deliveryRoutePath.pop();
  // If the route becomes empty after potentially popping a node.
  if (deliveryRoutePath.length === 0) return findShortestStep(0); // Agent needs to find a path back to base.
  // Otherwise, the agent should move towards the next node in the planned route.
  return findShortestStep(deliveryRoutePath[deliveryRoutePath.length - 1]);
}

/*
 * Calculates the very next node on the shortest path from the agent's
 * currentLocationNode to a specified destinationNode.
 *
 * @param {number} destinationNode - The target node the agent wants to reach.
 * @returns {number} The index of the next node on the shortest path, or -2 if
 *                   the agent is already at the destination.
 */
function findShortestStep(destinationNode) {
  if (destinationNode === currentLocationNode) return -2; // Already at the destination.

  // Iterate through all direct neighbors of the currentLocationNode.
  for (var neighborNode of adjacencyList[currentLocationNode]) {
    // Check if `neighborNode` lies on the shortest path from `currentLocationNode` to `destinationNode`.
    if (shortestPathMatrix[currentLocationNode][destinationNode] === adjacentDistanceMatrix[currentLocationNode][neighborNode] + shortestPathMatrix[neighborNode][destinationNode]) {
      // If it's on the shortest path, set the remaining travel distance for this segment.
      remainingTravelDistance = adjacentDistanceMatrix[currentLocationNode][neighborNode] - 1;
      // Update the agent's current location to this neighbor node and return it.
      return currentLocationNode = neighborNode;
    }
  }
  return -2; // Should not be reached if a path exists.
}

/*
 * Executes the agent's action for the current simulation day.
 * This involves either continuing travel, processing new orders at the base,
 * or completing a delivery at a destination node.
 *
 * @returns {number} The node the agent is currently at or moving towards.
 */
function executeDailyAction() {
  if (remainingTravelDistance) {
    remainingTravelDistance--; // Decrement travel distance if agent is in transit.
    return currentLocationNode; // Agent is still traveling, stays at current virtual node.
  }
  // If not traveling (remainingTravelDistance is 0), perform an action.
  if (currentLocationNode === 0) processNewOrdersAndPlanRoute(); // If at base, handle new orders.
  else completeDeliveryAndCalculateScore(); // Otherwise, complete delivery at current node.
  return determineNextMoveTarget(); // After action, determine the next move.
}

/*
 * Handles the intake of new orders for the current simulation day and plans
 * an optimized delivery route. This involves building an MST of delivery targets
 * and then performing a DFS to linearize a path.
 */
function processNewOrdersAndPlanRoute() {
  deliveryRoutePath = []; // Clear any previous delivery route.
  // Process all orders that have arrived up to the current simulation day.
  while (lastOrderDay < simulationDay) {
    lastOrderDay++; // Advance the tracking of the last day orders were processed.
    var numDailyOrders = getNextInputItem(); // Get the number of orders for this specific day.
    for (var orderItemIdx = 0; orderItemIdx < numDailyOrders; orderItemIdx++) {
      var itemIdentifier = getNextInputItem() - 1; // Read item ID (adjusted for 0-indexing).
      var deliveryLocation = getNextInputItem() - 1; // Read delivery node (adjusted for 0-indexing).
      activeDeliveriesSet.add(deliveryLocation); // Add this location to the set of active deliveries.
      deliveryScheduleMap[deliveryLocation].push(lastOrderDay); // Record the day this order was received.
    }
  }
  if (activeDeliveriesSet.size === 0) return; // If no active deliveries, no route planning needed.

  // Build a Minimum Spanning Tree connecting all active delivery nodes and the base (node 0).
  var spanningTreeEdges = buildMinimumSpanningTree(activeDeliveriesSet);
  // Create an adjacency list representation for the constructed MST.
  var deliveryGraph = makeMultiDimArray("[]", numVertices);

  // Populate the delivery graph from the MST edges.
  for (var edgeIdx = 0; edgeIdx < spanningTreeEdges.length; edgeIdx++) {
    var nodeA = spanningTreeEdges[edgeIdx][0],
      nodeB = spanningTreeEdges[edgeIdx][1];
    deliveryGraph[nodeA].push(nodeB); // Add bidirectional edges.
    deliveryGraph[nodeB].push(nodeA);
  }
  // Perform a Depth-First Search on the MST to generate a linear delivery path starting from node 0.
  depthFirstTraversalForRoute(0, -1, deliveryGraph);
  deliveryRoutePath.reverse(); // Reverse the path to get an outward route from the base.
  deliveryRoutePath.pop(); // Remove the base node itself from the end of the reversed path.
}

/*
 * Performs a Depth-First Search (DFS) traversal on a given graph to build a path.
 * This path is stored in the global `deliveryRoutePath` array.
 *
 * @param {number} currentNode - The node currently being visited during the DFS.
 * @param {number} parentNode - The node from which `currentNode` was visited (to prevent immediate backtracking).
 * @param {Array<Array<number>>} graphRepresentation - The adjacency list of the graph to traverse.
 */
function depthFirstTraversalForRoute(currentNode, parentNode, graphRepresentation) {
  deliveryRoutePath.push(currentNode); // Add the current node to the accumulating path.
  // Iterate through all neighbors of the current node.
  for (var adjacentNode of graphRepresentation[currentNode]) {
    if (adjacentNode === parentNode) continue; // Skip if the neighbor is the parent (avoid going back).
    depthFirstTraversalForRoute(adjacentNode, currentNode, graphRepresentation); // Recursively call DFS on the neighbor.
  }
}

/*
 * Completes the delivery at the agent's currentLocationNode and updates the total score.
 * Removes the delivered node from the set of active deliveries.
 */
function completeDeliveryAndCalculateScore() {
  activeDeliveriesSet.delete(currentLocationNode); // Remove the current node from active delivery targets.
  // Process all orders that were destined for this node.
  while (deliveryScheduleMap[currentLocationNode].length) {
    var timeTaken = simulationDay - deliveryScheduleMap[currentLocationNode].pop(); // Calculate time taken for delivery.
    totalRewardPoints += maxSimulationDaysSquared - timeTaken * timeTaken; // Add to score based on time taken.
  }
}

// Initialize the readline interface for standard input and output.
const readInterface = require("readline").createInterface(process.stdin, process.stdout);

/*
 * Main simulation generator function. This function orchestrates the entire simulation
 * by handling input parsing, graph setup, daily actions, and output.
 * It uses `yield` to pause execution and wait for asynchronous input.
 */
const mainSimulationGenerator = (function*() {
  // Helper function to create a Promise that resolves with the next line of input.
  const readNextLine = () => readInterface.once("line", lineString => mainSimulationGenerator.next(lineString));

  // --- Initial Input Parsing and Graph Setup ---

  // Read the first line: number of vertices (V) and number of edges (E).
  var currentLineData = yield readNextLine();
  currentLineData = currentLineData.split(" ");
  numEdges = +currentLineData[1];
  numVertices = +currentLineData[0];

  // Initialize graph data structures: distance matrices and adjacency list.
  shortestPathMatrix = makeMultiDimArray(MAX_DISTANCE_VAL, numVertices, numVertices);
  adjacentDistanceMatrix = makeMultiDimArray(MAX_DISTANCE_VAL, numVertices, numVertices);
  adjacencyList = makeMultiDimArray("[]", numVertices);

  // Set the distance from a node to itself as 0.
  for (var nodeIndex = 0; nodeIndex < numVertices; nodeIndex++) shortestPathMatrix[nodeIndex][nodeIndex] = 0;

  // Read edge information and populate the graph.
  for (var edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
    var tempInputLine = (yield readNextLine()).split(" ");
    var vertexOne = +tempInputLine[0] - 1, // Adjust to 0-indexed.
      vertexTwo = +tempInputLine[1] - 1, // Adjust to 0-indexed.
      edgeWeight = +tempInputLine[2];

    // Update both shortest path and direct distance matrices for undirected edges.
    shortestPathMatrix[vertexOne][vertexTwo] = shortestPathMatrix[vertexTwo][vertexOne] = adjacentDistanceMatrix[vertexOne][vertexTwo] = adjacentDistanceMatrix[vertexTwo][vertexOne] = edgeWeight;
    // Add edges to the adjacency list.
    adjacencyList[vertexOne].push(vertexTwo);
    adjacencyList[vertexTwo].push(vertexOne);
  }

  // --- Floyd-Warshall Algorithm for All-Pairs Shortest Paths ---
  // Calculates the shortest path between every pair of nodes in the graph.
  for (var intermediateVertex = 0; intermediateVertex < numVertices; intermediateVertex++)
    for (var sourceVertex = 0; sourceVertex < numVertices; sourceVertex++)
      for (var targetVertex = 0; targetVertex < numVertices; targetVertex++) {
        // If going from source to target via intermediate is shorter than direct path, update.
        if (shortestPathMatrix[sourceVertex][intermediateVertex] + shortestPathMatrix[intermediateVertex][targetVertex] < shortestPathMatrix[sourceVertex][targetVertex])
          shortestPathMatrix[sourceVertex][targetVertex] = shortestPathMatrix[sourceVertex][intermediateVertex] + shortestPathMatrix[intermediateVertex][targetVertex];
      }

  // --- Further Input Parsing ---
  someInputData = (yield readNextLine()).split(" ").map(val => +val); // Read some generic input data.
  maxSimulationDays = +(yield readNextLine()); // Read the maximum number of simulation days.
  maxSimulationDaysSquared = maxSimulationDays * maxSimulationDays; // Pre-calculate for scoring.

  // Initialize the delivery schedule map after `numVertices` is known.
  deliveryScheduleMap = makeMultiDimArray("[]", numVertices);

  // --- Main Simulation Loop (Daily Operations) ---
  for (; simulationDay < maxSimulationDays; simulationDay++) {
    var dailyOrderCount = +(yield readNextLine()); // Read number of orders for the current day.
    inputBufferItems.push(dailyOrderCount); // Add to the global input buffer.
    for (var orderItemIdx = 0; orderItemIdx < dailyOrderCount; orderItemIdx++) {
      var parsedInputValues = (yield readNextLine()).split(" ").map(val => +val);
      inputBufferItems.push(parsedInputValues[0], parsedInputValues[1]); // Add item ID and location.
    }

    var dailyEventCount = +(yield readNextLine()); // Read number of events for the day.
    for (var eventIdx = 0; eventIdx < dailyEventCount; eventIdx++) {
      var parsedEventData = yield readNextLine(); // Read event data (content not explicitly used).
    }

    // Execute the agent's action for the current day.
    outputLogArray[simulationDay] = executeDailyAction() + 1; // Store and output the agent's next node (1-indexed).
    console.log(outputLogArray[simulationDay]);

    // Read confirmation or termination signal.
    var confirmationString = yield readNextLine();
    if (confirmationString[0] !== "O") return; // If not 'O' (OK), terminate the simulation.

    var nextDayEventCount = +(yield readNextLine()); // Read number of events for the next day.
    for (var nextEventIdx = 0; nextEventIdx < nextDayEventCount; nextEventIdx++) {
      var nextEventData = yield readNextLine(); // Read event data for the next day (content not explicitly used).
    }
  }
})();

// Initiate the simulation by calling the generator's `next()` method for the first time.
mainSimulationGenerator.next();