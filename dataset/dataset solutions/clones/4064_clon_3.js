function processInputData(rawInputString) {
    // Helper function to safely parse an array of strings into integers.
    const parseIntegerArray = (stringArray) => stringArray.map(str => parseInt(str.trim(), 10));

    // Split the entire input string into individual lines.
    const inputLines = rawInputString.split("\n");

    // Extract the number of nodes and the number of difference relations from the first line.
    // Using array destructuring for clarity.
    const [numNodes, numRelations] = parseIntegerArray(inputLines[0].split(" "));

    // Implement a basic guard clause for invalid input dimensions.
    if (numNodes <= 0 || numRelations < 0) {
        console.log("No"); // If dimensions are non-positive, consistency cannot be determined or is trivially false.
        return;
    }

    // Arrays to store the details of each relation for later verification.
    // These store 0-indexed node identifiers and the required difference.
    const sourceNodeIndices = new Array(numRelations);
    const targetNodeIndices = new Array(numRelations);
    const requiredDifferences = new Array(numRelations);

    // Initialize an adjacency list representation of the difference graph.
    // Each element `differenceGraph[i]` will be an array of objects.
    // An object `{ neighbor: N, diff: D }` signifies that `value[N] - value[i] = D`.
    const differenceGraph = new Array(numNodes).fill(null).map(() => []);

    // Parse each relation line and build the difference graph.
    // Input nodes are 1-indexed, so convert them to 0-indexed.
    for (let relationIdx = 0; relationIdx < numRelations; ++relationIdx) {
        const currentRelationParts = parseIntegerArray(inputLines[relationIdx + 1].split(" "));
        const currentSource = currentRelationParts[0] - 1;
        const currentTarget = currentRelationParts[1] - 1;
        const currentDiff = currentRelationParts[2];

        // Store the original relation details for final consistency check.
        sourceNodeIndices[relationIdx] = currentSource;
        targetNodeIndices[relationIdx] = currentTarget;
        requiredDifferences[relationIdx] = currentDiff;

        // Add edges to the difference graph:
        // If targetValue - sourceValue = diff, then:
        // 1. targetValue can be derived from sourceValue + diff.
        // 2. sourceValue can be derived from targetValue - diff.
        differenceGraph[currentSource].push({ neighbor: currentTarget, diff: currentDiff });
        differenceGraph[currentTarget].push({ neighbor: currentSource, diff: -currentDiff });
    }

    // Array to store the calculated value for each node.
    // Initialized with `null` to explicitly mark nodes whose values are not yet determined.
    const nodeValues = new Array(numNodes).fill(null);
    // A flag to track the overall consistency of the relations.
    let isConsistent = "Yes";

    // This helper function performs a Breadth-First Search (BFS) to propagate
    // relative values within a connected component of the difference graph.
    // It takes a starting node and attempts to determine values for all reachable nodes.
    function exploreConnectedComponent(startingNode) {
        // If the starting node's value is already known, it means this component
        // has already been processed or is currently being processed by another path.
        if (nodeValues[startingNode] !== null) {
            return;
        }

        // For a new component, arbitrarily assign the starting node a value of 0.
        // All other node values in this component will be relative to this reference point.
        nodeValues[startingNode] = 0;
        const traversalQueue = [startingNode];
        let queueReadPointer = 0; // Efficient queue implementation using a pointer.

        // Continue BFS as long as there are nodes in the queue to process.
        while (queueReadPointer < traversalQueue.length) {
            const currentNode = traversalQueue[queueReadPointer++];

            // Iterate through all neighbors (edges) of the current node.
            for (const edge of differenceGraph[currentNode]) {
                const neighborNode = edge.neighbor;
                const differenceToNeighbor = edge.diff;

                // Calculate the expected value for the neighbor based on the current node's value.
                const expectedNeighborValue = nodeValues[currentNode] + differenceToNeighbor;

                if (nodeValues[neighborNode] === null) {
                    // If the neighbor's value is not yet determined, assign it the calculated value
                    // and add the neighbor to the queue for further exploration.
                    nodeValues[neighborNode] = expectedNeighborValue;
                    traversalQueue.push(neighborNode);
                } else if (nodeValues[neighborNode] !== expectedNeighborValue) {
                    // Critical consistency check: If the neighbor's value is already known,
                    // but the newly calculated value contradicts it, then the system of relations
                    // is inconsistent. Mark it as "No" and terminate this component's exploration.
                    isConsistent = "No";
                    return; // Exit early from this component's traversal.
                }
            }
        }
    }

    // Iterate through all nodes. If a node's value is not yet determined (meaning it's
    // part of an unvisited connected component), start a new traversal from it.
    for (let nodeVertex = 0; nodeVertex < numNodes; ++nodeVertex) {
        // If an inconsistency has already been found, stop further processing.
        if (isConsistent === "No") {
            break;
        }
        exploreConnectedComponent(nodeVertex);
    }

    // Final verification step: Even if no direct contradictions were found during propagation,
    // re-check all original relations using the determined node values. This ensures robustness
    // and catches any edge cases or subtle inconsistencies.
    if (isConsistent === "Yes") { // Only proceed if no inconsistency found yet.
        for (let relIndex = 0; relIndex < numRelations; ++relIndex) {
            const src = sourceNodeIndices[relIndex];
            const trg = targetNodeIndices[relIndex];
            const requiredDiff = requiredDifferences[relIndex];

            // If any node involved in a relation still has a null value (e.g., an isolated node
            // that wasn't part of any component or a parsing error), or if the calculated
            // difference doesn't match the required difference, mark as inconsistent.
            if (nodeValues[src] === null || nodeValues[trg] === null ||
                (nodeValues[trg] - nodeValues[src] !== requiredDiff)) {
                isConsistent = "No";
                break;
            }
        }
    }

    // Output the final consistency result.
    console.log(isConsistent);
}

// Standard entry point for competitive programming in Node.js.
// Reads all input from stdin and passes it to the main processing function.
processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));