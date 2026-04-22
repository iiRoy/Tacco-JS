let outputToConsole = console.log;

// This section handles command-line input for Node.js environments.
// It ensures robust data reception before processing.
if (typeof process !== "undefined" && process.stdin) {
    let receivedDataAccumulator = ""; // Buffer to store incoming data chunks.
    process.stdin.resume(); // Keep the process alive while waiting for input.
    process.stdin.setEncoding('utf8'); // Specify character encoding for input.

    // Event listener for data chunks. Appends each chunk to the accumulator.
    process.stdin.on('data', (inputSegment) => {
        receivedDataAccumulator += inputSegment;
    });

    // Event listener for the end of input stream.
    process.stdin.on('end', () => {
        // Guard clause: Exit if no meaningful data was received.
        if (receivedDataAccumulator.trim() === '') {
            outputToConsole("Error: No input data stream provided for analysis.");
            return;
        }

        let rawInputLines = receivedDataAccumulator.split("\n");

        // Type III modification: Clean input by filtering out empty lines.
        // This is more robust than `pop()`/`push()` and avoids undefined behavior.
        rawInputLines = rawInputLines.filter(line => line.trim() !== '');

        // Pass the cleaned array of lines to the core graph processing function.
        processNetworkGraph(rawInputLines);
    });
}


/**
 * Analyzes a network graph to identify critical bridge edges.
 * Implements a variation of Tarjan's bridge-finding algorithm.
 * @param {string[]} networkSpecRecords An array of strings, where the first string
 *                                      contains graph parameters (V E) and subsequent
 *                                      strings represent edges (u v).
 */
