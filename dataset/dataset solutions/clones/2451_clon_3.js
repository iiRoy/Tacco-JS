"use strict";
// Core module for file system operations in Node.js
const fileSystemAccess = require("fs");

// Read raw input from standard input, decode as UTF-8, and split into tokens.
// Tokens are separated by spaces or newlines.
let rawInputData = fileSystemAccess.readFileSync("/dev/stdin", "utf8");
let inputTokenStream = rawInputData.split(/ |\n/);
let currentTokenIndex = 0; // Pointer to the current token in the stream

/**
 * Retrieves and consumes the next token from the input stream, parsing it as a number.
 * @returns {number} The next integer value from the input.
 */
function getNextInteger() {
    return +inputTokenStream[currentTokenIndex++];
}

/**
 * Retrieves and consumes the next token from the input stream as a string.
 * @returns {string} The next string value from the input.
 */
function getNextString() {
    return inputTokenStream[currentTokenIndex++];
}

/**
 * A utility function to create multi-dimensional arrays or nested data structures.
 * It takes an expression (as a string for dynamic object creation or a literal for primitive types)
 * and a list of dimensions.
 *
 * @param {string|any} initialValueExpression - The value or a string expression (e.g., "new Set()", "[]")
 *                                            to initialize the innermost elements.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} A multi-dimensional array initialized as specified.
 */
function buildNestedStructure(initialValueExpression, ...dimensions) {
    // Helper function to create a factory for the initial value.
    // If it's a string representing an object creation, create a function that returns a new instance.
    // Otherwise, return a function that simply returns the value.
    const valueFactory = typeof initialValueExpression === 'string' &&
                         (initialValueExpression.startsWith('new ') || initialValueExpression === '[]')
        ? new Function(`return ${initialValueExpression};`)
        : () => initialValueExpression;

    // Recursive builder for the nested structure.
    function createDimensions(dimArray) {
        if (dimArray.length === 0) {
            return valueFactory(); // Base case: create the leaf element
        }
        const currentDimensionSize = dimArray[0];
        const remainingDimensions = dimArray.slice(1);
        // Create an array of the current dimension size, filling each slot
        // by recursively calling createDimensions for the next level.
        return Array.from({ length: currentDimensionSize }, () => createDimensions(remainingDimensions));
    }

    return createDimensions(dimensions);
}

// Global state variables for the simulation
let currentPathLengthRemaining = 0; // Steps remaining on the current path segment
let currentPositionNode = 0;        // The current node where the delivery agent is located
let simulationDay = 0;              // Current day in the simulation
let lastOrderProcessedDay = -1;     // The last day for which incoming orders were processed
let totalScoreAccumulated = 0;      // Total score achieved from deliveries

// Constants for the simulation environment
const LARGE_NUMBER_INDICATOR = 1e9; // Represents infinity for distance calculations
const totalNodes = getNextInteger(); // Number of nodes (vertices) in the graph (V: 200-400)
const totalEdges = getNextInteger(); // Number of edges in the graph (E: 1.5V-2V)

// Graph data structures
// shortestPathMatrix[i][j] stores the shortest distance between node i and node j
const shortestPathMatrix = buildNestedStructure(LARGE_NUMBER_INDICATOR, totalNodes, totalNodes);
// adjacencyLists[i] is a Set of nodes directly connected to node i
const adjacencyLists = buildNestedStructure("new Set()", totalNodes);

// Initialize graph with edge data
populateGraphData();

// Time-related simulation parameters
const maxSimulationDays = getNextInteger(); // Maximum number of simulation days (tmax: 10000)
const maxSimulationDaysSquared = maxSimulationDays * maxSimulationDays; // Used for score calculation

// Simulation results and order tracking
const dailyResults = Array(maxSimulationDays); // Stores the node visited on each day
const activeDeliveryTargets = new Set();    // Set of nodes that currently have active orders
// deliveryArrivalTimestamps[node_id] is an array of days when orders arrived for that node
const deliveryArrivalTimestamps = buildNestedStructure("[]", totalNodes);

// Start the simulation and print the results
console.log(commenceSimulation());

/**
 * The main simulation routine.
 * Computes all-pairs shortest paths using Floyd-Warshall, then simulates daily operations.
 * @returns {string} A newline-separated string of visited nodes for each day.
 */
