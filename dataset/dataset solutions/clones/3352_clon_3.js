'use strict'

// A large prime number used for modulo operations to prevent integer overflow
// during calculations, ensuring results stay within a manageable range.
const CALCULATION_MODULUS = 1_000_000_000 + 7;

/**
 * Performs a Depth-First Search (DFS) on the graph to compute specific
 * values for each subtree. This function is typically used in tree-DP
 * (dynamic programming on trees) problems.
 *
 * The returned array 'accumulatedValues' contains two elements:
 * - accumulatedValues[0]: Represents a product of sums of child results (e.g., when the current node is not selected).
 * - accumulatedValues[1]: Represents a product of child results (e.g., when the current node is selected, children cannot be selected).
 *
 * @param {number} currentVertexId The identifier of the current vertex being processed.
 * @param {Array<Array<number>>} connectivityMap An adjacency list representing the graph.
 * @param {Array<boolean>} visitedStatus An array indicating whether a vertex has been visited.
 * @returns {Array<number>} An array containing two computed values for the subtree rooted at currentVertexId.
 */
function computeTreeValues(currentVertexId, connectivityMap, visitedStatus) {
    // Initialize the accumulators for the current subtree.
    // Base case: for a leaf node, these values are typically [1, 1].
    let accumulatedValues = [1, 1];

    // Retrieve the list of neighbors for the current vertex.
    const neighborsOfCurrent = connectivityMap[currentVertexId];
    const numberOfNeighbors = neighborsOfCurrent.length;

    // Iterate through all neighbors of the current vertex.
    for (let neighborIdx = 0; neighborIdx < numberOfNeighbors; ++neighborIdx) {
        const adjacentNode = neighborsOfCurrent[neighborIdx];

        // If the neighbor has not been visited yet, explore it.
        if (!visitedStatus[adjacentNode]) {
            // Mark the neighbor as visited before the recursive call.
            visitedStatus[adjacentNode] = true;

            // Recursively call DFS for the neighbor to get its subtree values.
            const childSubtreeResults = computeTreeValues(adjacentNode, connectivityMap, visitedStatus);

            // Update the accumulators based on the child's results.
            // This logic is specific to the problem being solved (e.g., independent set counting).
            let tempVal0 = (accumulatedValues[0] * (childSubtreeResults[0] + childSubtreeResults[1])) % CALCULATION_MODULUS;
            let tempVal1 = (accumulatedValues[1] * childSubtreeResults[0]) % CALCULATION_MODULUS;

            accumulatedValues[0] = tempVal0;
            accumulatedValues[1] = tempVal1;
        }
    }
    // Return the calculated values for the current subtree.
    return accumulatedValues;
}

/**
 * Constructs an adjacency list representation of an undirected graph
 * from a given number of nodes and a list of edges.
 *
 * @param {number} totalNodes The total number of nodes in the graph (1-indexed).
 * @param {Array<Array<number>>} edgeDescriptions An array of arrays, where each inner array
 *                                                 [u, v] represents an edge between node u and node v.
 * @returns {Array<Array<number>>} The adjacency list, where list[i] contains all neighbors of node i.
 */
function buildAdjacencyStructure(totalNodes, edgeDescriptions) {
    // Input validation: Ensure valid node count.
    if (totalNodes <= 0) {
        console.warn("Warning: totalNodes is non-positive. Returning empty adjacency structure.");
        return Array.from({ length: 1 }, () => []); // Return a minimal valid structure
    }

    // Initialize the adjacency list for N+1 nodes (assuming 1-indexed nodes).
    // Using Array.from with a callback is a modern and clear way to create arrays of arrays.
    const neighborLists = Array.from({ length: totalNodes + 1 }, () => []);

    // If there are no edges, return the initialized empty adjacency list.
    if (!edgeDescriptions || edgeDescriptions.length === 0) {
        return neighborLists;
    }

    // Iterate through each edge to populate the adjacency list.
    for (const currentEdge of edgeDescriptions) {
        // Basic validation for edge format.
        if (!Array.isArray(currentEdge) || currentEdge.length !== 2) {
            console.error("Invalid edge format encountered:", currentEdge);
            continue; // Skip malformed edges
        }
        const startVertex = currentEdge[0];
        const endVertex = currentEdge[1];

        // Add connections for an undirected graph.
        // Also, add basic bounds checking for robustness.
        if (startVertex >= 1 && startVertex <= totalNodes &&
            endVertex >= 1 && endVertex <= totalNodes) {
            neighborLists[startVertex].push(endVertex);
            neighborLists[endVertex].push(startVertex);
        } else {
            console.warn(`Edge (${startVertex}, ${endVertex}) contains out-of-bounds vertex for N=${totalNodes}. Skipping.`);
        }
    }
    return neighborLists;
}

