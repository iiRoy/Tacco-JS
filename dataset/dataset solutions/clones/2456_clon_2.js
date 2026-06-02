"use strict";

/**
 * Constructs a multi-dimensional array with specified dimensions,
 * initializing all elements with a given value.
 *
 * @param {any} initialValue - The value to populate the array elements.
 * @param {...number} dimensions - The sizes for each dimension of the array.
 * @returns {Array} A newly created multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
  const dimensionArguments = arguments;
  let currentDimensionIndex = dimensionArguments.length;
  // Start building the array creation expression from the innermost dimension.
  let arrayCreationString = `Array(dimensionArguments[${--currentDimensionIndex}]).fill(0).map(element => { return ${initialValue}; })`;

  // Iteratively wrap the expression for outer dimensions.
  while (--currentDimensionIndex) {
    arrayCreationString = `Array(dimensionArguments[${currentDimensionIndex}]).fill(0).map(element => ${arrayCreationString})`;
  }
  // Execute the constructed string to generate the array structure.
  return eval(arrayCreationString);
}

// Global variables representing the simulation state.
let currentPathLength = 0; // Remaining steps in the current movement path.
let currentLocationNode = 0; // The node where the delivery agent is currently located.
let currentDay = 0; // The current day within the simulation timeline.
let lastOrderDayProcessed = -1; // Tracks the last day for which new orders were ingested.

let totalScore = 0; // The cumulative score achieved during the simulation.

const INFINITY_VAL = 1e9; // A large constant used to represent unreachable paths.
let numNodes; // Total count of nodes in the graph.
let numEdges; // Total count of edges connecting nodes in the graph.

let shortestPathMatrix; // Stores the shortest path distances between all pairs of nodes.
let edgeWeightMatrix; // Stores the direct weights (distances) of edges.
let adjacencyList; // Represents the graph structure as an adjacency list.

let someInputArray; // An array of numbers read from input, its specific use is not evident but must be preserved.

let maxSimulationDays; // The maximum number of days the simulation is set to run.
let maxSimulationDaysSquared; // Pre-calculated square of maxSimulationDays for score computation.

const activeOrdersSet = new Set(); // A collection of nodes that currently have pending orders.
let nodeOrderArrivalTimes; // Stores a list of arrival days for orders at each specific node.

const inputQueue = []; // A buffer to hold parsed input data items.
const dailyOutputNodes = []; // An array to store the agent's target node for each day's output.

let inputQueuePointer = 0; // An index to track the current position in the inputQueue.

/**
 * Retrieves the next numerical value from the global inputQueue.
 * Increments the inputQueuePointer after retrieval.
 * @returns {number} The next numerical item from the input queue.
 */
function getNextInputItem() {
  return +inputQueue[inputQueuePointer++];
}

/**
 * Determines the optimal next node for the delivery agent to move towards.
 * Prioritizes nodes with more pending orders, considering reachability within remaining time.
 *
 * @returns {number} The ID of the next node to target, or -2 if no valid target is found.
 */
function determineNextDeliveryTarget() {
  // If there are no active orders, the agent should return to the base (node 0).
  if (activeOrdersSet.size === 0) {
    if (currentLocationNode === 0) return -2; // Already at base, no action needed.
    return findNextStepInPath(0); // Find path back to base.
  }

  let bestTargetNodeId = -1; // Initialize with no best target.
  let maxOrdersAtNode = 0; // Initialize with zero orders.

  // Iterate through all nodes that currently have active orders.
  for (const nodeWithOrders of activeOrdersSet) {
    // Check if this node has more orders than the current maximum AND is reachable
    // within the remaining simulation time.
    if (maxOrdersAtNode < nodeOrderArrivalTimes[nodeWithOrders].length &&
        shortestPathMatrix[currentLocationNode][nodeWithOrders] <= maxSimulationDays - currentDay) {
      bestTargetNodeId = nodeWithOrders;
      maxOrdersAtNode = nodeOrderArrivalTimes[nodeWithOrders].length;
    }
  }

  // If no suitable target node was found, return -2.
  if (bestTargetNodeId === -1) return -2;

  // Otherwise, determine the immediate next step on the shortest path to the best target.
  return findNextStepInPath(bestTargetNodeId);
}

