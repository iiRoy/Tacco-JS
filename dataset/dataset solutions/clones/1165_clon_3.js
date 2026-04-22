let networkGraph = []; // Represents the adjacency list for the flow network
let totalNodes = 0;       // Stores the total number of vertices in the graph
let visitedStatus = [];   // Used during DFS to track visited nodes in a path
const MAX_CAP = Infinity; // Represents an effectively infinite capacity for path finding

// --- Input Handling ---
// Prepare to read input from standard input.
// This accumulates all input before processing, which is safer for multi-line inputs.
process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputBuffer = ''; // Buffer to accumulate incoming data
process.stdin.on('data', function(chunk) {
    inputBuffer += chunk; // Append new data chunks to the buffer
});

// Once all input has been received, process it.
process.stdin.on('end', function() {
    // Split the accumulated input into lines, filtering out empty ones.
    const inputLines = inputBuffer.trim().split(/\r?\n/).filter(line => line.trim() !== '');

    // --- Input Validation and Graph Setup ---
    if (inputLines.length === 0) {
        console.error("Error: No input provided. Exiting.");
        return; // Terminate if no input
    }

    // Process the very first line which defines the graph dimensions (V, E).
    const configData = inputLines[0].split(' ').map(Number);
    if (configData.length < 2 || isNaN(configData[0])) {
        console.error("Error: Invalid graph configuration on the first line. Expected 'V E'. Exiting.");
        return;
    }

    totalNodes = configData[0];
    const initialEdgeCount = configData[1]; // The 'E' variable, read but not directly used in graph construction logic

    // Basic validation for the number of nodes
    if (totalNodes <= 0) {
        console.error("Error: Number of nodes must be positive. Exiting.");
        return;
    }

    // Initialize the adjacency list: each node gets an empty array for its outgoing edges.
    networkGraph = Array.from({ length: totalNodes }, () => []);

    // --- Process Edge Data ---
    // Iterate through the remaining lines to add edges to the graph.
    for (let i = 1; i < inputLines.length; ++i) {
        const edgeDefinition = inputLines[i].split(' ').map(Number);

        // Validate each edge line for correct format and numeric values.
        if (edgeDefinition.length < 3 || edgeDefinition.some(isNaN)) {
            console.warn(`Warning: Skipping malformed edge definition on line ${i + 1}: '${inputLines[i]}'`);
            continue; // Skip to the next line
        }

        const [startNode, endNode, edgeCapacity] = edgeDefinition;

        // Validate node indices against graph boundaries.
        if (startNode < 0 || startNode >= totalNodes || endNode < 0 || endNode >= totalNodes) {
            console.warn(`Warning: Edge (${startNode}, ${endNode}) on line ${i + 1} contains out-of-bounds node indices. Skipping.`);
            continue;
        }
        // Validate capacity.
        if (edgeCapacity < 0) {
            console.warn(`Warning: Edge (${startNode}, ${endNode}) on line ${i + 1} has a negative capacity (${edgeCapacity}). Skipping.`);
            continue;
        }

        // Add the edge to the network graph.
        establishFlowPath(startNode, endNode, edgeCapacity);
    }

    // --- Max Flow Calculation ---
    // The problem typically asks for max flow from node 0 to the last node (V-1).
    const flowSourceNode = 0;
    const flowSinkNode = totalNodes - 1;

    // Additional checks before attempting flow calculation
    if (totalNodes < 2) {
        console.log(0); // Cannot have flow if there's less than 2 nodes (source and sink)
        return;
    }
    if (flowSourceNode >= totalNodes || flowSinkNode >= totalNodes || flowSourceNode === flowSinkNode) {
        console.warn("Warning: Invalid source or sink node configuration. Source and sink must be distinct and within bounds.");
        console.log(0); // No flow possible with invalid source/sink
        return;
    }

    // Output the computed maximum flow.
    console.log(determineNetworkFlow(flowSourceNode, flowSinkNode));
});

/**
 * Represents a directed edge in the flow network.
 * @typedef {Object} FlowEdge
 * @property {number} to - The destination node of the edge.
 * @property {number} cap - The current residual capacity of the edge.
 * @property {number} rev - The index of the reverse edge in the destination node's adjacency list.
 */

/**
 * Establishes a directed flow path between two nodes in the network graph.
 * This function also creates a corresponding reverse edge with zero capacity
 * to manage residual capacities for the Ford-Fulkerson algorithm.
 * @param {number} originNode - The starting node of the path.
 * @param {number} destinationNode - The ending node of the path.
 * @param {number} pathCapacity - The initial capacity of the forward path.
 */
