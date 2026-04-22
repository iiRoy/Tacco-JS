'use strict';

const extractNumericValues = (inputString) => {
    // Robustly parses a space-separated string of numbers into an array of integers.
    // Handles multiple spaces and leading/trailing whitespace.
    if (typeof inputString !== 'string') {
        return [];
    }
    return inputString.split(' ').filter(segment => segment.trim() !== '').map(numericString => parseInt(numericString.trim(), 10));
};

function solveGraphProblem(rawData) {
    // Split the entire input block into individual lines.
    const allInputLines = rawData.trim().split('\n');

    // Parse the first line to get the total number of nodes and edges.
    const graphDimensions = extractNumericValues(allInputLines[0]);
    const totalNodes = graphDimensions[0];
    const totalEdges = graphDimensions[1];

    // Initialize the adjacency list for the graph.
    // Each index 'i' in 'nodeConnections' stores an array of nodes directly reachable from node 'i'.
    const nodeConnections = Array.from({ length: totalNodes }, () => []);

    // Initialize an array to keep track of the minimum level at which each node was visited.
    // A value of -1 indicates the node has not yet been visited in a meaningful way.
    const minimumVisitLevel = new Array(totalNodes).fill(-1);

    // Populate the adjacency list by parsing each edge definition.
    // Node identifiers in the input are 1-based, so convert them to 0-based.
    for (let currentEdgeIndex = 1; currentEdgeIndex <= totalEdges; currentEdgeIndex++) {
        const edgeData = extractNumericValues(allInputLines[currentEdgeIndex]);
        const originNode = edgeData[0] - 1;
        const destinationNode = edgeData[1] - 1;
        nodeConnections[originNode].push(destinationNode);
    }

    // Parse the line containing the starting and target nodes for the traversal.
    const startAndGoalNodes = extractNumericValues(allInputLines[totalEdges + 1]);
    const entryPointNode = startAndGoalNodes[0] - 1;
    const finalDestinationNode = startAndGoalNodes[1] - 1;

    // --- Breadth-First Search (BFS) Initialization ---
    // 'currentLevelNodes' holds the nodes to be processed in the current BFS level.
    let currentLevelNodes = [entryPointNode];
    // The starting node is considered to be at level 0.
    minimumVisitLevel[entryPointNode] = 0;

    let currentTraversalDepth = 0; // Represents the 'level' or 'step' of the BFS.
    let pathFoundToTarget = false; // Flag to indicate successful path discovery.

    // 'nextLevelCandidates' uses a Set to efficiently collect unique nodes for the subsequent BFS level.
    let nextLevelCandidates = new Set();

    // Main BFS loop: continues as long as there are nodes to explore.
    while (currentLevelNodes.length > 0) {
        // Increment the depth for the new level being explored.
        currentTraversalDepth++;
        // Clear the set for collecting nodes for the next level.
        nextLevelCandidates.clear();

        // Calculate (depth % 3) once per level for efficiency.
        const depthModuloThree = currentTraversalDepth % 3;

        // Iterate through each node in the current BFS level.
        for (const processingNode of currentLevelNodes) {
            const connectedNeighbors = nodeConnections[processingNode];

            // Explore all neighbors of the current node.
            for (const neighborNodeId of connectedNeighbors) {
                // Check for target node reachability with the specific path length constraint.
                if (depthModuloThree === 0 && neighborNodeId === finalDestinationNode) {
                    pathFoundToTarget = true;
                    break; // Target found, no need to explore further from this node.
                }

                const priorVisitDepth = minimumVisitLevel[neighborNodeId];

                // If the neighbor has not been visited yet, mark its level and add to next level.
                if (priorVisitDepth === -1) {
                    minimumVisitLevel[neighborNodeId] = currentTraversalDepth;
                    nextLevelCandidates.add(neighborNodeId);
                }
                // If visited, but the current path offers a 'different state' (depth difference not multiple of 3),
                // then re-evaluate this neighbor.
                else if ((currentTraversalDepth - priorVisitDepth) % 3 !== 0) {
                    minimumVisitLevel[neighborNodeId] = currentTraversalDepth;
                    nextLevelCandidates.add(neighborNodeId);
                }
            }
            // If target found, break out of the inner loop (processing current level nodes).
            if (pathFoundToTarget) {
                break;
            }
        }

        // If target found, break out of the main BFS loop.
        if (pathFoundToTarget) {
            break;
        }

        // Prepare for the next iteration: the current level nodes are now the collected unique candidates.
        currentLevelNodes = Array.from(nextLevelCandidates);
    }

    // Output the result.
    if (pathFoundToTarget) {
        // The result is the path length divided by 3, as per problem constraints.
        console.log(currentTraversalDepth / 3);
    } else {
        // If no path meeting the criteria was found.
        console.log(-1);
    }
}

// Standard input/output handling for competitive programming environments.
// This block ensures the 'solveGraphProblem' function receives the entire input.
solveGraphProblem(require("fs").readFileSync("/dev/stdin", "utf8"));