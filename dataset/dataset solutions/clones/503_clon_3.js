const fileSystem = require('fs');

const rawInputData = fileSystem.readFileSync('/dev/stdin', 'utf8');

let inputLineBuffer = rawInputData.trim().split('\n');

while (true) {
    const graphDimensions = inputLineBuffer.shift().split(' ').map(Number);

    if (graphDimensions[0] === 0 && graphDimensions[1] === 0) {
        break;
    }

    const numVertices = graphDimensions[0];
    const numEdges = graphDimensions[1];

    const entryPointNode = 1;
    const finalDestinationNode = numVertices;

    const adjacencyList = new Map();
    for (let vertexId = 1; vertexId <= numVertices; vertexId++) {
        adjacencyList.set(vertexId, []);
    }

    for (let edgeIndex = 0; edgeIndex < numEdges; edgeIndex++) {
        const [nodeU, nodeV, traversalCost] = inputLineBuffer.shift().split(' ').map(Number);
        adjacencyList.get(nodeU).push({ neighbor: nodeV, cost: traversalCost });
        adjacencyList.get(nodeV).push({ neighbor: nodeU, cost: traversalCost });
    }

    const maxPathStates = 3; // Corresponds to states 0, 1, 2.
    const stateCosts = Array.from({ length: numVertices + 1 }, () =>
        Array(maxPathStates).fill(Infinity)
    );

    stateCosts[entryPointNode][0] = 0;

    const processingQueue = [entryPointNode];
    const fullyProcessedNodes = new Set(); // To mark nodes whose neighbors have been propagated

    while (processingQueue.length > 0) {
        const currentNodeIdentifier = processingQueue.shift();

        if (fullyProcessedNodes.has(currentNodeIdentifier)) {
            continue;
        }
        fullyProcessedNodes.add(currentNodeIdentifier);

        const connectedNeighbors = adjacencyList.get(currentNodeIdentifier);

        if (!connectedNeighbors || connectedNeighbors.length === 0) {
            continue;
        }

        for (const { neighbor: nextNodeIdentifier, cost: edgeTraversalCost } of connectedNeighbors) {
            for (let currentStateIdx = maxPathStates - 1; currentStateIdx >= 0; currentStateIdx--) {
                const currentPathCost = stateCosts[currentNodeIdentifier][currentStateIdx];

                if (currentPathCost === Infinity) {
                    continue;
                }

                let proposedNewCost;
                let targetStateIdx;

                if (currentStateIdx === 0) { // State 0: Normal Path
                    // Transition 1: Stay in Normal state (0)
                    proposedNewCost = currentPathCost + edgeTraversalCost;
                    targetStateIdx = 0;
                    if (proposedNewCost < stateCosts[nextNodeIdentifier][targetStateIdx]) {
                        stateCosts[nextNodeIdentifier][targetStateIdx] = proposedNewCost;
                        processingQueue.push(nextNodeIdentifier);
                    }

                    // Transition 2: Activate Special Condition (to state 1) - cost is free for this segment
                    proposedNewCost = currentPathCost; // No cost added for activation
                    targetStateIdx = 1;
                    if (proposedNewCost < stateCosts[nextNodeIdentifier][targetStateIdx]) {
                        stateCosts[nextNodeIdentifier][targetStateIdx] = proposedNewCost;
                        processingQueue.push(nextNodeIdentifier);
                    }
                } else if (currentStateIdx === 1) { // State 1: Special Condition Activated
                    // Transition 1: Consume Special Condition (to state 2) - cost is free for this segment
                    proposedNewCost = currentPathCost; // No cost added for consumption
                    targetStateIdx = 2;
                    if (proposedNewCost < stateCosts[nextNodeIdentifier][targetStateIdx]) {
                        stateCosts[nextNodeIdentifier][targetStateIdx] = proposedNewCost;
                        processingQueue.push(nextNodeIdentifier);
                    }
                } else if (currentStateIdx === 2) { // State 2: Special Condition Consumed
                    // Transition 1: Stay in Special Condition Consumed state (2)
                    proposedNewCost = currentPathCost + edgeTraversalCost;
                    targetStateIdx = 2;
                    if (proposedNewCost < stateCosts[nextNodeIdentifier][targetStateIdx]) {
                        stateCosts[nextNodeIdentifier][targetStateIdx] = proposedNewCost;
                        processingQueue.push(nextNodeIdentifier);
                    }
                }
            }
        }
    }

    let overallMinimumTraversalCost = Infinity;

    // Helper to streamline minimum cost updates.
    const evaluateAndSetMinCost = (currentCostCandidate) => {
        if (currentCostCandidate < overallMinimumTraversalCost) {
            overallMinimumTraversalCost = currentCostCandidate;
        }
    };

    // Check the costs to reach the final destination in valid end states.
    // State 1 is an intermediate state and not a valid final path.
    for (let stateIdx = 0; stateIdx < maxPathStates; stateIdx++) {
        if (stateIdx !== 1) { // Exclude state 1 from final result
            evaluateAndSetMinCost(stateCosts[finalDestinationNode][stateIdx]);
        }
    }

    console.log(overallMinimumTraversalCost);
}