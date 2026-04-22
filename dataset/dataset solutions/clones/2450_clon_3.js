"use strict";

// Module for file system operations.
const fileSystemMod = require("fs");

// Read all input data from standard input, assuming UTF-8 encoding.
const rawData = fileSystemMod.readFileSync("/dev/stdin", "utf8");

// Split the input into tokens by whitespace or newlines.
const tokenStream = rawData.split(/ |\n/);
let tokenIndex = 0; // Current position in the token stream.

/**
 * Reads and parses the next numeric token from the input stream.
 * @returns {number} The parsed number.
 */
function readNumericToken() {
    // The unary plus operator (+) is a concise way to convert a string to a number.
    return +tokenStream[tokenIndex++];
}

/**
 * Reads the next raw string token from the input stream.
 * @returns {string} The raw string token.
 */
function readStringToken() {
    return tokenStream[tokenIndex++];
}

/**
 * Creates a multi-dimensional array initialized with a specific value or based on a string expression.
 * This function avoids `eval` for security and readability, using `JSON.parse` for simple expressions.
 * @param {any} initializationValue The value to initialize elements with, or a string like "[]" for empty arrays.
 * @param {...number} dimensions The sizes of each dimension (e.g., `createMultiDimArray(0, 2, 3)` for a 2x3 array of zeros).
 * @returns {Array} The created multi-dimensional array.
 */
function createMultiDimArray(initializationValue, ...dimensions) {
    if (dimensions.length === 0) {
        // If no dimensions are provided, return the initialization value directly.
        return initializationValue;
    }

    /**
     * Recursive helper to build dimensions.
     * @param {number} currentDimIndex The index of the current dimension being built.
     * @returns {Array} A dimension of the array.
     */
    const buildDimensionRecursively = (currentDimIndex) => {
        const currentDimSize = dimensions[currentDimIndex];
        return Array.from({ length: currentDimSize }, () => {
            if (currentDimIndex === dimensions.length - 1) {
                // If this is the last dimension, apply the initialization value.
                if (typeof initializationValue === 'string') {
                    try {
                        // Attempt to parse string expressions like "[]" or "0".
                        return JSON.parse(initializationValue);
                    } catch (error) {
                        // If parsing fails, treat it as a literal string value.
                        return initializationValue;
                    }
                }
                return initializationValue;
            } else {
                // Recursively build the next inner dimension.
                return buildDimensionRecursively(currentDimIndex + 1);
            }
        });
    };

    return buildDimensionRecursively(0);
}

/**
 * Implements a Disjoint Set Union (DSU) data structure, also known as Union-Find.
 * Used for efficiently managing sets of elements and checking connectivity.
 */
class DisjointSet {
    /**
     * Initializes the DisjointSet structure for a given number of elements.
     * Elements are typically 0-indexed or 1-indexed up to `elementCount`.
     * @param {number} elementCount The maximum ID of elements that can be stored.
     */
    constructor(elementCount) {
        // `parentArray[i]` stores the parent of element `i`.
        // If `parentArray[i] < 0`, then `i` is a root of its set,
        // and its absolute value `|parentArray[i]|` represents the size of that set.
        this.parentArray = Array(elementCount + 1).fill(-1);
    }

    /**
     * Finds the representative (root) of the set containing `nodeId`.
     * Applies path compression to flatten the tree structure for faster future lookups.
     * @param {number} nodeId The element whose set representative is to be found.
     * @returns {number} The ID of the representative (root) of the set.
     */
    findSetRepresentative(nodeId) {
        if (this.parentArray[nodeId] < 0) {
            return nodeId; // `nodeId` is already a root.
        }
        // Path compression: Recursively find the root and then directly link `nodeId` to it.
        return (this.parentArray[nodeId] = this.findSetRepresentative(this.parentArray[nodeId]));
    }

    /**
     * Checks if two elements, `nodeX` and `nodeY`, belong to the same set.
     * @param {number} nodeX The first element.
     * @param {number} nodeY The second element.
     * @returns {boolean} `true` if `nodeX` and `nodeY` are in the same set, `false` otherwise.
     */
    areConnected(nodeX, nodeY) {
        return this.findSetRepresentative(nodeX) === this.findSetRepresentative(nodeY);
    }

