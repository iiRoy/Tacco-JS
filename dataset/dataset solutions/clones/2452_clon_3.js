"use strict";

// Core Node.js file system module for input/output operations
let fileSystemModule = require("fs");

// Read all input from standard input as a UTF-8 string
let rawDataBuffer = fileSystemModule.readFileSync("/dev/stdin", "utf8");

// Split the raw input into tokens using whitespace (space or newline) as delimiters
let tokenStream = rawDataBuffer.split(/\s+/);
// Index to keep track of the current token being read from the stream
let tokenIndex = 0;

/**
 * Reads the next numeric token from the input stream.
 * Converts the token to a number and advances the token index.
 * @returns {number} The next numeric value.
 */
function readNumericToken() {
  return +tokenStream[tokenIndex++];
}

/**
 * Reads the next string token from the input stream.
 * Advances the token index.
 * @returns {string} The next string value.
 */
function readStringToken() {
  return tokenStream[tokenIndex++];
}

/**
 * Creates a multi-dimensional array initialized with a specific value.
 * This is a recursive helper function to build array structures.
 * @param {*} initialValue - The value to initialize the innermost elements with.
 * @param {...number} dimensions - A list of integers representing the size of each dimension.
 * @returns {Array} The newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue, ...dimensions) {
  // Base case: if no dimensions are provided, return the initial value.
  if (dimensions.length === 0) {
    return initialValue;
  }

  // Get the size of the current dimension.
  const currentDimensionSize = dimensions[0];
  // Get the remaining dimensions for the recursive call.
  const remainingDimensions = dimensions.slice(1);

  // Create an array of the current dimension size.
  // Map over it, recursively creating the next level of the array structure.
  return Array(currentDimensionSize).fill(null).map(() => {
    // If there are no more dimensions after the current one,
    // fill with the initial value. Otherwise, recurse.
    return remainingDimensions.length === 0
      ? initialValue
      : createMultiDimArray(initialValue, ...remainingDimensions);
  });
}

// Global simulation state variables
let currentPathSegmentLength = 0; // Remaining length of the current path segment being traversed
let currentLocationNodeId = 0;    // Current node ID where the delivery agent is located
let simulationDayCounter = 0;     // Counter for the current day in the simulation
let lastOrderFetchDay = -1;       // The last day new orders were checked/fetched
let totalPerformanceScore = 0;    // Accumulator for the total score earned

// Define a large number to represent infinity for path calculations
const MAX_PATH_COST = 1e9;

// Read graph dimensions: number of nodes (V) and number of edges (E)
const numNodes = readNumericToken(); // Typically 200-400
const numEdges = readNumericToken(); // Typically 1.5*V - 2*V

// Initialize distance matrices for all-pairs shortest paths and direct edge weights
// `allPairsShortestPaths` will store the Floyd-Warshall results.
// `edgeWeights` stores direct distances between connected nodes.
let allPairsShortestPaths = createMultiDimArray(MAX_PATH_COST, numNodes, numNodes);
let edgeWeights = createMultiDimArray(MAX_PATH_COST, numNodes, numNodes);
// Adjacency list representation of the graph
let adjacencyList = createMultiDimArray([], numNodes);

// Populate graph edges and initial distances
initializeGraphEdges();

// Read simulation time parameters
const maxSimulationDays = readNumericToken(); // Typically 10000
// Pre-calculate tmax*tmax for score calculation efficiency
const maxScoreSquared = maxSimulationDays * maxSimulationDays;

// Array to store the delivery target for each day
let dailyDeliveryResults = Array(maxSimulationDays);

// A Set to keep track of nodes that currently have active orders requiring delivery
let activeOrderDestinations = new Set();

// A 2D array where `orderPickupDaysByNode[nodeId]` is a list of days
// when an order was picked up for delivery to `nodeId`.
let orderPickupDaysByNode = createMultiDimArray([], numNodes);

// Execute the main simulation and print the final output
console.log(executeSimulation());

/**
 * Initializes the graph's adjacency list and distance matrices.
 * Sets direct edge weights and initializes self-loop distances to zero.
 */
