/**
 * This module processes graph data to determine properties related to graph partitioning
 * and calculates a specific value based on its structure. It identifies if a graph
 * can be partitioned into a disjoint union of cliques, and if so, finds the optimal
 * partitioning to maximize the total number of edges.
 */

/**
 * Calculates the number of edges in a complete graph (clique) of a given size.
 * This is equivalent to "n choose 2" or C(n, 2).
 *
 * @param {number} vertexCount - The number of vertices in the clique.
 * @returns {number} The total number of possible edges within that clique.
 */
const calculateCliqueEdges = (vertexCount) => {
    // A clique with 0 or 1 vertices has no internal edges.
    if (vertexCount <= 1) {
        return 0;
    }
    // The formula for combinations C(n, 2) is n * (n - 1) / 2.
    return (vertexCount * (vertexCount - 1)) / 2;
};

/**
 * Main function to process the input graph string and compute the result.
 * It reads graph details, constructs a complement graph, attempts to 2-color
 * its connected components, and then uses dynamic programming to find an
 * optimal partitioning.
 *
 * @param {string} rawInputString - The entire input as a single string,
 *                                  where lines are separated by newlines.
 */
function ProcessGraphData(rawInputString) {
    // Split the input string into an array of individual lines.
    const inputLines = rawInputString.split("\n");

    // Parse the first line which contains the total number of nodes and edges.
    // Ensure robust parsing by trimming whitespace and specifying radix 10.
    const graphDimensionData = inputLines[0].split(" ").map(val => parseInt(val.trim(), 10));
    const totalNodeCount = graphDimensionData[0];
    const totalEdgeCount = graphDimensionData[1];

    // Handle edge cases for graphs with very few nodes.
    if (totalNodeCount <= 1) {
        // A graph with 0 or 1 node has 0 edges.
        console.log(0);
        return;
    }

    // Initialize the complement adjacency matrix.
    // `complementAdjacencyMatrix[u][v] = 1` signifies that there is NO edge
    // between node `u` and node `v` in the ORIGINAL graph.
    // Initially, assume all pairs of distinct nodes are missing an edge (value 1),
    // and then set to 0 for actual edges present in the input.
    const complementAdjacencyMatrix = Array.from({ length: totalNodeCount }, () =>
        new Array(totalNodeCount).fill(1) // All nodes initially considered "not connected"
    );

    // Nodes are 0-indexed. Self-loops are typically not considered in simple graphs.
    for (let rowIdx = 0; rowIdx < totalNodeCount; rowIdx++) {
        complementAdjacencyMatrix[rowIdx][rowIdx] = 0; // A node is not "missing" an edge to itself.
    }

    // Process each edge from the input.
    // For each provided edge (u, v), it means there IS an edge in the original graph.
    // Therefore, in the complement adjacency matrix, `complementAdjacencyMatrix[u][v]`
    // and `complementAdjacencyMatrix[v][u]` should be set to 0 (not a missing edge).
    for (let currentEdgeIdx = 0; currentEdgeIdx < totalEdgeCount; currentEdgeIdx++) {
        // Parse node indices for the current edge, converting to 0-based indexing.
        const edgeNodes = inputLines[currentEdgeIdx + 1].split(" ").map(val => parseInt(val.trim(), 10) - 1);
        const nodeA = edgeNodes[0];
        const nodeB = edgeNodes[1];

        // Basic validation for node indices to prevent out-of-bounds access.
        if (nodeA < 0 || nodeA >= totalNodeCount || nodeB < 0 || nodeB >= totalNodeCount) {
            // Log an error and skip this invalid edge.
            console.error(`Warning: Invalid node index (${nodeA + 1}, ${nodeB + 1}) encountered for graph size ${totalNodeCount}. Skipping edge.`);
            continue;
        }

        // Mark this pair as having an edge in the original graph (i.e., not a missing edge).
        complementAdjacencyMatrix[nodeA][nodeB] = 0;
        complementAdjacencyMatrix[nodeB][nodeA] = 0;
    }

    // `nodeVisitedStatus` array to keep track of nodes already processed
    // during the component traversal of the complement graph.
    // Initialized to all `false` (meaning unvisited).
    const nodeVisitedStatus = new Array(totalNodeCount).fill(false);

    // `currentCompSerialNumber` tracks the number of connected components found
    // in the complement graph.
    let currentCompSerialNumber = 0;

    // `componentPartitionSetA` and `componentPartitionSetB` store the sizes
    // of the two partitions (sets) for each connected component of the complement graph.
    // These correspond to the `x` and `y` arrays in the original code.
    const componentPartitionSetA = [];
    const componentPartitionSetB = [];

    /**
     * Performs a modified 2-coloring (bipartite check) traversal on a connected
     * component of the complement graph. It also enforces a specific structural
     * condition for the original graph to be a disjoint union of cliques.
     *
     * @param {number[]} nodesToExplore - A list of nodes currently in the frontier to be processed.
     * @param {number} assignedColor - The color (0 or 1) to assign to nodes in `nodesToExplore`.
     * @returns {boolean} True if a structural violation is detected (e.g., complement graph not bipartite
     *                    or original graph not a disjoint union of cliques), false otherwise.
     */
    const exploreComponentPartitions = (nodesToExplore, assignedColor) => {
        // Base case: If there are no nodes left in the frontier, the traversal for this branch is complete.
        if (nodesToExplore.length === 0) {
            return false;
        }

        const nextExplorationFrontier = []; // Nodes to be visited in the next step with the opposite color.
        const unvisitedInCurrentFrontier = []; // Nodes from `nodesToExplore` that haven't been globally visited yet.

        for (const currentNode of nodesToExplore) {
            // If the current node has already been visited (either in a prior step
            // of this component, or from a different component), skip it.
            if (nodeVisitedStatus[currentNode]) {
                continue;
            }
            // Add to the list of unvisited nodes in this frontier for the clique check.
            unvisitedInCurrentFrontier.push(currentNode);
        }

        // Crucial structural check: All *unvisited* nodes within the current frontier
        // (which are all assigned the same `assignedColor`) must form a clique in the ORIGINAL graph.
        // This means there should be NO missing edges (i.e., `complementAdjacencyMatrix` must be 0)
        // between any pair of them. If a missing edge is found, it's a structural violation.
        for (let i = 0; i < unvisitedInCurrentFrontier.length; i++) {
            const node1 = unvisitedInCurrentFrontier[i];
            for (let j = i + 1; j < unvisitedInCurrentFrontier.length; j++) {
                const node2 = unvisitedInCurrentFrontier[j];
                // If `complementAdjacencyMatrix[node1][node2]` is 1, it implies there's NO edge
                // between `node1` and `node2` in the original graph.
                // But since they are both in the same partition (same `assignedColor`), they *must*
                // be connected to form a clique. Hence, this is an error.
                if (complementAdjacencyMatrix[node1][node2] === 1) {
                    return true; // Indicate failure: structural violation detected.
                }
            }
        }

        // Now, process the unvisited nodes in the current frontier for partitioning and finding neighbors.
        for (const currentNode of unvisitedInCurrentFrontier) {
            // Mark the current node as globally visited.
            nodeVisitedStatus[currentNode] = true;

            // Assign the current node to its respective partition for the current component.
            if (assignedColor === 1) {
                componentPartitionSetB[currentCompSerialNumber]++;
            } else {
                componentPartitionSetA[currentCompSerialNumber]++;
            }

            // Iterate through all possible neighbors to find nodes connected in the complement graph.
            for (let neighborNode = 0; neighborNode < totalNodeCount; neighborNode++) {
                // If there's a missing edge between `currentNode` and `neighborNode` in the
                // original graph (`complementAdjacencyMatrix[currentNode][neighborNode] == 1`),
                // then they are connected in the complement graph.
                if (complementAdjacencyMatrix[currentNode][neighborNode] === 1) {
                    // If the neighbor hasn't been visited yet, add it to the next frontier.
                    // It will be processed with the opposite color in the next recursive call.
                    if (!nodeVisitedStatus[neighborNode]) {
                        nextExplorationFrontier.push(neighborNode);
                    }
                }
            }
        }

        // Recursively call `exploreComponentPartitions` for the next set of nodes,
        // flipping the color for the next partition.
        return exploreComponentPartitions(nextExplorationFrontier, assignedColor === 0 ? 1 : 0);
    };

    // Iterate through all nodes to discover and process each connected component
    // in the complement graph.
    for (let startingNodeIdx = 0; startingNodeIdx < totalNodeCount; startingNodeIdx++) {
        // If the starting node has already been visited as part of a previously
        // processed component, skip it.
        if (nodeVisitedStatus[startingNodeIdx]) {
            continue;
        }

        // Initialize partition sizes for this new component.
        componentPartitionSetA[currentCompSerialNumber] = 0;
        componentPartitionSetB[currentCompSerialNumber] = 0;

        // Start the traversal for the current component from `startingNodeIdx`.
        // It's initially assigned `color 0`.
        const initialFrontierForComponent = [startingNodeIdx];

        // If `exploreComponentPartitions` returns `true`, it means a structural
        // violation was found. Output -1 and terminate the program.
        if (exploreComponentPartitions(initialFrontierForComponent, 0)) {
            console.log(-1);
            return;
        }

        // Increment the component counter for the next component.
        currentCompSerialNumber++;
    }

    // Dynamic Programming phase: Determine all possible sums of partition sizes.
    // `achievablePartitionSums[s]` will be `true` if a subset of component
    // partition sizes can sum up to `s`. The maximum possible sum is `totalNodeCount`.
    const achievablePartitionSums = new Array(totalNodeCount + 1).fill(false);

    // A sum of 0 is always achievable (by choosing an empty set of nodes from all components).
    achievablePartitionSums[0] = true;

    // Iterate through each connected component's partition sizes.
    // For each component, we can choose either `componentPartitionSetA[compIdx]`
    // or `componentPartitionSetB[compIdx]` to add to our current sum.
    for (let compIdx = 0; compIdx < currentCompSerialNumber; compIdx++) {
        const sizeOfSetA = componentPartitionSetA[compIdx];
        const sizeOfSetB = componentPartitionSetB[compIdx];

        // To correctly update the `achievablePartitionSums` array without using
        // values from the current component's choices in the same iteration,
        // we iterate backwards through possible sums.
        for (let currentSum = totalNodeCount; currentSum >= 0; currentSum--) {
            if (achievablePartitionSums[currentSum]) {
                // If `currentSum` is achievable, then adding `sizeOfSetA` to it
                // also yields an achievable sum (if within bounds).
                if (currentSum + sizeOfSetA <= totalNodeCount) {
                    achievablePartitionSums[currentSum + sizeOfSetA] = true;
                }
                // Similarly, adding `sizeOfSetB` also yields an achievable sum.
                if (currentSum + sizeOfSetB <= totalNodeCount) {
                    achievablePartitionSums[currentSum + sizeOfSetB] = true;
                }
            }
        }
    }

    // Find the optimal partition size `k` to maximize the total number of edges.
    // The goal is to divide `totalNodeCount` nodes into two cliques of size `k` and `totalNodeCount - k`.
    // The number of edges is maximized when `k` and `totalNodeCount - k` are as close as possible.
    // This is achieved by maximizing `min(k, totalNodeCount - k)`.
    let maxSmallerPartitionSize = 0;

    for (let currentPossibleSum = 0; currentPossibleSum <= totalNodeCount; currentPossibleSum++) {
        if (achievablePartitionSums[currentPossibleSum]) {
            // `currentPossibleSum` represents the size of one partition.
            // `totalNodeCount - currentPossibleSum` is the size of the other partition.
            maxSmallerPartitionSize = Math.max(
                maxSmallerPartitionSize,
                Math.min(currentPossibleSum, totalNodeCount - currentPossibleSum)
            );
        }
    }

    // Calculate the final result: the sum of edges in two cliques of sizes
    // `maxSmallerPartitionSize` and `totalNodeCount - maxSmallerPartitionSize`.
    const finalCalculatedEdges =
        calculateCliqueEdges(maxSmallerPartitionSize) +
        calculateCliqueEdges(totalNodeCount - maxSmallerPartitionSize);

    console.log(finalCalculatedEdges);
}

// Execute the main processing function with input read from standard input.
// This assumes a Node.js environment where `require("fs")` is available.
ProcessGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));