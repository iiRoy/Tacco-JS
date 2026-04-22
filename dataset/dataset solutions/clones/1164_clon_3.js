let outputReceiver = console.log; // Function for delivering program output

/**
 * Executes the primary graph analysis routine.
 * @param {string[]} inputDataRows - An array of strings, each representing a line of input.
 */
function programEntrance(inputDataRows) {
    // Input validation and cleanup: Remove any empty trailing lines
    let cleanedDataRows = inputDataRows.filter(row => row.trim() !== '');
    if (cleanedDataRows.length === 0) {
        outputReceiver("Error: No valid input data provided.");
        return;
    }

    // Parse the first line to get graph dimensions
    const graphParameters = cleanedDataRows.shift().split(' ').map(Number);
    const graphVertexCount = graphParameters[0];
    const graphEdgeCount = graphParameters[1];

    if (graphVertexCount <= 0) {
        outputReceiver("Error: Graph must have at least one vertex.");
        return;
    }
    if (graphEdgeCount < 0) {
        outputReceiver("Error: Number of edges cannot be negative.");
        return;
    }

    // Parse remaining lines into an array of edges
    const rawEdgeList = cleanedDataRows.map(dataLine => {
        const edgeNodes = dataLine.split(' ').map(Number);
        if (edgeNodes.length !== 2 || isNaN(edgeNodes[0]) || isNaN(edgeNodes[1])) {
            outputReceiver(`Warning: Skipping malformed edge line: "${dataLine}"`);
            return null;
        }
        return edgeNodes;
    }).filter(edge => edge !== null);

    // Instantiate and run the bridge detection algorithm
    const graphAnalyzer = new GraphStructureAnalyzer(graphVertexCount, rawEdgeList);
    const discoveredBridges = graphAnalyzer.identifyCriticalConnections();

    // Format and print the results
    outputReceiver("Identified critical connections (bridges):");
    let totalBridgesPrinted = 0;
    for (let currentVertexIndex = 0; currentVertexIndex < graphVertexCount; currentVertexIndex++) {
        for (const connectedBridgeEnd of discoveredBridges[currentVertexIndex]) {
            outputReceiver(`${currentVertexIndex} ${connectedBridgeEnd}`);
            totalBridgesPrinted++;
        }
    }
    if (totalBridgesPrinted === 0) {
        outputReceiver("No bridges found in the graph.");
    }
}

/**
 * Encapsulates the graph data and bridge-finding logic.
 */
class GraphStructureAnalyzer {
    /**
     * Constructs a new graph analyzer.
     * @param {number} totalNodes - The total number of vertices in the graph.
     * @param {number[][]} initialEdges - An array of edge pairs [u, v].
     */
    constructor(totalNodes, initialEdges) {
        this.totalNodes = totalNodes;
        this.initialEdges = initialEdges; // Store original edges for post-DFS bridge check

        // Initialize graph structures
        this.adjacencyList = Array.from({ length: totalNodes }, () => []);
        this.nodeVisitedStatus = new Array(totalNodes).fill(false);
        this.nodeDiscoveryRank = new Array(totalNodes).fill(0); // Discovery time (ord)
        this.nodeLowLinkValue = new Array(totalNodes).fill(totalNodes); // Lowest reachable discovery time (lowlink)
        this.currentDiscoveryCounter = 0; // Global counter for discovery times

        // Build the adjacency list from initial edges
        for (const [nodeA, nodeB] of initialEdges) {
            // Basic validation for edge endpoints
            if (nodeA >= 0 && nodeA < totalNodes && nodeB >= 0 && nodeB < totalNodes) {
                this.adjacencyList[nodeA].push(nodeB);
                this.adjacencyList[nodeB].push(nodeA);
            } else {
                outputReceiver(`Warning: Edge (${nodeA}, ${nodeB}) contains out-of-bounds vertex indices.`);
            }
        }
    }