function commenceSimulation() {
    // Phase 1: Compute all-pairs shortest paths using the Floyd-Warshall algorithm.
    // This finds the shortest path between every pair of nodes in the graph.
    for (let k_intermediate = 0; k_intermediate < totalNodes; k_intermediate++) {
        for (let i_source = 0; i_source < totalNodes; i_source++) {
            for (let j_destination = 0; j_destination < totalNodes; j_destination++) {
                // Skip if paths through k_intermediate are currently infinite
                if (shortestPathMatrix[i_source][k_intermediate] === LARGE_NUMBER_INDICATOR ||
                    shortestPathMatrix[k_intermediate][j_destination] === LARGE_NUMBER_INDICATOR) {
                    continue;
                }
                const pathThroughK = shortestPathMatrix[i_source][k_intermediate] + shortestPathMatrix[k_intermediate][j_destination];
                // Update shortest path if a shorter path through k_intermediate is found
                if (pathThroughK < shortestPathMatrix[i_source][j_destination]) {
                    shortestPathMatrix[i_source][j_destination] = pathThroughK;
                }
            }
        }
    }

    // Phase 2: Simulate daily operations until maxSimulationDays is reached.
    while (simulationDay < maxSimulationDays) {
        // Execute the operations for the current day and store the resulting node.
        const visitedNodeForToday = executeDailyOperations();
        dailyResults[simulationDay] = visitedNodeForToday + 1; // Store 1-indexed node
        simulationDay++; // Advance to the next day
    }

    // Return the daily results joined by newlines.
    return dailyResults.join("\n");
}

/**
 * Initializes the graph's adjacency lists and shortest path matrix.
 * Sets self-distances to 0 and populates direct edge distances.
 */
function populateGraphData() {
    // Initialize diagonal elements of the distance matrix to 0 (distance from a node to itself).
    for (let node_idx = 0; node_idx < totalNodes; node_idx++) {
        shortestPathMatrix[node_idx][node_idx] = 0;
    }

    // Process each edge from the input.
    for (let edge_counter = 0; edge_counter < totalEdges; edge_counter++) {
        const firstNodeId = getNextInteger() - 1; // Convert to 0-indexed
        const secondNodeId = getNextInteger() - 1; // Convert to 0-indexed
        const edgeWeight = getNextInteger();      // The distance/cost of the edge

        // Basic validation for edge weight
        if (edgeWeight <= 0) {
            // In a real system, this might throw an error or log a warning.
            // For now, we'll just skip invalid edges or treat them as minimum 1.
            // Original code implies positive weights, so we'll assume valid input.
        }

        // For an undirected graph, update distances for both directions.
        shortestPathMatrix[firstNodeId][secondNodeId] = edgeWeight;
        shortestPathMatrix[secondNodeId][firstNodeId] = edgeWeight;

        // Add to adjacency lists for path reconstruction later.
        adjacencyLists[firstNodeId].add(secondNodeId);
        adjacencyLists[secondNodeId].add(firstNodeId);
    }
}

/**
 * Determines the next destination for the delivery agent.
 * Prioritizes delivering existing orders if possible, otherwise returns to home (node 0).
 * @returns {number} The next node the agent should move towards, or -2 if no valid move.
 */
function planNextMove() {
    // Scenario 1: No active orders to deliver.
    if (activeDeliveryTargets.size === 0) {
        // If current position is already home (node 0), there's nothing to do immediately.
        if (currentPositionNode === 0) {
            return -2; // Signal no immediate move needed
        }
        // Otherwise, find path back to home (node 0).
        return findNextHop(currentPositionNode, 0);
    }

    // Scenario 2: Active orders exist. Find the best target.
    let bestTargetNode = -1;
    let maxOrdersAtTarget = 0;

    // Iterate through all nodes with active orders.
    for (const targetNodeCandidate of activeDeliveryTargets) {
        // Calculate the estimated time to reach this target.
        const timeToReachTarget = shortestPathMatrix[currentPositionNode][targetNodeCandidate];

        // Check if the delivery can be completed within the remaining simulation time.
        // Also, ensure the current target has more orders than previously found best targets.
        if (timeToReachTarget <= maxSimulationDays - simulationDay &&
            deliveryArrivalTimestamps[targetNodeCandidate].length > maxOrdersAtTarget) {
            
            maxOrdersAtTarget = deliveryArrivalTimestamps[targetNodeCandidate].length;
            bestTargetNode = targetNodeCandidate;
        }
    }

    // If no suitable delivery target was found (either too far or no orders count),
    // and the agent is not at home, return to home.
    if (bestTargetNode === -1) {
        if (currentPositionNode === 0) {
            return -2; // No immediate move needed
        }
        return findNextHop(currentPositionNode, 0);
    }

    // Move towards the best found delivery target.
    return findNextHop(currentPositionNode, bestTargetNode);
}

