class PriorityMinQueue {
    constructor() {
        this.heapElements = [];
    }

    insert(element) {
        this.heapElements.push(element);
        this.heapifyUp();
    }

    extractMin() {
        if (this.isEmpty()) return null;
        const minVal = this.heapElements[0];
        const lastVal = this.heapElements.pop();
        if (!this.isEmpty()) {
            this.heapElements[0] = lastVal;
            this.heapifyDown();
        }
        return minVal;
    }

    isEmpty() {
        return this.heapElements.length === 0;
    }

    heapifyUp() {
        let currentIdx = this.heapElements.length - 1;
        while (currentIdx > 0) {
            let parentIdx = Math.floor((currentIdx - 1) / 2);
            if (this.heapElements[parentIdx][0] > this.heapElements[currentIdx][0]) {
                [this.heapElements[parentIdx], this.heapElements[currentIdx]] = [this.heapElements[currentIdx], this.heapElements[parentIdx]];
                currentIdx = parentIdx;
            } else {
                break;
            }
        }
    }

    heapifyDown() {
        let currentIdx = 0;
        const totalLength = this.heapElements.length;
        const elementToSink = this.heapElements[0];

        while (true) {
            let leftChildIdx = 2 * currentIdx + 1;
            let rightChildIdx = 2 * currentIdx + 2;
            let leftChildElement, rightChildElement;
            let swapIdx = null;

            if (leftChildIdx < totalLength) {
                leftChildElement = this.heapElements[leftChildIdx];
                if (leftChildElement[0] < elementToSink[0]) {
                    swapIdx = leftChildIdx;
                }
            }

            if (rightChildIdx < totalLength) {
                rightChildElement = this.heapElements[rightChildIdx];
                if (
                    (swapIdx === null && rightChildElement[0] < elementToSink[0]) ||
                    (swapIdx !== null && rightChildElement[0] < leftChildElement[0])
                ) {
                    swapIdx = rightChildIdx;
                }
            }

            if (swapIdx === null) break;
            [this.heapElements[currentIdx], this.heapElements[swapIdx]] = [this.heapElements[swapIdx], this.heapElements[currentIdx]];
            currentIdx = swapIdx;
        }
    }
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = rawInputData.split('\n');

const firstLineValues = dataLines[0].split(' ').map(Number);
const vertexCount = firstLineValues[0];
const edgeCount = firstLineValues[1];
const initialFluidLevel = firstLineValues[2];

const vertexElevations = Array(vertexCount);
for (let i = 0; i < vertexCount; i++) {
    vertexElevations[i] = Number(dataLines[i + 1]);
}

const adjacencyMap = Array(vertexCount);
for (let i = 0; i < vertexCount; i++) {
    adjacencyMap[i] = [];
}

for (let i = 0; i < edgeCount; i++) {
    const edgeParts = dataLines[i + vertexCount + 1].split(' ').map(Number);
    const sourceVertex = edgeParts[0] - 1;
    const targetVertex = edgeParts[1] - 1;
    const travelDuration = edgeParts[2];

    adjacencyMap[sourceVertex].push({
        destination: targetVertex,
        duration: travelDuration
    });
    adjacencyMap[targetVertex].push({
        destination: sourceVertex,
        duration: travelDuration
    });
}

const maxWaterLevel = 1001;
const minTravelTimes = Array(vertexCount).fill(null).map(() => Array(maxWaterLevel).fill(Infinity));

const pathFinder = new PriorityMinQueue();

minTravelTimes[0][initialFluidLevel] = 0;
pathFinder.insert([0, 0, initialFluidLevel]);

while (!pathFinder.isEmpty()) {
    const [currentTime, currentVertex, currentWaterLevel] = pathFinder.extractMin();

    if (currentTime > minTravelTimes[currentVertex][currentWaterLevel]) {
        continue;
    }

    for (const edgeDetails of adjacencyMap[currentVertex]) {
        const nextVertex = edgeDetails.destination;
        const travelDuration = edgeDetails.duration;

        if (vertexElevations[currentVertex] < travelDuration) {
            continue;
        }

        let nextTime, nextWaterLevel;

        if (vertexElevations[nextVertex] + travelDuration < currentWaterLevel) {
            nextWaterLevel = vertexElevations[nextVertex];
            nextTime = currentTime + travelDuration + (currentWaterLevel - (vertexElevations[nextVertex] + travelDuration));
        }
        else if (vertexElevations[nextVertex] + travelDuration >= currentWaterLevel && currentWaterLevel >= travelDuration) {
            nextWaterLevel = currentWaterLevel - travelDuration;
            nextTime = currentTime + travelDuration;
        }
        else {
            nextWaterLevel = 0;
            nextTime = currentTime + travelDuration + travelDuration - currentWaterLevel;
        }
        
        if (nextTime < minTravelTimes[nextVertex][nextWaterLevel]) {
            minTravelTimes[nextVertex][nextWaterLevel] = nextTime;
            pathFinder.insert([nextTime, nextVertex, nextWaterLevel]);
        }
    }
}

let overallMinimumJourneyTime = Infinity;
const targetNodeIndex = vertexCount - 1;

for (let w = 0; w < maxWaterLevel; w++) {
    if (minTravelTimes[targetNodeIndex][w] !== Infinity) {
        overallMinimumJourneyTime = Math.min(overallMinimumJourneyTime, minTravelTimes[targetNodeIndex][w] + vertexElevations[targetNodeIndex] - w);
    }
}

if (overallMinimumJourneyTime === Infinity) {
    console.log(-1);
} else {
    console.log(overallMinimumJourneyTime);
}
