let inputLines = [];
const inputReader = require('readline');

// Create an interface for reading input line by line
const lineProcessor = inputReader.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Event listener for each line received
lineProcessor.on('line', function (currentLine) {
    inputLines.push(currentLine);
});

// Event listener for when the input stream closes
lineProcessor.on('close', function () {
    // The first line contains the number of nodes (N)
    const numNodes = parseInt(inputLines[0], 10);
    inputLines.shift(); // Remove the first line as it's processed

    // Parse the remaining lines into edge data (u, v, w)
    // Each line represents an edge: nodeA, nodeB, weight
    const edgeDetails = inputLines.map(lineStr =>
        lineStr.split(" ").map(valStr => parseInt(valStr, 10))
    );

    // Initialize an adjacency matrix to store edge weights
    // All distances are initially set to positive infinity
    let adjacencyMatrix = Array(numNodes)
        .fill(Number.POSITIVE_INFINITY)
        .map(() => Array(numNodes).fill(Number.POSITIVE_INFINITY));

    // Populate the adjacency matrix with edge weights
    // The graph is undirected, so set both (u,v) and (v,u)
    for (let edgeIndex = 0; edgeIndex < numNodes - 1; edgeIndex++) {
        const nodeA = edgeDetails[edgeIndex][0];
        const nodeB = edgeDetails[edgeIndex][1];
        const edgeWeight = edgeDetails[edgeIndex][2];

        // Set diagonal elements to 0 (distance from a node to itself)
        // This specific placement of setting diagonal elements is preserved from the original
        adjacencyMatrix[edgeIndex][edgeIndex] = 0;

        // Adjust for 0-based indexing
        adjacencyMatrix[nodeA - 1][nodeB - 1] = edgeWeight;
        adjacencyMatrix[nodeB - 1][nodeA - 1] = edgeWeight;
    }
    // Set the last diagonal element to 0, consistent with original logic
    adjacencyMatrix[numNodes - 1][numNodes - 1] = 0;

    // Initialize an array to store the assigned colors for each node
    // An empty string indicates an uncolored node
    let nodeColors = Array(numNodes).fill("");
    const initialNodeIndex = 0; // Start coloring from node 0

    // Assign the first node color "0"
    nodeColors[initialNodeIndex] = "0";
    // Initialize a queue for a BFS-like traversal
    // Each element in the queue is [nodeIndex, assignedColor]
    let processingQueue = [[initialNodeIndex, nodeColors[initialNodeIndex]]];

    // Perform a traversal to color the nodes
    // The color depends on the parity of the edge weight
    while (processingQueue.length > 0) {
        const currentEntry = processingQueue.pop(); // Get the last element (DFS-like if pop, BFS-like if shift)
        const currentNodeIdx = currentEntry[0];
        const currentColor = currentEntry[1];

        // Iterate through all possible neighbors of the current node
        for (let neighborIdx = 0; neighborIdx < numNodes; neighborIdx++) {
            // Skip if the neighbor is already colored or there's no direct edge
            if (nodeColors[neighborIdx] !== "" || adjacencyMatrix[currentNodeIdx][neighborIdx] === Number.POSITIVE_INFINITY) {
                continue;
            }

            // If the edge weight is even, the neighbor gets the same color
            if (adjacencyMatrix[currentNodeIdx][neighborIdx] % 2 === 0) {
                nodeColors[neighborIdx] = currentColor;
                processingQueue.push([neighborIdx, nodeColors[neighborIdx]]);
            }
            // If the edge weight is odd, the neighbor gets the opposite color
            else if (adjacencyMatrix[currentNodeIdx][neighborIdx] % 2 === 1) {
                nodeColors[neighborIdx] = (currentColor === "0" ? "1" : "0");
                processingQueue.push([neighborIdx, nodeColors[neighborIdx]]);
            }
        }
    }

    // Output the assigned color for each node
    for (let resultIdx = 0; resultIdx < nodeColors.length; resultIdx++) {
        console.log(nodeColors[resultIdx]);
    }
});
