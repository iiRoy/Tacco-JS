const STDIN_PATH = '/dev/stdin';
const INITIAL_MIN_TRAVEL_TIME = Infinity;

// Helper function to parse the initial parameters from the first line of input
function parseInitialParameters(lineData) {
    const parts = lineData.split(' ');
    return {
        numNodes: Number(parts[0]),
        numEdges: Number(parts[1]),
        initialHeight: Number(parts[2])
    };
}

// Helper function to create a standardized edge object for the adjacency list
function createGraphEdge(targetNodeIndex, travelTime) {
    return {
        targetNode: targetNodeIndex,
        travelTime: travelTime
    };
}

// Helper function to calculate the new time and height for a state transition
function determineNextState(currentState, edgeDetails, nextNodeHeightValue) {
    const currentWaterHeight = currentState.currentHeight;
    const edgeDuration = edgeDetails.travelTime;

    let calculatedTime, calculatedHeight;

    // Case 1: Enough water to reach next node and fill it to its height
    if (nextNodeHeightValue + edgeDuration < currentWaterHeight) {
        calculatedTime = currentState.elapsedTime + edgeDuration + currentWaterHeight - (nextNodeHeightValue + edgeDuration);
        calculatedHeight = nextNodeHeightValue;
    }
    // Case 2: Enough water to reach next node, but not enough to fill it to its height,
    // and current height is at least the edge duration
    else if (nextNodeHeightValue + edgeDuration >= currentWaterHeight && currentWaterHeight >= edgeDuration) {
        calculatedTime = currentState.elapsedTime + edgeDuration;
        calculatedHeight = currentWaterHeight - edgeDuration;
    }
    // Case 3: Not enough water to reach next node, height becomes 0
    else {
        calculatedTime = currentState.elapsedTime + edgeDuration + edgeDuration - currentWaterHeight;
        calculatedHeight = 0;
    }
    return { calculatedTime, calculatedHeight };
}

const rawData = require('fs').readFileSync(STDIN_PATH, 'utf8');
const inputLines = rawData.split('\n');

const params = parseInitialParameters(inputLines[0]);
const numNodes = params.numNodes;
const numEdges = params.numEdges;
const initialHeight = params.initialHeight;

const nodeHeights = new Array(numNodes);
// Initialize adjacency list with empty arrays for each node
const adjacencyList = new Array(numNodes).fill(null).map(() => []);

// Populate node heights from input lines
for (let i = 0; i < numNodes; i++) {
    nodeHeights[i] = Number(inputLines[i + 1]);
}

// Build the adjacency list for the graph
for (let i = 0; i < numEdges; i++) {
    const edgeLineParts = inputLines[i + numNodes + 1].split(' ');
    const nodeA_idx = Number(edgeLineParts[0]) - 1; // Adjust to 0-indexed
    const nodeB_idx = Number(edgeLineParts[1]) - 1; // Adjust to 0-indexed
    const edgeDuration = Number(edgeLineParts[2]);

    // Add edges for both directions (undirected graph)
    adjacencyList[nodeA_idx].push(createGraphEdge(nodeB_idx, edgeDuration));
    adjacencyList[nodeB_idx].push(createGraphEdge(nodeA_idx, edgeDuration));
}

const processingStack = [];
// Push the initial state onto the stack
processingStack.push({
    currentPosition: 0,
    elapsedTime: 0,
    currentHeight: initialHeight,
    visitedPath: [0] // Keep track of visited nodes in the current path
});

let minimumTravelTime = INITIAL_MIN_TRAVEL_TIME;
const targetNodeIdentifier = numNodes - 1; // The target node is the last one (N-1)

// Main graph traversal loop (Dijkstra-like with custom state)
while (processingStack.length > 0) {
    const currentState = processingStack.pop();

    // Optimization: If current path's time already exceeds the best known, skip
    if (currentState.elapsedTime >= minimumTravelTime) {
        continue;
    }

    // Explore all neighbors of the current node
    for (const edge of adjacencyList[currentState.currentPosition]) {
        const nextNodeIdentifier = edge.targetNode;

        // Skip if the next node has already been visited in this specific path to avoid cycles
        if (currentState.visitedPath.includes(nextNodeIdentifier)) {
            continue;
        }

        // Guard clause: Check if current node has enough water height to traverse this edge
        if (nodeHeights[currentState.currentPosition] < edge.travelTime) {
            continue;
        }

        // Calculate the new state (time and height) for the next node
        const newPathHistory = currentState.visitedPath.concat(nextNodeIdentifier);
        const { calculatedTime, calculatedHeight } = determineNextState(
            currentState,
            edge,
            nodeHeights[nextNodeIdentifier]
        );

        // Create the new state object and push it to the stack
        const newState = {
            currentPosition: nextNodeIdentifier,
            elapsedTime: calculatedTime,
            currentHeight: calculatedHeight,
            visitedPath: newPathHistory
        };
        processingStack.push(newState);

        // If the target node is reached, update the minimum travel time
        if (nextNodeIdentifier === targetNodeIdentifier) {
            // The original logic immediately pops the just-pushed state for the target node
            const finalStateCandidate = processingStack.pop();
            minimumTravelTime = Math.min(
                minimumTravelTime,
                finalStateCandidate.elapsedTime + nodeHeights[targetNodeIdentifier] - finalStateCandidate.currentHeight
            );
        }
    }

    // Sort the stack to process states with smaller elapsed time first (descending order for pop)
    processingStack.sort((stateA, stateB) => stateB.elapsedTime - stateA.elapsedTime);
}

// Output the result
if (minimumTravelTime === INITIAL_MIN_TRAVEL_TIME) {
    console.log(-1);
} else {
    console.log(minimumTravelTime);
}
