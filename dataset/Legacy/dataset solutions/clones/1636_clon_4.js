class MaxHeap {
    constructor(priorityEvaluator = (a, b) => a > b) {
        this.heapElements = [];
        this.priorityEvaluator = priorityEvaluator;
    }

    _retrieveParentIndex(idx) {
        return Math.floor((idx - 1) / 2);
    }

    _retrieveLeftChildIndex(idx) {
        return 2 * idx + 1;
    }

    _retrieveRightChildIndex(idx) {
        return 2 * idx + 2;
    }

    _checkHasParent(idx) {
        return this._retrieveParentIndex(idx) >= 0;
    }

    _checkHasLeftChild(idx) {
        return this._retrieveLeftChildIndex(idx) < this.heapElements.length;
    }

    _checkHasRightChild(idx) {
        return this._retrieveRightChildIndex(idx) < this.heapElements.length;
    }

    _retrieveParent(idx) {
        return this.heapElements[this._retrieveParentIndex(idx)];
    }

    _retrieveLeftChild(idx) {
        return this.heapElements[this._retrieveLeftChildIndex(idx)];
    }

    _retrieveRightChild(idx) {
        return this.heapElements[this._retrieveRightChildIndex(idx)];
    }

    _exchange(idx1, idx2) {
        [this.heapElements[idx1], this.heapElements[idx2]] = [this.heapElements[idx2], this.heapElements[idx1]];
    }

    topElement() {
        if (this.heapElements.length === 0) return undefined;
        return this.heapElements[0];
    }

    add(item) {
        this.heapElements.push(item);
        this._bubbleUp();
    }

    extractTop() {
        if (this.heapElements.length === 0) return undefined;
        if (this.heapElements.length === 1) return this.heapElements.pop();

        const highestPriorityItem = this.heapElements[0];
        this.heapElements[0] = this.heapElements.pop();
        this._bubbleDown();
        return highestPriorityItem;
    }

    _bubbleUp() {
        let currentPosition = this.heapElements.length - 1;
        while (this._checkHasParent(currentPosition) && this.priorityEvaluator(this.heapElements[currentPosition], this._retrieveParent(currentPosition))) {
            this._exchange(currentPosition, this._retrieveParentIndex(currentPosition));
            currentPosition = this._retrieveParentIndex(currentPosition);
        }
    }

    _bubbleDown() {
        let currentPosition = 0;
        while (this._checkHasLeftChild(currentPosition)) {
            let higherPriorityChildPosition = this._retrieveLeftChildIndex(currentPosition);
            if (this._checkHasRightChild(currentPosition) && this.priorityEvaluator(this._retrieveRightChild(currentPosition), this._retrieveLeftChild(currentPosition))) {
                higherPriorityChildPosition = this._retrieveRightChildIndex(currentPosition);
            }

            if (this.priorityEvaluator(this.heapElements[currentPosition], this.heapElements[higherPriorityChildPosition])) {
                break;
            } else {
                this._exchange(currentPosition, higherPriorityChildPosition);
                currentPosition = higherPriorityChildPosition;
            }
        }
    }
}

(async () => {
    let receivedInput = '';
    for await (const dataChunk of process.stdin) receivedInput += dataChunk;
    const inputSegments = receivedInput.split(/\n/);

    const [elementCount, operationIterations] = inputSegments.shift().split(/\s/).map(Number);
    const initialElements = inputSegments[0].split(/\s/).slice(0, elementCount).map(Number);

    const averageComparator = (itemA, itemB) => (itemA[0] / itemA[1]) > (itemB[0] / itemB[1]);
    const valueDistributionHeap = new MaxHeap(averageComparator);

    for (const initialValue of initialElements) {
        valueDistributionHeap.add([initialValue, 1]);
    }

    for (let currentIteration = 0; currentIteration < operationIterations; currentIteration++) {
        const highestAverageItem = valueDistributionHeap.extractTop();
        if (highestAverageItem) {
            const [originalNumericValue, divisionCounter] = highestAverageItem;
            valueDistributionHeap.add([originalNumericValue, divisionCounter + 1]);
        }
    }

    const finalHighestItem = valueDistributionHeap.topElement();
    if (finalHighestItem) {
        const [finalOriginalNumericValue, finalDivisionCounter] = finalHighestItem;
        const computedAverage = finalOriginalNumericValue / finalDivisionCounter;
        console.log(Math.ceil(computedAverage));
    } else {
        console.log(0);
    }
})();
