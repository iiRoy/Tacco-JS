const fileSystem = require('fs');

class MinPriorityQueue {
    constructor() {
        this.heap = [];
    }

    push(item) {
        this.heap.push(item);
        this._bubbleUp(this.heap.length - 1);
    }

    pop() {
        if (this.isEmpty()) {
            return undefined;
        }
        const min = this.heap[0];
        const last = this.heap.pop();
        if (!this.isEmpty()) {
            this.heap[0] = last;
            this._sinkDown(0);
        }
        return min;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    _bubbleUp(index) {
        while (index > 0) {
            const parentIndex = Math.floor((index - 1) / 2);
            if (this.heap[parentIndex].priority > this.heap[index].priority) {
                [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
                index = parentIndex;
            } else {
                break;
            }
        }
    }

    _sinkDown(index) {
        const lastIndex = this.heap.length - 1;
        while (true) {
            const leftChildIndex = 2 * index + 1;
            const rightChildIndex = 2 * index + 2;
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

function processGraphQueries(inputLines) {
    let currentLinePointer = 0;

    const nodeCount = Number(inputLines[currentLinePointer++]);

    const graphAdjacency = new Map();
    for (let i = 0; i < nodeCount; i++) {
        graphAdjacency.set(i, []);
    }

    for (let i = 0; i < nodeCount - 1; i++) {
        const [nodeA, nodeB, weight] = inputLines[currentLinePointer++].split(' ').map(Number);
        const u = nodeA - 1;
        const v = nodeB - 1;

        graphAdjacency.get(u).push({ neighborNode: v, edgeWeight: weight });
        graphAdjacency.get(v).push({ neighborNode: u, edgeWeight: weight });
    }

    const [queryCount, initialNode] = inputLines[currentLinePointer++].split(' ').map(Number);
    const startNodeIndex = initialNode - 1;

    const shortestDistances = new Array(nodeCount).fill(-1);
    shortestDistances[startNodeIndex] = 0;

    const traversalQueue = new MinPriorityQueue();
    traversalQueue.push({ node: startNodeIndex, priority: 0 });

    while (!traversalQueue.isEmpty()) {
        const { node: currentNode, priority: currentDistance } = traversalQueue.pop();

        if (shortestDistances[currentNode] !== -1 && currentDistance > shortestDistances[currentNode]) {
            continue;
        }

        for (const { neighborNode, edgeWeight } of graphAdjacency.get(currentNode)) {
            const newDistance = currentDistance + edgeWeight;
            if (shortestDistances[neighborNode] === -1 || newDistance < shortestDistances[neighborNode]) {
                shortestDistances[neighborNode] = newDistance;
                traversalQueue.push({ node: neighborNode, priority: newDistance });
            }
        }
    }

    const results = [];
    for (let i = 0; i < queryCount; i++) {
        const [queryNode1, queryNode2] = inputLines[currentLinePointer++].split(' ').map(Number);
        const node1Index = queryNode1 - 1;
        const node2Index = queryNode2 - 1;

        const totalPathSum = shortestDistances[node1Index] + shortestDistances[node2Index];
        results.push(totalPathSum);
    }

    console.log(results.join('\n'));
}

processGraphQueries(fileSystem.readFileSync("/dev/stdin", "UTF-8").split("\n"));
