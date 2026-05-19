function processGraphData(inputString) {
    const inputLines = inputString.split('\n');

    const [nodeCount, edgeCount] = inputLines[0].split(' ').map(Number);

    const targetNodes = inputLines[1].split(' ').map(Number);

    const graphEdges = [];
    for (let edgeIndex = 0; edgeIndex < edgeCount; edgeIndex++) {
        graphEdges.push(inputLines[edgeIndex + 2].split(' ').map(Number));
    }

    let reachableTargetCount = 0;

    const NODE_ID_OFFSET = 1;

    const findConnectedNeighbor = (currentNodeId, edgePair) => {
        const [nodeA, nodeB] = edgePair;
        if (nodeA === currentNodeId) {
            return nodeB;
        } else if (nodeB === currentNodeId) {
            return nodeA;
        }
        return null;
    };

    for (let startNodeZeroBasedIndex = 0; startNodeZeroBasedIndex < nodeCount; startNodeZeroBasedIndex++) {
        const initialTraversalNode = startNodeZeroBasedIndex + NODE_ID_OFFSET;
        const targetNodeForCurrentTraversal = targetNodes[startNodeZeroBasedIndex];

        const traversalQueue = [initialTraversalNode];
        const visitedNodesInTraversal = new Set();
        visitedNodesInTraversal.add(initialTraversalNode);

        let currentQueuePointer = 0;
        let targetWasReached = false;

        while (currentQueuePointer < traversalQueue.length) {
            const currentNodeBeingExplored = traversalQueue[currentQueuePointer++];

            if (currentNodeBeingExplored === targetNodeForCurrentTraversal) {
                reachableTargetCount++;
                targetWasReached = true;
                break;
            }

            for (let edgeIdx = 0; edgeIdx < edgeCount; edgeIdx++) {
                const currentEdge = graphEdges[edgeIdx];
                const neighborNode = findConnectedNeighbor(currentNodeBeingExplored, currentEdge);

                if (neighborNode !== null && !visitedNodesInTraversal.has(neighborNode)) {
                    visitedNodesInTraversal.add(neighborNode);
                    traversalQueue.push(neighborNode);
                }
            }
        }
    }

    console.log(reachableTargetCount);
}

processGraphData(require('fs').readFileSync('/dev/stdin', 'utf8'));
