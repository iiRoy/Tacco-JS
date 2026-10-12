const rawData = require("fs").readFileSync("/dev/stdin", "utf8");

// This immediately invoked function processes the input data.
(function(dataParam) {
    // Split the entire input string into individual lines.
    const lineSegments = dataParam.split('\n');

    // Parse the first line to get the number of nodes (N) and edges (M).
    const nodeCount = parseInt(lineSegments[0].split(' ')[0], 10);
    const edgeCount = parseInt(lineSegments[0].split(' ')[1], 10);

    // Initialize arrays to store the source and target nodes for each edge.
    const sourceNodes = [];
    const targetNodes = [];

    // Populate the sourceNodes and targetNodes arrays from the input lines.
    // Each subsequent line (after the first) represents an edge.
    for (var idx = 0; idx < edgeCount; idx++) {
        sourceNodes[idx] = parseInt(lineSegments[idx + 1].split(' ')[0], 10);
        targetNodes[idx] = parseInt(lineSegments[idx + 1].split(' ')[1], 10);
    }

    // Create an adjacency list representation of the graph.
    // The graph has nodeCount + 1 elements (nodes are 1-indexed).
    const adjacencyList = Array(nodeCount + 1).fill(null).map(() => []);

    // Populate the adjacency list. Since it's an undirected graph,
    // add an edge from A to B and from B to A.
    for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
        adjacencyList[sourceNodes[edgeIdx]].push(targetNodes[edgeIdx]);
        adjacencyList[targetNodes[edgeIdx]].push(sourceNodes[edgeIdx]);
    }

    // Initialize an array to track the parent of each node in the traversal.
    // This will store the result of the "path finding" or "spanning tree" operation.
    const parentTracker = [];
    // Initialize a queue for Breadth-First Search (BFS) or similar traversal.
    // Start the traversal from node 1.
    const queueNodes = [1];
    // Variable to hold the current node being processed from the queue.
    let currentNode = 0;

    // Perform a traversal (BFS-like) to find paths from node 1 to all reachable nodes.
    // The loop continues as long as there are nodes in the queue.
    while (currentNode = queueNodes.shift()) {
        // This inner loop iterates 'edgeCount' times. Its purpose with `!sourceNodes[loopCounter]` is unclear
        // if sourceNodes always contains positive integers, but it's preserved for structural equivalence.
        for (var loopCounter = 0; loopCounter < edgeCount; loopCounter++) {
            if (!sourceNodes[loopCounter]) break; // Break if sourceNodes[loopCounter] is 0 or falsy.

            // For each neighbor of the current node:
            adjacencyList[currentNode].forEach(neighborNode => {
                // If the neighbor node hasn't been visited yet (its parent is undefined):
                if (parentTracker[neighborNode - 1] === undefined) {
                    // Add the neighbor to the queue for future processing.
                    queueNodes.push(neighborNode);
                    // Record the current node as the parent of the neighbor.
                    parentTracker[neighborNode - 1] = currentNode;
                }
            });
        }
    }

    // After traversal, check if all nodes (except the starting node 1, which has no parent)
    // have a recorded parent. If parentTracker contains 0, it means some node (node 1)
    // or an unreachable node was not assigned a parent.
    // The problem statement implies node 1 should be 'Yes' and others should be their parent.
    // If any node (other than the implicit start node 1) is unreachable, its entry in parentTracker
    // would remain undefined, and the `indexOf(0)` check would not directly catch this.
    // However, the original code checks for `indexOf(0)`. This implies that if node 1 is the only
    // node without a parent, it's okay, but if any other node somehow gets a 0 assigned or
    // if the array is not fully populated in a way that `indexOf(0)` would indicate a problem,
    // then it's 'No'. Given the problem context, `res[0]` is explicitly set to 'Yes' later.
    // The `indexOf(0)` check is likely to see if any *other* node (not node 1) somehow ended up with 0 as parent,
    // or if the array was not fully populated up to `N` elements, leaving `undefined` which `indexOf(0)` would not find.
    // A more robust check for reachability would be `parentTracker.length === nodeCount && parentTracker.every(p => p !== undefined || p === 'Yes')`.
    // But we must preserve the original logic.
    if (parentTracker.indexOf(0) === -1) {
        // If no '0' is found, it implies a successful traversal for the problem's criteria.
        // Set the first element (corresponding to node 1) to 'Yes'.
        parentTracker[0] = 'Yes';
        // Print each element of the parent tracker.
        parentTracker.forEach(outputValue => {
            console.log(outputValue);
        });
    } else {
        // If '0' is found, it indicates a failure condition.
        console.log('No');
    }

})(rawData);
