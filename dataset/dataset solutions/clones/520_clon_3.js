let collectedDataBuffer = ''; // Buffer to accumulate all incoming standard input.

// Ensure the standard input stream is active and ready to receive data.
process.stdin.resume();

// Set the character encoding for the input stream to UTF-8.
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks.
process.stdin.on('data', (dataSegment) => {
    collectedDataBuffer += dataSegment; // Append the new data to the buffer.
});

// Event listener for the end of the input stream.
process.stdin.on('end', () => {
    // Once all input is received, split it by newlines and pass to the primary processing function.
    // Filter out any empty lines that might result from trailing newlines.
    const parsedInputLines = collectedDataBuffer.split('\n').filter(line => line.trim() !== '');
    if (parsedInputLines.length > 0) {
        processGameScenarios(parsedInputLines);
    } else {
        console.error("No input data provided for processing.");
    }
});

/**
 * Processes multiple game scenarios from the provided input lines.
 * Each scenario defines a game board and maximum jump capabilities.
 * @param {string[]} scenarioLines - An array of strings, each representing a line of input.
 */
function processGameScenarios(scenarioLines) {
    let currentScenarioIndex = 0; // For potential debugging or scenario tracking
    while (true) {
        // Read the maximum allowed jump distance for the current scenario.
        // Convert to number explicitly; `parseInt` is safer than `- 0`.
        const maxJumpDistanceStr = scenarioLines.shift();
        if (maxJumpDistanceStr === undefined || maxJumpDistanceStr.trim() === '') {
            // No more lines or empty line, indicating end of scenarios or malformed input
            break;
        }
        const currentMaxJump = parseInt(maxJumpDistanceStr, 10);

        // A maximum jump distance of 0 signals the end of input for the problem.
        if (isNaN(currentMaxJump) || currentMaxJump === 0) {
            break;
        }

        // Read the number of intermediate nodes (excluding start and end)
        const numIntermediateNodesStr = scenarioLines.shift();
        if (numIntermediateNodesStr === undefined || numIntermediateNodesStr.trim() === '') {
            console.error(`Error: Expected number of intermediate nodes for scenario ${currentScenarioIndex + 1}, but got empty or undefined.`);
            break; // Malformed input
        }
        const numNodes = parseInt(numIntermediateNodesStr, 10);

        if (isNaN(numNodes) || numNodes < 0) {
             console.error(`Error: Invalid number of intermediate nodes (${numNodes}) for scenario ${currentScenarioIndex + 1}.`);
             break;
        }

        // Initialize an array to store node shift values.
        // The array will effectively represent nodes from 0 to numNodes + 1.
        // Node 0 is the start, numNodes + 1 is the end.
        const nodeShiftValues = new Array(numNodes + 2).fill(0); // Pre-fill with 0s

        // Populate shift values for intermediate nodes (1 to numNodes).
        for (let nodeIdx = 1; nodeIdx <= numNodes; nodeIdx++) {
            const shiftValueStr = scenarioLines.shift();
            if (shiftValueStr === undefined || shiftValueStr.trim() === '') {
                console.error(`Error: Expected shift value for node ${nodeIdx} in scenario ${currentScenarioIndex + 1}, but got empty or undefined.`);
                // This is a critical error, might want to throw or exit. For now, return.
                return;
            }
            const shiftVal = parseInt(shiftValueStr, 10);
            if (isNaN(shiftVal)) {
                 console.error(`Error: Invalid shift value (${shiftValueStr}) for node ${nodeIdx} in scenario ${currentScenarioIndex + 1}.`);
                 return;
            }
            nodeShiftValues[nodeIdx] = shiftVal;
        }

        // Determine if the current scenario is "OK" or "NG" using the solver.
        const scenarioOutcome = determineReachability(currentMaxJump, numNodes, nodeShiftValues);
        console.log(scenarioOutcome ? 'OK' : 'NG');
        currentScenarioIndex++;
    }
}

/**
 * Creates and initializes an adjacency matrix for a graph with a given number of vertices.
 * Self-loops have a weight of 0, and all other edges are initially set to Infinity (unreachable).
 * @param {number} vertexCount - The total number of vertices in the graph.
 * @returns {number[][]} An initialized adjacency matrix.
 */
function initializeAdjacencyMatrix(vertexCount) {
    if (vertexCount <= 0) {
        // For this problem, vertexCount is always >= 2 (n+2, where n >= 0).
        // Returning an empty array for invalid input, though it shouldn't happen with valid problem constraints.
        return [];
    }

    // Use Array.from for a more modern way to create 2D arrays.
    const adjacencyMatrix = Array.from({ length: vertexCount }, (_, rowIdx) =>
        Array.from({ length: vertexCount }, (_, colIdx) =>
            rowIdx === colIdx ? 0 : Number.POSITIVE_INFINITY // Use Number.POSITIVE_INFINITY explicitly
        )
    );
    return adjacencyMatrix;
}

/**
 * Computes all-pairs shortest paths in a graph using the Warshall-Floyd algorithm.
 * Modifies the input adjacency matrix in-place to store shortest path distances.
 * @param {number[][]} distanceMatrix - The adjacency matrix where distanceMatrix[i][j] is the weight of the edge from i to j.
 * @returns {number[][]} The updated distance matrix with all-pairs shortest path distances.
 */
