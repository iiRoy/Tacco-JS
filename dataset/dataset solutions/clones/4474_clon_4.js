class PriorityQueue {
    constructor() {
        this.heap = [];
    }

    insertValue(element) {
        this.heap.push(element);
        this._bubbleUp();
    }

    extractSmallest() {
        if (this.heap.length === 0) return undefined;
        if (this.heap.length === 1) return this.heap.pop();

        const smallest = this.heap[0];
        this.heap[0] = this.heap.pop();
        this._bubbleDown();
        return smallest;
    }

    retrieveSmallest() {
        return this.heap.length > 0 ? this.heap[0] : undefined;
    }

    countElements() {
        return this.heap.length;
    }

    totalElements() {
        return this.heap.reduce((acc, curr) => acc + curr, 0);
    }

    _bubbleUp() {
        let currentIdx = this.heap.length - 1;
        while (currentIdx > 0) {
            let parentIdx = Math.floor((currentIdx - 1) / 2);
            if (this.heap[currentIdx] < this.heap[parentIdx]) {
                [this.heap[currentIdx], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[currentIdx]];
                currentIdx = parentIdx;
            } else {
                break;
            }
        }
    }

    _bubbleDown() {
        let currentIdx = 0;
        const totalLength = this.heap.length;
        const currentElement = this.heap[0];

        while (true) {
            let leftChildIdx = 2 * currentIdx + 1;
            let rightChildIdx = 2 * currentIdx + 2;
            let swapIdx = null;

            if (leftChildIdx < totalLength) {
                if (this.heap[leftChildIdx] < currentElement) {
                    swapIdx = leftChildIdx;
                }
            }

            if (rightChildIdx < totalLength) {
                if (
                    (swapIdx === null && this.heap[rightChildIdx] < currentElement) ||
                    (swapIdx !== null && this.heap[rightChildIdx] < this.heap[leftChildIdx])
                ) {
                    swapIdx = rightChildIdx;
                }
            }

            if (swapIdx === null) break;
            [this.heap[currentIdx], this.heap[swapIdx]] = [this.heap[swapIdx], this.heap[currentIdx]];
            currentIdx = swapIdx;
        }
    }
}

const computeAggregate = (sourceContent) => {
    const allNumbers = sourceContent.match(/\d+/g).map(Number);

    const totalItemCount = allNumbers[0];
    const selectionCriterion = allNumbers[1];

    const valueCollection = allNumbers.slice(2);

    const largestKeeper = new PriorityQueue();

    for (const val of valueCollection) {
        if (largestKeeper.countElements() < selectionCriterion) {
            largestKeeper.insertValue(val);
        } else if (val > largestKeeper.retrieveSmallest()) {
            largestKeeper.extractSmallest();
            largestKeeper.insertValue(val);
        }
    }

    return largestKeeper.totalElements();
};

const dataAcquisition = require('node:fs');
const inputSource = '/dev/stdin';

const contentBuffer = dataAcquisition.readFileSync(inputSource, 'utf-8');
const finalResult = computeAggregate(contentBuffer);
console.log(finalResult);