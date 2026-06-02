"use strict";

class ValueHeap {
    constructor(comparisonFn) {
        this._elements = [];
        this._totalSum = 0;
        this._comparator = comparisonFn;
    }

    _swapPositions(idxA, idxB) {
        [this._elements[idxA], this._elements[idxB]] = [this._elements[idxB], this._elements[idxA]];
    }

    _bubbleUp(index) {
        let parentIdx = Math.floor((index - 1) / 2);
        while (index > 0 && this._comparator(this._elements[index], this._elements[parentIdx]) > 0) {
            this._swapPositions(index, parentIdx);
            index = parentIdx;
            parentIdx = Math.floor((index - 1) / 2);
        }
    }

    _sinkDown(index) {
        let leftChildIdx = 2 * index + 1;
        let rightChildIdx = 2 * index + 2;
        let dominantIdx = index;

        if (leftChildIdx < this._elements.length && this._comparator(this._elements[leftChildIdx], this._elements[dominantIdx]) > 0) {
            dominantIdx = leftChildIdx;
        }

        if (rightChildIdx < this._elements.length && this._comparator(this._elements[rightChildIdx], this._elements[dominantIdx]) > 0) {
            dominantIdx = rightChildIdx;
        }

        if (dominantIdx !== index) {
            this._swapPositions(index, dominantIdx);
            this._sinkDown(dominantIdx);
        }
    }

    addEntry(val) {
        this._elements.push(val);
        this._totalSum += val;
        this._bubbleUp(this._elements.length - 1);
    }

    removeRoot() {
        if (this._elements.length === 0) return undefined;
        if (this._elements.length === 1) {
            const val = this._elements.pop();
            this._totalSum -= val;
            return val;
        }

        const rootVal = this._elements[0];
        this._elements[0] = this._elements.pop();
        this._totalSum -= rootVal;
        this._sinkDown(0);
        return rootVal;
    }

    peekRoot() {
        return this._elements.length > 0 ? this._elements[0] : undefined;
    }

    getQuantity() {
        return this._elements.length;
    }

    getAccumulatedSum() {
        return this._totalSum;
    }
}

class MedianTracker {
    constructor() {
        this._lowerHalf = new ValueHeap((a, b) => a - b); // Max-heap for smaller half
        this._upperHalf = new ValueHeap((a, b) => b - a); // Min-heap for larger half
    }

    _rebalanceHeaps() {
        if (this._lowerHalf.getQuantity() < this._upperHalf.getQuantity()) {
            this._lowerHalf.addEntry(this._upperHalf.removeRoot());
        } else if (this._lowerHalf.getQuantity() - this._upperHalf.getQuantity() > 1) {
            this._upperHalf.addEntry(this._lowerHalf.removeRoot());
        }
    }

    insertElement(val) {
        if (this._lowerHalf.getQuantity() === 0 || val <= this._lowerHalf.peekRoot()) {
            this._lowerHalf.addEntry(val);
        } else {
            this._upperHalf.addEntry(val);
        }
        this._rebalanceHeaps();
    }

    fetchMedian() {
        if (this._lowerHalf.getQuantity() === 0) return undefined;
        return this._lowerHalf.peekRoot();
    }

    calculateAbsoluteDeviationSum(medianVal) {
        const lowerCount = this._lowerHalf.getQuantity();
        const lowerSum = this._lowerHalf.getAccumulatedSum();
        const upperCount = this._upperHalf.getQuantity();
        const upperSum = this._upperHalf.getAccumulatedSum();

        return (lowerCount * medianVal - lowerSum) + (upperSum - upperCount * medianVal);
    }
}

function* generateInputTokens(rawData, valueParser = Number) {
    const dataLines = rawData.split('\n');
    for (const currentLine of dataLines) {
        const lineFragments = currentLine.trim().split(' ');
        for (const fragment of lineFragments) {
            if (fragment !== '') {
                yield valueParser(fragment);
            }
        }
    }
}

function processInputOperations(sourceContent) {
    const tokenStream = generateInputTokens(sourceContent);
    const getNextValue = () => tokenStream.next().value;

    const totalOperationCount = getNextValue();

    const valueAggregator = new MedianTracker();
    let runningOffset = 0;

    for (let opIdx = 0; opIdx < totalOperationCount; opIdx++) {
        const operationKind = getNextValue();

        if (operationKind === 1) {
            const elementValue = getNextValue();
            const offsetAmount = getNextValue();
            runningOffset += offsetAmount;
            valueAggregator.insertElement(elementValue);
        } else {
            const currentMedian = valueAggregator.fetchMedian();
            const deviationSum = valueAggregator.calculateAbsoluteDeviationSum(currentMedian);
            const finalOutcome = deviationSum + runningOffset;
            console.log(currentMedian, finalOutcome);
        }
    }
}

processInputOperations(require("fs").readFileSync("/dev/stdin", "utf8"));
