var emitOutput = console.info;

if (typeof globalThis.process !== "undefined" && globalThis.process.stdin && globalThis.process.stdin.isTTY) {
    let accumulatedDataBuffer = "";
    globalThis.process.stdin.resume();
    globalThis.process.stdin.setEncoding('utf8');

    globalThis.process.stdin.on('data', (incomingPacket) => {
        accumulatedDataBuffer += incomingPacket;
    });

    globalThis.process.stdin.on('end', () => {
        let dataRecords = accumulatedDataBuffer.split("\n");
        analyzeNetworkConnectivity(dataRecords);
    });
} else {
    // This block provides a default execution path for environments without interactive stdin,
    // demonstrating the module's core logic with a predefined graph input.
    emitOutput("Operating in non-interactive mode. Utilizing embedded sample data.");
    const sampleGraphInput = [
        "6 7",
        "0 1",
        "1 2",
        "2 0",
        "2 3",
        "3 4",
        "4 5",
        "5 3",
        "" // A common trailing empty line in input files
    ];
    // Asynchronous execution to mimic real-world data loading, though immediate execution would also work.
    setTimeout(() => {
        analyzeNetworkConnectivity(sampleGraphInput);
    }, 5);
}

/**
 * Orchestrates the process of analyzing a graph for critical connections (bridges).
 * This function handles input parsing, graph construction, bridge detection via DFS,
 * and structured output generation.
 * @param {string[]} rawInputLines - An array of strings, where each string represents a line of graph data.
 */
