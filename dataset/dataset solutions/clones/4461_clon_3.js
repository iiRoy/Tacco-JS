"use strict";

/**
 * Expert function to process graph input data and determine a specific connectivity status.
 * This function analyzes a set of nodes and edges based on predefined criteria.
 *
 * @param {string} rawInputData - The raw string input, typically from standard input.
 *                                 Expected format:
 *                                 Line 1: N M (Number of nodes, Number of edges)
 *                                 Subsequent M lines: u v (An edge from node u to node v)
 */
const processGraphInput = (rawData) => {
    // Step 1: Prepare the input data.
    // Remove leading/trailing whitespace and split the entire input into individual lines.
    const inputLines = rawData.trim().split("\n");

    // Step 2: Parse the graph parameters from the first line.
    // The first line contains two space-separated integers: N (number of nodes) and M (number of edges).
    const firstLineParts = inputLines[0].split(" ");
    const numberOfNodes = Number.parseInt(firstLineParts[0], 10); // N: Total count of nodes in the graph.
    const numberOfEdges = Number.parseInt(firstLineParts[1], 10); // M: Total count of edges to process.

    // Step 3: Extract the edge definitions.
    // The subsequent M lines describe the edges. We slice the array from index 1 (after the first line)
    // up to numberOfEdges + 1 (exclusive, to include M lines).
    const edgeDescriptions = inputLines.slice(1, numberOfEdges + 1);

    // Step 4: Initialize a node activity tracker.
    // This array serves as a counter or state tracker for each node.
    // It's initialized with '0' for all nodes.
    // We create an array of size `numberOfNodes + 1` to allow for 1-indexed node access
    // (nodes are typically 1-indexed in competitive programming, so index 0 remains unused).
    const nodeActivityCounts = new Array(numberOfNodes + 1).fill(0);

    // Step 5: Initialize the outcome message.
    // The default assumption is that the specific connectivity is "IMPOSSIBLE".
    let connectivityResult = "IMPOSSIBLE";

    // Step 6: Introduce a flag to control loop execution.
    // This flag helps to exit the loop early once a "POSSIBLE" condition is met,
    // avoiding unnecessary further processing of edges.
    let outcomeFound = false;

    // Step 7: Iterate through each edge description to evaluate graph connectivity based on custom rules.
    for (let edgeIdx = 0; edgeIdx < numberOfEdges; ++edgeIdx) {
        // Guard clause: If the outcome has already been determined as "POSSIBLE",
        // we can stop processing further edges.
        if (outcomeFound) {
            break;
        }

        // Parse the current edge's source and target nodes.
        // Each edge description is "u v", where u is the origin and v is the destination.
        const currentEdgeNodePair = edgeDescriptions[edgeIdx]
            .split(" ")
            .map(nodeIdString => Number.parseInt(nodeIdString, 10));

        const originNode = currentEdgeNodePair[0];      // The 'from' node of the current edge.
        const destinationNode = currentEdgeNodePair[1]; // The 'to' node of the current edge.

        // --- Core Logic Block 1: Check conditions related to edges originating from Node 1 ---
        // If the current edge starts from Node 1.
        if (originNode === 1) {
            // This specific problem condition checks if the activity count for 'destinationNode'
            // has reached a value equal to the total 'numberOfNodes'.
            // If it has, the specific connectivity pattern is found.
            if (nodeActivityCounts[destinationNode] === numberOfNodes) {
                connectivityResult = "POSSIBLE";
                outcomeFound = true; // Set flag to indicate outcome found and exit the loop.
            } else {
                // If the threshold is not met, increment the activity count for this destination node.
                // This tracks how many times 'destinationNode' has been a direct successor of Node 1.
                nodeActivityCounts[destinationNode] = nodeActivityCounts[destinationNode] + 1;
            }
        }

        // --- Core Logic Block 2: Check conditions related to edges terminating at Node N ---
        // If the current edge ends at the last node, Node N.
        if (destinationNode === numberOfNodes) {
            // This specific problem condition checks if the activity count for 'originNode' has reached '1'.
            // This effectively means it's the first time this 'originNode' is encountered as a predecessor to Node N.
            if (nodeActivityCounts[originNode] === 1) {
                connectivityResult = "POSSIBLE";
                outcomeFound = true; // Set flag to indicate outcome found and exit the loop.
            } else {
                // If the threshold is not met (or already surpassed), increment the activity count for this origin node.
                // This tracks how many times 'originNode' has been a direct predecessor of Node N.
                nodeActivityCounts[originNode] = nodeActivityCounts[originNode] + 1;
            }
        }
    }

    // Step 8: Output the final determination to the console.
    console.log(connectivityResult);
};

// Entry point: Read input from standard input and pass it to the processing function.
processGraphInput(require('fs').readFileSync('/dev/stdin', 'utf8'));