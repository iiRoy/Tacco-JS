const libIO = require('fs');
const rawInputContent = libIO.readFileSync('/dev/stdin', 'utf8');
const rawLines = rawInputContent.trim().split('\n');

class CustomQueue {
    constructor() {
        this.data = [];
        this.head = 0;
        this.tail = 0;
    }

    enqueue(element) {
        this.data[this.tail++] = element;
    }

    dequeue() {
        if (this.head === this.tail) return undefined;
        const element = this.data[this.head];
        delete this.data[this.head];
        this.head++;
        return element;
    }

    isEmpty() {
        return this.head === this.tail;
    }
}

function executeProcessing() {
    const firstLineParts = rawLines.shift().split(' ').map(Number);
    const vertexCount = firstLineParts[0];
    const linkCount = firstLineParts[1];

    const allLinks = [];
    const forwardMap = new Map();
    const reverseMap = new Map();
    const incomingDegree = new Map();

    for (let currentVertex = 0; currentVertex < vertexCount; currentVertex++) {
        forwardMap.set(currentVertex, new Set());
        reverseMap.set(currentVertex, new Set());
        incomingDegree.set(currentVertex, 0);
    }

    for (let linkIndex = 0; linkIndex < linkCount; linkIndex++) {
        const linkData = rawLines[linkIndex].split(' ').map(Number);
        const sourceNode = linkData[0] - 1;
        const targetNode = linkData[1] - 1;

        allLinks.push({
            origin: sourceNode,
            destination: targetNode,
            originalIdx: linkIndex
        });

        forwardMap.get(sourceNode).add(targetNode);
        reverseMap.get(targetNode).add(sourceNode);
        incomingDegree.set(targetNode, incomingDegree.get(targetNode) + 1);
    }

    const pathLengthRecord = new Map();
    const topologicalQueue = new CustomQueue();

    for (let currentVertex = 0; currentVertex < vertexCount; currentVertex++) {
        pathLengthRecord.set(currentVertex, 0);
        if (incomingDegree.get(currentVertex) === 0) {
            topologicalQueue.enqueue(currentVertex);
        }
    }

    while (!topologicalQueue.isEmpty()) {
        const currentVertex = topologicalQueue.dequeue();

        for (const neighborVertex of forwardMap.get(currentVertex)) {
            const currentPathToNeighbor = pathLengthRecord.get(currentVertex) + 1;
            if (currentPathToNeighbor > pathLengthRecord.get(neighborVertex)) {
                pathLengthRecord.set(neighborVertex, currentPathToNeighbor);
            }

            incomingDegree.set(neighborVertex, incomingDegree.get(neighborVertex) - 1);
            if (incomingDegree.get(neighborVertex) === 0) {
                topologicalQueue.enqueue(neighborVertex);
            }
        }
    }

    let overallLongestPath = 0;
    for (const lengthValue of pathLengthRecord.values()) {
        overallLongestPath = Math.max(overallLongestPath, lengthValue);
    }

    const participatingNodes = new Set();
    const pathLevelCounts = new Map();
    const backtrackProcessingQueue = new CustomQueue();
    const visitedForBacktrack = new Set();

    for (let currentVertex = 0; currentVertex < vertexCount; currentVertex++) {
        if (pathLengthRecord.get(currentVertex) === overallLongestPath) {
            if (!participatingNodes.has(currentVertex)) {
                participatingNodes.add(currentVertex);
                const currentLength = pathLengthRecord.get(currentVertex);
                pathLevelCounts.set(currentLength, (pathLevelCounts.get(currentLength) || 0) + 1);
            }
            backtrackProcessingQueue.enqueue(currentVertex);
        }
    }

    while (!backtrackProcessingQueue.isEmpty()) {
        const currentVertex = backtrackProcessingQueue.dequeue();

        if (visitedForBacktrack.has(currentVertex)) {
            continue;
        }
        visitedForBacktrack.add(currentVertex);

        if (reverseMap.has(currentVertex)) {
            for (const predecessorVertex of reverseMap.get(currentVertex)) {
                if (pathLengthRecord.get(predecessorVertex) + 1 === pathLengthRecord.get(currentVertex)) {
                    if (!participatingNodes.has(predecessorVertex)) {
                        participatingNodes.add(predecessorVertex);
                        const predecessorLength = pathLengthRecord.get(predecessorVertex);
                        pathLevelCounts.set(predecessorLength, (pathLevelCounts.get(predecessorLength) || 0) + 1);
                    }
                    backtrackProcessingQueue.enqueue(predecessorVertex);
                }
            }
        }
    }

    for (const currentLink of allLinks) {
        const originNode = currentLink.origin;
        const destinationNode = currentLink.destination;

        const isOriginCritical = participatingNodes.has(originNode);
        const isDestinationCritical = participatingNodes.has(destinationNode);
        const originPathLevel = pathLengthRecord.get(originNode);
        const isOriginUniqueAtLevel = pathLevelCounts.get(originPathLevel) === 1;

        if (isOriginCritical && isDestinationCritical && isOriginUniqueAtLevel) {
            console.log(currentLink.originalIdx + 1);
        }
    }
}

executeProcessing();