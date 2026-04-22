class NetworkSolver {
    constructor() {
        this.nodeAdjacency = [];
        this.nodeCount = 0;
        this.linkCount = 0;
        this.levelMap = [];
        this.currentEdgeIndex = [];
    }

    establishConnection(originId, targetId, capacityValue) {
        this.nodeAdjacency[originId].push({
            endpoint: targetId,
            remainingCapacity: capacityValue,
            reverseConnectionIdx: this.nodeAdjacency[targetId].length
        });
        this.nodeAdjacency[targetId].push({
            endpoint: originId,
            remainingCapacity: 0,
            reverseConnectionIdx: this.nodeAdjacency[originId].length - 1
        });
    }

    determineLevels(startNode, endNode) {
        this.levelMap.fill(-1);
        this.levelMap[startNode] = 0;
        const traverseQueue = [startNode];
        let queueHead = 0;

        while (queueHead < traverseQueue.length) {
            const currentNode = traverseQueue[queueHead++];

            for (const connection of this.nodeAdjacency[currentNode]) {
                if (connection.remainingCapacity > 0 && this.levelMap[connection.endpoint] === -1) {
                    this.levelMap[connection.endpoint] = this.levelMap[currentNode] + 1;
                    traverseQueue.push(connection.endpoint);
                }
            }
        }
        return this.levelMap[endNode] !== -1;
    }

    findAugmentingPath(currentNode, endNode, currentFlowLimit) {
        if (currentFlowLimit === 0) return 0;
        if (currentNode === endNode) return currentFlowLimit;

        for (let i = this.currentEdgeIndex[currentNode]; i < this.nodeAdjacency[currentNode].length; i++) {
            this.currentEdgeIndex[currentNode] = i;

            const connection = this.nodeAdjacency[currentNode][i];
            if (this.levelMap[connection.endpoint] !== this.levelMap[currentNode] + 1 || connection.remainingCapacity === 0) {
                continue;
            }

            const pathFlow = this.findAugmentingPath(
                connection.endpoint,
                endNode,
                Math.min(currentFlowLimit, connection.remainingCapacity)
            );

            if (pathFlow > 0) {
                connection.remainingCapacity -= pathFlow;
                const reverseConnection = this.nodeAdjacency[connection.endpoint][connection.reverseConnectionIdx];
                reverseConnection.remainingCapacity += pathFlow;
                return pathFlow;
            }
        }
        return 0;
    }

    calculateMaxPassage(sourceNode, terminalNode) {
        if (sourceNode === terminalNode) return 0;

        let totalPassage = 0;

        while (this.determineLevels(sourceNode, terminalNode)) {
            this.currentEdgeIndex.fill(0);
            let pathPassage;
            while ((pathPassage = this.findAugmentingPath(sourceNode, terminalNode, Number.MAX_SAFE_INTEGER)) > 0) {
                totalPassage += pathPassage;
            }
        }
        return totalPassage;
    }
}

let receivedTransmission = '';
process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (payload) => {
    receivedTransmission += payload;
});

process.stdin.on('end', () => {
    const dataSegments = receivedTransmission.trim().split('\n');
    const flowNetwork = new NetworkSolver();

    let segmentPointer = 0;

    const initialConfig = dataSegments[segmentPointer++].split(' ').map(Number);
    flowNetwork.nodeCount = initialConfig[0];
    flowNetwork.linkCount = initialConfig[1];

    for (let currentVertex = 0; currentVertex < flowNetwork.nodeCount; ++currentVertex) {
        flowNetwork.nodeAdjacency[currentVertex] = [];
    }
    flowNetwork.levelMap = new Array(flowNetwork.nodeCount).fill(-1);
    flowNetwork.currentEdgeIndex = new Array(flowNetwork.nodeCount).fill(0);

    while (segmentPointer < dataSegments.length) {
        const connectionDetails = dataSegments[segmentPointer++].split(' ').map(Number);
        flowNetwork.establishConnection(connectionDetails[0], connectionDetails[1], connectionDetails[2]);
    }

    console.log(flowNetwork.calculateMaxPassage(0, flowNetwork.nodeCount - 1));
});