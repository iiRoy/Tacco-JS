// This file calculates the maximum flow through a network graph
// using the Edmonds-Karp algorithm variant with DFS for augmenting paths.

let networkAdjacencyList = []; // Stores the graph as an adjacency list. Each element is an array of edge objects.
let totalVertexCount, totalEdgeCount; // Global variables for the number of vertices and edges in the graph.

// Setup standard input processing for Node.js environment
process.stdin.resume(); // Ensure the standard input stream stays open
process.stdin.setEncoding('utf8'); // Set encoding for incoming data

// Event listener for incoming data chunks from stdin
process.stdin.on('data', function(inputDataStream) {
    // Split the entire input string into individual lines
    const processedLines = inputDataStream.split('\n');
    let firstLineProcessed = false; // Flag to ensure graph dimensions are set only once

    // Iterate through each line of input, excluding the last potential empty line
    for (let currentLineIndex = 0; currentLineIndex < processedLines.length; ++currentLineIndex) {
        const currentLineContent = processedLines[currentLineIndex].trim(); // Get line and remove leading/trailing whitespace

        // Skip empty lines or lines with only whitespace
        if (currentLineContent.length === 0) {
            continue;
        }

        if (!firstLineProcessed) {
            // Process the first valid line to get vertex and edge counts
            const graphDimensions = currentLineContent.split(' ').map(Number);

            // Basic validation for the graph dimensions
            if (graphDimensions.length < 2 || isNaN(graphDimensions[0]) || isNaN(graphDimensions[1])) {
                console.error("Error: Invalid graph dimension line. Expected 'V E'.");
                return; // Exit if input is malformed
            }

            totalVertexCount = graphDimensions[0];
            totalEdgeCount = graphDimensions[1];

            // Initialize the adjacency list for each vertex
            for (let vertexInitializer = 0; vertexInitializer < totalVertexCount; ++vertexInitializer) {
                networkAdjacencyList[vertexInitializer] = [];
            }
            firstLineProcessed = true; // Mark as processed
        } else {
            // Process subsequent lines as edge definitions
            const edgeConnectionDetails = currentLineContent.split(' ').map(Number);

            // Check if the line represents a valid edge (source, destination, capacity)
            const expectedEdgeParts = 3;
            if (edgeConnectionDetails.length === expectedEdgeParts) {
                const sourceNode = edgeConnectionDetails[0];
                const targetNode = edgeConnectionDetails[1];
                const capacityValue = edgeConnectionDetails[2];

                // Validate edge parameters
                if (isNaN(sourceNode) || isNaN(targetNode) || isNaN(capacityValue) ||
                    sourceNode < 0 || sourceNode >= totalVertexCount ||
                    targetNode < 0 || targetNode >= totalVertexCount ||
                    capacityValue < 0) {
                    console.warn(`Warning: Skipping malformed or out-of-bounds edge definition: ${currentLineContent}`);
                    continue; // Skip this line and continue processing
                }

                // Add the directed edge and its reverse (for residual graph)
                establishNetworkConnection(sourceNode, targetNode, capacityValue);
            } else {
                console.warn(`Warning: Skipping invalid edge line format: ${currentLineContent}`);
            }
        }
    }

    // After processing all input, calculate and print the maximum flow
    // Default source is 0, default sink is the last vertex (totalVertexCount - 1)
    if (totalVertexCount > 0) {
        console.log(calculateNetworkMaxFlow(0, totalVertexCount - 1));
    } else {
        console.error("Error: Graph has no vertices. Cannot calculate flow.");
        console.log(0); // Output 0 flow for an empty graph
    }
});


/**
 * Adds a directed edge to the network graph and its corresponding reverse edge
 * for residual graph calculations.
 * @param {number} originNodeID - The starting vertex of the edge.
 * @param {number} destinationNodeID - The ending vertex of the edge.
 * @param {number} flowCapacity - The capacity of the edge.
 */
function establishNetworkConnection(originNodeID, destinationNodeID, flowCapacity) {
    // Add forward edge: from origin to destination
    const forwardEdge = {
        destination: destinationNodeID,
        capacity: flowCapacity,
        reverseLinkIndex: networkAdjacencyList[destinationNodeID].length // Index of the reverse edge in the destination's adj list
    };
    networkAdjacencyList[originNodeID].push(forwardEdge);

    // Add reverse edge: from destination to origin (with 0 initial capacity)
    const reverseEdge = {
        destination: originNodeID,
        capacity: 0, // Residual capacity for potential backward flow
        reverseLinkIndex: networkAdjacencyList[originNodeID].length - 1 // Index of the forward edge in the origin's adj list
    };
    networkAdjacencyList[destinationNodeID].push(reverseEdge);
}

