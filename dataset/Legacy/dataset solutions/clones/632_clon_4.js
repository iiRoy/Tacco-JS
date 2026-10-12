class MaxPriorityQueue {
    constructor(comparator) {
        this._heap = [];
        this._comparator = comparator;
    }

    size() {
        return this._heap.length;
    }

    isEmpty() {
        return this.size() === 0;
    }

    insert(item) {
        this._heap.push(item);
        this._bubbleUp();
    }

    extractMax() {
        if (this.isEmpty()) return undefined;
        const max = this._heap[0];
        const last = this._heap.pop();
        if (!this.isEmpty()) {
            this._heap[0] = last;
            this._sinkDown();
        }
        return max;
    }

    _bubbleUp() {
        let currentIdx = this.size() - 1;
        while (currentIdx > 0) {
            const parentIdx = Math.floor((currentIdx - 1) / 2);
            if (this._comparator(this._heap[currentIdx], this._heap[parentIdx]) > 0) {
                [this._heap[currentIdx], this._heap[parentIdx]] = [this._heap[parentIdx], this._heap[currentIdx]];
                currentIdx = parentIdx;
            } else {
                break;
            }
        }
    }

    _sinkDown() {
        let currentIdx = 0;
        const lastIdx = this.size() - 1;
        while (true) {
            let leftChildIdx = 2 * currentIdx + 1;
            let rightChildIdx = 2 * currentIdx + 2;
            let largestIdx = currentIdx;

            if (leftChildIdx <= lastIdx && this._comparator(this._heap[leftChildIdx], this._heap[largestIdx]) > 0) {
                largestIdx = leftChildIdx;
            }

            if (rightChildIdx <= lastIdx && this._comparator(this._heap[rightChildIdx], this._heap[largestIdx]) > 0) {
                largestIdx = rightChildIdx;
            }

            if (largestIdx !== currentIdx) {
                [this._heap[currentIdx], this._heap[largestIdx]] = [this._heap[largestIdx], this._heap[currentIdx]];
                currentIdx = largestIdx;
            } else {
                break;
            }
        }
    }
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const parsedLines = rawInputData.split('\n');

const [vertexCount, edgeCountVal, initialWaterLevel] = parsedLines[0].split(' ').map(Number);

const vertexWaterLevels = Array(vertexCount);
for (let i = 0; i < vertexCount; i++) {
    vertexWaterLevels[i] = Number(parsedLines[i + 1]);
}

const adjacencyMap = new Map();
for (let i = 0; i < vertexCount; i++) {
    adjacencyMap.set(i, []);
}

for (let i = 0; i < edgeCountVal; i++) {
    const edgeData = parsedLines[i + vertexCount + 1].split(' ').map(Number);
    const sourceVertex = edgeData[0] - 1;
    const targetVertex = edgeData[1] - 1;
    const travelDuration = edgeData[2];

    adjacencyMap.get(sourceVertex).push([targetVertex, travelDuration]);
    adjacencyMap.get(targetVertex).push([sourceVertex, travelDuration]);
}

const pathQueue = new MaxPriorityQueue((a, b) => b.accumulatedTime - a.accumulatedTime);

pathQueue.insert({
    position: 0,
    accumulatedTime: 0,
    currentWaterLevel: initialWaterLevel,
    pathHistory: new Set([0])
});

let minimumTravelTime = Infinity;

while (!pathQueue.isEmpty()) {
    const currentPath = pathQueue.extractMax();

    if (currentPath.accumulatedTime >= minimumTravelTime) {
        continue;
    }

    const neighbors = adjacencyMap.get(currentPath.position) || [];

    for (const [neighborIndex, travelCost] of neighbors) {
        if (currentPath.pathHistory.has(neighborIndex)) {
            continue;
        }

        if (vertexWaterLevels[currentPath.position] < travelCost) {
            continue;
        }

        let nextAccumulatedTime;
        let nextWaterLevel;
        const nextPathHistory = new Set([...currentPath.pathHistory, neighborIndex]);

        const conditionForHIndex = (neighborIndex + travelCost >= currentPath.currentWaterLevel && currentPath.currentWaterLevel >= travelCost);
        const hValueFromBooleanIndex = vertexWaterLevels[conditionForHIndex ? 1 : 0];

        if (vertexWaterLevels[neighborIndex] + travelCost < currentPath.currentWaterLevel) {
            nextAccumulatedTime = currentPath.accumulatedTime + travelCost + currentPath.currentWaterLevel - (vertexWaterLevels[neighborIndex] + travelCost);
            nextWaterLevel = vertexWaterLevels[neighborIndex];
        } else if (hValueFromBooleanIndex + travelCost >= currentPath.currentWaterLevel && currentPath.currentWaterLevel >= travelCost) {
            nextAccumulatedTime = currentPath.accumulatedTime + travelCost;
            nextWaterLevel = currentPath.currentWaterLevel - travelCost;
        } else {
            nextAccumulatedTime = currentPath.accumulatedTime + travelCost + travelCost - currentPath.currentWaterLevel;
            nextWaterLevel = 0;
        }
        
        if (neighborIndex === vertexCount - 1) {
            const finalPathCandidate = {
                position: neighborIndex,
                accumulatedTime: nextAccumulatedTime,
                currentWaterLevel: nextWaterLevel,
                pathHistory: nextPathHistory
            };
            minimumTravelTime = Math.min(minimumTravelTime, finalPathCandidate.accumulatedTime + vertexWaterLevels[vertexCount - 1] - finalPathCandidate.currentWaterLevel);
        } else {
            pathQueue.insert({
                position: neighborIndex,
                accumulatedTime: nextAccumulatedTime,
                currentWaterLevel: nextWaterLevel,
                pathHistory: nextPathHistory
            });
        }
    }
}

if (minimumTravelTime === Infinity) {
    console.log(-1);
} else {
    console.log(minimumTravelTime);
}
