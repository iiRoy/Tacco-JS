// This JavaScript code processes multiple graph traversal problems,
// reading input from standard input to find specific minimum path costs.
// It implements a variation of a shortest path algorithm with path states.

// Access the Node.js file system module to read input.
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Parse the raw input string into an array of lines,
// removing any leading/trailing whitespace from the whole input.
let inputLineBuffer = rawInputContent.trim().split('\n');

// Loop through each distinct problem instance provided in the input.
// A counter is used for potential debugging or test case identification.
let currentProblemIndex = 0;
while (true) {
    currentProblemIndex++; // Increment problem counter for the current iteration.

    // Retrieve the line containing the number of vertices and edges.
    const dimensionLine = inputLineBuffer.shift();

    // If there are no more lines, it means we've reached the end of input data.
    if (!dimensionLine) {
        break;
    }

    // Parse the vertex and edge counts, converting them to integers.
    const [numGraphVertices, numGraphEdges] = dimensionLine.split(' ').map(str => parseInt(str.trim(), 10));

    // The problem terminates when both vertex and edge counts are zero.
    if (numGraphVertices === 0 && numGraphEdges === 0) {
        break;
    }

    // Define key parameters for the graph traversal.
    // The starting node is typically 1-indexed in problem specifications.
    const initialNodeId = 1;
    // The target node is usually the highest-indexed node.
    const destinationNodeId = numGraphVertices;
    // This value represents the maximum index for path states (0, 1, 2).
    const maxStateCount = 2; // Implies states 0, 1, and 2.

    // Read and store all edge definitions for the current graph.
    // Each edge is stored as [source_node, target_node, edge_weight].
    const graphEdgeList = [];
    for (let edgeCount = 0; edgeCount < numGraphEdges; edgeCount++) {
        const edgeData = inputLineBuffer.shift().split(' ').map(str => parseInt(str.trim(), 10));
        graphEdgeList.push(edgeData);
    }

    // Initialize a 2D matrix to store minimum costs.
    // `minimumCosts[vertex_id][path_state]` holds the cheapest cost.
    // All values are initially set to Infinity to represent unreachable paths.
    const minimumCosts = [];
    for (let v = 0; v <= numGraphVertices; v++) {
        minimumCosts[v] = [];
        for (let state = 0; state <= maxStateCount; state++) {
            minimumCosts[v][state] = Infinity;
        }
    }

    // The cost to reach the initial node in its base state (state 0) is zero.
    minimumCosts[initialNodeId][0] = 0;

    // A queue for nodes that need to be processed (their outgoing edges relaxed).
    // This resembles a Bellman-Ford or SPFA-like approach due to potential re-queueing.
    const nodesForProcessing = [initialNodeId];
    // A Set to efficiently track which nodes have been "fully" processed in a given iteration,
    // preventing infinite loops in cyclic graphs if not careful with queueing.
    const processedSet = new Set();

    // The main loop for graph traversal and cost relaxation.
    // Continues as long as there are nodes whose costs might improve other paths.
    while (nodesForProcessing.length > 0) {
        const activeNode = nodesForProcessing.shift();

        // If this node has already been processed in this cycle, skip it.
        // This is a simple optimization to avoid redundant work,
        // though for full Bellman-Ford, nodes might be re-added multiple times.
        if (processedSet.has(activeNode)) {
            continue;
        }
        processedSet.add(activeNode); // Mark as processed.

        // Iterate over all edges in the graph. This is less efficient than an
        // adjacency list, but mirrors the original algorithm's structure.
        graphEdgeList.forEach(currentEdge => {
            const nodeOne = currentEdge[0];
            const nodeTwo = currentEdge[1];
            const weight = currentEdge[2];

            // Helper variables to make the cost update logic clearer.
            const costOneState0 = minimumCosts[nodeOne][0];
            const costOneState1 = minimumCosts[nodeOne][1];
            const costOneState2 = minimumCosts[nodeOne][2];

            const costTwoState0 = minimumCosts[nodeTwo][0];
            const costTwoState1 = minimumCosts[nodeTwo][1];
            const costTwoState2 = minimumCosts[nodeTwo][2];

            // If nodeOne is the current active node, propagate costs to nodeTwo.
            if (nodeOne === activeNode) {
                // Update for state 0 (standard path).
                if (costOneState0 !== Infinity && costOneState0 + weight < costTwoState0) {
                    minimumCosts[nodeTwo][0] = costOneState0 + weight;
                    nodesForProcessing.push(nodeTwo); // Re-queue if cost improved.
                }

                // Update for state 1 (first special condition).
                // This state seems to capture the direct cost to reach nodeOne.
                if (costOneState0 !== Infinity && costOneState0 < costTwoState1) {
                    minimumCosts[nodeTwo][1] = costOneState0;
                    nodesForProcessing.push(nodeTwo);
                }

                // Update for state 2 (second special condition or propagation).
                // Option A: Inherit state 1 cost from nodeOne.
                if (costOneState1 !== Infinity && costOneState1 < costTwoState2) {
                    minimumCosts[nodeTwo][2] = costOneState1;
                    nodesForProcessing.push(nodeTwo);
                }
                // Option B: Propagate state 2 cost from nodeOne.
                if (costOneState2 !== Infinity && costOneState2 + weight < costTwoState2) {
                    minimumCosts[nodeTwo][2] = costOneState2 + weight;
                    nodesForProcessing.push(nodeTwo);
                }
            }
            // If nodeTwo is the current active node, propagate costs to nodeOne.
            else if (nodeTwo === activeNode) {
                // Update for state 0 (standard path).
                if (costTwoState0 !== Infinity && costTwoState0 + weight < costOneState0) {
                    minimumCosts[nodeOne][0] = costTwoState0 + weight;
                    nodesForProcessing.push(nodeOne);
                }

                // Update for state 1 (first special condition).
                if (costTwoState0 !== Infinity && costTwoState0 < costOneState1) {
                    minimumCosts[nodeOne][1] = costTwoState0;
                    nodesForProcessing.push(nodeOne);
                }

                // Update for state 2 (second special condition or propagation).
                // Option A: Inherit state 1 cost from nodeTwo.
                if (costTwoState1 !== Infinity && costTwoState1 < costOneState2) {
                    minimumCosts[nodeOne][2] = costTwoState1;
                    nodesForProcessing.push(nodeOne);
                }
                // Option B: Propagate state 2 cost from nodeTwo.
                if (costTwoState2 !== Infinity && costTwoState2 + weight < costOneState2) {
                    minimumCosts[nodeOne][2] = costTwoState2 + weight;
                    nodesForProcessing.push(nodeOne);
                }
            }
            // Note: A previously existing line `minimumCosts[destinationNodeId][1] = Infinity;`
            // was removed as it appeared to be either a redundant reset or a bug
            // based on the problem context.
        });
    }

    // After traversal, find the absolute minimum cost to reach the destination node
    // across all possible path states (0, 1, and 2).
    let overallLowestCost = Infinity;
    minimumCosts[destinationNodeId].forEach(stateCost => {
        if (stateCost < overallLowestCost) {
            overallLowestCost = stateCost;
        }
    });

    // Output the final minimum cost for the current problem instance.
    console.log(overallLowestCost);
}