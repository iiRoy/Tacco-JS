class PrioritizedQueue {
    constructor() {
        this.heapContent = [];
    }

    // Add an element to the queue with a given priority
    addElement(elementValue, elementPriority) {
        this.heapContent.push([elementPriority, elementValue]);
        this.rebalanceUp(this.heapContent.length - 1);
    }

    // Remove and return the element with the lowest priority
    extractLowest() {
        if (this.isEmpty()) {
            return undefined;
        }
        const lowestElement = this.heapContent[0];
        const lastElement = this.heapContent.pop();
        if (!this.isEmpty()) {
            this.heapContent[0] = lastElement;
            this.rebalanceDown(0);
        }
        return lowestElement;
    }

    // Check if the queue contains any elements
    isEmpty() {
        return this.heapContent.length === 0;
    }

    rebalanceUp(idx) {
        const currentElement = this.heapContent[idx];
        while (idx > 0) {
            const parentIndex = Math.floor((idx - 1) / 2);
            const parentElement = this.heapContent[parentIndex];
            if (currentElement[0] >= parentElement[0]) {
                break;
            }
            this.heapContent[idx] = parentElement;
            this.heapContent[parentIndex] = currentElement;
            idx = parentIndex;
        }
    }

    rebalanceDown(idx) {
        const totalElements = this.heapContent.length;
        const currentElement = this.heapContent[idx];
        while (true) {
            const leftChildIndex = 2 * idx + 1;
            const rightChildIndex = 2 * idx + 2;
            let smallestChildIndex = idx;

            if (leftChildIndex < totalElements && this.heapContent[leftChildIndex][0] < this.heapContent[smallestChildIndex][0]) {
                smallestChildIndex = leftChildIndex;
            }
            if (rightChildIndex < totalElements && this.heapContent[rightChildIndex][0] < this.heapContent[smallestChildIndex][0]) {
                smallestChildIndex = rightChildIndex;
            }

            if (smallestChildIndex === idx) {
                break;
            }

            [this.heapContent[idx], this.heapContent[smallestChildIndex]] = [this.heapContent[smallestChildIndex], this.heapContent[idx]];
            idx = smallestChildIndex;
        }
    }
}

// Function to compute shortest path costs using Dijkstra's algorithm
function computePathScores(sourceOrigin, graphStructure, totalVertexes) {
    const shortestPathScores = new Array(totalVertexes).fill(Number.MAX_SAFE_INTEGER);
    const processingQueue = new PrioritizedQueue();

    shortestPathScores[sourceOrigin] = 0;
    processingQueue.addElement(sourceOrigin, 0);

    while (!processingQueue.isEmpty()) {
        const [currentScore, currentVertex] = processingQueue.extractLowest();

        if (currentScore > shortestPathScores[currentVertex]) {
            continue;
        }

        for (const connectionDetails of graphStructure[currentVertex]) {
            const { targetVertex, edgeWeight } = connectionDetails;
            if (shortestPathScores[targetVertex] > currentScore + edgeWeight) {
                shortestPathScores[targetVertex] = currentScore + edgeWeight;
                processingQueue.addElement(targetVertex, shortestPathScores[targetVertex]);
            }
        }
    }
    return shortestPathScores;
}

// Main execution block
async function runApplication() {
    const inputReader = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
    });

    let collectedLines = [];
    for await (const singleLine of inputReader) {
        collectedLines.push(singleLine);
    }

    let currentLineIndex = 0;
    const extractNumericData = () => collectedLines[currentLineIndex++].split(' ').map(Number);

    const [vertexQuantity, linkQuantity] = extractNumericData();
    const [startPoint, endPoint] = extractNumericData().map(val => val - 1);

    const firstNetworkLinks = Array.from({ length: vertexQuantity }, () => []);
    const secondNetworkLinks = Array.from({ length: vertexQuantity }, () => []);

    for (let iter = 0; iter < linkQuantity; iter++) {
        const [vertexOne, vertexTwo] = extractNumericData().map(val => val - 1);
        const [costFirst, costSecond] = extractNumericData();

        firstNetworkLinks[vertexOne].push({ targetVertex: vertexTwo, edgeWeight: costFirst });
        firstNetworkLinks[vertexTwo].push({ targetVertex: vertexOne, edgeWeight: costFirst });

        secondNetworkLinks[vertexOne].push({ targetVertex: vertexTwo, edgeWeight: costSecond });
        secondNetworkLinks[vertexTwo].push({ targetVertex: vertexOne, edgeWeight: costSecond });
    }

    const pathScoresFromStart = computePathScores(startPoint, firstNetworkLinks, vertexQuantity);
    const pathScoresToEnd = computePathScores(endPoint, secondNetworkLinks, vertexQuantity);

    const GLOBAL_MAX_REVENUE = 1000000000000000;

    const temporaryProfitCalculations = new Array(vertexQuantity);
    for (let nodeIdx = 0; nodeIdx < vertexQuantity; nodeIdx++) {
        temporaryProfitCalculations[nodeIdx] = GLOBAL_MAX_REVENUE - pathScoresFromStart[nodeIdx] - pathScoresToEnd[nodeIdx];
    }

    const finalCalculatedProfits = new Array(vertexQuantity);
    let cumulativeHighestProfit = 0;
    for (let revIdx = vertexQuantity - 1; revIdx >= 0; revIdx--) {
        cumulativeHighestProfit = Math.max(cumulativeHighestProfit, temporaryProfitCalculations[revIdx]);
        finalCalculatedProfits[revIdx] = cumulativeHighestProfit;
    }

    for (let printIdx = 0; printIdx < vertexQuantity; printIdx++) {
        console.log(finalCalculatedProfits[printIdx]);
    }
}

runApplication();