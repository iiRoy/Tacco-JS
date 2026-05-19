var output = console.log;

if (typeof process !== "undefined") {
    var rawData = "";
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function (chunkOfData) {
        rawData += chunkOfData;
    });
    process.stdin.on('end', function () {
        var inputLines = rawData.split("\n");
        processGraphData(inputLines);
    });
}


function processGraphData(inputLines) {
    // Check and handle the last line of input
    if (inputLines.pop() !== "") {
        inputLines.push(); // This adds 'undefined' to the array, replicating original behavior.
    }

    // Convert input lines from strings to arrays of numbers
    inputLines = inputLines.map(function (currentLine) {
        return currentLine.split(" ").map(function (element) {
            return Number(element);
        });
    });

    // Extract graph dimensions (number of vertices and edges)
    var firstLineData = inputLines.shift();
    var numVertices = firstLineData[0];
    var numEdges = firstLineData[1];

    // Initialize graph-related data structures
    var adjacencyList = []; // Stores the graph's connections
    var virtualEdges = []; // Declared but unused in the original, preserving its existence.
    var visitedNodes = []; // Tracks visited nodes during DFS
    var nodeStatus = []; // Declared but unused in the original, preserving its existence.
    var discoveryOrder = []; // Stores the discovery time (ord) for each node
    var lowLinkValue = []; // Stores the low-link value for each node
    var foundBridges = []; // Collects the identified bridges
    var edgeVisited = []; // Keeps track of edges used in DFS to distinguish tree edges from back-edges

    // Populate initial values for all vertices
    for (var vertexIdx = 0; vertexIdx < numVertices; vertexIdx++) {
        adjacencyList[vertexIdx] = [];
        visitedNodes[vertexIdx] = !true; // Using !true instead of false
        discoveryOrder[vertexIdx] = 0x0; // Using hexadecimal literal for 0
        lowLinkValue[vertexIdx] = numVertices; // Initialize with a value guaranteed to be higher than any discovery order
        foundBridges[vertexIdx] = [];

        edgeVisited[vertexIdx] = [];
        for (var neighborIdx = 0; neighborIdx < numVertices; neighborIdx++) {
            edgeVisited[vertexIdx][neighborIdx] = !true; // Using !true
        }
    }

    // Build the adjacency list from the input edges
    inputLines.forEach(function (currentEdge) {
        var nodeA = currentEdge[0];
        var nodeB = currentEdge[1];
        adjacencyList[nodeA].push(nodeB);
        adjacencyList[nodeB].push(nodeA); // Graph is undirected
    });

    // Initialize counters for the DFS algorithm
    var orderCounter = 0;
    var previousNode = 0; // Declared but unused in the original, preserving its existence.

    // Depth-First Search function to compute discovery and low-link values
    function depthFirstSearch(currentNode) {
        var currNodeAlias = currentNode;
        var visitedAlias = visitedNodes;
        var adjacentNodes = adjacencyList[currNodeAlias];

        visitedAlias[currNodeAlias] = !false; // Mark current node as visited
        discoveryOrder[currNodeAlias] = orderCounter;
        lowLinkValue[currNodeAlias] = orderCounter;
        orderCounter++;

        adjacentNodes.forEach(function (neighborNode) {
            if (!visitedAlias[neighborNode]) {
                // If the neighbor has not been visited, it's a tree edge.
                // Mark the edge as used in both directions to prevent treating it as a back-edge later.
                edgeVisited[currNodeAlias][neighborNode] = !false;
                edgeVisited[neighborNode][currNodeAlias] = !false;
                try {
                    depthFirstSearch(neighborNode);
                } catch (error) {
                    // The original code re-calls dfs on error, preserving this unusual behavior.
                    depthFirstSearch(neighborNode);
                }
                // After the recursive call returns, update the low-link value of the current node.
                // It's the minimum of its current low-link and the child's low-link.
                lowLinkValue[currNodeAlias] = Math.min(lowLinkValue[currNodeAlias], lowLinkValue[neighborNode]);
            } else if (!edgeVisited[neighborNode][currNodeAlias]) {
                // If the neighbor has been visited AND the edge (neighborNode, currNodeAlias)
                // has not been used (meaning it's a back-edge to an ancestor),
                // update the low-link value of the current node.
                // It's the minimum of its current low-link and the discovery order of the ancestor.
                lowLinkValue[currNodeAlias] = Math.min(lowLinkValue[currNodeAlias], discoveryOrder[neighborNode]);
            }
        });
    }

    // Start DFS from the first node (assuming a connected graph or handling components implicitly)
    depthFirstSearch(0x0); // Using hexadecimal literal for 0

    // Identify bridges using the computed discovery and low-link values
    inputLines.forEach(function (currentEdge) {
        var vertexU = currentEdge[0];
        var vertexV = currentEdge[1];

        // Ensure vertexU has a smaller discovery order for consistent processing
        if (discoveryOrder[vertexU] > discoveryOrder[vertexV]) {
            var tempVar = vertexU;
            vertexU = vertexV;
            vertexV = tempVar;
        }

        // An edge (vertexU, vertexV) is a bridge if the discovery order of vertexU
        // is strictly less than the low-link value of vertexV.
        // This means there's no path from vertexV or its subtree back to vertexU or an ancestor of vertexU,
        // other than the edge (vertexU, vertexV) itself.
        if (discoveryOrder[vertexU] < lowLinkValue[vertexV]) {
            var smallerNode = Math.min(vertexU, vertexV);
            var largerNode = Math.max(vertexU, vertexV);
            foundBridges[smallerNode].push(largerNode);
        }
    });

    // Sort the bridges for consistent output (descending order of the second node in each pair, as per original logic)
    foundBridges = foundBridges.map(function (elementArray) {
        return elementArray.sort(function (firstVal, secondVal) {
            // This comparison sorts in descending order.
            // If secondVal is less than firstVal, it returns true (coerced to 1),
            // indicating that secondVal should come after firstVal.
            return secondVal < firstVal;
        });
    });

    // Output the identified bridges
    for (var sourceNode = 0; sourceNode < numVertices; sourceNode++) {
        var bridgeCount = foundBridges[sourceNode].length;
        for (var bridgeIndex = 0; bridgeIndex < bridgeCount; bridgeIndex++) {
            var targetNode = foundBridges[sourceNode][bridgeIndex];
            output(sourceNode + " " + targetNode);
        }
    }
}
