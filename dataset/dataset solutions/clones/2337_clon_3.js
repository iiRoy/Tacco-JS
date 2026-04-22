'use strict';

/**
 * Orchestrates the processing of graph data from raw input,
 * including parsing, graph construction, distance calculations,
 * and final metric computation.
 * @param {string} rawInputContent - The complete raw string data provided as input.
 */
function ProcessGraphData(rawInputContent) {
    // --- Phase 1: Input Preparation and Initial Parameter Extraction ---

    // Trim whitespace and split the entire input into individual lines.
    const processedLines = rawInputContent.trim().split('\n');

    // Implement a guard clause for empty input.
    if (!processedLines || processedLines.length === 0) {
        console.error("Error: Provided input data is empty or malformed.");
        return; // Terminate execution if no meaningful input.
    }

    // Destructure the first line to obtain core graph parameters.
    const [totalNodesStr, startNodeAStr, startNodeBStr] = processedLines[0].split(' ');

    // Convert string parameters to numbers. Using Number() for explicit type conversion.
    const totalGraphNodes = Number(totalNodesStr);
    const initialSourceNode = Number(startNodeAStr);
    const secondarySourceNode = Number(startNodeBStr);

    // Perform basic validation on extracted numerical parameters.
    // Ensure node counts and identifiers are positive and within reasonable bounds.
    if (isNaN(totalGraphNodes) || totalGraphNodes < 1 ||
        isNaN(initialSourceNode) || initialSourceNode < 1 || initialSourceNode > totalGraphNodes ||
        isNaN(secondarySourceNode) || secondarySourceNode < 1 || secondarySourceNode > totalGraphNodes) {
        console.error("Error: Invalid graph dimensions or source node identifiers detected.");
        return;
    }

    // Slice the array to get only the lines defining edges.
    const graphEdgeDefinitions = processedLines.slice(1);

    // --- Phase 2: Graph Construction (Adjacency List) ---

    // Initialize the adjacency list using a Map for robust key handling.
    // Each key represents a node, and its value is an array of connected nodes.
    const graphConnections = new Map();

    // Iterate through the edge definitions to build the undirected graph.
    // The number of edges is typically `totalGraphNodes - 1` for a tree structure.
    for (let edgeLineIdx = 0; edgeLineIdx < totalGraphNodes - 1; ++edgeLineIdx) {
        // Add a check to prevent errors if edge definitions are fewer than expected.
        if (edgeLineIdx >= graphEdgeDefinitions.length) {
            console.warn(`Warning: Expected ${totalGraphNodes - 1} edges but only found ${edgeLineIdx}. Graph might be disconnected.`);
            break;
        }

        const currentEdgeParts = graphEdgeDefinitions[edgeLineIdx].split(' ');
        const nodeOne = Number(currentEdgeParts[0]);
        const nodeTwo = Number(currentEdgeParts[1]);

        // Validate individual node identifiers within an edge.
        if (isNaN(nodeOne) || isNaN(nodeTwo) ||
            nodeOne < 1 || nodeOne > totalGraphNodes ||
            nodeTwo < 1 || nodeTwo > totalGraphNodes) {
            console.warn(`Warning: Skipping malformed edge definition: "${graphEdgeDefinitions[edgeLineIdx]}".`);
            continue; // Move to the next edge if current one is invalid.
        }

        // Ensure both nodes exist as keys in the map, initializing their connection lists if not.
        if (!graphConnections.has(nodeOne)) {
            graphConnections.set(nodeOne, []);
        }
        if (!graphConnections.has(nodeTwo)) {
            graphConnections.set(nodeTwo, []);
        }

        // Add mutual connections for an undirected graph.
        graphConnections.get(nodeOne).push(nodeTwo);
        graphConnections.get(nodeTwo).push(nodeOne);
    }

    // --- Phase 3: Distance Calculation using Depth-First Search (DFS) ---

    /**
     * Creates and initializes a distance array for graph traversal.
     * Nodes are typically 1-indexed, so the array size is `nodeCount + 1`.
     * @param {number} size - The total number of nodes (e.g., N).
     * @param {number} initialFillValue - The value to initialize each element with (e.g., -1 for unvisited, 0 for source).
     * @returns {Array<number>} An array representing distances.
     */
    const initializeDistanceTracker = (size, initialFillValue = -1) => {
        return Array.from({ length: size + 1 }, () => initialFillValue);
    };

    // Prepare distance arrays for both source nodes. Initialize with -1 to denote unvisited.
    const distancesFromFirstSource = initializeDistanceTracker(totalGraphNodes);
    const distancesFromSecondSource = initializeDistanceTracker(totalGraphNodes);

    /**
     * Executes a Depth-First Search traversal to compute distances from a starting node.
     * @param {number} currentId - The ID of the current node being visited.
     * @param {number} previousId - The ID of the node from which `currentId` was reached (to prevent immediate backtracking).
     * @param {number} currentPathLength - The accumulated distance from the DFS origin to `currentId`.
     * @param {Array<number>} distanceRegister - The array where calculated distances are stored.
     * @param {Map<number, Array<number>>} graphStructure - The adjacency list of the graph.
     */
    const performRecursiveDFS = (currentId, previousId, currentPathLength, distanceRegister, graphStructure) => {
        // Store the distance for the current node.
        distanceRegister[currentId] = currentPathLength;

        // Retrieve connected neighbors. Handle cases where a node might not have any connections.
        const connectedNeighbors = graphStructure.get(currentId) || [];

        // Traverse each neighbor.
        for (const neighborId of connectedNeighbors) {
            // Only proceed if the neighbor is not the immediate parent (to avoid cycles in undirected graphs).
            if (neighborId !== previousId) {
                // Recursively call DFS for the unvisited neighbor, incrementing the path length.
                performRecursiveDFS(neighborId, currentId, currentPathLength + 1, distanceRegister, graphStructure);
            }
        }
    };

    // Initiate DFS from the first designated source node.
    // Parent is 0 (an invalid node ID) to signify the start, distance is 0.
    performRecursiveDFS(initialSourceNode, 0, 0, distancesFromFirstSource, graphConnections);

    // Initiate DFS from the second designated source node.
    performRecursiveDFS(secondarySourceNode, 0, 0, distancesFromSecondSource, graphConnections);

    // --- Phase 4: Final Metric Calculation and Output ---

    let finalCalculatedMetric = 0; // The variable to hold the maximum value found.
    const DISTANCE_OFFSET = 1; // A constant for adjusting the distance value.

    // Iterate through all possible nodes (from 1 to totalGraphNodes).
    for (let nodeIterator = 1; nodeIterator <= totalGraphNodes; ++nodeIterator) {
        // Only consider nodes where the first source node is strictly "closer" than the second.
        // Also ensure both nodes were reachable (distance not -1).
        if (distancesFromFirstSource[nodeIterator] !== -1 && distancesFromSecondSource[nodeIterator] !== -1 &&
            distancesFromFirstSource[nodeIterator] < distancesFromSecondSource[nodeIterator]) {
            // Update the maximum metric based on the second source's distance, adjusted.
            finalCalculatedMetric = Math.max(finalCalculatedMetric, distancesFromSecondSource[nodeIterator] - DISTANCE_OFFSET);
        }
    }

    // Output the computed final metric to standard output.
    console.log(finalCalculatedMetric);
}

// --- Execution Entry Point ---
// This self-executing anonymous function handles reading from standard input
// and invoking the main graph processing logic.
(() => {
    try {
        const fileSystem = require("fs");
        const stdInputData = fileSystem.readFileSync("/dev/stdin", "utf8");
        ProcessGraphData(stdInputData);
    } catch (ioError) {
        // Catch and report any errors encountered during file reading or initial processing.
        console.error("An I/O or runtime error occurred:", ioError.message);
        // Additional error handling could be added here, e.g., logging to a file.
    }
})();