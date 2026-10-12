'use strict';

class MaxHeap {
    constructor(initialElements = []) {
        this.heapContainer = [];
        if (initialElements.length > 0) {
            initialElements.forEach(val => this.add(val));
        }
    }

    _getParentIndex(idx) { return Math.floor((idx - 1) / 2); }
    _getLeftChildIndex(idx) { return 2 * idx + 1; }
    _getRightChildIndex(idx) { return 2 * idx + 2; }

    _hasParent(idx) { return this._getParentIndex(idx) >= 0; }
    _hasLeftChild(idx) { return this._getLeftChildIndex(idx) < this.heapContainer.length; }
    _hasRightChild(idx) { return this._getRightChildIndex(idx) < this.heapContainer.length; }

    _getParent(idx) { return this.heapContainer[this._getParentIndex(idx)]; }
    _getLeftChild(idx) { return this.heapContainer[this._getLeftChildIndex(idx)]; }
    _getRightChild(idx) { return this.heapContainer[this._getRightChildIndex(idx)]; }

    _swap(idx1, idx2) {
        [this.heapContainer[idx1], this.heapContainer[idx2]] = [this.heapContainer[idx2], this.heapContainer[idx1]];
    }

    add(element) {
        this.heapContainer.push(element);
        this._heapifyUp();
    }

    peekTop() {
        if (this.heapContainer.length === 0) return null;
        return this.heapContainer[0];
    }

    extractTop() {
        if (this.heapContainer.length === 0) return null;
        if (this.heapContainer.length === 1) return this.heapContainer.pop();

        const topElement = this.heapContainer[0];
        this.heapContainer[0] = this.heapContainer.pop();
        this._heapifyDown();
        return topElement;
    }

    _heapifyUp() {
        let currentIdx = this.heapContainer.length - 1;
        while (this._hasParent(currentIdx) && this._getParent(currentIdx) < this.heapContainer[currentIdx]) {
            this._swap(currentIdx, this._getParentIndex(currentIdx));
            currentIdx = this._getParentIndex(currentIdx);
        }
    }

    _heapifyDown() {
        let currentIdx = 0;
        while (this._hasLeftChild(currentIdx)) {
            let largerChildIdx = this._getLeftChildIndex(currentIdx);
            if (this._hasRightChild(currentIdx) && this._getRightChild(currentIdx) > this._getLeftChild(currentIdx)) {
                largerChildIdx = this._getRightChildIndex(currentIdx);
            }

            if (this.heapContainer[currentIdx] > this.heapContainer[largerChildIdx]) {
                break;
            } else {
                this._swap(currentIdx, largerChildIdx);
            }
            currentIdx = largerChildIdx;
        }
    }

    get currentSize() {
        return this.heapContainer.length;
    }

    calculateTotal() {
        return this.heapContainer.reduce((accumulator, value) => accumulator + value, 0);
    }
}

const processInput = (inputLines) => {
    const [firstLine, secondLine] = inputLines;

    const operationCount = parseInt(firstLine.split(' ')[1], 10);
    const initialValues = secondLine.split(' ').map(valStr => parseInt(valStr, 10));

    const valueHeap = new MaxHeap(initialValues);

    for (let opIdx = 0; opIdx < operationCount; opIdx++) {
        const currentMax = valueHeap.extractTop();
        if (currentMax !== null) {
            valueHeap.add(Math.floor(currentMax / 2));
        }
    }

    console.log(valueHeap.calculateTotal());
};

processInput(require("fs").readFileSync("/dev/stdin", "utf8").split('\n'));
