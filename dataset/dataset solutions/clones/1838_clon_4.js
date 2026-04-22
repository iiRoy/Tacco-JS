const rawSourceContent = require("fs").readFileSync("/dev/stdin", "utf8");

const sourceIterator = (() => {
    const dataSegments = rawSourceContent.split(/\s+/).filter(Boolean);
    let currentPointer = 0;
    return {
        retrieveValue: () => {
            const segment = dataSegments[currentPointer++];
            return BigInt(segment);
        }
    };
})();

class OrderedVault {
    constructor() {
        this._storage = [];
    }

    _bubbleUp(idx) {
        if (idx === 0) return;
        const parentIdx = (idx - 1) >> 1;
        if (this._storage[parentIdx][0] > this._storage[idx][0]) {
            [this._storage[parentIdx], this._storage[idx]] = [this._storage[idx], this._storage[parentIdx]];
            this._bubbleUp(parentIdx);
        }
    }

    _sinkDown(idx) {
        const leftChild = (idx << 1) + 1;
        const rightChild = (idx << 1) + 2;
        let smallestChild = idx;

        if (leftChild < this._storage.length && this._storage[leftChild][0] < this._storage[smallestChild][0]) {
            smallestChild = leftChild;
        }
        if (rightChild < this._storage.length && this._storage[rightChild][0] < this._storage[smallestChild][0]) {
            smallestChild = rightChild;
        }

        if (smallestChild !== idx) {
            [this._storage[idx], this._storage[smallestChild]] = [this._storage[smallestChild], this._storage[idx]];
            this._sinkDown(smallestChild);
        }
    }

    deposit(priorityValue, associatedNode) {
        this._storage.push([priorityValue, associatedNode]);
        this._bubbleUp(this._storage.length - 1);
    }

    extractMinElement() {
        if (this._storage.length === 0) return undefined;
        if (this._storage.length === 1) return this._storage.pop();

        const minElement = this._storage[0];
        this._storage[0] = this._storage.pop();
        this._sinkDown(0);
        return minElement;
    }

    get currentSize() {
        return this._storage.length;
    }

    get topElement() {
        return this._storage[0];
    }
}

const selectMinimum = (valA, valB) => valA < valB ? valA : valB;

function determineShortestPath() {
    const loopCount = sourceIterator.retrieveValue();
    const resultCollector = [];

    for (let currentLoop = 0; currentLoop < loopCount; currentLoop++) {
        const startingPoint = sourceIterator.retrieveValue();
        const operationWeights = [
            sourceIterator.retrieveValue(),
            sourceIterator.retrieveValue(),
            sourceIterator.retrieveValue()
        ];

        const baseTraversalCost = sourceIterator.retrieveValue();

        const precomputedCosts = new Array(5);
        precomputedCosts[0] = 0n;
        precomputedCosts[1] = baseTraversalCost;
        precomputedCosts[2] = baseTraversalCost + selectMinimum(baseTraversalCost, operationWeights[0]);
        precomputedCosts[3] = baseTraversalCost + selectMinimum(precomputedCosts[2], operationWeights[1]);
        
        let optionA = precomputedCosts[3] + baseTraversalCost;
        let optionB = precomputedCosts[2] + operationWeights[0];
        let optionC = baseTraversalCost + operationWeights[2];
        
        let minOption = selectMinimum(optionA, optionB);
        minOption = selectMinimum(minOption, optionC);
        precomputedCosts[4] = minOption;

        const pathExplorer = new OrderedVault();
        pathExplorer.deposit(0n, startingPoint);
        const discoveredPaths = new Map();
        discoveredPaths.set(startingPoint, 0n);

        while (pathExplorer.currentSize > 0) {
            const [currentPathCost, currentNode] = pathExplorer.extractMinElement();

            if (discoveredPaths.has(currentNode) && discoveredPaths.get(currentNode) < currentPathCost) {
                continue;
            }

            if (currentNode === 0n) {
                resultCollector.push(currentPathCost.toString());
                break;
            }

            if (currentNode < 5n) {
                const finalCostToZero = currentPathCost + precomputedCosts[Number(currentNode)];
                if (!discoveredPaths.has(0n) || discoveredPaths.get(0n) > finalCostToZero) {
                    discoveredPaths.set(0n, finalCostToZero);
                    pathExplorer.deposit(finalCostToZero, 0n);
                }
                continue;
            }

            const primeDivisors = [2n, 3n, 5n];
            for (let i = 0; i < 3; i++) {
                const divisor = primeDivisors[i];
                const opWeight = operationWeights[i];

                const targetNodeFloor = currentNode / divisor;
                let costToFloor = opWeight + baseTraversalCost * (currentNode % divisor);
                let costBySubtracting = (currentNode - targetNodeFloor) * baseTraversalCost;
                costToFloor = selectMinimum(costToFloor, costBySubtracting);

                const totalCostFloor = currentPathCost + costToFloor;
                if (!discoveredPaths.has(targetNodeFloor) || discoveredPaths.get(targetNodeFloor) > totalCostFloor) {
                    discoveredPaths.set(targetNodeFloor, totalCostFloor);
                    pathExplorer.deposit(totalCostFloor, targetNodeFloor);
                }

                if (currentNode % divisor !== 0n) {
                    const targetNodeCeil = targetNodeFloor + 1n;
                    let costToCeil = opWeight + baseTraversalCost * (divisor - (currentNode % divisor));
                    let costBySubtractingCeil = (currentNode - targetNodeCeil) * baseTraversalCost;
                    costToCeil = selectMinimum(costToCeil, costBySubtractingCeil);

                    const totalCostCeil = currentPathCost + costToCeil;
                    if (!discoveredPaths.has(targetNodeCeil) || discoveredPaths.get(targetNodeCeil) > totalCostCeil) {
                        discoveredPaths.set(targetNodeCeil, totalCostCeil);
                        pathExplorer.deposit(totalCostCeil, targetNodeCeil);
                    }
                }
            }
        }
    }
    return resultCollector.join('\n');
}

const finalOutput = determineShortestPath();
if (finalOutput !== undefined && finalOutput !== '') console.log(finalOutput);