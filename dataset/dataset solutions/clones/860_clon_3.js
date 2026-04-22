const getNumericValue = (textualInput) => {
    const numericResult = parseInt(textualInput, 10);
    // Basic validation to ensure input is a valid integer
    if (isNaN(numericResult)) {
        throw new Error(`Input format error: Expected a number, received "${textualInput}"`);
    }
    return numericResult;
};

// Utilize Node.js 'fs' module for synchronous file operations (mimicking original behavior)
const fileSystemInterface = require('fs');

try {
    // Determine the size of the standard input stream
    const stdinStatistics = fileSystemInterface.fstatSync(process.stdin.fd);
    const totalContentSize = stdinStatistics.size;

    // Allocate a buffer to hold the incoming data
    const dataHoldingBuffer = Buffer.alloc(totalContentSize);

    // Read the content from stdin into the buffer
    const bytesTransferred = fileSystemInterface.readSync(process.stdin.fd, dataHoldingBuffer, 0, totalContentSize, 0);

    // Convert the buffer content to a UTF-8 string and split into an array of lines
    const processedInputLines = dataHoldingBuffer.toString('utf8', 0, bytesTransferred).trim().split('\n');

    // Initiate the primary graph analysis routine
    analyzeGraphStructure(processedInputLines);

} catch (processingError) {
    console.error("Critical error during input processing:", processingError.message);
    // Exit with a non-zero code to indicate failure
    process.exit(1);
}

/**
 * Main function to perform graph analysis, specifically identifying critical edges
 * within the longest paths of a directed acyclic graph.
 *
 * @param {string[]} graphDataLines - An array of strings, where each string is an input line.
 */
