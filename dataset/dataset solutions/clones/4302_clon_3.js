function ProcessGraphData(rawDataLines) {
    // Parse the initial line to get the total number of vertices (nodes) and edges.
    // The first line contains "N M", where N is node count, M is edge count.
    const initialParams = rawDataLines[0].split(" ");
    const totalVertexCount = parseInt(initialParams[0], 10);
    const totalEdgeCount = parseInt(initialParams[1], 10);

    // Validate input parameters to ensure they are positive integers.
    if (isNaN(totalVertexCount) || totalVertexCount < 1 || isNaN(totalEdgeCount) || totalEdgeCount < 0) {
        // In a competitive programming context, this might just lead to an error or specific output.
        // For a Type III clone, adding a basic guard is a valid structural change.
        console.error("Error: Invalid graph dimensions provided. Please check input format.");
        return; // Terminate execution for invalid input
    }

    // `graphAdjacencyList` will store the graph structure.
    // Each key represents a vertex, and its value is an object mapping
    // adjacent vertices to the index of the edge connecting them.
    const graphAdjacencyList = {};

    // Define a utility function to ensure a vertex entry exists in the adjacency list.
    // This helps avoid repetitive checks and initializes the object for a new vertex.
    const ensureVertexEntry = (vertexIdentifier) => {
        if (!graphAdjacencyList[vertexIdentifier]) {
            graphAdjacencyList[vertexIdentifier] = {};
        }
    };

    // Iterate through the input lines to populate the adjacency list with edges.
    // Edges are 1-indexed in the problem statement, so we use `edgeIndex` from 1 to `totalEdgeCount`.
    for (let edgeIndex = 1; edgeIndex <= totalEdgeCount; ++edgeIndex) {
        const edgeDefinition = rawDataLines[edgeIndex].split(" ");
        const vertexOne = parseInt(edgeDefinition[0], 10);
        const vertexTwo = parseInt(edgeDefinition[1], 10);

        // Ensure both vertices involved in the current edge have an entry in the adjacency list.
        ensureVertexEntry(vertexOne);
        ensureVertexEntry(vertexTwo);

        // Store the edge index for both directions as this represents an undirected graph.
        // The edge index is crucial for identifying which edge to 'remove' during subsequent checks.
        graphAdjacencyList[vertexOne][vertexTwo] = edgeIndex;
        graphAdjacencyList[vertexTwo][vertexOne] = edgeIndex;
    }

    let countOfCriticalEdges = 0; // This variable will accumulate the final answer.

    // The core logic: iterate through each edge, conceptually 'remove' it,
    // and then check the connectivity of the graph from a starting node (vertex 1).
    // An edge is considered 'critical' if its removal disconnects the graph
    // such that not all nodes are reachable from vertex 1.
    for (let currentEdgeIdentifier = 1; currentEdgeIdentifier <= totalEdgeCount; ++currentEdgeIdentifier) {
        // Call a helper function to determine the number of nodes reachable from vertex 1
        // when the `currentEdgeIdentifier` is excluded from the graph traversal.
        const nodesReachableWithoutCurrentEdge = calculateReachableNodesAfterExclusion(
            graphAdjacencyList,
            currentEdgeIdentifier
        );

        // If the number of reachable nodes is less than the total number of vertices,
        // it signifies that this `currentEdgeIdentifier` was essential for connecting
        // all parts of the graph (or at least the component containing vertex 1).
        if (nodesReachableWithoutCurrentEdge < totalVertexCount) {
            countOfCriticalEdges++;
        }
    }

    // Output the final tally of critical edges.
    console.log(countOfCriticalEdges);
}

/**
 * Executes a Breadth-First Search (BFS) starting from vertex 1,
 * specifically excluding a designated edge, and then returns the count
 * of distinct vertices that were successfully reached during the traversal.
 *
 * @param {object} graphData - The adjacency list representation of the graph.
 * @param {number} excludedEdgeId - The unique identifier of the edge to be ignored during traversal.
 * @returns {number} The total number of vertices reachable from vertex 1 under the given exclusion.
 */
function calculateReachableNodesAfterExclusion(graphData, excludedEdgeId) {
    // Initialize a queue for the BFS traversal. The traversal always begins from vertex 1.
    const traversalQueue = [1];
    // Use a Set to efficiently keep track of all vertices that have been visited
    // to prevent infinite loops and redundant processing.
    const exploredVertices = new Set();
    exploredVertices.add(1); // Mark the starting vertex as visited immediately.

    // Continue the BFS as long as there are vertices in the queue to process.
    while (traversalQueue.length > 0) {
        // Dequeue the next vertex to be processed. `shift()` is used for queue-like behavior.
        const currentVertex = traversalQueue.shift();

        // Retrieve the map of neighbors for the `currentVertex`.
        // If `currentVertex` somehow has no entry, default to an empty object.
        const adjacentVerticesMap = graphData[currentVertex] || {};
        const neighborVertexKeys = Object.keys(adjacentVerticesMap);

        // Iterate over each potential neighbor of the `currentVertex`.
        for (const neighborKey of neighborVertexKeys) {
            const neighborId = parseInt(neighborKey, 10); // Convert string key back to a number.

            // Identify the unique ID of the edge connecting `currentVertex` to `neighborId`.
            const connectingEdgeIdentifier = adjacentVerticesMap[neighborKey];

            // Proceed only if two conditions are met:
            // 1. The `neighborId` has not been visited yet.
            // 2. The `connectingEdgeIdentifier` is NOT the edge we are intentionally excluding.
            if (!exploredVertices.has(neighborId) && connectingEdgeIdentifier !== excludedEdgeId) {
                exploredVertices.add(neighborId); // Mark this neighbor as visited.
                traversalQueue.push(neighborId); // Enqueue the neighbor to explore its connections later.
            }
        }
    }

    // The final size of the `exploredVertices` Set represents the total count
    // of unique nodes reachable from vertex 1 given the excluded edge.
    return exploredVertices.size;
}

// Standard input reading mechanism for competitive programming in Node.js.
// Reads the entire standard input, converts it to a string, removes leading/trailing whitespace,
// and then splits it into an array of lines.
const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
const cleanedInputLines = rawInputData.trim().split("\n");

// Initiate the graph processing with the prepared input data.
ProcessGraphData(cleanedInputLines);