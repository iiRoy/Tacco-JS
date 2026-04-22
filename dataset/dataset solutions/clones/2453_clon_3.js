"use strict";

// Renamed and rewritten xArray without eval.
// Creates a multi-dimensional array initialized with a base value or structure.
function createNestedArray(initialValue, ...dimensions) {
    if (dimensions.length === 0) {
        return initialValue;
    }
    const currentDimSize = dimensions[0];
    const remainingDims = dimensions.slice(1);
    const result = new Array(currentDimSize);
    for (let idx = 0; idx < currentDimSize; idx++) {
        result[idx] = createNestedArray(initialValue, ...remainingDims);
    }
    return result;
}

// Renamed and slightly restructured Union-Find data structure
class DisjointSetManager {
    constructor(nodeCount) {
        // Guard clause for invalid input
        if (nodeCount < 0) {
            throw new Error("Node count must be non-negative.");
        }
        // Negative value indicates root and its absolute value is the size of the set.
        // Non-negative value indicates parent.
        this.parentOrSize = new Array(nodeCount + 1).fill(-1);
    }

    // Finds the representative (root) of the set containing element 'elementId'.
    // Applies path compression for optimization.
    findRepresentative(elementId) {
        const currentParent = this.parentOrSize[elementId];
        if (currentParent < 0) { // If negative, it's a root
            return elementId;
        }
        // Path compression: set parent directly to the root
        return this.parentOrSize[elementId] = this.findRepresentative(currentParent);
    }

    // Checks if two elements 'itemA' and 'itemB' belong to the same set.
    areConnected(itemA, itemB) {
        return this.findRepresentative(itemA) === this.findRepresentative(itemB);
    }

    // Merges the sets containing 'itemA' and 'itemB'.
    // Returns true if a merge occurred, false if they were already in the same set.
    unionSets(itemA, itemB) {
        let rootA = this.findRepresentative(itemA);
        let rootB = this.findRepresentative(itemB);

        // If they are already in the same set, no union needed.
        if (rootA === rootB) {
            return false; // Indicate no change
        }

        // Union by size (rank) heuristic: attach smaller tree under larger tree.
        // The parentOrSize stores negative of size for roots.
        const sizeA = this.parentOrSize[rootA]; // This is negative
        const sizeB = this.parentOrSize[rootB]; // This is negative

        if (sizeA <= sizeB) { // If set A is larger or equal in size (more negative value)
            this.parentOrSize[rootB] += sizeA; // Add size of A to B (making B's size more negative)
            this.parentOrSize[rootA] = rootB; // Make B the parent of A
        } else { // Set B is larger
            this.parentOrSize[rootA] += sizeB; // Add size of B to A
            this.parentOrSize[rootB] = rootA; // Make A the parent of B
        }
        return true; // Indicate a merge occurred
    }

    // Returns the size of the set containing 'elementId'.
    getSetSize(elementId) {
        return -this.parentOrSize[this.findRepresentative(elementId)];
    }
}

// Grouping global state into an object for better organization
const simulationState = {
    currentPathLength: 0,
    currentVertex: 0,
    currentDay: 0,
    lastProcessedDay: -1, // Renamed 'takeday'
    totalScore: 0,
    maxAllowedTime: 0, // Renamed 'tmax'
    maxAllowedTimeSquared: 0, // Renamed 'tmax2'
    infinityValue: 1e9, // Renamed 'INF'
    numVertices: 0, // Renamed 'V'
    numEdges: 0, // Renamed 'E'
    shortestPathDistances: null, // Renamed 'dist'
    directEdgeDistances: null, // Renamed 'directDist'
    adjacencyList: null, // Renamed 'e'
    itemFrequencies: null, // Renamed 'f'
    itemsToDeliver: new Set(), // Renamed 'has'
    pendingDeliveryItems: new Set(), // Renamed 'ready'
    deliveryRoutePlan: [], // Renamed 'round'
    itemOrderTimestamps: [], // Renamed 'orderTime'
    inputBuffer: [], // Renamed 'item'
    outputLog: [], // Renamed 'out'
    inputBufferIndex: 0, // Renamed 'cx'
};

// Renamed input retrieval function
function retrieveNextInputItem() {
    // Add a guard clause for empty buffer
    if (simulationState.inputBufferIndex >= simulationState.inputBuffer.length) {
        console.error("Attempted to read beyond input buffer. This indicates an issue in input processing.");
        return null; // Or throw an error, depending on desired error handling
    }
    return +simulationState.inputBuffer[simulationState.inputBufferIndex++];
}

