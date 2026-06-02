let flowNetwork = [];
let nodeCount, edgeCount;

process.stdin.resume();
process.stdin.setEncoding('utf8');

let inputBuffer = '';

process.stdin.on('data', function(chunk) {
    inputBuffer += chunk;
});

process.stdin.on('end', function() {
    const inputLines = inputBuffer.split('\n');
    let currentLineIndex = 0;

    const dimensionsLine = inputLines[currentLineIndex++].split(' ').map(Number);
    nodeCount = dimensionsLine[0];
    edgeCount = dimensionsLine[1];

    Array.from({ length: nodeCount }).forEach((_, idx) => {
        flowNetwork[idx] = [];
    });

    while (currentLineIndex < inputLines.length && inputLines[currentLineIndex].trim() !== '') {
        const edgeData = inputLines[currentLineIndex++].split(' ').map(Number);
        if (edgeData.length === 3) {
            establishConnection(edgeData[0], edgeData[1], edgeData[2]);
        }
    }

    console.log(determineMaxFlow(0, nodeCount - 1));
});

function establishConnection(originNode, destinationNode, capacityValue) {
    flowNetwork[originNode].push({ targetNode: destinationNode, currentCapacity: capacityValue, reverseEdgeIndex: flowNetwork[destinationNode].length });
    flowNetwork[destinationNode].push({ targetNode: originNode, currentCapacity: 0, reverseEdgeIndex: flowNetwork[originNode].length - 1 });
}

function determineMaxFlow(sourceNode, sinkNode) {
    let totalNetworkFlow = 0;

    while (true) {
        const pathDetails = findAugmentingPathBFS(sourceNode, sinkNode);
        const pathBottleneckCapacity = pathDetails.bottleneckCapacity;

        if (pathBottleneckCapacity === 0) {
            break;
        }

        totalNetworkFlow += pathBottleneckCapacity;

        let currentNode = sinkNode;
        while (currentNode !== sourceNode) {
            const predecessorInfo = pathDetails.pathPredecessors.get(currentNode);
            const predecessorNode = predecessorInfo.vertex;
            const edgeIndexInPredecessor = predecessorInfo.edgeIdx;

            const forwardEdge = flowNetwork[predecessorNode][edgeIndexInPredecessor];
            forwardEdge.currentCapacity -= pathBottleneckCapacity;

            const reverseEdge = flowNetwork[forwardEdge.targetNode][forwardEdge.reverseEdgeIndex];
            reverseEdge.currentCapacity += pathBottleneckCapacity;

            currentNode = predecessorNode;
        }
    }

    return totalNetworkFlow;
}

function findAugmentingPathBFS(source, sink) {
    const traversalQueue = [];
    const pathPredecessors = new Map();
    const flowToCurrentNode = new Array(nodeCount).fill(0);

    traversalQueue.push(source);
    flowToCurrentNode[source] = Number.POSITIVE_INFINITY;

    let pathFound = false;

    while (traversalQueue.length > 0) {
        const currentVertex = traversalQueue.shift();

        if (currentVertex === sink) {
            pathFound = true;
            break;
        }

        flowNetwork[currentVertex].forEach((edge, edgeIndex) => {
            const neighborVertex = edge.targetNode;
            const remainingCapacity = edge.currentCapacity;

            if (remainingCapacity > 0 && flowToCurrentNode[neighborVertex] === 0) {
                flowToCurrentNode[neighborVertex] = Math.min(flowToCurrentNode[currentVertex], remainingCapacity);
                pathPredecessors.set(neighborVertex, { vertex: currentVertex, edgeIdx: edgeIndex });
                traversalQueue.push(neighborVertex);
            }
        });
    }

    if (pathFound) {
        return {
            bottleneckCapacity: flowToCurrentNode[sink],
            pathPredecessors: pathPredecessors
        };
    } else {
        return {
            bottleneckCapacity: 0,
            pathPredecessors: new Map()
        };
    }
}
