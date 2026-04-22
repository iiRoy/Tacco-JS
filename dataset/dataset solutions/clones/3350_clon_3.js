// This function calculates the number of ways to color a tree
// with two colors (e.g., black and white) such that no two
// adjacent nodes are both black.
function solveTreeColoring(rawData) {
    // Define a large prime modulus for calculations to prevent overflow.
    // Using numeric separators for readability.
    const primeModulus = 1_000_000_007;

    // Parse the raw input string into an array of lines.
    const parsedLines = rawData.split('\n');

    // Extract the total number of nodes from the first line.
    // Use Number.parseInt with radix for robustness.
    const nodeCount = Number.parseInt(parsedLines[0], 10);

    // Guard clause for an empty tree or invalid node count.
    // Problem constraints typically ensure N >= 1, but this adds robustness.
    if (nodeCount < 1) {
        console.log('0'); // No nodes, no ways to color.
        return; // No explicit return value needed as output is via console.
    }

    // Initialize an adjacency list (graph representation).
    // Each index 'i' will store an array of nodes connected to 'i'.
    // Using Array.from for modern array initialization.
    const adjList = Array.from({ length: nodeCount }, () => []);

    // Process the subsequent lines to build the adjacency list.
    // For an N-node tree, there are N-1 edges.
    for (let k = 0; k < nodeCount - 1; ++k) {
        // Parse each edge connection: source and destination nodes.
        const connectionData = parsedLines[k + 1].split(' ').map(s => Number.parseInt(s, 10));

        // Basic validation for edge data format.
        if (connectionData.length !== 2) {
            // Log a warning or throw an error for malformed input.
            // For competitive programming, often just skip or assume valid.
            console.error(`Warning: Malformed edge data on line ${k + 2}: ${parsedLines[k + 1]}`);
            continue;
        }

        // Adjust node indices from 1-based (problem input) to 0-based (array indexing).
        const u = connectionData[0] - 1; // First node in the pair
        const v = connectionData[1] - 1; // Second node in the pair

        // Add bidirectional connections to the adjacency list for an undirected tree.
        adjList[u].push(v);
        adjList[v].push(u);
    }

    // Initialize a DP table to store coloring counts for subtrees.
    // colorCounts[i][0]: Number of ways to color the subtree rooted at 'i' if node 'i' is colored white.
    // colorCounts[i][1]: Number of ways to color the subtree rooted at 'i' if node 'i' is colored black.
    // All counts are initialized to [0, 0] by default.
    const colorCounts = Array.from({ length: nodeCount }, () => [0, 0]);

    // An array to keep track of the processing state of each node during traversal.
    // 0: Not yet visited (unprocessed).
    // 1: Currently on the processing stack (visiting, exploring children).
    // 2: Fully processed (subtree DP values calculated and finalized).
    const traversalState = Array.from({ length: nodeCount }, () => 0);

    // Handle the special case where there's only a single node in the tree.
    if (nodeCount === 1) {
        // A single node can be colored white or black independently.
        console.log('2'); // Output 2 ways.
        return; // Function execution ends here for N=1.
    }

    // Pre-process leaf nodes (nodes with only one connection) as base cases.
    // This optimization helps prime the DP for the iterative approach.
    for (let i = 0; i < nodeCount; ++i) {
        // For a tree, a node with a single neighbor (after the parent is implicitly chosen) is a leaf.
        // For the root, it might have multiple neighbors. This is for actual leaves.
        if (adjList[i].length === 1) {
            colorCounts[i] = [1, 1]; // A leaf can be white (1 way) or black (1 way).
            traversalState[i] = 2;   // Mark as fully processed, as its DP is known.
        }
    }

    // Use a stack to manage the iterative DFS-like traversal for tree DP.
    // Start the traversal from node 0 (arbitrarily chosen root).
    const processingStack = [0];
    traversalState[0] = 1; // Mark the root as currently on the stack.

    // Main loop for iterative tree DP calculation.
    while (processingStack.length > 0) {
        // Get the current node at the top of the stack without removing it (for now).
        const currentNode = processingStack[processingStack.length - 1];

        // Variables to accumulate products for the current node's DP values.
        // Initialize to 1, as it's a multiplicative identity.
        let waysIfCurrentNodeWhite = 1;
        let waysIfCurrentNodeBlack = 1;

        // Flag to indicate if an unprocessed child was found, requiring deeper traversal.
        let encounteredUnprocessedChild = false;

        // Iterate through all neighbors of the current node.
        for (const neighborNode of adjList[currentNode]) {
            // Case 1: Neighbor is an unvisited child.
            if (traversalState[neighborNode] === 0) {
                traversalState[neighborNode] = 1; // Mark child as on stack.
                processingStack.push(neighborNode); // Push child to explore its subtree.
                encounteredUnprocessedChild = true; // Signal that we need to go deeper.
                break; // Stop iterating neighbors; focus on the new child immediately.
            }
            // Case 2: Neighbor is a fully processed child.
            // This means its subtree's DP values are ready to be used.
            else if (traversalState[neighborNode] === 2) {
                // If current node is white, child can be white or black.
                // Sum of child's white ways + black ways.
                const childTotalWays = (colorCounts[neighborNode][0] + colorCounts[neighborNode][1]) % primeModulus;
                // Note: Math.max(1, X) is used here. If X is 0 (due to modulo or actual 0 ways),
                // it's treated as 1. This behavior might be specific to the problem's interpretation
                // of 0 results in intermediate products. Standard DP usually propagates 0.
                waysIfCurrentNodeWhite = (waysIfCurrentNodeWhite * Math.max(1, childTotalWays)) % primeModulus;

                // If current node is black, child must be white.
                // Just child's white ways.
                const childWhiteWays = colorCounts[neighborNode][0];
                waysIfCurrentNodeBlack = (waysIfCurrentNodeBlack * Math.max(1, childWhiteWays)) % primeModulus;
            }
            // Case 3: Neighbor is currently on the stack (traversalState === 1).
            // This implies it's an ancestor or a sibling being processed. Ignore it for DP accumulation here.
        }

        // If no unprocessed children were found, it means all children's subtrees are processed.
        // We can now finalize the DP values for the current node.
        if (!encounteredUnprocessedChild) {
            colorCounts[currentNode] = [waysIfCurrentNodeWhite, waysIfCurrentNodeBlack];
            traversalState[currentNode] = 2; // Mark current node as fully processed.
            processingStack.pop(); // Remove from stack, as its DP is complete.
        }
    }

    // The final answer is the sum of ways to color the root (node 0) white
    // and ways to color the root black.
    const finalResult = (colorCounts[0][0] + colorCounts[0][1]) % primeModulus;

    // Output the computed result to standard output.
    console.log(finalResult.toString());
    // The return statement is omitted as per Type III deletion of non-essential code
    // when output is primarily through console.log.
}

// This block handles reading input from stdin for typical competitive programming environments (like Node.js).
// It is kept separate from the core cloned function.
if (typeof require !== 'undefined' && require.main === module) {
    const fs = require('fs');
    const inputData = fs.readFileSync("/dev/stdin", "utf8");
    solveTreeColoring(inputData);
}