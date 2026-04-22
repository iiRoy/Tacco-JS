"use strict";

// Helper function to create multi-dimensional arrays, initialized with a specific value.
// This replaces the original `xArray` function to avoid `eval` for security and clarity.
// It recursively builds the nested array structure.
function createMultiDimensionalArray(initialValue, ...dimensions) {
    // Base case: if no more dimensions, return the initial value.
    if (dimensions.length === 0) {
        // If the initialValue is an array literal string (e.g., "[]"), parse it to create a new array.
        // This ensures each innermost element is a distinct empty array, not a reference to the same one.
        if (typeof initialValue === 'string' && initialValue === "[]") {
            return [];
        }
        return initialValue;
    }

    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    const newArray = new Array(currentDimensionSize);
    for (let i = 0; i < currentDimensionSize; i++) {
        newArray[i] = createMultiDimensionalArray(initialValue, ...remainingDimensions);
    }
    return newArray;
}

// Global variables representing the simulation state and graph data.
// Renamed for clarity and to fulfill Type II changes.
let travelStepsRemaining = 0; // Number of steps remaining to reach the next intermediate node
let currentVehicleNode = 0;   // The current node ID where the vehicle is located (0-indexed)
let currentSimulationDay = 0; // The current day in the simulation
let lastOrderIntakeDay = -1;  // The last day on which new orders were processed
let totalDeliveryPenalty = 0; // Accumulates the penalty score for late deliveries

const MAX_PATH_VALUE = 1e9; // Represents an infinitely large path cost for unreachable nodes
let numGraphNodes;          // Total number of nodes (vertices) in the graph
let numGraphEdges;          // Total number of edges in the graph

let allPairsShortestPaths; // 2D array storing shortest path distances between any two nodes (Floyd-Warshall result)
let edgeDistances;         // 2D array storing direct distances for adjacent nodes
let graphAdjacencyList;    // Adjacency list: `graphAdjacencyList[nodeId]` is an array of neighbors

let maxSimulationDuration;      // Total number of days the simulation will run
let maxDurationPenaltyFactor;   // Pre-calculated square of maxSimulationDuration for penalty calculation

const activeDeliveryRequests = new Set(); // Set of node IDs that currently have pending deliveries
let nodeOrderTimestamps;                  // 2D array: `nodeOrderTimestamps[nodeId]` is an array of days when orders arrived at `nodeId`

let inputQueueBuffer = []; // Buffer to store parsed input values from the generator
let inputQueuePointer = 0; // Pointer to the current position in `inputQueueBuffer`

let dailyVehicleOutput = []; // Stores the vehicle's destination node for each day

// Helper function to consume the next value from the input buffer.
function readNextBufferedInput() {
    // Basic validation: ensure pointer is within bounds
    if (inputQueuePointer >= inputQueueBuffer.length) {
        console.error("Error: Attempted to read past end of input buffer.");
        // In a real application, this might throw an error or handle gracefully.
        return null;
    }
    return +inputQueueBuffer[inputQueuePointer++]; // Convert to number and advance pointer
}

/**
 * Calculates the penalty for a completed delivery.
 * @param {number} orderArrivalDay - The day the order arrived.
 * @param {number} deliveryCompletionDay - The day the order was delivered.
 * @returns {number} The penalty score for this delivery.
 */
function calculateDeliveryPenalty(orderArrivalDay, deliveryCompletionDay) {
    const timeTaken = deliveryCompletionDay - orderArrivalDay;
    // Penalty formula: maxDurationPenaltyFactor - (timeTaken * timeTaken)
    return maxDurationPenaltyFactor - (timeTaken * timeTaken);
}

/**
 * Determines the next delivery target for the vehicle.
 * Prioritizes nodes with the most pending orders that are reachable within the remaining simulation time.
 * @returns {number} The ID of the next target node, or -2 if no suitable target is found.
 */
