class ValueContainer {
    constructor() {
        this.store = [];
    }

    parentIdx(idx) { return Math.floor((idx - 1) / 2); }
    leftChildIdx(idx) { return 2 * idx + 1; }
    rightChildIdx(idx) { return 2 * idx + 2; }

    hasParentNode(idx) { return this.parentIdx(idx) >= 0; }
    hasLeftChildNode(idx) { return this.leftChildIdx(idx) < this.store.length; }
    hasRightChildNode(idx) { return this.rightChildIdx(idx) < this.store.length; }

    getParentNode(idx) { return this.store[this.parentIdx(idx)]; }
    getLeftChildNode(idx) { return this.store[this.leftChildIdx(idx)]; }
    getRightChildNode(idx) { return this.store[this.rightChildIdx(idx)]; }

    exchangeElements(idxA, idxB) {
        [this.store[idxA], this.store[idxB]] = [this.store[idxB], this.store[idxA]];
    }

    peekTop() {
        if (this.store.length === 0) return null;
        return this.store[0];
    }

    extractTop() {
        if (this.store.length === 0) return null;
        if (this.store.length === 1) return this.store.pop();

        const topValue = this.store[0];
        this.store[0] = this.store.pop();
        this.siftDown();
        return topValue;
    }

    insertItem(item) {
        this.store.push(item);
        this.siftUp();
    }

    siftUp() {
        let currentIdx = this.store.length - 1;
        while (this.hasParentNode(currentIdx) && this.getParentNode(currentIdx) > this.store[currentIdx]) {
            this.exchangeElements(this.parentIdx(currentIdx), currentIdx);
            currentIdx = this.parentIdx(currentIdx);
        }
    }

    siftDown() {
        let currentIdx = 0;
        while (this.hasLeftChildNode(currentIdx)) {
            let smallerChild = this.leftChildIdx(currentIdx);
            if (this.hasRightChildNode(currentIdx) && this.getRightChildNode(currentIdx) < this.getLeftChildNode(currentIdx)) {
                smallerChild = this.rightChildIdx(currentIdx);
            }

            if (this.store[currentIdx] < this.store[smallerChild]) {
                break;
            } else {
                this.exchangeElements(currentIdx, smallerChild);
            }
            currentIdx = smallerChild;
        }
    }

    getCurrentSize() {
        return this.store.length;
    }
}

function processRawInformation(textualContent) {
    const allDigitSequences = textualContent.match(/\d+/g).map(Number);
    const requiredCount = allDigitSequences[1];
    const initialNumbers = allDigitSequences.slice(2);
    return { requiredCount, initialNumbers };
}

function calculateAggregateSum(parsedData) {
    const countLimit = parsedData.requiredCount;
    const numberCollection = parsedData.initialNumbers;

    const doubledNumbers = numberCollection.map(val => val * 2);

    const sumCombinations = numberCollection.flatMap((val1, index1) =>
        numberCollection.slice(index1 + 1).flatMap(val2 => [val1 + val2, val1 + val2])
    );

    const allCandidateValues = doubledNumbers.concat(sumCombinations);

    const topElementsHolder = new ValueContainer();

    for (const candidate of allCandidateValues) {
        if (topElementsHolder.getCurrentSize() < countLimit) {
            topElementsHolder.insertItem(candidate);
        } else if (candidate > topElementsHolder.peekTop()) {
            topElementsHolder.extractTop();
            topElementsHolder.insertItem(candidate);
        }
    }

    let finalAccumulation = 0;
    while (topElementsHolder.getCurrentSize() > 0) {
        finalAccumulation += topElementsHolder.extractTop();
    }

    return finalAccumulation;
}

const fileContent = require("fs").readFileSync("/dev/stdin", "utf8");
const processedInput = processRawInformation(fileContent);
const result = calculateAggregateSum(processedInput);
console.log(result);