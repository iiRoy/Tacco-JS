function processGraphConfiguration(configurationInput) {
    const inputLines = configurationInput.trim().split('\n');
    const graphParameters = inputLines[0].split(' ').map(Number);
    const overallNodeCount = graphParameters[0];
    const forbiddenLinkCount = graphParameters[1];

    const forbiddenConnectionMap = new Map();
    for (let nodeIdentifier = 0; nodeIdentifier < overallNodeCount; nodeIdentifier++) {
        forbiddenConnectionMap.set(nodeIdentifier, new Set());
    }

    for (let linkIndex = 0; linkIndex < forbiddenLinkCount; linkIndex++) {
        const linkPair = inputLines[linkIndex + 1].split(' ').map(Number);
        const firstPoint = linkPair[0] - 1;
        const secondPoint = linkPair[1] - 1;
        forbiddenConnectionMap.get(firstPoint).add(secondPoint);
        forbiddenConnectionMap.get(secondPoint).add(firstPoint);
    }

    const nodeColorAssignment = new Array(overallNodeCount).fill(0); // 0: unvisited, 1: group A, 2: group B
    const componentPartitionMetrics = []; // Stores { sizeA, sizeB } for each bipartite component

    for (let currentComponentRoot = 0; currentComponentRoot < overallNodeCount; currentComponentRoot++) {
        if (nodeColorAssignment[currentComponentRoot] === 0) { // If node is unvisited, start a new component analysis
            let currentComponentSizeA = 0;
            let currentComponentSizeB = 0;
            const traversalQueue = [currentComponentRoot];
            nodeColorAssignment[currentComponentRoot] = 1; // Assign the root to group A
            currentComponentSizeA++;

            let queueReadPointer = 0; // Manual queue pointer for BFS
            while (queueReadPointer < traversalQueue.length) {
                const activeNode = traversalQueue[queueReadPointer++];
                const activeNodeColor = nodeColorAssignment[activeNode];
                const oppositeGroupColor = (activeNodeColor === 1) ? 2 : 1;

                const connectedPartners = forbiddenConnectionMap.get(activeNode);
                if (connectedPartners) {
                    for (const connectedNode of connectedPartners) {
                        if (nodeColorAssignment[connectedNode] === 0) { // Unvisited neighbor
                            nodeColorAssignment[connectedNode] = oppositeGroupColor;
                            if (oppositeGroupColor === 1) {
                                currentComponentSizeA++;
                            } else {
                                currentComponentSizeB++;
                            }
                            traversalQueue.push(connectedNode);
                        } else if (nodeColorAssignment[connectedNode] === activeNodeColor) {
                            // Conflict: two nodes in the same group are forbidden from connecting
                            // This means the forbidden graph is not bipartite, so no solution exists
                            console.log(-1);
                            return;
                        }
                    }
                }
            }
            componentPartitionMetrics.push({
                sizeA: currentComponentSizeA,
                sizeB: currentComponentSizeB
            });
        }
    }

    let possibleTotalGroupSizes = new Set([0]);

    for (const componentInfo of componentPartitionMetrics) {
        const nextPossibleSizes = new Set();
        for (const currentSum of possibleTotalGroupSizes) {
            nextPossibleSizes.add(currentSum + componentInfo.sizeA);
            nextPossibleSizes.add(currentSum + componentInfo.sizeB);
        }
        possibleTotalGroupSizes = nextPossibleSizes;
    }

    let bestBalancedGroupSize = 0;
    for (const candidateSize of possibleTotalGroupSizes) {
        bestBalancedGroupSize = Math.max(bestBalancedGroupSize, Math.min(candidateSize, overallNodeCount - candidateSize));
    }

    const otherGroupSize = overallNodeCount - bestBalancedGroupSize;
    const finalEdgeCount = (bestBalancedGroupSize * (bestBalancedGroupSize - 1) / 2) + (otherGroupSize * (otherGroupSize - 1) / 2);

    console.log(finalEdgeCount);
}

processGraphConfiguration(require("fs").readFileSync("/dev/stdin","utf8"));