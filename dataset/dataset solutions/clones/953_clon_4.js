const rawLines = require('node:fs').readFileSync('/dev/stdin', 'utf-8').trim().split('\n');

class MinPQ {
    constructor() {
        this.heapElements = [];
    }

    insertElement(itemData) {
        this.heapElements.push(itemData);
        this.siftUp();
    }

    extractSmallest() {
        if (this.isVoid()) return null;
        const smallest = this.heapElements[0];
        const lastElement = this.heapElements.pop();
        if (!this.isVoid()) {
            this.heapElements[0] = lastElement;
            this.siftDown();
        }
        return smallest;
    }

    isVoid() {
        return this.heapElements.length === 0;
    }

    siftUp() {
        let currentPos = this.heapElements.length - 1;
        while (currentPos > 0) {
            let parentPos = Math.floor((currentPos - 1) / 2);
            if (this.heapElements[parentPos].cost <= this.heapElements[currentPos].cost) break;
            [this.heapElements[parentPos], this.heapElements[currentPos]] = [this.heapElements[currentPos], this.heapElements[parentPos]];
            currentPos = parentPos;
        }
    }

    siftDown() {
        let currentPos = 0;
        const heapSize = this.heapElements.length;
        const elementToMove = this.heapElements[0];

        while (true) {
            let leftChildPos = 2 * currentPos + 1;
            let rightChildPos = 2 * currentPos + 2;
            let leftChildValue, rightChildValue;
            let swapCandidatePos = null;

            if (leftChildPos < heapSize) {
                leftChildValue = this.heapElements[leftChildPos];
                if (leftChildValue.cost < elementToMove.cost) {
                    swapCandidatePos = leftChildPos;
                }
            }

            if (rightChildPos < heapSize) {
                rightChildValue = this.heapElements[rightChildPos];
                if (
                    (swapCandidatePos === null && rightChildValue.cost < elementToMove.cost) ||
                    (swapCandidatePos !== null && rightChildValue.cost < leftChildValue.cost)
                ) {
                    swapCandidatePos = rightChildPos;
                }
            }

            if (swapCandidatePos === null) break;
            [this.heapElements[currentPos], this.heapElements[swapCandidatePos]] = [this.heapElements[swapCandidatePos], this.heapElements[currentPos]];
            currentPos = swapCandidatePos;
        }
    }
}

const totalVertices = parseInt(rawLines[0], 10);
const connectionGrid = Array.from({ length: totalVertices }, () => Array(totalVertices).fill(Infinity));

for (let sourceIdx = 0; sourceIdx < totalVertices; sourceIdx++) {
    const weightsLine = rawLines[sourceIdx + 1].trim().split(' ').map(Number);
    for (let targetIdx = 0; targetIdx < totalVertices; targetIdx++) {
        if (weightsLine[targetIdx] !== -1 && sourceIdx !== targetIdx) {
            connectionGrid[sourceIdx][targetIdx] = weightsLine[targetIdx];
        }
    }
}

function computeMinTotalConnectivity(graphGrid, nodeCount) {
    const includedNodes = new Set();
    const minEdgeCostToTree = Array(nodeCount).fill(Infinity);
    const edgeConnectorQueue = new MinPQ();

    let accumulatedCost = 0;

    minEdgeCostToTree[0] = 0;
    edgeConnectorQueue.insertElement({ cost: 0, nodeIdentity: 0 });

    while (!edgeConnectorQueue.isVoid() && includedNodes.size < nodeCount) {
        const { cost: currentLinkCost, nodeIdentity: currentNode } = edgeConnectorQueue.extractSmallest();

        if (includedNodes.has(currentNode)) {
            continue;
        }

        includedNodes.add(currentNode);
        accumulatedCost += currentLinkCost;

        for (let adjacentNode = 0; adjacentNode < nodeCount; adjacentNode++) {
            const potentialConnection = graphGrid[currentNode][adjacentNode];
            if (potentialConnection !== Infinity && !includedNodes.has(adjacentNode) && potentialConnection < minEdgeCostToTree[adjacentNode]) {
                minEdgeCostToTree[adjacentNode] = potentialConnection;
                edgeConnectorQueue.insertElement({ cost: potentialConnection, nodeIdentity: adjacentNode });
            }
        }
    }

    return accumulatedCost;
}

console.log(computeMinTotalConnectivity(connectionGrid, totalVertices));