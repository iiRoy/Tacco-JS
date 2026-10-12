// This function processes the entire input string provided.
function ProcessInput(rawData) {
    // The input string is broken down into an array of individual lines.
    let lineArray = rawData.split("\n");

    // The very first line contains crucial initial configuration values.
    const initialValues = lineArray[0].split(" ").map( (textVal) => parseInt(textVal, 10) );

    // Extract the total number of nodes and edges from the initial values.
    const nodeCount = initialValues[0];
    const edgeCount = initialValues[1];

    // Initialize arrays to hold the parsed connection data.
    let connectionData = [];
    let sourceNodes = [];
    let destinationNodes = [];

    // Iterate through the subsequent lines to parse each connection.
    // The loop covers all connection lines, from the second line onwards.
    for (let idx = 1; idx <= nodeCount - 1 + edgeCount; idx++) {
        // Parse the current line into an array of integers representing a connection.
        const currentConnection = lineArray[idx].split(" ").map( (s) => parseInt(s, 10) );

        // Store the complete connection array.
        connectionData[idx - 1] = currentConnection;

        // Add the source and destination nodes of the current connection to their respective lists.
        sourceNodes.push(currentConnection[0]);
        destinationNodes.push(currentConnection[1]);
    }

    // Prepare to identify nodes that are "leaves" (never a source) and a potential "root" (never a destination).
    let terminalNodes = [];
    let rootNodeCandidate = 0; // Default initialization for the root candidate.

    // Examine each possible node identifier from 1 up to nodeCount.
    for (let idx = 1; idx <= nodeCount; idx++) {
        // If a node does not appear in the list of source nodes, it's considered a terminal node.
        if (sourceNodes.indexOf(idx) === -1) {
            terminalNodes.push(idx);
        }
        // If a node does not appear in the list of destination nodes, it's a candidate for the root.
        if (destinationNodes.indexOf(idx) === -1) {
            rootNodeCandidate = idx;
        }
    }

    // Output the identified terminal nodes and the determined root candidate.
    console.log(terminalNodes, rootNodeCandidate);
}

// The following line is responsible for reading standard input and invoking the main processing function.
// It should not be altered as it handles the environment-specific input mechanism.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
