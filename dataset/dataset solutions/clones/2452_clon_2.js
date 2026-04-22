"use strict";

// Import the Node.js file system module for I/O operations.
const fileSys = require("node:fs");

// Read all input data from standard input.
const rawInputData = fileSys.readFileSync("/dev/stdin", "utf8");

// Split the input data into tokens by spaces or newlines.
const tokenStream = rawInputData.split(/ |\n/);
let tokenIndex = 0; // Current position in the token stream.

/**
 * Reads the next token from the stream and converts it to a number.
 * @returns {number} The next number from the input.
 */
function readNextNumber() {
    return +tokenStream[tokenIndex++];
}

/**
 * Reads the next token from the stream as a string.
 * @returns {string} The next string from the input.
 */
function readNextString() {
    return tokenStream[tokenIndex++];
}

/**
 * Dynamically creates a multi-dimensional array initialized with a default value.
 * The dimensions are provided as subsequent arguments.
 * @param {*} defaultValue - The value to initialize array elements with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} A multi-dimensional array.
 */
function createMultiDimArray(defaultValue) {
    const args = arguments;
    let len = args.length;
    // Start building the array creation string from the innermost dimension.
    let arrayCreationString = `Array(args[${--len}]).fill(0).map(_ => { return ${defaultValue}; })`;
    // Work outwards, wrapping each dimension in Array.map.
    while (--len) {
        arrayCreationString = `Array(args[${len}]).fill(0).map(_ => ${arrayCreationString})`;
    }
    // Evaluate the string to create the array.
    return eval(arrayCreationString);
}

// Global simulation variables.
let currentPathLength = 0; // Remaining steps on the current path.
let currentVertex = 0; // The current node the delivery agent is at.
let simulationDay = 0; // Current day in the simulation.
let lastOrderDay = -1; // The last day orders were processed.

let totalScore = 0; // Accumulated score for the simulation.

// Constants for graph and simulation.
const LARGE_NUMBER = 1000000000; // Represents infinity for distances.

// Read graph dimensions.
const numVertices = readNextNumber(); // Number of vertices (V).
const numEdges = readNextNumber();   // Number of edges (E).

// Initialize distance matrices and adjacency lists.
// shortestPathMatrix stores all-pairs shortest paths.
const shortestPathMatrix = createMultiDimArray(LARGE_NUMBER, numVertices, numVertices);
// directEdgeDistances stores direct edge weights.
const directEdgeDistances = createMultiDimArray(LARGE_NUMBER, numVertices, numVertices);
// adjacencyLists stores graph structure as lists of neighbors.
const adjacencyLists = createMultiDimArray("[]", numVertices);

// Populate graph data from input.
initializeGraphEdges();

// Simulation parameters.
const maxSimulationDays = readNextNumber(); // Maximum number of simulation days.
const maxDaysSquared = maxSimulationDays * maxSimulationDays; // Pre-calculated for score.

// Array to store daily output results.
const dailyResultOutputs = new Array(maxSimulationDays);

// Set to keep track of destinations with active orders.
const activeOrderDestinations = new Set();

// Stores the days when orders for each destination were received.
const destinationOrderDays = createMultiDimArray("[]", numVertices);

// Start the main simulation process and print the final result.
console.log(runSimulation());

// Optional block for writing output to file and logging score (currently disabled).
if (false) {
    fileSys.writeFileSync("/dev/stdout", dailyResultOutputs.join("\n"));
    console.log(totalScore);
}

/**
 * Main simulation loop. Calculates all-pairs shortest paths (Floyd-Warshall)
 * then processes each day of the simulation.
 * @returns {string} A newline-separated string of daily results.
 */
function runSimulation() {
    // Floyd-Warshall algorithm to find all-pairs shortest paths.
    // Iterates through all possible intermediate nodes.
    for (let intermediateNode = 0; intermediateNode < numVertices; intermediateNode++) {
        // Iterates through all possible starting nodes.
        for (let startNode = 0; startNode < numVertices; startNode++) {
            // Iterates through all possible ending nodes.
            for (let endNode = 0; endNode < numVertices; endNode++) {
                // If path through intermediateNode is shorter, update shortestPathMatrix.
                if (shortestPathMatrix[startNode][intermediateNode] + shortestPathMatrix[intermediateNode][endNode] < shortestPathMatrix[startNode][endNode]) {
                    shortestPathMatrix[startNode][endNode] = shortestPathMatrix[startNode][intermediateNode] + shortestPathMatrix[intermediateNode][endNode];
                }
            }
        }
    }

    // Main simulation loop, runs for `maxSimulationDays`.
    while (simulationDay < maxSimulationDays) {
        // Process the current day and store the result.
        dailyResultOutputs[simulationDay] = processDay() + 1;

        // Emergency break condition for debugging if path length becomes negative.
        if (currentPathLength < 0) {
            console.log(simulationDay, currentPathLength, currentVertex);
            return;
        }
        // Advance to the next day.
        simulationDay++;
    }
    // Join all daily results into a single string for output.
    return dailyResultOutputs.join("\n");
}

/**
 * Initializes the graph's edges and direct distances from input.
 * Also sets self-loop distances to zero.
 */
