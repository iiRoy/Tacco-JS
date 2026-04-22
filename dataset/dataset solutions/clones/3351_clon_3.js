function ProcessTreeColoring(rawDataInput) {
    // Define a constant for the modulo operation to keep results within bounds.
    const PRIME_MODULUS = 1_000_000_007;

    // Split the raw input string into individual lines.
    const inputLines = rawDataInput.split("\n");

    // Parse the first line to get the total number of nodes in the tree.
    const totalNodes = Number.parseInt(inputLines[0], 10);

    // Handle edge case: if there are no nodes, there are 0 ways to color.
    // This is an added guard clause for robustness.
    if (totalNodes === 0) {
        console.log(0);
        return 0;
    }

    // Initialize an adjacency list to represent the tree structure.
    // Each element `treeAdjacency[i]` will be an array of nodes connected to node `i`.
    // All arrays are pre-initialized to ensure no `undefined` checks are needed later.
    const treeAdjacency = Array.from({ length: totalNodes }, () => []);

    // Loop through the remaining input lines to build the tree's adjacency list.
    // A tree with `totalNodes` has `totalNodes - 1` edges.
    for (let currentEdgeIndex = 0; currentEdgeIndex < totalNodes - 1; currentEdgeIndex++) {
        // Parse each edge line, splitting by space and converting node IDs to numbers.
        // Node IDs in the input are 1-based, so convert them to 0-based for array indexing.
        const edgeDefinition = inputLines[currentEdgeIndex + 1].split(" ").map(nodeIdStr => Number.parseInt(nodeIdStr, 10) - 1);
        const sourceNode = edgeDefinition[0];
        const targetNode = edgeDefinition[1];

        // Add connections in both directions for an undirected tree.
        treeAdjacency[sourceNode].push(targetNode);
        treeAdjacency[targetNode].push(sourceNode);
    }

    // `memoizedColoringCounts[i]` will store an array `[waysIfWhite, waysIfBlack]`
    // for the subtree rooted at node `i`.
    // `waysIfWhite`: number of ways to color the subtree where node `i` itself is white.
    // `waysIfBlack`: number of ways to color the subtree where node `i` itself is black.
    // Initialized with [0,0] as a placeholder; actual values will be computed.
    const memoizedColoringCounts = Array.from({ length: totalNodes }, () => [0, 0]);

    // `visitedNodesForDFS` tracks nodes whose coloring options have been fully computed
    // and stored in `memoizedColoringCounts`. This prevents redundant computations.
    const visitedNodesForDFS = new Array(totalNodes).fill(false);

    // Recursive Depth-First Search function to calculate coloring options for a subtree.
    // This function performs a post-order traversal to compute DP values.
    // `currentNodeId`: The ID of the current node whose subtree is being processed.
    // `parentNodeId`: The ID of the parent node of `currentNodeId` (used to avoid traversing back up).
    function calculateSubtreeOptions(currentNodeId, parentNodeId) {
        // If this node's coloring options have already been computed and stored,
        // return the memoized values immediately. This is an optimization for DAGs/graphs,
        // but in a tree with `parentNodeId` it mainly serves as a robust check.
        if (visitedNodesForDFS[currentNodeId]) {
            return memoizedColoringCounts[currentNodeId];
        }

        // Initialize ways to color the current subtree.
        // A single node (leaf in a subtree context) can be white (1 way) or black (1 way)
        // by itself before considering children.
        let waysIfCurrentIsWhite = 1;
        let waysIfCurrentIsBlack = 1;

        // Mark the current node as visited to indicate that its computation is in progress
        // or completed within this DFS call.
        visitedNodesForDFS[currentNodeId] = true;

        // Iterate through all neighbors of the current node to find its children.
        for (const neighborNodeId of treeAdjacency[currentNodeId]) {
            // Skip the parent node to ensure the traversal goes strictly downwards into children.
            if (neighborNodeId === parentNodeId) {
                continue;
            }

            // Recursively calculate coloring options for the child's subtree.
            // This call will return `[childWhiteWays, childBlackWays]` for the child.
            const [childWhiteWays, childBlackWays] = calculateSubtreeOptions(neighborNodeId, currentNodeId);

            // Update `waysIfCurrentIsWhite`:
            // If the current node is white, its child can be either white or black.
            // So, we multiply by the total ways to color the child's subtree.
            // `Math.max(1, ...)` is applied as per the original problem's specific logic,
            // likely to prevent counts from becoming zero if a subtree genuinely has zero ways
            // (e.g., due to constraints, or if intermediate modulo results in 0).
            const totalWaysForChildSubtree = (childWhiteWays + childBlackWays) % PRIME_MODULUS;
            waysIfCurrentIsWhite = (waysIfCurrentIsWhite * Math.max(1, totalWaysForChildSubtree)) % PRIME_MODULUS;

            // Update `waysIfCurrentIsBlack`:
            // If the current node is black, its child MUST be white (due to the constraint
            // that adjacent nodes cannot both be black).
            // So, we multiply by the ways to color the child's subtree with the child being white.
            waysIfCurrentIsBlack = (waysIfCurrentIsBlack * Math.max(1, childWhiteWays)) % PRIME_MODULUS;
        }

        // Store the calculated ways for the current node's subtree in the memoization table.
        memoizedColoringCounts[currentNodeId] = [waysIfCurrentIsWhite, waysIfCurrentIsBlack];
        return memoizedColoringCounts[currentNodeId];
    }

    let finalColoringResult;

    // Special handling for a tree with only one node.
    // A single node can be colored white or black, resulting in 2 ways.
    if (totalNodes === 1) {
        finalColoringResult = 2;
    } else {
        // For trees with more than one node, start the DFS from the root node (node 0).
        // The `parentNodeId` for the root is set to -1 to signify no parent.
        const [rootWhiteWays, rootBlackWays] = calculateSubtreeOptions(0, -1);

        // The total number of ways to color the entire tree is the sum of ways
        // where the root is white and ways where the root is black.
        finalColoringResult = (rootWhiteWays + rootBlackWays) % PRIME_MODULUS;
    }

    // Output the final result to the console, formatted as a string.
    console.log('%s', finalColoringResult);
    // Return the result for external use (e.g., the debug function).
    return finalColoringResult;
}

// Helper function for local debugging and testing in a browser-like environment.
// It retrieves input from a specific HTML element, runs the main logic,
// and displays the result and correctness comparison.
function debugTestRunner(testCaseNumber) {
    // Fetch input data from a textarea element identified by its ID.
    const testInput = document.getElementById(`input${testCaseNumber}`).value;
    // Execute the main tree coloring logic with the fetched input.
    const actualOutput = ProcessTreeColoring(testInput);

    // Fetch the expected output from another HTML element.
    const expectedOutput = document.getElementById(`output${testCaseNumber}`).value.split("\n")[0];

    // Determine if the actual output matches the expected output.
    let testStatus = "FAILED";
    if (String(actualOutput) === expectedOutput) { // Convert actualOutput to string for comparison
        testStatus = "PASSED";
    }

    // Display the test result in a designated HTML element.
    document.getElementById(`result${testCaseNumber}`).innerHTML = testStatus;
}

// This line is typically used in competitive programming environments
// to read input from standard input and pass it to the main function.
// It uses Node.js 'fs' module to read the entire file synchronously.
ProcessTreeColoring(require("fs").readFileSync("/dev/stdin", "utf8"));