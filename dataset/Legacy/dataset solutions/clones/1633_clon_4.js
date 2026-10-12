class MaxHeap {
    constructor(comparator) {
        this.heap = [];
        this.compare = comparator;
    }

    _getParentIndex(idx) { return Math.floor((idx - 1) / 2); }
    _getLeftChildIndex(idx) { return 2 * idx + 1; }
    _getRightChildIndex(idx) { return 2 * idx + 2; }

    _hasParent(idx) { return this._getParentIndex(idx) >= 0; }
    _hasLeftChild(idx) { return this._getLeftChildIndex(idx) < this.heap.length; }
    _hasRightChild(idx) { return this._getRightChildIndex(idx) < this.heap.length; }

    _getParent(idx) { return this.heap[this._getParentIndex(idx)]; }
    _getLeftChild(idx) { return this.heap[this._getLeftChildIndex(idx)]; }
    _getRightChild(idx) { return this.heap[this._getRightChildIndex(idx)]; }

    _swapElements(idx1, idx2) {
        [this.heap[idx1], this.heap[idx2]] = [this.heap[idx2], this.heap[idx1]];
    }

    _heapifyUp() {
        let currentIdx = this.heap.length - 1;
        while (this._hasParent(currentIdx) && this.compare(this.heap[currentIdx], this._getParent(currentIdx)) > 0) {
            this._swapElements(currentIdx, this._getParentIndex(currentIdx));
            currentIdx = this._getParentIndex(currentIdx);
        }
    }

    _heapifyDown() {
        let currentIdx = 0;
        while (this._hasLeftChild(currentIdx)) {
            let largerChildIdx = this._getLeftChildIndex(currentIdx);
            if (this._hasRightChild(currentIdx) && this.compare(this._getRightChild(currentIdx), this._getLeftChild(currentIdx)) > 0) {
                largerChildIdx = this._getRightChildIndex(currentIdx);
            }

            if (this.compare(this.heap[currentIdx], this.heap[largerChildIdx]) >= 0) {
                break;
            }

            this._swapElements(currentIdx, largerChildIdx);
            currentIdx = largerChildIdx;
        }
    }

    insertItem(item) {
        this.heap.push(item);
        this._heapifyUp();
    }

    extractTop() {
        if (this.heap.length === 0) return undefined;
        if (this.heap.length === 1) return this.heap.pop();

        const topItem = this.heap[0];
        this.heap[0] = this.heap.pop();
        this._heapifyDown();
        return topItem;
    }

    peekTop() {
        if (this.heap.length === 0) return undefined;
        return this.heap[0];
    }

    getSize() {
        return this.heap.length;
    }
}

(async () => {
    let streamData = '';
    for await (const chunk of process.stdin) streamData += chunk;
    const dataRows = streamData.split(/\n/);

    const [itemCount, operationCount] = dataRows.shift().split(/\s/).map(val => +val);

    const valueComparator = (itemA, itemB) => (itemA[0] / itemA[1]) - (itemB[0] / itemB[1]);
    const valueHeap = new MaxHeap(valueComparator);

    dataRows[0].split(/\s/).slice(0, itemCount).map(initialVal => {
        valueHeap.insertItem([+initialVal, 1]);
    });

    for (let opIndex = 0; opIndex < operationCount; opIndex++) {
        let currentMaxItem = valueHeap.extractTop();
        currentMaxItem[1]++;
        valueHeap.insertItem(currentMaxItem);
    }

    const finalMaxItem = valueHeap.peekTop();
    console.log(Math.ceil(finalMaxItem[0] / finalMaxItem[1]));
})();
