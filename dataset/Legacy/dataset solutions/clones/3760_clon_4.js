class ValueHeap {
    constructor() {
        this.heapArray = [];
    }

    _getParentIndex(idx) { return Math.floor((idx - 1) / 2); }
    _getLeftChildIndex(idx) { return 2 * idx + 1; }
    _getRightChildIndex(idx) { return 2 * idx + 2; }

    _hasParent(idx) { return this._getParentIndex(idx) >= 0; }
    _hasLeftChild(idx) { return this._getLeftChildIndex(idx) < this.heapArray.length; }
    _hasRightChild(idx) { return this._getRightChildIndex(idx) < this.heapArray.length; }

    _getParent(idx) { return this.heapArray[this._getParentIndex(idx)]; }
    _getLeftChild(idx) { return this.heapArray[this._getLeftChildIndex(idx)]; }
    _getRightChild(idx) { return this.heapArray[this._getRightChildIndex(idx)]; }

    _swapElements(idx1, idx2) {
        [this.heapArray[idx1], this.heapArray[idx2]] = [this.heapArray[idx2], this.heapArray[idx1]];
    }

    peekSmallest() {
        if (this.heapArray.length === 0) return null;
        return this.heapArray[0];
    }

    addValue(item) {
        this.heapArray.push(item);
        this._heapifyUp();
    }

    extractSmallest() {
        if (this.heapArray.length === 0) return null;
        if (this.heapArray.length === 1) return this.heapArray.pop();

        const smallestItem = this.heapArray[0];
        this.heapArray[0] = this.heapArray.pop();
        this._heapifyDown();
        return smallestItem;
    }

    _heapifyUp() {
        let currentIdx = this.heapArray.length - 1;
        while (this._hasParent(currentIdx) && this._getParent(currentIdx) > this.heapArray[currentIdx]) {
            this._swapElements(this._getParentIndex(currentIdx), currentIdx);
            currentIdx = this._getParentIndex(currentIdx);
        }
    }

    _heapifyDown() {
        let currentIdx = 0;
        while (this._hasLeftChild(currentIdx)) {
            let smallerChildIdx = this._getLeftChildIndex(currentIdx);
            if (this._hasRightChild(currentIdx) && this._getRightChild(currentIdx) < this._getLeftChild(currentIdx)) {
                smallerChildIdx = this._getRightChildIndex(currentIdx);
            }

            if (this.heapArray[currentIdx] < this.heapArray[smallerChildIdx]) {
                break;
            } else {
                this._swapElements(currentIdx, smallerChildIdx);
            }
            currentIdx = smallerChildIdx;
        }
    }

    currentSize() {
        return this.heapArray.length;
    }
}

function aggregateTopValues(dataCollection, limit) {
    if (limit === 0) return 0;
    if (dataCollection.length === 0) return 0;

    const minPriorityQueue = new ValueHeap();

    for (const val of dataCollection) {
        if (minPriorityQueue.currentSize() < limit) {
            minPriorityQueue.addValue(val);
        } else if (val > minPriorityQueue.peekSmallest()) {
            minPriorityQueue.extractSmallest();
            minPriorityQueue.addValue(val);
        }
    }

    let totalSum = 0;
    while (minPriorityQueue.currentSize() > 0) {
        totalSum += minPriorityQueue.extractSmallest();
    }
    return totalSum;
}

function processData(rawData) {
    const inputLines = rawData.split('\n');
    const firstLineParts = inputLines[0].split(' ');
    const coordCount = Number(firstLineParts[0]);
    const selectionLimit = Number(firstLineParts[1]);

    const signCombos = [
        [1, 1, 1], [1, 1, -1], [1, -1, 1], [1, -1, -1],
        [-1, 1, 1], [-1, -1, 1], [-1, 1, -1], [-1, -1, -1]
    ];

    const sumAccumulators = Array.from({ length: 8 }, () => []);

    for (let idx = 0; idx < coordCount; idx++) {
        const currentLineParts = inputLines[idx + 1].split(' ');
        const valX = Number(currentLineParts[0]);
        const valY = Number(currentLineParts[1]);
        const valZ = Number(currentLineParts[2]);

        signCombos.forEach((pattern, patternIdx) => {
            sumAccumulators[patternIdx].push(valX * pattern[0] + valY * pattern[1] + valZ * pattern[2]);
        });
    }

    const finalScores = sumAccumulators.map(arr => aggregateTopValues(arr, selectionLimit));

    console.log(String(Math.max(...finalScores)));
}

processData(require('fs').readFileSync('/dev/stdin', 'utf8'));
