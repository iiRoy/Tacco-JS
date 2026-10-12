const inputLines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\n');

// Parse the number of nodes from the first line of input.
const nodeCount = parseInt(inputLines.shift(), 10);

// Initialize a data structure to represent the graph nodes and their properties.
// Each node will store its neighbors, incoming edge count, used colors, and a color search starting point.
const graphNodes = {};
for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    graphNodes[nodeIdx] = {
        neighbors: [],          // List of connected edges/neighbors
        incomingEdges: 0,       // Count of edges pointing to this node
        usedColors: {},         // Map to track colors already used by this node's incident edges
        lastColorAttempt: 0     // The last color successfully assigned or attempted for an edge connected to this node
    };
}

// Initialize the maximum degree found so far. This will determine the upper bound for colors.
let maxDegree = 0;

// Process the edge definitions from the input.
// The input contains N-1 lines, each describing an edge.
for (let edgeLineIdx = 0; edgeLineIdx < nodeCount - 1; edgeLineIdx++) {
    // Split the current line to get the two connected nodes.
    const edgeParts = inputLines[edgeLineIdx].split(' ');
    const sourceNodeIdx = parseInt(edgeParts[0], 10) - 1; // Adjust to 0-based indexing
    const targetNodeIdx = parseInt(edgeParts[1], 10) - 1; // Adjust to 0-based indexing

    // Add the target node as a neighbor to the source node.
    // Store the target node index and the original edge index.
    graphNodes[sourceNodeIdx].neighbors.push({
        targetNode: targetNodeIdx,
        edgeIndex: edgeLineIdx
    });

    // Increment the incoming edge count for the target node.
    graphNodes[targetNodeIdx].incomingEdges += 1;

    // Update the maximum degree if the current node's total degree (out-degree + in-degree) is higher.
    // The total degree for sourceNodeIdx is its neighbors.length (out-degree) + its incomingEdges (in-degree).
    if (maxDegree < graphNodes[sourceNodeIdx].neighbors.length + graphNodes[sourceNodeIdx].incomingEdges) {
        maxDegree = graphNodes[sourceNodeIdx].neighbors.length + graphNodes[sourceNodeIdx].incomingEdges;
    }
    // Do the same for the target node.
    if (maxDegree < graphNodes[targetNodeIdx].neighbors.length + graphNodes[targetNodeIdx].incomingEdges) {
        maxDegree = graphNodes[targetNodeIdx].neighbors.length + graphNodes[targetNodeIdx].incomingEdges;
    }
}

// Array to store the assigned color for each edge, indexed by its original input order.
const edgeColors = [];

// Iterate through each node to assign colors to its outgoing edges.
for (let nodeIdx = 0; nodeIdx < nodeCount; nodeIdx++) {
    // Iterate through each neighbor (outgoing edge) of the current node.
    for (let neighborEdgeIdx = 0; neighborEdgeIdx < graphNodes[nodeIdx].neighbors.length; neighborEdgeIdx++) {
        const currentEdge = graphNodes[nodeIdx].neighbors[neighborEdgeIdx];
        let foundColor = false;
        let assignedColorValue;

        // Try to find an unused color starting from `lastColorAttempt + 1`.
        // This is a greedy approach to find the smallest available color.
        // The loop runs up to `maxDegree - 1` (exclusive upper bound).
        for (let colorVal = graphNodes[nodeIdx].lastColorAttempt + 1; colorVal < maxDegree; colorVal++) {
            // Check if the current color is not used by the source node.
            if (!graphNodes[nodeIdx].usedColors[colorVal]) {
                foundColor = true;
                assignedColorValue = colorVal;
                break; // Found an available color
            }
        }

        // If no color was found in the range `lastColorAttempt + 1` to `maxDegree - 1`,
        // then search from color 1 up to `maxDegree - 1`. This handles cases where
        // `lastColorAttempt` might have skipped earlier available colors.
        if (!foundColor) {
            for (let colorVal = 1; colorVal < maxDegree; colorVal++) {
                if (!graphNodes[nodeIdx].usedColors[colorVal]) {
                    assignedColorValue = colorVal;
                    break; // Found an available color
                }
            }
        }

        // Assign the found color to the current edge.
        currentEdge.assignedColor = assignedColorValue;

        // Mark the color as used for the source node.
        graphNodes[nodeIdx].usedColors[currentEdge.assignedColor] = 1;
        // Update the last attempted color for the source node.
        graphNodes[nodeIdx].lastColorAttempt = currentEdge.assignedColor;

        // Mark the color as used for the target node (since the edge connects both).
        graphNodes[currentEdge.targetNode].usedColors[currentEdge.assignedColor] = 1;
        // Update the last attempted color for the target node.
        graphNodes[currentEdge.targetNode].lastColorAttempt = currentEdge.assignedColor;

        // Store the assigned color in the results array at the original edge index.
        edgeColors[currentEdge.edgeIndex] = currentEdge.assignedColor;
    }
}

// Output the maximum degree (which is the value calculated by the original algorithm).
console.log(maxDegree);
// Output the assigned colors for each edge, each on a new line.
console.log(edgeColors.join("\n"));