function determineNextDeliveryTarget() {
    // If no active delivery requests, and vehicle is at the starting node (0), return -2 (no action).
    // If vehicle is at start node (0) and there are no active requests, it implies it's waiting for new orders.
    if (activeDeliveryRequests.size === 0) {
        if (currentVehicleNode === 0) {
            console.debug(`[Day ${currentSimulationDay}] No active requests and at depot. Waiting.`);
            return -2;
        }
        // If no active requests but not at depot, go back to depot.
        console.debug(`[Day ${currentSimulationDay}] No active requests. Returning to depot (node 0).`);
        return findNextStepOnShortestPath(0);
    }

    let bestTargetNode = -1;
    let maxOrdersFound = -1; // Use -1 to ensure any valid order count (0 or more) is considered

    // Iterate through all nodes with active delivery requests
    for (const targetNodeId of activeDeliveryRequests) {
        const ordersAtNodeCount = nodeOrderTimestamps[targetNodeId].length;

        // Check if the target node is reachable within the remaining simulation duration
        // and if it has more orders than the current best target.
        const timeToReachTarget = allPairsShortestPaths[currentVehicleNode][targetNodeId];
        const remainingDays = maxSimulationDuration - currentSimulationDay;

        if (timeToReachTarget <= remainingDays) {
            if (ordersAtNodeCount > maxOrdersFound) {
                maxOrdersFound = ordersAtNodeCount;
                bestTargetNode = targetNodeId;
            }
        } else {
            console.debug(`[Day ${currentSimulationDay}] Node ${targetNodeId} (${ordersAtNodeCount} orders) is too far to reach (${timeToReachTarget} days > ${remainingDays} days remaining).`);
        }
    }

    if (bestTargetNode === -1) {
        console.debug(`[Day ${currentSimulationDay}] No reachable target node with active orders found. Returning to depot.`);
        // If no suitable target found, try to return to depot (node 0)
        return findNextStepOnShortestPath(0);
    }
    
    console.debug(`[Day ${currentSimulationDay}] Next best target is node ${bestTargetNode} with ${maxOrdersFound} orders.`);
    return findNextStepOnShortestPath(bestTargetNode);
}

/**
 * Finds the next step on a shortest path from `currentVehicleNode` to `destinationNode`.
 * Updates `travelStepsRemaining` and `currentVehicleNode`.
 * @param {number} destinationNode - The ultimate destination node.
 * @returns {number} The ID of the next node on the path, or -2 if no path or immediate step found.
 */
function findNextStepOnShortestPath(destinationNode) {
    if (currentVehicleNode === destinationNode) {
        console.debug(`[Day ${currentSimulationDay}] Already at destination node ${destinationNode}.`);
        return currentVehicleNode; // Already at destination
    }

    // Iterate through all neighbors of the current vehicle node.
    for (const neighborNodeId of graphAdjacencyList[currentVehicleNode]) {
        // Check if `neighborNodeId` is the next step on *a* shortest path to `destinationNode`.
        // This is true if the distance from `currentVehicleNode` to `destinationNode`
        // equals the direct distance to `neighborNodeId` plus the shortest distance from `neighborNodeId` to `destinationNode`.
        if (allPairsShortestPaths[currentVehicleNode][destinationNode] === edgeDistances[currentVehicleNode][neighborNodeId] + allPairsShortestPaths[neighborNodeId][destinationNode]) {
            // Set the remaining travel steps for this edge.
            // If the direct edge distance is D, it takes D days. `travelStepsRemaining` becomes D-1,
            // meaning D-1 more days after this current simulation day will be spent on this segment.
            travelStepsRemaining = edgeDistances[currentVehicleNode][neighborNodeId] - 1;
            const nextHopNode = neighborNodeId;
            currentVehicleNode = nextHopNode; // Move vehicle to the next node immediately for this day's action
            console.debug(`[Day ${currentSimulationDay}] Moving from ${currentVehicleNode} to ${nextHopNode}. Remaining steps on edge: ${travelStepsRemaining}`);
            return nextHopNode;
        }
    }
    console.warn(`[Day ${currentSimulationDay}] Could not find next step on shortest path from ${currentVehicleNode} to ${destinationNode}.`);
    return -2; // Should not happen if paths are correctly calculated and destination is reachable
}

/**
 * Executes the operations for a single simulation day.
 * @returns {number} The node ID where the vehicle is or is heading towards.
 */
function executeDailyOperations() {
    // If the vehicle is currently traveling along an edge, just decrement travel steps.
    if (travelStepsRemaining > 0) {
        travelStepsRemaining--;
        console.debug(`[Day ${currentSimulationDay}] Vehicle is traveling. Steps remaining: ${travelStepsRemaining}. Current node: ${currentVehicleNode}`);
        return currentVehicleNode;
    }

    // If travelStepsRemaining is 0, the vehicle has arrived at a node.
    // Decide whether to process new orders or complete deliveries.
    if (currentVehicleNode === 0) {
        processIncomingOrders(); // At the depot, process any new orders for the current day.
    } else {
        completeDeliveryAtCurrentLocation(); // At a delivery node, complete orders.
    }
    
    // After processing, determine the next action (delivery or return to depot).
    return determineNextDeliveryTarget();
}

/**
 * Processes new incoming orders for the current day.
 * This function is called when the vehicle is at the depot (node 0).
 */
