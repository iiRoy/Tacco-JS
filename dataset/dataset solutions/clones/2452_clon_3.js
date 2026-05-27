"use strict";
var fileSystemModule = require("fs");
var rawData = fileSystemModule.readFileSync("/dev/stdin", "utf8");
var tokenStream = rawData.split(/ |\n/);
var tokenIndex = 0;

function readNextNumber() {
    return +tokenStream[tokenIndex++];
}

function readNextString() {
    return tokenStream[tokenIndex++];
}

// Type III change: Rewrite xArray to avoid eval and use a recursive approach.
// This function creates a multi-dimensional array initialized with a given value.
// If the initialValue is the string "[]", it initializes with new empty arrays.
function createMultiDimArray(initialValue, ...dimensions) {
    const buildDimension = (currentDimIndex) => {
        const currentDimSize = dimensions[currentDimIndex];
        if (currentDimIndex === dimensions.length - 1) {
            // Last dimension: fill with initial values or new empty arrays
            if (typeof initialValue === 'string' && initialValue === "[]") {
                return Array(currentDimSize).fill(0).map(() => []);
            } else {
                return Array(currentDimSize).fill(initialValue);
            }
        } else {
            // Recursive call for inner dimensions
            return Array(currentDimSize).fill(0).map(() => buildDimension(currentDimIndex + 1));
        }
    };
    return buildDimension(0);
}


var remainingPathLength = 0;
var currentVertex = 0;
var currentDay = 0;
var lastOrderDay = -1;
var totalScore = 0;

const INFINITY_VAL = 1e9;
const numVertices = readNextNumber(); // 200-400
const numEdges = readNextNumber(); // 1.5V-2V

// Type III change: Use the rewritten createMultiDimArray
const shortestPathDistances = createMultiDimArray(INFINITY_VAL, numVertices, numVertices);
const edgeWeights = createMultiDimArray(INFINITY_VAL, numVertices, numVertices);
const adjList = createMultiDimArray("[]", numVertices); // Each element is an array

// Type III change: Extract graph initialization into a dedicated function
initializeGraphStructure();

const maxDays = readNextNumber(); // 10000
const maxDaysSquared = maxDays * maxDays;
const dailyActions = Array(maxDays);
const pendingDeliveries = new Set();
const deliveryOrderTimes = createMultiDimArray("[]", numVertices); // Each element is an array

// Type III change: Removed dead code block (if(0){...})
// The original code had an if(0) block here, which is unreachable.

console.log(runSimulation());

function runSimulation() {
    // Floyd-Warshall algorithm to find all-pairs shortest paths
    // Type III change: Added temporary variable for clarity in loop
    for (let k_intermediate = 0; k_intermediate < numVertices; k_intermediate++) {
        for (let i_start = 0; i_start < numVertices; i_start++) {
            for (let j_end = 0; j_end < numVertices; j_end++) {
                const pathThroughK = shortestPathDistances[i_start][k_intermediate] + shortestPathDistances[k_intermediate][j_end];
                if (pathThroughK < shortestPathDistances[i_start][j_end]) {
                    shortestPathDistances[i_start][j_end] = pathThroughK;
                }
            }
        }
    }

    while (currentDay < maxDays) {
        dailyActions[currentDay] = executeDailyAction() + 1; // +1 for 1-based indexing in output
        if (remainingPathLength < 0) { // This condition seems to be an error state or debug output
            console.log(currentDay, remainingPathLength, currentVertex);
            return; // Early exit, as in original
        }
        currentDay++;
    }
    return dailyActions.join("\n");
}

// Type III change: Renamed and slightly refactored getE
function initializeGraphStructure() {
    // Initialize self-distances to 0
    for (let i = 0; i < numVertices; i++) {
        shortestPathDistances[i][i] = 0;
    }

    // Read edges and populate adjacency list and distance matrices
    for (let i = 0; i < numEdges; i++) {
        const vertexA = readNextNumber() - 1; // Adjust to 0-based index
        const vertexB = readNextNumber() - 1; // Adjust to 0-based index
        const weight = readNextNumber();

        // Update shortestPathDistances and edgeWeights for undirected graph
        shortestPathDistances[vertexA][vertexB] = shortestPathDistances[vertexB][vertexA] = weight;
        edgeWeights[vertexA][vertexB] = edgeWeights[vertexB][vertexA] = weight;

        // Add to adjacency list
        adjList[vertexA].push(vertexB);
        adjList[vertexB].push(vertexA);
    }
}

