"use strict";
// Read all input from standard input as a single string
var rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// Split the input string into tokens by spaces or newlines
var tokenStream = rawData.split(/ |\n/);
// Pointer to the current token in the stream
var tokenPointer = 0;

/**
 * Reads the next token from the stream and converts it to a number.
 * @returns {number} The next number from the input.
 */
function readNextNumber() {
  return +tokenStream[tokenPointer++];
}

/**
 * Reads the next token from the stream as a string.
 * @returns {string} The next string from the input.
 */
function readNextString() {
  return tokenStream[tokenPointer++];
}

/**
 * Creates a multi-dimensional array initialized with a given value.
 * The dimensions are passed as subsequent arguments.
 * Example: initializeMultiDimensionalArray(0, 2, 3) creates [[0,0,0],[0,0,0]]
 * @param {*} initialValue The value to initialize array elements with.
 * @param {...number} dimensions The sizes of each dimension.
 * @returns {Array} The initialized multi-dimensional array.
 */
function initializeMultiDimensionalArray(initialValue) {
  var args = arguments,
    argCount = args.length,
    // Start building the eval string from the innermost array
    evalString = "Array(args[" + --argCount + "]).fill(0).map(x=>{return " + initialValue + ";})";
  // Wrap with outer arrays
  while (--argCount) {
    evalString = "Array(args[" + argCount + "]).fill(0).map(x=>" + evalString + ")";
  }
  // Execute the string to create the array structure
  return eval(evalString);
}

// Global variables for simulation state
var currentPathLength = 0; // Remaining length of the current path segment
var currentLocationNode = 0; // The current node (vertex) where the delivery agent is
var simulationDay = 0; // Current day in the simulation
var lastOrderProcessingDay = -1; // The last day new orders were processed

var totalDeliveryScore = 0; // Accumulated score from deliveries

// Constants for graph and simulation
const MAX_DISTANCE_VALUE = 1000000000; // Represents infinity for distances
const vertexCount = readNextNumber(); // Number of vertices (nodes) in the graph (200-400)
const edgeCount = readNextNumber(); // Number of edges in the graph (1.5V-2V)

// 2D array to store shortest path distances between any two nodes
const shortestPathDistances = initializeMultiDimensionalArray(MAX_DISTANCE_VALUE, vertexCount, vertexCount);
// Array of Sets, where each Set stores the neighbors of a vertex
const adjacencyListSets = initializeMultiDimensionalArray("new Set()", vertexCount);

// Populate the graph data from input
loadGraphEdges();

const maximumSimulationDays = readNextNumber(); // Total simulation days (e.g., 10000)
const maxDaysSquared = maximumSimulationDays * maximumSimulationDays; // Pre-calculated for score

// Array to store the result (next node to move to) for each day
const dailyDeliveryResults = Array(maximumSimulationDays);
// Set to keep track of nodes that currently have pending deliveries
const pendingDeliveries = new Set();
// Array of arrays, where each inner array stores the day an order for that node was received
const deliveryRequestTimes = initializeMultiDimensionalArray("[]", vertexCount);

// Start the simulation and print the results
console.log(runSimulation());

/**
 * Main simulation function.
 * Computes all-pairs shortest paths using Floyd-Warshall,
 * then simulates day-by-day operations.
 * @returns {string} A newline-separated string of daily delivery actions.
 */
function runSimulation() {
  // Floyd-Warshall algorithm to find all-pairs shortest paths
  for (var k_idx = 0; k_idx < vertexCount; k_idx++) {
    for (var i_idx = 0; i_idx < vertexCount; i_idx++) {
      for (var j_idx = 0; j_idx < vertexCount; j_idx++) {
        // If path through k_idx is shorter than direct path
        if (shortestPathDistances[i_idx][k_idx] + shortestPathDistances[k_idx][j_idx] < shortestPathDistances[i_idx][j_idx]) {
          shortestPathDistances[i_idx][j_idx] = shortestPathDistances[i_idx][k_idx] + shortestPathDistances[k_idx][j_idx];
        }
      }
    }
  }

  // Simulate day by day until maximumSimulationDays is reached
  while (simulationDay < maximumSimulationDays) {
    dailyDeliveryResults[simulationDay] = executeDailyOperations() + 1; // Store the next node (1-indexed)
    simulationDay++; // Advance to the next day
  }
  // Join all daily results with newlines for output
  return dailyDeliveryResults.join("\n");
}

/**
 * Populates the graph's adjacency list and initial distance matrix
 * based on the input edge data.
 */
function loadGraphEdges() {
  // Initialize diagonal elements of the distance matrix to 0 (distance from a node to itself)
  for (var i_idx = 0; i_idx < vertexCount; i_idx++) {
    shortestPathDistances[i_idx][i_idx] = 0;
  }

  // Read edge data and update distances and adjacency lists
  for (var i_idx = 0; i_idx < edgeCount; i_idx++) {
    var nodeA = readNextNumber() - 1; // Convert to 0-indexed
    var nodeB = readNextNumber() - 1; // Convert to 0-indexed
    var edgeWeight = readNextNumber(); // Distance/weight of the edge

    // Update distance matrix for undirected graph
    shortestPathDistances[nodeA][nodeB] = shortestPathDistances[nodeB][nodeA] = edgeWeight;
    // Add to adjacency sets
    adjacencyListSets[nodeA].add(nodeB);
    adjacencyListSets[nodeB].add(nodeA);
  }
}

