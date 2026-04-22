class HeapStructure {
    constructor(comparisonFn = (v1, v2) => v1 - v2) {
        this.store = [];
        this.compare = comparisonFn;
    }

    _getParentIndex(idx) { return Math.floor((idx - 1) / 2); }
    _getLeftChildIndex(idx) { return 2 * idx + 1; }
    _getRightChildIndex(idx) { return 2 * idx + 2; }
    _hasLeftChild(idx) { return this._getLeftChildIndex(idx) < this.store.length; }
    _hasRightChild(idx) { return this._getRightChildIndex(idx) < this.store.length; }

    _exchange(idx1, idx2) {
        [this.store[idx1], this.store[idx2]] = [this.store[idx2], this.store[idx1]];
    }

    _heapifyUp(idx) {
        while (idx > 0 && this.compare(this.store[idx], this.store[this._getParentIndex(idx)]) < 0) {
            this._exchange(idx, this._getParentIndex(idx));
            idx = this._getParentIndex(idx);
        }
    }

    _heapifyDown(idx) {
        let preferredChildIdx = idx;
        const left = this._getLeftChildIndex(idx);
        const right = this._getRightChildIndex(idx);

        if (this._hasLeftChild(idx) && this.compare(this.store[left], this.store[preferredChildIdx]) < 0) {
            preferredChildIdx = left;
        }
        if (this._hasRightChild(idx) && this.compare(this.store[right], this.store[preferredChildIdx]) < 0) {
            preferredChildIdx = right;
        }

        if (preferredChildIdx !== idx) {
            this._exchange(idx, preferredChildIdx);
            this._heapifyDown(preferredChildIdx);
        }
    }

    addEntry(item) {
        this.store.push(item);
        this._heapifyUp(this.store.length - 1);
    }

    peekTop() {
        if (this.isEmpty()) return undefined;
        return this.store[0];
    }

    removeTop() {
        if (this.isEmpty()) return undefined;
        if (this.store.length === 1) return this.store.pop();

        const topItem = this.store[0];
        this.store[0] = this.store.pop();
        this._heapifyDown(0);
        return topItem;
    }

    isEmpty() {
        return this.store.length === 0;
    }

    currentSize() {
        return this.store.length;
    }

    getAllItems() {
        return [...this.store];
    }
}

class MinimumHeap extends HeapStructure {
    constructor() {
        super((v1, v2) => v1 - v2);
    }
}

const inputUtility = (function() {
    const sourceContent = require("fs").readFileSync("/dev/stdin", "utf8").trim();
    const sourceLines = sourceContent.split("\n");
    let currentLinePointer = 0;
    let currentLineTokensBuffer = [];

    function acquireNextToken(retrieveAsString = false) {
        if (currentLineTokensBuffer.length === 0) {
            if (currentLinePointer >= sourceLines.length) {
                throw new Error("No more input lines available.");
            }
            currentLineTokensBuffer = sourceLines[currentLinePointer].split(" ").reverse();
        }
        const tokenValue = currentLineTokensBuffer.pop();
        if (currentLineTokensBuffer.length === 0) {
            currentLinePointer++;
        }
        return retrieveAsString ? tokenValue : Number(tokenValue);
    }

    function acquireFullLine(retrieveAsString = false) {
        if (currentLinePointer >= sourceLines.length) {
            throw new Error("No more input lines available.");
        }
        const lineContent = sourceLines[currentLinePointer];
        currentLinePointer++;
        currentLineTokensBuffer = [];
        const values = lineContent.split(" ");
        return retrieveAsString ? values : values.map(Number);
    }

    return {
        fetchValue: acquireNextToken,
        fetchLine: acquireFullLine
    };
})();


function performCalculation() {
    const firstLimit = inputUtility.fetchValue();
    const secondLimit = inputUtility.fetchValue();
    const thirdLimit = inputUtility.fetchValue();
    const targetCount = inputUtility.fetchValue();

    const collectionA = inputUtility.fetchLine().sort((val1, val2) => val2 - val1);
    const collectionB = inputUtility.fetchLine().sort((val1, val2) => val2 - val1);
    const collectionC = inputUtility.fetchLine().sort((val1, val2) => val2 - val1);

    const firstStageResultHeap = new MinimumHeap();
    for (let idxA = 0; idxA < firstLimit; idxA++) {
        for (let idxB = 0; idxB < secondLimit; idxB++) {
            const currentSumAB = collectionA[idxA] + collectionB[idxB];
            if (firstStageResultHeap.currentSize() < targetCount) {
                firstStageResultHeap.addEntry(currentSumAB);
            } else if (currentSumAB > firstStageResultHeap.peekTop()) {
                firstStageResultHeap.removeTop();
                firstStageResultHeap.addEntry(currentSumAB);
            }
        }
    }
    const intermediateSumsSorted = firstStageResultHeap.getAllItems().sort((val1, val2) => val2 - val1);

    const finalResultHeap = new MinimumHeap();
    for (let idxC = 0; idxC < thirdLimit; idxC++) {
        const iterationLimit = Math.min(intermediateSumsSorted.length, targetCount - idxC);
        for (let idxU = 0; idxU < iterationLimit; idxU++) {
            const finalCombinedSum = collectionC[idxC] + intermediateSumsSorted[idxU];
            if (finalResultHeap.currentSize() < targetCount) {
                finalResultHeap.addEntry(finalCombinedSum);
            } else if (finalCombinedSum > finalResultHeap.peekTop()) {
                finalResultHeap.removeTop();
                finalResultHeap.addEntry(finalCombinedSum);
            }
        }
    }
    const finalSumsSorted = finalResultHeap.getAllItems().sort((val1, val2) => val2 - val1);

    return finalSumsSorted.join("\n");
}

console.log(performCalculation());