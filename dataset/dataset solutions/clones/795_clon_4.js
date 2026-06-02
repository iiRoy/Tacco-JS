class MinHeap {
    constructor() {
        this._heap = [];
    }

    _getParentIndex(childIndex) {
        return Math.floor((childIndex - 1) / 2);
    }

    _getLeftChildIndex(parentIndex) {
        return 2 * parentIndex + 1;
    }

    _getRightChildIndex(parentIndex) {
        return 2 * parentIndex + 2;
    }

    _hasParent(index) {
        return this._getParentIndex(index) >= 0;
    }

    _hasLeftChild(index) {
        return this._getLeftChildIndex(index) < this._heap.length;
    }

    _hasRightChild(index) {
        return this._getRightChildIndex(index) < this._heap.length;
    }

    _getParent(index) {
        return this._heap[this._getParentIndex(index)];
    }

    _getLeftChild(index) {
        return this._heap[this._getLeftChildIndex(index)];
    }

    _getRightChild(index) {
        return this._heap[this._getRightChildIndex(index)];
    }

    _swap(indexOne, indexTwo) {
        const tempVal = this._heap[indexOne];
        this._heap[indexOne] = this._heap[indexTwo];
        this._heap[indexTwo] = tempVal;
    }

    peek() {
        if (this._heap.length === 0) {
            return null;
        }
        return this._heap[0];
    }

    extractMin() {
        if (this._heap.length === 0) {
            return null;
        }
        if (this._heap.length === 1) {
            return this._heap.pop();
        }

        const item = this._heap[0];
        this._heap[0] = this._heap.pop();
        this._heapifyDown();
        return item;
    }

    insert(item) {
        this._heap.push(item);
        this._heapifyUp();
    }

    _heapifyUp() {
        let currentIdx = this._heap.length - 1;
        while (this._hasParent(currentIdx) && this._getParent(currentIdx) > this._heap[currentIdx]) {
            this._swap(this._getParentIndex(currentIdx), currentIdx);
            currentIdx = this._getParentIndex(currentIdx);
        }
    }

    _heapifyDown() {
        let currentIdx = 0;
        while (this._hasLeftChild(currentIdx)) {
            let smallestIdx = this._getLeftChildIndex(currentIdx);
            if (this._hasRightChild(currentIdx) && this._getRightChild(currentIdx) < this._getLeftChild(currentIdx)) {
                smallestIdx = this._getRightChildIndex(currentIdx);
            }

            if (this._heap[currentIdx] < this._heap[smallestIdx]) {
                break;
            } else {
                this._swap(currentIdx, smallestIdx);
            }
            currentIdx = smallestIdx;
        }
    }

    size() {
        return this._heap.length;
    }

    isEmpty() {
        return this._heap.length === 0;
    }
}

const rawInputData = require('fs').readFileSync('/dev/stdin', 'utf8');
let inputLines = rawInputData.trim().split("\n");

while (true) {
    let activityCount = Number(inputLines.shift());
    if (activityCount === 0) {
        break;
    }

    const eventIntervals = [];
    for (let i = 0; i < activityCount; i++) {
        const timePairStrings = inputLines.shift().split(" ");
        const beginTimeComponents = timePairStrings[0].split(":").map(Number);
        const finishTimeComponents = timePairStrings[1].split(":").map(Number);

        const beginSeconds = beginTimeComponents[0] * 3600 + beginTimeComponents[1] * 60 + beginTimeComponents[2];
        const finishSeconds = finishTimeComponents[0] * 3600 + finishTimeComponents[1] * 60 + finishTimeComponents[2];
        eventIntervals.push([beginSeconds, finishSeconds]);
    }

    eventIntervals.sort((first, second) => first[0] - second[0]);

    const resourceReleaseTimesHeap = new MinHeap();
    let requiredResources = 0;

    for (const currentInterval of eventIntervals) {
        const [currentBegin, currentFinish] = currentInterval;

        while (!resourceReleaseTimesHeap.isEmpty() && resourceReleaseTimesHeap.peek() <= currentBegin) {
            resourceReleaseTimesHeap.extractMin();
        }

        resourceReleaseTimesHeap.insert(currentFinish);
        
        requiredResources = Math.max(requiredResources, resourceReleaseTimesHeap.size());
    }

    console.log(requiredResources);
}