// Type III change: Renamed and slightly refactored deliver
function determineNextDeliveryTarget() {
    if (pendingDeliveries.size === 0) {
        // No pending deliveries, check if current vertex is 0 (start)
        if (currentVertex === 0) {
            return -2; // No orders, at start, nothing to do
        }
        // If not at start, try to return to start (vertex 0)
        return findNextStepOnPath(0);
    }

    let bestTargetVertex = -1;
    let maxOrdersAtTarget = 0;
    const remainingSimulationDays = maxDays - currentDay; // Helper variable

    // Iterate through pending deliveries to find the best target
    for (const targetNode of pendingDeliveries) {
        const currentTargetOrderCount = deliveryOrderTimes[targetNode].length;
        const isReachableInTime = shortestPathDistances[currentVertex][targetNode] <= remainingSimulationDays;

        // Type III change: Reordered conditions for clarity
        if (isReachableInTime && currentTargetOrderCount > maxOrdersAtTarget) {
            maxOrdersAtTarget = currentTargetOrderCount;
            bestTargetVertex = targetNode;
        }
    }

    if (bestTargetVertex === -1) {
        return -2; // No suitable delivery target found
    }
    return findNextStepOnPath(bestTargetVertex);
}

// Type III change: Renamed and slightly refactored minPath
function findNextStepOnPath(destinationVertex) {
    // Find the next vertex on the shortest path from currentVertex to destinationVertex
    for (const neighborVertex of adjList[currentVertex]) {
        const calculatedPathLength = edgeWeights[currentVertex][neighborVertex] + shortestPathDistances[neighborVertex][destinationVertex]; // Helper variable
        if (shortestPathDistances[currentVertex][destinationVertex] === calculatedPathLength) {
            remainingPathLength = edgeWeights[currentVertex][neighborVertex] - 1; // Decrement length for current step
            currentVertex = neighborVertex; // Move to the next vertex
            return currentVertex;
        }
    }
    return -2; // Should not happen if a path exists, indicates an issue or no direct path
}

// Type III change: Renamed and slightly refactored solve
function executeDailyAction() {
    if (remainingPathLength > 0) { // If currently traversing a path
        remainingPathLength--;
        return currentVertex; // Stay at current vertex (still moving along path)
    }

    // If path traversal is complete (remainingPathLength is 0 or less)
    if (currentVertex === 0) {
        processNewOrders(); // At the start, check for new orders
    } else {
        completeDelivery(); // Not at start, attempt to complete delivery
    }
    return determineNextDeliveryTarget(); // Determine next action (move or deliver)
}

// Type III change: Renamed and slightly refactored take
function processNewOrders() {
    while (lastOrderDay < currentDay) {
        lastOrderDay++;
        const numNewOrders = readNextNumber(); // Helper variable
        for (let i = 0; i < numNewOrders; i++) {
            // var orderId = readNextNumber() - 1; // Original code uses 'id' but doesn't use it.
            readNextNumber(); // Consume the order ID, but it's not used.
            const deliveryLocation = readNextNumber() - 1; // Adjust to 0-based index
            pendingDeliveries.add(deliveryLocation);
            deliveryOrderTimes[deliveryLocation].push(lastOrderDay);
        }
    }
}

// Type III change: Renamed and slightly refactored give
function completeDelivery() {
    // Remove current vertex from pending deliveries
    pendingDeliveries.delete(currentVertex);

    // Process all orders for the current vertex
    while (deliveryOrderTimes[currentVertex].length > 0) {
        const orderArrivalDay = deliveryOrderTimes[currentVertex].pop();
        const timeElapsed = currentDay - orderArrivalDay;
        const penaltyTerm = timeElapsed * timeElapsed; // Helper variable for clarity
        totalScore += maxDaysSquared - penaltyTerm;
    }
}
