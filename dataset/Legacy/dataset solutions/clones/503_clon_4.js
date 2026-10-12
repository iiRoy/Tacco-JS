const getLines = (function* () {
    const rawInput = require('fs').readFileSync('/dev/stdin', 'utf8');
    const lines = rawInput.trim().split('\n');
    let index = 0;
    while (index < lines.length) {
        yield lines[index++];
    }
})();

function fetchNextInputLine() {
    return getLines.next().value;
}

while (true) {
    const [nodeQuantity, edgeQuantity] = fetchNextInputLine().split(' ').map(Number);
    if (nodeQuantity === 0 && edgeQuantity === 0) break;

    const initialNode = 1;
    const finalNode = nodeQuantity;
    const stateDimension = 3; // Corresponds to states 0, 1, 2

    const adjacencyList = new Map();
    for (let i = 1; i <= nodeQuantity; i++) {
        adjacencyList.set(i, []);
    }

    for (let i = 0; i < edgeQuantity; i++) {
        const [origin, destination, cost] = fetchNextInputLine().split(' ').map(Number);
        adjacencyList.get(origin).push({ neighbor: destination, edgeCost: cost });
        adjacencyList.get(destination).push({ neighbor: origin, edgeCost: cost }); // Undirected graph
    }

    const minimumCosts = new Map();
    for (let i = 1; i <= nodeQuantity; i++) {
        minimumCosts.set(i, Array(stateDimension).fill(Infinity));
    }
    minimumCosts.get(initialNode)[0] = 0;

    const traversalQueue = [initialNode];
    const visitedTracker = new Set(); // Tracks nodes that have been dequeued and processed

    let queueHead = 0;

    const applyRelaxation = (sourceIdentifier, targetIdentifier, weightValue) => {
        const sourceStateCosts = minimumCosts.get(sourceIdentifier);
        const targetStateCosts = minimumCosts.get(targetIdentifier);
        let updated = false;

        // Transition from state 0 of sourceIdentifier
        const sourceCostState0 = sourceStateCosts[0];
        if (sourceCostState0 !== Infinity) {
            // Update targetIdentifier state 0 (no reuse)
            if (targetStateCosts[0] > sourceCostState0 + weightValue) {
                targetStateCosts[0] = sourceCostState0 + weightValue;
                updated = true;
            }
            // Update targetIdentifier state 1 (first traversal of a reused edge)
            if (targetStateCosts[1] > sourceCostState0) {
                targetStateCosts[1] = sourceCostState0;
                updated = true;
            }
        }

        // Transition from state 1 of sourceIdentifier
        const sourceCostState1 = sourceStateCosts[1];
        if (sourceCostState1 !== Infinity) {
            // Update targetIdentifier state 2 (one reuse, last edge not reused)
            if (targetStateCosts[2] > sourceCostState1) {
                targetStateCosts[2] = sourceCostState1;
                updated = true;
            }
        }

        // Transition from state 2 of sourceIdentifier
        const sourceCostState2 = sourceStateCosts[2];
        if (sourceCostState2 !== Infinity) {
            // Update targetIdentifier state 2
            if (targetStateCosts[2] > sourceCostState2 + weightValue) {
                targetStateCosts[2] = sourceCostState2 + weightValue;
                updated = true;
            }
        }
        return updated;
    };

    while (queueHead < traversalQueue.length) {
        const currentIdentifier = traversalQueue[queueHead++];

        // Replicate original's 'obj' behavior: process a node only once
        if (visitedTracker.has(currentIdentifier)) {
            continue;
        }
        visitedTracker.add(currentIdentifier);

        // Iterate through neighbors and apply relaxation rules
        for (const { neighbor: adjacentIdentifier, edgeCost: currentEdgeCost } of adjacencyList.get(currentIdentifier)) {
            applyRelaxation(currentIdentifier, adjacentIdentifier, currentEdgeCost);
            // Original code unconditionally pushes neighbors to the queue
            traversalQueue.push(adjacentIdentifier);
        }
    }

    let resultPathCost = Infinity;
    const destinationCosts = minimumCosts.get(finalNode);
    // Original code excludes state 1 from final answer
    resultPathCost = Math.min(destinationCosts[0], destinationCosts[2]);

    console.log(resultPathCost);
}
