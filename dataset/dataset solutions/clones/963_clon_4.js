const pathSettings = { sourceFile: '/dev/stdin', lineSeparator: '\n' };

const fileContent = require('fs').readFileSync(pathSettings.sourceFile, 'ascii');
const inputLines = fileContent.trim().split(pathSettings.lineSeparator);

const nodeRegistry = new Map();
const graphAdjacency = new Map();

function connectNodes(adjMap, source, target, cost) {
    if (!adjMap.has(source)) {
        adjMap.set(source, []);
    }
    adjMap.get(source).push({ target: target, weight: cost });
}

for (const currentLine of inputLines) {
    const parsedLine = currentLine.split(' ').map(Number);
    const sourceNodeId = parsedLine[0];

    if (!nodeRegistry.has(sourceNodeId)) {
        nodeRegistry.set(sourceNodeId, { id: sourceNodeId, dist: Number.POSITIVE_INFINITY, prev: null });
    }

    for (let edgeIdx = 2; edgeIdx < parsedLine.length; edgeIdx += 2) {
        const targetNodeId = parsedLine[edgeIdx];
        const edgeCost = parsedLine[edgeIdx + 1];
        connectNodes(graphAdjacency, sourceNodeId, targetNodeId, edgeCost);

        if (!nodeRegistry.has(targetNodeId)) {
            nodeRegistry.set(targetNodeId, { id: targetNodeId, dist: Number.POSITIVE_INFINITY, prev: null });
        }
    }
}

for (const [nodeId, nodeData] of nodeRegistry.entries()) {
    if (nodeId === 0) {
        nodeData.dist = 0;
        break;
    }
}

class MinPriorityQueue {
    constructor() {
        this.heap = [];
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    insert(item, priority) {
        this.heap.push({ item, priority });
        this._bubbleUp(this.heap.length - 1);
    }

    extractMin() {
        if (this.isEmpty()) return null;
        const min = this.heap[0];
        const last = this.heap.pop();
        if (!this.isEmpty()) {
            this.heap[0] = last;
            this._sinkDown(0);
        }
        return min.item;
    }

    _bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[index].priority < this.heap[parentIndex].priority) {
                [this.heap[index], this.heap[parentIndex]] = [this.heap[parentIndex], this.heap[index]];
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    _sinkDown(index) {
        const lastIndex = this.heap.length - 1;
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let smallestIndex = index;

            if (leftChildIndex <= lastIndex && this.heap[leftChildIndex].priority < this.heap[smallestIndex].priority) {
                smallestIndex = leftChildIndex;
            }
            if (rightChildIndex <= lastIndex && this.heap[rightChildIndex].priority < this.heap[smallestIndex].priority) {
                smallestIndex = rightChildIndex;
            }

            if (smallestIndex !== index) {
                [this.heap[index], this.heap[smallestIndex]] = [this.heap[smallestIndex], this.heap[index]];
                index = smallestIndex;
            } else {
                break;
            }
        }
    }
}

function computeShortestPaths(nodeDataMap, adjListMap) {
    const minHeap = new MinPriorityQueue();

    for (const [nodeId, nodeInfo] of nodeDataMap.entries()) {
        if (nodeInfo.dist === 0) {
            minHeap.insert(nodeId, nodeInfo.dist);
            break;
        }
    }

    const processedNodes = new Set();

    while (!minHeap.isEmpty()) {
        const currentId = minHeap.extractMin();

        if (processedNodes.has(currentId)) {
            continue;
        }
        processedNodes.add(currentId);

        const currentNode = nodeDataMap.get(currentId);
        if (!currentNode) continue;

        const neighbors = adjListMap.get(currentId) || [];

        for (const edge of neighbors) {
            const neighborId = edge.target;
            const edgeWeight = edge.weight;
            const neighborNode = nodeDataMap.get(neighborId);

            if (!neighborNode) continue;

            const newDist = currentNode.dist + edgeWeight;
            if (newDist < neighborNode.dist) {
                neighborNode.dist = newDist;
                neighborNode.prev = currentId;
                minHeap.insert(neighborId, newDist);
            }
        }
    }
}

computeShortestPaths(nodeRegistry, graphAdjacency);

for (const [nodeIdentifier, nodeDetails] of nodeRegistry.entries()) {
    console.log("%s %d", nodeIdentifier, nodeDetails.dist);
}
