class MinPriorityQueue {
    constructor() {
        this._heapElements = [];
    }

    _getParentIndex(idx) { return Math.floor((idx - 1) / 2); }
    _getLeftChildIndex(idx) { return 2 * idx + 1; }
    _getRightChildIndex(idx) { return 2 * idx + 2; }

    _hasParent(idx) { return this._getParentIndex(idx) >= 0; }
    _hasLeftChild(idx) { return this._getLeftChildIndex(idx) < this._heapElements.length; }
    _hasRightChild(idx) { return this._getRightChildIndex(idx) < this._heapElements.length; }

    _getParent(idx) { return this._heapElements[this._getParentIndex(idx)]; }
    _getLeftChild(idx) { return this._heapElements[this._getLeftChildIndex(idx)]; }
    _getRightChild(idx) { return this._heapElements[this._getRightChildIndex(idx)]; }

    _swapElements(idx1, idx2) {
        [this._heapElements[idx1], this._heapElements[idx2]] = [this._heapElements[idx2], this._heapElements[idx1]];
    }

    _bubbleUp() {
        let currentIdx = this._heapElements.length - 1;
        while (this._hasParent(currentIdx) && this._getParent(currentIdx)[0] > this._heapElements[currentIdx][0]) {
            this._swapElements(currentIdx, this._getParentIndex(currentIdx));
            currentIdx = this._getParentIndex(currentIdx);
        }
    }

    _bubbleDown() {
        let currentIdx = 0;
        while (this._hasLeftChild(currentIdx)) {
            let smallerChildIdx = this._getLeftChildIndex(currentIdx);
            if (this._hasRightChild(currentIdx) && this._getRightChild(currentIdx)[0] < this._getLeftChild(currentIdx)[0]) {
                smallerChildIdx = this._getRightChildIndex(currentIdx);
            }

            if (this._heapElements[currentIdx][0] < this._heapElements[smallerChildIdx][0]) {
                break;
            } else {
                this._swapElements(currentIdx, smallerChildIdx);
            }
            currentIdx = smallerChildIdx;
        }
    }

    enqueue(item) {
        this._heapElements.push(item);
        this._bubbleUp();
    }

    dequeueMin() {
        if (this._heapElements.length === 0) return null;
        if (this._heapElements.length === 1) return this._heapElements.pop();

        const minItem = this._heapElements[0];
        this._heapElements[0] = this._heapElements.pop();
        this._bubbleDown();
        return minItem;
    }

    isEmpty() {
        return this._heapElements.length === 0;
    }
}

class InputProcessor {
    constructor(rawInput) {
        this._sourceLines = rawInput.trim().split("\n");
        this._currentLinePointer = 0;
        this._currentLineTokens = null;
    }

    _loadNextLineTokens() {
        if (this._currentLinePointer >= this._sourceLines.length) {
            throw new Error("Input exhausted.");
        }
        this._currentLineTokens = this._sourceLines[this._currentLinePointer].split(" ").reverse();
        this._currentLinePointer++;
    }

    retrieveNumber(asString = false) {
        if (this._currentLineTokens === null || this._currentLineTokens.length === 0) {
            this._loadNextLineTokens();
        }
        const value = this._currentLineTokens.pop();
        return asString ? value : +value;
    }

    retrieveLine(asStrings = false) {
        if (this._currentLinePointer >= this._sourceLines.length) {
            throw new Error("Input exhausted.");
        }
        const lineContent = this._sourceLines[this._currentLinePointer++];
        this._currentLineTokens = null;
        return asStrings ? lineContent.split(" ") : lineContent.split(" ").map(Number);
    }

    retrieveMatrix(rowCount, asStrings = false) {
        const resultMatrix = [];
        for (let i = 0; i < rowCount; i++) {
            resultMatrix.push(this.retrieveLine(asStrings));
        }
        return resultMatrix;
    }

    retrieveVector(elementCount, asStrings = false) {
        const resultVector = [];
        for (let i = 0; i < elementCount; i++) {
            if (this._currentLinePointer >= this._sourceLines.length) {
                throw new Error("Input exhausted.");
            }
            const lineContent = this._sourceLines[this._currentLinePointer++];
            this._currentLineTokens = null;
            resultVector.push(asStrings ? lineContent : +lineContent);
        }
        return resultVector;
    }
}

function buildMultiArray(dimensions, initialValue) {
    const recursiveBuilder = (remainingDimensions) => {
        if (remainingDimensions.length === 1) {
            return Array(remainingDimensions[0]).fill(initialValue);
        }
        const currentSize = remainingDimensions[0];
        const nextDimensions = remainingDimensions.slice(1);
        return Array(currentSize).fill(null).map(() => recursiveBuilder(nextDimensions));
    };
    return recursiveBuilder(dimensions);
}

const MAX_COST = 1e9;

console.log(solveProblem());

function solveProblem() {
    const inputSource = new InputProcessor(require("fs").readFileSync("/dev/stdin", "utf8"));

    const itemCount = inputSource.retrieveNumber();
    const keyCount = inputSource.retrieveNumber();

    const keyCosts = Array(keyCount);
    const keyMasks = Array(keyCount);

    for (let k = 0; k < keyCount; k++) {
        keyCosts[k] = inputSource.retrieveNumber();
        const coveredItemsCount = inputSource.retrieveNumber();
        let currentItemMask = 0;
        for (let j = 0; j < coveredItemsCount; j++) {
            const itemIdentifier = inputSource.retrieveNumber();
            currentItemMask |= (1 << (itemIdentifier - 1));
        }
        keyMasks[k] = currentItemMask;
    }

    const allItemsCoveredMask = (1 << itemCount) - 1;
    const minCosts = buildMultiArray([1 << itemCount], MAX_COST);
    minCosts[0] = 0;

    const stateQueue = new MinPriorityQueue();
    stateQueue.enqueue([0, 0]); // [cost, state_mask]

    while (!stateQueue.isEmpty()) {
        const [currentAccumulatedCost, currentStateMask] = stateQueue.dequeueMin();

        if (currentAccumulatedCost > minCosts[currentStateMask]) {
            continue;
        }

        for (let k = 0; k < keyCount; k++) {
            const nextStateMask = currentStateMask | keyMasks[k];
            const newTotalCost = currentAccumulatedCost + keyCosts[k];

            if (newTotalCost < minCosts[nextStateMask]) {
                minCosts[nextStateMask] = newTotalCost;
                stateQueue.enqueue([newTotalCost, nextStateMask]);
            }
        }
    }

    return minCosts[allItemsCoveredMask] === MAX_COST ? -1 : minCosts[allItemsCoveredMask];
}
