const dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');

class PathMinimizer {
    constructor() {
        this.dataHeap = [];
    }

    addSegment(segment) {
        this.dataHeap.push(segment);
        this._heapifyUp();
    }

    extractMinSegment() {
        const smallestSegment = this.dataHeap[0];
        const lastSegment = this.dataHeap.pop();
        if (this.dataHeap.length > 0) {
            this.dataHeap[0] = lastSegment;
            this._heapifyDown();
        }
        return smallestSegment;
    }

    hasSegments() {
        return this.dataHeap.length > 0;
    }

    _heapifyUp() {
        let currentIdx = this.dataHeap.length - 1;
        const currentSegment = this.dataHeap[currentIdx];
        while (currentIdx > 0) {
            let parentIdx = Math.floor((currentIdx - 1) / 2);
            let parentSegment = this.dataHeap[parentIdx];
            if (currentSegment[0] >= parentSegment[0]) break;
            this.dataHeap[parentIdx] = currentSegment;
            this.dataHeap[currentIdx] = parentSegment;
            currentIdx = parentIdx;
        }
    }

    _heapifyDown() {
        let currentIdx = 0;
        const heapLength = this.dataHeap.length;
        const currentSegment = this.dataHeap[0];
        while (true) {
            let leftChildIdx = 2 * currentIdx + 1;
            let rightChildIdx = 2 * currentIdx + 2;
            let leftChildSegment, rightChildSegment;
            let swapIdx = null;

            if (leftChildIdx < heapLength) {
                leftChildSegment = this.dataHeap[leftChildIdx];
                if (leftChildSegment[0] < currentSegment[0]) {
                    swapIdx = leftChildIdx;
                }
            }
            if (rightChildIdx < heapLength) {
                rightChildSegment = this.dataHeap[rightChildIdx];
                if (
                    (swapIdx === null && rightChildSegment[0] < currentSegment[0]) ||
                    (swapIdx !== null && rightChildSegment[0] < leftChildSegment[0])
                ) {
                    swapIdx = rightChildIdx;
                }
            }
            if (swapIdx === null) break;
            this.dataHeap[currentIdx] = this.dataHeap[swapIdx];
            this.dataHeap[swapIdx] = currentSegment;
            currentIdx = swapIdx;
        }
    }
}

const executeGraphCalculations = (sourceData) => {
    const inputLines = sourceData.split('\n').filter(lineContent => lineContent.trim() !== '');
    let currentLineIndex = 0;
    const finalOutputs = [];

    while (true) {
        const dimensions = inputLines[currentLineIndex++].split(' ').map(Number);
        const nodeCount = dimensions[0];
        const linkCount = dimensions[1];

        if (nodeCount === 0 && linkCount === 0) {
            break;
        }

        const startNode = 1;
        const targetNode = nodeCount;
        const maxZeroCostAllowance = 2;

        const connectionMap = Array.from({ length: nodeCount + 1 }, () => []);
        for (let idx = 0; idx < linkCount; idx++) {
            const linkDetail = inputLines[currentLineIndex++].split(' ').map(Number);
            const nodeA = linkDetail[0];
            const nodeB = linkDetail[1];
            const costVal = linkDetail[2];
            connectionMap[nodeA].push([nodeB, costVal]);
            connectionMap[nodeB].push([nodeA, costVal]);
        }

        const pathCosts = Array.from({ length: nodeCount + 1 }, () =>
            Array(maxZeroCostAllowance + 1).fill(Number.MAX_SAFE_INTEGER)
        );

        const pathQueue = new PathMinimizer();

        pathCosts[startNode][0] = 0;
        pathQueue.addSegment([0, startNode, 0]); // [accumulatedCost, currentNode, zeroCostUsed]

        while (pathQueue.hasSegments()) {
            const [currentPathCost, focusNode, currentZeroCostUsed] = pathQueue.extractMinSegment();

            if (currentPathCost > pathCosts[focusNode][currentZeroCostUsed]) {
                continue;
            }

            for (const [connectedNode, connectionCost] of connectionMap[focusNode]) {
                // Scenario 1: Traverse link normally
                if (pathCosts[focusNode][currentZeroCostUsed] + connectionCost < pathCosts[connectedNode][currentZeroCostUsed]) {
                    pathCosts[connectedNode][currentZeroCostUsed] = pathCosts[focusNode][currentZeroCostUsed] + connectionCost;
                    pathQueue.addSegment([pathCosts[connectedNode][currentZeroCostUsed], connectedNode, currentZeroCostUsed]);
                }

                // Scenario 2: Traverse link as a zero-cost link
                if (currentZeroCostUsed < maxZeroCostAllowance) {
                    const nextZeroCostUsed = currentZeroCostUsed + 1;
                    if (pathCosts[focusNode][currentZeroCostUsed] < pathCosts[connectedNode][nextZeroCostUsed]) {
                        pathCosts[connectedNode][nextZeroCostUsed] = pathCosts[focusNode][currentZeroCostUsed];
                        pathQueue.addSegment([pathCosts[connectedNode][nextZeroCostUsed], connectedNode, nextZeroCostUsed]);
                    }
                }
            }
        }

        let overallMinimum = Number.MAX_SAFE_INTEGER;
        overallMinimum = Math.min(overallMinimum, pathCosts[targetNode][0]);
        // The original code effectively makes dp[d][1] = Infinity due to a repetitive reset operation.
        // Thus, paths using exactly one zero-cost edge to the target are not considered for the final answer.
        overallMinimum = Math.min(overallMinimum, pathCosts[targetNode][2]);

        finalOutputs.push(overallMinimum);
    }

    return finalOutputs.join('\n');
};

const finalOutputString = executeGraphCalculations(dataSource);
console.log(finalOutputString);