function establishFlowPath(originNode, destinationNode, pathCapacity) {
    // Record the index of the reverse edge in the destination's adjacency list
    const reverseEdgeIndexForOrigin = networkGraph[destinationNode].length;
    // Record the index of the forward edge in the origin's adjacency list
    const forwardEdgeIndexForDestination = networkGraph[originNode].length;

    // Create the forward edge object and add it to the origin node's list.
    const forwardEdge = {
        to: destinationNode,
        cap: pathCapacity,
        rev: reverseEdgeIndexForOrigin
    };
    networkGraph[originNode].push(forwardEdge);

    // Create the backward (residual) edge object and add it to the destination node's list.
    // Its initial capacity is 0, as no flow has yet passed through the forward edge.
    const backwardEdge = {
        to: originNode,
        cap: 0, // Residual capacity for reverse flow
        rev: forwardEdgeIndexForDestination
    };
    networkGraph[destinationNode].push(backwardEdge);
}

/**
 * Performs a Depth-First Search (DFS) to find an augmenting path from the current node to the sink.
 * It identifies the bottleneck capacity along this path, which is the maximum additional flow
 * that can be pushed through this specific path.
 * @param {number} currentNode - The node currently being explored.
 * @param {number} sinkIdentifier - The target node (sink) of the flow network.
 * @param {number} currentBottleneck - The minimum residual capacity found so far on the path leading to `currentNode`.
 * @returns {number} The amount of flow that can be pushed through the found path, or 0 if no path exists.
 */
function findAugmentingPath(currentNode, sinkIdentifier, currentBottleneck) {
    // Base case: If we've reached the sink, a valid augmenting path has been found.
    // The flow for this path is limited by the current bottleneck capacity.
    if (currentNode === sinkIdentifier) {
        return currentBottleneck;
    }

    // Mark the current node as visited for this DFS traversal.
    // This prevents cycles and re-visiting nodes within the same path search.
    visitedStatus[currentNode] = true;

    // Iterate through all outgoing edges from the current node.
    for (const flowSegment of networkGraph[currentNode]) {
        // Check two conditions for a valid path segment:
        // 1. The destination node has not been visited in the current DFS.
        // 2. The edge has available residual capacity (cap > 0).
        if (!visitedStatus[flowSegment.to] && flowSegment.cap > 0) {
            // Calculate the potential flow through this segment:
            // It's the minimum of the current path's bottleneck and the edge's capacity.
            const flowThroughSegment = Math.min(currentBottleneck, flowSegment.cap);

            // Recursively call DFS to continue searching for a path from the next node.
            const discoveredFlow = findAugmentingPath(flowSegment.to, sinkIdentifier, flowThroughSegment);

            // If a positive flow was found from the next node to the sink:
            if (discoveredFlow > 0) {
                // Update residual capacities:
                // Decrease capacity of the forward edge (flow is pushed through it).
                flowSegment.cap -= discoveredFlow;
                // Increase capacity of the reverse edge (representing residual capacity for backward flow).
                networkGraph[flowSegment.to][flowSegment.rev].cap += discoveredFlow;

                // Return the flow amount found for this complete augmenting path.
                return discoveredFlow;
            }
        }
    }

    // If no augmenting path could be found from this node to the sink, return 0.
    return 0;
}

/**
 * Computes the maximum flow from a specified source node to a sink node
 * in the network graph using the Ford-Fulkerson algorithm.
 * It repeatedly finds augmenting paths using DFS and updates the flow.
 * @param {number} sourceIdentifier - The starting node for flow.
 * @param {number} sinkIdentifier - The ending node for flow.
 * @returns {number} The total maximum flow that can be sent from the source to the sink.
 */
function determineNetworkFlow(sourceIdentifier, sinkIdentifier) {
    let totalFlowAccumulated = 0; // Accumulator for the total maximum flow.
    let currentPathFlow;          // Stores the flow found in the current augmenting path.
    let algorithmIteration = 0;   // A counter for Type III: tracks how many augmenting paths are found.

    // The main loop of the Ford-Fulkerson algorithm.
    // It continues as long as augmenting paths can be found.
    do {
        algorithmIteration++; // Increment iteration counter.

        // Reset the visited status for all nodes before each new DFS search.
        // This ensures that DFS explores paths freely in the current residual graph.
        visitedStatus = Array(totalNodes).fill(false);

        // Find an augmenting path from the source to the sink and determine its bottleneck capacity.
        // MAX_CAP (Infinity) is passed as the initial bottleneck, meaning the path is initially
        // limited only by the capacities of its edges, not by an external factor.
        currentPathFlow = findAugmentingPath(sourceIdentifier, sinkIdentifier, MAX_CAP);

        // Add the flow found in this path to the total accumulated flow.
        totalFlowAccumulated += currentPathFlow;

        // Optional: Debugging log for Type III modification
        // if (currentPathFlow > 0) {
        //     console.error(`Debug: Iteration ${algorithmIteration}: Found augmenting path with flow ${currentPathFlow}. Current total flow: ${totalFlowAccumulated}`);
        // }

    } while (currentPathFlow > 0); // Loop terminates when no more augmenting paths can be found (currentPathFlow is 0).

    return totalFlowAccumulated;
}