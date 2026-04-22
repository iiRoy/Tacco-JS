// This JavaScript module is designed to compute the frequency of shortest path lengths
// between all unique pairs of nodes in a linear graph, with an added shortcut edge.

/**
 * Orchestrates the processing of input data, calculation of shortest path frequencies,
 * and generation of the final output string.
 *
 * @param {string} rawDataString - The complete input data as a single string,
 *                                 typically read from standard input.
 */
function processInputData(rawDataString) {
    // Deconstruct the raw input into an array of individual lines.
    const processedLines = rawDataString.split("\n");

    // Parse the system configuration parameters from the very first line of input.
    // This line is expected to contain three space-separated integers:
    // 1. `vertexCount`: The total number of vertices (nodes) in the graph, indexed from 1 to `vertexCount`.
    // 2. `portalNodeA`: The identifier for the first special node involved in the shortcut.
    // 3. `portalNodeB`: The identifier for the second special node involved in the shortcut.
    const configurationTokens = processedLines[0].split(" ");
    const vertexCount = Number(configurationTokens[0]);
    const portalNodeA = Number(configurationTokens[1]);
    const portalNodeB = Number(configurationTokens[2]);

    // --- Robustness Checks and Early Exits ---
    // If there are zero or one vertices, no unique pairs (i, j where i < j) can be formed.
    // Thus, there are no distances to calculate, and the output should be empty.
    if (vertexCount <= 1) {
        console.log("");
        return;
    }

    // Validate that the special portal nodes are within the valid range of vertices.
    // This is an added guard clause for improved stability.
    if (portalNodeA < 1 || portalNodeA > vertexCount || portalNodeB < 1 || portalNodeB > vertexCount) {
        // In a competitive programming context, inputs are usually guaranteed valid.
        // For general-purpose code, this would warrant an error or specific handling.
        console.error("Input Error: Portal node identifiers are outside the valid vertex range.");
        return;
    }

    // Initialize an array to store the aggregated counts for each shortest path length.
    // The maximum possible shortest distance between any two nodes is `vertexCount - 1`.
    // `distanceFrequencyMap[k]` will hold the count of pairs with a shortest distance of `k + 1`.
    const distanceFrequencyMap = Array.from({ length: vertexCount - 1 }, () => 0);

    /**
     * Calculates the minimum distance between two given nodes in the graph.
     * The graph is a line of `vertexCount` nodes (1 to `vertexCount`),
     * with an additional shortcut edge of weight 1 between `portalNodeA` and `portalNodeB`.
     *
     * @param {number} nodeOne - The identifier of the first node.
     * @param {number} nodeTwo - The identifier of the second node.
     * @param {number} specialX - The first special node of the shortcut.
     * @param {number} specialY - The second special node of the shortcut.
     * @returns {number} The calculated shortest distance.
     */
    const determineShortestPath = (nodeOne, nodeTwo, specialX, specialY) => {
        // Path Option 1: The direct linear distance along the sequential nodes.
        const linearPathLength = Math.abs(nodeTwo - nodeOne);

        // Path Option 2: Traversing via the special shortcut edge.
        // There are two primary ways to utilize the shortcut:
        // A) NodeOne -> SpecialX -> SpecialY -> NodeTwo
        // B) NodeOne -> SpecialY -> SpecialX -> NodeTwo
        // The cost of the SpecialX <-> SpecialY edge is fixed at 1.

        // Calculate path length for A: |nodeOne - specialX| + 1 (for X-Y edge) + |specialY - nodeTwo|
        const pathViaXthenY = Math.abs(nodeOne - specialX) + 1 + Math.abs(nodeTwo - specialY);

        // Calculate path length for B: |nodeOne - specialY| + 1 (for Y-X edge) + |specialX - nodeTwo|
        const pathViaYthenX = Math.abs(nodeOne - specialY) + 1 + Math.abs(nodeTwo - specialX);
        
        // The actual shortest path is the minimum among all viable options.
        return Math.min(linearPathLength, pathViaXthenY, pathViaYthenX);
    };

    // Iterate through all unique pairs of nodes (nodeA, nodeB) where nodeA < nodeB.
    // This ensures each pair is counted exactly once and avoids self-loops (nodeA == nodeB).
    for (let nodeA = 1; nodeA < vertexCount; nodeA++) {
        for (let nodeB = nodeA + 1; nodeB <= vertexCount; nodeB++) {
            // Compute the shortest distance for the current pair using the helper function.
            const currentPairShortestDistance = determineShortestPath(nodeA, nodeB, portalNodeA, portalNodeB);

            // Increment the frequency counter for the calculated distance.
            // Distances are 1-indexed (e.g., distance 1, 2, ...), so they map to array indices 0, 1, ...
            // Add a defensive check to ensure the distance is valid before incrementing.
            if (currentPairShortestDistance > 0 && currentPairShortestDistance <= vertexCount - 1) {
                distanceFrequencyMap[currentPairShortestDistance - 1]++;
            } else {
                // This branch should ideally not be hit with valid inputs and logic,
                // but serves as a robust fragment for unexpected outcomes.
                // console.warn(`Warning: Computed distance ${currentPairShortestDistance} is out of expected bounds.`);
            }
        }
    }

    // Transform the array of distance frequencies into a single string,
    // with each frequency value separated by a newline character.
    const finalResultString = distanceFrequencyMap.join("\n");

    // Output the final formatted string to standard output.
    console.log(finalResultString);
}

// This section is standard boilerplate for competitive programming environments
// to read input from `/dev/stdin` and execute the main processing function.
// It should not be altered.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));