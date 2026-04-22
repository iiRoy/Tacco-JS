const rawData = require('node:fs').readFileSync('/dev/stdin', 'utf-8');
const inputSections = rawData.split('\n');

class PriorityContainer {
    constructor() {
        this.elements = [];
    }

    _exchange(first, second) {
        [this.elements[first], this.elements[second]] = [this.elements[second], this.elements[first]];
    }

    _siftUp(idx) {
        let currentIdx = idx;
        let parentIdx = Math.floor((currentIdx - 1) / 2);

        while (currentIdx > 0 && this.elements[currentIdx] > this.elements[parentIdx]) {
            this._exchange(currentIdx, parentIdx);
            currentIdx = parentIdx;
            parentIdx = Math.floor((currentIdx - 1) / 2);
        }
    }

    _siftDown(idx) {
        let currentIdx = idx;
        const totalSize = this.elements.length;

        while (true) {
            let leftKid = 2 * currentIdx + 1;
            let rightKid = 2 * currentIdx + 2;
            let largestChildIdx = currentIdx;

            if (leftKid < totalSize && this.elements[leftKid] > this.elements[largestChildIdx]) {
                largestChildIdx = leftKid;
            }

            if (rightKid < totalSize && this.elements[rightKid] > this.elements[largestChildIdx]) {
                largestChildIdx = rightKid;
            }

            if (largestChildIdx !== currentIdx) {
                this._exchange(currentIdx, largestChildIdx);
                currentIdx = largestChildIdx;
            } else {
                break;
            }
        }
    }

    addValue(val) {
        this.elements.push(val);
        this._siftUp(this.elements.length - 1);
    }

    retrieveMax() {
        if (this.elements.length === 0) {
            return undefined;
        }
        if (this.elements.length === 1) {
            return this.elements.pop();
        }

        const maxItem = this.elements[0];
        this.elements[0] = this.elements.pop();
        this._siftDown(0);

        return maxItem;
    }
}

const collectionOfNumbers = new PriorityContainer();

for (const currentLine of inputSections) {
    if (!currentLine.trim()) continue;

    const instructionParts = currentLine.split(' ');
    const mainCommand = instructionParts[0];

    if (mainCommand === 'insert') {
        const numericValue = Number(instructionParts[1]);
        collectionOfNumbers.addValue(numericValue);
    } else if (mainCommand === 'extract') {
        console.log(collectionOfNumbers.retrieveMax());
    }
}