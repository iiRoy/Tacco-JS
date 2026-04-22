var printOutput = console.log;

const isNodeEnvironment = typeof process !== "undefined" && typeof process.stdin !== "undefined";

let rawInputBuffer = "";

function setupInputProcessing() {
    if (isNodeEnvironment) {
        process.stdin.resume();
        process.stdin.setEncoding('utf8');

        process.stdin.on('data', function (inputChunk) {
            rawInputBuffer += inputChunk;
        });

        process.stdin.on('end', function () {
            if (!rawInputBuffer.trim()) {
                console.error("Error: No input received. Exiting.");
                return;
            }
            let graphDataLines = rawInputBuffer.split("\n");
            graphDataLines = graphDataLines.filter(line => line.trim() !== "");
            processGraphInput(graphDataLines);
        });
    } else {
        printOutput("Warning: Not running in a Node.js environment. Input must be provided manually or via a different mechanism.");
    }
}

function processGraphInput(inputLines) {
    if (!inputLines || inputLines.length === 0) {
        console.error("Error: Input lines are empty. Cannot process graph.");
        return;
    }

    const graphContext = {
        vertexCount: 0,
        edgeCount: 0,
        adjacencyList: [],
        visitedVertices: [],
        discoveryTime: [],
        lowestReachableTime: [],
        timeCounter: 0,
        foundBridges: [],
        edgePairs: []
    };

    const graphDimensionsLine = inputLines.shift();
    if (!graphDimensionsLine) {
        console.error("Error: Missing graph dimensions line. Exiting.");
        return;
    }
    const dimensionValues = graphDimensionsLine.split(" ").map(Number);

    if (dimensionValues.length < 2 || isNaN(dimensionValues[0]) || isNaN(dimensionValues[1])) {
        console.error("Error: Invalid graph dimensions provided. Expected 'V E'. Exiting.");
        return;
    }

    graphContext.vertexCount = dimensionValues[0];
    graphContext.edgeCount = dimensionValues[1];

    if (graphContext.vertexCount <= 0) {
        console.error("Error: Vertex count must be positive. Exiting.");
        return;
    }

    graphContext.adjacencyList = Array.from({ length: graphContext.vertexCount }, () => []);
    graphContext.visitedVertices = Array.from({ length: graphContext.vertexCount }, () => false);
    graphContext.discoveryTime = Array.from({ length: graphContext.vertexCount }, () => 0);
    graphContext.lowestReachableTime = Array.from({ length: graphContext.vertexCount }, () => graphContext.vertexCount);
    graphContext.foundBridges = Array.from({ length: graphContext.vertexCount }, () => []);

    inputLines.forEach(function (lineContent) {
        const currentEdgeNodes = lineContent.split(" ").map(Number);
        if (currentEdgeNodes.length === 2 && !isNaN(currentEdgeNodes[0]) && !isNaN(currentEdgeNodes[1])) {
            const nodeA = currentEdgeNodes[0];
            const nodeB = currentEdgeNodes[1];

            if (nodeA < 0 || nodeA >= graphContext.vertexCount || nodeB < 0 || nodeB >= graphContext.vertexCount) {
                console.warn(`Warning: Edge (${nodeA}, ${nodeB}) contains out-of-bounds vertex. Skipping this edge.`);
                return;
            }

            graphContext.adjacencyList[nodeA].push(nodeB);
            graphContext.adjacencyList[nodeB].push(nodeA);
            graphContext.edgePairs.push([nodeA, nodeB]);
        } else {
            console.warn(`Warning: Invalid edge format '${lineContent}'. Skipping this line.`);
        }
    });

    /**
     * Performs a Depth First Search to compute discovery and lowest reachable times for bridge detection.
     * @param {object} state - The graph context object containing all necessary graph data.
     * @param {number} currentNode - The current vertex being visited in the DFS traversal.
     * @param {number} parentNode - The parent of the currentNode in the DFS tree (-1 for the root of a DFS tree).
     */
    function depthFirstSearchForBridges(state, currentNode, parentNode = -1) {
        state.visitedVertices[currentNode] = true;
        state.discoveryTime[currentNode] = state.timeCounter;
        state.lowestReachableTime[currentNode] = state.timeCounter;
        state.timeCounter++;

        const neighborNodes = state.adjacencyList[currentNode];

        for (const neighbor of neighborNodes) {
            if (neighbor === parentNode) {
                continue; // Skip the edge that led us to the current node
            }

            if (!state.visitedVertices[neighbor]) {
                // This is a tree edge, recurse into the neighbor's subtree
                depthFirstSearchForBridges(state, neighbor, currentNode);

                // After returning from recursion, update the lowest reachable time for the current node.
                // It can reach at least as low as its neighbor's lowest reachable time.
                state.lowestReachableTime[currentNode] = Math.min(state.lowestReachableTime[currentNode], state.lowestReachableTime[neighbor]);
            } else {
                // This is a back-edge (neighbor is visited and not the parent).
                // Update the lowest reachable time with the neighbor's discovery time.
                state.lowestReachableTime[currentNode] = Math.min(state.lowestReachableTime[currentNode], state.discoveryTime[neighbor]);
            }
        }
    }

    // Iterate through all vertices to ensure all connected components are processed.
    for (let vIdx = 0; vIdx < graphContext.vertexCount; vIdx++) {
        if (!graphContext.visitedVertices[vIdx]) {
            depthFirstSearchForBridges(graphContext, vIdx);
        }
    }

    // After DFS, identify bridges by iterating through all original edges.
    graphContext.edgePairs.forEach(function (edgePair) {
        let nodeU = edgePair[0];
        let nodeV = edgePair[1];

        // Ensure nodeU is the ancestor or discovered earlier for consistent comparison.
        if (graphContext.discoveryTime[nodeU] > graphContext.discoveryTime[nodeV]) {
            [nodeU, nodeV] = [nodeV, nodeU]; // Swap for canonical order (smaller discovery time first)
        }

        // An edge (nodeU, nodeV) is a bridge if nodeV (the child) cannot reach nodeU (the parent)
        // or any ancestor of nodeU through a back-edge from its subtree.
        if (graphContext.discoveryTime[nodeU] < graphContext.lowestReachableTime[nodeV]) {
            // Store the bridge with the smaller node index first for consistent output.
            const bridgeStartNode = Math.min(nodeU, nodeV);
            const bridgeEndNode = Math.max(nodeU, nodeV);
            graphContext.foundBridges[bridgeStartNode].push(bridgeEndNode);
        }
    });

    // Sort bridges originating from each source node for consistent output order.
    graphContext.foundBridges = graphContext.foundBridges.map(function (connectedBridges) {
        return connectedBridges.sort((a, b) => a - b); // Numerical ascending sort
    });

    // Output all identified bridges.
    for (let sourceNode = 0; sourceNode < graphContext.vertexCount; sourceNode++) {
        const bridgesFromSource = graphContext.foundBridges[sourceNode];
        for (let bridgeIdx = 0; bridgeIdx < bridgesFromSource.length; bridgeIdx++) {
            const targetNode = bridgesFromSource[bridgeIdx];
            printOutput(`${sourceNode} ${targetNode}`);
        }
    }
}

setupInputProcessing();