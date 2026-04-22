process.stdin.resume();
process.stdin.setEncoding('utf8');

// Buffer to accumulate all incoming standard input data.
let collectedInputBuffer = '';

// Event listener for 'data' chunks from stdin.
// Appends each received data chunk to the buffer.
process.stdin.on('data', function (dataChunk) {
    collectedInputBuffer += dataChunk;
});

/**
 * Parses a string line containing space-separated numbers into an array of numbers.
 * It trims leading/trailing whitespace and converts each segment to a numeric type.
 * @param {string} inputLineText The string line to parse.
 * @returns {number[]} An array of numbers parsed from the input line. Returns an empty array if the line is empty.
 */
const parseNumericArrayFromLine = function (inputLineText) {
    // If the input line is empty or just whitespace, return an empty array.
    if (!inputLineText || inputLineText.trim() === '') {
        return [];
    }
    // Trim whitespace, split by spaces, and convert each part to a number.
    const parsedValues = inputLineText.trim().split(' ').map(Number);
    return parsedValues;
};

// Constant representing the minimum number of nodes required for a simple cycle (e.g., a triangle).
const MINIMUM_CYCLE_LENGTH = 3;

// Event listener for 'end' of standard input.
// This is where the main graph processing logic resides.
process.stdin.on('end', function () {
    // Split the entire collected input buffer into individual lines.
    const inputLines = collectedInputBuffer.split('\n');

    // Parse the first line to get the total number of nodes (N) and edges (M).
    // The first line is expected to be in the format "N M".
    const graphMetadata = parseNumericArrayFromLine(inputLines[0]);
    const totalNodes = graphMetadata[0];
    const totalEdges = graphMetadata[1];

    // Early exit: If the total number of nodes is less than the minimum required for a cycle,
    // then no cycles can exist. All edges are considered non-cyclic.
    if (totalNodes < MINIMUM_CYCLE_LENGTH) {
        console.log(totalEdges);
        return;
    }

    // Extract and parse the subsequent lines as initial edge pairs.
    // Each line represents an undirected edge (u, v).
    // Using slice(1, 1 + totalEdges) ensures we only process the actual edge lines.
    let initialEdgeList = inputLines.slice(1, 1 + totalEdges).map(currentLineText => parseNumericArrayFromLine(currentLineText));

    // Initialize an adjacency list for the graph.
    // Each index 'i' in `nodeAdjacencies` will store an array of nodes directly connected to node 'i'.
    // We create an array of `totalNodes` empty arrays, assuming 0-based indexing for nodes internally.
    const nodeAdjacencies = Array.from({ length: totalNodes }, () => []);

    // Populate the adjacency list using the initial edge pairs.
    // Node IDs from input are 1-indexed, so we decrement them to be 0-indexed.
    for (const edgePair of initialEdgeList) {
        const nodeU = edgePair[0] - 1; // Convert 1-indexed to 0-indexed
        const nodeV = edgePair[1] - 1; // Convert 1-indexed to 0-indexed

        // Add bidirectional connections for an undirected graph.
        nodeAdjacencies[nodeU].push(nodeV);
        nodeAdjacencies[nodeV].push(nodeU);
    }

    // Array to store all detected simple cycles in the graph.
    let detectedCycles = [];

    // Iterate through each node in the graph, using it as a potential starting point for cycle detection.
    for (let startNodeId = 0; startNodeId < totalNodes; ++startNodeId) {
        // Initialize paths for the current BFS-like traversal.
        // Each path starts from `startNodeId` and extends to one of its direct neighbors.
        let pathsToExplore = nodeAdjacencies[startNodeId].map(neighbor => [startNodeId, neighbor]);

        // A set to keep track of nodes visited in the *current search context* starting from `startNodeId`.
        // This helps in avoiding redundant path explorations and ensuring simple paths.
        // It's reset for each new `startNodeId`.
        let visitedNodesInCurrentPathSearch = new Set();
        visitedNodesInCurrentPathSearch.add(startNodeId); // The starting node is immediately marked as visited.

        // Perform a breadth-first search (BFS) style traversal to find cycles.
        while (pathsToExplore.length > 0) {
            let nextIterationPaths = []; // Buffer for paths to explore in the next BFS level.

            for (const currentPathSegment of pathsToExplore) {
                const lastNodeInSegment = currentPathSegment[currentPathSegment.length - 1];
                // Get the node before the last one to prevent immediate backtracking (e.g., A-B-A).
                const penultimateNode = currentPathSegment.length >= 2 ? currentPathSegment[currentPathSegment.length - 2] : -1;

                // Determine valid next nodes for extending the `currentPathSegment`.
                const validNextNodes = nodeAdjacencies[lastNodeInSegment].filter(candidateNextNode => {
                    const avoidsImmediateBacktracking = candidateNextNode !== penultimateNode;
                    const notAlreadyInCurrentPath = !currentPathSegment.includes(candidateNextNode); // Ensures simple paths
                    // Allows revisiting the `startNodeId` to close a cycle, but otherwise avoids already visited nodes.
                    const notVisitedYetOrIsStartingNode = !visitedNodesInCurrentPathSearch.has(candidateNextNode) || candidateNextNode === startNodeId;
                    return avoidsImmediateBacktracking && notAlreadyInCurrentPath && notVisitedYetOrIsStartingNode;
                });

                // Extend the current paths with found valid next nodes.
                for (const candidateNextNode of validNextNodes) {
                    // Create a new path by extending the current one.
                    const extendedPathCandidate = [...currentPathSegment, candidateNextNode];

                    if (candidateNextNode === startNodeId) {
                        // A cycle is detected: the path has returned to its starting node.
                        detectedCycles.push(extendedPathCandidate);
                    } else {
                        // The path continues: add it to the list for the next BFS iteration.
                        nextIterationPaths.push(extendedPathCandidate);
                        // Mark this new node as visited within the current search context.
                        visitedNodesInCurrentPathSearch.add(candidateNextNode);
                    }
                }
            }
            pathsToExplore = nextIterationPaths; // Proceed to the next level of path exploration.
        }
    }

    // Filter out detected cycles that are too short (e.g., length 2 or less, which are not simple cycles).
    // A simple cycle must have at least `MINIMUM_CYCLE_LENGTH` distinct nodes.
    // The path array includes the start node twice (e.g., [A, B, C, A]), so its length must be > `MINIMUM_CYCLE_LENGTH`.
    detectedCycles = detectedCycles.filter(cyclePath => cyclePath.length > MINIMUM_CYCLE_LENGTH);

    // --- Optimized Edge Removal Strategy ---
    // Create a Set to efficiently store canonical representations of all edges that are part of a detected cycle.
    const edgesToRemoveSet = new Set();
    // Helper function to create a unique, canonical string key for an undirected edge (u, v).
    const getCanonicalEdgeKey = (u, v) => `${Math.min(u, v)}-${Math.max(u, v)}`;

    // Iterate through each detected cycle to identify all its constituent edges.
    for (const cyclePath of detectedCycles) {
        // Iterate through nodes in the cycle path, forming edges.
        // The loop goes up to `cyclePath.length - 1` because `cyclePath` is like `[n1, n2, ..., nk, n1]`.
        // The last edge is `(nk, n1)`, which is `(cyclePath[length-2], cyclePath[length-1])`.
        for (let j = 0; j < cyclePath.length - 1; ++j) {
            const nodeA = cyclePath[j];
            const nodeB = cyclePath[j + 1];
            // Add the canonical representation of this edge to the set.
            edgesToRemoveSet.add(getCanonicalEdgeKey(nodeA, nodeB));
        }
    }

    // Filter the original list of edges, keeping only those that are NOT part of any detected simple cycle.
    const remainingEdgesAfterCycleRemoval = initialEdgeList.filter(originalEdge => {
        // Convert the original edge (which was 1-indexed from input) to its 0-indexed canonical key
        // and check if it exists in the set of edges to be removed.
        return !edgesToRemoveSet.has(getCanonicalEdgeKey(originalEdge[0] - 1, originalEdge[1] - 1));
    });

    // Output the count of edges that remain after removing all edges forming part of a simple cycle.
    console.log(remainingEdgesAfterCycleRemoval.length);
});