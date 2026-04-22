class ValueTracker {
    constructor() {
        this.store = [];
    }

    insert(val) {
        this.store.push(val);
        this._siftUp(this.store.length - 1);
    }

    extractMin() {
        if (this.isEmpty()) return undefined;
        if (this.store.length === 1) return this.store.pop();

        const minimum = this.store[0];
        this.store[0] = this.store.pop();
        this._siftDown(0);
        return minimum;
    }

    peekMin() {
        return this.store[0];
    }

    count() {
        return this.store.length;
    }

    isEmpty() {
        return this.store.length === 0;
    }

    _siftUp(index) {
        let parentIndex = Math.floor((index - 1) / 2);
        while (index > 0 && this.store[index] < this.store[parentIndex]) {
            [this.store[index], this.store[parentIndex]] = [this.store[parentIndex], this.store[index]];
            index = parentIndex;
            parentIndex = Math.floor((index - 1) / 2);
        }
    }

    _siftDown(index) {
        let leftChildIndex = 2 * index + 1;
        let rightChildIndex = 2 * index + 2;
        let smallestElementIndex = index;
        const currentSize = this.store.length;

        if (leftChildIndex < currentSize && this.store[leftChildIndex] < this.store[smallestElementIndex]) {
            smallestElementIndex = leftChildIndex;
        }
        if (rightChildIndex < currentSize && this.store[rightChildIndex] < this.store[smallestElementIndex]) {
            smallestElementIndex = rightChildIndex;
        }

        if (smallestElementIndex !== index) {
            [this.store[index], this.store[smallestElementIndex]] = [this.store[smallestElementIndex], this.store[index]];
            this._siftDown(smallestElementIndex);
        }
    }
}

function processInputData(rawData) {
    const dataLines = rawData.split("\n");
    const configParams = dataLines[0].split(" ");
    const totalItems = parseInt(configParams[0], 10);
    const selectionLimit = parseInt(configParams[1], 10);

    if (selectionLimit === 0) {
        console.log(0);
        return;
    }

    const itemSums = [];
    for (let i = 1; i <= totalItems; ++i) {
        const currentLineParts = dataLines[i].split(" ");
        let currentItemTotal = 0;
        for (let j = 0; j < currentLineParts.length; ++j) {
            currentItemTotal += parseInt(currentLineParts[j], 10);
        }
        itemSums.push(currentItemTotal);
    }

    const topValueKeeper = new ValueTracker();

    for (const individualSum of itemSums) {
        if (topValueKeeper.count() < selectionLimit) {
            topValueKeeper.insert(individualSum);
        } else if (individualSum > topValueKeeper.peekMin()) {
            topValueKeeper.extractMin();
            topValueKeeper.insert(individualSum);
        }
    }

    let finalAccumulatedResult = 0;
    while (!topValueKeeper.isEmpty()) {
        finalAccumulatedResult += topValueKeeper.extractMin();
    }

    console.log(finalAccumulatedResult);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));