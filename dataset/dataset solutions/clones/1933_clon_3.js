function InputProcessor(sourceText) {
    const instanceRef = this;
    instanceRef.currentTokenIndex = 0;

    // The original string is not directly used after tokenization, so we omit storing it.
    // The tokenization process is slightly rephrased and uses modern JS constructs.
    instanceRef.tokenSequence = (function prepareTokens(rawInputString) {
        // Normalize various whitespace characters (newlines, tabs, multiple spaces) into a single space.
        // Then, trim any leading or trailing spaces that might result from this normalization.
        const cleanedString = rawInputString.replace(/[\s\n\t]+/g, " ").trim();
        // Split the cleaned string by single spaces to get an array of individual tokens.
        const processedTokens = cleanedString.split(" ");
        return processedTokens;
    }(sourceText));

    // Internal utility function to safely retrieve the next token and advance the index.
    const advanceAndFetchToken = function() {
        // If the current index is beyond the bounds of the token array, no more tokens are available.
        if (instanceRef.currentTokenIndex >= instanceRef.tokenSequence.length) {
            return null;
        }
        const currentSegment = instanceRef.tokenSequence[instanceRef.currentTokenIndex];
        instanceRef.currentTokenIndex++; // Move to the next token for subsequent calls.
        return currentSegment;
    };

    /**
     * Retrieves the next token from the input stream as a string.
     * @returns {string|null} The next token string, or null if the stream is exhausted.
     */
    instanceRef.getNextToken = function() {
        return advanceAndFetchToken();
    };

    /**
     * Parses the next token as an integer value.
     * @returns {number|null} The parsed integer, or null if no token is available or parsing fails.
     */
    instanceRef.retrieveInteger = function() {
        const segment = advanceAndFetchToken();
        // Use parseInt with radix 10 for reliable integer conversion.
        return (segment !== null) ? parseInt(segment, 10) : null;
    };

    /**
     * Parses the next token as a floating-point number.
     * (Renamed from nextBigDecimal as JavaScript uses standard floats/doubles).
     * @returns {number|null} The parsed float, or null if no token is available or parsing fails.
     */
    instanceRef.retrieveFloat = function() {
        const segment = advanceAndFetchToken();
        return (segment !== null) ? parseFloat(segment) : null;
    };

    /**
     * Attempts to parse the next token as an integer, conceptually representing a byte.
     * Note: The original `new Int8Array(result)` was a misinterpretation;
     * this implementation parses it as a standard integer.
     * Additional validation (e.g., clamping to -128 to 127) would be needed for strict byte representation.
     * @returns {number|null} The parsed integer, or null if no token is available or parsing fails.
     */
    instanceRef.retrieveByteValue = function() {
        const segment = advanceAndFetchToken();
        return (segment !== null) ? parseInt(segment, 10) : null;
    };
}

