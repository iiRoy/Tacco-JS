class MinPriorityQueue {
    constructor() {
        this.heap = [];
    }

    getParentIndex(idx) { return Math.floor((idx - 1) / 2); }
    getLeftChildIndex(idx) { return 2 * idx + 1; }
    getRightChildIndex(idx) { return 2 * idx + 2; }

    hasParent(idx) { return this.getParentIndex(idx) >= 0; }
    hasLeftChild(idx) { return this.getLeftChildIndex(idx) < this.heap.length; }
    hasRightChild(idx) { return this.getRightChildIndex(idx) < this.heap.length; }

    getParent(idx) { return this.heap[this.getParentIndex(idx)]; }
    getLeftChild(idx) { return this.heap[this.getLeftChildIndex(idx)]; }
    getRightChild(idx) { return this.heap[this.getRightChildIndex(idx)]; }

    swapElements(idx1, idx2) {
        [this.heap[idx1], this.heap[idx2]] = [this.heap[idx2], this.heap[idx1]];
    }

    peekTop() {
        if (this.heap.length === 0) return null;
        return this.heap[0];
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    insert(item) {
        this.heap.push(item);
        this.bubbleUp();
    }

    extractMin() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();

        const minItem = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown();
        return minItem;
    }

    bubbleUp() {
        let currentIdx = this.heap.length - 1;
        while (this.hasParent(currentIdx) && this.getParent(currentIdx)[0] > this.heap[currentIdx][0]) {
            this.swapElements(this.getParentIndex(currentIdx), currentIdx);
            currentIdx = this.getParentIndex(currentIdx);
        }
    }

    bubbleDown() {
        let currentIdx = 0;
        while (this.hasLeftChild(currentIdx)) {
            let smallerChildIdx = this.getLeftChildIndex(currentIdx);
            if (this.hasRightChild(currentIdx) && this.getRightChild(currentIdx)[0] < this.getLeftChild(currentIdx)[0]) {
                smallerChildIdx = this.getRightChildIndex(currentIdx);
            }

            if (this.heap[currentIdx][0] < this.heap[smallerChildIdx][0]) {
                break;
            } else {
                this.swapElements(currentIdx, smallerChildIdx);
            }
            currentIdx = smallerChildIdx;
        }
    }
}

const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataRows = rawData.split('\n');

const [nodeCount, edgeCount, initialHeight] = dataRows[0].split(' ').map(Number);

const nodeHeights = Array(nodeCount);
for (let i = 0; i < nodeCount; i++) {
    nodeHeights[i] = Number(dataRows[i + 1]);
}

const graphAdjacency = new Map();
for (let i = 0; i < nodeCount; i++) {
    graphAdjacency.set(i, []);
}

for (let i = 0; i < edgeCount; i++) {
    const edgeParts = dataRows[i + nodeCount + 1].split(' ');
    const sourceNode = Number(edgeParts[0]) - 1;
    const targetNode = Number(edgeParts[1]) - 1;
    const travelCost = Number(edgeParts[2]);

    graphAdjacency.get(sourceNode).push({
        destination: targetNode,
        cost: travelCost
    });
    graphAdjacency.get(targetNode).push({
        destination: sourceNode,
        cost: travelCost
    });
}

const pathFinderQueue = new MinPriorityQueue(); // Stores [currentPathTime, currentNodeIndex, currentRemainingHeight, visitedNodesInPathSet]
const minTimeReachedState = new Map(); // Key: `${nodeIndex}-${currentHeight}`, Value: minTime to reach this specific (node, height) state

let overallMinimumTime = Infinity;

// Initial state: [time, nodeIndex, currentHeight, pathSet]
pathFinderQueue.insert([0, 0, initialHeight, new Set([0])]);

while (!pathFinderQueue.isEmpty()) {
    const [currentPathTime, currentNodeIndex, currentRemainingHeight, visitedNodesInPathSet] = pathFinderQueue.extractMin();

    // Pruning: If we've already found a path to this (node, height) state with equal or less time, skip.
    const stateIdentifier = `${currentNodeIndex}-${currentRemainingHeight}`;
    if (minTimeReachedState.has(stateIdentifier) && minTimeReachedState.get(stateIdentifier) <= currentPathTime) {
        continue;
    }
    minTimeReachedState.set(stateIdentifier, currentPathTime);

    // Check if the destination node is reached
    if (currentNodeIndex === nodeCount - 1) {
        overallMinimumTime = Math.min(overallMinimumTime, currentPathTime + nodeHeights[nodeCount - 1] - currentRemainingHeight);
        // No need to explore further from the destination node
        continue;
    }

    // Explore adjacent nodes
    const adjacentEdges = graphAdjacency.get(currentNodeIndex) || [];
    for (const edgeDetails of adjacentEdges) {
        const nextNodeIndex = edgeDetails.destination;
        const edgeCost = edgeDetails.cost;

        // Cycle detection for the current path: if nextNodeIndex is already in the current path, skip.
        if (visitedNodesInPathSet.has(nextNodeIndex)) {
            continue;
        }

        // Condition from original code: if (h[node.p] < obj.t)
        if (nodeHeights[currentNodeIndex] < edgeCost) {
            continue;
        }

        let nextPathTime, nextRemainingHeight;

        // First main transition case: if (h[next] + obj.t < node.height )
        if (nodeHeights[nextNodeIndex] + edgeCost < currentRemainingHeight) {
            nextPathTime = currentPathTime + edgeCost + currentRemainingHeight - (nodeHeights[nextNodeIndex] + edgeCost);
            nextRemainingHeight = nodeHeights[nextNodeIndex];
        } else {
            // Replicating the original code's potentially buggy condition:
            // else if (h[next + obj.t >= node.height && node.height >= obj.t])
            const booleanExpressionResult = (nextNodeIndex + edgeCost >= currentRemainingHeight) && (currentRemainingHeight >= edgeCost);
            const isSecondCaseActive = !!nodeHeights[booleanExpressionResult ? 1 : 0]; // Accesses h[0] or h[1] based on boolean

            if (isSecondCaseActive) {
                // Second main transition case
                nextPathTime = currentPathTime + edgeCost;
                nextRemainingHeight = currentRemainingHeight - edgeCost;
            } else {
                // Third (default) transition case
                nextPathTime = currentPathTime + edgeCost + edgeCost - currentRemainingHeight;
                nextRemainingHeight = 0;
            }
        }

        const nextVisitedNodesInPathSet = new Set(visitedNodesInPathSet);
        nextVisitedNodesInPathSet.add(nextNodeIndex);

        pathFinderQueue.insert([nextPathTime, nextNodeIndex, nextRemainingHeight, nextVisitedNodesInPathSet]);
    }
}

console.log(overallMinimumTime);
