let dataBuffer = [];
let dataPointer = 0;

function acquireDatum(isString) {
    if (isString) {
        return dataBuffer[dataPointer++];
    }
    return Number(dataBuffer[dataPointer++]);
}

function outputResult(value) {
    console.log(value);
}

class GraphEdge {
    constructor(destination, firstCost, secondCost) {
        this.destination = destination;
        this.firstCost = firstCost;
        this.secondCost = secondCost;
    }

    getCost(selector) {
        return selector === 0 ? this.firstCost : this.secondCost;
    }
}

class MinPathQueue {
    constructor() {
        this._elements = [];
    }

    offer(priorityValue, itemData) {
        const entry = { priority: priorityValue, item: itemData };
        this._elements.push(entry);
        this._percolateUp(this._elements.length - 1);
    }

    poll() {
        if (this.isEmpty()) {
            return undefined;
        }
        const smallestEntry = this._elements[0];
        const lastEntry = this._elements.pop();
        if (!this.isEmpty()) {
            this._elements[0] = lastEntry;
            this._percolateDown(0);
        }
        return [smallestEntry.priority, smallestEntry.item];
    }

    isEmpty() {
        return this._elements.length === 0;
    }

    _percolateUp(index) {
        const currentEntry = this._elements[index];
        while (index > 0) {
            const parentIdx = Math.floor((index - 1) / 2);
            const parentEntry = this._elements[parentIdx];
            if (currentEntry.priority < parentEntry.priority) {
                this._elements[index] = parentEntry;
                index = parentIdx;
            } else {
                break;
            }
        }
        this._elements[index] = currentEntry;
    }

    _percolateDown(index) {
        const lastIdx = this._elements.length - 1;
        const currentEntry = this._elements[index];
        while (true) {
            const leftChildIdx = 2 * index + 1;
            const rightChildIdx = 2 * index + 2;
            let smallestIdx = index;

            if (leftChildIdx <= lastIdx && this._elements[leftChildIdx].priority < this._elements[smallestIdx].priority) {
                smallestIdx = leftChildIdx;
            }

            if (rightChildIdx <= lastIdx && this._elements[rightChildIdx].priority < this._elements[smallestIdx].priority) {
                smallestIdx = rightChildIdx;
            }

            if (smallestIdx !== index) {
                this._elements[index] = this._elements[smallestIdx];
                index = smallestIdx;
            } else {
                break;
            }
        }
        this._elements[index] = currentEntry;
    }
}

function locateShortestPath(initialNode, finalNode, pathType, totalNodes, adjacencies) {
    const distanceRecords = new Map();
    for (let current = 0; current < totalNodes; ++current) {
        distanceRecords.set(current, Infinity);
    }

    distanceRecords.set(initialNode, 0);
    const frontierQueue = new MinPathQueue();
    frontierQueue.offer(0, initialNode);

    while (!frontierQueue.isEmpty()) {
        const [currentDist, currentNode] = frontierQueue.poll();

        if (currentDist > distanceRecords.get(currentNode)) {
            continue;
        }

        const neighbors = adjacencies.get(currentNode) || [];
        for (const connectedPath of neighbors) {
            const potentialNewDist = currentDist + connectedPath.getCost(pathType);
            const neighborNode = connectedPath.destination;

            if (potentialNewDist < distanceRecords.get(neighborNode)) {
                distanceRecords.set(neighborNode, potentialNewDist);
                frontierQueue.offer(potentialNewDist, neighborNode);
            }
        }
    }

    return distanceRecords.get(finalNode);
}

function commenceProcessing() {
    while (true) {
        const edgeQuantity = acquireDatum();
        const vertexQuantity = acquireDatum();

        if (vertexQuantity === 0 && edgeQuantity === 0) {
            break;
        }

        const graphAdjacencies = new Map();
        for (let i = 0; i < vertexQuantity; ++i) {
            graphAdjacencies.set(i, []);
        }

        for (let i = 0; i < edgeQuantity; ++i) {
            const firstVertex = acquireDatum() - 1;
            const secondVertex = acquireDatum() - 1;
            const weightA = acquireDatum();
            const weightB = acquireDatum();

            const forwardEdge = new GraphEdge(secondVertex, weightA, weightB);
            const backwardEdge = new GraphEdge(firstVertex, weightA, weightB);

            graphAdjacencies.get(firstVertex).push(forwardEdge);
            graphAdjacencies.get(secondVertex).push(backwardEdge);
        }

        const queryQuantity = acquireDatum();
        for (let i = 0; i < queryQuantity; ++i) {
            const queryStart = acquireDatum() - 1;
            const queryEnd = acquireDatum() - 1;
            const queryType = acquireDatum();

            const result = locateShortestPath(queryStart, queryEnd, queryType, vertexQuantity, graphAdjacencies);
            outputResult(result);
        }
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

let accumulatedInput = '';
process.stdin.on('data', function(chunk) {
    accumulatedInput += chunk;
});

process.stdin.on('end', function() {
    dataBuffer = accumulatedInput.split(/\s+/);
    commenceProcessing();
});