class MinPriorityQueue {
    #elements = [];

    insert(item) {
        this.#elements.push(item);
        this.#bubbleUp(this.#elements.length - 1);
    }

    extractMin() {
        if (this.isEmpty()) {
            return undefined;
        }
        const min = this.#elements[0];
        const last = this.#elements.pop();
        if (!this.isEmpty()) {
            this.#elements[0] = last;
            this.#bubbleDown(0);
        }
        return min;
    }

    isEmpty() {
        return this.#elements.length === 0;
    }

    #bubbleUp(idx) {
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            if (this.#elements[idx][0] >= this.#elements[parentIdx][0]) {
                break;
            }
            [this.#elements[idx], this.#elements[parentIdx]] = [this.#elements[parentIdx], this.#elements[idx]];
            idx = parentIdx;
        }
    }

    #bubbleDown(idx) {
        const lastIdx = this.#elements.length - 1;
        while (true) {
            let leftChildIdx = 2 * idx + 1;
            let rightChildIdx = 2 * idx + 2;
            let smallestIdx = idx;

            if (leftChildIdx <= lastIdx && this.#elements[leftChildIdx][0] < this.#elements[smallestIdx][0]) {
                smallestIdx = leftChildIdx;
            }
            if (rightChildIdx <= lastIdx && this.#elements[rightChildIdx][0] < this.#elements[smallestIdx][0]) {
                smallestIdx = rightChildIdx;
            }

            if (smallestIdx === idx) {
                break;
            }

            [this.#elements[idx], this.#elements[smallestIdx]] = [this.#elements[smallestIdx], this.#elements[idx]];
            idx = smallestIdx;
        }
    }
}

const calculateShortestPath = (startNode, targetNode, costType, graphStructure, totalNodes) => {
    const distanceMap = new Map();
    for (let i = 0; i < totalNodes; ++i) {
        distanceMap.set(i, Infinity);
    }
    distanceMap.set(startNode, 0);

    const pathQueue = new MinPriorityQueue();
    pathQueue.insert([0, startNode]);

    while (!pathQueue.isEmpty()) {
        const [currentDist, currentNode] = pathQueue.extractMin();

        if (currentDist > distanceMap.get(currentNode)) {
            continue;
        }

        const adjacentEdges = graphStructure.get(currentNode) || [];
        adjacentEdges.forEach(edge => {
            const neighborNode = edge.destination;
            const edgeCost = (costType === 0) ? edge.costA : edge.costB;
            const newDist = currentDist + edgeCost;

            if (newDist < distanceMap.get(neighborNode)) {
                distanceMap.set(neighborNode, newDist);
                pathQueue.insert([newDist, neighborNode]);
            }
        });
    }

    return distanceMap.get(targetNode);
};

let inputBuffer = '';
let inputTokens = [];
let tokenIndex = 0;

const readNextToken = () => {
    if (tokenIndex >= inputTokens.length) {
        throw new Error("Input token stream exhausted.");
    }
    return inputTokens[tokenIndex++];
};

const parseInteger = () => parseInt(readNextToken(), 10);

const outputResult = (value) => console.log(value);

const processGraphQueries = () => {
    while (true) {
        const edgeCount = parseInteger();
        const nodeCount = parseInteger();

        if (nodeCount === 0 && edgeCount === 0) {
            break;
        }

        const graphAdjacency = new Map();
        for (let i = 0; i < nodeCount; ++i) {
            graphAdjacency.set(i, []);
        }

        for (let i = 0; i < edgeCount; ++i) {
            const nodeU = parseInteger() - 1;
            const nodeV = parseInteger() - 1;
            const weightA = parseInteger();
            const weightB = parseInteger();

            graphAdjacency.get(nodeU).push({ destination: nodeV, costA: weightA, costB: weightB });
            graphAdjacency.get(nodeV).push({ destination: nodeU, costA: weightA, costB: weightB });
        }

        const queryCount = parseInteger();
        for (let i = 0; i < queryCount; ++i) {
            const startNodeIdx = parseInteger() - 1;
            const endNodeIdx = parseInteger() - 1;
            const selectedCostType = parseInteger();

            const result = calculateShortestPath(startNodeIdx, endNodeIdx, selectedCostType, graphAdjacency, nodeCount);
            outputResult(result);
        }
    }
};

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (chunk) => {
    inputBuffer += chunk;
});

process.stdin.on('end', () => {
    inputTokens = inputBuffer.split(/\s+/).filter(token => token.length > 0);
    processGraphQueries();
});