// Renamed Kruskal's algorithm function
function calculateMinimumSpanningTree(targetVertices) {
    // Include vertex 0 (depot) in the set of vertices for MST calculation
    const verticesForMST = Array.from(targetVertices);
    if (!verticesForMST.includes(0)) {
        verticesForMST.push(0);
    }
    
    const numNodesInSubgraph = verticesForMST.length;
    const allEdges = [];

    // Generate all possible edges between the selected vertices
    for (let i = 0; i < numNodesInSubgraph; i++) {
        for (let j = i + 1; j < numNodesInSubgraph; j++) {
            const u = verticesForMST[i];
            const v = verticesForMST[j];
            const weight = simulationState.shortestPathDistances[u][v];
            allEdges.push([u, v, weight]);
        }
    }

    // Sort edges by weight in ascending order
    allEdges.sort((edgeA, edgeB) => edgeA[2] - edgeB[2]);

    const dsu = new DisjointSetManager(simulationState.numVertices);
    const mstEdges = [];
    let connectedComponents = 1; // Start with 1 as vertex 0 is always included

    // Iterate through sorted edges to build the MST
    for (const [node1, node2, edgeWeight] of allEdges) {
        // Check if adding this edge connects two previously disconnected components
        if (dsu.unionSets(node1, node2)) { // unionSets returns true if a merge occurred
            mstEdges.push([node1, node2, edgeWeight]);
            // The condition `dsu.getSetSize(0) !== numNodesInSubgraph` could be used,
            // but `mstEdges.length === numNodesInSubgraph - 1` is also valid for a connected graph.
            // Original code used `uf.size(0) !== n`, which means all target vertices are connected to 0.
            // Let's keep the spirit of checking connectivity to the depot.
            if (dsu.getSetSize(0) === numNodesInSubgraph) { // All target vertices are now connected to the depot
                break;
            }
        }
    }
    return mstEdges;
}

// Renamed delivery path determination function
function getNextDeliveryTarget() {
    const s = simulationState;

    // Case 1: No items currently held for delivery.
    if (s.itemsToDeliver.size === 0) {
        // If current vertex is depot (0), no further action needed immediately.
        if (s.currentVertex === 0) {
            return -2; // Special code for no action
        }
        // Otherwise, return to depot.
        return navigateToNextHop(0);
    }

    // Case 2: Current vertex is the last one in the planned delivery route.
    if (s.currentVertex === s.deliveryRoutePlan[s.deliveryRoutePlan.length - 1]) {
        s.deliveryRoutePlan.pop(); // Remove the current vertex from the route.

        // Remove any subsequent vertices in the route that are already 'ready' (delivered).
        while (s.deliveryRoutePlan.length > 0 && s.pendingDeliveryItems.has(s.deliveryRoutePlan[s.deliveryRoutePlan.length - 1])) {
            s.deliveryRoutePlan.pop();
        }

        // If route is now empty, return to depot.
        if (s.deliveryRoutePlan.length === 0) {
            return navigateToNextHop(0);
        }
    }

    // Case 3: Continue along the planned route.
    return navigateToNextHop(s.deliveryRoutePlan[s.deliveryRoutePlan.length - 1]);
}

// Renamed shortest path navigation helper
function navigateToNextHop(destinationNode) {
    const s = simulationState;

    // If already at the destination, no movement needed.
    if (destinationNode === s.currentVertex) {
        return -2; // Special code for no movement
    }

    // Iterate through neighbors of current vertex to find the next hop on the shortest path.
    // This relies on the precomputed shortestPathDistances (Floyd-Warshall).
    for (const neighbor of s.adjacencyList[s.currentVertex]) {
        // Check if `currentVertex -> neighbor -> destinationNode` is a shortest path.
        if (s.shortestPathDistances[s.currentVertex][destinationNode] ===
            s.directEdgeDistances[s.currentVertex][neighbor] + s.shortestPathDistances[neighbor][destinationNode]) {
            
            // Set remaining path length for this segment.
            s.currentPathLength = s.directEdgeDistances[s.currentVertex][neighbor] - 1;
            s.currentVertex = neighbor; // Move to the neighbor.
            return s.currentVertex;
        }
    }
    // Should not happen if paths are correctly computed and graph is connected.
    return -2; // Fallback, no valid next hop found.
}

