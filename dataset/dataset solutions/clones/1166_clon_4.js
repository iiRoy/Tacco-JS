const inputReader = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

function FlowLink(sourceNode, destinationNode, currentCapacity, reverseLinkReference) {
    this.initialSource = sourceNode;
    this.destination = destinationNode;
    this.remainingCapacity = currentCapacity;
    this.backLink = reverseLinkReference;
}

function FlowNetwork(nodeCount) {
    this.nodeCount = nodeCount;
    this.adjacencyLists = new Array(nodeCount).fill(null).map(() => []);
}

FlowNetwork.prototype.addConnection = function(origin, terminal, capacityValue) {
    const forwardPass = new FlowLink(origin, terminal, capacityValue, null);
    const backwardPass = new FlowLink(terminal, origin, 0, null);

    forwardPass.backLink = backwardPass;
    backwardPass.backLink = forwardPass;

    this.adjacencyLists[origin].push(forwardPass);
    this.adjacencyLists[terminal].push(backwardPass);
};

FlowNetwork.prototype.computeMaxFlux = function(startPoint, endPoint) {
    let totalFlux = 0;

    while (true) {
        const parentMap = new Array(this.nodeCount).fill(null);
        const pathBottleneck = new Array(this.nodeCount).fill(0);
        const traversalQueue = [];

        traversalQueue.push(startPoint);
        pathBottleneck[startPoint] = Number.MAX_SAFE_INTEGER;

        let pathFound = false;
        let queueIndex = 0;

        while (queueIndex < traversalQueue.length) {
            const currentNode = traversalQueue[queueIndex++];

            if (currentNode === endPoint) {
                pathFound = true;
                break;
            }

            for (const connection of this.adjacencyLists[currentNode]) {
                if (connection.remainingCapacity > 0 && parentMap[connection.destination] === null && connection.destination !== startPoint) {
                    parentMap[connection.destination] = connection;
                    pathBottleneck[connection.destination] = Math.min(pathBottleneck[currentNode], connection.remainingCapacity);
                    traversalQueue.push(connection.destination);
                }
            }
        }

        if (!pathFound) {
            break;
        }

        const augmentationAmount = pathBottleneck[endPoint];
        totalFlux += augmentationAmount;

        let currentPathNode = endPoint;
        while (currentPathNode !== startPoint) {
            const edgeInPath = parentMap[currentPathNode];
            edgeInPath.remainingCapacity -= augmentationAmount;
            edgeInPath.backLink.remainingCapacity += augmentationAmount;
            currentPathNode = edgeInPath.initialSource;
        }
    }

    return totalFlux;
};

let networkGraph;
let vertexCount, edgeCount;
let linesOfInput = [];

inputReader.on('line', (dataLine) => {
    linesOfInput.push(dataLine);
});

inputReader.on('close', () => {
    const dimensions = linesOfInput[0].split(' ').map(Number);
    vertexCount = dimensions[0];
    edgeCount = dimensions[1];

    networkGraph = new FlowNetwork(vertexCount);

    for (let i = 1; i < linesOfInput.length; ++i) {
        const edgeDetails = linesOfInput[i].split(' ').map(Number);
        networkGraph.addConnection(edgeDetails[0], edgeDetails[1], edgeDetails[2]);
    }

    console.log(networkGraph.computeMaxFlux(0, vertexCount - 1));
});