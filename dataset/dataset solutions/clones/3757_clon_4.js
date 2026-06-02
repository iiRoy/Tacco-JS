class MinHeap {
    constructor() {
        this.heapArray = [];
    }

    getLeftChildIndex(parentIdx) { return 2 * parentIdx + 1; }
    getRightChildIndex(parentIdx) { return 2 * parentIdx + 2; }
    getParentIndex(childIdx) { return Math.floor((childIdx - 1) / 2); }

    hasLeftChild(idx) { return this.getLeftChildIndex(idx) < this.heapArray.length; }
    hasRightChild(idx) { return this.getRightChildIndex(idx) < this.heapArray.length; }
    hasParent(idx) { return this.getParentIndex(idx) >= 0; }

    leftChild(idx) { return this.heapArray[this.getLeftChildIndex(idx)]; }
    rightChild(idx) { return this.heapArray[this.getRightChildIndex(idx)]; }
    parent(idx) { return this.heapArray[this.getParentIndex(idx)]; }

    swapElements(idxOne, idxTwo) {
        [this.heapArray[idxOne], this.heapArray[idxTwo]] = [this.heapArray[idxTwo], this.heapArray[idxOne]];
    }

    peekMinimum() {
        if (this.heapArray.length === 0) return null;
        return this.heapArray[0];
    }

    insertValue(item) {
        this.heapArray.push(item);
        this.heapifyUpward();
    }

    extractMinimum() {
        if (this.heapArray.length === 0) return null;
        if (this.heapArray.length === 1) return this.heapArray.pop();

        const minItem = this.heapArray[0];
        this.heapArray[0] = this.heapArray.pop();
        this.heapifyDownward();
        return minItem;
    }

    heapifyUpward() {
        let currentIdx = this.heapArray.length - 1;
        while (this.hasParent(currentIdx) && this.parent(currentIdx) > this.heapArray[currentIdx]) {
            this.swapElements(this.getParentIndex(currentIdx), currentIdx);
            currentIdx = this.getParentIndex(currentIdx);
        }
    }

    heapifyDownward() {
        let currentIdx = 0;
        while (this.hasLeftChild(currentIdx)) {
            let smallerChildIdx = this.getLeftChildIndex(currentIdx);
            if (this.hasRightChild(currentIdx) && this.rightChild(currentIdx) < this.leftChild(currentIdx)) {
                smallerChildIdx = this.getRightChildIndex(currentIdx);
            }

            if (this.heapArray[currentIdx] < this.heapArray[smallerChildIdx]) {
                break;
            } else {
                this.swapElements(currentIdx, smallerChildIdx);
            }
            currentIdx = smallerChildIdx;
        }
    }

    get currentSize() {
        return this.heapArray.length;
    }
}

function Main(inputContent) {
    const inputLines = inputContent.split('\n');
    const firstLineData = inputLines.shift().split(' ');
    const totalEntries = Number(firstLineData[0]);
    const entriesToSelect = Number(firstLineData[1]);

    if (entriesToSelect === 0) {
        console.log(0);
        return;
    }

    const largestEntriesHeap = new MinHeap();

    for (let i = 0; i < totalEntries; i++) {
        const currentEntryLine = inputLines.shift();
        const numericComponents = currentEntryLine.split(' ').map(Number);
        let entrySum = 0;
        for (const componentValue of numericComponents) {
            entrySum += componentValue;
        }

        if (largestEntriesHeap.currentSize < entriesToSelect) {
            largestEntriesHeap.insertValue(entrySum);
        } else if (entrySum > largestEntriesHeap.peekMinimum()) {
            largestEntriesHeap.extractMinimum();
            largestEntriesHeap.insertValue(entrySum);
        }
    }

    let finalAccumulation = 0;
    while (largestEntriesHeap.currentSize > 0) {
        finalAccumulation += largestEntriesHeap.extractMinimum();
    }

    console.log(finalAccumulation);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
