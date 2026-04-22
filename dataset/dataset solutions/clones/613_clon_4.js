const fs = require('fs');
let dataAccumulator = [];
let dataChunk;
const bufferCapacity = 1024;

try {
    while (true) {
        dataChunk = Buffer.alloc(bufferCapacity);
        let bytesAcquired = fs.readSync(0, dataChunk, 0, bufferCapacity, null);
        if (bytesAcquired === 0) {
            break;
        }
        dataAccumulator.push(dataChunk.toString('utf8', 0, bytesAcquired));
    }
} catch (readingError) {
    // Error management for input stream, typically not an issue in competitive programming.
}
const completeSourceContent = dataAccumulator.join('');

const extractedNumbersAsStrings = completeSourceContent.match(/\d+/g);
const numericalEntities = extractedNumbersAsStrings.map(Number);

const entityCount = numericalEntities[0];
const relevantDataset = numericalEntities.slice(1, entityCount + 1);

const generateAllUniquePairwiseSums = (collectionOfValues) => {
    return collectionOfValues.reduce((summationRecords, primaryValue, primaryIndex) => {
        const subsequentValues = collectionOfValues.slice(primaryIndex + 1);
        const currentGroupSums = subsequentValues.map(secondaryValue => primaryValue + secondaryValue);
        return summationRecords.concat(currentGroupSums);
    }, []);
};

const allComputedSums = generateAllUniquePairwiseSums(relevantDataset);

class RankedDataContainer {
    constructor(comparisonStrategy = (firstElement, secondElement) => firstElement - secondElement) {
        this.internalArray = [];
        this.orderingRule = comparisonStrategy;
    }

    _retrieveParentIdx(currentPosition) { return Math.floor((currentPosition - 1) / 2); }
    _retrieveLeftChildIdx(currentPosition) { return 2 * currentPosition + 1; }
    _retrieveRightChildIdx(currentPosition) { return 2 * currentPosition + 2; }

    _swapElements(posA, posB) {
        [this.internalArray[posA], this.internalArray[posB]] = [this.internalArray[posB], this.internalArray[posA]];
    }

    _percolateUp(startingIdx) {
        let current = startingIdx;
        while (current > 0 && this.orderingRule(this.internalArray[current], this.internalArray[this._retrieveParentIdx(current)]) > 0) {
            this._swapElements(current, this._retrieveParentIdx(current));
            current = this._retrieveParentIdx(current);
        }
    }

    _percolateDown(startingIdx) {
        let dominantIdx = startingIdx;
        const left = this._retrieveLeftChildIdx(startingIdx);
        const right = this._retrieveRightChildIdx(startingIdx);

        if (left < this.getSize() && this.orderingRule(this.internalArray[left], this.internalArray[dominantIdx]) > 0) {
            dominantIdx = left;
        }
        if (right < this.getSize() && this.orderingRule(this.internalArray[right], this.internalArray[dominantIdx]) > 0) {
            dominantIdx = right;
        }

        if (dominantIdx !== startingIdx) {
            this._swapElements(startingIdx, dominantIdx);
            this._percolateDown(dominantIdx);
        }
    }

    addValue(elementItem) {
        this.internalArray.push(elementItem);
        this._percolateUp(this.internalArray.length - 1);
    }

    extractTopmost() {
        if (this.getSize() === 0) return undefined;
        if (this.getSize() === 1) return this.internalArray.pop();

        const topmostElement = this.internalArray[0];
        this.internalArray[0] = this.internalArray.pop();
        this._percolateDown(0);
        return topmostElement;
    }

    peekTopmost() {
        return this.internalArray.length > 0 ? this.internalArray[0] : undefined;
    }

    getSize() {
        return this.internalArray.length;
    }
}

const targetPosition = 3;
// For finding the Kth smallest element, a Max-Heap of size K is used.
// The comparator (valA, valB) => valA - valB makes it a Max-Heap
// because if valA > valB, then valA - valB > 0, meaning valA has higher priority and bubbles up.
const topKSmallestTracker = new RankedDataContainer((valA, valB) => valA - valB);

for (const currentSumValue of allComputedSums) {
    if (topKSmallestTracker.getSize() < targetPosition) {
        topKSmallestTracker.addValue(currentSumValue);
    } else if (currentSumValue < topKSmallestTracker.peekTopmost()) {
        topKSmallestTracker.extractTopmost();
        topKSmallestTracker.addValue(currentSumValue);
    }
}

console.log(topKSmallestTracker.peekTopmost());