function analyzeNetworkConnectivity(rawInputLines) {
    // Initial data sanitization: remove any blank lines from the raw input.
    const sanitizedRecords = rawInputLines.filter(line => line.trim() !== '');

    if (sanitizedRecords.length === 0) {
        emitOutput("Error: No actionable input detected after sanitization.");
        return;
    }

    // Transform string-based records into arrays of numerical values.
    const numericDataRows = sanitizedRecords.map(record => {
        return record.split(" ").map(element => {
            const numericValue = Number(element);
            // Robust validation: ensure all elements are valid numbers.
            if (isNaN(numericValue)) {
                throw new Error(`Data conversion error: "${element}" is not a valid number in record "${record}".`);
            }
            return numericValue;
        });
    });

    // The first line typically contains graph configuration (vertex and edge counts).
    const graphConfiguration = numericDataRows.shift();
    if (!graphConfiguration || graphConfiguration.length < 2) {
        emitOutput("Error: Graph configuration line is malformed or absent.");
        return;
    }

    const totalVertices = graphConfiguration[0];
    const totalEdges = graphConfiguration[1];

    // Fundamental validation of graph dimensions.
    if (totalVertices <= 0 || totalEdges < 0) {
        emitOutput(`Error: Invalid graph dimensions. Vertices must be positive, Edges non-negative. Received: V=${totalVertices}, E=${totalEdges}`);
        return;
    }

    // --- Graph Data Structures Setup ---
    // Represents the graph as an adjacency list. Each index corresponds to a vertex.
    const adjacencies = new Array(totalVertices);
    // Tracks if a vertex has been visited during the Depth First Search.
    const visitedFlags = new Array(totalVertices);
    // Stores the discovery time (order of visit) for each vertex during DFS.
    const discoveryTimes = new Array(totalVertices);
    // Stores the lowest discovery time reachable from a vertex or its subtree.
    const lowLinkValues = new Array(totalVertices);
    // A set to store identified bridges as unique string representations ("node1-node2").
    const criticalLinks = new Set();

    // Initialize all graph data structures for each vertex.
    for (let vIdx = 0; vIdx < totalVertices; vIdx++) {
        adjacencies[vIdx] = [];
        visitedFlags[vIdx] = false;
        discoveryTimes[vIdx] = -1; // Sentinel value indicating unvisited.
        lowLinkValues[vIdx] = Infinity; // Sentinel value for minimum reachable time.
    }

    // Populate the adjacency list from the processed input edge data.
    for (const connectionTuple of numericDataRows) {
        if (connectionTuple.length < 2) {
            emitOutput(`Warning: Skipping malformed connection tuple: ${connectionTuple}.`);
            continue;
        }
        const endpointA = connectionTuple[0];
        const endpointB = connectionTuple[1];

        // Ensure endpoints are within the valid range of vertices.
        if (endpointA < 0 || endpointA >= totalVertices || endpointB < 0 || endpointB >= totalVertices) {
            emitOutput(`Warning: Connection (${endpointA}, ${endpointB}) contains out-of-bounds vertex indices. Skipping.`);
            continue;
        }

        // Add bidirectional connections for an undirected graph.
        adjacencies[endpointA].push(endpointB);
        adjacencies[endpointB].push(endpointA);
    }

    // --- Core Algorithm: Depth First Search for Bridge Detection ---
    let dfsTraversalClock = 0; // A global counter for tracking discovery times.

    /**
     * Performs a recursive Depth First Search traversal starting from a given vertex
     * to compute discovery times and low-link values, thereby identifying bridges.
     * @param {number} currentVertex - The vertex currently being explored.
     * @param {number} parentOfCurrent - The immediate parent of `currentVertex` in the DFS tree.
     */
    function exploreGraphComponent(currentVertex, parentOfCurrent) {
        // Mark the current vertex as visited.
        visitedFlags[currentVertex] = true;
        // Record its discovery time and initialize its low-link value.
        discoveryTimes[currentVertex] = dfsTraversalClock;
        lowLinkValues[currentVertex] = dfsTraversalClock;
        dfsTraversalClock++; // Advance the global timer.

        // Iterate through all adjacent vertices.
        const neighbors = adjacencies[currentVertex];
        for (const neighborVertex of neighbors) {
            // Skip the edge that leads back to the parent in the DFS tree.
            if (neighborVertex === parentOfCurrent) {
                continue;
            }

            if (visitedFlags[neighborVertex]) {
                // If the neighbor is already visited, it indicates a back-edge.
                // Update the current vertex's low-link value with the neighbor's discovery time.
                // This means an earlier visited ancestor is reachable via this back-edge.
                lowLinkValues[currentVertex] = Math.min(lowLinkValues[currentVertex], discoveryTimes[neighborVertex]);
            } else {
                // If the neighbor is unvisited, it's a tree-edge. Recursively explore it.
                exploreGraphComponent(neighborVertex, currentVertex);

                // After the recursive call returns, update the current vertex's low-link value.
                // It's the minimum of its current low-link and the neighbor's low-link.
                lowLinkValues[currentVertex] = Math.min(lowLinkValues[currentVertex], lowLinkValues[neighborVertex]);

                // Bridge detection condition:
                // If the neighbor's low-link value is greater than the current vertex's discovery time,
                // it implies that there is no back-edge from the neighbor's subtree that reaches
                // an ancestor of the current vertex (or the current vertex itself).
                // Therefore, the edge (currentVertex, neighborVertex) is a bridge.
                if (lowLinkValues[neighborVertex] > discoveryTimes[currentVertex]) {
                    // Store the bridge, ensuring a canonical order (smaller index first) for uniqueness.
                    const smallerNodeIndex = Math.min(currentVertex, neighborVertex);
                    const largerNodeIndex = Math.max(currentVertex, neighborVertex);
                    criticalLinks.add(`${smallerNodeIndex}-${largerNodeIndex}`);
                }
            }
        }
    }

    // Initiate DFS for all vertices to ensure all connected components are processed.
    // The original code only started from vertex 0, which would miss bridges in disconnected graphs.
    for (let v = 0; v < totalVertices; v++) {
        if (!visitedFlags[v]) {
            exploreGraphComponent(v, -1); // -1 serves as a sentinel for the root's parent.
        }
    }

    // --- Outputting Identified Bridges ---
    // Convert the Set of bridge strings into an array, then sort them lexicographically.
    // This guarantees a consistent and ordered output.
    const orderedBridgeStrings = Array.from(criticalLinks).sort((bridgeA, bridgeB) => {
        const [uA, vA] = bridgeA.split('-').map(Number);
        const [uB, vB] = bridgeB.split('-').map(Number);
        if (uA !== uB) return uA - uB;
        return vA - vB;
    });

    // Print each identified bridge to the output.
    for (const bridgeIdentifier of orderedBridgeStrings) {
        const [nodeX, nodeY] = bridgeIdentifier.split('-');
        emitOutput(`${nodeX} ${nodeY}`);
    }
}