    /**
     * Merges the sets containing `nodeX` and `nodeY`.
     * Uses the union-by-size heuristic to maintain a balanced tree structure.
     * @param {number} nodeX The first element.
     * @param {number} nodeY The second element.
     * @returns {boolean} `true` if a union operation was performed (i.e., `nodeX` and `nodeY` were in different sets),
     *                    `false` if they were already in the same set.
     */
    unionSets(nodeX, nodeY) {
        let rootX = this.findSetRepresentative(nodeX);
        let rootY = this.findSetRepresentative(nodeY);

        if (rootX === rootY) {
            return false; // Elements are already in the same set, no union needed.
        }

        // Union by size: Attach the smaller tree (less negative size) to the root of the larger tree.
        if (this.parentArray[rootY] < this.parentArray[rootX]) {
            // RootY's set is larger (its size, represented by parentArray[rootY], is more negative).
            this.parentArray[rootY] += this.parentArray[rootX]; // Update the size of the new combined set.
            this.parentArray[rootX] = rootY; // Make rootY the parent of rootX.
        } else {
            // RootX's set is larger or equal in size.
            this.parentArray[rootX] += this.parentArray[rootY]; // Update the size of the new combined set.
            this.parentArray[rootY] = rootX; // Make rootX the parent of rootY.
        }
        return true; // Union successfully performed.
    }

    /**
     * Retrieves the size of the set that contains `nodeId`.
     * @param {number} nodeId The element whose set size is to be determined.
     * @returns {number} The total number of elements in the set.
     */
    getSetSize(nodeId) {
        // The size is stored as a negative value at the root.
        return -this.parentArray[this.findSetRepresentative(nodeId)];
    }
}


// --- Global Simulation Parameters and State ---

// Define constants for various magic numbers and fixed values in the simulation.
const CONSTANTS = {
    MAX_DISTANCE_VALUE: 1e9,        // Represents infinity for distance calculations (e.g., in Floyd-Warshall).
    STARTING_VERTEX_ID: 0,          // The ID of the central hub or starting point for operations (0-indexed).
    INVALID_MOVE_INDICATOR: -2,     // A sentinel value indicating an invalid or impossible next move.
    INITIAL_TRAVEL_DISTANCE: 0,     // Initial state of travel, meaning no movement is currently planned.
    NO_ITEM_ACQUIRED_YET: -1,       // Sentinel for `lastAcquisitionDay` when no items have been processed yet.
    INPUT_VERTEX_OFFSET: 1,         // Input vertices are 1-indexed, so subtract this to get 0-indexed.
};

let remainingTravelDistance = CONSTANTS.INITIAL_TRAVEL_DISTANCE; // Distance left to travel on the current segment.
let currentVertex = CONSTANTS.STARTING_VERTEX_ID;                 // The agent's current location.
let currentDay = 0;                                               // The current day in the simulation.
let lastAcquisitionDay = CONSTANTS.NO_ITEM_ACQUIRED_YET;          // The last day items were acquired and processed.
let totalScore = 0;                                               // Accumulated score from deliveries.

// Read initial graph configuration from input.
const numVertices = readNumericToken(); // V: Number of vertices in the graph (e.g., 200-400).
const numEdges = readNumericToken();   // E: Number of edges in the graph (e.g., 1.5V-2V).

// Adjacency matrices for storing shortest path distances and direct edge distances.
// Initialized with a large value representing infinity (no direct path or very long path).
const shortestPathMatrix = createMultiDimArray(CONSTANTS.MAX_DISTANCE_VALUE, numVertices, numVertices);
const directEdgeDistances = createMultiDimArray(CONSTANTS.MAX_DISTANCE_VALUE, numVertices, numVertices);

// Adjacency list representation of the graph. Each element is an array of connected vertices.
const adjacencyList = createMultiDimArray("[]", numVertices);

// Populate graph edges and initial distances from input data.
initializeGraphEdges();

