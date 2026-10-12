let graphAdj = [];
let numVertices, numEdges;
let visitedNodes;

function initializeGraph(vertexCount) {
    const newGraph = new Array(vertexCount);
    for (let k = 0; k < vertexCount; ++k) {
        newGraph[k] = [];
    }
    return newGraph;
}

function addFlowEdge(sourceNode, targetNode, capacity) {
    const targetNodeRevIdx = graphAdj[targetNode].length;
    const sourceNodeRevIdx = graphAdj[sourceNode].length;

    graphAdj[sourceNode].push({
        target: targetNode,
        flowCapacity: capacity,
        reverseEdgeIndex: targetNodeRevIdx
    });

    graphAdj[targetNode].push({
        target: sourceNode,
        flowCapacity: 0,
        reverseEdgeIndex: sourceNodeRevIdx
    });
}

function findAugmentingPath(currentNode, sinkNode, currentFlowLimit) {
    if (currentNode === sinkNode) {
        return currentFlowLimit;
    }

    visitedNodes[currentNode] = true;

    for (const currentEdge of graphAdj[currentNode]) {
        if (visitedNodes[currentEdge.target] || currentEdge.flowCapacity <= 0) {
            continue;
        }

        const potentialFlow = Math.min(currentFlowLimit, currentEdge.flowCapacity);
        const residualFlow = findAugmentingPath(currentEdge.target, sinkNode, potentialFlow);

        if (residualFlow > 0) {
            currentEdge.flowCapacity -= residualFlow;
            graphAdj[currentEdge.target][currentEdge.reverseEdgeIndex].flowCapacity += residualFlow;
            return residualFlow;
        }
    }

    return 0;
}

function calculateMaxFlow(sourceVertex, sinkVertex) {
    let totalFlow = 0;
    const infiniteCapacity = Number.POSITIVE_INFINITY;

    while (true) {
        visitedNodes = new Array(numVertices).fill(false);

        const currentAugmentingFlow = findAugmentingPath(sourceVertex, sinkVertex, infiniteCapacity);

        totalFlow += currentAugmentingFlow;

        if (currentAugmentingFlow === 0) {
            break;
        }
    }

    return totalFlow;
}

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(inputData) {
    const inputLines = inputData.split('\n');
    const effectiveLineCount = inputLines.length - 1;

    if (effectiveLineCount <= 0) {
        return;
    }

    const vertexEdgeCounts = inputLines[0].split(' ').map(Number);
    numVertices = vertexEdgeCounts[0];
    numEdges = vertexEdgeCounts[1];

    graphAdj = initializeGraph(numVertices);

    for (let lineIdx = 1; lineIdx < effectiveLineCount; ++lineIdx) {
        const edgeDetails = inputLines[lineIdx].split(' ').map(Number);

        if (edgeDetails.length === 3) {
            addFlowEdge(edgeDetails[0], edgeDetails[1], edgeDetails[2]);
        }
    }

    console.log(calculateMaxFlow(0, numVertices - 1));
});
