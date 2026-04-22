let flowNetwork = [];

let nodeCount, connectionCount;

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', function (incomingPayload) {
    const dataRows = incomingPayload.trim().split('\n');

    for (let idx = 0; idx < dataRows.length; ++idx) {
        if (idx === 0) {
            const graphDimensions = dataRows[idx].split(' ').map(parseInt);
            nodeCount = graphDimensions[0];
            connectionCount = graphDimensions[1];

            for (let k = 0; k < nodeCount; ++k) {
                flowNetwork[k] = [];
            }
        }
        else {
            const linkData = dataRows[idx].split(' ').map(parseInt);
            addNetworkLink(linkData[0], linkData[1], linkData[2]);
        }
    }

    console.log(computeFlow(0, nodeCount - 1));
});

function addNetworkLink(sourceNode, targetNode, capacityValue) {
    flowNetwork[sourceNode].push({
        target: targetNode,
        capacity: capacityValue,
        reverseIndex: flowNetwork[targetNode].length
    });
    flowNetwork[targetNode].push({
        target: sourceNode,
        capacity: 0,
        reverseIndex: flowNetwork[sourceNode].length - 1
    });
}

let visitedNodes;

function findAugmentingPath(currentNode, sinkNode, currentFlow) {
    if (currentNode === sinkNode) {
        return currentFlow;
    }

    visitedNodes[currentNode] = true;

    for (let k = 0; k < flowNetwork[currentNode].length; ++k) {
        const connectionItem = flowNetwork[currentNode][k];
        if (!visitedNodes[connectionItem.target] && connectionItem.capacity > 0) {
            const pathCapacityResult = findAugmentingPath(
                connectionItem.target,
                sinkNode,
                Math.min(currentFlow, connectionItem.capacity)
            );

            if (pathCapacityResult > 0) {
                connectionItem.capacity -= pathCapacityResult;
                flowNetwork[connectionItem.target][connectionItem.reverseIndex].capacity += pathCapacityResult;

                return pathCapacityResult;
            }
        }
    }

    return 0;
}

function computeFlow(startNode, endNode) {
    let totalFlow = 0;

    while (true) {
        visitedNodes = new Array(nodeCount).fill(false);

        const flowIncrement = findAugmentingPath(
            startNode,
            endNode,
            Number.POSITIVE_INFINITY
        );

        totalFlow += flowIncrement;

        if (flowIncrement === 0) {
            break;
        }
    }

    return totalFlow;
}