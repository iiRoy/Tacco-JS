// This module is responsible for processing graph data from standard input
// to determine the maximum accumulated path weight to a specific node.
// It was initially conceived by hiroqn in 2013 and has been refactored
// for clarity and robustness.

const filesystemModule = require('fs');

/**
 * Utility function to synchronously read all content from standard input (stdin).
 * It buffers the input and then converts it into an array of strings,
 * where each string represents a line from the input.
 *
 * @returns {string[]} An array containing each line read from stdin.
 */
function acquireStandardInputAsLines() {
    // Obtain the file descriptor for standard input.
    const standardInputFileDescriptor = process.stdin.fd;

    // Get synchronous statistics about the stdin stream to determine its size.
    const inputStats = filesystemModule.fstatSync(standardInputFileDescriptor);
    const totalInputSize = inputStats.size;

    // Allocate a new buffer to hold the entire content of stdin.
    // Using Buffer.alloc() is the recommended modern approach for buffer creation.
    const inputContentBuffer = Buffer.alloc(totalInputSize);

    // Perform a synchronous read operation from stdin into the allocated buffer.
    const actualBytesRead = filesystemModule.readSync(
        standardInputFileDescriptor,
        inputContentBuffer,
        0,                  // Offset within the buffer to start writing.
        totalInputSize,     // The maximum number of bytes to read.
        0                   // The position in the file to begin reading from (0 for stdin).
    );

    // Convert the content of the buffer into a UTF-8 string,
    // then trim any leading/trailing whitespace and split it into an array of lines.
    const fullInputString = inputContentBuffer.toString('utf8', 0, actualBytesRead);
    const parsedLineArray = fullInputString.trim().split('\n');

    return parsedLineArray;
}

// Global variable to store the lines read from standard input.
let graphDefinitionLines = acquireStandardInputAsLines();

// Invoke the primary function to perform the graph path analysis.
executeGraphPathAnalysis();

/**
 * This is the main function that orchestrates the graph processing.
 * It parses graph dimensions and edge data, then calculates the longest
 * path weights to all reachable nodes from a designated starting node (node 0).
 * Finally, it outputs the maximum path weight to the last node (node N-1).
 */
function executeGraphPathAnalysis() {
    // Extract the primary parameters (number of nodes and edges) from the first input line.
    const dimensionTokens = graphDefinitionLines.shift().split(' ');

    // Basic validation: Ensure the first line has at least two numbers.
    if (dimensionTokens.length < 2) {
        console.error("Input Error: The first line must specify 'nodeCount edgeCount'.");
        process.exit(1); // Terminate execution due to invalid input format.
    }

    // Parse the number of nodes and edges.
    const totalNodeCount = parseInt(dimensionTokens[0], 10);
    const totalEdgeCount = parseInt(dimensionTokens[1], 10);

    // Validate parsed numerical values for graph dimensions.
    if (isNaN(totalNodeCount) || isNaN(totalEdgeCount) || totalNodeCount < 1 || totalEdgeCount < 0) {
        console.error("Input Error: Invalid or non-positive 'nodeCount' or 'edgeCount' specified.");
        process.exit(1);
    }

    // Initialize the adjacency list representation of the graph.
    // Each element `adjacencyStructure[i]` will be an array of `[targetNode, weight]` pairs.
    const adjacencyStructure = Array.from({ length: totalNodeCount }, () => []);

    // Initialize an array to store the maximum accumulated path weight to reach each node.
    // All initial weights are set to 0, assuming paths start with 0 weight at the source.
    const maximumPathWeights = new Array(totalNodeCount).fill(0);

    let lineIterator; // Loop counter for iterating through input lines (edges).

    // Process each subsequent line to populate the graph's adjacency lists.
    for (lineIterator = 0; lineIterator < totalEdgeCount; lineIterator++) {
        const edgeDefinitionTokens = graphDefinitionLines[lineIterator].split(' ');

        // Validation for individual edge definitions.
        if (edgeDefinitionTokens.length < 3) {
            console.error(`Input Error: Edge definition on line ${lineIterator + 2} is malformed. Expected 'source target weight'.`);
            process.exit(1);
        }

        const sourceVertex = parseInt(edgeDefinitionTokens[0], 10);
        const destinationVertex = parseInt(edgeDefinitionTokens[1], 10);
        const connectionWeight = parseInt(edgeDefinitionTokens[2], 10);

        // Further validation: Ensure node indices are within bounds and weight is a number.
        if (isNaN(sourceVertex) || isNaN(destinationVertex) || isNaN(connectionWeight) ||
            sourceVertex < 0 || sourceVertex >= totalNodeCount ||
            destinationVertex < 0 || destinationVertex >= totalNodeCount) {
            console.error(`Input Error: Invalid vertex index or weight for edge on line ${lineIterator + 2}.`);
            process.exit(1);
        }

        // Add the edge to the source node's list of outgoing connections.
        adjacencyStructure[sourceVertex].push([destinationVertex, connectionWeight]);
    }

    // --- Core Algorithm: Longest Path Calculation (a variant of SPFA/Bellman-Ford for longest paths) ---

    // A list (acting as a stack/queue) of nodes whose path weights have been updated,
    // and whose neighbors might need re-evaluation.
    const nodesPendingProcessing = [0]; // Start the traversal from node 0.

    let currentlyExaminedNode; // The node currently being pulled from `nodesPendingProcessing`.
    let adjacentNode;          // A neighbor of `currentlyExaminedNode`.

    // Continue the processing as long as there are nodes in the queue.
    while (nodesPendingProcessing.length > 0) {
        // Retrieve a node for processing. Using `pop()` gives a Depth-First Search (DFS) like order.
        currentlyExaminedNode = nodesPendingProcessing.pop();

        // Retrieve all outgoing connections from the current node.
        const outgoingEdges = adjacencyStructure[currentlyExaminedNode];
        const countOfOutgoingEdges = outgoingEdges.length;

        // Iterate through each neighbor of the `currentlyExaminedNode`.
        for (lineIterator = 0; lineIterator < countOfOutgoingEdges; lineIterator++) {
            const edgeData = outgoingEdges[lineIterator];
            adjacentNode = edgeData[0]; // The neighbor node's identifier.
            const pathSegmentWeight = edgeData[1]; // The weight of the edge to the neighbor.

            // Calculate the potential new maximum path weight to the `adjacentNode`
            // if we pass through `currentlyExaminedNode`.
            const candidatePathWeight = maximumPathWeights[currentlyExaminedNode] + pathSegmentWeight;

            // If this `candidatePathWeight` offers a longer path to `adjacentNode`
            // than any path previously discovered, update it.
            if (maximumPathWeights[adjacentNode] < candidatePathWeight) {
                maximumPathWeights[adjacentNode] = candidatePathWeight;
                // Add the `adjacentNode` back to the processing queue, as its updated
                // path weight might now lead to longer paths for its own neighbors.
                nodesPendingProcessing.push(adjacentNode);
            }
        }
    }

    // The problem requires outputting the maximum path weight to the last node (N-1).
    const finalTargetNodeIndex = totalNodeCount - 1;
    console.log(maximumPathWeights[finalTargetNodeIndex]);
}