const maxSimulationDays = readNumericToken();     // tmax: Total number of days for the simulation (e.g., 10000).
const maxSimulationDaysSquared = maxSimulationDays * maxSimulationDays; // Pre-calculate for score.

const dailyResults = Array(maxSimulationDays); // Array to store the vertex visited each day for output.

// Set to keep track of target vertices for items currently held by the agent.
const heldItems = new Set();

// Stores the planned sequence of vertices to visit for delivery.
let deliveryPathSequence = [];

// Stores the acquisition day for each item. `itemAcquisitionTimes[vertex_id]` is an array
// of days on which an item destined for `vertex_id` was acquired.
const itemAcquisitionTimes = createMultiDimArray("[]", numVertices);

// --- Main Simulation Execution ---

// Start the main simulation process.
const finalOutputString = simulateDeliveryProcess();

// Attempt to write the simulation results to standard output, with a fallback for errors.
try {
    fileSystemMod.writeFileSync("/dev/stdout", finalOutputString);
    console.log("Total Score:", totalScore); // Also print the total score to stderr/console.
} catch (error) {
    // If writing to /dev/stdout fails (e.g., in a local test environment without specific setup),
    // print the output directly to the console for debugging.
    console.error("Error writing to /dev/stdout. Outputting results to console instead.");
    console.log(finalOutputString);
    console.log("Total Score:", totalScore);
}


// --- Core Simulation Logic Functions ---

/**
 * Orchestrates the main simulation loop.
 * First, it computes all-pairs shortest paths using the Floyd-Warshall algorithm.
 * Then, it iteratively processes daily operations until `maxSimulationDays` is reached.
 * @returns {string} A newline-separated string of the agent's position for each day.
 */
function simulateDeliveryProcess() {
    // Phase 1: Compute all-pairs shortest paths using the Floyd-Warshall algorithm.
    // This allows determining the shortest distance between any two vertices in the graph.
    for (let intermediateVertex = 0; intermediateVertex < numVertices; intermediateVertex++) {
        for (let sourceVertex = 0; sourceVertex < numVertices; sourceVertex++) {
            // Ensure distance from a vertex to itself is always 0.
            shortestPathMatrix[sourceVertex][sourceVertex] = 0;
            for (let destinationVertex = 0; destinationVertex < numVertices; destinationVertex++) {
                // Calculate potential path length through the intermediate vertex.
                const pathThroughIntermediate = shortestPathMatrix[sourceVertex][intermediateVertex] + shortestPathMatrix[intermediateVertex][destinationVertex];
                // If this new path is shorter than the currently known shortest path, update it.
                if (pathThroughIntermediate < shortestPathMatrix[sourceVertex][destinationVertex]) {
                    shortestPathMatrix[sourceVertex][destinationVertex] = pathThroughIntermediate;
                }
            }
        }
    }

    // Phase 2: Simulate daily operations for the specified number of days.
    while (currentDay < maxSimulationDays) {
        const actionVertex = executeDailyOperations(); // Perform daily actions and get the resulting vertex.

        // Check for critical simulation errors (e.g., agent gets stuck).
        if (actionVertex === CONSTANTS.INVALID_MOVE_INDICATOR && remainingTravelDistance < 0) {
            console.error(`Simulation halted prematurely due to an invalid move on day ${currentDay}.`);
            break; // Stop the simulation.
        }
        // Record the agent's position for the current day (output is 1-indexed).
        dailyResults[currentDay] = actionVertex + CONSTANTS.INPUT_VERTEX_OFFSET;
        currentDay++; // Advance to the next day.
    }
    return dailyResults.join("\n"); // Return the complete sequence of daily positions.
}

/**
 * Builds a Minimum Spanning Tree (MST) for a specified set of target vertices,
 * always including the central hub (vertex 0), using Kruskal's algorithm.
 * This MST helps in planning an efficient route to deliver items.
 * @param {Set<number>} targetVertexSet A set of vertices representing locations where items need to be delivered.
 * @returns {Array<Array<number>>} An array of edges `[u, v, weight]` that form the MST.
 */
