const parseInteger = (str) => Number.parseInt(str, 10);
const parseIntegerArray = (strArray) => strArray.map(parseInteger);
const absoluteValue = (num) => Math.abs(num);
const minimumOf = (...values) => Math.min(...values);
const maximumOf = (...values) => Math.max(...values);

const calculateGCDRecursive = (a, b) => (b === 0 ? a : calculateGCDRecursive(b, a % b));
const greatestCommonDivisor = (...numbers) => numbers.reduce(calculateGCDRecursive);

class MinValueHeap {
    constructor() {
        this._heapElements = [];
    }

    _getParentIndex(childIndex) { return Math.floor((childIndex - 1) / 2); }
    _getLeftChildIndex(parentIndex) { return (2 * parentIndex) + 1; }
    _getRightChildIndex(parentIndex) { return (2 * parentIndex) + 2; }

    _hasParent(index) { return this._getParentIndex(index) >= 0; }
    _hasLeftChild(index) { return this._getLeftChildIndex(index) < this._heapElements.length; }
    _hasRightChild(index) { return this._getRightChildIndex(index) < this._heapElements.length; }

    _getParent(index) { return this._heapElements[this._getParentIndex(index)]; }
    _getLeftChild(index) { return this._heapElements[this._getLeftChildIndex(index)]; }
    _getRightChild(index) { return this._heapElements[this._getRightChildIndex(index)]; }

    _swap(indexOne, indexTwo) {
        [this._heapElements[indexOne], this._heapElements[indexTwo]] = [this._heapElements[indexTwo], this._heapElements[indexOne]];
    }

    peekSmallest() {
        if (this._heapElements.length === 0) return null;
        return this._heapElements[0];
    }

    insertElement(item) {
        this._heapElements.push(item);
        this._heapifyUp();
    }

    extractSmallest() {
        if (this._heapElements.length === 0) return null;
        if (this._heapElements.length === 1) return this._heapElements.pop();

        const item = this._heapElements[0];
        this._heapElements[0] = this._heapElements.pop();
        this._heapifyDown();
        return item;
    }

    _heapifyUp() {
        let index = this._heapElements.length - 1;
        while (this._hasParent(index) && this._getParent(index) > this._heapElements[index]) {
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

            if (this._heapElements[index] < this._heapElements[smallerChildIndex]) {
                break;
            } else {
                this._swap(index, smallerChildIndex);
            }
            index = smallerChildIndex;
        }
    }

    getCurrentSize() {
        return this._heapElements.length;
    }
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));

function processInputData(rawData) {
    const parsedLines = rawData.split('\n').map(lineString => parseIntegerArray(lineString.split(' ')));

    const firstValueCount = parsedLines[0][0];
    const initialNumbers = parsedLines[1];

    const powerSequence = [1];

    const numberHeap = new MinValueHeap();
    for (const num of initialNumbers) {
        numberHeap.insertElement(num);
    }

    let finalAverageResult;

    while (numberHeap.getCurrentSize() > 1) {
        const valA = numberHeap.extractSmallest();
        const valB = numberHeap.extractSmallest();
        const currentAverage = (valA + valB) / 2;
        numberHeap.insertElement(currentAverage);
    }

    finalAverageResult = numberHeap.extractSmallest();

    console.log(finalAverageResult);
    return 0;
}
