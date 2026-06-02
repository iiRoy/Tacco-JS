var output = console.log;

if (typeof process !== "undefined") {
    var rawData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', function (dataSegment) {
        rawData += dataSegment;
    });

    process.stdin.on('end', function () {
        var inputLines = rawData.split("\n");
        processGraphData(inputLines);
    });
}


function processGraphData(inputLines) {
    // Remove the last element. If it was not an empty string,
    // then append 'undefined' to the array. This behavior is preserved from the original.
    if (inputLines.pop() !== "") {
        inputLines.push();
    }

    // Transform all input lines into arrays of numbers
    var parsedLines = inputLines.map(function (currentLine) {
        return currentLine.split(" ").map(function (element) {
            return Number(element);
        });
    });

    // Extract graph dimensions from the first line of parsed data
    var firstLineData = parsedLines.shift();
    var vertexCount = firstLineData[0]; // Number of vertices
    var edgeCount = firstLineData[1];   // Number of edges

    // Initialize various data structures for graph processing
    var adjacencyList = [];  // Stores the graph's connections
    var virtualEdges = [];   // Declared but not utilized in this algorithm
    var visitedNodes = [];   // Tracks visited nodes during DFS
    var nodeStatus = [];     // Another declared but unused array
    var discoveryOrder = []; // Stores the discovery time (ord) for each node
    var lowLinkValue = [];   // Stores the low-link value for each node
    var foundBridges = [];   // Will store the identified bridges

    // Set up initial states for all vertices
    for (var idx = 0; idx < vertexCount; idx++) {
        adjacencyList[idx] = [];
        visitedNodes[idx] = false;
        discoveryOrder[idx] = 0;
        lowLinkValue[idx] = vertexCount; // Initialize low-link with a value higher than any possible discovery order
        foundBridges[idx] = [];
    }

    // Populate the adjacency list based on the input edges
    parsedLines.forEach(function (currentEdge) {
        var nodeA = currentEdge[0];
        var nodeB = currentEdge[1];
        adjacencyList[nodeA].push(nodeB); // Add edge (A, B)
        adjacencyList[nodeB].push(nodeA); // Add edge (B, A) for undirected graph
    });

    var orderCounter = 0; // Global counter for discovery times
    var previousNode = 0; // Placeholder for the parent in DFS, initialized to a dummy value

    /**
     * Performs a Depth First Search traversal to compute discovery times and low-link values.
     * This function is central to Tarjan's bridge-finding algorithm.
     * @param {number} currentNode - The vertex currently being explored.
     * @param {number} parentNode - The parent vertex in the DFS tree.
     */
    function depthFirstSearch(currentNode, parentNode) {
        var curr = currentNode;
        var visited = visitedNodes; // Reference to the global visited array
        var neighbors = adjacencyList[curr]; // Get all adjacent vertices

        visited[curr] = true; // Mark the current node as visited
        discoveryOrder[curr] = orderCounter; // Assign discovery time
        lowLinkValue[curr] = orderCounter;   // Initialize low-link with discovery time
        orderCounter++; // Increment the global counter

        // Iterate through all neighbors of the current node
        neighbors.forEach(function (neighborNode) {
            if (neighborNode === parentNode) {
                // If the neighbor is the parent, skip it to avoid going back up the tree
                return;
            }

            if (visited[neighborNode]) {
                // If the neighbor is already visited (and not the parent), it's a back-edge.
                // Update the low-link value of the current node with the discovery time of the visited neighbor.
                lowLinkValue[curr] = Math.min(lowLinkValue[curr], discoveryOrder[neighborNode]);
            } else {
                // If the neighbor has not been visited, recursively call DFS on it.
                depthFirstSearch(neighborNode, curr);

                // After the recursive call returns, update the low-link value of the current node
                // with the low-link value of its child.
                lowLinkValue[curr] = Math.min(lowLinkValue[curr], lowLinkValue[neighborNode]);
            }
        });
    }

    // Initiate DFS from vertex 0, using 'vertexCount' as a sentinel for the initial parent.
    depthFirstSearch(0, vertexCount);

    // After DFS, re-examine each original edge to identify bridges
    parsedLines.forEach(function (currentEdge) {
        var vertexU = currentEdge[0];
        var vertexV = currentEdge[1];

        // Ensure vertexU has a smaller discovery order than vertexV for consistent processing
        if (discoveryOrder[vertexU] > discoveryOrder[vertexV]) {
            var tempVar = vertexU;
            vertexU = vertexV;
            vertexV = tempVar;
        }

        // Bridge condition: If the discovery order of U is strictly less than the low-link value of V,
        // then the edge (U, V) is a bridge.
        if (discoveryOrder[vertexU] < lowLinkValue[vertexV]) {
            var smallerVertex = Math.min(vertexU, vertexV);
            var largerVertex = Math.max(vertexU, vertexV);
            foundBridges[smallerVertex].push(largerVertex); // Store the bridge
        }
    });

    // Sort the list of bridges for each source vertex for consistent output
    foundBridges = foundBridges.map(function (bridgeList) {
        return bridgeList.sort((a, b) => a - b); // Sort numerically
    });

    // Output all identified bridges
    for (var sourceVertex = 0; sourceVertex < vertexCount; sourceVertex++) {
        var bridgeCount = foundBridges[sourceVertex].length;
        for (var targetIndex = 0; targetIndex < bridgeCount; targetIndex++) {
            var targetVertex = foundBridges[sourceVertex][targetIndex];
            output(sourceVertex + " " + targetVertex); // Print the bridge (source, target)
        }
    }
}