/**
 * Main function to solve the graph problem. It constructs the graph,
 * performs a DFS traversal, and computes the final answer based on the
 * results of the traversal.
 *
 * This particular problem often relates to counting independent sets or
 * similar combinatorial problems on trees/graphs where a node can either
 * be selected or not selected, with constraints on adjacent nodes.
 *
 * @param {number} numVertices The total number of vertices in the graph.
 * @param {Array<Array<number>>} inputEdges An array of edges connecting the vertices.
 * @returns {number} The final calculated result modulo CALCULATION_MODULUS.
 */
function determineFinalOutput(numVertices, inputEdges) {
    // Early exit for trivial cases or invalid input.
    if (numVertices <= 0) {
        return 0; // No vertices, no solution.
    }
    if (numVertices === 1) {
        return 2; // For a single node, it can either be selected or not selected (2 ways).
    }

    // Build the graph's adjacency list.
    const graphConnections = buildAdjacencyStructure(numVertices, inputEdges);

    // Initialize the visited status array.
    // Using a boolean array initialized to false is clearer.
    const seenVerticesTracker = new Array(numVertices + 1).fill(false);

    // The problem typically starts DFS from node 1 (assuming 1-indexed nodes).
    const startingNode = 1;

    // Mark the starting node as visited before the initial DFS call.
    seenVerticesTracker[startingNode] = true;

    // Perform the DFS traversal.
    const finalTreeResults = computeTreeValues(startingNode, graphConnections, seenVerticesTracker);

    // The final answer is usually the sum of the two values returned by DFS
    // for the root of the entire graph, modulo the constant.
    // This represents the total ways considering both cases: root selected and root not selected.
    const overallOutcome = (finalTreeResults[0] + finalTreeResults[1]) % CALCULATION_MODULUS;

    // Add a check to ensure all nodes were visited if it's expected to be a connected graph.
    // This is an additional validation fragment.
    for (let v = 1; v <= numVertices; v++) {
        if (!seenVerticesTracker[v]) {
            console.warn(`Warning: Node ${v} was not visited during DFS. Graph might be disconnected.`);
            // Depending on the problem, this might require running DFS multiple times
            // for each connected component and combining results. For this specific
            // problem structure, it's usually assumed to be a tree or connected graph.
        }
    }

    return overallOutcome;
}

/**
 * Entry point of the program. Reads input, parses it, calls the solver,
 * and prints the result.
 *
 * @param {string} programInput The raw input string from stdin.
 */
function executeProgram(programInput) {
    // Split the input string into individual lines.
    const inputLines = programInput.trim().split("\n");

    // Validate inputLines structure.
    if (inputLines.length === 0) {
        console.error("Error: Empty input received.");
        return;
    }

    // Parse the number of vertices from the first line.
    const numberOfVertices = parseInt(inputLines[0], 10);
    if (isNaN(numberOfVertices) || numberOfVertices < 0) {
        console.error("Error: Invalid number of vertices in input.");
        return;
    }

    // Parse the edges from the subsequent lines.
    // Using a separate loop for more explicit error handling and readability.
    const edgeDescriptors = [];
    for (let lineIndex = 1; lineIndex < inputLines.length; ++lineIndex) {
        const currentEdgeString = inputLines[lineIndex].trim();
        if (!currentEdgeString) continue; // Skip empty lines

        const edgeParts = currentEdgeString.split(' ').map(s => parseInt(s.trim(), 10));
        if (edgeParts.length !== 2 || isNaN(edgeParts[0]) || isNaN(edgeParts[1])) {
            console.warn(`Warning: Malformed edge line skipped: "${currentEdgeString}"`);
            continue;
        }
        edgeDescriptors.push(edgeParts);
    }

    // Call the main problem solver function.
    const finalAnswer = determineFinalOutput(numberOfVertices, edgeDescriptors);

    // Output the computed result.
    console.log(finalAnswer);
}

// Execute the program by reading input from stdin.
// This part remains largely unchanged as it's an external dependency setup.
// Added a try-catch block for robust file reading.
try {
    const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
    executeProgram(fileContent);
} catch (error) {
    console.error("Failed to read input from /dev/stdin:", error.message);
    process.exit(1); // Exit with an error code
}