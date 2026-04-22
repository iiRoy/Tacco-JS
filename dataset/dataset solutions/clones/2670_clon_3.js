const rawInputLines = require('node:fs').readFileSync('/dev/stdin', 'utf8').trim().split('\n');

/**
 * Parses a string line into an array of numbers.
 * @param {string} lineStr - The input string line.
 * @returns {number[]} An array of numeric values.
 */
const parseNumericLine = (lineStr) => lineStr.split(' ').map(Number);

// Extract configuration parameters from the very first line of input.
// The original code used input[0][0] for N and input[0][2] for P.
// The middle value (input[0][1]) was not used and commented out.
const [finalDestinationNode, , hopCostPenalty] = parseNumericLine(rawInputLines[0]);

// Remove the configuration line from the raw input, leaving only edge definitions.
// This is more explicit than using .shift() on the original array.
const edgeDefinitions = rawInputLines.slice(1);

// Initialize an adjacency list to represent the graph's connections.
// Keys are source nodes, values are arrays of [targetNode, edgeWeight].
// Pre-fill with empty arrays for all possible nodes from 1 to finalDestinationNode.
const graphConnections = {};
for (let nodeIdentifier = 1; nodeIdentifier <= finalDestinationNode; nodeIdentifier++) {
    graphConnections[nodeIdentifier] = [];
}

// Populate the adjacency list using the remaining input lines.
edgeDefinitions.forEach((line) => {
    // Skip any potentially empty lines that might result from trailing newlines.
    if (line.trim() === '') return;

    const [sourceNode, targetNode, edgeWeight] = parseNumericLine(line);

    // Add the edge to the graph. Defensive check for sourceNode existence.
    if (graphConnections[sourceNode]) {
        graphConnections[sourceNode].push([targetNode, edgeWeight]);
    }
});

// Variable to store the maximum path value found. Initialized to -1 as per original.
let maxPathValue = -1;

/**
 * Computes the optimal path value using an iterative Depth-First Search (DFS).
 * This function explores all valid paths from node 1 to the finalDestinationNode,
 * calculating a score for each path and tracking the maximum.
 */
const computeOptimalPathValue = () => {
    // The DFS exploration stack. Each element represents a specific path's state:
    // [currentNodeId, accumulatedWeightToCurrentNode, currentPathLength, visitedNodesSet]
    // - currentNodeId: The node currently being processed.
    // - accumulatedWeightToCurrentNode: Sum of edge weights along the path to currentNodeId.
    // - currentPathLength: Number of nodes in the path from start to currentNodeId (inclusive).
    // - visitedNodesSet: A Set containing all nodes visited in the current path branch,
    //                    used for efficient cycle detection (O(1) average lookup).
    const explorationStack = [];

    // Define the starting state for the DFS.
    const startingNode = 1;
    const initialAccumulatedWeight = 0;
    const initialPathLength = 1; // Path starts at node 1, so length is 1.
    const initialVisitedSet = new Set([startingNode]);

    // Push the initial state onto the stack to begin exploration.
    explorationStack.push([startingNode, initialAccumulatedWeight, initialPathLength, initialVisitedSet]);

    // Continue exploring as long as there are path states on the stack.
    while (explorationStack.length > 0) {
        // Pop the current path state from the top of the stack.
        const [currentNode, currentWeightSum, currentHopCount, currentPathVisited] = explorationStack.pop();

        // If the current node is the target destination, evaluate the path.
        if (currentNode === finalDestinationNode) {
            // Calculate the total score for this completed path.
            // Score = Total_Edge_Weights - (Penalty_Per_Hop * Total_Hops)
            const currentPathScore = currentWeightSum - (hopCostPenalty * currentHopCount);
            // Update the global maximum path value if this path is better.
            maxPathValue = Math.max(maxPathValue, currentPathScore);
            // No need to explore further from the destination node; this path is complete.
            continue;
        }

        // Retrieve all outgoing edges from the current node.
        // Use `|| []` to safely handle nodes with no outgoing connections.
        const outgoingEdges = graphConnections[currentNode] || [];

        // Iterate through each potential next step (neighbor) from the current node.
        // Iterating backwards can sometimes ensure a specific order for DFS exploration
        // if multiple paths are pushed, but for correctness, forward or backward is fine.
        for (let i = outgoingEdges.length - 1; i >= 0; i--) {
            const [neighborNode, edgeCost] = outgoingEdges[i];

            // Check if the neighbor node has already been visited in the *current* path.
            // This prevents cycles and infinite loops in cyclic graphs.
            if (!currentPathVisited.has(neighborNode)) {
                // Calculate the accumulated weight and path length for the next state.
                const nextAccumulatedWeight = currentWeightSum + edgeCost;
                const nextHopCount = currentHopCount + 1;

                // Create a *new* Set for the next path branch.
                // It's crucial that each branch has its own independent visited set
                // to allow different paths to revisit nodes that are not in their *own* history.
                const nextPathVisited = new Set(currentPathVisited);
                nextPathVisited.add(neighborNode);

                // Push the new state onto the stack for subsequent exploration.
                explorationStack.push([neighborNode, nextAccumulatedWeight, nextHopCount, nextPathVisited]);
            }
            // Original code had a 'console.log("loop detected")' here, which is removed as non-essential.
        }
    }
};

// Execute the pathfinding algorithm to populate maxPathValue.
computeOptimalPathValue();

// Output the final maximum path value found.
console.log(maxPathValue);