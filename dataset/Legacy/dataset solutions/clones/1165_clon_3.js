let graphAdj = [];
let numVertices, numEdges;
let visitedNodes;

function initializeAdjacencyList(vertexCount) {
    graphAdj = new Array(vertexCount).fill(null).map(() => []);
}

function addFlowEdge(sourceNode, targetNode, capacity) {
    const targetReverseIndex = graphAdj[sourceNode].length;
    const sourceReverseIndex = graphAdj[targetNode].length;

    graphAdj[sourceNode].push({ to: targetNode, cap: capacity, rev: sourceReverseIndex });
    graphAdj[targetNode].push({ to: sourceNode, cap: 0, rev: targetReverseIndex });
}

function depthFirstSearch(currentNode, sinkNode, currentPathFlow) {
    if (currentNode === sinkNode) {
        return currentPathFlow;
    }

    visitedNodes[currentNode] = true;

    for (const edgeData of graphAdj[currentNode]) {
        if (visitedNodes[edgeData.to] || edgeData.cap <= 0) {
            continue;
        }

        const potentialFlow = Math.min(currentPathFlow, edgeData.cap);
        const foundFlow = depthFirstSearch(edgeData.to, sinkNode, potentialFlow);

        if (foundFlow > 0) {
            edgeData.cap -= foundFlow;
            graphAdj[edgeData.to][edgeData.rev].cap += foundFlow;
            return foundFlow;
        }
    }

    return 0;
}

function calculateMaxFlow(startNode, sinkNode) {
    let totalMaxFlow = 0;
    let augmentingFlow;

    do {
        visitedNodes = new Array(numVertices).fill(false);
        augmentingFlow = depthFirstSearch(startNode, sinkNode, Number.POSITIVE_INFINITY);
        totalMaxFlow += augmentingFlow;
    } while (augmentingFlow > 0);

    return totalMaxFlow;
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(rawData) {
    const inputLines = rawData.trim().split('\n');

    const firstLineParts = inputLines[0].split(' ').map(Number);
    numVertices = firstLineParts[0];
    numEdges = firstLineParts[1];

    initializeAdjacencyList(numVertices);

    for (let lineIndex = 1; lineIndex < inputLines.length; ++lineIndex) {
        const edgeDataParts = inputLines[lineIndex].split(' ').map(Number);
        addFlowEdge(edgeDataParts[0], edgeDataParts[1], edgeDataParts[2]);
    }

    console.log(calculateMaxFlow(0, numVertices - 1));
});
