class MinPriorityQueue {
    constructor() {
        this.heap = [];
    }

    push(item, priority) {
        this.heap.push({ item, priority });
        this._bubbleUp(this.heap.length - 1);
    }

    pop() {
        if (this.isEmpty()) return null;
        const min = this.heap[0];
        const last = this.heap.pop();
        if (!this.isEmpty()) {
            this.heap[0] = last;
            this._sinkDown(0);
        }
        return min.item;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    _bubbleUp(idx) {
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            if (this.heap[parentIdx].priority > this.heap[idx].priority) {
                [this.heap[parentIdx], this.heap[idx]] = [this.heap[idx], this.heap[parentIdx]];
                idx = parentIdx;
            } else {
                break;
            }
        }
    }

    _sinkDown(idx) {
        const lastIdx = this.heap.length - 1;
        while (true) {
            const leftChildIdx = 2 * idx + 1;
            const rightChildIdx = 2 * idx + 2;
            let smallestIdx = idx;

            if (leftChildIdx <= lastIdx && this.heap[leftChildIdx].priority < this.heap[smallestIdx].priority) {
                smallestIdx = leftChildIdx;
            }
            if (rightChildIdx <= lastIdx && this.heap[rightChildIdx].priority < this.heap[smallestIdx].priority) {
                smallestIdx = rightChildIdx;
            }

            if (smallestIdx !== idx) {
                [this.heap[idx], this.heap[smallestIdx]] = [this.heap[smallestIdx], this.heap[idx]];
                idx = smallestIdx;
            } else {
                break;
            }
        }
    }
}

function findPathMinContribution(currentNode, targetNodeU, currentPathCostFromV, visitedSet, distanceValues, bfsNodeRankMap, inverseAdjacencyMap, currentMinOverall) {
    if (currentPathCostFromV >= currentMinOverall) {
        return currentMinOverall;
    }

    if (bfsNodeRankMap.get(currentNode) < bfsNodeRankMap.get(targetNodeU)) {
        return Math.min(currentMinOverall, currentPathCostFromV + distanceValues[currentNode]);
    }

    visitedSet.add(currentNode);
    let localMinResult = currentMinOverall;

    const neighbors = inverseAdjacencyMap.get(currentNode);
    if (neighbors) {
        for (const [neighborNode, edgeWeight] of neighbors.entries()) {
            if (!visitedSet.has(neighborNode)) {
                const newPathCost = currentPathCostFromV + edgeWeight;
                localMinResult = findPathMinContribution(neighborNode, targetNodeU, newPathCost, visitedSet, distanceValues, bfsNodeRankMap, inverseAdjacencyMap, localMinResult);
            }
        }
    }
    visitedSet.delete(currentNode);

    return localMinResult;
}

config = { input: 'tmp', newline: '\r\n' };
assert = require('assert');
fs = require('fs');

const inputLines = fs.readFileSync(config.input, 'ascii')
  .trim()
  .split(config.newline);

const nodeCount = Number(inputLines.shift());

const adjacencyMap = new Map();
const inverseAdjacencyMap = new Map();

inputLines.forEach(lineData => {
    const numericData = lineData.split(' ').map(Number);
    const sourceNode = numericData[0];
    for (let k = 2; k < numericData.length; k += 2) {
        const targetNode = numericData[k];
        const edgeWeight = numericData[k + 1];

        if (!adjacencyMap.has(sourceNode)) adjacencyMap.set(sourceNode, new Map());
        adjacencyMap.get(sourceNode).set(targetNode, edgeWeight);

        if (!inverseAdjacencyMap.has(targetNode)) inverseAdjacencyMap.set(targetNode, new Map());
        inverseAdjacencyMap.get(targetNode).set(sourceNode, edgeWeight);
    }
});

assert(adjacencyMap.size > 0 || nodeCount === 0);
assert(inverseAdjacencyMap.size > 0 || nodeCount === 0);

const shortestPathCosts = new Array(nodeCount).fill(Number.MAX_VALUE);
shortestPathCosts[0] = 0;

const priorityQueue = new MinPriorityQueue();
priorityQueue.push(0, 0);

while (!priorityQueue.isEmpty()) {
    const currentNode = priorityQueue.pop();
    const currentCost = shortestPathCosts[currentNode];

    const neighbors = adjacencyMap.get(currentNode);
    if (neighbors) {
        for (const [neighborNode, edgeWeight] of neighbors.entries()) {
            const newCost = currentCost + edgeWeight;
            if (newCost < shortestPathCosts[neighborNode]) {
                shortestPathCosts[neighborNode] = newCost;
                priorityQueue.push(neighborNode, newCost);
            }
        }
    }
}

assert(shortestPathCosts.length === nodeCount);

const sortedNodesByCost = Array.from({ length: nodeCount }, (_, i) => i);
sortedNodesByCost.sort((nodeA, nodeB) => shortestPathCosts[nodeA] - shortestPathCosts[nodeB]);

const bfsNodeRankMap = new Map();
sortedNodesByCost.forEach((node, index) => bfsNodeRankMap.set(node, index));

assert(sortedNodesByCost.length === nodeCount);
assert(bfsNodeRankMap.size === nodeCount);

sortedNodesByCost.forEach(currentNodeU => {
    const incomingEdges = inverseAdjacencyMap.get(currentNodeU);
    if (incomingEdges) {
        for (const [prevNodeV, edgeWeight] of incomingEdges.entries()) {
            if (bfsNodeRankMap.get(prevNodeV) < bfsNodeRankMap.get(currentNodeU)) {
                shortestPathCosts[currentNodeU] = Math.min(shortestPathCosts[currentNodeU], shortestPathCosts[prevNodeV] + edgeWeight);
            }
        }
    }

    if (incomingEdges) {
        for (const [prevNodeV, edgeWeight] of incomingEdges.entries()) {
            if (bfsNodeRankMap.get(prevNodeV) > bfsNodeRankMap.get(currentNodeU)) {
                const initialMinResult = shortestPathCosts[currentNodeU] - adjacencyMap.get(prevNodeV).get(currentNodeU);
                const initialVisitedNodes = new Set([currentNodeU, prevNodeV]);
                const pathContribution = findPathMinContribution(prevNodeV, currentNodeU, 0, initialVisitedNodes, shortestPathCosts, bfsNodeRankMap, inverseAdjacencyMap, initialMinResult);
                shortestPathCosts[currentNodeU] = pathContribution + adjacencyMap.get(prevNodeV).get(currentNodeU);
            }
        }
    }
});

for (let i = 0; i < nodeCount; i++) {
    console.log(i + ' ' + shortestPathCosts[i]);
}
