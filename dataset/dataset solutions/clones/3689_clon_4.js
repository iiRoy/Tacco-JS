const processGraphData = () => {
    const inputPayload = process.stdin.readFileSync(0, 'utf8').trim();
    const lines = inputPayload.split('\n');

    const [vertexCount, linkCount, firstOriginIndex, secondOriginIndex] = lines[0].split(' ').map(Number);

    const networkConnections = [];
    for (let lineIndex = 1; lineIndex <= linkCount; ++lineIndex) {
        const [nodeA, nodeB, costAlpha, costBeta] = lines[lineIndex].split(' ').map(Number);
        networkConnections.push({
            startNode: nodeA - 1,
            endNode: nodeB - 1,
            alphaCost: costAlpha,
            betaCost: costBeta
        });
    }

    const buildAdjacencyStructure = (edges, costKey) => {
        const adjacencies = new Array(vertexCount).fill(0).map(() => []);
        for (const edge of edges) {
            adjacencies[edge.startNode].push({
                neighbor: edge.endNode,
                weight: edge[costKey]
            });
            adjacencies[edge.endNode].push({
                neighbor: edge.startNode,
                weight: edge[costKey]
            });
        }
        return adjacencies;
    };

    const alphaAdjacencies = buildAdjacencyStructure(networkConnections, 'alphaCost');
    const betaAdjacencies = buildAdjacencyStructure(networkConnections, 'betaCost');

    const distancesFromAlphaOrigin = calculateShortestPaths(vertexCount, alphaAdjacencies, firstOriginIndex - 1);
    const distancesFromBetaOrigin = calculateShortestPaths(vertexCount, betaAdjacencies, secondOriginIndex - 1);

    const computedValues = new Array(vertexCount);
    const veryLargeValue = 1000000000000000;

    computedValues[vertexCount - 1] = veryLargeValue - distancesFromAlphaOrigin[vertexCount - 1] - distancesFromBetaOrigin[vertexCount - 1];

    for (let index = vertexCount - 2; index >= 0; --index) {
        computedValues[index] = Math.max(computedValues[index + 1], veryLargeValue - distancesFromAlphaOrigin[index] - distancesFromBetaOrigin[index]);
    }

    process.stdout.write(computedValues.join('\n'));
};

class PriorityQueueForPaths {
    constructor() {
        this.nodeHeap = [];
    }

    addNode(pathData) { // pathData is [distance, nodeIndex]
        this.nodeHeap.push(pathData);
        this._heapifyUp();
    }

    extractSmallest() {
        if (this.isEmpty()) return null;
        const smallest = this.nodeHeap[0];
        const lastElement = this.nodeHeap.pop();
        if (!this.isEmpty()) {
            this.nodeHeap[0] = lastElement;
            this._heapifyDown();
        }
        return smallest;
    }

    isEmpty() {
        return this.nodeHeap.length === 0;
    }

    _heapifyUp() {
        let currentIdx = this.nodeHeap.length - 1;
        while (currentIdx > 0) {
            const parentIdx = Math.floor((currentIdx - 1) / 2);
            if (this.nodeHeap[parentIdx][0] <= this.nodeHeap[currentIdx][0]) {
                break;
            }
            [this.nodeHeap[parentIdx], this.nodeHeap[currentIdx]] = [this.nodeHeap[currentIdx], this.nodeHeap[parentIdx]];
            currentIdx = parentIdx;
        }
    }

    _heapifyDown() {
        let currentIdx = 0;
        const totalElements = this.nodeHeap.length;
        const topElement = this.nodeHeap[0];

        while (true) {
            let leftChild = 2 * currentIdx + 1;
            let rightChild = 2 * currentIdx + 2;
            let swapTarget = null;

            if (leftChild < totalElements) {
                if (this.nodeHeap[leftChild][0] < topElement[0]) {
                    swapTarget = leftChild;
                }
            }
            if (rightChild < totalElements) {
                if ((swapTarget === null && this.nodeHeap[rightChild][0] < topElement[0]) ||
                    (swapTarget !== null && this.nodeHeap[rightChild][0] < this.nodeHeap[leftChild][0])) {
                    swapTarget = rightChild;
                }
            }

            if (swapTarget === null) break;

            [this.nodeHeap[currentIdx], this.nodeHeap[swapTarget]] = [this.nodeHeap[swapTarget], this.nodeHeap[currentIdx]];
            currentIdx = swapTarget;
        }
    }
}

const calculateShortestPaths = (totalNodes, graphAdjacency, startingNode) => {
    const shortestKnownDistances = new Array(totalNodes).fill(Infinity);
    shortestKnownDistances[startingNode] = 0;

    const pathMinQueue = new PriorityQueueForPaths();
    pathMinQueue.addNode([0, startingNode]);

    while (!pathMinQueue.isEmpty()) {
        const [currentDist, currentNodeIdx] = pathMinQueue.extractSmallest();

        if (currentDist > shortestKnownDistances[currentNodeIdx]) {
            continue;
        }

        for (const connectedNode of graphAdjacency[currentNodeIdx]) {
            const tentativeDistance = currentDist + connectedNode.weight;
            if (tentativeDistance < shortestKnownDistances[connectedNode.neighbor]) {
                shortestKnownDistances[connectedNode.neighbor] = tentativeDistance;
                pathMinQueue.addNode([tentativeDistance, connectedNode.neighbor]);
            }
        }
    }
    return shortestKnownDistances;
};

processGraphData();