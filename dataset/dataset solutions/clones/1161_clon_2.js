var displayOutput = console.log;

if (typeof process !== "undefined") {
    var rawDataBuffer = ""; // Buffer to accumulate standard input
    process.stdin.resume(); // Start reading from stdin
    process.stdin.setEncoding('utf8'); // Set encoding for input

    process.stdin.on('data', function (dataSegment) {
        rawDataBuffer += dataSegment; // Append new data chunk
    });

    process.stdin.on('end', function () {
        var textLines = rawDataBuffer.split("\n"); // Split input into an array of lines
        findCriticalConnections(textLines); // Process the input lines
    });
}


function findCriticalConnections(textLines) {
    // Check if the last line is non-empty after popping; if so, push 'undefined' back.
    // This replicates the specific behavior of the original code's `lines.push()` without arguments.
    if (textLines.pop() !== "") {
        textLines.push();
    }

    // Convert each line into an array of numbers
    var numericData = textLines.map(function(currentLineStr) {
        return currentLineStr.split(" ").map(function(strElement) {
            return Number(strElement); // Parse string elements to numbers
        });
    });

    // Extract graph parameters from the first line
    var graphSpecs = numericData.shift();
    var vertexCount = graphSpecs[0]; // Total number of nodes in the graph
    var edgeCount = graphSpecs[1];   // Total number of edges (not directly used in this algorithm)

    // Declare and initialize data structures for Tarjan's bridge-finding algorithm
    var adjacencyLists = [];       // Stores graph connections as adjacency lists
    var dummyEdges = [];           // An array declared but not utilized in this specific logic
    var exploredStatus = [];       // Boolean array to track visited nodes during DFS
    var nodeState = [];            // Another declared but unused array for node status
    var discoveryTimes = [];       // Stores discovery time (ord) for each vertex
    var lowestReachTimes = [];     // Stores lowest reachable discovery time (lowlink) for each vertex
    var criticalLinks = [];        // Stores the identified bridge edges
    var edgeVisitedTracker = [];   // A 2D array to mark if an edge (u,v) has been traversed

    // Initialize all arrays for each vertex
    for (var nodeIdx = 0; nodeIdx < vertexCount; nodeIdx++) {
        adjacencyLists[nodeIdx] = [];    // Initialize empty adjacency list for current node
        exploredStatus[nodeIdx] = false; // Mark node as unvisited
        discoveryTimes[nodeIdx] = 0;     // Default discovery time
        lowestReachTimes[nodeIdx] = vertexCount; // Initialize low-link to a value higher than any possible discovery time
        criticalLinks[nodeIdx] = [];     // Initialize empty list for bridges starting at this node
        edgeVisitedTracker[nodeIdx] = []; // Initialize inner array for edge tracking

        for (var adjacentIdx = 0; adjacentIdx < vertexCount; adjacentIdx++) {
            edgeVisitedTracker[nodeIdx][adjacentIdx] = false; // Mark all potential edges as untraversed
        }
    }

    // Populate the adjacency lists based on input edge data
    numericData.forEach(function(connectionPair) {
        var nodeA = connectionPair[0]; // First node of the edge
        var nodeB = connectionPair[1]; // Second node of the edge
        adjacencyLists[nodeA].push(nodeB); // Add B to A's neighbors
        adjacencyLists[nodeB].push(nodeA); // Add A to B's neighbors (for an undirected graph)
    });

    var currentDfsTime = 0; // Global counter for DFS discovery times
    var previousMarker = 0; // An unused variable from the original code structure

    // Depth-First Search function for bridge detection
    function depthFirstSearch(currentNode) {
        var currentVertex = currentNode; // Alias for the current node
        var isVisited = exploredStatus; // Alias for the visited status array
        var neighbors = adjacencyLists[currentVertex]; // Get neighbors of the current vertex

        isVisited[currentVertex] = true;             // Mark current vertex as visited
        discoveryTimes[currentVertex] = currentDfsTime; // Set discovery time
        lowestReachTimes[currentVertex] = currentDfsTime; // Initialize low-link with discovery time
        currentDfsTime++;                            // Increment global time counter

        neighbors.forEach(function(adjacentNode) {
            if (!isVisited[adjacentNode]) {
                // If the neighbor hasn't been visited, it's a tree edge
                edgeVisitedTracker[currentVertex][adjacentNode] = true; // Mark edge as traversed
                edgeVisitedTracker[adjacentNode][currentVertex] = true; // Mark reverse edge as traversed
                depthFirstSearch(adjacentNode);                         // Recurse on the neighbor

                // After recursion returns, update current vertex's low-link value
                // It's the minimum of its own low-link and the neighbor's low-link
                lowestReachTimes[currentVertex] = Math.min(lowestReachTimes[currentVertex], lowestReachTimes[adjacentNode]);
            } else if (!edgeVisitedTracker[adjacentNode][currentVertex]) {
                // If the neighbor IS visited AND the edge (neighbor, current) has NOT been marked as traversed
                // (this indicates a back-edge to an ancestor, not a cross-edge to a fully processed subtree)
                // Update current vertex's low-link with the discovery time of the visited neighbor
                lowestReachTimes[currentVertex] = Math.min(lowestReachTimes[currentVertex], discoveryTimes[adjacentNode]);
            }
        });
    }

    // Start the DFS traversal from vertex 0
    depthFirstSearch(0);

    // After DFS, iterate through edges to identify bridges
    numericData.forEach(function(connectionPair) {
        var vertexOne = connectionPair[0]; // First endpoint
        var vertexTwo = connectionPair[1]; // Second endpoint

        // Standardize order: ensure vertexOne has a smaller discovery time
        if (discoveryTimes[vertexOne] > discoveryTimes[vertexTwo]) {
            var tempHolder = vertexOne;
            vertexOne = vertexTwo;
            vertexTwo = tempHolder;
        }

        // Bridge condition: if discovery time of vertexOne is less than low-link time of vertexTwo
        if (discoveryTimes[vertexOne] < lowestReachTimes[vertexTwo]) {
            var smallerNode = Math.min(vertexOne, vertexTwo);
            var largerNode = Math.max(vertexOne, vertexTwo);
            criticalLinks[smallerNode].push(largerNode); // Add bridge to list
        }
    });

    // Sort the identified critical links (bridges)
    // The original sort `b < a` sorts in descending order.
    criticalLinks = criticalLinks.map(function(linksFromNode) {
        return linksFromNode.sort(function(valB, valA) {
            return valB < valA; // Sorts elements in descending order
        });
    });

    // Output all detected critical links
    for (var sourceNodeIdx = 0; sourceNodeIdx < vertexCount; sourceNodeIdx++) {
        var numLinks = criticalLinks[sourceNodeIdx].length;
        for (var linkIndex = 0; linkIndex < numLinks; linkIndex++) {
            var destinationNode = criticalLinks[sourceNodeIdx][linkIndex];
            displayOutput(sourceNodeIdx + " " + destinationNode); // Print bridge endpoints
        }
    }
}