function buildMinimumSpanningTree(targetVertexSet) {
    // Create a list of all vertices that must be part of the MST.
    // This includes the central hub and all vertices with held items.
    const verticesInMST = Array.from(targetVertexSet);
    if (!verticesInMST.includes(CONSTANTS.STARTING_VERTEX_ID)) {
        verticesInMST.push(CONSTANTS.STARTING_VERTEX_ID);
    }
    const numVerticesInMST = verticesInMST.length;

    const candidateEdges = [];
    // Generate all possible edges between any two distinct vertices within `verticesInMST`.
    for (let idxA = 0; idxA < numVerticesInMST; idxA++) {
        for (let idxB = idxA + 1; idxB < numVerticesInMST; idxB++) {
            const u = verticesInMST[idxA];
            const v = verticesInMST[idxB];
            candidateEdges.push([u, v, shortestPathMatrix[u][v]]); // Use shortest path as edge weight.
        }
    }

    // Sort all candidate edges by their weight (distance) in ascending order.
    candidateEdges.sort((edgeA, edgeB) => edgeA[2] - edgeB[2]);

    // Initialize a Disjoint Set Union structure for all vertices in the graph.
    const dsu = new DisjointSet(numVertices);
    const mstEdges = []; // This will store the edges that form our MST.

    // Iterate through the sorted edges and add them to the MST if they don't form a cycle.
    for (const [vertexU, vertexV, edgeWeight] of candidateEdges) {
        // If `unionSets` returns true, it means the two vertices were in different sets
        // and have now been connected by this edge, so add it to the MST.
        if (dsu.unionSets(vertexU, vertexV)) {
            mstEdges.push([vertexU, vertexV, edgeWeight]);
            // Optimization: If the size of the set containing the starting vertex equals the number
            // of vertices required in the MST, we have found all necessary connections.
            if (dsu.getSetSize(CONSTANTS.STARTING_VERTEX_ID) === numVerticesInMST) {
                break;
            }
        }
    }
    return mstEdges;
}

/**
 * Initializes the graph's adjacency list and distance matrices by reading edge data.
 * Sets up direct edge distances and initial shortest path distances.
 */
function initializeGraphEdges() {
    // Set the distance from any vertex to itself to 0.
    for (let vertexIdx = 0; vertexIdx < numVertices; vertexIdx++) {
        shortestPathMatrix[vertexIdx][vertexIdx] = 0;
        directEdgeDistances[vertexIdx][vertexIdx] = 0;
    }

    // Read each edge from the input and populate the graph structures.
    for (let edgeCount = 0; edgeCount < numEdges; edgeCount++) {
        const vertex1 = readNumericToken() - CONSTANTS.INPUT_VERTEX_OFFSET; // Convert 1-indexed to 0-indexed.
        const vertex2 = readNumericToken() - CONSTANTS.INPUT_VERTEX_OFFSET;
        const edgeWeight = readNumericToken();

        // For an undirected graph, edge distances are symmetric.
        shortestPathMatrix[vertex1][vertex2] = edgeWeight;
        shortestPathMatrix[vertex2][vertex1] = edgeWeight;
        directEdgeDistances[vertex1][vertex2] = edgeWeight;
        directEdgeDistances[vertex2][vertex1] = edgeWeight;

        // Add to the adjacency list for easy traversal.
        adjacencyList[vertex1].push(vertex2);
        adjacencyList[vertex2].push(vertex1);
    }
}

/**
 * Determines the next destination vertex for the agent based on current items held
 * and the planned delivery path.
 * @returns {number} The ID of the next vertex to move towards, or `CONSTANTS.INVALID_MOVE_INDICATOR`
 *                   if no move is needed or possible (e.g., waiting at the hub with no items).
 */
