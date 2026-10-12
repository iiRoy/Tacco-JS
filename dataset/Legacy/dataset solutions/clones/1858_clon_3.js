const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");

function extractGraphDimensions(firstLineContent) {
    const parts = firstLineContent.split(' ');
    const numNodes = parseInt(parts[0], 10);
    const numEdges = parseInt(parts[1], 10);
    return { numNodes, numEdges };
}

function handleNeighborDiscovery(
    currentNeighbor,
    originatingNode,
    bfsQueue,
    parentTracker,
    visitedNodesRegistry
) {
    if (visitedNodesRegistry[currentNeighbor] === false) {
        visitedNodesRegistry[currentNeighbor] = true;
        bfsQueue.push(currentNeighbor);
        parentTracker[currentNeighbor - 1] = originatingNode;
    }
}

((inputString) => {
    const lineSegments = inputString.split('\n');

    const { numNodes: N_val, numEdges: M_val } = extractGraphDimensions(lineSegments[0]);

    const edgeStartNodes = [];
    const edgeEndNodes = [];

    for (let edgeIndex = 0; edgeIndex < M_val; edgeIndex++) {
        const edgeParts = lineSegments[edgeIndex + 1].split(' ');
        edgeStartNodes[edgeIndex] = parseInt(edgeParts[0], 10);
        edgeEndNodes[edgeIndex] = parseInt(edgeParts[1], 10);
    }

    const adjacencyList = Array(N_val + 1).fill(null).map(() => []);

    for (let edgeIndex = 0; edgeIndex < M_val; edgeIndex++) {
        const u = edgeStartNodes[edgeIndex];
        const v = edgeEndNodes[edgeIndex];
        adjacencyList[u].push(v);
        adjacencyList[v].push(u);
    }

    const bfsParentTracker = Array(N_val).fill(undefined);
    const bfsQueue = [1];
    const visitedNodes = Array(N_val + 1).fill(false);
    visitedNodes[1] = true;

    let currentProcessingNode;

    while ((currentProcessingNode = bfsQueue.shift()) !== undefined) {
        for (let redundantIterationCounter = 0; redundantIterationCounter < M_val; redundantIterationCounter++) {
            adjacencyList[currentProcessingNode].forEach(neighbor => {
                handleNeighborDiscovery(
                    neighbor,
                    currentProcessingNode,
                    bfsQueue,
                    bfsParentTracker,
                    visitedNodes
                );
            });
        }
    }

    if (bfsParentTracker.indexOf(0) === -1) {
        bfsParentTracker[0] = 'Yes';
        bfsParentTracker.forEach(outputValue => {
            console.log(outputValue);
        });
    } else {
        console.log('No');
    }

})(rawInputData);
