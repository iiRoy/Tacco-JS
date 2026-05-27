const fileContent = require('fs').readFileSync('/dev/stdin', 'utf8');
const contentLines = fileContent.split('\n');
const firstLineParts = contentLines.shift().split(' ');
const elementCount = Number(firstLineParts[0]);
const operationCount = Number(firstLineParts[1]);
const initialValues = contentLines.shift().split(' ').map(Number);

class PriorityQueue {
    #elements;
    #comparator;

    constructor(initialValues = [], isMaxHeap = true) {
        this.#elements = [];
        this.#comparator = isMaxHeap ? (a, b) => a > b : (a, b) => a < b;

        if (initialValues.length > 0) {
            this.#elements = initialValues.slice();
            for (let i = Math.floor(this.#elements.length / 2) - 1; i >= 0; i--) {
                this.#siftDown(i);
            }
        }
    }

    #getParentIndex(idx) { return Math.floor((idx - 1) / 2); }
    #getLeftChildIndex(idx) { return 2 * idx + 1; }
    #getRightChildIndex(idx) { return 2 * idx + 2; }

    #swap(idx1, idx2) {
        [this.#elements[idx1], this.#elements[idx2]] = [this.#elements[idx2], this.#elements[idx1]];
    }

    #siftUp(idx) {
        let currentIdx = idx;
        let parentIdx = this.#getParentIndex(currentIdx);
        while (currentIdx > 0 && this.#comparator(this.#elements[currentIdx], this.#elements[parentIdx])) {
            this.#swap(currentIdx, parentIdx);
            currentIdx = parentIdx;
            parentIdx = this.#getParentIndex(currentIdx);
        }
    }

    #siftDown(idx) {
        let currentIdx = idx;
        const lastIdx = this.#elements.length - 1;

        while (true) {
            let leftChildIdx = this.#getLeftChildIndex(currentIdx);
            let rightChildIdx = this.#getRightChildIndex(currentIdx);
            let preferredChildIdx = currentIdx;

            if (leftChildIdx <= lastIdx && this.#comparator(this.#elements[leftChildIdx], this.#elements[preferredChildIdx])) {
                preferredChildIdx = leftChildIdx;
            }
            if (rightChildIdx <= lastIdx && this.#comparator(this.#elements[rightChildIdx], this.#elements[preferredChildIdx])) {
                preferredChildIdx = rightChildIdx;
            }

            if (preferredChildIdx !== currentIdx) {
                this.#swap(currentIdx, preferredChildIdx);
                currentIdx = preferredChildIdx;
            } else {
                break;
            }
        }
    }

    offer(value) {
        this.#elements.push(value);
        this.#siftUp(this.#elements.length - 1);
    }

    poll() {
        if (this.#elements.length === 0) {
            return undefined;
        }
        if (this.#elements.length === 1) {
            return this.#elements.pop();
        }

        const extractedValue = this.#elements[0];
        this.#elements[0] = this.#elements.pop();
        this.#siftDown(0);
        return extractedValue;
    }

    get size() {
        return this.#elements.length;
    }

    get values() {
        return this.#elements.slice();
    }
}

const valueProcessor = new PriorityQueue(initialValues, true);

for (let opIndex = 0; opIndex < operationCount; opIndex++) {
    const currentMax = valueProcessor.poll();
    if (currentMax !== undefined) {
        valueProcessor.offer(Math.floor(currentMax / 2));
    }
}

const finalSum = valueProcessor.values.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

console.log(finalSum);