function determineNextDestination() {
    // If no items are currently held, the agent's goal is to return to the central hub.
    if (heldItems.size === 0) {
        if (currentVertex === CONSTANTS.STARTING_VERTEX_ID) {
            return CONSTANTS.INVALID_MOVE_INDICATOR; // At the hub, no items, so wait.
        }
        return findNextHopOnPath(CONSTANTS.STARTING_VERTEX_ID); // Move towards the hub.
    }

    // If items are held, follow the pre-calculated `deliveryPathSequence`.
    // If the current vertex is the last one in the planned sequence, it means we've reached a target.
    if (deliveryPathSequence.length > 0 && currentVertex === deliveryPathSequence[deliveryPathSequence.length - 1]) {
        deliveryPathSequence.pop(); // Remove this vertex from the path as it's been reached.
    }

    // If the path is now empty, it means all segments of the current path are traversed,
    // or we need to plan a new path starting from the hub (e.g., after delivering items).
    if (deliveryPathSequence.length === 0) {
        return findNextHopOnPath(CONSTANTS.STARTING_VERTEX_ID); // Head back to the hub to re-evaluate.
    }

    // Otherwise, continue along the planned path towards the next target vertex.
    const nextTargetInSequence = deliveryPathSequence[deliveryPathSequence.length - 1];
    return findNextHopOnPath(nextTargetInSequence);
}

/**
 * Finds the immediate next hop (adjacent vertex) on the shortest path
 * from the `currentVertex` to the `targetVertex`.
 * Assumes `shortestPathMatrix` has been pre-calculated by Floyd-Warshall.
 * @param {number} targetVertex The ultimate destination vertex.
 * @returns {number} The ID of the next vertex to move to, or `CONSTANTS.INVALID_MOVE_INDICATOR`
 *                   if no valid next hop is found (e.g., target is unreachable or already at target).
 */
function findNextHopOnPath(targetVertex) {
    if (currentVertex === targetVertex) {
        // Already at the target, no movement needed for this day.
        remainingTravelDistance = CONSTANTS.INITIAL_TRAVEL_DISTANCE;
        return currentVertex;
    }

    // Iterate through all direct neighbors of the `currentVertex`.
    for (const neighborVertex of adjacencyList[currentVertex]) {
        // Check if this neighbor lies on a shortest path to the `targetVertex`.
        // This is true if `dist(current, target) == dist(current, neighbor) + dist(neighbor, target)`.
        if (shortestPathMatrix[currentVertex][targetVertex] === directEdgeDistances[currentVertex][neighborVertex] + shortestPathMatrix[neighborVertex][targetVertex]) {
            // Found the next hop on the shortest path.
            // Update the `remainingTravelDistance` for this new path segment.
            remainingTravelDistance = directEdgeDistances[currentVertex][neighborVertex] - 1; // One unit of distance traveled.
            return neighborVertex; // Return the ID of the next vertex.
        }
    }
    // If no neighbor satisfies the shortest path condition, it indicates an issue
    // (e.g., graph inconsistency, or target is unreachable from current vertex).
    return CONSTANTS.INVALID_MOVE_INDICATOR;
}

/**
 * Executes the operations for a single simulation day.
 * This includes moving, acquiring new items if at the hub, or delivering items if at a target.
 * @returns {number} The vertex ID where the agent ends up after completing the day's actions.
 */
function executeDailyOperations() {
    if (remainingTravelDistance > 0) {
        // If there's still distance to cover for the current move, decrement it and stay put for movement simulation.
        remainingTravelDistance--;
        return currentVertex;
    }

    // If `remainingTravelDistance` is 0, the agent has arrived at a vertex.
    // Decide on the next action: acquire items or deliver.
    if (currentVertex === CONSTANTS.STARTING_VERTEX_ID) {
        acquireNewItemsAndPlanRoute(); // At the central hub, process new orders and plan a new route.
    } else {
        deliverItemAndUpdateScore(); // At a non-hub vertex, attempt to deliver an item.
    }

    // After processing arrivals/departures, determine the next destination for the upcoming movement.
    return determineNextDestination();
}

/**
 * Processes any new item orders received up to the `currentDay`.
 * It then constructs a Minimum Spanning Tree (MST) connecting the central hub and all
 * vertices with held items, and plans a delivery route using a Depth-First Search (DFS) traversal.
 */
