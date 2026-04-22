const processGraphData = (inputString) => {
    const dataLines = inputString.trim().split('\n');
    const [numNodes, numEdges] = dataLines[0].split(' ').map(Number);

    const adjacentConnections = new Map();
    for (let i = 0; i < numNodes; i++) {
        adjacentConnections.set(i, new Set());
    }

    for (let j = 1; j < dataLines.length; j++) {
        const lineContent = dataLines[j];
        const [nodeA, nodeB] = lineContent.split(' ').map(Number);
        adjacentConnections.get(nodeA - 1).add(nodeB - 1);
        adjacentConnections.get(nodeB - 1).add(nodeA - 1);
    }

    return {
        totalNodes: numNodes,
        graphStructure: adjacentConnections
    };
};

const findPathCombinations = (
    currentPoint,
    visitedPointsMask,
    graphRelations,
    totalPointsCount
) => {
    const allPointsVisitedGoal = (1 << totalPointsCount) - 1;
    if (visitedPointsMask === allPointsVisitedGoal) {
        return 1;
    }

    let pathAccumulator = 0;
    const connectedPoints = graphRelations.get(currentPoint) || new Set();

    for (const nextPoint of connectedPoints) {
        if ((visitedPointsMask & (1 << nextPoint)) === 0) {
            const nextVisitedState = visitedPointsMask | (1 << nextPoint);
            pathAccumulator += findPathCombinations(
                nextPoint,
                nextVisitedState,
                graphRelations,
                totalPointsCount
            );
        }
    }

    return pathAccumulator;
};

const orchestrateTraversal = (inputPayload) => {
    const { totalNodes, graphStructure } = processGraphData(inputPayload);

    const startingVisitedState = 1 << 0; // Only node 0 is visited initially

    const finalPathTally = findPathCombinations(
        0, // Start from node 0
        startingVisitedState,
        graphStructure,
        totalNodes
    );

    console.log(finalPathTally);
};

orchestrateTraversal(require('fs').readFileSync('/dev/stdin', 'utf8'));