// Main daily action processing function
function executeDailyTurn() {
    const s = simulationState;

    // If currently traversing a path segment, decrement length and stay put.
    if (s.currentPathLength > 0) {
        s.currentPathLength--;
        return s.currentVertex;
    }

    // If at depot (vertex 0), collect new items and plan route.
    if (s.currentVertex === 0) {
        handleItemPickupAndRoutePlanning();
    } else { // Otherwise, deliver item at current vertex.
        processItemDelivery();
    }

    // Determine the next target vertex for movement.
    return getNextDeliveryTarget();
}

// Renamed item pickup and route planning function
function handleItemPickupAndRoutePlanning() {
    const s = simulationState;

    s.pendingDeliveryItems.clear(); // Clear previously 'ready' items
    s.deliveryRoutePlan = []; // Clear previous route plan

    // Process all items that have arrived up to the current day
    while (s.lastProcessedDay < s.currentDay) {
        s.lastProcessedDay++;
        const numNewItems = retrieveNextInputItem();
        for (let k = 0; k < numNewItems; k++) {
            const itemId = retrieveNextInputItem() - 1; // Adjust to 0-indexed
            const destinationNode = retrieveNextInputItem() - 1; // Adjust to 0-indexed
            s.itemsToDeliver.add(destinationNode);
            // Ensure array exists for destination node before pushing
            if (!s.itemOrderTimestamps[destinationNode]) {
                s.itemOrderTimestamps[destinationNode] = [];
            }
            s.itemOrderTimestamps[destinationNode].push(s.lastProcessedDay);
        }
    }

    // If no items to deliver, no route planning needed.
    if (s.itemsToDeliver.size === 0) {
        return;
    }

    // Calculate MST for the items to deliver (including depot)
    const mstEdges = calculateMinimumSpanningTree(s.itemsToDeliver);
    
    // Build an adjacency list for the MST
    const mstAdjacency = createNestedArray([], s.numVertices);
    for (const [u, v, weight] of mstEdges) {
        mstAdjacency[u].push(v);
        mstAdjacency[v].push(u);
    }

    // Perform DFS from depot (vertex 0) to generate a delivery route
    // The route will be filled in s.deliveryRoutePlan
    depthFirstTraversalForRoute(0, -1, mstAdjacency);

    s.deliveryRoutePlan.reverse(); // Reverse to get path from depot to farthest item
    // Remove the starting depot (0) if it's the last element after reverse
    if (s.deliveryRoutePlan.length > 0 && s.deliveryRoutePlan[s.deliveryRoutePlan.length - 1] === 0) {
        s.deliveryRoutePlan.pop();
    }
}

// Renamed DFS helper for route planning
function depthFirstTraversalForRoute(currentNode, parentNode, graphAdjacency) {
    simulationState.deliveryRoutePlan.push(currentNode);
    for (const neighborNode of graphAdjacency[currentNode]) {
        if (neighborNode === parentNode) {
            continue;
        }
        depthFirstTraversalForRoute(neighborNode, currentNode, graphAdjacency);
    }
}

// Renamed item delivery and score update function
function processItemDelivery() {
    const s = simulationState;
    // Remove the item from the set of items still to be delivered
    s.itemsToDeliver.delete(s.currentVertex);
    // Mark this item as 'ready' (delivered)
    s.pendingDeliveryItems.add(s.currentVertex);

    // Calculate score for each item delivered at this vertex
    if (s.itemOrderTimestamps[s.currentVertex]) { // Guard against undefined
        while (s.itemOrderTimestamps[s.currentVertex].length > 0) {
            const pickupDay = s.itemOrderTimestamps[s.currentVertex].pop();
            const deliveryTime = s.currentDay - pickupDay;
            s.totalScore += s.maxAllowedTimeSquared - (deliveryTime * deliveryTime);
        }
    }
}

// Helper for parsing input lines
const parseLineOfNumbers = (line) => line.split(/\s+/).map(Number);

