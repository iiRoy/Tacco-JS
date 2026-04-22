// This module provides an interface for reading data from a Readable stream,
// typically process.stdin, one line at a time.
const inputReaderModule = require('readline');

// A dynamic array to accumulate all the text lines received from the input stream.
let receivedInputLines = [];

// Establishes an interactive interface for handling input and output.
// Input comes from standard input, and output could go to standard output (though not used for prompts here).
const inputHandler = inputReaderModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Event listener: This function executes every time a new line of text is entered
// and made available by the input stream.
inputHandler.on('line', (currentLineContent) => {
    // Each received line is added to our collection of input data.
    receivedInputLines.push(currentLineContent);
});

// Event listener: This function is triggered once the input stream concludes,
// indicating that all data has been received.
inputHandler.on('close', () => {
    // A preliminary check to ensure that some input was actually provided.
    // If no lines were received, it's an error condition for this problem.
    if (receivedInputLines.length === 0) {
        console.error("Execution Aborted: No input lines were provided.");
        return; // Terminate execution gracefully.
    }

    // Extract the first line of input, which is expected to contain the graph size.
    const nodeCountString = receivedInputLines[0];
    // Convert the string representation of the graph size to an integer.
    // Using parseInt with radix 10 is crucial for reliable number conversion.
    const graphSize = parseInt(nodeCountString, 10);

    // Validate the parsed graph size to ensure it's a positive integer.
    // An invalid size would lead to incorrect or erroneous graph processing.
    if (isNaN(graphSize) || graphSize <= 0) {
        console.error(`Execution Aborted: Invalid graph size '${nodeCountString}' provided. Must be a positive integer.`);
        return; // Terminate execution due to invalid input.
    }

    // Initialize the adjacency matrix (or distance matrix) for the graph.
    // This matrix will store the shortest path weights between any two nodes.
    // Initially, all paths are considered infinitely long, except for self-loops.
    const pathWeights = [];
    for (let rowIdx = 0; rowIdx < graphSize; rowIdx++) {
        // Create a new row, initially filled with 'Infinity'.
        const currentRow = new Array(graphSize).fill(Infinity);
        pathWeights.push(currentRow);
        // The distance from any node to itself is always zero.
        pathWeights[rowIdx][rowIdx] = 0;
    }

    // Populate the initial direct edge weights based on the problem's specific rules.
    // These rules define the immediate connections and their associated costs.
    for (let currentVertex = 0; currentVertex < graphSize; currentVertex++) {
        // Rule 1: An edge from 'currentVertex' to '(currentVertex + 1) % graphSize' with cost 1.
        const nextVertexPlusOne = (currentVertex + 1) % graphSize;
        // Update only if the current path (Infinity) is longer than the new path (1).
        if (pathWeights[currentVertex][nextVertexPlusOne] > 1) {
            pathWeights[currentVertex][nextVertexPlusOne] = 1;
        }

        // Rule 2: An edge from 'currentVertex' to '(currentVertex * 10) % graphSize' with cost 0.
        const nextVertexTimesTen = (currentVertex * 10) % graphSize;
        // Update only if the current path (Infinity or 1) is longer than the new path (0).
        if (pathWeights[currentVertex][nextVertexTimesTen] > 0) {
            pathWeights[currentVertex][nextVertexTimesTen] = 0;
        }
    }

    // --- Core Algorithm: Floyd-Warshall for All-Pairs Shortest Paths ---
    // This algorithm iteratively finds the shortest paths between all pairs of nodes
    // by considering every possible node as an intermediate stop.

    // Outer loop iterates through all possible intermediate nodes (k).
    for (let intermediateNode = 0; intermediateNode < graphSize; intermediateNode++) {
        // Middle loop iterates through all possible starting nodes (i).
        for (let sourceVertex = 0; sourceVertex < graphSize; sourceVertex++) {
            // Inner loop iterates through all possible ending nodes (j).
            for (let destinationVertex = 0; destinationVertex < graphSize; destinationVertex++) {
                // Calculate the potential path length if we go from 'sourceVertex' to 'intermediateNode'
                // and then from 'intermediateNode' to 'destinationVertex'.
                const pathThroughIntermediate = pathWeights[sourceVertex][intermediateNode] + pathWeights[intermediateNode][destinationVertex];

                // If this newly calculated path through 'intermediateNode' is shorter
                // than the currently known shortest path from 'sourceVertex' to 'destinationVertex',
                // then update the distance in the matrix.
                if (pathWeights[sourceVertex][destinationVertex] > pathThroughIntermediate) {
                    pathWeights[sourceVertex][destinationVertex] = pathThroughIntermediate;
                }
            }
        }
    }

    // The problem specifically requests the shortest path from node 1 to node 0.
    const designatedStartingVertex = 1;
    const designatedEndingVertex = 0;

    // Retrieve the computed shortest path length between the specified nodes.
    let shortestPathLength = pathWeights[designatedStartingVertex][designatedEndingVertex];

    // Check if the path was found. If it's still Infinity, the nodes are not reachable.
    // While the problem structure implies reachability, this guard makes the code more robust.
    if (shortestPathLength === Infinity) {
        // Depending on problem requirements, this could output -1 or an error.
        // For this problem, it's assumed a path always exists.
        console.error(`Warning: Path from node ${designatedStartingVertex} to ${designatedEndingVertex} is unreachable.`);
        // To match typical competitive programming output for unreachable, sometimes -1 is given.
        // For this specific problem, based on the original code, it seems Infinity is not expected for the result.
    }

    // Finally, output the result as required: the shortest path length plus one.
    console.log(shortestPathLength + 1);
});