function initializeGraphEdges() {
  // Initialize diagonal elements of the shortest path matrix to 0 (distance from a node to itself)
  for (let nodeIdx = 0; nodeIdx < numNodes; nodeIdx++) {
    allPairsShortestPaths[nodeIdx][nodeIdx] = 0;
  }

  // Process each edge to populate adjacency list and distance matrices
  for (let edgeIdx = 0; edgeIdx < numEdges; edgeIdx++) {
    // Read source node, target node, and distance for the current edge.
    // Adjust node IDs to be 0-based.
    let sourceNode = readNumericToken() - 1;
    let targetNode = readNumericToken() - 1;
    let distanceValue = readNumericToken();

    // Store direct distances (edges are undirected)
    allPairsShortestPaths[sourceNode][targetNode] = distanceValue;
    allPairsShortestPaths[targetNode][sourceNode] = distanceValue;
    edgeWeights[sourceNode][targetNode] = distanceValue;
    edgeWeights[targetNode][sourceNode] = distanceValue;

    // Add nodes to each other's adjacency lists
    adjacencyList[sourceNode].push(targetNode);
    adjacencyList[targetNode].push(sourceNode);
  }
}

/**
 * Determines the next delivery target node based on current orders and location.
 * Prioritizes nodes with more pending orders, considering reachability within simulation limits.
 * @returns {number} The ID of the next target node, or -2 if no suitable target is found.
 */
function determineNextDeliveryTarget() {
  // If there are no active orders, and the agent is not at the depot (node 0),
  // then the agent should try to return to the depot.
  if (activeOrderDestinations.size === 0) {
    if (currentLocationNodeId === 0) {
      // If at depot and no orders, no immediate delivery needed.
      return -2;
    }
    // Go to depot
    return advanceAlongShortestPath(0);
  }

  let bestTargetNode = -1;
  let maxOrdersAtTarget = 0; // Tracks the maximum number of orders found at a potential target

  // Iterate through all nodes that have active orders
  for (const destinationNode of activeOrderDestinations) {
    const ordersCount = orderPickupDaysByNode[destinationNode].length;

    // Check if this node has more orders than the current best candidate
    // And if it's reachable within the remaining simulation days.
    if (ordersCount > maxOrdersAtTarget &&
        allPairsShortestPaths[currentLocationNodeId][destinationNode] <= (maxSimulationDays - simulationDayCounter)) {
      maxOrdersAtTarget = ordersCount;
      bestTargetNode = destinationNode;
    }
  }

  // If a suitable target node was found, advance towards it.
  if (bestTargetNode !== -1) {
    return advanceAlongShortestPath(bestTargetNode);
  }

  // If no suitable delivery target could be identified
  return -2;
}

/**
 * Calculates and moves the agent one step along the shortest path to a given destination.
 * Updates `currentPathSegmentLength` and `currentLocationNodeId`.
 * @param {number} finalDestinationNode - The ultimate destination node ID.
 * @returns {number} The new `currentLocationNodeId` after moving one step, or -2 if no path segment can be taken.
 */
function advanceAlongShortestPath(finalDestinationNode) {
  // Iterate through all neighbors of the current location node
  for (const neighborNode of adjacencyList[currentLocationNodeId]) {
    // Check if moving to this neighbor is part of a shortest path to the final destination.
    // This uses the triangle inequality: dist(current, final) == dist(current, neighbor) + dist(neighbor, final)
    const pathThroughNeighbor = edgeWeights[currentLocationNodeId][neighborNode] + allPairsShortestPaths[neighborNode][finalDestinationNode];
    if (allPairsShortestPaths[currentLocationNodeId][finalDestinationNode] === pathThroughNeighbor) {
      // If it is, update the remaining path length and the current location.
      currentPathSegmentLength = edgeWeights[currentLocationNodeId][neighborNode] - 1;
      currentLocationNodeId = neighborNode;
      return currentLocationNodeId;
    }
  }
  // This should ideally not be reached if a path exists and `finalDestinationNode` is valid.
  return -2;
}

