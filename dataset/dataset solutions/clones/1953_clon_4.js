const inputTokens = (function* () {
    const rawInput = require("fs").readFileSync("/dev/stdin", "utf8");
    const tokens = rawInput.split(/\s+/).filter(Boolean);
    let currentIdx = 0;
    while (currentIdx < tokens.length) {
        yield tokens[currentIdx++];
    }
})();

const retrieveNext = (isString = false) => {
    const val = inputTokens.next().value;
    return isString ? val : Number(val);
};

const retrieveMultiple = (count, isString = false) => {
    return Array.from({ length: count }, () => retrieveNext(isString));
};

const createMultiDimArray = (initialValue, ...dimensions) => {
    const build = (dims) => {
        if (dims.length === 0) {
            return initialValue;
        }
        const currentDim = dims[0];
        return Array.from({ length: currentDim }, () => build(dims.slice(1)));
    };
    return build(dimensions);
};

class MinPriorityQueue {
    constructor() {
        this.heapElements = [];
    }

    insert(priorityValue, associatedData) {
        const entry = { p: priorityValue, d: associatedData };
        this.heapElements.push(entry);
        this.bubbleUp(this.heapElements.length - 1);
    }

    extractMin() {
        if (this.isEmpty()) return undefined;
        if (this.heapElements.length === 1) return this.heapElements.pop();

        const min = this.heapElements[0];
        this.heapElements[0] = this.heapElements.pop();
        this.sinkDown(0);
        return min;
    }

    peekMin() {
        return this.heapElements[0];
    }

    get currentSize() {
        return this.heapElements.length;
    }

    isEmpty() {
        return this.heapElements.length === 0;
    }

    bubbleUp(idx) {
        const element = this.heapElements[idx];
        while (idx > 0) {
            let parentIdx = Math.floor((idx - 1) / 2);
            let parent = this.heapElements[parentIdx];
            if (element.p >= parent.p) break;
            this.heapElements[parentIdx] = element;
            this.heapElements[idx] = parent;
            idx = parentIdx;
        }
    }

    sinkDown(idx) {
        const length = this.heapElements.length;
        const element = this.heapElements[idx];
        while (true) {
            let leftChildIdx = 2 * idx + 1;
            let rightChildIdx = 2 * idx + 2;
            let leftChild, rightChild;
            let swapIdx = null;

            if (leftChildIdx < length) {
                leftChild = this.heapElements[leftChildIdx];
                if (leftChild.p < element.p) {
                    swapIdx = leftChildIdx;
                }
            }
            if (rightChildIdx < length) {
                rightChild = this.heapElements[rightChildIdx];
                if (
                    (swapIdx === null && rightChild.p < element.p) ||
                    (swapIdx !== null && rightChild.p < leftChild.p)
                ) {
                    swapIdx = rightChildIdx;
                }
            }

            if (swapIdx === null) break;
            this.heapElements[idx] = this.heapElements[swapIdx];
            this.heapElements[swapIdx] = element;
            idx = swapIdx;
        }
    }
}

class PathFinder {
    constructor(nodeCount) {
        this.adjacencyList = new Map();
        for (let i = 0; i < nodeCount; i++) {
            this.adjacencyList.set(i, []);
        }
    }

    connectNodes(source, destination, weight) {
        this.adjacencyList.get(source).push({ target: destination, cost: weight });
    }

    connectBidirectional(nodeA, nodeB, weight) {
        this.connectNodes(nodeA, nodeB, weight);
        this.connectNodes(nodeB, nodeA, weight);
    }

    calculateShortestPaths(initialNode) {
        const maxDistance = Number.MAX_SAFE_INTEGER;
        const distances = Array(this.adjacencyList.size).fill(maxDistance);
        const processingQueue = new MinPriorityQueue();

        distances[initialNode] = 0;
        processingQueue.insert(0, initialNode);

        while (!processingQueue.isEmpty()) {
            const { p: currentDist, d: currentNode } = processingQueue.extractMin();

            if (currentDist > distances[currentNode]) {
                continue;
            }

            for (const { target: neighborNode, cost: edgeWeight } of this.adjacencyList.get(currentNode)) {
                const newPathDist = currentDist + edgeWeight;
                if (newPathDist < distances[neighborNode]) {
                    distances[neighborNode] = newPathDist;
                    processingQueue.insert(newPathDist, neighborNode);
                }
            }
        }
        return distances;
    }
}

const maxCurrency = 2500;
const executionResult = processGraphOperations();
if (executionResult !== undefined) console.log(executionResult);

function processGraphOperations() {
    const [nodeCount, edgeCount, initialSilver] = retrieveMultiple(3);

    const graphSolver = new PathFinder(maxCurrency * nodeCount);

    Array.from({ length: edgeCount }).forEach(() => {
        let [sourceNode, targetNode, silverCost, timeCost] = retrieveMultiple(4);
        sourceNode--;
        targetNode--;

        const baseSource = sourceNode * maxCurrency;
        const baseTarget = targetNode * maxCurrency;

        for (let currentSilver = silverCost + 1; currentSilver < maxCurrency; currentSilver++) {
            graphSolver.connectBidirectional(
                baseSource + currentSilver,
                baseTarget + (currentSilver - silverCost),
                timeCost
            );
        }
    });

    Array.from({ length: nodeCount }).forEach((_, cityIndex) => {
        const [exchangeCost, exchangeTime] = retrieveMultiple(2);
        const cityBaseNode = cityIndex * maxCurrency;

        Array.from({ length: maxCurrency - 1 }).forEach((_, currentSilver) => {
            graphSolver.connectNodes(
                cityBaseNode + currentSilver,
                cityBaseNode + Math.min(maxCurrency - 1, currentSilver + exchangeCost),
                exchangeTime
            );
        });
    });

    const finalDistances = graphSolver.calculateShortestPaths(Math.min(maxCurrency - 1, initialSilver));

    const minimumTimes = createMultiDimArray(Number.MAX_SAFE_INTEGER, nodeCount);

    const results = Array.from({ length: nodeCount - 1 }, (_, cityIdx) => {
        const actualCityIdx = cityIdx + 1;
        const cityBaseNode = actualCityIdx * maxCurrency;
        return Array.from({ length: maxCurrency })
            .reduce((minTime, _, silverAmount) => {
                return Math.min(minTime, finalDistances[cityBaseNode + silverAmount]);
            }, Number.MAX_SAFE_INTEGER);
    });

    return results.join("\n");
}
