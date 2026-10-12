// This function serves as the primary entry point for processing the input data.
function ProcessInput(rawData) {
    // The initial line of input contains two space-separated integers:
    // the total number of nodes (N) and the total number of edges (M).
    // We parse these values, converting them from strings to numbers.
    const nodeCount = Number(rawData[0].split(" ")[0]);
    const edgeCount = Number(rawData[0].split(" ")[1]);

    // An object is initialized to represent the graph's adjacency structure.
    // Each key in this object will be a node identifier, and its value will be
    // another object mapping connected neighbor nodes to the index of the edge
    // that connects them.
    const graphConnections = {};

    // We iterate through the subsequent lines of input, each defining an edge.
    // The loop runs from 1 up to the total number of edges (M).
    for (let edgeIndex = 1; edgeIndex <= edgeCount; edgeIndex++) {
        // For each edge, we extract the two nodes it connects.
        // These are also parsed as numbers.
        const nodeA = Number(rawData[edgeIndex].split(" ")[0]);
        const nodeB = Number(rawData[edgeIndex].split(" ")[1]);

        // Before adding the connection, we ensure that both nodes exist as keys
        // in our graphConnections map. If a node hasn't been encountered yet,
        // its corresponding value is initialized as an empty object.
        graphConnections[nodeA] = graphConnections[nodeA] || {};
        graphConnections[nodeB] = graphConnections[nodeB] || {};

        // The edge index is stored for both directions of the connection.
        // This allows us to later identify and "remove" specific edges by their index.
        graphConnections[nodeA][nodeB] = edgeIndex;
        graphConnections[nodeB][nodeA] = edgeIndex;
    }

    // A counter is set up to track how many edges, when removed,
    // would disconnect the graph (i.e., make it impossible to reach all nodes from node 1).
    let disconnectedEdges = 0;

    // Now, we perform a simulation: for each edge in the graph, we temporarily
    // consider it "removed" and check the graph's connectivity.
    for (let currentEdgeIdentifier = 1; currentEdgeIdentifier <= edgeCount; currentEdgeIdentifier++) {
        // The 'countReachableNodes' function is called to determine how many nodes
        // are reachable from node 1, given that the 'currentEdgeIdentifier' edge is ignored.
        // If the number of reachable nodes is less than the total 'nodeCount',
        // it means removing this edge disconnects the graph.
        if (countReachableNodes(graphConnections, currentEdgeIdentifier) !== nodeCount) {
            disconnectedEdges++; // Increment the counter for such critical edges.
        }
    }

    // Finally, the total count of critical edges is printed to the console.
    console.log(disconnectedEdges);
}

/**
 * Performs a graph traversal (like BFS or DFS) starting from node 1
 * to count all unique nodes reachable, while ignoring a specified edge.
 *
 * @param {object} graphMap - The adjacency map of the graph, where keys are nodes
 *                            and values are objects mapping neighbors to edge indices.
 * @param {number} excludedEdgeId - The identifier of the edge that should not be
 *                                  traversed during this connectivity check.
 * @returns {number} The total number of distinct nodes that can be reached from node 1.
 */
function countReachableNodes(graphMap, excludedEdgeId) {
    // A queue is used to manage nodes to visit during the traversal.
    // The traversal always begins from node 1.
    const traversalQueue = [1];
    // An object keeps track of all nodes that have already been visited
    // to prevent infinite loops in cyclic graphs and redundant processing.
    const visitedNodes = {};

    // The traversal continues as long as there are nodes in the queue to process.
    while (traversalQueue.length > 0) {
        // The first node is removed from the front of the queue to be processed.
        const currentNode = traversalQueue.splice(0, 1)[0];

        // If the current node has already been marked as visited, we skip it
        // and move to the next node in the queue.
        if (visitedNodes[currentNode]) {
            continue;
        }

        // Mark the current node as visited. Using '!false' instead of 'true'
        // is a stylistic variation that maintains identical boolean value.
        visitedNodes[currentNode] = !false;

        // Retrieve all direct neighbors of the current node from the graph map.
        const neighbors = Object.keys(graphMap[currentNode]);

        // Iterate through each of the current node's neighbors.
        neighbors.forEach(neighborNode => {
            // Check if the edge connecting the 'currentNode' to 'neighborNode'
            // is NOT the edge that we are currently excluding from the traversal.
            // If it's not the excluded edge, and the 'neighborNode' hasn't been visited yet,
            // then add this 'neighborNode' to the queue for future processing.
            if (graphMap[currentNode][neighborNode] !== excludedEdgeId) {
                traversalQueue.push(neighborNode);
            }
        });
    }
    // After the traversal completes, the total count of unique nodes that were visited
    // (i.e., reachable from node 1) is returned.
    return Object.keys(visitedNodes).length;
}

// This block handles reading input from standard input,
// preparing it, and then invoking the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n"));
