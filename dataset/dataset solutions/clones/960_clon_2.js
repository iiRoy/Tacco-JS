let rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8').trim();

let dataRows = rawInputData.split('\n');

let vertexCount = +dataRows.shift(); // Obtain the total number of graph vertices.

let connectionCosts = []; // Initialize the adjacency matrix for edge weights.
for (let rowIdx = 0; rowIdx < vertexCount; rowIdx++) {
    connectionCosts.push(new Array(vertexCount)); // Create a new row for the matrix.
    for (let colIdx = 0; colIdx < vertexCount; colIdx++) {
        connectionCosts[rowIdx][colIdx] = Number.POSITIVE_INFINITY; // All connections are initially considered infinite.
    }
    connectionCosts[rowIdx][rowIdx] = 0; // The path cost from a node to itself is zero.
}

for (let currentVtxIdx = 0; currentVtxIdx < vertexCount; currentVtxIdx++) {
    // Parse the line detailing the connections for the current vertex.
    let parsedLineTokens = dataRows.shift().trim().split(' ').map(function(numericValue){return +numericValue});

    let numOutgoingEdges = parsedLineTokens[1]; // Get the count of outgoing edges from this vertex.

    // Iterate through each outgoing edge defined in the line.
    for (let edgeLoop = 0; edgeLoop < numOutgoingEdges; edgeLoop++) {
        let destinationVertex = parsedLineTokens[2 + edgeLoop * 2]; // Extract the connected vertex ID.
        let edgeWeight = parsedLineTokens[2 + edgeLoop * 2 + 1]; // Extract the weight of this edge.
        connectionCosts[currentVtxIdx][destinationVertex] = edgeWeight; // Store the edge weight in the matrix.
    }
}


let shortestPaths = [0]; // Array to hold the shortest path costs from the source (node 0).
// The distance to the source itself is initialized to 0.

// Initialize all other shortest path costs to positive infinity.
for (let pathIdx = 1; pathIdx < vertexCount; pathIdx++) {
    shortestPaths.push(Number.POSITIVE_INFINITY);
}

let processedNodes = new Object(); // A set to keep track of nodes that have been finalized.

// Dijkstra's algorithm main loop.
while (true) {
    let minCostVertex = -1; // Variable to store the index of the unvisited vertex with the minimum current distance.

    // Search for the unvisited vertex with the smallest known distance.
    for (let searchIdx = 0; searchIdx < vertexCount; searchIdx++) {
        if (!processedNodes[searchIdx] && (minCostVertex === -1 || shortestPaths[searchIdx] < shortestPaths[minCostVertex])) {
            minCostVertex = searchIdx;
        }
    }

    // If no unvisited vertex is found (either all nodes are processed or graph is disconnected), terminate.
    if (minCostVertex === -1) {
        break;
    }

    processedNodes[minCostVertex] = true; // Mark the selected vertex as processed.

    // Relax all edges emanating from the newly processed vertex.
    for (let neighborIdx = 0; neighborIdx < vertexCount; neighborIdx++) {
        // Update the shortest path to the neighbor if a shorter path is found via minCostVertex.
        shortestPaths[neighborIdx] = Math.min(shortestPaths[neighborIdx], shortestPaths[minCostVertex] + connectionCosts[minCostVertex][neighborIdx]);
    }
}

// Display the calculated shortest path from the source (node 0) to every other node.
for (let outputIdx = 0; outputIdx < vertexCount; outputIdx++) {
    console.log(outputIdx, shortestPaths[outputIdx]);
}