/**
 * Processes the daily activities: moving, taking orders, or completing deliveries.
 * @returns {number} The node ID where the agent is at the end of the day's activity.
 */
function processDailyActivity() {
  // If the agent is currently traversing a path segment, decrement its length and return the current location.
  if (currentPathSegmentLength > 0) {
    currentPathSegmentLength--;
    return currentLocationNodeId;
  }

  // If not traversing, perform an action based on current location.
  if (currentLocationNodeId === 0) {
    // If at the depot, check for and fetch new orders.
    fetchNewOrders();
  } else {
    // If at a delivery destination, complete pending deliveries for this node.
    completeDeliveries();
  }

  // After potential actions, determine the next delivery target and take a step towards it.
  return determineNextDeliveryTarget();
}

/**
 * Fetches new orders from the input stream for all days up to the current simulation day.
 * Updates `activeOrderDestinations` and `orderPickupDaysByNode`.
 */
function fetchNewOrders() {
  // Process orders for all days from `lastOrderFetchDay + 1` up to `simulationDayCounter`
  while (lastOrderFetchDay < simulationDayCounter) {
    lastOrderFetchDay++; // Advance to the next day for which orders need to be processed
    const numOrdersToday = readNumericToken(); // Read how many orders are placed on this day

    for (let i = 0; i < numOrdersToday; i++) {
      // Read order ID (unused) and destination node ID. Adjust to 0-based.
      const orderId = readNumericToken() - 1; // Original code reads id but doesn't use it
      const destinationNodeId = readNumericToken() - 1;

      // Add the destination to the set of active orders
      activeOrderDestinations.add(destinationNodeId);
      // Record the day this order was picked up for this destination
      orderPickupDaysByNode[destinationNodeId].push(lastOrderFetchDay);
    }
  }
}

/**
 * Completes deliveries for the current `currentLocationNodeId`.
 * Removes the node from `activeOrderDestinations` and updates `totalPerformanceScore`.
 */
function completeDeliveries() {
  // Remove the current node from the set of active delivery destinations
  // as all orders for this node are about to be processed.
  activeOrderDestinations.delete(currentLocationNodeId);

  // Process all pending orders for the current node.
  while (orderPickupDaysByNode[currentLocationNodeId].length > 0) {
    // Pop the pickup day of the oldest order for this destination.
    const pickupDay = orderPickupDaysByNode[currentLocationNodeId].pop();
    // Calculate the lag between pickup and delivery.
    const deliveryLagDays = simulationDayCounter - pickupDay;
    // Update the total score based on the lag.
    totalPerformanceScore += maxScoreSquared - (deliveryLagDays * deliveryLagDays);
  }
}

/**
 * Main simulation execution function.
 * Performs Floyd-Warshall algorithm and then simulates daily activities.
 * @returns {string} A newline-separated string of daily delivery results.
 */
function executeSimulation() {
  // Perform Floyd-Warshall algorithm to compute all-pairs shortest paths.
  // This calculates the shortest path between any two nodes in the graph.
  for (let intermediateNode = 0; intermediateNode < numNodes; intermediateNode++) {
    for (let startNode = 0; startNode < numNodes; startNode++) {
      for (let endNode = 0; endNode < numNodes; endNode++) {
        const pathThroughIntermediate = allPairsShortestPaths[startNode][intermediateNode] + allPairsShortestPaths[intermediateNode][endNode];
        if (pathThroughIntermediate < allPairsShortestPaths[startNode][endNode]) {
          allPairsShortestPaths[startNode][endNode] = pathThroughIntermediate;
        }
      }
    }
  }

  // Main simulation loop, runs for `maxSimulationDays`.
  while (simulationDayCounter < maxSimulationDays) {
    // Store the result of the day's activity (the node where the agent ends up).
    // Add 1 to convert from 0-based index to 1-based output.
    dailyDeliveryResults[simulationDayCounter] = processDailyActivity() + 1;
    simulationDayCounter++; // Advance to the next simulation day.
  }

  // Return the accumulated daily results as a newline-separated string.
  return dailyDeliveryResults.join("\n");
}