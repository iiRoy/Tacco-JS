class Heap {
    constructor(comparator) {
        this.heap = [];
        this.comparator = comparator || ((a, b) => a - b);
    }

    getParentIndex(i) { return Math.floor((i - 1) / 2); }
    getLeftChildIndex(i) { return 2 * i + 1; }
    getRightChildIndex(i) { return 2 * i + 2; }

    hasParent(i) { return this.getParentIndex(i) >= 0; }
    hasLeftChild(i) { return this.getLeftChildIndex(i) < this.heap.length; }
    hasRightChild(i) { return this.getRightChildIndex(i) < this.heap.length; }

    getParent(i) { return this.heap[this.getParentIndex(i)]; }
    getLeftChild(i) { return this.heap[this.getLeftChildIndex(i)]; }
    getRightChild(i) { return this.heap[this.getRightChildIndex(i)]; }

    swap(i, j) { [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]]; }

    peek() { return this.heap.length === 0 ? null : this.heap[0]; }
    size() { return this.heap.length; }

    insert(item) {
        this.heap.push(item);
        this.heapifyUp();
    }

    extract() {
        if (this.heap.length === 0) return null;
        if (this.heap.length === 1) return this.heap.pop();
        const item = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.heapifyDown();
        return item;
    }

    heapifyUp() {
        let index = this.heap.length - 1;
        while (this.hasParent(index) && this.comparator(this.getParent(index), this.heap[index]) > 0) {
            this.swap(this.getParentIndex(index), index);
            index = this.getParentIndex(index);
        }
    }

    heapifyDown() {
        let index = 0;
        while (this.hasLeftChild(index)) {
            let childIndex = this.getLeftChildIndex(index);
            if (this.hasRightChild(index) && this.comparator(this.getRightChild(index), this.getLeftChild(index)) < 0) {
                childIndex = this.getRightChildIndex(index);
            }
            if (this.comparator(this.heap[index], this.heap[childIndex]) < 0) {
                break;
            } else {
                this.swap(index, childIndex);
            }
            index = childIndex;
        }
    }
}

class MinHeap extends Heap {
    constructor() {
        super((a, b) => a - b);
    }
}

class MaxHeap extends Heap {
    constructor() {
        super((a, b) => b - a);
    }
}

class MedianTracker {
    constructor() {
        this.lowerHalf = new MaxHeap();
        this.upperHalf = new MinHeap();
    }

    addNumber(num) {
        if (this.lowerHalf.size() === 0 || num <= this.lowerHalf.peek()) {
            this.lowerHalf.insert(num);
        } else {
            this.upperHalf.insert(num);
        }
        this.balanceHeaps();
    }

    balanceHeaps() {
        if (this.lowerHalf.size() > this.upperHalf.size() + 1) {
            this.upperHalf.insert(this.lowerHalf.extract());
        } else if (this.upperHalf.size() > this.lowerHalf.size()) {
            this.lowerHalf.insert(this.upperHalf.extract());
        }
    }

    getMedian() {
        if (this.lowerHalf.size() === 0) return null;
        return this.lowerHalf.peek();
    }

    getElementCount() {
        return this.lowerHalf.size() + this.upperHalf.size();
    }

    getUpperHalfMin() {
        return this.upperHalf.peek();
    }
}

function Main(inputContent) {
    let processedLines = inputContent.split("\n");
    if (processedLines[processedLines.length - 1] === '') {
        processedLines.pop();
    }

    let cumulativeCostSum = 0;
    const medianDataStructure = new MedianTracker();

    for (let commandIndex = 1; commandIndex < processedLines.length; commandIndex++) {
        const currentOperation = processedLines[commandIndex];
        if (currentOperation === '2') {
            console.log(medianDataStructure.getMedian(), cumulativeCostSum);
        } else {
            const operationDetails = currentOperation.split(' ').map(Number);
            const valueToInsert = operationDetails[1];
            const associatedCost = operationDetails[2];

            const priorElementCount = medianDataStructure.getElementCount();
            const priorMedianValue = medianDataStructure.getMedian();

            cumulativeCostSum += associatedCost;

            if (priorElementCount === 0) {
                // No median-related sum adjustment for the very first element.
            } else if (priorElementCount % 2 !== 0) {
                cumulativeCostSum += Math.abs(valueToInsert - priorMedianValue);
            } else {
                const lowerMidpointValue = priorMedianValue;
                const upperMidpointValue = medianDataStructure.getUpperHalfMin();

                if (valueToInsert > upperMidpointValue) {
                    cumulativeCostSum += valueToInsert - upperMidpointValue;
                } else if (valueToInsert < lowerMidpointValue) {
                    cumulativeCostSum += lowerMidpointValue - valueToInsert;
                }
            }
            medianDataStructure.addNumber(valueToInsert);
        }
    }
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
