class MinPriorityQueue {
    constructor() {
        this.heap = [];
    }

    push(item) {
        this.heap.push(item);
        this.bubbleUp(this.heap.length - 1);
    }

    pop() {
        if (this.isEmpty()) return undefined;
        const minVal = this.heap[0];
        const lastVal = this.heap.pop();
        if (!this.isEmpty()) {
            this.heap[0] = lastVal;
            this.sinkDown(0);
        }
        return minVal;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    bubbleUp(idx) {
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            if (this.heap[parentIdx][0] > this.heap[idx][0]) {
                [this.heap[parentIdx], this.heap[idx]] = [this.heap[idx], this.heap[parentIdx]];
                idx = parentIdx;
            } else {
                break;
            }
        }
    }

    sinkDown(idx) {
        const lastIdx = this.heap.length - 1;
        while (true) {
            const leftChildIdx = 2 * idx + 1;
            const rightChildIdx = 2 * idx + 2;
            let smallestIdx = idx;

            if (leftChildIdx <= lastIdx && this.heap[leftChildIdx][0] < this.heap[smallestIdx][0]) {
                smallestIdx = leftChildIdx;
            }

            if (rightChildIdx <= lastIdx && this.heap[rightChildIdx][0] < this.heap[smallestIdx][0]) {
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

var sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');
var dataLines = sourceData.trim().split("\n");
var currentLineIndex = 0;

const executeGraphTraversal = () => {
    const counts = dataLines[currentLineIndex++].split(" ").map(Number);
    const numNodes = counts[0];
    const numEdges = counts[1];

    if (numNodes === 0 && numEdges === 0) {
        return false;
    }

    const maxNodeId = numNodes + 100;
    const initialNode = 1;
    const finalNode = numNodes;

    const graphConnections = new Map();
    for (let i = 0; i < numEdges; i++) {
        const edgeDetails = dataLines[currentLineIndex++].split(" ").map(Number);
        const nodeA = edgeDetails[0];
        const nodeB = edgeDetails[1];
        const edgeCost = edgeDetails[2];

        if (!graphConnections.has(nodeA)) graphConnections.set(nodeA, []);
        if (!graphConnections.has(nodeB)) graphConnections.set(nodeB, []);

        graphConnections.get(nodeA).push([nodeB, edgeCost]);
        graphConnections.get(nodeB).push([nodeA, edgeCost]);
    }

    // pathDistances[node][0] = minimum cost without using the special ability
    // pathDistances[node][1] = minimum cost having used the special ability once
    const pathDistances = Array.from({ length: maxNodeId + 1 }, () => Array(2).fill(Infinity));

    pathDistances[initialNode][0] = 0;

    const traversalQueue = new MinPriorityQueue();
    traversalQueue.push([0, initialNode, 0]); // [current_cost, current_node, special_ability_used_count]

    while (!traversalQueue.isEmpty()) {
        const [currentPathCost, currentNodeId, abilityUsage] = traversalQueue.pop();

        if (currentPathCost > pathDistances[currentNodeId][abilityUsage]) {
            continue;
        }

        const adjacentNodes = graphConnections.get(currentNodeId) || [];

        for (const [neighborNodeId, connectionCost] of adjacentNodes) {
            // Scenario 1: Traverse the edge normally
            const newNormalCost = currentPathCost + connectionCost;
            if (newNormalCost < pathDistances[neighborNodeId][abilityUsage]) {
                pathDistances[neighborNodeId][abilityUsage] = newNormalCost;
                traversalQueue.push([newNormalCost, neighborNodeId, abilityUsage]);
            }

            // Scenario 2: Use the special ability on this edge (only if not used yet)
            if (abilityUsage === 0) {
                const newSkippedCost = currentPathCost; // Cost of this edge becomes 0
                if (newSkippedCost < pathDistances[neighborNodeId][1]) {
                    pathDistances[neighborNodeId][1] = newSkippedCost;
                    traversalQueue.push([newSkippedCost, neighborNodeId, 1]);
                }
            }
        }
    }

    const finalMinimumCost = Math.min(pathDistances[finalNode][0], pathDistances[finalNode][1]);
    console.log(finalMinimumCost);
    return true;
};

while (executeGraphTraversal()) {
    // Continue processing graph cases until '0 0' is encountered
}
