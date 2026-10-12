class PriorityQueue {
    constructor(priorityComparator = (a, b) => a - b) {
        this.heapStructure = [];
        this.priorityComparator = priorityComparator;
    }

    _getParentIndex(idx) { return Math.floor((idx - 1) / 2); }
    _getLeftChildIndex(idx) { return 2 * idx + 1; }
    _getRightChildIndex(idx) { return 2 * idx + 2; }

    _hasParent(idx) { return this._getParentIndex(idx) >= 0; }
    _hasLeftChild(idx) { return this._getLeftChildIndex(idx) < this.heapStructure.length; }
    _hasRightChild(idx) { return this._getRightChildIndex(idx) < this.heapStructure.length; }

    _getParent(idx) { return this.heapStructure[this._getParentIndex(idx)]; }
    _getLeftChild(idx) { return this.heapStructure[this._getLeftChildIndex(idx)]; }
    _getRightChild(idx) { return this.heapStructure[this._getRightChildIndex(idx)]; }

    _exchange(idx1, idx2) {
        [this.heapStructure[idx1], this.heapStructure[idx2]] = [this.heapStructure[idx2], this.heapStructure[idx1]];
    }

    peekTop() {
        if (this.heapStructure.length === 0) return null;
        return this.heapStructure[0];
    }

    add(item) {
        this.heapStructure.push(item);
        this._bubbleUp();
    }

    extractTop() {
        if (this.heapStructure.length === 0) return null;
        if (this.heapStructure.length === 1) return this.heapStructure.pop();

        const topItem = this.heapStructure[0];
        this.heapStructure[0] = this.heapStructure.pop();
        this._bubbleDown();
        return topItem;
    }

    _bubbleUp() {
        let currentIdx = this.heapStructure.length - 1;
        while (this._hasParent(currentIdx) && this.priorityComparator(this.heapStructure[currentIdx], this._getParent(currentIdx)) > 0) {
            this._exchange(currentIdx, this._getParentIndex(currentIdx));
            currentIdx = this._getParentIndex(currentIdx);
        }
    }

    _bubbleDown() {
        let currentIdx = 0;
        while (this._hasLeftChild(currentIdx)) {
            let higherPriorityChildIdx = this._getLeftChildIndex(currentIdx);
            if (this._hasRightChild(currentIdx) && this.priorityComparator(this._getRightChild(currentIdx), this._getLeftChild(currentIdx)) > 0) {
                higherPriorityChildIdx = this._getRightChildIndex(currentIdx);
            }

            if (this.priorityComparator(this.heapStructure[currentIdx], this.heapStructure[higherPriorityChildIdx]) > 0) {
                break;
            } else {
                this._exchange(currentIdx, higherPriorityChildIdx);
                currentIdx = higherPriorityChildIdx;
            }
        }
    }

    currentSize() {
        return this.heapStructure.length;
    }
}

function processInputData(rawInput) {
    const allLines = rawInput.trim().split("\n");
    const configParts = allLines[0].split(" ");
    const targetCount = parseInt(configParts[1], 10);
    const dataValues = allLines[1].split(" ").map(Number);

    // Use a Max-Heap to keep track of the 'targetCount' smallest elements.
    // The comparator (a, b) => a - b makes it a Max-Heap, where larger values have higher priority (bubble up).
    // This way, the largest of the 'targetCount' smallest elements is always at the root.
    const maxHeapForSmallestK = new PriorityQueue((a, b) => a - b);

    for (const val of dataValues) {
        if (maxHeapForSmallestK.currentSize() < targetCount) {
            maxHeapForSmallestK.add(val);
        } else if (targetCount > 0 && val < maxHeapForSmallestK.peekTop()) {
            maxHeapForSmallestK.extractTop();
            maxHeapForSmallestK.add(val);
        }
    }

    const finalSum = Array.from({ length: maxHeapForSmallestK.currentSize() }, () => maxHeapForSmallestK.extractTop())
                         .reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    console.log(finalSum);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
