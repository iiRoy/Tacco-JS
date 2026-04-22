class CoordinateHeap {
    constructor() { this.store = []; }
    checkTop() { return this.store.length === 0 ? null : this.store[0]; }
    insertElement(element) {
        this.store.push(element);
        this._bubbleUp(this.store.length - 1);
    }
    extractSmallest() {
        if (this.store.length === 0) return null;
        if (this.store.length === 1) return this.store.pop();
        const smallest = this.store[0];
        this.store[0] = this.store.pop();
        this._sinkDown(0);
        return smallest;
    }
    _bubbleUp(idx) {
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            if (this.store[parentIdx][0] <= this.store[idx][0]) break;
            [this.store[parentIdx], this.store[idx]] = [this.store[idx], this.store[parentIdx]];
            idx = parentIdx;
        }
    }
    _sinkDown(idx) {
        const lastIdx = this.store.length - 1;
        while (true) {
            let leftChild = 2 * idx + 1;
            let rightChild = 2 * idx + 2;
            let smallest = idx;

            if (leftChild <= lastIdx && this.store[leftChild][0] < this.store[smallest][0]) {
                smallest = leftChild;
            }
            if (rightChild <= lastIdx && this.store[rightChild][0] < this.store[smallest][0]) {
                smallest = rightChild;
            }

            if (smallest !== idx) {
                [this.store[smallest], this.store[idx]] = [this.store[idx], this.store[smallest]];
                idx = smallest;
            } else {
                break;
            }
        }
    }
    get currentSize() { return this.store.length; }
}

function parseAllInput(inputString) {
    const lines = inputString.trim().split("\n");
    const firstLineTokens = lines[0].split(" ").map(Number);
    const numItems = firstLineTokens.pop();
    const distanceThreshold = firstLineTokens.pop();
    const influenceFactor = firstLineTokens.pop();

    const itemCoordinates = lines.slice(1, numItems + 1).map(line => {
        const parts = line.split(" ").map(Number);
        return { pos: parts[0], val: parts[1] };
    });

    itemCoordinates.sort((a, b) => a.pos - b.pos);

    return {
        itemCount: numItems,
        spanDistance: distanceThreshold,
        effectMultiplier: influenceFactor,
        coordinatePairs: itemCoordinates
    };
}

function calculateTotalEffect(parameters) {
    const { spanDistance, effectMultiplier, coordinatePairs } = parameters;

    let overallTally = 0;
    let currentAccumulatedInfluence = 0;
    const activeEffectQueue = new CoordinateHeap();

    for (const item of coordinatePairs) {
        while (activeEffectQueue.currentSize > 0 && activeEffectQueue.checkTop()[0] < item.pos - spanDistance) {
            const expiredEffect = activeEffectQueue.extractSmallest();
            currentAccumulatedInfluence -= expiredEffect[1] * effectMultiplier;
        }

        const deficit = item.val - currentAccumulatedInfluence * effectMultiplier;

        if (deficit > 0) {
            const unitsRequired = Math.ceil(deficit / effectMultiplier);
            activeEffectQueue.insertElement([item.pos + spanDistance, unitsRequired]);
            overallTally += unitsRequired;
            currentAccumulatedInfluence += unitsRequired * effectMultiplier;
        }
    }
    return overallTally;
}

const systemInput = require("fs").readFileSync("/dev/stdin", "utf8");
const processedData = parseAllInput(systemInput);
const finalResult = calculateTotalEffect(processedData);
console.log(finalResult);