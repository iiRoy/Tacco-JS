var consoleLogger = console.log;

// Helper function to parse a space-separated string into an array of numbers
function parseNumericLine(lineContent) {
    return lineContent.split(" ").map(Number);
}

// Standard input handling for Node.js environment
if (typeof process !== "undefined") {
    let rawDataBuffer = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
        rawDataBuffer += chunk;
    });
    process.stdin.on('end', () => {
        let inputLines = rawDataBuffer.split("\n");
        processGraphData(inputLines);
    });
}

// Main function to process graph data and find bridges
function processGraphData(inputLines) {
    // Preserve original behavior: if the last line is not empty, remove it and add undefined.
    // If it is empty, remove it.
    const lastLineRemoved = inputLines.pop();
    if (lastLineRemoved !== "") {
        inputLines.push(undefined);
    }

    // Parse all input lines into arrays of numbers
    const parsedInputData = inputLines.map(parseNumericLine);

    // Extract graph configuration (number of vertices and edges)
    const graphConfig = parsedInputData.shift();
    const numVertices = graphConfig[0];
    // const numEdges = graphConfig[1]; // numEdges is read but not explicitly used in the algorithm

    // Initialize graph data structures
    const adjacencyList = Array.from({ length: numVertices }, () => []);
    const visitedNodes = Array(numVertices).fill(false);
    const discoveryOrder = Array(numVertices).fill(0);
    const lowLinkValue = Array(numVertices).fill(numVertices); // Initialize lowlink with V as per original
    const foundBridges = Array.from({ length: numVertices }, () => []);
    
    // Initialize a 2D array to track visited edges (for back-edge detection)
    const edgeVisited = Array.from({ length: numVertices }, () => Array(numVertices).fill(false));

    // Populate adjacency list from input edges
    parsedInputData.forEach(edgePair => {
        const nodeA = edgePair[0];
        const nodeB = edgePair[1];
        adjacencyList[nodeA].push(nodeB);
        adjacencyList[nodeB].push(nodeA);
    });

    let discoveryCounter = 0; // Counter for discovery order

    // Depth-First Search function to find discovery times and low-link values
    function depthFirstSearch(currentNode) {
        visitedNodes[currentNode] = true;
        discoveryOrder[currentNode] = discoveryCounter;
        lowLinkValue[currentNode] = discoveryCounter;
        discoveryCounter++;

        for (const neighborNode of adjacencyList[currentNode]) {
            if (!visitedNodes[neighborNode]) {
                // Mark the edge as visited in both directions to prevent re-processing as a back-edge
                edgeVisited[currentNode][neighborNode] = true;
                edgeVisited[neighborNode][currentNode] = true;
                
                depthFirstSearch(neighborNode); // Recursive call

                // Update low-link value after child subtree is processed
                lowLinkValue[currentNode] = Math.min(lowLinkValue[currentNode], lowLinkValue[neighborNode]);
            } else if (!edgeVisited[neighborNode][currentNode]) {
                // This is a back-edge to an already visited node (not the parent edge)
                lowLinkValue[currentNode] = Math.min(lowLinkValue[currentNode], discoveryOrder[neighborNode]);
            }
        }
    }

    // Start DFS from vertex 0 (assuming the graph is connected)
    depthFirstSearch(0);

    // Helper to ensure consistent order for bridge checking (u < v based on discovery order)
    function getOrderedEdge(vertex1, vertex2, orderArray) {
        if (orderArray[vertex1] > orderArray[vertex2]) {
            return [vertex2, vertex1];
        }
        return [vertex1, vertex2];
    }

    // Iterate through original edges to identify bridges
    parsedInputData.forEach(edgePair => {
        let vertexU = edgePair[0];
        let vertexV = edgePair[1];

        // Ensure vertexU has a smaller discovery order than vertexV for consistent bridge identification
        [vertexU, vertexV] = getOrderedEdge(vertexU, vertexV, discoveryOrder);

        // Bridge condition: discoveryOrder[u] < lowLinkValue[v]
        if (discoveryOrder[vertexU] < lowLinkValue[vertexV]) {
            const bridgeMinNode = Math.min(vertexU, vertexV);
            const bridgeMaxNode = Math.max(vertexU, vertexV);
            foundBridges[bridgeMinNode].push(bridgeMaxNode);
        }
    });

    // Sort the bridges within each source node in descending order
    const sortedBridges = foundBridges.map(bridgeList => {
        return bridgeList.sort((nodeA, nodeB) => nodeB - nodeA); // Equivalent to b < a for numbers
    });

    // Output the identified bridges
    for (let sourceNode = 0; sourceNode < numVertices; sourceNode++) {
        for (const targetNode of sortedBridges[sourceNode]) {
            consoleLogger(sourceNode + " " + targetNode);
        }
    }
}