function computeAllPairsShortestPaths(distanceMatrix) {
    // Basic validation: ensure it's a square matrix.
    if (!distanceMatrix || distanceMatrix.length === 0 || distanceMatrix[0].length !== distanceMatrix.length) {
        console.warn("Warning: Invalid or empty distance matrix provided to computeAllPairsShortestPaths.");
        return distanceMatrix; // Or throw an error depending on desired error handling.
    }

    const nodeCount = distanceMatrix.length; // Number of vertices in the graph.

    // Iterate through all possible intermediate nodes (k).
    for (let intermediate = 0; intermediate < nodeCount; intermediate++) {
        // Iterate through all possible source nodes (i).
        for (let source = 0; source < nodeCount; source++) {
            // Iterate through all possible destination nodes (j).
            for (let destination = 0; destination < nodeCount; destination++) {
                // Check for potential overflow before addition if values can be extremely large,
                // but for pathfinding, `Infinity + x` is still `Infinity`.
                const distSourceToIntermediate = distanceMatrix[source][intermediate];
                const distIntermediateToDestination = distanceMatrix[intermediate][destination];

                // If either segment is unreachable, the path via intermediate is unreachable.
                if (distSourceToIntermediate === Number.POSITIVE_INFINITY || distIntermediateToDestination === Number.POSITIVE_INFINITY) {
                    continue; // Skip, as Infinity + x is Infinity, which won't be shorter.
                }

                // Calculate the path distance from source to destination via intermediate.
                const pathViaIntermediate = distSourceToIntermediate + distIntermediateToDestination;

                // If the path via 'intermediate' is shorter than the currently known path, update it.
                // Using Math.min is a common and clear way to express this.
                distanceMatrix[source][destination] = Math.min(
                    distanceMatrix[source][destination],
                    pathViaIntermediate
                );
            }
        }
    }
    return distanceMatrix;
}


/**
 * Determines if it's possible to navigate the game board such that all reachable nodes
 * can eventually lead to the final destination.
 * @param {number} maxStepSize - The maximum number of steps that can be taken in a single move.
 * @param {number} totalIntermediateNodes - The number of intermediate nodes between start (0) and end (N+1).
 * @param {number[]} nodeDisplacementValues - An array containing displacement values for each node.
 * @returns {boolean} True if all reachable paths can lead to the end node, false otherwise.
 */
function determineReachability(maxStepSize, totalIntermediateNodes, nodeDisplacementValues) {
    // Define the total number of vertices in the graph, including start (0) and end (N+1).
    const graphVertexCount = totalIntermediateNodes + 2;
    const finalDestinationNode = totalIntermediateNodes + 1;
    const startNode = 0;

    // Initialize the adjacency matrix for the graph.
    let pathGraph = initializeAdjacencyMatrix(graphVertexCount);

    // Populate the graph with possible moves based on maxStepSize and nodeDisplacementValues.
    // Iterate through all possible current nodes, from start (0) up to the last intermediate node (N).
    for (let currentNode = startNode; currentNode <= totalIntermediateNodes; currentNode++) {
        // Iterate through all possible jump increments, from 1 up to maxStepSize.
        for (let stepIncrement = 1; stepIncrement <= maxStepSize; stepIncrement++) {
            // Calculate the base target node index without displacement.
            const potentialBaseTarget = currentNode + stepIncrement;

            let displacementEffect = 0;
            // Check if the potential base target is within the bounds of displacement values.
            // If it's the final destination (totalIntermediateNodes + 1), its displacement is effectively 0.
            if (potentialBaseTarget >= startNode && potentialBaseTarget <= totalIntermediateNodes) {
                displacementEffect = nodeDisplacementValues[potentialBaseTarget];
            }

            // Calculate the final target node index after displacement.
            let actualTargetNodeIndex = potentialBaseTarget + displacementEffect;

            // Clamp the target node index to be within the valid range [startNode, finalDestinationNode].
            // This prevents going out of bounds and ensures moves are within the game board.
            actualTargetNodeIndex = Math.max(startNode, actualTargetNodeIndex);
            actualTargetNodeIndex = Math.min(finalDestinationNode, actualTargetNodeIndex);

            // Add an edge to the graph if the move actually changes the current node.
            // The weight is 1, indicating a single step.
            if (actualTargetNodeIndex !== currentNode) {
                pathGraph[currentNode][actualTargetNodeIndex] = 1;
            }
        }
    }

    // Compute all-pairs shortest paths using the Warshall-Floyd algorithm
    // to find the minimum number of moves between any two nodes.
    computeAllPairsShortestPaths(pathGraph);

    // Check reachability condition:
    // Every node that is reachable from the starting node (0) must also be able to reach the final destination node (N+1).
    // If we find any node 'k' such that it's reachable from '0' but 'N+1' is NOT reachable from 'k',
    // then it means there's a path that gets stuck, and the scenario fails.
    const unreachableSentinel = Number.POSITIVE_INFINITY;
    for (let checkNode = startNode; checkNode <= totalIntermediateNodes; checkNode++) {
        const isReachableFromStart = pathGraph[startNode][checkNode] < unreachableSentinel;
        const canReachEndFromHere = pathGraph[checkNode][finalDestinationNode] < unreachableSentinel;

        if (isReachableFromStart && !canReachEndFromHere) {
            // Found a reachable node that cannot lead to the end.
            return false;
        }
    }

    // If the loop completes, all reachable nodes can eventually reach the final destination.
    return true;
}