class MinPriorityQueue {
    #elements = [];

    get size() {
        return this.#elements.length;
    }

    isEmpty() {
        return this.#elements.length === 0;
    }

    insert(valueTuple) {
        this.#elements.push(valueTuple);
        this.#bubbleUp(this.#elements.length - 1);
    }

    extractMin() {
        if (this.isEmpty()) {
            return undefined;
        }
        if (this.#elements.length === 1) {
            return this.#elements.pop();
        }

        const minimumValue = this.#elements[0];
        this.#elements[0] = this.#elements.pop();
        this.#bubbleDown(0);
        return minimumValue;
    }

    #getParentIndex(childIdx) {
        return Math.floor((childIdx - 1) / 2);
    }

    #getLeftChildIndex(parentIdx) {
        return 2 * parentIdx + 1;
    }

    #getRightChildIndex(parentIdx) {
        return 2 * parentIdx + 2;
    }

    #swapElements(idx1, idx2) {
        [this.#elements[idx1], this.#elements[idx2]] = [this.#elements[idx2], this.#elements[idx1]];
    }

    #bubbleUp(currentIndex) {
        let currentIdx = currentIndex;
        let parentIdx = this.#getParentIndex(currentIdx);

        while (currentIdx > 0 && this.#elements[parentIdx][0] > this.#elements[currentIdx][0]) {
            this.#swapElements(currentIdx, parentIdx);
            currentIdx = parentIdx;
            parentIdx = this.#getParentIndex(currentIdx);
        }
    }

    #bubbleDown(currentIndex) {
        let currentIdx = currentIndex;
        const lastElementIndex = this.#elements.length - 1;

        while (true) {
            const leftChildIdx = this.#getLeftChildIndex(currentIdx);
            const rightChildIdx = this.#getRightChildIndex(currentIdx);
            let smallestChildIdx = currentIdx;

            if (leftChildIdx <= lastElementIndex && this.#elements[leftChildIdx][0] < this.#elements[smallestChildIdx][0]) {
                smallestChildIdx = leftChildIdx;
            }

            if (rightChildIdx <= lastElementIndex && this.#elements[rightChildIdx][0] < this.#elements[smallestChildIdx][0]) {
                smallestChildIdx = rightChildIdx;
            }

            if (smallestChildIdx !== currentIdx) {
                this.#swapElements(currentIdx, smallestChildIdx);
                currentIdx = smallestChildIdx;
            } else {
                break;
            }
        }
    }
}

function loopRange(startValue, endValue, iterationCallback) {
    let actualStart = 0;
    let actualEnd = startValue;
    let actualCallback = endValue;

    if (iterationCallback !== undefined) {
        actualStart = startValue;
        actualEnd = endValue;
        actualCallback = iterationCallback;
    }

    for (let i = actualStart; i < actualEnd; ++i) {
        actualCallback(i);
    }
}

let rawInputBuffer = '';
let inputTokenPointer = 0;

function readNextToken(tokenType) {
    const tokenString = rawInputBuffer[inputTokenPointer++];
    if (tokenType === 'string') {
        return tokenString;
    } else {
        return +tokenString;
    }
}

function outputResult(valueToPrint) {
    console.log(valueToPrint);
}

function executeDijkstraAlgorithm() {
    const nodeCount = readNextToken();
    const edgeCount = readNextToken();
    const sourceNodeIdentifier = readNextToken();

    const adjacencyMatrix = [];
    loopRange(nodeCount, (idx) => {
        adjacencyMatrix[idx] = [];
    });

    loopRange(edgeCount, () => {
        const originNode = readNextToken();
        const destinationNode = readNextToken();
        const edgeWeight = readNextToken();
        adjacencyMatrix[originNode].push([destinationNode, edgeWeight]);
    });

    const minimumDistances = [];
    const MAX_POSSIBLE_DISTANCE = Infinity;
    loopRange(nodeCount, (idx) => {
        minimumDistances[idx] = MAX_POSSIBLE_DISTANCE;
    });

    minimumDistances[sourceNodeIdentifier] = 0;
    const priorityQueue = new MinPriorityQueue();
    priorityQueue.insert([0, sourceNodeIdentifier]); // [distance, node_index]

    while (!priorityQueue.isEmpty()) {
        const extractedData = priorityQueue.extractMin();
        const currentPathDistance = extractedData[0];
        const currentNodeIdentifier = extractedData[1];

        if (currentPathDistance > minimumDistances[currentNodeIdentifier]) {
            continue;
        }

        const currentNeighbors = adjacencyMatrix[currentNodeIdentifier];
        for (let i = 0; i < currentNeighbors.length; i++) {
            const neighborEdgeData = currentNeighbors[i];
            const neighborNode = neighborEdgeData[0];
            const weightToNeighbor = neighborEdgeData[1];

            const calculatedNewDistance = currentPathDistance + weightToNeighbor;

            if (minimumDistances[neighborNode] > calculatedNewDistance) {
                minimumDistances[neighborNode] = calculatedNewDistance;
                priorityQueue.insert([calculatedNewDistance, neighborNode]);
            }
        }
    }

    loopRange(nodeCount, (idx) => {
        const finalCalculatedDistance = minimumDistances[idx];
        outputResult(finalCalculatedDistance !== MAX_POSSIBLE_DISTANCE ? finalCalculatedDistance : 'INF');
    });
}
 
process.stdin.resume();
process.stdin.setEncoding('utf8');
 
process.stdin.on('data', function(chunk) {
    rawInputBuffer += chunk;
});

process.stdin.on('end', function() {
    rawInputBuffer = rawInputBuffer.split(/\s+/);
    executeDijkstraAlgorithm();
});
