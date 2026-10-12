class ValueHeap {
    constructor() {
        this.collection = [];
    }

    getUpstreamIndex(idx) { return Math.floor((idx - 1) / 2); }
    getLeftBranchIndex(idx) { return 2 * idx + 1; }
    getRightBranchIndex(idx) { return 2 * idx + 2; }

    hasUpstream(idx) { return this.getUpstreamIndex(idx) >= 0; }
    hasLeftBranch(idx) { return this.getLeftBranchIndex(idx) < this.collection.length; }
    hasRightBranch(idx) { return this.getRightBranchIndex(idx) < this.collection.length; }

    getUpstream(idx) { return this.collection[this.getUpstreamIndex(idx)]; }
    getLeftBranch(idx) { return this.collection[this.getLeftBranchIndex(idx)]; }
    getRightBranch(idx) { return this.collection[this.getRightBranchIndex(idx)]; }

    exchange(idx1, idx2) {
        [this.collection[idx1], this.collection[idx2]] = [this.collection[idx2], this.collection[idx1]];
    }

    top() {
        if (this.collection.length === 0) return undefined;
        return this.collection[0];
    }

    add(item) {
        this.collection.push(item);
        this.heapifyUpward();
    }

    extractTop() {
        if (this.collection.length === 0) return undefined;
        if (this.collection.length === 1) return this.collection.pop();

        const item = this.collection[0];
        this.collection[0] = this.collection.pop();
        this.heapifyDownward();
        return item;
    }

    heapifyUpward() {
        let currentIdx = this.collection.length - 1;
        while (this.hasUpstream(currentIdx) && this.getUpstream(currentIdx) < this.collection[currentIdx]) {
            this.exchange(this.getUpstreamIndex(currentIdx), currentIdx);
            currentIdx = this.getUpstreamIndex(currentIdx);
        }
    }

    heapifyDownward() {
        let currentIdx = 0;
        while (this.hasLeftBranch(currentIdx)) {
            let largerBranchIdx = this.getLeftBranchIndex(currentIdx);
            if (this.hasRightBranch(currentIdx) && this.getRightBranch(currentIdx) > this.getLeftBranch(currentIdx)) {
                largerBranchIdx = this.getRightBranchIndex(currentIdx);
            }

            if (this.collection[currentIdx] > this.collection[largerBranchIdx]) {
                break;
            } else {
                this.exchange(currentIdx, largerBranchIdx);
            }
            currentIdx = largerBranchIdx;
        }
    }

    get currentSize() {
        return this.collection.length;
    }
}

const main = (rawInput) => {
    const lines = rawInput.trim().split('\n');
    const numericStrings = lines[1].split(' ');
    const sortedDescendingNumbers = numericStrings.map(str => BigInt(str)).sort((valA, valB) => valB - valA);

    const activeElementsHeap = new ValueHeap();
    activeElementsHeap.add(sortedDescendingNumbers.shift());

    let cumulativeSum = 0n;

    for (const currentNumber of sortedDescendingNumbers) {
        const topElement = activeElementsHeap.extractTop();
        cumulativeSum += topElement;

        activeElementsHeap.add(currentNumber);
        activeElementsHeap.add(currentNumber);
    }

    console.log(`${cumulativeSum}`);
};

process.env.MYTEST ? test() : main(require('fs').readFileSync('/dev/stdin', 'utf8'))