/**
 * Determines the next delivery target based on current state and pending orders.
 * @returns {number} The ID of the next node to move to, or -2 if no valid move.
 */
function determineNextDelivery() {
  // If there are no pending deliveries, try to return to the starting node (0)
  if (pendingDeliveries.size === 0) {
    if (currentLocationNode === 0) return -2; // Already at start, nothing to do
    return findNextHop(currentLocationNode, 0); // Find path back to node 0
  }

  var bestDeliveryTarget = -1; // Node with most pending orders that is reachable
  var maxOrdersAtTarget = 0; // Count of orders at the best target

  // Iterate through all nodes with pending deliveries
  for (var targetNode of pendingDeliveries) {
    // Check if this target has more orders than current best AND is reachable within remaining time
    if (maxOrdersAtTarget < deliveryRequestTimes[targetNode].length &&
      shortestPathDistances[currentLocationNode][targetNode] <= maximumSimulationDays - simulationDay) {
      bestDeliveryTarget = targetNode;
      maxOrdersAtTarget = deliveryRequestTimes[targetNode].length;
    }
  }

  // If no suitable delivery target was found, try to return to node 0
  if (bestDeliveryTarget === -1) {
    if (currentLocationNode === 0) return -2; // Already at start, nothing to do
    return findNextHop(currentLocationNode, 0); // Find path back to node 0
  }

  // Otherwise, find the next hop towards the best delivery target
  return findNextHop(currentLocationNode, bestDeliveryTarget);
}

/**
 * Finds the next immediate hop from a source node towards a destination node.
 * This assumes shortestPathDistances has been pre-calculated.
 * @param {number} sourceNode The starting node.
 * @param {number} destinationNode The ultimate target node.
 * @returns {number} The ID of the next node to move to, or -2 if no valid hop.
 */
function findNextHop(sourceNode, destinationNode) {
  // If the destination is a direct neighbor
  if (adjacencyListSets[sourceNode].has(destinationNode)) {
    currentPathLength = shortestPathDistances[sourceNode][destinationNode] - 1; // Decrement as one step is taken
    return currentLocationNode = destinationNode; // Move to destination
  }

  // Otherwise, find an intermediate neighbor that is on the shortest path
  for (var neighborNode of adjacencyListSets[sourceNode]) {
    // Check if neighborNode is on the shortest path from sourceNode to destinationNode
    if (shortestPathDistances[sourceNode][destinationNode] === shortestPathDistances[sourceNode][neighborNode] + shortestPathDistances[neighborNode][destinationNode]) {
      currentPathLength = shortestPathDistances[sourceNode][neighborNode] - 1; // Decrement as one step is taken
      return currentLocationNode = neighborNode; // Move to this neighbor
    }
  }
  // Should not happen if graph is connected and paths exist, but acts as a fallback
  return -2;
}

/**
 * Executes the operations for the current day:
 * - If currently on a path, just decrement path length.
 * - If at a node, either accept new orders (if at node 0) or complete deliveries.
 * - Then determine the next move.
 * @returns {number} The ID of the node the agent moves to or stays at.
 */
function executeDailyOperations() {
  // If the agent is currently traversing a path segment
  if (currentPathLength) {
    currentPathLength--; // One day passes, path length decreases
    return currentLocationNode; // Agent stays on the path, returns current node
  }

  // If the agent has arrived at a node
  if (currentLocationNode === 0) {
    acceptNewOrders(); // At node 0, process new orders
  } else {
    completeCurrentDelivery(); // At a delivery node, complete deliveries
  }
  // After processing, determine the next action (move or stay)
  return determineNextDelivery();
}

/**
 * Processes new orders received at the central hub (node 0).
 * This function is called only when currentLocationNode is 0.
 */
function acceptNewOrders() {
  // Process orders for all days up to the current simulationDay
  while (lastOrderProcessingDay < simulationDay) {
    lastOrderProcessingDay++; // Advance the day for which orders are being processed
    var numberOfNewOrders = readNextNumber(); // Read how many new orders for this day

    // For each new order
    for (var i_idx = 0; i_idx < numberOfNewOrders; i_idx++) {
      var orderIdentifier = readNextNumber() - 1; // Order ID (not used directly, but read)
      var deliveryDestination = readNextNumber() - 1; // The node where the order needs to be delivered

      pendingDeliveries.add(deliveryDestination); // Mark this node as having a pending delivery
      deliveryRequestTimes[deliveryDestination].push(lastOrderProcessingDay); // Record when this order was received
    }
  }
}

/**
 * Completes deliveries at the current node.
 * This function is called only when currentLocationNode is not 0.
 */
function completeCurrentDelivery() {
  // Remove the current node from the set of pending deliveries
  // as all orders for this node are now considered delivered.
  pendingDeliveries.delete(currentLocationNode);

  // Calculate score for all orders delivered at currentLocationNode
  while (deliveryRequestTimes[currentLocationNode].length) {
    var timeTakenForDelivery = simulationDay - deliveryRequestTimes[currentLocationNode].pop();
    totalDeliveryScore += maxDaysSquared - timeTakenForDelivery * timeTakenForDelivery;
  }
}