function processIncomingOrders() {
    // Increment `lastOrderIntakeDay` to the current simulation day.
    // This loop ensures all orders up to the current day are processed.
    while (lastOrderIntakeDay < currentSimulationDay) {
        lastOrderIntakeDay++;
        console.debug(`[Day ${currentSimulationDay}] Processing orders for day ${lastOrderIntakeDay}.`);

        // Read the number of orders for this day from the input buffer.
        const numberOfOrders = readNextBufferedInput();
        if (numberOfOrders === null) {
            console.error(`[Day ${currentSimulationDay}] Failed to read number of orders.`);
            return;
        }
        inputQueueBuffer.push(numberOfOrders); // Push back for `readNextBufferedInput` consistency if used elsewhere

        for (let i = 0; i < numberOfOrders; i++) {
            // Read order details: node ID and delivery day.
            const orderedNodeId = readNextBufferedInput() - 1; // Convert to 0-indexed
            const deliveryDay = readNextBufferedInput() - 1; // Convert to 0-indexed
            
            if (orderedNodeId < 0 || orderedNodeId >= numGraphNodes) {
                console.warn(`[Day ${currentSimulationDay}] Invalid ordered node ID: ${orderedNodeId + 1}. Skipping order.`);
                continue;
            }

            // Add the node to the set of active delivery requests.
            activeDeliveryRequests.add(orderedNodeId);
            // Record the day the order arrived at this node.
            nodeOrderTimestamps[orderedNodeId].push(lastOrderIntakeDay);
            console.debug(`[Day ${currentSimulationDay}] Order received for node ${orderedNodeId}. Arrival Day: ${lastOrderIntakeDay}.`);
        }
    }
}

/**
 * Completes deliveries at the `currentVehicleNode`.
 * This function is called when the vehicle arrives at a non-depot node.
 */
function completeDeliveryAtCurrentLocation() {
    // If the current node has no pending orders, it shouldn't be in `activeDeliveryRequests`.
    if (nodeOrderTimestamps[currentVehicleNode].length === 0) {
        activeDeliveryRequests.delete(currentVehicleNode);
        console.debug(`[Day ${currentSimulationDay}] No pending orders at node ${currentVehicleNode}. Removing from active requests.`);
        return;
    }

    console.debug(`[Day ${currentSimulationDay}] Completing deliveries at node ${currentVehicleNode}. Orders pending: ${nodeOrderTimestamps[currentVehicleNode].length}`);

    // Process all pending orders at the current node.
    while (nodeOrderTimestamps[currentVehicleNode].length > 0) {
        const orderArrivalDay = nodeOrderTimestamps[currentVehicleNode].pop(); // Get the oldest pending order's arrival day
        const penalty = calculateDeliveryPenalty(orderArrivalDay, currentSimulationDay);
        totalDeliveryPenalty += penalty;
        console.debug(`[Day ${currentSimulationDay}] Delivered order at node ${currentVehicleNode} (arrived day ${orderArrivalDay}). Penalty: ${penalty}. Total Penalty: ${totalDeliveryPenalty}`);
    }
    // After delivering all orders, remove this node from active requests.
    activeDeliveryRequests.delete(currentVehicleNode);
}

// Node.js readline interface setup for input.
const inputReader = require("readline").createInterface(process.stdin, process.stdout);

