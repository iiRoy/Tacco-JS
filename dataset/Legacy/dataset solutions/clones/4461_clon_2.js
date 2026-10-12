"use strict";

/**
 * Processes the input data to determine if a specific path condition is met within a graph structure.
 * The graph is defined by N nodes and M edges.
 *
 * @param {string} inputData - The raw input string, typically from stdin, containing graph information.
 *                             The first line contains "N M", subsequent M lines contain "from to" for each edge.
 */
const processInput = (inputData) => {
    // Normalize the input string: remove leading/trailing whitespace and split into individual lines.
    const processedLines = inputData.trim().split("\n");

    // Parse the first line to extract the total number of nodes (nodeCount)
    // and the total number of edges (edgeCount) in the graph.
    const nodeCount = parseInt(processedLines[0].split(" ")[0]);
    const edgeCount = parseInt(processedLines[0].split(" ")[1]);

    // Extract the lines that define the edges. These are from the second line up to (M+1)-th line.
    const edgeListStrings = processedLines.slice(1, edgeCount + 1);

    // Initialize a tracking array to store counts related to node connections.
    // The array has 'nodeCount' elements, all initialized to zero.
    // This array will be used to detect specific connection patterns.
    let connectionTracker = [...Array(nodeCount)].fill(0);

    // Initialize the result status to "IMPOSSIBLE". This will be updated if the condition is met.
    let resultStatus = "IMPOSSIBLE";

    // Iterate through each edge in the provided list to check for the specific path condition.
    for (let idx = 0; idx < edgeCount; idx++) {
        // Parse the current edge string (e.g., "1 2") into its constituent node numbers.
        // The 'map' function converts string numbers to integers.
        const currentEdge = edgeListStrings[idx].split(" ").map(nodeNumStr => parseInt(nodeNumStr));

        // Assign the 'from' and 'to' nodes for clarity.
        const startNode = currentEdge[0]; // The starting node of the current edge.
        const endNode = currentEdge[1];   // The ending node of the current edge.

        // First condition check: If the edge starts from node 1.
        if (startNode === 1) {
            // If the 'endNode' has already been encountered 'nodeCount' times as a destination from node 1,
            // then the specific condition is met.
            if (connectionTracker[endNode] === nodeCount) {
                resultStatus = "POSSIBLE"; // Update the result.
                break; // Exit the loop early as the condition is satisfied.
            } else {
                // Otherwise, increment the counter for this 'endNode' in the tracker.
                connectionTracker[endNode]++;
            }
        }

        // Second condition check: If the edge ends at the last node (nodeCount).
        if (endNode === nodeCount) {
            // If the 'startNode' has already been encountered 1 time as a source to node 'nodeCount',
            // then the specific condition is met.
            if (connectionTracker[startNode] === 1) {
                resultStatus = "POSSIBLE"; // Update the result.
                break; // Exit the loop early as the condition is satisfied.
            } else {
                // Otherwise, increment the counter for this 'startNode' in the tracker.
                connectionTracker[startNode]++;
            }
        }
    }

    // Output the final determined status to the console.
    console.log(resultStatus);
};

// Read the entire content of standard input synchronously using Node.js 'fs' module,
// then pass it to the 'processInput' function for execution.
processInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
