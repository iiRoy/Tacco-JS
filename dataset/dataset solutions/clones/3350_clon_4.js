function graphColoringSolver(dataInput) {
    const allLines = dataInput.split("\n");
    const nodeQuantity = parseInt(allLines[0], 10);
    const modularConstant = 1_000_000_007;

    if (nodeQuantity === 1) {
        console.log("%s", 2);
        return 2;
    }

    const adjacencyMatrix = new Map(); // Using Map for adjacency list
    for (let u = 0; u < nodeQuantity; u++) {
        adjacencyMatrix.set(u, []);
    }

    for (let i = 0; i < nodeQuantity - 1; i++) {
        const linkData = allLines[i + 1].split(" ").map(Number);
        const firstNode = linkData[0] - 1;
        const secondNode = linkData[1] - 1;
        adjacencyMatrix.get(firstNode).push(secondNode);
        adjacencyMatrix.get(secondNode).push(firstNode);
    }

    const resultsCache = new Map(); // Memoization for dynamic programming

    // Recursive function to determine coloring possibilities for a subtree
    const computeNodeColorings = (currentNodeIndex, parentNodeIndex) => {
        if (resultsCache.has(currentNodeIndex)) {
            return resultsCache.get(currentNodeIndex);
        }

        let waysForWhite = 1;
        let waysForBlack = 1;

        const connectedNeighbors = adjacencyMatrix.get(currentNodeIndex);
        const childNodesForTraversal = connectedNeighbors.filter(
            (neighborId) => neighborId !== parentNodeIndex
        );

        // Base case: If no children in the DFS traversal (it's a leaf relative to parent)
        if (childNodesForTraversal.length === 0) {
            resultsCache.set(currentNodeIndex, { whiteCount: 1, blackCount: 1 });
            return { whiteCount: 1, blackCount: 1 };
        }

        // Recursive step: Iterate over children and combine results
        childNodesForTraversal.forEach((childId) => {
            const childCalculation = computeNodeColorings(childId, currentNodeIndex);

            // If current node is white, its child can be white or black
            const whiteParentChildOption = Math.max(
                1,
                (childCalculation.whiteCount + childCalculation.blackCount) % modularConstant
            );
            waysForWhite = (waysForWhite * whiteParentChildOption) % modularConstant;

            // If current node is black, its child must be white
            const blackParentChildOption = Math.max(
                1,
                childCalculation.whiteCount % modularConstant
            );
            waysForBlack = (waysForBlack * blackParentChildOption) % modularConstant;
        });

        const currentComputedResults = { whiteCount: waysForWhite, blackCount: waysForBlack };
        resultsCache.set(currentNodeIndex, currentComputedResults);
        return currentComputedResults;
    };

    // Start the recursive computation from node 0 (arbitrary root), with -1 indicating no parent
    const finalTreeResults = computeNodeColorings(0, -1);

    // The total number of ways is the sum of ways if the root is white or black
    const finalAnswer = (finalTreeResults.whiteCount + finalTreeResults.blackCount) % modularConstant;
    
    console.log("%s", finalAnswer);
    return finalAnswer;
}

// Execute the solver with input from stdin, mimicking the original's execution environment
graphColoringSolver(require("fs").readFileSync("/dev/stdin", "utf8"));