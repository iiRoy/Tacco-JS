const fileSystem = require('fs');
const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');
const inputLines = rawInputData.trim().split("\n");

let currentLineIndex = 0;
const TERMINATION_SIGNAL_VALUE = 0;
const NODE_INITIAL_STATE_REACHABLE = true;
const NODE_STATE_MARKED_UNREACHABLE = false;
const ROOT_NODE_INDEX = 0;

// Helper function to parse a string line into an array of numbers
const parseNumericLine = (lineContent) => lineContent.split(" ").map(Number);

// Comparator function for sorting dependency records by their time component
const compareDependenciesByTime = (dependencyA, dependencyB) => dependencyA[0] - dependencyB[0];

while (true) {
    const currentCaseHeaderLine = inputLines[currentLineIndex];
    const [numberOfNodes, numberOfEdges] = parseNumericLine(currentCaseHeaderLine);
    currentLineIndex++;

    if (numberOfNodes === TERMINATION_SIGNAL_VALUE && numberOfEdges === TERMINATION_SIGNAL_VALUE) {
        break;
    }

    // Initialize an array to track the reachability status of each node.
    // All nodes are initially considered reachable, except for the root node.
    const nodeReachabilityStatus = Array(numberOfNodes).fill(NODE_INITIAL_STATE_REACHABLE);
    nodeReachabilityStatus[ROOT_NODE_INDEX] = NODE_STATE_MARKED_UNREACHABLE;

    // Collect all dependency records for the current test case
    const allDependencyRecords = [];
    for (let edgeIterator = 0; edgeIterator < numberOfEdges; edgeIterator++) {
        const edgeDefinitionString = inputLines[currentLineIndex];
        const edgeNumericComponents = parseNumericLine(edgeDefinitionString);
        currentLineIndex++;
        const eventTimestamp = edgeNumericComponents[0];
        const sourceNodeIdentifier = edgeNumericComponents[1] - 1; // Convert to 0-based index
        const destinationNodeIdentifier = edgeNumericComponents[2] - 1; // Convert to 0-based index
        allDependencyRecords.push([eventTimestamp, sourceNodeIdentifier, destinationNodeIdentifier]);
    }

    // Sort the collected dependency records chronologically by their event timestamp
    allDependencyRecords.sort(compareDependenciesByTime);

    // Process each dependency in sorted order to update node reachability
    for (const dependencyEntry of allDependencyRecords) {
        const sourceNode = dependencyEntry[1];
        const destinationNode = dependencyEntry[2];

        // If the source node is already marked as unreachable, then the destination node also becomes unreachable.
        const isSourceNodeCurrentlyUnreachable = (nodeReachabilityStatus[sourceNode] === NODE_STATE_MARKED_UNREACHABLE);
        if (isSourceNodeCurrentlyUnreachable) {
            nodeReachabilityStatus[destinationNode] = NODE_STATE_MARKED_UNREACHABLE;
        }
    }

    // Count the total number of nodes that have been marked as unreachable
    const totalMarkedUnreachableNodes = nodeReachabilityStatus.reduce((unreachableCount, nodeFlag) => {
        if (nodeFlag === NODE_STATE_MARKED_UNREACHABLE) {
            return unreachableCount + 1;
        }
        return unreachableCount;
    }, 0);

    console.log(totalMarkedUnreachableNodes);
}
