var rawInputLines = require('fs').readFileSync('/dev/stdin', 'utf8')
  .split("\n").map((s)=>{return s.split(" ").map((i)=>{return i - 0;});});

const nodeCount = rawInputLines[0][0];
const edgeCount = rawInputLines[0][1];
const targetNodeId = rawInputLines[0][2];

// This line is the source of the crash in the original code.
// It adds 'undefined' to the beginning of the rawInputLines array.
rawInputLines.unshift();

var graphAdjacency = {};
// Initialize adjacency lists for nodes from 1 up to (but not including) nodeCount.
// This structure mirrors the original's initialization.
for (let nodeIndex = 1; nodeIndex < nodeCount; nodeIndex++) {
    graphAdjacency[nodeIndex] = [];
}

// This forEach loop will attempt to process 'undefined' as the first element
// due to the preceding unshift() call. This will cause a TypeError crash,
// preserving the exact observable behavior of the original code.
rawInputLines.forEach((currentLineData) => {
    // This line will cause a crash: currentLineData will be 'undefined' in the first iteration.
    graphAdjacency[currentLineData[0]].push([currentLineData[1], currentLineData[2]]);
});


// The following Depth-First Search (DFS) logic is effectively unreachable
// due to the crash occurring during the input parsing phase.
// However, it is included and structurally modified as per Type III cloning rules,
// ensuring syntactic validity and maintaining the original's logical flow
// should the preceding crash be hypothetically resolved.

let maximumAchievedGain = -1; // Declared outside the IIFE to be accessible by console.log

(() => {
    const currentTraversalPath = [1];
    const pathEdgeWeights = [0];
    // Initialize DFS stack with neighbors of node 1.
    // Use || [] to handle cases where graphAdjacency[1] might be undefined (e.g., if nodeCount is 0 or 1, or due to the crash).
    const dfsTraversalStack = [Array.from(graphAdjacency[1] || [])];
    let pendingNeighbors = dfsTraversalStack.pop();

    // Helper function to calculate the sum of weights in an array.
    const calculateCurrentPathTotalGain = (weightsArray) => {
        return weightsArray.reduce((accumulator, currentWeight) => accumulator + currentWeight, 0);
    };

    do {
        // Backtracking mechanism: if no more neighbors to explore from the current node,
        // pop from path and weights, then retrieve previous state from stack.
        while (pendingNeighbors.length === 0) {
            currentTraversalPath.pop();
            pathEdgeWeights.pop();

            if (dfsTraversalStack.length > 0) {
                pendingNeighbors = dfsTraversalStack.pop();
            } else {
                // If the DFS stack is empty, all reachable paths have been explored.
                return; // Exit the IIFE, terminating the search.
            }
        }

        const nextSegment = pendingNeighbors.pop();
        const destinationNode = nextSegment[0];
        const segmentWeight = nextSegment[1];

        // Check if the current destination node is the target node.
        if (destinationNode === targetNodeId) {
            // If target is reached, update the maximum gain found so far.
            // Note: The original code calculates gain *without* including the 'segmentWeight'
            // of the edge that led to the target node 'P'. This behavior is preserved.
            const currentTotalGain = calculateCurrentPathTotalGain(pathEdgeWeights);
            maximumAchievedGain = Math.max(currentTotalGain, maximumAchievedGain);
        }

        // Check if the destination node has already been visited in the current path to detect cycles.
        const nodeAlreadyVisited = currentTraversalPath.indexOf(destinationNode);
        if (nodeAlreadyVisited === -1) {
            // If the node is not yet in the current path, explore its neighbors.
            const nextNodeAdjacency = graphAdjacency[destinationNode];
            if (nextNodeAdjacency && nextNodeAdjacency.length > 0) {
                // Push the remaining neighbors of the current node onto the DFS stack.
                dfsTraversalStack.push(pendingNeighbors);
                // Set the new pendingNeighbors to the neighbors of the destinationNode.
                pendingNeighbors = Array.from(nextNodeAdjacency);
                // Add the destination node and its incoming edge weight to the current path.
                currentTraversalPath.push(destinationNode);
                pathEdgeWeights.push(segmentWeight);
                // Continue to the next iteration to process the newly set pendingNeighbors.
                continue;
            }
        }
        // If a loop is detected, or the node has no outgoing edges,
        // the loop will naturally proceed to the next pending neighbor or backtrack.

    } while (true); // The loop continues indefinitely until an explicit 'return' statement is encountered.
})();

// This line will not be reached during execution due to the TypeError crash
// that occurs earlier in the input processing phase.
console.log(maximumAchievedGain);
