"use strict";

// Core Node.js modules for file system operations
var fileSystem = require("fs");

// Read all input from standard input as a UTF-8 string
var rawData = fileSystem.readFileSync("/dev/stdin", "utf8");

// Split the input string by spaces or newlines to create a token stream
var tokenStream = rawData.split(/ |\n/),
  tokenIndex = 0;

/**
 * Retrieves the next number from the token stream.
 * @returns {number} The next number.
 */
function getNextNumber() {
  return +tokenStream[tokenIndex++];
}

/**
 * Retrieves the next string from the token stream.
 * @returns {string} The next string.
 */
function getNextString() {
  return tokenStream[tokenIndex++];
}

/**
 * Creates a multi-dimensional array initialized with a specified value.
 * The dimensions are passed as subsequent arguments.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The sizes of the dimensions.
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  var argsList = arguments,
    argCount = argsList.length,
    // Start building the array creation string from the innermost dimension
    arrayCreationString =
      "Array(argsList[" +
      --argCount +
      "]).fill(0).map(element=>{return " +
      initialValue +
      ";})";
  // Wrap with outer dimensions
  while (--argCount)
    arrayCreationString =
      "Array(argsList[" +
      argCount +
      "]).fill(0).map(element=>" +
      arrayCreationString +
      ")";
  // Evaluate the constructed string to create the array
  return eval(arrayCreationString);
}

// --- Global State Variables ---

// Current remaining length of the path being traversed
var remainingPathLength = 0;
// Current vertex (node) where the delivery agent is located
var currentVertex = 0;
// Current day in the simulation
var currentDay = 0;
// The last day new orders were taken (initialized to -1 to ensure first day orders are processed)
var lastOrderDay = -1;
// Total score accumulated during the simulation
var totalScore = 0;

// --- Constants and Graph Data Structures ---

// A large number representing infinity for distance calculations
const INFINITY_VAL = 1000000000; // 1e9

// Number of vertices (nodes) in the graph
const numVertices = getNextNumber(); // Typically 200-400
// Number of edges in the graph
const numEdges = getNextNumber(); // Typically 1.5V-2V

// 2D array to store all-pairs shortest path distances (Floyd-Warshall)
const shortestPaths = createMultiDimArray(INFINITY_VAL, numVertices, numVertices);
// 2D array to store direct edge weights between connected vertices
const edgeWeights = createMultiDimArray(INFINITY_VAL, numVertices, numVertices);
// Adjacency list representation of the graph
const adjacencyList = createMultiDimArray("[]", numVertices);

// Populate graph data from input
populateGraphData();

// Maximum time limit for the simulation
const maxTimeLimit = getNextNumber(); // Typically 10000
// Square of the maximum time limit, used in score calculation
const maxTimeLimitSquared = maxTimeLimit * maxTimeLimit;

// Array to store the delivery decisions for each day
const dailyDeliveries = Array(maxTimeLimit);
// Set to keep track of vertices that have pending deliveries
const pendingDeliveries = new Set();
// 2D array to store the days when orders for a specific vertex were received
const deliveryOrderTimes = createMultiDimArray("[]", numVertices);

// --- Main Execution Flow ---

// Run the simulation and print the result to standard output
console.log(runSimulation());

// This block is commented out in the original, preserving that behavior.
// It would write the daily delivery decisions to stdout and then the final score.
if (0) {
  fileSystem.writeFileSync("/dev/stdout", dailyDeliveries.join("\n"));
  console.log(totalScore);
}

// --- Function Definitions ---

/**
 * Main simulation loop. Calculates all-pairs shortest paths and then
 * processes each day's deliveries until the maximum time limit is reached.
 * @returns {string} A newline-separated string of daily delivery decisions.
 */
function runSimulation() {
  // Floyd-Warshall algorithm to compute all-pairs shortest paths
  for (var idxK = 0; idxK < numVertices; idxK++)
    for (var idxI = 0; idxI < numVertices; idxI++)
      for (var idxJ = 0; idxJ < numVertices; idxJ++) {
        // If path through k is shorter than current path
        if (
          shortestPaths[idxI][idxK] + shortestPaths[idxK][idxJ] <
          shortestPaths[idxI][idxJ]
        )
          shortestPaths[idxI][idxJ] =
            shortestPaths[idxI][idxK] + shortestPaths[idxK][idxJ];
      }

  // Simulate day by day
  while (currentDay < maxTimeLimit) {
    // Process the current day and store the result
    dailyDeliveries[currentDay] = processDay() + 1; // Add 1 for 1-based indexing in output

    // Emergency exit condition: if path length becomes negative, something went wrong
    if (remainingPathLength < 0) {
      console.log(currentDay, remainingPathLength, currentVertex);
      return; // Exit early
    }
    currentDay++; // Advance to the next day
  }
  // Join all daily decisions into a single string for output
  return dailyDeliveries.join("\n");
}

/**
 * Reads graph edge data from input and initializes distance matrices and adjacency list.
 */