// Generator function to handle asynchronous input reading and simulation flow.
const simulationOrchestrator = (function* () {
    // Helper to get the next line from input.
    const getNextLineFromInput = () => inputReader.once("line", line => simulationOrchestrator.next(line));

    console.debug("--- Simulation Setup Phase ---");

    // Phase 1: Read initial graph configuration (nodes and edges).
    let firstLineParts = (yield getNextLineFromInput()).split(" ");
    numGraphNodes = parseInt(firstLineParts[0], 10);
    numGraphEdges = parseInt(firstLineParts[1], 10);

    // Basic input validation
    if (isNaN(numGraphNodes) || isNaN(numGraphEdges) || numGraphNodes <= 0 || numGraphEdges < 0) {
        console.error(`Invalid graph dimensions: Nodes=${numGraphNodes}, Edges=${numGraphEdges}. Exiting.`);
        return;
    }

    // Initialize graph data structures.
    allPairsShortestPaths = createMultiDimensionalArray(MAX_PATH_VALUE, numGraphNodes, numGraphNodes);
    edgeDistances = createMultiDimensionalArray(MAX_PATH_VALUE, numGraphNodes, numGraphNodes);
    graphAdjacencyList = createMultiDimensionalArray("[]", numGraphNodes); // Each element is an empty array

    // Initialize self-distances to zero.
    for (let nodeIdx = 0; nodeIdx < numGraphNodes; nodeIdx++) {
        allPairsShortestPaths[nodeIdx][nodeIdx] = 0;
    }

    // Read edge information and populate adjacency list and direct distances.
    for (let edgeIdx = 0; edgeIdx < numGraphEdges; edgeIdx++) {
        let edgeDetails = (yield getNextLineFromInput()).split(" ");
        let nodeA = parseInt(edgeDetails[0], 10) - 1; // Convert to 0-indexed
        let nodeB = parseInt(edgeDetails[1], 10) - 1; // Convert to 0-indexed
        let distance = parseInt(edgeDetails[2], 10);

        // Ensure valid node IDs
        if (nodeA < 0 || nodeA >= numGraphNodes || nodeB < 0 || nodeB >= numGraphNodes) {
            console.warn(`Invalid node ID in edge ${edgeIdx}: (${nodeA + 1}, ${nodeB + 1}). Skipping.`);
            continue;
        }

        // For undirected graph, update both directions.
        allPairsShortestPaths[nodeA][nodeB] = allPairsShortestPaths[nodeB][nodeA] = distance;
        edgeDistances[nodeA][nodeB] = edgeDistances[nodeB][nodeA] = distance;
        graphAdjacencyList[nodeA].push(nodeB);
        graphAdjacencyList[nodeB].push(nodeA);
    }

    console.debug("--- Computing All-Pairs Shortest Paths (Floyd-Warshall) ---");
    // Phase 2: Compute all-pairs shortest paths using Floyd-Warshall algorithm.
    for (let intermediateNode = 0; intermediateNode < numGraphNodes; intermediateNode++) {
        for (let startNode = 0; startNode < numGraphNodes; startNode++) {
            for (let endNode = 0; endNode < numGraphNodes; endNode++) {
                // If path from start to end via intermediate node is shorter.
                if (allPairsShortestPaths[startNode][intermediateNode] + allPairsShortestPaths[intermediateNode][endNode] < allPairsShortestPaths[startNode][endNode]) {
                    allPairsShortestPaths[startNode][endNode] = allPairsShortestPaths[startNode][intermediateNode] + allPairsShortestPaths[intermediateNode][endNode];
                }
            }
        }
    }

    // Phase 3: Read simulation parameters.
    // The original code read a variable 'f' here but never used it. It's removed.
    maxSimulationDuration = parseInt(yield getNextLineFromInput(), 10);
    maxDurationPenaltyFactor = maxSimulationDuration * maxSimulationDuration;

    // Initialize the order timestamps structure.
    nodeOrderTimestamps = createMultiDimensionalArray("[]", numGraphNodes);

    console.debug("--- Simulation Main Loop ---");
    // Phase 4: Main simulation loop, iterating through each day.
    for (currentSimulationDay = 0; currentSimulationDay < maxSimulationDuration; ++currentSimulationDay) {
        console.debug(`--- Starting Day ${currentSimulationDay} ---`);

        // Read daily input: number of incoming orders for this day.
        let ordersCountForDay = parseInt(yield getNextLineFromInput(), 10);
        inputQueueBuffer.push(ordersCountForDay); // Add to buffer for `processIncomingOrders`
        
        // Read details for each order.
        for (let i = 0; i < ordersCountForDay; i++) {
            let orderInputLine = (yield getNextLineFromInput()).split(" ");
            let orderNodeId = parseInt(orderInputLine[0], 10);
            let orderDeliveryDay = parseInt(orderInputLine[1], 10);
            inputQueueBuffer.push(orderNodeId, orderDeliveryDay); // Add details to buffer
        }

        // Read and consume dummy input lines (if any) as per original problem spec.
        let numUnusedInputLines1 = parseInt(yield getNextLineFromInput(), 10);
        for (let i = 0; i < numUnusedInputLines1; i++) {
            yield getNextLineFromInput(); // Consume the line
        }

        // Execute vehicle operations for the current day.
        let vehicleDestinationNode = executeDailyOperations();
        dailyVehicleOutput[currentSimulationDay] = vehicleDestinationNode + 1; // Output 1-indexed node ID
        console.log(dailyVehicleOutput[currentSimulationDay]);
        console.debug(`[Day ${currentSimulationDay}] Vehicle output: ${dailyVehicleOutput[currentSimulationDay]}. Current node: ${currentVehicleNode}. Travel steps remaining: ${travelStepsRemaining}`);

        // Read control signal for early termination.
        let controlSignal = yield getNextLineFromInput();
        if (controlSignal === null || controlSignal.length === 0 || controlSignal[0] !== "O") {
            console.debug(`[Day ${currentSimulationDay}] Received non-'O' control signal: '${controlSignal}'. Terminating simulation.`);
            return; // Exit simulation early
        }

        // Read and consume more dummy input lines.
        let numUnusedInputLines2 = parseInt(yield getNextLineFromInput(), 10);
        for (let i = 0; i < numUnusedInputLines2; i++) {
            yield getNextLineFromInput(); // Consume the line
        }
    }
    console.debug("--- Simulation End ---");
    console.debug(`Final Total Delivery Penalty: ${totalDeliveryPenalty}`);
})();

// Start the generator to begin processing input.
simulationOrchestrator.next();