function initializeGraphEdges() {
    // Initialize self-distances to 0.
    for (let nodeIdx = 0; nodeIdx < numVertices; nodeIdx++) {
        shortestPathMatrix[nodeIdx][nodeIdx] = 0;
    }

    // Read each edge from the input.
    for (let edgeIdx = 0; edgeIdx < numEdges; edgeIdx++) {
        // Read two connected nodes and the distance between them. Adjust for 0-indexing.
        let nodeA = readNextNumber() - 1;
        let nodeB = readNextNumber() - 1;
        let distanceVal = readNextNumber();

        // Update shortestPathMatrix and directEdgeDistances for both directions.
        shortestPathMatrix[nodeA][nodeB] = shortestPathMatrix[nodeB][nodeA] = directEdgeDistances[nodeA][nodeB] = directEdgeDistances[nodeB][nodeA] = distanceVal;

        // Add neighbors to adjacency lists for both nodes.
        adjacencyLists[nodeA].push(nodeB);
        adjacencyLists[nodeB].push(nodeA);
    }
}

/**
 * Determines the next destination for the delivery agent.
 * Prioritizes returning to source (node 0) if no active orders and not already there,
 * otherwise finds the active destination with the most orders that is reachable within `maxSimulationDays`.
 * @returns {number} The next vertex to move towards, or -2 if no valid target.
 */
function findNextDeliveryTarget() {
    // If no active orders, consider returning to the starting point (vertex 0).
    if (activeOrderDestinations.size === 0) {
        if (currentVertex === 0) return -2; // Already at the start, nothing to do.
        return determineNextHop(0); // Find path to vertex 0.
    }

    let bestTargetNode = -1;       // Node with the most orders.
    let maxOrdersAtTarget = 0;     // Max orders found at a target node.

    // Iterate through all destinations with active orders.
    for (let targetNode of activeOrderDestinations) {
        // Check if this target has more orders and is reachable within remaining simulation days.
        if (maxOrdersAtTarget < destinationOrderDays[targetNode].length) {
            if (shortestPathMatrix[currentVertex][targetNode] <= maxSimulationDays - simulationDay) {
                bestTargetNode = targetNode;
                maxOrdersAtTarget = destinationOrderDays[targetNode].length;
            }
        }
    }
    // If no suitable target found, return -2.
    if (bestTargetNode === -1) return -2;

    // Determine the next step to reach the best target.
    return determineNextHop(bestTargetNode);
}

/**
 * Determines the immediate next vertex to move to on the shortest path to a destination.
 * @param {number} destinationVertex - The final target vertex.
 * @returns {number} The next vertex in the path, or -2 if no direct path segment is found.
 */
function determineNextHop(destinationVertex) {
    // Iterate through all neighbors of the current vertex.
    for (let neighborVertex of adjacencyLists[currentVertex]) {
        // Check if this neighbor is on the shortest path to the destination.
        // (i.e., dist(current, dest) = dist(current, neighbor) + dist(neighbor, dest))
        if (shortestPathMatrix[currentVertex][destinationVertex] === directEdgeDistances[currentVertex][neighborVertex] + shortestPathMatrix[neighborVertex][destinationVertex]) {
            // Set the remaining path length for the current segment.
            currentPathLength = shortestPathMatrix[currentVertex][neighborVertex] - 1;
            // Move to the next vertex and return it.
            return currentVertex = neighborVertex;
        }
    }
    // Should not happen if a path exists, indicates an error or unreachable state.
    return -2;
}

/**
 * Processes the actions for the current day: moving, collecting orders, or delivering orders.
 * @returns {number} The current vertex after daily actions, or the next hop.
 */
function processDay() {
    // If currently traversing an edge, just decrement path length and stay at current vertex.
    if (currentPathLength) {
        currentPathLength--;
        return currentVertex;
    }

    // If at a vertex, either collect orders (if at source) or deliver (if at destination).
    if (currentVertex === 0) {
        collectOrders();
    } else {
        deliverOrders();
    }

    // After actions, determine the next target and path.
    return findNextDeliveryTarget();
}

/**
 * Processes new orders received up to the current simulation day.
 * Updates `activeOrderDestinations` and `destinationOrderDays`.
 */
function collectOrders() {
    // Process new orders for each day up to the current simulation day.
    while (lastOrderDay < simulationDay) {
        lastOrderDay++; // Advance the order processing day.
        let numNewOrders = readNextNumber(); // Number of orders for this day.

        // For each new order:
        for (let orderCount = 0; orderCount < numNewOrders; orderCount++) {
            let orderId = readNextNumber() - 1;     // Order ID (unused).
            let destinationId = readNextNumber() - 1; // Destination vertex ID.

            // Add the destination to the set of active orders.
            activeOrderDestinations.add(destinationId);
            // Record the day this order was received for its destination.
            destinationOrderDays[destinationId].push(lastOrderDay);
        }
    }
}

/**
 * Processes deliveries at the current vertex.
 * Removes the vertex from active orders and updates the total score.
 */
function deliverOrders() {
    // Remove the current vertex from active destinations as all orders here are delivered.
    activeOrderDestinations.delete(currentVertex);

    // Process all orders that were destined for the current vertex.
    while (destinationOrderDays[currentVertex].length) {
        // Calculate time elapsed since the order was placed.
        let timeElapsed = simulationDay - destinationOrderDays[currentVertex].pop();
        // Update total score based on the delivery time.
        totalScore += maxDaysSquared - timeElapsed * timeElapsed;
    }
}