/**
 * Determines the next immediate step (hop) from a 'from' node towards a 'to' node.
 * This uses the pre-computed shortest path matrix and adjacency lists.
 * @param {number} startNode - The current node.
 * @param {number} endNode - The target destination node.
 * @returns {number} The next node in the shortest path, or -2 if no path.
 */
function findNextHop(startNode, endNode) {
    // If the 'to' node is a direct neighbor of 'from' node, take that step.
    if (adjacencyLists[startNode].has(endNode)) {
        currentPathLengthRemaining = shortestPathMatrix[startNode][endNode] - 1;
        currentPositionNode = endNode; // Move to the destination
        return endNode;
    }

    // Otherwise, find an intermediate neighbor 'nextHop' such that
    // shortestPathMatrix[startNode][endNode] == shortestPathMatrix[startNode][nextHop] + shortestPathMatrix[nextHop][endNode].
    // This is the first step on a shortest path.
    for (const neighborNode of adjacencyLists[startNode]) {
        if (shortestPathMatrix[startNode][endNode] === shortestPathMatrix[startNode][neighborNode] + shortestPathMatrix[neighborNode][endNode]) {
            currentPathLengthRemaining = shortestPathMatrix[startNode][neighborNode] - 1;
            currentPositionNode = neighborNode; // Move to the intermediate neighbor
            return neighborNode;
        }
    }

    // Should ideally not happen if graph is connected and paths exist.
    // Indicates a problem or an unreachable target given current logic constraints.
    return -2;
}

/**
 * Executes the daily operations of the delivery agent.
 * This includes moving along a path, taking new orders, or completing deliveries.
 * @returns {number} The node where the agent ends up at the end of the day.
 */
function executeDailyOperations() {
    // If there's an ongoing path, simply decrement the remaining length and stay on track.
    if (currentPathLengthRemaining > 0) {
        currentPathLengthRemaining--;
        return currentPositionNode;
    }

    // If no path is active, perform an action based on the current location.
    if (currentPositionNode === 0) { // Agent is at the home base
        processIncomingOrders();
    } else { // Agent is at a delivery location
        completeDeliveries();
    }

    // After taking orders or completing deliveries, plan the next move.
    return planNextMove();
}

/**
 * Processes all new orders that have arrived up to the current simulation day.
 * Updates active delivery targets and their arrival timestamps.
 */
function processIncomingOrders() {
    // Loop through days from the last processed day up to the current simulation day.
    // This ensures all orders for intervening days are processed.
    for (let d = lastOrderProcessedDay + 1; d <= simulationDay; d++) {
        lastOrderProcessedDay = d; // Update the marker for processed days
        
        const numberOfNewOrders = getNextInteger(); // Number of orders arriving on this day

        for (let i = 0; i < numberOfNewOrders; i++) {
            const customerNodeId = getNextInteger() - 1; // Convert to 0-indexed
            const destinationNodeId = getNextInteger() - 1; // Convert to 0-indexed

            // Note: The original code only uses 'd' (destination) for `has.add(d)` and `orderTime[d].push(takeday)`.
            // The 'id' (customerNodeId) is read but not used. This behavior is preserved.
            activeDeliveryTargets.add(destinationNodeId);
            deliveryArrivalTimestamps[destinationNodeId].push(lastOrderProcessedDay);
        }
    }
}

/**
 * Completes all deliveries for the current node (currentPositionNode).
 * Removes the node from active delivery targets and calculates the score for completed deliveries.
 */
function completeDeliveries() {
    // Remove the current node from the set of active delivery targets.
    activeDeliveryTargets.delete(currentPositionNode);

    // Process all pending orders for the current node.
    // Check if there are any orders for the current node before entering the loop.
    if (deliveryArrivalTimestamps[currentPositionNode].length > 0) {
        while (deliveryArrivalTimestamps[currentPositionNode].length > 0) {
            // Retrieve the day the order arrived.
            const arrivalDay = deliveryArrivalTimestamps[currentPositionNode].pop();
            // Calculate the time taken for this delivery.
            const timeTakenForDelivery = simulationDay - arrivalDay;
            // Add to total score using the defined formula.
            totalScoreAccumulated += maxSimulationDaysSquared - (timeTakenForDelivery * timeTakenForDelivery);
        }
    }
}