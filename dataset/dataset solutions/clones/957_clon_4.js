const config = { input: '/dev/stdin', newline: '\n' };

class MinPriorityQueue {
    constructor() {
        this.heap = [];
    }

    enqueue(element, priority) {
        this.heap.push({ element, priority });
        this.bubbleUp(this.heap.length - 1);
    }

    dequeue() {
        if (this.isEmpty()) return null;
        const min = this.heap[0];
        const last = this.heap.pop();
        if (!this.isEmpty()) {
            this.heap[0] = last;
            this.sinkDown(0);
        }
        return min;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    bubbleUp(index) {
        const currentElement = this.heap[index];
        while (index > 0) {
            let parentIndex = Math.floor((index - 1) / 2);
            let parentElement = this.heap[parentIndex];
            if (currentElement.priority >= parentElement.priority) break;
            this.heap[parentIndex] = currentElement;
            this.heap[index] = parentElement;
            index = parentIndex;
        }
    }

    sinkDown(index) {
        const length = this.heap.length;
        const currentElement = this.heap[index];
        while (true) {
            let leftChildIndex = 2 * index + 1;
            let rightChildIndex = 2 * index + 2;
            let leftChild, rightChild;
            let swapIndex = null;

            if (leftChildIndex < length) {
                leftChild = this.heap[leftChildIndex];
                if (leftChild.priority < currentElement.priority) {
                    swapIndex = leftChildIndex;
                }
            }

            if (rightChildIndex < length) {
                rightChild = this.heap[rightChildIndex];
                if (
                    (swapIndex === null && rightChild.priority < currentElement.priority) ||
                    (swapIndex !== null && rightChild.priority < leftChild.priority)
                ) {
                    swapIndex = rightChildIndex;
                }
            }

            if (swapIndex === null) break;
            this.heap[index] = this.heap[swapIndex];
            this.heap[swapIndex] = currentElement;
            index = swapIndex;
        }
    }
}

const fileContent = require('fs').readFileSync(config.input, 'ascii');
const processedLines = fileContent.trim().split(config.newline);

const nodeCount = Number(processedLines.shift());

const graphForward = {};
const graphBackward = {};

const addGraphEdge = (graphMap, fromNode, toNode, edgeWeight) => {
    if (!graphMap.hasOwnProperty(fromNode)) {
        graphMap[fromNode] = {};
    }
    graphMap[fromNode][toNode] = edgeWeight;
};

processedLines.forEach(currentLineEntry => {
    const edgeDetails = currentLineEntry.split(' ').map(Number);
    const sourceIdentifier = edgeDetails[0];
    for (let k = 2; k < edgeDetails.length; k += 2) {
        addGraphEdge(graphForward, sourceIdentifier, edgeDetails[k], edgeDetails[k + 1]);
        addGraphEdge(graphBackward, edgeDetails[k], sourceIdentifier, edgeDetails[k + 1]);
    }
});

const shortestPathDistances = new Array(nodeCount).fill(Number.MAX_VALUE);
shortestPathDistances[0] = 0;

const priorityQueue = new MinPriorityQueue();
priorityQueue.enqueue(0, 0);

while (!priorityQueue.isEmpty()) {
    const { element: currentNode, priority: currentDistance } = priorityQueue.dequeue();

    if (currentDistance > shortestPathDistances[currentNode]) {
        continue;
    }

    const neighborsAndWeights = graphForward[currentNode];
    if (neighborsAndWeights) {
        for (const neighborKey in neighborsAndWeights) {
            const neighborNode = Number(neighborKey);
            const edgeWeight = neighborsAndWeights[neighborKey];
            const newCalculatedDistance = currentDistance + edgeWeight;

            if (newCalculatedDistance < shortestPathDistances[neighborNode]) {
                shortestPathDistances[neighborNode] = newCalculatedDistance;
                priorityQueue.enqueue(neighborNode, newCalculatedDistance);
            }
        }
    }
}

const nodesOrderedByShortestPath = Array.from({ length: nodeCount }, (_, index) => index);
nodesOrderedByShortestPath.sort((nodeA, nodeB) => shortestPathDistances[nodeA] - shortestPathDistances[nodeB]);

const shortestPathRankMap = {};
nodesOrderedByShortestPath.forEach((node, rank) => {
    shortestPathRankMap[node] = rank;
});

for (let currentIdx = 0; currentIdx < nodeCount; currentIdx++) {
    console.log(currentIdx + ' ' + shortestPathDistances[currentIdx]);
}
