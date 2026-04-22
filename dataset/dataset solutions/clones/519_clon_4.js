const { readFileSync: retrieveFileContent } = require('node:fs');

function* createLineIterator(allContent) {
    const lines = allContent.split('\n');
    for (const singleLine of lines) {
        yield Number(singleLine);
    }
}

const entireInput = retrieveFileContent('/dev/stdin', 'utf8');
const lineConsumer = createLineIterator(entireInput);

class PriorityNode {
    constructor(identifier, val) {
        this.identifier = identifier;
        this.priority = val;
    }
}

class MinimumHeap {
    constructor() {
        this.elements = [];
    }

    _getLeftChildIndex(idx) { return 2 * idx + 1; }
    _getRightChildIndex(idx) { return 2 * idx + 2; }
    _getParentIndex(idx) { return Math.floor((idx - 1) / 2); }

    _hasLeftChild(idx) { return this._getLeftChildIndex(idx) < this.elements.length; }
    _hasRightChild(idx) { return this._getRightChildIndex(idx) < this.elements.length; }
    _hasParent(idx) { return this._getParentIndex(idx) >= 0; }

    _getLeftChild(idx) { return this.elements[this._getLeftChildIndex(idx)]; }
    _getRightChild(idx) { return this.elements[this._getRightChildIndex(idx)]; }
    _getParent(idx) { return this.elements[this._getParentIndex(idx)]; }

    _swap(idx1, idx2) {
        [this.elements[idx1], this.elements[idx2]] = [this.elements[idx2], this.elements[idx1]];
    }

    isEmpty() {
        return this.elements.length === 0;
    }

    offer(item) {
        this.elements.push(item);
        this._heapifyUp();
    }

    poll() {
        if (this.isEmpty()) return null;
        if (this.elements.length === 1) return this.elements.pop();

        const minItem = this.elements[0];
        this.elements[0] = this.elements.pop();
        this._heapifyDown();
        return minItem;
    }

    _heapifyUp() {
        let currentIdx = this.elements.length - 1;
        while (this._hasParent(currentIdx) && this._getParent(currentIdx).priority > this.elements[currentIdx].priority) {
            this._swap(this._getParentIndex(currentIdx), currentIdx);
            currentIdx = this._getParentIndex(currentIdx);
        }
    }

    _heapifyDown() {
        let currentIdx = 0;
        while (this._hasLeftChild(currentIdx)) {
            let smallerChildIdx = this._getLeftChildIndex(currentIdx);
            if (this._hasRightChild(currentIdx) && this._getRightChild(currentIdx).priority < this._getLeftChild(currentIdx).priority) {
                smallerChildIdx = this._getRightChildIndex(currentIdx);
            }

            if (this.elements[currentIdx].priority < this.elements[smallerChildIdx].priority) {
                break;
            } else {
                this._swap(currentIdx, smallerChildIdx);
            }
            currentIdx = smallerChildIdx;
        }
    }
}

const calculateShortestPaths = (graphStructure, startNodeIndex, totalNodes) => {
    const distances = Array(totalNodes).fill(Number.MAX_SAFE_INTEGER);
    distances[startNodeIndex] = 0;

    const pq = new MinimumHeap();
    pq.offer(new PriorityNode(startNodeIndex, 0));

    while (!pq.isEmpty()) {
        const { identifier: currentIdentifier, priority: currentDistance } = pq.poll();

        if (currentDistance > distances[currentIdentifier]) {
            continue;
        }

        const neighbors = graphStructure[currentIdentifier] || [];
        for (const { target: neighborIdentifier, weight: edgeWeight } of neighbors) {
            const newDistance = currentDistance + edgeWeight;
            if (newDistance < distances[neighborIdentifier]) {
                distances[neighborIdentifier] = newDistance;
                pq.offer(new PriorityNode(neighborIdentifier, newDistance));
            }
        }
    }
    return distances;
};

const processScenario = (limitValue, nodeCount, valueSet) => {
    const graphDimension = nodeCount + 2;
    const adjacencyList = Array.from({ length: graphDimension }, () => []);

    Array.from({ length: nodeCount + 1 }).forEach((_, currentIdx) => {
        Array.from({ length: limitValue }).forEach((__, offset) => {
            const potentialTarget = currentIdx + offset + valueSet[currentIdx + offset];
            const clampedTarget = Math.min(Math.max(potentialTarget, 0), nodeCount + 1);

            if (clampedTarget !== currentIdx) {
                adjacencyList[currentIdx].push({ target: clampedTarget, weight: 1 });
            }
        });
    });

    const startDistances = calculateShortestPaths(adjacencyList, 0, graphDimension);

    if (startDistances[nodeCount + 1] === Number.MAX_SAFE_INTEGER) {
        return false;
    }

    const intermediateNodes = Array.from({ length: nodeCount }).map((_, i) => i + 1);
    const unreachableIntermediate = intermediateNodes.filter(idx =>
        startDistances[idx] !== Number.MAX_SAFE_INTEGER
    ).some(idx => {
        const pathFromIntermediate = calculateShortestPaths(adjacencyList, idx, graphDimension);
        return pathFromIntermediate[nodeCount + 1] === Number.MAX_SAFE_INTEGER;
    });

    return !unreachableIntermediate;
};

const runAllCases = (consumer) => {
    let currentLimit;
    while ((currentLimit = consumer.next().value) !== 0) {
        const nodeCount = consumer.next().value;
        const dataValues = Array(nodeCount + 2);
        dataValues[0] = 0;
        dataValues[nodeCount + 1] = 0;

        for (let k = 1; k <= nodeCount; k++) {
            dataValues[k] = consumer.next().value;
        }
        console.log(processScenario(currentLimit, nodeCount, dataValues) ? 'OK' : 'NG');
    }
};

runAllCases(lineConsumer);