function populateGraphData() {
  // Initialize self-distances to 0
  for (var idxI = 0; idxI < numVertices; idxI++) shortestPaths[idxI][idxI] = 0;

  // Read each edge from input
  for (var idxI = 0; idxI < numEdges; idxI++) {
    var vertexA = getNextNumber() - 1, // Adjust to 0-based indexing
      vertexB = getNextNumber() - 1, // Adjust to 0-based indexing
      distanceVal = getNextNumber(); // Edge weight

    // Store distances for both directions (undirected graph)
    shortestPaths[vertexA][vertexB] = shortestPaths[vertexB][vertexA] =
      edgeWeights[vertexA][vertexB] =
      edgeWeights[vertexB][vertexA] =
        distanceVal;

    // Add to adjacency list
    adjacencyList[vertexA].push(vertexB);
    adjacencyList[vertexB].push(vertexA);
  }
}

/**
 * Determines the next vertex to move to for delivery.
 * Prioritizes vertices with pending orders, otherwise returns to origin (vertex 0).
 * @returns {number} The next vertex to move to, or -2 if no valid move.
 */
function determineNextMove() {
  // If there are no pending deliveries, decide whether to return to origin
  if (pendingDeliveries.size === 0) {
    if (currentVertex === 0) return -2; // Already at origin, nothing to do
    return findNextStep(0); // Find path back to origin
  }

  // Find the pending delivery vertex that is reachable and has the most orders
  var bestTargetVertex = -1,
    maxOrdersAtTarget = 0;
  for (var vertexNode of pendingDeliveries) {
    // Check if this vertex has more orders and is reachable within the remaining time
    if (maxOrdersAtTarget < deliveryOrderTimes[vertexNode].length)
      if (shortestPaths[currentVertex][vertexNode] <= maxTimeLimit - currentDay) {
        bestTargetVertex = vertexNode;
        maxOrdersAtTarget = deliveryOrderTimes[vertexNode].length;
      }
  }

  // If no reachable pending delivery found, return -2 (no valid move)
  if (bestTargetVertex === -1) return -2;

  // Otherwise, find the next step towards the best target vertex
  return findNextStep(bestTargetVertex);
}

/**
 * Finds the immediate next step on the shortest path from currentVertex to destinationVertex.
 * @param {number} destinationVertex - The target vertex.
 * @returns {number} The next vertex to move to, or -2 if no valid step.
 */
function findNextStep(destinationVertex) {
  // Iterate through neighbors of the current vertex
  for (var vertexNode of adjacencyList[currentVertex]) {
    // Check if this neighbor is on the shortest path to the destination
    if (
      shortestPaths[currentVertex][destinationVertex] ===
      edgeWeights[currentVertex][vertexNode] + shortestPaths[vertexNode][destinationVertex]
    ) {
      // Set the remaining path length for this step
      remainingPathLength = edgeWeights[currentVertex][vertexNode] - 1;
      // Move to the next vertex and return it
      return (currentVertex = vertexNode);
    }
  }
  return -2; // No valid next step found
}

/**
 * Processes the actions for the current day.
 * Handles movement, taking new orders, and completing deliveries.
 * @returns {number} The current vertex after processing the day's actions.
 */
function processDay() {
  // If currently traversing a path, just decrement length and stay at current vertex
  if (remainingPathLength) {
    remainingPathLength--;
    return currentVertex;
  }

  // If at the origin (vertex 0), take new orders
  if (currentVertex === 0) receiveNewOrders();
  // Otherwise, if at a delivery point, complete the delivery
  else completeDelivery();

  // After taking/giving, determine the next move
  return determineNextMove();
}

/**
 * Processes new orders received up to the current day.
 * Updates the set of pending deliveries and their reception times.
 */
function receiveNewOrders() {
  // Process orders for each day from lastOrderDay until currentDay
  while (lastOrderDay < currentDay) {
    lastOrderDay++; // Advance the order processing day
    var numNewOrders = getNextNumber(); // Number of new orders for this day

    // For each new order
    for (var idxI = 0; idxI < numNewOrders; idxI++) {
      var orderId = getNextNumber() - 1, // Order ID (unused in this logic)
        deliveryTargetVertex = getNextNumber() - 1; // Target vertex for delivery

      // Add the target vertex to the set of pending deliveries
      pendingDeliveries.add(deliveryTargetVertex);
      // Record the day this order was received for the target vertex
      deliveryOrderTimes[deliveryTargetVertex].push(lastOrderDay);
    }
  }
}

/**
 * Completes deliveries at the current vertex.
 * Removes the vertex from pending deliveries and updates the total score.
 */
function completeDelivery() {
  // Remove the current vertex from the set of pending deliveries
  pendingDeliveries.delete(currentVertex);

  // Process all orders associated with the current vertex
  while (deliveryOrderTimes[currentVertex].length) {
    // Calculate the time difference (delivery day - order reception day)
    var timeDifference = currentDay - deliveryOrderTimes[currentVertex].pop();
    // Update the total score based on the time difference
    totalScore += maxTimeLimitSquared - timeDifference * timeDifference;
  }
}
