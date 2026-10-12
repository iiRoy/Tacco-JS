class MinPriorityQueue {
    constructor() {
        this.heap = [];
    }

    _getParentIndex(i) { return Math.floor((i - 1) / 2); }
    _getLeftChildIndex(i) { return 2 * i + 1; }
    _getRightChildIndex(i) { return 2 * i + 2; }

    _hasParent(i) { return this._getParentIndex(i) >= 0; }
    _hasLeftChild(i) { return this._getLeftChildIndex(i) < this.heap.length; }
    _hasRightChild(i) { return this._getRightChildIndex(i) < this.heap.length; }

    _getParent(i) { return this.heap[this._getParentIndex(i)]; }
    _getLeftChild(i) { return this.heap[this._getLeftChildIndex(i)]; }
    _getRightChild(i) { return this.heap[this._getRightChildIndex(i)]; }

    _swap(i, j) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    peek() {
        if (this.heap.length === 0) return undefined;
        return this.heap[0];
    }

    enqueue(item) {
        this.heap.push(item);
        this._heapifyUp();
    }

    dequeue() {
        if (this.heap.length === 0) return undefined;
        if (this.heap.length === 1) return this.heap.pop();

        const item = this.heap[0];
        this.heap[0] = this.heap.pop();
        this._heapifyDown();
        return item;
    }

    _heapifyUp() {
        let index = this.heap.length - 1;
        while (this._hasParent(index) && this._getParent(index) > this.heap[index]) {
            this._swap(this._getParentIndex(index), index);
            index = this._getParentIndex(index);
        }
    }

    _heapifyDown() {
        let index = 0;
        while (this._hasLeftChild(index)) {
            let smallerChildIndex = this._getLeftChildIndex(index);
            if (this._hasRightChild(index) && this._getRightChild(index) < this._getLeftChild(index)) {
                smallerChildIndex = this._getRightChildIndex(index);
            }

            if (this.heap[index] < this.heap[smallerChildIndex]) {
                break;
            } else {
                this._swap(index, smallerChildIndex);
            }
            index = smallerChildIndex;
        }
    }

    isEmpty() {
        return this.heap.length === 0;
    }
}

function Main(input) {
    const dataLines = input.split('\n');

    const firstLineParts = dataLines.shift().split(' ');
    const initialCountN = Number(firstLineParts[0]);
    const offerCountM = Number(firstLineParts[1]);

    const initialValues = dataLines.shift().split(' ').map(Number);

    const valuePool = new MinPriorityQueue();
    for (const val of initialValues) {
        valuePool.enqueue(val);
    }

    if (dataLines[dataLines.length - 1] === '') {
        dataLines.pop();
    }

    const offers = dataLines
        .map(line => {
            const parts = line.split(' ');
            return { quantity: Number(parts[0]), price: Number(parts[1]) };
        })
        .sort((a, b) => b.price - a.price);

    for (const currentOffer of offers) {
        let remainingQuantity = currentOffer.quantity;
        const offerPrice = currentOffer.price;

        while (remainingQuantity > 0 && !valuePool.isEmpty() && valuePool.peek() < offerPrice) {
            valuePool.dequeue();
            valuePool.enqueue(offerPrice);
            remainingQuantity--;
        }
    }

    let totalSum = 0;
    while (!valuePool.isEmpty()) {
        totalSum += valuePool.dequeue();
    }

    console.log(totalSum);
}

Main(require("fs").readFileSync("/dev/stdin", "utf8"));
