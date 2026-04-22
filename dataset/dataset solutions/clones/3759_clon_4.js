class SmallestKeeper {
    constructor(limit) {
        this.dataStore = [];
        this.maxSize = limit;
    }

    _moveUp(idx) {
        while (idx > 0) {
            const parentIdx = Math.floor((idx - 1) / 2);
            if (this.dataStore[parentIdx] > this.dataStore[idx]) {
                [this.dataStore[parentIdx], this.dataStore[idx]] = [this.dataStore[idx], this.dataStore[parentIdx]];
                idx = parentIdx;
            } else {
                break;
            }
        }
    }

    _moveDown(idx) {
        const leftChildIdx = 2 * idx + 1;
        const rightChildIdx = 2 * idx + 2;
        let minimumIdx = idx;

        if (leftChildIdx < this.dataStore.length && this.dataStore[leftChildIdx] < this.dataStore[minimumIdx]) {
            minimumIdx = leftChildIdx;
        }
        if (rightChildIdx < this.dataStore.length && this.dataStore[rightChildIdx] < this.dataStore[minimumIdx]) {
            minimumIdx = rightChildIdx;
        }

        if (minimumIdx !== idx) {
            [this.dataStore[idx], this.dataStore[minimumIdx]] = [this.dataStore[minimumIdx], this.dataStore[idx]];
            this._moveDown(minimumIdx);
        }
    }

    incorporate(value) {
        if (this.dataStore.length < this.maxSize) {
            this.dataStore.push(value);
            this._moveUp(this.dataStore.length - 1);
        } else if (this.maxSize > 0 && value > this.dataStore[0]) {
            this.dataStore[0] = value;
            this._moveDown(0);
        }
    }

    calculateTotal() {
        return this.dataStore.reduce((currentSum, elementValue) => currentSum + elementValue, 0);
    }
}

const performAnalysis = (sourceContent) => {
    const rawLines = sourceContent.split('\n');
    const [dimensionA, dimensionB] = rawLines[0].split(' ').map(Number);

    const largestElementCollector = new SmallestKeeper(dimensionB);

    for (let lineIterator = 1; lineIterator <= dimensionA; ++lineIterator) {
        const numericComponents = rawLines[lineIterator].split(' ').map(Number);
        const tripleSum = numericComponents[0] + numericComponents[1] + numericComponents[2];
        const absoluteTripleSum = Math.abs(tripleSum);
        largestElementCollector.incorporate(absoluteTripleSum);
    }

    const finalAccumulation = largestElementCollector.calculateTotal();

    process.stdout.write(finalAccumulation.toString() + '\n');
};

performAnalysis(require("fs").readFileSync("/dev/stdin", "utf8").trim());