function processNetworkGraph(networkSpecRecords) {
    // Type III modification: Initial validation for input data.
    if (!networkSpecRecords || networkSpecRecords.length === 0) {
        outputToConsole("Error: Network specification records are missing or empty.");
        return;
    }

    // Extract graph dimensions (number of vertices and edges) from the first line.
    const configurationLine = networkSpecRecords.shift(); // Remove and get the first line.
    const graphDimensions = configurationLine.split(" ").map(Number);

    // Type III modification: Validate graph dimension parsing.
    if (graphDimensions.length < 2 || isNaN(graphDimensions[0]) || isNaN(graphDimensions[1])) {
        outputToConsole("Error: Invalid graph dimension format. Expected 'NUM_VERTICES NUM_EDGES'.");
        return;
    }

    const numberOfVertices = graphDimensions[0]; // Total nodes in the graph.
    const expectedEdges = graphDimensions[1];    // Not directly used in algorithm logic, but useful for validation.

    // Type III modification: Handle trivial graph cases early.
    if (numberOfVertices <= 1) {
        outputToConsole("Graph has too few vertices to contain bridges.");
        return;
    }

    // Initialize data structures required for the DFS-based bridge finding algorithm.
    // Using `const` and `let` for better scope management.
    const adjacencyStructure = Array.from({ length: numberOfVertices }, () => []); // Stores graph connections.
    const visitedStatus = new Array(numberOfVertices).fill(false); // Tracks visited nodes during DFS.
    const discoveryTime = new Array(numberOfVertices).fill(0); // Stores discovery time (ord).
    const lowestReachableTime = new Array(numberOfVertices).fill(numberOfVertices); // Stores lowest reachable discovery time (lowlink).
    
    // Type III modification: Explicitly initialize 2D array for edge tracking.
    // Helps distinguish tree edges from back-edges without relying on a parent parameter.
    const edgeUsedInTraversal = Array.from({ length: numberOfVertices }, () => new Array(numberOfVertices).fill(false));

    let identifiedBridgePairs = []; // Stores the final list of bridge edges.

    // Removed unused variables from original: `virt_edge`, `status`, `prev`.

    // Populate the adjacency list based on the provided edge records.
    networkSpecRecords.forEach((edgeDescription, index) => {
        const nodePair = edgeDescription.split(" ").map(Number);

        // Type III modification: Validate edge data.
        if (nodePair.length < 2 || isNaN(nodePair[0]) || isNaN(nodePair[1])) {
            outputToConsole(`Warning: Skipping malformed edge description at record ${index + 1}: "${edgeDescription}"`);
            return;
        }

        const firstNode = nodePair[0];
        const secondNode = nodePair[1];

        // Type III modification: Validate node indices are within bounds.
        if (firstNode < 0 || firstNode >= numberOfVertices || secondNode < 0 || secondNode >= numberOfVertices) {
            outputToConsole(`Warning: Skipping edge with out-of-bounds nodes (${firstNode}, ${secondNode}) at record ${index + 1}.`);
            return;
        }

        adjacencyStructure[firstNode].push(secondNode);
        adjacencyStructure[secondNode].push(firstNode); // Graph is undirected.
    });

    let globalDfsTimer = 0; // Global counter for discovery times.

    /**
     * Performs a Depth-First Search traversal to compute discovery and low-link times.
     * This is a core component of Tarjan's bridge-finding algorithm.
     * @param {number} currentNode The vertex currently being visited.
     */
    function depthFirstSearchTraversal(currentNode) {
        // Mark the current node as visited and record its discovery time.
        visitedStatus[currentNode] = true;
        discoveryTime[currentNode] = globalDfsTimer;
        lowestReachableTime[currentNode] = globalDfsTimer; // Initialize low-link with discovery time.
        globalDfsTimer++; // Increment the global timer for the next node.

        const connectedNodes = adjacencyStructure[currentNode];

        // Iterate through all neighbors of the current node.
        for (const neighbor of connectedNodes) {
            if (!visitedStatus[neighbor]) {
                // If the neighbor has not been visited, it's a tree edge.
                // Mark this specific edge as used to prevent treating it as a back-edge later.
                edgeUsedInTraversal[currentNode][neighbor] = true;
                edgeUsedInTraversal[neighbor][currentNode] = true;

                // Recursively call DFS for the unvisited neighbor.
                depthFirstSearchTraversal(neighbor);

                // After the recursive call returns, update the current node's lowest reachable time.
                // It's the minimum of its current low-link and the neighbor's low-link.
                lowestReachableTime[currentNode] = Math.min(lowestReachableTime[currentNode], lowestReachableTime[neighbor]);

            } else if (!edgeUsedInTraversal[neighbor][currentNode]) {
                // If the neighbor HAS been visited AND this edge was NOT the one used to
                // reach the current node (i.e., it's not the parent edge), then it's a back-edge.
                // Update the current node's lowest reachable time with the neighbor's discovery time.
                // Type III modification: Introduce intermediate variable for clarity.
                const neighborDTime = discoveryTime[neighbor];
                lowestReachableTime[currentNode] = Math.min(lowestReachableTime[currentNode], neighborDTime);
            }
        }
    }

    // Start DFS from vertex 0. This implementation assumes the graph is connected.
    // For disconnected graphs, a loop over all vertices would be necessary:
    // `for (let i = 0; i < numberOfVertices; i++) { if (!visitedStatus[i]) depthFirstSearchTraversal(i); }`
    // Following the original code's pattern, we start from 0.
    if (numberOfVertices > 0) {
        depthFirstSearchTraversal(0);
    }

    // After completing the DFS, re-iterate through the original edge list to identify bridges.
    // This approach checks each edge explicitly using the computed discovery and low-link times.
    networkSpecRecords.forEach(edgeStr => {
        const currentEdgeEndpoints = edgeStr.split(" ").map(Number);
        let nodeU = currentEdgeEndpoints[0];
        let nodeV = currentEdgeEndpoints[1];

        // Ensure `nodeU` always has a smaller discovery time than `nodeV` for consistent bridge condition check.
        if (discoveryTime[nodeU] > discoveryTime[nodeV]) {
            let tempSwap = nodeU; // Helper variable for swapping.
            nodeU = nodeV;
            nodeV = tempSwap;
        }

        // Bridge condition: An edge (U, V) is a bridge if U's discovery time
        // is strictly less than V's lowest reachable time.
        // This implies that there is no back-edge from V's subtree that reaches U or an ancestor of U.
        if (discoveryTime[nodeU] < lowestReachableTime[nodeV]) {
            // Type III modification: Store bridges as sorted pairs directly.
            identifiedBridgePairs.push([Math.min(nodeU, nodeV), Math.max(nodeU, nodeV)]);
        }
    });

    // Type III modification: Sort all identified bridges for a canonical and ordered output.
    // Sorts primarily by the first node, then by the second node if first nodes are equal.
    identifiedBridgePairs.sort((bridgeA, bridgeB) => {
        if (bridgeA[0] !== bridgeB[0]) {
            return bridgeA[0] - bridgeB[0];
        }
        return bridgeA[1] - bridgeB[1];
    });

    // Output the identified bridges.
    // Type III modification: Use a modern `for...of` loop for iteration.
    if (identifiedBridgePairs.length === 0) {
        outputToConsole("No critical bridge connections were found in the network.");
    } else {
        for (const bridgeLink of identifiedBridgePairs) {
            outputToConsole(`${bridgeLink[0]} ${bridgeLink[1]}`);
        }
    }
}