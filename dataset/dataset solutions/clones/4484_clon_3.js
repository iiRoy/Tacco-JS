const processGameInput = (rawDataString) => {
    // Process raw input string, splitting into individual lines and removing any leading/trailing whitespace.
    const rawDataLines = rawDataString.trim().split('\n');

    // Extract the total number of nodes from the first line.
    // Using Number.parseInt with radix 10 for explicit base.
    const totalNodes = Number.parseInt(rawDataLines[0], 10);

    // Initialize an adjacency list to represent the graph.
    // Each element in the array `graphConnections` will be a list of nodes connected to that index node.
    // Using `Array.from` for a more modern array initialization.
    const graphConnections = Array.from({ length: totalNodes }, () => []);

    // Iterate through the remaining lines to parse edge definitions and build the adjacency list.
    // Start from `lineIndex = 1` to skip the `totalNodes` definition line.
    for (let lineIndex = 1; lineIndex < rawDataLines.length; ++lineIndex) {
        // Split each line by space and parse the two node identifiers (u, v) for the edge.
        const edgeNodeIdentifiers = rawDataLines[lineIndex].split(' ').map(s => Number.parseInt(s, 10));

        // Basic validation for edge format, though competitive programming inputs are usually guaranteed valid.
        if (edgeNodeIdentifiers.length !== 2) {
            // console.warn(`Skipping malformed edge line: ${rawDataLines[lineIndex]}`);
            continue;
        }

        // Adjust node identifiers to be 0-indexed (original input is 1-indexed).
        const primaryNode = edgeNodeIdentifiers[0] - 1;
        const secondaryNode = edgeNodeIdentifiers[1] - 1;

        // Since the graph is undirected, add connections in both directions.
        graphConnections[primaryNode].push(secondaryNode);
        graphConnections[secondaryNode].push(primaryNode);
    }

    /**
     * Computes the shortest path distances from a specified starting node to all other nodes
     * in an unweighted graph using Breadth-First Search (BFS).
     * @param {number} initialNode - The 0-indexed identifier of the starting node.
     * @param {number} totalGraphNodes - The total number of nodes in the graph.
     * @param {Array<Array<number>>} adjList - The adjacency list representation of the graph.
     * @returns {Array<number>} An array where `resultDistances[i]` is the shortest distance
     *                           from `initialNode` to node `i`. Returns `Infinity` for unreachable nodes.
     */
    const computeUnweightedShortestPaths = (initialNode, totalGraphNodes, adjList) => {
        // Initialize an array to store distances, all set to Infinity (unvisited).
        const resultDistances = new Array(totalGraphNodes).fill(Infinity);
        // The distance from the starting node to itself is 0.
        resultDistances[initialNode] = 0;

        // Initialize a queue for BFS traversal, starting with the initial node.
        const bfsTraversalQueue = [initialNode];
        let queueReadPointer = 0; // Use a pointer for efficient queue processing (simulates shift/dequeue).

        // Continue BFS as long as there are nodes in the queue to process.
        while (queueReadPointer < bfsTraversalQueue.length) {
            // Dequeue the current node to visit.
            const currentVertex = bfsTraversalQueue[queueReadPointer++];

            // Get all neighbors of the current vertex. Use `|| []` to handle potential isolated nodes
            // that might not have an entry in the adjacency list if the graph is sparse or malformed.
            const adjacentVertices = adjList[currentVertex] || [];

            // Iterate through each neighbor of the current vertex.
            for (const neighborVertex of adjacentVertices) {
                // If the neighbor has not been visited yet (its distance is still Infinity).
                if (resultDistances[neighborVertex] === Infinity) {
                    // Update the neighbor's distance (one more than the current vertex's distance).
                    resultDistances[neighborVertex] = resultDistances[currentVertex] + 1;
                    // Enqueue the neighbor to visit its neighbors later.
                    bfsTraversalQueue.push(neighborVertex);
                }
            }
        }
        return resultDistances;
    };

    // Define the two special nodes for the game: Fennec starts at 0, Snuke starts at totalNodes - 1.
    const fennecStartingPoint = 0;
    const snukeStartingPoint = totalNodes - 1;

    // Calculate shortest paths from Fennec's starting point to all other nodes.
    const distancesFromFennec = computeUnweightedShortestPaths(fennecStartingPoint, totalNodes, graphConnections);
    // Calculate shortest paths from Snuke's starting point to all other nodes.
    const distancesFromSnuke = computeUnweightedShortestPaths(snukeStartingPoint, totalNodes, graphConnections);

    // Count how many "intermediate" nodes (excluding start and end) Fennec can reach in an equal or shorter path than Snuke.
    let fennecDominantNodeCount = 0;

    // Generate an array of all node indices, then filter out the start and end nodes.
    // Use `reduce` to count nodes where Fennec has an advantage.
    const gameIntermediateNodeIndices = Array.from({ length: totalNodes }, (_, index) => index)
                                            .filter(nodeId => nodeId !== fennecStartingPoint && nodeId !== snukeStartingPoint);

    fennecDominantNodeCount = gameIntermediateNodeIndices.reduce((countAccumulator, currentNodeIdentifier) => {
        // Ensure both distances are valid (not Infinity), though BFS on connected components should guarantee this.
        if (distancesFromFennec[currentNodeIdentifier] !== Infinity && distancesFromSnuke[currentNodeIdentifier] !== Infinity) {
            // If Fennec's path to this node is shorter or equal to Snuke's.
            if (distancesFromFennec[currentNodeIdentifier] <= distancesFromSnuke[currentNodeIdentifier]) {
                return countAccumulator + 1;
            }
        }
        return countAccumulator;
    }, 0); // Start accumulator at 0.

    // Determine the winner based on the number of dominant nodes.
    let declaredGameWinner = "Fennec"; // Default winner if no specific condition met.

    // The total number of intermediate nodes (excluding Fennec's and Snuke's starting nodes).
    const totalIntermediateGameNodes = totalNodes - 2;
    // The number of intermediate nodes where Snuke has an equal or shorter path.
    const snukeDominantNodeCount = totalIntermediateGameNodes - fennecDominantNodeCount;

    // If Fennec's dominant nodes are less than or equal to Snuke's dominant nodes, Snuke wins.
    // This implies that if Fennec has strictly more dominant nodes, Fennec wins.
    if (fennecDominantNodeCount <= snukeDominantNodeCount) {
        declaredGameWinner = "Snuke";
    }

    // Output the name of the declared winner.
    console.log(declaredGameWinner);
};

// Standard input handling for competitive programming environments.
// Reads the entire content of stdin as a UTF-8 string.
const inputContent = require("fs").readFileSync("/dev/stdin", "utf8");
// Invoke the main processing function with the obtained input.
processGameInput(inputContent);