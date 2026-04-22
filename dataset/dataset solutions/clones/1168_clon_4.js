let networkGraph = new Map();
let nodeCount;
let linkCount;

process.stdin.resume();
process.stdin.setEncoding('utf8');
process.stdin.on('data', (allInput) => {
    const inputLines = allInput.split('\n').filter(line => line.trim() !== '');

    inputLines.forEach((currentLine, lineIndex) => {
        if (lineIndex === 0) {
            const initialValues = currentLine.split(' ').map(Number);
            nodeCount = initialValues[0];
            linkCount = initialValues[1];

            for (let k = 0; k < nodeCount; ++k) {
                networkGraph.set(k, []);
            }
        } else {
            const connectionDetails = currentLine.split(' ').map(Number);
            const startNode = connectionDetails[0];
            const endNode = connectionDetails[1];
            const capacityValue = connectionDetails[2];
            
            const forwardLinks = networkGraph.get(startNode);
            const reverseLinks = networkGraph.get(endNode);

            forwardLinks.push({
                destination: endNode,
                currentCapacity: capacityValue,
                reverseLinkIdx: reverseLinks.length
            });

            reverseLinks.push({
                destination: startNode,
                currentCapacity: 0,
                reverseLinkIdx: forwardLinks.length - 1
            });
        }
    });

    console.log(computeMaximumThroughput(0, nodeCount - 1));
});

function findAugmentingPath(sourceNode, terminalNode, graphData, totalNodes) {
    const parentInfo = new Array(totalNodes).fill(null);
    const pathCapacity = new Array(totalNodes).fill(0);
    const traversalQueue = [];

    traversalQueue.push(sourceNode);
    parentInfo[sourceNode] = { predecessorNode: -1, edgeIndexInPredecessorList: -1 };
    pathCapacity[sourceNode] = Number.POSITIVE_INFINITY;

    while (traversalQueue.length > 0) {
        const currentNode = traversalQueue.shift();

        if (currentNode === terminalNode) {
            break;
        }

        const adjacentLinks = graphData.get(currentNode);
        for (let idx = 0; idx < adjacentLinks.length; ++idx) {
            const currentLink = adjacentLinks[idx];
            const nextNode = currentLink.destination;

            if (parentInfo[nextNode] === null && currentLink.currentCapacity > 0) {
                parentInfo[nextNode] = { predecessorNode: currentNode, edgeIndexInPredecessorList: idx };
                pathCapacity[nextNode] = Math.min(pathCapacity[currentNode], currentLink.currentCapacity);
                traversalQueue.push(nextNode);
            }
        }
    }

    if (parentInfo[terminalNode] === null) {
        return 0;
    }

    let flowFound = pathCapacity[terminalNode];
    let traceNode = terminalNode;

    while (traceNode !== sourceNode) {
        const { predecessorNode, edgeIndexInPredecessorList } = parentInfo[traceNode];
        const forwardEdge = graphData.get(predecessorNode)[edgeIndexInPredecessorList];
        const reverseEdge = graphData.get(traceNode)[forwardEdge.reverseLinkIdx];

        forwardEdge.currentCapacity -= flowFound;
        reverseEdge.currentCapacity += flowFound;

        traceNode = predecessorNode;
    }

    return flowFound;
}

function computeMaximumThroughput(sourceNode, terminalNode) {
    let currentTotalFlow = 0;
    let newFlow;

    while ((newFlow = findAugmentingPath(sourceNode, terminalNode, networkGraph, nodeCount)) > 0) {
        currentTotalFlow += newFlow;
    }

    return currentTotalFlow;
}