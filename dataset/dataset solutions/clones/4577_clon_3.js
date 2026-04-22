// Activate the standard input stream to listen for data.
process.stdin.resume();

// Configure the input stream to interpret received data as UTF-8 encoded text.
process.stdin.setEncoding('utf8');

// Declare a mutable array to accumulate all lines read from the standard input.
// This buffer will hold the entire input content before processing begins.
let bufferedInputLines = [];

// Instantiate a readline interface, which is designed to process streaming data
// (like process.stdin) line by line. It automatically handles line endings.
const lineParserInterface = require('readline').createInterface({
    input: process.stdin,   // Specifies the input source as the standard input stream.
    output: process.stdout  // Specifies the output destination, though not directly used for printing in this specific problem's logic.
});

// Attach an event listener for the 'line' event. This callback function executes
// every time a complete line of input is received.
lineParserInterface.on('line', (currentInputLine) => {
    // Append the newly read line to our buffer array.
    bufferedInputLines.push(currentInputLine);
});

// Attach an event listener for the 'close' event. This callback runs once
// the input stream has ended (e.g., when all data has been provided or the process terminates input).
// All core processing logic is encapsulated within this handler.
lineParserInterface.on('close', () => {
    // --- Input Validation: Ensure there is data to process ---
    if (bufferedInputLines.length === 0) {
        console.error("Error: No input data was received. Exiting processing.");
        return; // Terminate execution if no lines were read.
    }

    // The first line of input contains metadata about the graph:
    // N (total number of nodes) and M (total number of edges).
    // M is not used in this specific problem, so we only extract N.
    const firstLineTokens = bufferedInputLines[0].split(" ");
    const totalNodesCount = parseInt(firstLineTokens[0], 10); // Parse N as an integer.

    // --- Data Validation: Check the validity of the parsed node count ---
    if (isNaN(totalNodesCount) || totalNodesCount <= 0) {
        console.error(`Error: Invalid or non-positive node count ('${firstLineTokens[0]}') specified in the first line. Must be a positive integer.`);
        return; // Abort if the node count is invalid.
    }

    // Initialize an array to store the degree count for each node.
    // Nodes are typically 1-indexed in graph problems, so we create an array
    // of size (totalNodesCount + 1) and pre-fill all elements with 0.
    // This simplifies incrementing later, as we don't need to check for undefined values.
    const nodeDegreeCounts = new Array(totalNodesCount + 1).fill(0);

    // Iterate over each line in the buffered input to process the graph edges.
    // The `forEach` loop provides both the content of the line and its index.
    bufferedInputLines.forEach((lineContent, lineIndex) => {
        // Skip the very first line, as it contains the N and M metadata, not an edge.
        if (lineIndex === 0) {
            return; // Continue to the next line without processing this one as an edge.
        }

        // For subsequent lines, split the string to get the two node identifiers
        // that form an edge.
        const edgeNodeIdentifiers = lineContent.split(" ");

        // Parse these identifiers into integers.
        const nodeAIdentifier = parseInt(edgeNodeIdentifiers[0], 10);
        const nodeBIdentifier = parseInt(edgeNodeIdentifiers[1], 10);

        // --- Data Validation: Ensure edge node identifiers are valid ---
        if (isNaN(nodeAIdentifier) || isNaN(nodeBIdentifier) ||
            nodeAIdentifier < 1 || nodeAIdentifier > totalNodesCount ||
            nodeBIdentifier < 1 || nodeBIdentifier > totalNodesCount) {
            console.warn(`Warning: Skipping invalid or out-of-range edge definition on line ${lineIndex + 1}: '${lineContent}'. Nodes must be between 1 and ${totalNodesCount}.`);
            return; // Skip this malformed edge and proceed.
        }

        // An edge connects two nodes, so increment the degree count for both.
        // Due to `nodeDegreeCounts` being pre-filled with zeros, direct increment is safe.
        nodeDegreeCounts[nodeAIdentifier]++;
        nodeDegreeCounts[nodeBIdentifier]++;
    });

    // After processing all edges, iterate from node 1 up to totalNodesCount
    // to output the calculated degree for each node.
    for (let nodeIterator = 1; nodeIterator <= totalNodesCount; nodeIterator++) {
        // Retrieve the degree count for the current node. If a node had no edges,
        // its count will remain 0 due to the initial array fill.
        const currentNodesDegree = nodeDegreeCounts[nodeIterator];
        console.log(currentNodesDegree);
    }
});