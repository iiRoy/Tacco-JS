const createInputReader = function () {
    const fileSystemModule = require('fs');

    /**
     * Obtains the entire content from the standard input stream.
     * This implementation is designed for execution environments like Node.js
     * where '/dev/stdin' represents the standard input.
     * @returns {string} The full content read from stdin, decoded as UTF-8.
     */
    const acquireRawInput = function () {
        return fileSystemModule.readFileSync('/dev/stdin', 'utf8');
    };

    return acquireRawInput;
};

// Initialize the input acquisition mechanism.
// For this cloned version, we exclusively use the file system reader,
// omitting any debug-specific input mockups.
const obtainInputContent = createInputReader();
const rawInputLines = obtainInputContent().split('\n');

// Early exit if no meaningful input is provided.
if (rawInputLines.length === 0 || rawInputLines[0].trim() === '') {
    console.log('No');
    return;
}

// Parse the first line which contains the total number of nodes (N) and edges (M).
// The `shift()` method removes this line from the `rawInputLines` array.
const graphDimensions = rawInputLines.shift().split(' ').map(token => Number(token));

const totalNodes = graphDimensions[0]; // Corresponds to 'N' from the original code
const totalEdges = graphDimensions[1]; // Corresponds to 'M' from the original code

// Validate if the number of provided constraint lines matches the declared 'totalEdges'.
if (rawInputLines.length < totalEdges) {
    console.log('No'); // Insufficient data to form the graph.
    return;
}

// Convert the remaining input lines into an array of numerical constraint tuples.
// Each tuple [u, v, weight] signifies a directed difference: position[u] - position[v] = weight.
const currentRelationalConstraints = rawInputLines
    .slice(0, totalEdges) // Ensure we only process the declared number of edges.
    .map(line => line.split(' ').map(token => Number(token)));

/**
 * Performs a consistency check for a given edge against the set of existing edges.
 * This function encapsulates the core bipartite path validation logic.
 *
 * @param {Array<Array<number>>} existingEdges - The collection of edges already processed/remaining.
 * @param {number} checkPointA - The 'L' node of the edge currently being evaluated.
 * @param {number} checkPointB - The 'R' node of the edge currently being evaluated.
 * @param {number} expectedDifference - The 'D' value (weight) of the edge being evaluated.
 * @param {boolean} filterByStartNode - If true, look for existing edges where `checkPointA` is the start node ([checkPointA, X, W]).
 *                                      If false, look for existing edges where `checkPointA` is the end node ([X, checkPointA, W]).
 * @returns {boolean} Returns `true` if no inconsistencies are detected for this specific path check, `false` otherwise.
 */
const validatePathConsistency = (existingEdges, checkPointA, checkPointB, expectedDifference, filterByStartNode) => {
    // Identify intermediate edges that connect to `checkPointA` based on the specified direction.
    const connectingIntermediateEdges = filterByStartNode
        ? existingEdges.filter(edge => edge[0] === checkPointA)
        : existingEdges.filter(edge => edge[1] === checkPointA);

    // Iterate through each identified intermediate edge.
    for (const intermediaryEdge of connectingIntermediateEdges) {
        // `intermediaryEdge` represents a constraint like [Node1, Node2, Weight12].
        // `pathDifferenceAtoIntermediate` is the weight of this intermediary edge.
        // `intermediatePoint` is the node that connects to `checkPointB`.
        const intermediatePoint = filterByStartNode
            ? intermediaryEdge[1] // If `checkPointA` is start, then `intermediaryEdge` is [checkPointA, intermediatePoint, pathDifferenceAtoIntermediate]
            : intermediaryEdge[0]; // If `checkPointA` is end, then `intermediaryEdge` is [intermediatePoint, checkPointA, pathDifferenceAtoIntermediate]

        const pathDifferenceAtoIntermediate = intermediaryEdge[2];

        // Search for any existing edges that connect `intermediatePoint` to `checkPointB`.
        // These are potential 'closing' paths for a two-segment path.
        const conflictingPathSegments = existingEdges
            .filter(closingEdge =>
                (closingEdge[0] === intermediatePoint && closingEdge[1] === checkPointB) || // Path: intermediatePoint -> checkPointB
                (closingEdge[1] === intermediatePoint && closingEdge[0] === checkPointB)    // Path: checkPointB -> intermediatePoint
            )
            .filter(closingEdge => {
                // The core consistency condition: (pathA_to_Intermediate + pathIntermediate_to_B - pathA_to_B) should be zero.
                // If it's not zero, an inconsistency is found.
                // `closingEdge[2]` is the weight of the `closingEdge`.
                return (pathDifferenceAtoIntermediate + closingEdge[2] - expectedDifference) !== 0;
            });

        // If any such conflicting path segments are found, the graph is inconsistent.
        if (conflictingPathSegments.length > 0) {
            return false;
        }
    }
    return true; // All intermediate paths checked, no inconsistencies found for this direction.
};


let graphOverallConsistency = true; // Flag to track the consistency of the entire graph.

// Process each edge constraint. The original code uses `pop()`,
// which means constraints are processed in reverse order of their input.
for (let k = 0; k < totalEdges; k++) {
    // Optimization: If an inconsistency is already detected, stop further checks.
    if (!graphOverallConsistency) {
        break;
    }

    // Retrieve the next constraint from the end of the list.
    const edgeToEvaluate = currentRelationalConstraints.pop();

    // Defensive check against malformed or missing edge data, though unlikely given prior parsing.
    if (!edgeToEvaluate || edgeToEvaluate.length !== 3) {
        graphOverallConsistency = false;
        break;
    }

    const uNode = edgeToEvaluate[0]; // The 'L' node
    const vNode = edgeToEvaluate[1]; // The 'R' node
    const edgeWeight = edgeToEvaluate[2]; // The 'D' weight

    // First consistency check:
    // Treat `uNode` as a starting point for existing edges, looking for paths like uNode -> Intermediate -> vNode.
    if (!validatePathConsistency(currentRelationalConstraints, uNode, vNode, edgeWeight, true)) {
        graphOverallConsistency = false;
    }

    // If still consistent, proceed with the second check.
    // Second consistency check:
    // Treat `uNode` as an ending point for existing edges, looking for paths like Intermediate -> uNode -> vNode.
    if (graphOverallConsistency && !validatePathConsistency(currentRelationalConstraints, uNode, vNode, edgeWeight, false)) {
        graphOverallConsistency = false;
    }
}

// Output the final determination of graph consistency.
console.log(graphOverallConsistency ? 'Yes' : 'No');