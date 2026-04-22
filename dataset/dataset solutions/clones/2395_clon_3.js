const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInput.split('\n');

// The first line contains the total number of nodes in the graph.
const totalNodes = parseInt(inputLines.shift(), 10);

// Initialize an array to store data for each node.
// Each node's data will include its outgoing edges, count of incoming edges,
// a set of colors already used by its incident edges, and the last color attempted.
const graphNodes = new Array(totalNodes);

// Populate the graphNodes array with initial empty data structures for each node.
for (let nodeIndex = 0; nodeIndex < totalNodes; nodeIndex++) {
    graphNodes[nodeIndex] = {
        outgoingEdges: [],          // Stores objects: { destinationNode: number, originalEdgeIndex: number }
        incomingEdgeCount: 0,       // Counter for edges directed towards this node
        usedColors: new Set(),      // A Set to efficiently track colors used by edges incident to this node
        lastColorAttempt: 0         // The last color number that was tried or successfully assigned for an edge from this node
    };
}

// This variable will store the maximum degree sum (out-degree + in-degree) encountered
// across all nodes. This value serves as an upper bound for the number of colors needed.
let maximumDegreeSum = 0;

// Process the remaining input lines, each representing an edge.
// There are (totalNodes - 1) edges for a tree or connected graph.
for (let edgeIndex = 0; edgeIndex < totalNodes - 1; edgeIndex++) {
    const currentEdgeLine = inputLines[edgeIndex];

    // Skip processing if the line is empty or malformed, though competitive programming
    // usually guarantees valid input.
    if (!currentEdgeLine || currentEdgeLine.trim() === '') {
        continue;
    }

    // Parse the two node indices from the current line, converting them to numbers.
    // Adjust to 0-indexed for array access.
    const edgeEndpoints = currentEdgeLine.split(' ').map(Number);
    const firstNodeIdx = edgeEndpoints[0] - 1;
    const secondNodeIdx = edgeEndpoints[1] - 1;

    // Add this edge to the list of outgoing edges for the first node.
    // We store the destination node and the edge's original index.
    graphNodes[firstNodeIdx].outgoingEdges.push({
        destinationNode: secondNodeIdx,
        originalEdgeIndex: edgeIndex
    });

    // Increment the count of incoming edges for the second node.
    graphNodes[secondNodeIdx].incomingEdgeCount++;

    // Calculate the current degree sum (out-degree + in-degree) for both nodes involved in the edge.
    // Update the overall maximumDegreeSum if either node's degree sum is higher.
    const currentDegreeSumFirstNode = graphNodes[firstNodeIdx].outgoingEdges.length + graphNodes[firstNodeIdx].incomingEdgeCount;
    const currentDegreeSumSecondNode = graphNodes[secondNodeIdx].outgoingEdges.length + graphNodes[secondNodeIdx].incomingEdgeCount;

    maximumDegreeSum = Math.max(maximumDegreeSum, currentDegreeSumFirstNode, currentDegreeSumSecondNode);
}

// An array to store the final assigned color for each edge, indexed by its original input order.
const assignedEdgeColors = new Array(totalNodes - 1);

/**
 * Helper function to find the smallest available color for a given node.
 * It tries to find a color starting from the node's last attempted color + 1 up to the maximum limit.
 * If no color is found in that range, it wraps around and searches from 1.
 * @param {object} nodeData - The data object for the current node (e.g., graphNodes[i]).
 * @param {number} maxColorLimit - The maximum color value allowed (inclusive).
 * @returns {number} The smallest available color, or -1 if none found (should not happen with correct limits).
 */
const findSmallestAvailableColor = (nodeData, maxColorLimit) => {
    // First, try to find a color by incrementing from the last color used/attempted.
    for (let colorCandidate = nodeData.lastColorAttempt + 1; colorCandidate <= maxColorLimit; colorCandidate++) {
        if (!nodeData.usedColors.has(colorCandidate)) {
            return colorCandidate;
        }
    }
    // If no color was found in the incremented range, wrap around and search from 1.
    for (let colorCandidate = 1; colorCandidate <= maxColorLimit; colorCandidate++) {
        if (!nodeData.usedColors.has(colorCandidate)) {
            return colorCandidate;
        }
    }
    // This case indicates an issue with the maximumColorLimit or graph properties.
    return -1;
};

// Main edge coloring algorithm.
// Iterate through each node in the graph.
for (let currentNodeIndex = 0; currentNodeIndex < totalNodes; currentNodeIndex++) {
    const sourceNodeData = graphNodes[currentNodeIndex];

    // For each node, iterate through its list of outgoing edges.
    for (const edgeInfo of sourceNodeData.outgoingEdges) {
        const destinationNodeIndex = edgeInfo.destinationNode;
        const originalEdgeInputIndex = edgeInfo.originalEdgeIndex;
        const destinationNodeData = graphNodes[destinationNodeIndex];

        // Find the smallest available color that hasn't been used by any edge incident to sourceNodeData.
        const selectedColor = findSmallestAvailableColor(sourceNodeData, maximumDegreeSum);

        // Assign the selected color to the current edge.
        // Mark this color as used for both the source and destination nodes.
        sourceNodeData.usedColors.add(selectedColor);
        destinationNodeData.usedColors.add(selectedColor);

        // Update the last attempted color for both nodes. This heuristic helps in finding
        // colors quickly in subsequent iterations.
        sourceNodeData.lastColorAttempt = selectedColor;
        destinationNodeData.lastColorAttempt = selectedColor;

        // Store the assigned color in the final result array at its original input index.
        assignedEdgeColors[originalEdgeInputIndex] = selectedColor;
    }
}

// Output the maximum degree sum, which represents the maximum number of colors potentially needed.
console.log(maximumDegreeSum);
// Output the assigned colors for each edge, each on a new line.
console.log(assignedEdgeColors.join('\n'));