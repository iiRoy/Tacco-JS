let inputBuffer = [];
let inputBufferIndex = 0;
function readline() {
    if (inputBufferIndex < inputBuffer.length) {
        return inputBuffer[inputBufferIndex++];
    }
    return ""; 
}

function parseInteger() {
    return parseInt(readline());
}

function parseBigInteger() {
    return BigInt(readline());
}

function parseIntegers() {
    return readline().split(' ').map(Number);
}

function parseBigIntegers() {
    return readline().split(' ').map(BigInt);
}

class PriorityQueueMin {
    constructor() {
        this.dataStore = [];
    }

    getIdxParent(idx) { return Math.floor((idx - 1) / 2); }
    getIdxLeftChild(idx) { return 2 * idx + 1; }
    getIdxRightChild(idx) { return 2 * idx + 2; }

    exchangeElements(idx1, idx2) {
        [this.dataStore[idx1], this.dataStore[idx2]] = [this.dataStore[idx2], this.dataStore[idx1]];
    }

    viewTop() {
        if (this.dataStore.length === 0) return null;
        return this.dataStore[0];
    }

    extractMin() {
        const currentSize = this.dataStore.length;
        if (currentSize === 0) return null;
        if (currentSize === 1) return this.dataStore.pop();

        const minimumItem = this.dataStore[0];
        this.dataStore[0] = this.dataStore.pop();
        this.sinkDown();
        return minimumItem;
    }

    insertElement(item) {
        this.dataStore.push(item);
        this.bubbleUp();
    }

    bubbleUp() {
        let currentIdx = this.dataStore.length - 1;
        while (currentIdx > 0) {
            const parentIdx = this.getIdxParent(currentIdx);
            if (this.dataStore[parentIdx][0] > this.dataStore[currentIdx][0]) {
                this.exchangeElements(parentIdx, currentIdx);
                currentIdx = parentIdx;
            } else {
                break;
            }
        }
    }

    sinkDown() {
        let currentIdx = 0;
        const lastIdx = this.dataStore.length - 1;

        while (true) {
            let leftChildIdx = this.getIdxLeftChild(currentIdx);
            let rightChildIdx = this.getIdxRightChild(currentIdx);
            let smallestChildIdx = currentIdx;

            if (leftChildIdx <= lastIdx && this.dataStore[leftChildIdx][0] < this.dataStore[smallestChildIdx][0]) {
                smallestChildIdx = leftChildIdx;
            }

            if (rightChildIdx <= lastIdx && this.dataStore[rightChildIdx][0] < this.dataStore[smallestChildIdx][0]) {
                smallestChildIdx = rightChildIdx;
            }

            if (smallestChildIdx !== currentIdx) {
                this.exchangeElements(currentIdx, smallestChildIdx);
                currentIdx = smallestChildIdx;
            } else {
                break;
            }
        }
    }

    getElementCount() {
        return this.dataStore.length;
    }
}

function bigIntMax(valA, valB) {
    return valA > valB ? valA : valB;
}

function computeShortestPaths(sourceVertex, adjList, pathCosts) {
    const minHeap = new PriorityQueueMin();
    const initialLargeCost = BigInt('1000000000000000000'); 

    for (let i = 0; i < adjList.length; i++) {
        pathCosts[i] = initialLargeCost;
    }
    
    pathCosts[sourceVertex] = 0n;
    minHeap.insertElement([0n, sourceVertex]);

    while (minHeap.getElementCount() > 0) {
        const [currentPathCost, currentVertex] = minHeap.extractMin();

        if (currentPathCost > pathCosts[currentVertex]) {
            continue;
        }

        for (const edgeInfo of adjList[currentVertex]) {
            const adjacentVertex = edgeInfo[0];
            const connectionWeight = BigInt(edgeInfo[1]); 

            const potentialNewCost = currentPathCost + connectionWeight;

            if (potentialNewCost < pathCosts[adjacentVertex]) {
                pathCosts[adjacentVertex] = potentialNewCost;
                minHeap.insertElement([potentialNewCost, adjacentVertex]);
            }
        }
    }
}

function executeSolution() {
    const [vertexCount, edgeCount] = parseIntegers();
    let [sourceA, targetB] = parseIntegers();
    sourceA--; 
    targetB--; 

    const graphOne = Array.from({ length: vertexCount }, () => []);
    const graphTwo = Array.from({ length: vertexCount }, () => []);

    const processEdgeInput = (u, v, costA, costB) => {
        const nodeU = u - 1;
        const nodeV = v - 1;

        graphOne[nodeU].push([nodeV, costA]);
        graphOne[nodeV].push([nodeU, costA]); 
        graphTwo[nodeU].push([nodeV, costB]);
        graphTwo[nodeV].push([nodeU, costB]); 
    };

    for (let i = 0; i < edgeCount; i++) {
        const [u, v] = parseIntegers();
        const [weightA, weightB] = parseIntegers();
        processEdgeInput(u, v, weightA, weightB);
    }

    const distancesFromSourceA = new Array(vertexCount);
    const distancesToTargetB = new Array(vertexCount);

    computeShortestPaths(sourceA, graphOne, distancesFromSourceA);
    computeShortestPaths(targetB, graphTwo, distancesToTargetB); 

    let overallMaxBenefit = 0n;
    const baseValueConstant = 1000000000000000n; 
    const finalBenefits = new Array(vertexCount);

    for (let i = vertexCount - 1; i >= 0; i--) {
        const currentBenefitCandidate = baseValueConstant - distancesFromSourceA[i] - distancesToTargetB[i];
        overallMaxBenefit = bigIntMax(overallMaxBenefit, currentBenefitCandidate);
        finalBenefits[i] = overallMaxBenefit;
    }

    for (let i = vertexCount - 1; i >= 0; i--) {
        console.log(finalBenefits[i].toString());
    }
}

executeSolution();
