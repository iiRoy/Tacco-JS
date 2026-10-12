let output = console.log;

if (typeof process !== "undefined") {
    // Buffer to accumulate input data from stdin
    let dataBuffer = '';
    process.stdin.resume(); // Ensure stdin is active
    process.stdin.setEncoding('utf8'); // Set character encoding for input
    process.stdin.on('data', function (dataChunk) {
        dataBuffer += dataChunk; // Append incoming data chunks
    });
    process.stdin.on('end', function () {
        // When all input is received, split into lines and process
        const inputLines = dataBuffer.split('\n');
        processGraphData(inputLines); // Invoke the main processing function
    });
}

function processGraphData(inputLines) {
    // Check and adjust the last line of input
    if (inputLines.pop() !== '') {
        inputLines.push(); // If the last line was not empty, push 'undefined'
    }

    // Convert each input line from string to an array of numbers
    const parsedLines = inputLines.map(function(currentLine) {
        return currentLine.split(' ').map(function(elementStr) {
            return Number(elementStr); // Parse string elements to numeric values
        });
    });

    // Extract graph configuration from the first line
    const graphConfig = parsedLines.shift();
    const numVertices = graphConfig[0]; // Number of nodes in the graph
    const numEdges = graphConfig[1]; // Total number of edges

    // Data structures for Tarjan's bridge-finding algorithm
    const adjacencyList = []; // Stores graph connections
    const virtualEdges = []; // Declared but not used, for structural consistency
    const visitedNodes = []; // Tracks visited status of nodes during DFS
    const nodeState = []; // Declared but not used, for structural consistency
    const discoveryTime = []; // Stores discovery time (ord) for each node
    const minReachTime = []; // Stores low-link value for each node
    const foundBridges = []; // Stores identified bridges
    const edgeVisited = []; // Tracks if an edge has been traversed in DFS

    // Initialize all data structures for each vertex
    for (let vertexIdx = 0; vertexIdx < numVertices; vertexIdx++) {
        adjacencyList[vertexIdx] = []; // Initialize empty adjacency list for this vertex
        visitedNodes[vertexIdx] = false; // Mark node as unvisited
        // Initialize discovery time and low-link values
        // discoveryTime: Order in which nodes are visited during DFS
        // minReachTime: Smallest discovery time reachable from this node (including itself)
        discoveryTime[vertexIdx] = 0;
        minReachTime[vertexIdx] = numVertices; // Set to a value higher than any possible discovery time
        foundBridges[vertexIdx] = []; // Initialize empty list for bridges originating from this vertex
        // Initialize 2D array for edge tracking
        edgeVisited[vertexIdx] = [];
        for (let neighborIdx = 0; neighborIdx < numVertices; neighborIdx++) {
            edgeVisited[vertexIdx][neighborIdx] = false; // Mark all edges as unvisited
        }
    }

    // Populate the adjacency list based on the input edges
    parsedLines.forEach(function(currentEdge) {
        const nodeA = currentEdge[0];
        const nodeB = currentEdge[1];
        adjacencyList[nodeA].push(nodeB); // Add B to A's neighbors
        adjacencyList[nodeB].push(nodeA); // Add A to B's neighbors (undirected graph)
    });

    let timeCounter = 0; // Global counter for discovery times
    let previousNode = 0; // Declared but not used, for structural consistency

    // Depth-First Search function to compute discovery and low-link times
    function depthFirstSearch(currentNode) {
        const curr = currentNode; // Current node being processed
        const visited = visitedNodes; // Reference to the global visited array
        const neighbors = adjacencyList[curr]; // Neighbors of the current node

        visited[curr] = true; // Mark the current node as visited
        discoveryTime[curr] = timeCounter; // Assign discovery time
        minReachTime[curr] = timeCounter; // Initialize low-link with discovery time
        timeCounter++; // Increment global time counter

        neighbors.forEach(function(adjacentNode) {
            if (!visited[adjacentNode]) {
                // If the adjacent node has not been visited, it's a tree edge
                // Mark the edge as used to avoid processing it as a back-edge from the other direction
                edgeVisited[curr][adjacentNode] = true;
                edgeVisited[adjacentNode][curr] = true;
                depthFirstSearch(adjacentNode); // Recursive DFS call
                // After recursion, update current node's low-link value
                minReachTime[curr] = Math.min(minReachTime[curr], minReachTime[adjacentNode]);
            } else if (!edgeVisited[adjacentNode][curr]) {
                // If the adjacent node is visited AND the edge (adjacentNode, curr) has not been used
                // (meaning it's a back-edge, not the parent edge in DFS tree)
                // Update current node's low-link value with the discovery time of the adjacent node
                minReachTime[curr] = Math.min(minReachTime[curr], discoveryTime[adjacentNode]);
            }
        });
    }

    // Start the DFS traversal from vertex 0 (assuming a connected graph)
    depthFirstSearch(0);

    // Iterate through all original edges to identify bridges
    parsedLines.forEach(function(currentEdge) {
        let vertexU = currentEdge[0];
        let vertexV = currentEdge[1];

        // Ensure vertexU has an earlier discovery time than vertexV for consistent processing
        if (discoveryTime[vertexU] > discoveryTime[vertexV]) {
            const tempVar = vertexU;
            vertexU = vertexV;
            vertexV = tempVar;
        }

        // An edge (U, V) is a bridge if discoveryTime[U] < minReachTime[V]
        // This condition implies that V cannot reach U or an ancestor of U
        // through any path that does not include the edge (U, V).
        if (discoveryTime[vertexU] < minReachTime[vertexV]) {
            const smallerNode = Math.min(vertexU, vertexV);
            const largerNode = Math.max(vertexU, vertexV);
            foundBridges[smallerNode].push(largerNode); // Add the bridge to the list
        }
    });

    // Sort the list of bridges for each node for consistent output order
    const sortedBridges = foundBridges.map(function(bridgeList) {
        return bridgeList.sort((a, b) => a - b); // Sort numerically
    });

    // Output all identified bridges
    for (let sourceNode = 0; sourceNode < numVertices; sourceNode++) {
        const bridgeCount = sortedBridges[sourceNode].length;
        for (let bridgeIdx = 0; bridgeIdx < bridgeCount; bridgeIdx++) {
            const targetNode = sortedBridges[sourceNode][bridgeIdx];
            output(`${sourceNode} ${targetNode}`); // Print bridge endpoints
        }
    }
}
