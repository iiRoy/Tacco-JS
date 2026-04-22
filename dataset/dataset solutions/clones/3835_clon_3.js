function analyzeGraphConnectivity(rawDataInput) {
    // Validate input presence
    if (!rawDataInput || rawDataInput.trim() === '') {
        // In a real application, this might throw an error or return a specific value.
        // For this cloning exercise, we'll assume valid input as per original code's implied contract.
        return 0; 
    }

    // Split the entire input into individual lines
    const inputLines = rawDataInput.trim().split('\n');

    // Parse the first line to get graph dimensions (N: node count, M: edge count)
    const firstLineTokens = inputLines[0].split(' ');
    // Using array destructuring for cleaner parsing
    const [nodeCountStr, edgeCountStr] = firstLineTokens;
    const nodeCount = parseInt(nodeCountStr, 10);
    const edgeCount = parseInt(edgeCountStr, 10);

    // Parse the second line for target nodes associated with each start node
    // Using map for concise array transformation
    const targetNodesPerStartNode = inputLines[1].split(' ').map(Number);

    // Initialize an adjacency list to represent the graph edges
    // Using a Map for efficient node-to-neighbors lookup
    const graphAdjacencyList = new Map();
    // Pre-populate the map with all nodes, ensuring every node has an entry
    for (let nIdx = 1; nIdx <= nodeCount; nIdx++) {
        graphAdjacencyList.set(nIdx, []);
    }

    // Parse the remaining lines to construct the graph edges
    // Start from line 2 (index 2) up to 2 + edgeCount - 1
    for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
        const edgeTokens = inputLines[edgeIndex + 2].split(' ');
        const sourceNode = parseInt(edgeTokens[0], 10);
        const destinationNode = parseInt(edgeTokens[1], 10);

        // Add bidirectional edges to the adjacency list
        graphAdjacencyList.get(sourceNode).push(destinationNode);
        graphAdjacencyList.get(destinationNode).push(sourceNode);
    }

    // Initialize a counter for how many starting nodes can reach their respective target nodes
    let reachableTargetCount = 0;

    // Iterate through each possible starting node (from 1 to nodeCount)
    // The problem uses 1-based indexing for nodes, so we adjust 'idx'
    for (let startNodeIndex = 0; startNodeIndex < nodeCount; startNodeIndex++) {
        const currentStartingNode = startNodeIndex + 1;
        const targetNodeForCurrentPath = targetNodesPerStartNode[startNodeIndex];

        // Optimization: If the starting node is already the target, it's trivially reachable.
        if (currentStartingNode === targetNodeForCurrentPath) {
            reachableTargetCount++;
            continue; // Move to the next starting node
        }

        // Initialize BFS (Breadth-First Search) for the current starting node
        // Use an array as a queue for nodes to visit in the current level
        let bfsQueue = [currentStartingNode];
        // Use a Set for efficient tracking of visited nodes to prevent cycles and redundant processing
        let visitedNodesTracker = new Set([currentStartingNode]);
        let targetFoundInComponent = false; // Flag to indicate if target was found in this component

        // Perform BFS traversal
        while (bfsQueue.length > 0) {
            // Dequeue the first node from the current level
            const currentNodeInTraversal = bfsQueue.shift();

            // Retrieve all neighbors of the current node from the adjacency list
            const neighborsOfCurrentNode = graphAdjacencyList.get(currentNodeInTraversal) || []; // Handle potential missing node (though unlikely with pre-population)

            // Explore each neighbor
            for (const neighborNode of neighborsOfCurrentNode) {
                // If the neighbor is the target node, we've found a path
                if (neighborNode === targetNodeForCurrentPath) {
                    targetFoundInComponent = true;
                    break; // Exit inner loop, target found
                }
                // If the neighbor hasn't been visited yet, add it to the queue and mark as visited
                if (!visitedNodesTracker.has(neighborNode)) {
                    visitedNodesTracker.add(neighborNode);
                    bfsQueue.push(neighborNode); // Enqueue for further exploration
                }
            }

            // If the target was found in the current component, no need to continue this BFS
            if (targetFoundInComponent) {
                break; // Exit outer BFS while loop
            }
        }

        // If the target node was found during the BFS for this starting node, increment the total count
        if (targetFoundInComponent) {
            reachableTargetCount++;
        }
    }

    // Output the final count of reachable targets
    console.log(reachableTargetCount);
}

// Entry point for execution, reading input from stdin
analyzeGraphConnectivity(require('fs').readFileSync('/dev/stdin', 'utf8'));