let visitedNodesFlags; // Array to keep track of visited nodes during DFS traversal

/**
 * Performs a Depth First Search to find an augmenting path in the residual graph.
 * @param {number} currentNodeIdentifier - The current vertex being visited.
 * @param {number} terminalNodeIdentifier - The sink vertex (target for flow).
 * @param {number} currentPathFlow - The maximum flow that can be pushed along the path found so far.
 * @returns {number} The amount of flow pushed along the augmenting path, or 0 if no path is found.
 */
function explorePathForFlow(currentNodeIdentifier, terminalNodeIdentifier, currentPathFlow) {
    // Base case: If we've reached the sink, return the flow found along this path
    if (currentNodeIdentifier === terminalNodeIdentifier) {
        return currentPathFlow;
    }

    // Mark the current node as visited for this DFS run
    visitedNodesFlags[currentNodeIdentifier] = true;

    // Iterate through all edges originating from the current node
    for (const edgeSegment of networkAdjacencyList[currentNodeIdentifier]) {
        // Check two conditions for a valid path segment:
        // 1. The target node has not been visited in this DFS traversal.
        // 2. The edge has remaining capacity (can carry more flow).
        const targetVertex = edgeSegment.destination;
        const remainingCapacity = edgeSegment.capacity;

        const isTargetVisited = visitedNodesFlags[targetVertex];
        const hasCapacity = remainingCapacity > 0;

        if (!isTargetVisited && hasCapacity) {
            // Recursively call DFS on the target node, updating the path flow
            const discoveredFlow = explorePathForFlow(
                targetVertex,
                terminalNodeIdentifier,
                Math.min(currentPathFlow, remainingCapacity) // The bottleneck capacity of the path
            );

            // If an augmenting path was found (discoveredFlow > 0)
            if (discoveredFlow > 0) {
                // Update capacities:
                // Decrease capacity of the forward edge
                edgeSegment.capacity -= discoveredFlow;
                // Increase capacity of the reverse edge (for residual graph)
                const correspondingReverseEdge = networkAdjacencyList[targetVertex][edgeSegment.reverseLinkIndex];
                correspondingReverseEdge.capacity += discoveredFlow;

                return discoveredFlow; // Return the flow found
            }
        }
    }

    return 0; // No augmenting path found from this node
}

/**
 * Calculates the maximum flow from a source vertex to a sink vertex
 * in a given flow network using the Edmonds-Karp algorithm (repeated DFS).
 * @param {number} sourceVertex - The starting vertex for flow.
 * @param {number} destinationVertex - The ending vertex (sink) for flow.
 * @returns {number} The total maximum flow from source to sink.
 */
function calculateNetworkMaxFlow(sourceVertex, destinationVertex) {
    let totalAccumulatedFlow = 0; // Initialize total flow to zero

    // Constants for flow calculation
    const INFINITE_CAPACITY = Number.MAX_SAFE_INTEGER; // A very large number for initial path flow

    // Input validation: Check if source and destination are within graph bounds
    if (sourceVertex < 0 || sourceVertex >= totalVertexCount ||
        destinationVertex < 0 || destinationVertex >= totalVertexCount) {
        console.error("Error: Source or destination vertex is out of bounds.");
        return 0;
    }
    if (sourceVertex === destinationVertex) {
        return 0; // No flow from a node to itself
    }

    // Loop to repeatedly find augmenting paths until no more can be found
    while (true) {
        // Reset visited flags for each DFS traversal
        visitedNodesFlags = new Array(totalVertexCount).fill(false);

        // Find an augmenting path using DFS
        const pathFlowAmount = explorePathForFlow(
            sourceVertex,
            destinationVertex,
            INFINITE_CAPACITY // Initial path flow is limited only by edge capacities
        );

        // If no more augmenting paths can be found, break the loop
        if (pathFlowAmount === 0) {
            break;
        }

        // Add the flow found in this path to the total accumulated flow
        totalAccumulatedFlow += pathFlowAmount;
    }

    return totalAccumulatedFlow; // Return the final maximum flow
}