/**
 * Calculates the next immediate node on the shortest path from the current location
 * to a specified destination node. Updates the currentPathLength.
 *
 * @param {number} destinationNode - The ultimate target node for the path.
 * @returns {number} The ID of the next node to move to, or -2 if no valid step is found.
 */
function findNextStepInPath(destinationNode) {
  // Examine each direct neighbor of the current node.
  for (const neighborNode of adjacencyList[currentLocationNode]) {
    // If the neighbor lies on the shortest path to the destination,
    // based on the precomputed shortest path matrix.
    if (shortestPathMatrix[currentLocationNode][destinationNode] === edgeWeightMatrix[currentLocationNode][neighborNode] + shortestPathMatrix[neighborNode][destinationNode]) {
      currentPathLength = edgeWeightMatrix[currentLocationNode][neighborNode] - 1; // Decrement path length for the step taken.
      return currentLocationNode = neighborNode; // Move agent to this neighbor and return its ID.
    }
  }
  return -2; // This case should ideally not be reached if a path exists.
}

/**
 * Executes the primary action for the current day: either moving,
 * processing new orders, or completing deliveries.
 *
 * @returns {number} The ID of the node the agent is currently at or moving towards.
 */
function executeDailyAction() {
  // If the agent is currently in transit, simply decrement the path length.
  if (currentPathLength) {
    currentPathLength--;
    return currentLocationNode;
  }

  // If the agent is at a node, perform an action based on the node.
  if (currentLocationNode === 0) {
    processIncomingOrders(); // At the base, process any new orders.
  } else {
    completeDelivery(); // At a delivery node, complete pending orders.
  }
  // After performing the action, determine the next delivery target.
  return determineNextDeliveryTarget();
}

/**
 * Processes all new orders that have arrived up to the current simulation day.
 * Updates the activeOrdersSet and nodeOrderArrivalTimes.
 */
function processIncomingOrders() {
  // Loop through days from the last processed day up to the current day.
  while (lastOrderDayProcessed < currentDay) {
    lastOrderDayProcessed++;
    const numNewOrders = getNextInputItem(); // Read the count of new orders for this day.
    for (let i_order = 0; i_order < numNewOrders; i_order++) {
      const orderTargetNodeId = getNextInputItem() - 1; // Read and adjust order target node ID (0-indexed).
      const deliveryTargetNodeId = getNextInputItem() - 1; // Read and adjust delivery target node ID (0-indexed).
      // Add the delivery node to the set of nodes with active orders.
      activeOrdersSet.add(deliveryTargetNodeId);
      // Record the day this order arrived at its target node.
      nodeOrderArrivalTimes[deliveryTargetNodeId].push(lastOrderDayProcessed);
    }
  }
}

/**
 * Completes all pending deliveries at the current node and updates the total score.
 */
function completeDelivery() {
  // Remove the current node from the set of active orders as deliveries are being completed.
  activeOrdersSet.delete(currentLocationNode);

  // Process all orders that were pending at this specific node.
  while (nodeOrderArrivalTimes[currentLocationNode].length) {
    const orderArrivalDay = nodeOrderArrivalTimes[currentLocationNode].pop(); // Get the arrival day of an order.
    const timeElapsed = currentDay - orderArrivalDay; // Calculate the time taken for delivery.
    totalScore += maxSimulationDaysSquared - timeElapsed * timeElapsed; // Update the total score.
  }
}

// Initialize readline interface for asynchronous input processing.
const readInterface = require("readline").createInterface(process.stdin, process.stdout);

