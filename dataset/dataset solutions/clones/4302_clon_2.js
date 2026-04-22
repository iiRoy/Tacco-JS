// This function processes the entire dataset provided as an array of strings.
function ExecuteGraphAnalysis(rawData) {
    // Extract the total number of vertices and edges from the first line.
    // The first element specifies the count of nodes in the graph.
    let vertexTotal = parseInt(rawData[0].split(" ")[0], 10);
    // The second element indicates the total number of connections (edges).
    let linkTotal = parseInt(rawData[0].split(" ")[1], 10);

    // Initialize an adjacency map to store graph connections.
    // This will map each vertex to another map of its neighbors and the edge index.
    const connectionRegistry = {};

    // Iterate through each of the 'linkTotal' lines to build the graph structure.
    for (let linkIndex = 1; linkIndex <= linkTotal; linkIndex++) {
        // Parse the two connected vertices for the current edge.
        const firstVertex = parseInt(rawData[linkIndex].split(" ")[0], 10);
        const secondVertex = parseInt(rawData[linkIndex].split(" ")[1], 10);

        // Ensure the adjacency map has entries for both vertices.
        // If an entry doesn't exist, initialize it as an empty object.
        connectionRegistry[firstVertex] = connectionRegistry[firstVertex] || {};
        connectionRegistry[secondVertex] = connectionRegistry[secondVertex] || {};
        
        // Record the current linkIndex as the identifier for the edge between firstVertex and secondVertex.
        connectionRegistry[firstVertex][secondVertex] = linkIndex;
        connectionRegistry[secondVertex][firstVertex] = linkIndex;
    }

    // Initialize a counter for edges that, when removed, disconnect the graph.
    let disconnectedComponents = 0;
    
    // Loop through each edge, temporarily removing it and checking graph connectivity.
    for (let currentLink = 1; currentLink <= linkTotal; currentLink++) {
        // If removing the currentLink results in a graph with fewer than 'vertexTotal' connected nodes,
        // it means this link is crucial for full connectivity.
        if (exploreConnectivity(connectionRegistry, currentLink) !== vertexTotal) {
            disconnectedComponents++;
        }
    }
    
    // Output the final count of critical edges.
    console.log(disconnectedComponents);
}


// This helper function performs a graph traversal (like BFS) to determine the number of reachable nodes
// when a specific edge is considered "removed" (ignored).
function exploreConnectivity(graphStructure, ignoredEdgeIdentifier) {
    // Use a queue for traversal, starting from node 1 (assuming nodes are 1-indexed).
    const traversalQueue = [1];
    // Keep track of all nodes that have been visited during this traversal.
    const visitedNodes = {};

    // Continue as long as there are nodes in the queue to process.
    while (traversalQueue.length > 0) {
        // Dequeue the current node to process.
        const currentVertex = traversalQueue.shift(); // Using shift for BFS-like behavior

        // If this node has already been visited, skip it to avoid cycles and redundant work.
        if (visitedNodes[currentVertex]) {
            continue;
        }
        
        // Mark the current node as visited.
        visitedNodes[currentVertex] = true;

        // Get all direct neighbors of the current vertex.
        const adjacentVertices = Object.keys(graphStructure[currentVertex]);
        
        // Iterate over each neighbor.
        adjacentVertices.forEach(adjVertex => {
            // Check if the edge connecting currentVertex to adjVertex is NOT the one we're ignoring.
            if (graphStructure[currentVertex][adjVertex] !== ignoredEdgeIdentifier) {
                // If the edge is not ignored, add the neighbor to the queue for further exploration.
                traversalQueue.push(parseInt(adjVertex, 10)); // Ensure it's treated as a number
            }
        });
    }
    // Return the total count of distinct nodes visited during this traversal.
    return Object.keys(visitedNodes).length;
}


// Read input from standard input, trim whitespace, and split into lines.
ExecuteGraphAnalysis(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));