function acquireNewItemsAndPlanRoute() {
    // Process new item orders that have become available since the last check.
    while (lastAcquisitionDay < currentDay) {
        lastAcquisitionDay++; // Advance the day items are being acquired for.
        const numberOfNewItems = readNumericToken(); // Read how many items arrived today.
        for (let itemIdx = 0; itemIdx < numberOfNewItems; itemIdx++) {
            const itemId = readNumericToken() - CONSTANTS.INPUT_VERTEX_OFFSET; // Item ID (unused in original logic).
            const deliveryTargetVertex = readNumericToken() - CONSTANTS.INPUT_VERTEX_OFFSET; // Target vertex for delivery.
            heldItems.add(deliveryTargetVertex); // Add target vertex to the set of locations to visit.
            itemAcquisitionTimes[deliveryTargetVertex].push(lastAcquisitionDay); // Record when this item was acquired.
        }
    }

    // If no items are currently held after processing new orders, clear any existing path.
    if (heldItems.size === 0) {
        deliveryPathSequence = [];
        return;
    }

    // Build an MST that connects the central hub (vertex 0) to all vertices where items need to be delivered.
    const deliveryTreeEdges = buildMinimumSpanningTree(heldItems);

    // Convert the list of MST edges into an adjacency list representation for easy traversal.
    const spanningTreeRoads = createMultiDimArray("[]", numVertices);
    for (const [u, v, weight] of deliveryTreeEdges) {
        spanningTreeRoads[u].push(v);
        spanningTreeRoads[v].push(u); // Undirected edges.
    }

    // Perform a Depth-First Search (DFS) starting from the central hub to determine an efficient traversal order.
    // The DFS will populate `deliveryPathSequence` in a leaf-to-root order.
    deliveryPathSequence = []; // Reset the path for the new planning.
    depthFirstTraversalForRoute(CONSTANTS.STARTING_VERTEX_ID, -1, spanningTreeRoads);
    deliveryPathSequence.reverse(); // Reverse the path to get a root-to-leaf (hub-outward) order.
    // Remove the starting hub (vertex 0) from the path sequence, as it's just the origin for planning.
    // The agent will implicitly start from here.
    deliveryPathSequence.shift(); // Use shift instead of pop, as it's reversed.
}

/**
 * Performs a Depth-First Search (DFS) on a given graph (represented as an adjacency list)
 * to generate a traversal path. This is typically used to order visits to vertices in an MST.
 * @param {number} vertexId The ID of the current vertex being visited in the DFS.
 * @param {number} parentId The ID of the parent vertex, used to avoid immediately backtracking.
 * @param {Array<Array<number>>} graphAdjacencyList The adjacency list of the graph to traverse.
 */
function depthFirstTraversalForRoute(vertexId, parentId, graphAdjacencyList) {
    deliveryPathSequence.push(vertexId); // Add the current vertex to the path.

    // Iterate through all neighbors of the current vertex.
    for (const neighborId of graphAdjacencyList[vertexId]) {
        if (neighborId === parentId) {
            continue; // Skip the parent to prevent infinite loops in undirected graphs.
        }
        depthFirstTraversalForRoute(neighborId, vertexId, graphAdjacencyList); // Recursively call DFS for neighbors.
    }
}

/**
 * Processes the delivery of an item (or items) at the `currentVertex`.
 * Removes the item from `heldItems` and updates the `totalScore` based on delivery time.
 */
function deliverItemAndUpdateScore() {
    // A guard clause: if the current vertex doesn't have an item marked for delivery,
    // this function shouldn't do anything. This ensures robustness.
    if (!heldItems.has(currentVertex)) {
        return;
    }

    heldItems.delete(currentVertex); // Mark the item as delivered by removing its target vertex from the set.

    // Calculate and add score for all items that were destined for this `currentVertex`.
    // An item may have multiple orders, each with its own acquisition time.
    while (itemAcquisitionTimes[currentVertex].length > 0) {
        const acquisitionDay = itemAcquisitionTimes[currentVertex].pop(); // Get the day this specific order was acquired.
        const timeElapsed = currentDay - acquisitionDay; // Calculate the time taken for delivery.
        // Score calculation: maxSimulationDays^2 - (timeElapsed)^2.
        totalScore += maxSimulationDaysSquared - (timeElapsed * timeElapsed);
    }
}