// A generator function to manage the sequential, asynchronous reading of input lines.
const generatorFunction = (function* () {
  // Helper function to get the next line from stdin asynchronously.
  const getLineAsync = () => readInterface.once("line", line => generatorFunction.next(line));

  // Read the first line containing graph dimensions (V E).
  let lineParts = yield getLineAsync();
  lineParts = lineParts.split(" ");
  numEdges = +lineParts[1];
  numNodes = +lineParts[0];

  // Initialize graph data structures.
  shortestPathMatrix = createMultiDimArray(INFINITY_VAL, numNodes, numNodes);
  edgeWeightMatrix = createMultiDimArray(INFINITY_VAL, numNodes, numNodes);
  adjacencyList = createMultiDimArray("[]", numNodes);

  // Set distance from a node to itself as 0.
  for (let i_node = 0; i_node < numNodes; i_node++) {
    shortestPathMatrix[i_node][i_node] = 0;
  }

  // Read and process all edge data.
  for (let i_edge = 0; i_edge < numEdges; i_edge++) {
    const edgeData = (yield getLineAsync()).split(" ");
    const nodeA = +edgeData[0] - 1; // Convert to 0-indexed.
    const nodeB = +edgeData[1] - 1; // Convert to 0-indexed.
    const weight = +edgeData[2];

    // Store direct edge weights and initialize shortest path matrix for direct connections.
    shortestPathMatrix[nodeA][nodeB] = shortestPathMatrix[nodeB][nodeA] = edgeWeightMatrix[nodeA][nodeB] = edgeWeightMatrix[nodeB][nodeA] = weight;
    // Populate adjacency list for both directions (undirected graph).
    adjacencyList[nodeA].push(nodeB);
    adjacencyList[nodeB].push(nodeA);
  }

  // Apply Floyd-Warshall algorithm to compute all-pairs shortest paths.
  for (let k_node = 0; k_node < numNodes; k_node++) {
    for (let i_node = 0; i_node < numNodes; i_node++) {
      for (let j_node = 0; j_node < numNodes; j_node++) {
        if (shortestPathMatrix[i_node][k_node] + shortestPathMatrix[k_node][j_node] < shortestPathMatrix[i_node][j_node]) {
          shortestPathMatrix[i_node][j_node] = shortestPathMatrix[i_node][k_node] + shortestPathMatrix[k_node][j_node];
        }
      }
    }
  }

  // Read an array of numbers (someInputArray).
  someInputArray = (yield getLineAsync()).split(" ").map(val => +val);

  // Read the maximum number of simulation days.
  maxSimulationDays = +(yield getLineAsync());
  maxSimulationDaysSquared = maxSimulationDays * maxSimulationDays; // Pre-calculate for efficiency.

  // Re-initialize nodeOrderArrivalTimes now that numNodes is defined.
  nodeOrderArrivalTimes = createMultiDimArray("[]", numNodes);

  // Main simulation loop, iterating for each day.
  for (; currentDay < maxSimulationDays; currentDay++) {
    // Read the number of new orders for the current day.
    const dailyOrderCount = +(yield getLineAsync());
    inputQueue.push(dailyOrderCount); // Add to input buffer.
    for (let i_order = 0; i_order < dailyOrderCount; i_order++) {
      const orderDetailParts = (yield getLineAsync()).split(" ").map(val => +val);
      inputQueue.push(orderDetailParts[0], orderDetailParts[1]); // Add order details to buffer.
    }

    // Read and discard a set of dummy input lines.
    const dummyInputCount = +(yield getLineAsync());
    for (let i_dummy = 0; i_dummy < dummyInputCount; i_dummy++) {
      const dummyLine = yield getLineAsync(); // Discard the line content.
    }

    // Execute the daily action and store the resulting node ID (1-indexed for output).
    dailyOutputNodes[currentDay] = executeDailyAction() + 1;
    console.log(dailyOutputNodes[currentDay]); // Print the daily output.

    // Check the status line for simulation termination.
    const statusLine = yield getLineAsync();
    if (statusLine[0] !== "O") {
      return; // If not 'O', terminate the generator.
    }

    // Read and discard another set of dummy input lines.
    const finalDummyCount = +(yield getLineAsync());
    for (let i_final_dummy = 0; i_final_dummy < finalDummyCount; i_final_dummy++) {
      const finalDummyLine = yield getLineAsync(); // Discard the line content.
    }
  }
})();

// Initiate the generator to begin the simulation and input processing.
generatorFunction.next();
