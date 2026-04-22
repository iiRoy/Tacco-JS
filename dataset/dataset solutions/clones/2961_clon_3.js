/*
 * This module processes graph data from standard input to determine node coloring.
 * It implements a Breadth-First Search (BFS) algorithm to assign a binary color (0 or 1)
 * to each node based on the parity of edge weights connecting them.
 *
 * Input Format:
 * The first line contains a single integer, N, representing the total number of nodes.
 * The subsequent N-1 lines each describe an edge: u v w.
 *   - u: The first node of the edge (1-indexed).
 *   - v: The second node of the edge (1-indexed).
 *   - w: The weight of the edge. Only its parity matters (even/odd).
 *
 * Output Format:
 * A series of N lines, each containing the assigned color (0 or 1) for the corresponding node.
 *
 * The core logic is to traverse the graph starting from node 0, assigning it an initial color.
 * For any edge (u, v) with weight w:
 *   - If w is odd (w % 2 === 1), nodes u and v must have different colors.
 *   - If w is even (w % 2 === 0), nodes u and v must have the same color.
 * This effectively colors the graph such that nodes connected by odd-weight edges
 * are in different "partitions" (colors), and nodes connected by even-weight edges
 * are in the same "partition".
 */
console.log((function processGraphInput(inputRawString) {
    // Validate input presence
    if (!inputRawString || inputRawString.trim().length === 0) {
        // In a competitive programming context, an error might be thrown,
        // but for a Type III clone, returning an empty string or a default
        // can be an "updated" behavior.
        console.error("Error: No input data provided. Returning empty output.");
        return "";
    }

    // Helper function to parse integer values safely
    const parseNumericValue = (strVal) => {
        const parsed = parseInt(strVal.trim(), 10); // Added trim for robustness
        if (Number.isNaN(parsed)) { // Using Number.isNaN for clarity
            // This is an added validation fragment
            throw new Error(`Critical input parsing error: encountered non-numeric data "${strVal}"`);
        }
        return parsed;
    };

    // Trim whitespace and split input into individual lines
    const rawInputLines = inputRawString.trim().split('\n');

    // Extract the total number of vertices from the first line
    const totalNodeCount = parseNumericValue(rawInputLines[0]);

    // Pre-allocate storage for the adjacency list representation of the graph.
    // Each element will be an array of [neighborIndex, weightParityBoolean].
    // Initialize with empty arrays for each node.
    const adjacencyStructure = new Array(totalNodeCount);
    for (let currentIdx = 0; currentIdx < totalNodeCount; currentIdx++) {
        adjacencyStructure[currentIdx] = [];
    }

    // Process remaining lines to build the graph's adjacency structure.
    // The loop starts from index 1 as index 0 is the node count.
    // It iterates up to (totalNodeCount - 1) edges for a typical tree structure.
    for (let lineIndex = 1; lineIndex < rawInputLines.length; lineIndex++) {
        const currentLineValues = rawInputLines[lineIndex].split(' ').map(parseNumericValue);

        // Added validation: ensure each edge line has exactly three values.
        if (currentLineValues.length !== 3) {
            console.warn(`Warning: Skipping malformed edge specification on line ${lineIndex + 1}: "${rawInputLines[lineIndex]}". Expected 3 values.`);
            continue; // Skip to the next line
        }

        const [sourceNodeIdOneBased, targetNodeIdOneBased, rawEdgeWeight] = currentLineValues;

        // Convert 1-indexed node identifiers to 0-indexed for array access.
        const sourceNodeIdZeroBased = sourceNodeIdOneBased - 1;
        const targetNodeIdZeroBased = targetNodeIdOneBased - 1;

        // Added validation: ensure node indices are within bounds.
        const areNodeIndicesValid = (idx) => idx >= 0 && idx < totalNodeCount;
        if (!areNodeIndicesValid(sourceNodeIdZeroBased) || !areNodeIndicesValid(targetNodeIdZeroBased)) {
            console.warn(`Warning: Edge on line ${lineIndex + 1} contains out-of-bounds node IDs (${sourceNodeIdOneBased}, ${targetNodeIdOneBased}). Skipping.`);
            continue;
        }

        // Determine the parity of the edge weight: true for odd, false for even.
        const edgeWeightParityFlag = Boolean(rawEdgeWeight % 2);

        // Add bidirectional edges to the adjacency structure.
        // Store neighbor index and the boolean parity of the edge weight.
        adjacencyStructure[sourceNodeIdZeroBased].push([targetNodeIdZeroBased, edgeWeightParityFlag]);
        adjacencyStructure[targetNodeIdZeroBased].push([sourceNodeIdZeroBased, edgeWeightParityFlag]);
    }

    // Array to store the assigned color for each node.
    // Initialize all nodes as uncolored using a distinct value, e.g., -1.
    const assignedNodeColors = new Array(totalNodeCount).fill(-1);

    // Use a queue for Breadth-First Search (BFS) traversal.
    // The traversal starts from node 0, assigning it an initial color (e.g., 0).
    const bfsTraversalQueue = [];

    // Guard clause: Only proceed with BFS if there are nodes in the graph.
    if (totalNodeCount > 0) {
        const startingNode = 0;
        assignedNodeColors[startingNode] = 0; // Assign initial color 0 to the starting node.
        bfsTraversalQueue.push(startingNode);
    } else {
        // If no nodes, return an array of empty strings or handle as an error case.
        // For this problem, it implies an empty graph.
        return "";
    }

    // Perform BFS traversal to color the nodes based on edge parities.
    while (bfsTraversalQueue.length > 0) {
        // Dequeue the current node for processing.
        const currentProcessingNode = bfsTraversalQueue.shift();

        // Iterate over all connected neighbors of the current node.
        for (const [neighborIdentifier, edgeParityBoolean] of adjacencyStructure[currentProcessingNode]) {
            // Check if the neighbor node has not been colored yet (identified by -1).
            if (assignedNodeColors[neighborIdentifier] === -1) {
                // Enqueue the uncolored neighbor for future processing.
                bfsTraversalQueue.push(neighborIdentifier);

                // Determine the neighbor's color based on the edge parity.
                if (edgeParityBoolean) { // If edge weight parity is true (odd)
                    // Neighbor must have the opposite color of the current node.
                    assignedNodeColors[neighborIdentifier] = 1 - assignedNodeColors[currentProcessingNode];
                } else { // If edge weight parity is false (even)
                    // Neighbor must have the same color as the current node.
                    assignedNodeColors[neighborIdentifier] = assignedNodeColors[currentProcessingNode];
                }
            }
            // An additional check could be added here to detect inconsistencies in coloring
            // if the graph is not guaranteed to be consistent (e.g., a cycle with conflicting parities).
            // For a tree structure, this is not necessary as inconsistencies don't arise.
        }
    }

    // Optional post-processing / validation:
    // Verify that all nodes have been colored. In a connected graph (like a tree),
    // all nodes should be reachable from the starting node and thus colored.
    // This loop serves as an added fragment for robustness or debugging.
    for (let finalNodeIdx = 0; finalNodeIdx < totalNodeCount; finalNodeIdx++) {
        if (assignedNodeColors[finalNodeIdx] === -1) {
            // This scenario implies a disconnected graph component if the input is a tree,
            // or an error in logic. For this problem, it's generally not expected.
            // A Type III change could be to assign a default color or throw an error.
            // For now, we'll just acknowledge it without altering the output for consistency
            // with the original problem's implicit assumption of connectivity.
            // console.warn(`Node ${finalNodeIdx} remained uncolored, indicating a potential issue or disconnected component.`);
            // If we were to assign, it would be: assignedNodeColors[finalNodeIdx] = 0;
        }
    }

    // Convert the array of integer colors into a newline-separated string for output.
    // Each color value is explicitly converted to a string.
    return assignedNodeColors.map(colorValue => String(colorValue)).join('\n');

})(require('fs').readFileSync('/dev/stdin', 'utf8')));