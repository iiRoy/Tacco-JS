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
        const minElement = this.heap[0];
        const lastElement = this.heap.pop();
        if (!this.isEmpty()) {
            this.heap[0] = lastElement;
            this._bubbleDown(0);
        }
        return minElement;
    }

    isEmpty() {
        return this.heap.length === 0;
    }

    _bubbleUp(childIndex) {
        while (childIndex > 0) {
            const parentIndex = Math.floor((childIndex - 1) / 2);
            if (this.heap[parentIndex][0] > this.heap[childIndex][0]) {
                [this.heap[parentIndex], this.heap[childIndex]] = [this.heap[childIndex], this.heap[parentIndex]];
                childIndex = parentIndex;
            } else {
                break;
            }
        }
    }

    _bubbleDown(parentIndex) {
        const lastIndex = this.heap.length - 1;
        while (true) {
            const leftChildIndex = 2 * parentIndex + 1;
            const rightChildIndex = 2 * parentIndex + 2;
            let smallestElementIndex = parentIndex;

            if (leftChildIndex <= lastIndex && this.heap[leftChildIndex][0] < this.heap[smallestElementIndex][0]) {
                smallestElementIndex = leftChildIndex;
            }

            if (rightChildIndex <= lastIndex && this.heap[rightChildIndex][0] < this.heap[smallestElementIndex][0]) {
                smallestElementIndex = rightChildIndex;
            }

            if (smallestElementIndex !== parentIndex) {
                [this.heap[parentIndex], this.heap[smallestElementIndex]] = [this.heap[smallestElementIndex], this.heap[parentIndex]];
                parentIndex = smallestElementIndex;
            } else {
                break;
            }
        }
    }
}

const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8').trim();
const inputLines = rawInputContent.split('\n');

const totalGraphNodes = +inputLines.shift();

const graphAdjacencyList = Array(totalGraphNodes).fill(null).map(() => []);

for (let nodeCounter = 0; nodeCounter < totalGraphNodes; nodeCounter++) {
    const currentLineSegments = inputLines.shift().trim().split(' ').map(Number);
    const sourceNodeId = currentLineSegments[0];
    const numberOfConnectedEdges = currentLineSegments[1];

    for (let edgeIndex = 0; edgeIndex < numberOfConnectedEdges; edgeIndex++) {
        const destinationNodeId = currentLineSegments[2 + edgeIndex * 2];
        const edgeCostValue = currentLineSegments[2 + edgeIndex * 2 + 1];
        graphAdjacencyList[sourceNodeId].push({ target: destinationNodeId, weight: edgeCostValue });
    }
}

const minimumDistances = Array(totalGraphNodes).fill(Number.POSITIVE_INFINITY);
minimumDistances[0] = 0;

const priorityQueue = new MinPriorityQueue();
priorityQueue.push([0, 0]); // [distance, node_index]

while (!priorityQueue.isEmpty()) {
    const [currentDistance, currentNodeIndex] = priorityQueue.pop();

    if (currentDistance > minimumDistances[currentNodeIndex]) {
        continue;
    }

    for (const connectedEdge of graphAdjacencyList[currentNodeIndex]) {
        const neighborNode = connectedEdge.target;
        const connectionWeight = connectedEdge.weight;
        const candidateDistance = currentDistance + connectionWeight;

        if (candidateDistance < minimumDistances[neighborNode]) {
            minimumDistances[neighborNode] = candidateDistance;
            priorityQueue.push([candidateDistance, neighborNode]);
        }
    }
}

for (let outputIndex = 0; outputIndex < totalGraphNodes; outputIndex++) {
    console.log(outputIndex, minimumDistances[outputIndex]);
}
