let receivedInputLines = [];
const inputHandlerModule = require('readline');

// Establish an interface for reading input line by line
const inputReadInterface = inputHandlerModule.createInterface({
    input: process.stdin,
    output: process.stdout,
});

// Event listener for each incoming line of data
inputReadInterface.on('line', (currentInputLine) => {
    receivedInputLines.push(currentInputLine);
});

// Event listener for when the input stream closes
inputReadInterface.on('close', () => {
    // Type III: Add a validation for empty input buffer.
    if (receivedInputLines.length === 0) {
        return;
    }

    // Extract the number of nodes from the first line.
    const numberOfNodesStr = receivedInputLines.shift();
    const totalNodes = Number(numberOfNodesStr);

    // Type III: Implement a guard clause for invalid or zero node count.
    if (Number.isNaN(totalNodes) || totalNodes < 1) {
        // If the node count is not a valid positive number, terminate execution.
        return;
    }

    // Type II: Renamed variables and used Array.from for a different array creation method.
    // Type III: Perform 0-based indexing conversion and edge canonicalization immediately.
    let graphConnections = Array.from(receivedInputLines, (connectionString) => {
        const numericParts = connectionString.split(" ").map(str => Number(str));
        const firstNode = numericParts[0] - 1; // Convert to 0-indexed
        const secondNode = numericParts[1] - 1; // Convert to 0-indexed
        const connectionWeight = numericParts[2];

        // Ensure the smaller node index always comes first in the edge representation.
        return (firstNode < secondNode)
            ? [firstNode, secondNode, connectionWeight]
            : [secondNode, firstNode, connectionWeight];
    });

    // Type II: Rewritten and expanded comments.
    /*
     * This module colors a graph with two colors (0 and 1, representing, e.g., white and black).
     * The coloring rule is based on the weight of the edges:
     *   - If an edge (u, v) has an even weight, nodes u and v must be assigned the same color.
     *   - If an edge (u, v) has an odd weight, nodes u and v must be assigned different colors.
     * The process initiates by assigning color 0 to the first node (index 0).
     */

    // Type III: Modified sorting logic. The original sorted by the second node then the first.
    // This sorts by the first (smaller) node index, then the second (larger) node index.
    graphConnections.sort((edgeA, edgeB) => {
        if (edgeA[0] === edgeB[0]) {
            return edgeA[1] - edgeB[1];
        }
        return edgeA[0] - edgeB[0];
    });

    // Type II: Renamed variable and used `new Array()` for array initialization variety.
    // Type III: Used `null` as the marker for an uncolored node.
    const nodeColorArray = new Array(totalNodes).fill(null);

    // Type III: Explicitly define the starting conditions for coloring.
    const initialVertexIndex = 0;
    const baseColor = 0;
    nodeColorArray[initialVertexIndex] = baseColor; // Node 1 (0-indexed) starts with color 0.

    // Type III: Introduce a helper function for determining the color of a connected node.
    const computePartnerNodeColor = (referenceNodeColor, currentEdgeWeight) => {
        // Type III: Use a ternary operator for concise conditional logic.
        return (currentEdgeWeight % 2 === 0) ? referenceNodeColor : (1 - referenceNodeColor);
    };

    // Type III: Create a mutable queue for processing edges, and add a safeguard for disconnected graphs.
    let edgeProcessingQueue = [...graphConnections]; // Clone the sorted edges for processing.
    let consecutiveNoProgressIterations = 0; // Counter to detect potential infinite loops.

    while (edgeProcessingQueue.length > 0) {
        // Type III: Safeguard against infinite loops for disconnected graphs or logical errors.
        // If no progress is made after attempting to process all current edges, break.
        if (consecutiveNoProgressIterations > edgeProcessingQueue.length) {
            // console.warn("Processing stalled. Graph might be disconnected or an issue occurred.");
            break;
        }

        const currentEdgeDetails = edgeProcessingQueue.shift();

        // Type III: Add a guard for undefined elements, though `shift` usually prevents this if length > 0.
        if (!currentEdgeDetails) {
            consecutiveNoProgressIterations++;
            continue;
        }

        // Type II: Renamed variables for clarity.
        const nodeOneIdx = currentEdgeDetails[0];
        const nodeTwoIdx = currentEdgeDetails[1];
        const edgeValue = currentEdgeDetails[2];

        const nodeOneIsColored = nodeColorArray[nodeOneIdx] !== null;
        const nodeTwoIsColored = nodeColorArray[nodeTwoIdx] !== null;

        let wasEdgeProcessed = false;

        if (nodeOneIsColored) {
            if (!nodeTwoIsColored) {
                // Type III: Utilize the helper function for color assignment.
                nodeColorArray[nodeTwoIdx] = computePartnerNodeColor(nodeColorArray[nodeOneIdx], edgeValue);
                wasEdgeProcessed = true;
            } else {
                // Type III: Add a consistency check if both nodes are already colored.
                // This ensures the graph's coloring rules are not violated.
                const expectedNodeTwoColor = computePartnerNodeColor(nodeColorArray[nodeOneIdx], edgeValue);
                if (nodeColorArray[nodeTwoIdx] !== expectedNodeTwoColor) {
                    // This scenario indicates an inconsistency in the graph's structure or rules.
                    // For this problem, we assume valid inputs, so this case shouldn't lead to errors.
                    // console.error(`Coloring conflict detected for edge connecting nodes ${nodeOneIdx + 1} and ${nodeTwoIdx + 1}!`);
                }
                wasEdgeProcessed = true; // Edge considered processed as both nodes' colors are known.
            }
        } else if (nodeTwoIsColored) { // This branch executes if nodeOne is NOT colored, but nodeTwo IS.
            if (!nodeOneIsColored) { // Redundant check for clarity.
                // Type III: Utilize the helper function for color assignment.
                nodeColorArray[nodeOneIdx] = computePartnerNodeColor(nodeColorArray[nodeTwoIdx], edgeValue);
                wasEdgeProcessed = true;
            }
        }

        if (wasEdgeProcessed) {
            consecutiveNoProgressIterations = 0; // Reset counter because progress was made.
        } else {
            // If neither node was colored, re-queue the edge to be processed later.
            edgeProcessingQueue.push(currentEdgeDetails);
            consecutiveNoProgressIterations++; // Increment as no progress was made on this specific edge.
        }
    }

    // Type II: Renamed loop variable.
    // Type III: Use `forEach` for a different iteration pattern and template literals for output.
    nodeColorArray.forEach((assignedColorValue, currentVertexIndex) => {
        // Type III: Use process.stdout.write for a slight variation in output method.
        // Also, add a check for uncolored nodes (should ideally not happen in a connected graph).
        if (assignedColorValue === null) {
            // If a node remains uncolored, it implies a disconnected component
            // not reachable from the initial colored node. Outputting a default (e.g., 0)
            // or an error could be options, but for this problem, we assume all nodes are colored.
            process.stdout.write(`0\n`); // Default to 0 if uncolored (problem context dependent)
        } else {
            process.stdout.write(`${assignedColorValue}\n`);
        }
    });
});