function analyzeGraphStructure(graphDataLines) {
    // --- Phase 1: Input Parsing and Graph Initialization ---

    // Parse the first line to get the number of nodes and edges
    const graphParameters = graphDataLines.shift().split(' ');
    const numberOfNodes = getNumericValue(graphParameters[0]);
    const numberOfEdges = getNumericValue(graphParameters[1]);

    // Perform basic sanity checks on graph dimensions
    if (numberOfNodes < 0 || numberOfEdges < 0) {
        console.error("Invalid graph dimensions: Node or edge count cannot be negative.");
        return; // Terminate execution gracefully
    }
    if (numberOfNodes === 0) {
        console.log(-1); // No nodes, thus no paths or edges to analyze.
        return;
    }

    // Adjacency lists: 'outgoingConnections' for forward traversal, 'incomingConnections' for backward traversal
    const outgoingConnections = Array.from({ length: numberOfNodes }, () => []);
    const incomingConnections = Array.from({ length: numberOfNodes }, () => []);

    // Store all edges as [source, target] pairs for later reference
    const edgeList = new Array(numberOfEdges);

    // Array to store the length of the longest path ending at each node.
    // Initialized to zero, assuming nodes with no incoming edges have path length 0.
    const maxPathLengths = Array(numberOfNodes).fill(0);

    // --- Phase 2: Graph Construction from Input Edges ---

    // Iterate through the remaining input lines to construct the graph
    for (let currentEdgeIndex = 0; currentEdgeIndex < numberOfEdges; currentEdgeIndex++) {
        const edgeDetails = graphDataLines[currentEdgeIndex].split(' ');
        const originNode = getNumericValue(edgeDetails[0]) - 1; // Convert to 0-indexed
        const destinationNode = getNumericValue(edgeDetails[1]) - 1; // Convert to 0-indexed

        // Store the edge in the list (0-indexed)
        edgeList[currentEdgeIndex] = [originNode, destinationNode];

        // Add connections to respective adjacency lists
        outgoingConnections[originNode].push(destinationNode);
        incomingConnections[destinationNode].push(originNode);
    }

    // --- Phase 3: Dynamic Programming for Longest Path Calculation ---

    // Calculate the longest path length to each node.
    // This is essentially a topological sort-like DP on a DAG.
    for (let currentNode = 0; currentNode < numberOfNodes; currentNode++) {
        const neighborsOfCurrent = outgoingConnections[currentNode];
        for (let k = 0; k < neighborsOfCurrent.length; k++) {
            const adjacentNode = neighborsOfCurrent[k];
            // If a longer path to 'adjacentNode' is found via 'currentNode', update its maxPathLength.
            if (maxPathLengths[adjacentNode] < maxPathLengths[currentNode] + 1) {
                maxPathLengths[adjacentNode] = maxPathLengths[currentNode] + 1;
            }
        }
    }

    // --- Phase 4: Identify Nodes Contributing to Overall Longest Paths ---

    // Determine the maximum path length found across the entire graph
    const overallMaxPathLength = Math.max(...maxPathLengths);

    // Boolean array: true if a node is part of *any* longest path
    const nodesInCriticalPaths = new Array(numberOfNodes).fill(false);
    // Counts how many *critical* predecessors exist for each path length level.
    // This helps determine if a node at a certain depth is uniquely contributing to a critical path.
    const depthUniquenessCount = Array(numberOfNodes).fill(0); // Max depth can be (numberOfNodes - 1)

    // Initialize 'nodesInCriticalPaths' based on overallMaxPathLength
    for (let nodeIdx = 0; nodeIdx < numberOfNodes; nodeIdx++) {
        if (maxPathLengths[nodeIdx] === overallMaxPathLength) {
            nodesInCriticalPaths[nodeIdx] = true;
        }
    }

    // --- Phase 5: Backward Traversal to Propagate Criticality ---

    // Iterate in reverse order of nodes. This ensures that when processing node 'u',
    // all its successors 'v' (with higher indices) have already been processed,
    // allowing correct propagation of the 'criticality' status.
    for (let nodeRevIdx = numberOfNodes - 1; nodeRevIdx >= 0; nodeRevIdx--) {
        // Only process if the current node is already identified as part of a critical path.
        if (nodesInCriticalPaths[nodeRevIdx]) {
            const predecessorsOfCurrent = incomingConnections[nodeRevIdx];
            for (let p = 0; p < predecessorsOfCurrent.length; p++) {
                const predecessorNode = predecessorsOfCurrent[p];
                // Check if this predecessor directly contributes to the current node's longest path.
                if (maxPathLengths[predecessorNode] + 1 === maxPathLengths[nodeRevIdx]) {
                    // Mark the predecessor as also being on a critical path.
                    nodesInCriticalPaths[predecessorNode] = true;
                    // Increment the count for the predecessor's path length level.
                    // This tracks how many critical paths pass through a specific depth.
                    depthUniquenessCount[maxPathLengths[predecessorNode]]++;
                }
            }
        }
    }

    // --- Phase 6: Final Edge Evaluation and Output ---

    let isAnyUniqueCriticalEdgeFound = false; // Renamed from 'flag' for clarity

    // Examine each original edge to find "unique critical" ones
    for (let originalEdgeIdx = 0; originalEdgeIdx < numberOfEdges; originalEdgeIdx++) {
        const [startNode, endNode] = edgeList[originalEdgeIdx]; // Destructuring for readability

        // An edge (startNode -> endNode) is considered "unique critical" if:
        // 1. Both startNode and endNode are part of *some* longest path.
        // 2. The startNode's specific path length level has only one predecessor
        //    that contributes to a critical path leading to that level.
        // This second condition implies that the startNode is a unique "bottleneck" at its depth.
        const isStartNodeCritical = nodesInCriticalPaths[startNode];
        const isEndNodeCritical = nodesInCriticalPaths[endNode];
        const isStartNodeUniqueAtItsDepth = depthUniquenessCount[maxPathLengths[startNode]] === 1;

        if (isStartNodeCritical && isEndNodeCritical && isStartNodeUniqueAtItsDepth) {
            console.log(originalEdgeIdx + 1); // Output the 1-indexed edge number
            isAnyUniqueCriticalEdgeFound = true; // Mark that at least one such edge was found
        }
    }

    // If no unique critical edge was identified throughout the process, output -1.
    if (!isAnyUniqueCriticalEdgeFound) {
        console.log(-1);
    }
}