// Main execution generator function, heavily rewritten and renamed
const mainSimulationProcess = (function* () {
    const inputInterface = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const getNextInputLine = () => new Promise(resolve => inputInterface.once("line", resolve));

    let lineData;

    // --- Initial Configuration Reading ---
    lineData = yield getNextInputLine();
    let initialParams = parseLineOfNumbers(lineData);
    simulationState.numVertices = initialParams[0];
    simulationState.numEdges = initialParams[1];

    // Initialize distance matrices and adjacency list
    simulationState.shortestPathDistances = createNestedArray(simulationState.infinityValue, simulationState.numVertices, simulationState.numVertices);
    simulationState.directEdgeDistances = createNestedArray(simulationState.infinityValue, simulationState.numVertices, simulationState.numVertices);
    simulationState.adjacencyList = createNestedArray([], simulationState.numVertices);
    simulationState.itemOrderTimestamps = createNestedArray([], simulationState.numVertices); // Ensure this is initialized correctly

    // Set diagonal to 0 for shortest path distances (distance from a node to itself)
    for (let vIdx = 0; vIdx < simulationState.numVertices; vIdx++) {
        simulationState.shortestPathDistances[vIdx][vIdx] = 0;
    }

    // Read edge data
    for (let edgeIdx = 0; edgeIdx < simulationState.numEdges; edgeIdx++) {
        lineData = yield getNextInputLine();
        const edgeInfo = parseLineOfNumbers(lineData);
        const vertexA = edgeInfo[0] - 1; // Adjust to 0-indexed
        const vertexB = edgeInfo[1] - 1; // Adjust to 0-indexed
        const edgeWeight = edgeInfo[2];

        // Store distances and build adjacency list for an undirected graph
        simulationState.shortestPathDistances[vertexA][vertexB] = simulationState.shortestPathDistances[vertexB][vertexA] = edgeWeight;
        simulationState.directEdgeDistances[vertexA][vertexB] = simulationState.directEdgeDistances[vertexB][vertexA] = edgeWeight;
        simulationState.adjacencyList[vertexA].push(vertexB);
        simulationState.adjacencyList[vertexB].push(vertexA);
    }

    // --- Floyd-Warshall Algorithm for All-Pairs Shortest Paths ---
    for (let intermedK = 0; intermedK < simulationState.numVertices; intermedK++) {
        for (let sourceI = 0; sourceI < simulationState.numVertices; sourceI++) {
            for (let destJ = 0; destJ < simulationState.numVertices; destJ++) {
                const pathThroughK = simulationState.shortestPathDistances[sourceI][intermedK] + simulationState.shortestPathDistances[intermedK][destJ];
                if (pathThroughK < simulationState.shortestPathDistances[sourceI][destJ]) {
                    simulationState.shortestPathDistances[sourceI][destJ] = pathThroughK;
                }
            }
        }
    }

    // Read item frequencies (though not directly used in the provided logic)
    lineData = yield getNextInputLine();
    simulationState.itemFrequencies = parseLineOfNumbers(lineData);

    // Read maximum simulation time
    lineData = yield getNextInputLine();
    simulationState.maxAllowedTime = Number(lineData);
    simulationState.maxAllowedTimeSquared = simulationState.maxAllowedTime * simulationState.maxAllowedTime;

    // --- Main Simulation Loop ---
    for (; simulationState.currentDay < simulationState.maxAllowedTime; simulationState.currentDay++) {
        // Input block 1: Number of new items today
        const numNewItemBatches = Number(yield getNextInputLine());
        simulationState.inputBuffer.push(numNewItemBatches);
        for (let i = 0; i < numNewItemBatches; i++) {
            const itemDetails = parseLineOfNumbers(yield getNextInputLine());
            simulationState.inputBuffer.push(itemDetails[0], itemDetails[1]);
            simulationState.pendingDeliveryItems.add(itemDetails[1] - 1); // Track items that arrived today
        }

        // Input block 2: Number of queries (ignored in original logic)
        const numQueriesA = Number(yield getNextInputLine());
        for (let i = 0; i < numQueriesA; i++) {
            yield getNextInputLine(); // Consume query lines
        }

        // Execute daily logic and get next target vertex
        const nextTargetVertex = executeDailyTurn();
        simulationState.outputLog[simulationState.currentDay] = nextTargetVertex + 1; // Adjust to 1-indexed output
        process.stdout.write(simulationState.outputLog[simulationState.currentDay] + "\n");

        // Input block 3: Status check (e.g., "OK")
        const statusLine = yield getNextInputLine();
        if (statusLine[0] !== "O") { // Check first character for "O" (for "OK")
            // Optional: Log final score or state before exiting
            // console.error("Simulation terminated early by input status:", statusLine);
            break; // Exit the simulation loop
        }

        // Input block 4: Number of additional queries (ignored in original logic)
        const numQueriesB = Number(yield getNextInputLine());
        for (let i = 0; i < numQueriesB; i++) {
            yield getNextInputLine(); // Consume query lines
        }
    }
    // Optional: Log final score after simulation completes
    // console.error("Final Score:", simulationState.totalScore);

    inputInterface.close(); // Close the readline interface
})();

// Start the generator execution
mainSimulationProcess.next();