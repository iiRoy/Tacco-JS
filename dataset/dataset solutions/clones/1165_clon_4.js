let networkGraph = [];
let nodeCount;
let edgeCount;

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', function(inputData) {
    const rawLines = inputData.trim().split('\n');

    const firstLineValues = rawLines[0].split(' ').map(Number);
    nodeCount = firstLineValues[0];
    edgeCount = firstLineValues[1];

    networkGraph = Array.from({ length: nodeCount }, () => []);

    rawLines.slice(1).forEach(line => {
        const edgeValues = line.split(' ').map(Number);
        addFlowEdge(edgeValues[0], edgeValues[1], edgeValues[2]);
    });

    console.log(calculateMaxFlow(0, nodeCount - 1));
});

function addFlowEdge(origin, destination, capacityValue) {
    networkGraph[origin].push({
        targetNode: destination,
        flowCapacity: capacityValue,
        reverseLinkIndex: networkGraph[destination].length
    });
    networkGraph[destination].push({
        targetNode: origin,
        flowCapacity: 0,
        reverseLinkIndex: networkGraph[origin].length - 1
    });
}

function findAugmentingPathBFS(startNode, sinkNode, totalNodes, graphStructure, parentEdgeDetails) {
    const visitedStatus = Array.from({ length: totalNodes }, () => false);
    Array.from({ length: totalNodes }, (_, i) => parentEdgeDetails[i] = null);

    const nodeQueue = [];
    let queuePointer = 0;

    nodeQueue.push(startNode);
    visitedStatus[startNode] = true;

    while (queuePointer < nodeQueue.length) {
        const currentNode = nodeQueue[queuePointer++];

        graphStructure[currentNode].forEach((edge, edgeIndex) => {
            if (!visitedStatus[edge.targetNode] && edge.flowCapacity > 0) {
                visitedStatus[edge.targetNode] = true;
                parentEdgeDetails[edge.targetNode] = {
                    parentNode: currentNode,
                    edgeIndexInParent: edgeIndex
                };
                nodeQueue.push(edge.targetNode);
            }
        });

        if (visitedStatus[sinkNode]) {
            return true;
        }
    }

    return false;
}

function calculateMaxFlow(source, sink) {
    let totalFlowAccumulator = 0;
    const parentPathInfo = new Array(nodeCount);

    while (findAugmentingPathBFS(source, sink, nodeCount, networkGraph, parentPathInfo)) {
        let pathBottleneckCapacity = Number.POSITIVE_INFINITY;

        for (let current = sink; current !== source; current = parentPathInfo[current].parentNode) {
            const pathSegment = parentPathInfo[current];
            const parent = pathSegment.parentNode;
            const edgeInParentList = networkGraph[parent][pathSegment.edgeIndexInParent];
            pathBottleneckCapacity = Math.min(pathBottleneckCapacity, edgeInParentList.flowCapacity);
        }

        for (let current = sink; current !== source; current = parentPathInfo[current].parentNode) {
            const pathSegment = parentPathInfo[current];
            const parent = pathSegment.parentNode;
            const forwardEdge = networkGraph[parent][pathSegment.edgeIndexInParent];
            const reverseEdge = networkGraph[current][forwardEdge.reverseLinkIndex];

            forwardEdge.flowCapacity -= pathBottleneckCapacity;
            reverseEdge.flowCapacity += pathBottleneckCapacity;
        }

        totalFlowAccumulator += pathBottleneckCapacity;
    }

    return totalFlowAccumulator;
}