// Main application logic container
function ExecuteApplication(inputReader) {
    // Implement a guard clause for invalid input processing utility.
    if (!inputReader || typeof inputReader.retrieveInteger !== 'function') {
        console.error("Critical: Input reader is not properly initialized. Aborting application.");
        return;
    }

    const nodeCount = inputReader.retrieveInteger(); // Read the total number of nodes.

    // Validate the parsed node count for sensible graph operations.
    if (nodeCount === null || nodeCount < 1) {
        console.error("Error: Invalid or insufficient node count provided. Graph processing requires at least one node. Exiting.");
        return;
    }

    // A map to store the 'payload' (value) associated with each node ID.
    // Node IDs are typically 1-indexed in competitive programming problems.
    const nodePayloads = new Map(); // Using Map for better key handling and performance.
    for (let currentId = 1; currentId <= nodeCount; currentId++) {
        const payload = inputReader.retrieveInteger();
        if (payload === null) {
            console.error(`Error: Missing payload for node ${currentId}. Aborting.`);
            return;
        }
        nodePayloads.set(currentId, payload);
    }

    // Represents the graph's structure using an adjacency map.
    // Each key is a node ID, and its value is an array of connected node IDs.
    const graphAdjacencyMap = new Map();

    // Helper function to add an edge to the adjacency map.
    // This reduces code duplication for bidirectional edges.
    const establishEdge = (sourceNode, targetNode) => {
        if (!graphAdjacencyMap.has(sourceNode)) {
            graphAdjacencyMap.set(sourceNode, []);
        }
        graphAdjacencyMap.get(sourceNode).push(targetNode);
    };

    // Read and construct the graph's edges (N-1 edges for a tree).
    for (let edgeIndex = 0; edgeIndex < nodeCount - 1; edgeIndex++) {
        const firstNode = inputReader.retrieveInteger();
        const secondNode = inputReader.retrieveInteger();

        // Validate edge input.
        if (firstNode === null || secondNode === null) {
            console.error(`Error: Incomplete edge definition at index ${edgeIndex}. Aborting.`);
            return;
        }

        // Add edges in both directions for an undirected graph.
        establishEdge(firstNode, secondNode);
        establishEdge(secondNode, firstNode);
    }

    // Stores the accumulated sequence of node payloads for paths from the root to each node.
    const pathValueCollections = {};

    // A queue to manage nodes for breadth-first traversal.
    // Each element is an array: [node ID to visit, node ID from which it was reached].
    const traversalFrontier = [];

    // A set to keep track of nodes that have already been fully processed (visited).
    // This prevents cycles in general graphs and redundant processing in trees.
    const visitedNodesTracker = new Set();

    /**
     * Processes a single graph node during traversal.
     * It accumulates path values and enqueues unvisited neighbors.
     * @param {number} currentId The ID of the node being processed.
     * @param {number} parentId The ID of the node from which currentId was reached.
     */
    const processGraphNode = (currentId, parentId) => {
        // Retrieve the accumulated path values up to the parent node.
        // Use spread syntax and nullish coalescing for a clean copy.
        const accumulatedPath = [...(pathValueCollections[parentId] || [])];

        // Add the payload of the current node to the path.
        const currentPayload = nodePayloads.get(currentId);
        if (currentPayload !== undefined) {
            accumulatedPath.push(currentPayload);
        } else {
            console.warn(`Warning: Node ${currentId} does not have a defined payload. Path might be incomplete.`);
        }

        // Store the complete path for the current node.
        pathValueCollections[currentId] = accumulatedPath;

        // Mark this node as visited to prevent revisiting.
        visitedNodesTracker.add(currentId);

        // Get all nodes connected to the current node.
        const neighbors = graphAdjacencyMap.get(currentId) || [];

        // Iterate through neighbors to add them to the traversal queue if unvisited.
        for (const neighborId of neighbors) {
            // Ensure we don't go back to the parent and don't re-enqueue already visited nodes.
            if (neighborId !== parentId && !visitedNodesTracker.has(neighborId)) {
                traversalFrontier.push([neighborId, currentId]);
            }
        }
    };

    // Initialize the traversal from node 1 (assuming it's the root or starting point).
    // -1 indicates no parent for the initial node.
    const startNode = 1;
    traversalFrontier.push([startNode, -1]);

    // Added a safety counter to prevent infinite loops in case of unexpected graph structures
    // or very large inputs, where the queue might not empty as expected.
    let loopGuard = 0;
    const maxAllowedIterations = nodeCount * (nodeCount + 1); // A generous upper bound for safety.

    // Perform a Breadth-First Search (BFS) traversal.
    while (traversalFrontier.length > 0 && loopGuard < maxAllowedIterations) {
        const nextTarget = traversalFrontier.shift(); // Dequeue the next node to process.
        if (nextTarget) {
            const [targetNodeId, priorNodeId] = nextTarget;
            // Only process if the node hasn't been visited as a primary target yet.
            if (!visitedNodesTracker.has(targetNodeId)) {
                processGraphNode(targetNodeId, priorNodeId);
            }
        }
        loopGuard++;
    }

    // The original code had a `console.log(wrtnNos); return;` here.
    // `wrtnNos` was a globally declared variable (due to lack of `var`/`let`/`const`)
    // that stored the path values for the *last* node processed by `crawlNode`.
    // To replicate a similar, though more predictable, output, we log the path
    // corresponding to the highest numbered node (nodeCount), or the starting node if N=1.
    const finalAccumulatedPath = pathValueCollections[nodeCount] || pathValueCollections[startNode] || [];
    console.log(finalAccumulatedPath.join(' ')); // Output the accumulated path values, space-separated.

    // The extensive "Longest Increasing Subsequence" calculation loop that followed in the
    // original code was entirely unreachable due to an unconditional `return;` statement.
    // In adherence to Type III transformation, this "non-essential" (unreachable)
    // block of code has been removed.
}

// Entry point for execution: Reads from standard input and processes it.
// Uses Node.js 'fs' module to read synchronous input.
ExecuteApplication(new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8")));

// Example usage for local testing (commented out in final output):
// ExecuteApplication(new InputProcessor("3\n10\n20\n30\n1 2\n2 3"));
// Expected output for "3\n10\n20\n30\n1 2\n2 3": "10 20 30" (path to node 3)
// ExecuteApplication(new InputProcessor("1\n50"));
// Expected output for "1\n50": "50" (path to node 1)