    /**
     * Performs a Depth-First Search traversal to compute discovery times and low-link values.
     * This method is a core component of Tarjan's bridge-finding algorithm.
     * @param {number} currentNode - The current vertex being visited.
     * @param {number} [parentOfCurrent=-1] - The parent vertex in the DFS tree, used to avoid trivial back-traversal.
     */
    deepSearchTraversal(currentNode, parentOfCurrent = -1) {
        // Mark the current node as visited and set its discovery rank and low-link value
        this.nodeVisitedStatus[currentNode] = true;
        this.nodeDiscoveryRank[currentNode] = this.currentDiscoveryCounter;
        this.nodeLowLinkValue[currentNode] = this.currentDiscoveryCounter;
        this.currentDiscoveryCounter++; // Increment global discovery counter

        // Iterate through all neighbors of the current node
        for (const neighborNode of this.adjacencyList[currentNode]) {
            if (neighborNode === parentOfCurrent) {
                // Skip the edge that leads back to the immediate parent (tree edge)
                continue;
            }

            if (!this.nodeVisitedStatus[neighborNode]) {
                // If the neighbor has not been visited, it's a tree edge
                this.deepSearchTraversal(neighborNode, currentNode); // Recurse on the neighbor

                // After the recursive call returns, update current node's low-link value
                // with the minimum of its current low-link and the neighbor's low-link
                this.nodeLowLinkValue[currentNode] = Math.min(
                    this.nodeLowLinkValue[currentNode],
                    this.nodeLowLinkValue[neighborNode]
                );
            } else {
                // If the neighbor has been visited and is not the parent, it's a back-edge
                // Update current node's low-link value with the minimum of its current low-link
                // and the neighbor's discovery rank (since a back-edge connects to an ancestor)
                this.nodeLowLinkValue[currentNode] = Math.min(
                    this.nodeLowLinkValue[currentNode],
                    this.nodeDiscoveryRank[neighborNode]
                );
            }
        }
    }

    /**
     * Identifies all bridges (critical connections) in the graph.
     * @returns {number[][]} An adjacency-list-like structure where `result[u]` contains `v` if `(u,v)` is a bridge and `u < v`.
     */
    identifyCriticalConnections() {
        // Ensure DFS is run for all connected components in case the graph is disconnected
        for (let i = 0; i < this.totalNodes; i++) {
            if (!this.nodeVisitedStatus[i]) {
                this.deepSearchTraversal(i); // Start DFS from unvisited nodes (parent is -1 for root)
            }
        }

        // Initialize a structure to store bridges, similar to the original output format
        const bridgePairsMatrix = Array.from({ length: this.totalNodes }, () => []);

        // Iterate through all original edges to determine which ones are bridges
        for (const [originalU, originalV] of this.initialEdges) {
            let vertexOne = originalU;
            let vertexTwo = originalV;

            // Ensure consistent ordering for bridge condition check:
            // The vertex with the smaller discovery rank is considered the 'parent' in the context of the edge.
            if (this.nodeDiscoveryRank[vertexOne] > this.nodeDiscoveryRank[vertexTwo]) {
                // Swap so vertexOne is the "ancestor" or has earlier discovery time
                [vertexOne, vertexTwo] = [vertexTwo, vertexOne];
            }

            // Bridge condition: An edge (vertexOne, vertexTwo) is a bridge if
            // the lowest reachable time from vertexTwo (or its descendants)
            // is greater than the discovery rank of vertexOne.
            // This means there's no back-edge from vertexTwo's subtree
            // that connects to vertexOne or any of its ancestors.
            if (this.nodeLowLinkValue[vertexTwo] > this.nodeDiscoveryRank[vertexOne]) {
                // Add the bridge, ensuring the smaller node index comes first for consistent output
                const smallValue = Math.min(originalU, originalV);
                const largeValue = Math.max(originalU, originalV);
                bridgePairsMatrix[smallValue].push(largeValue);
            }
        }

        // Sort the bridge lists for each vertex as per original specification
        for (let i = 0; i < this.totalNodes; i++) {
            bridgePairsMatrix[i].sort((a, b) => a - b);
        }

        return bridgePairsMatrix;
    }
}

// Input processing environment setup
if (typeof process !== "undefined" && process.stdin) {
    let rawInputBuffer = ""; // Accumulator for raw input data

    // Resume stdin to start receiving data
    process.stdin.resume();
    // Set encoding to handle text data
    process.stdin.setEncoding('utf8');

    // Event listener for incoming data chunks
    process.stdin.on('data', function (dataSegment) {
        rawInputBuffer += dataSegment; // Append new data to the buffer
    });

    // Event listener for the end of input stream
    process.stdin.on('end', function () {
        // Split the accumulated raw input into individual lines
        const parsedLines = rawInputBuffer.split("\n");
        // Invoke the main program entry point with the parsed lines
        programEntrance(parsedLines);
    });
} else {
    // Fallback for environments without Node.js process/stdin (e.g., browser)
    // In a browser, input might come from a textarea or other UI element.
    // For this example, we'll just log a message.
    outputReceiver("Warning: Standard input (process.stdin) not available. This script expects a Node.js environment for input.");
    // Example usage for testing without stdin:
    // const sampleInput = `5 5\n0 1\n1 2\n2 0\n1 3\n3 4`;
    // programEntrance(sampleInput.split('\n'));
}