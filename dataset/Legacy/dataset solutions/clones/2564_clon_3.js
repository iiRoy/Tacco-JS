const rawData = require('fs').readFileSync('/dev/stdin', 'utf8');
const dataLines = rawData.split('\n');

const firstLineParts = dataLines.shift().split(' ');
const numElementsN = Number(firstLineParts[0]);
const numOperationsK = Number(firstLineParts[1]);

const initialArray = dataLines.shift().split(' ');

class PriorityQueue {
    #elements;
    #comparisonFn;

    constructor(initialValues = [], isMaxHeap = false) {
        this.#elements = [0]; // Use 1-based indexing, 0 is a placeholder
        this.#comparisonFn = isMaxHeap ? (a, b) => a > b : (a, b) => a < b;

        this.#buildHeapFromValues(initialValues.map(Number));
    }

    #buildHeapFromValues(values) {
        for (const val of values) {
            this.insert(val);
        }
    }

    insert(valueToInsert) {
        let currentPosition = this.#elements.length;
        this.#elements.push(valueToInsert); // Temporarily add to the end

        // Swim up operation to maintain heap property
        while (currentPosition > 1) {
            const parentPosition = Math.floor(currentPosition / 2);
            const parentValue = this.#elements[parentPosition];

            if (this.#comparisonFn(valueToInsert, parentValue)) {
                this.#elements[currentPosition] = parentValue; // Move parent down
                currentPosition = parentPosition;
            } else {
                break; // Correct position for valueToInsert found
            }
        }
        this.#elements[currentPosition] = valueToInsert; // Place the value
    }

    extractTop() {
        const currentHeapSize = this.#elements.length;

        if (currentHeapSize <= 1) {
            return undefined; // Heap is empty (only placeholder)
        }
        if (currentHeapSize === 2) {
            return this.#elements.pop(); // Only one actual element
        }

        const topValue = this.#elements[1];
        const lastElementValue = this.#elements.pop(); // Remove the last element

        let currentPosition = 1;
        const effectiveHeapSize = this.#elements.length; // Size after removing last element

        // Sink down operation to maintain heap property
        while (true) {
            const leftChildPosition = currentPosition * 2;
            const rightChildPosition = currentPosition * 2 + 1;
            let potentialSwapPosition = currentPosition;

            let leftChildValueForComparison;
            if (leftChildPosition < effectiveHeapSize) {
                leftChildValueForComparison = this.#elements[leftChildPosition];
                if (this.#comparisonFn(leftChildValueForComparison, lastElementValue)) {
                    potentialSwapPosition = leftChildPosition;
                }
            }

            if (rightChildPosition < effectiveHeapSize) {
                const rightChildValue = this.#elements[rightChildPosition];
                const valueAtCurrentPotentialSwap = this.#elements[potentialSwapPosition];

                // Original logic: if right child is "better" than lastElementValue AND "better" than the left child
                // (or current node if left child wasn't chosen as potential swap)
                if (this.#comparisonFn(rightChildValue, lastElementValue) &&
                    this.#comparisonFn(rightChildValue, valueAtCurrentPotentialSwap)) {
                    potentialSwapPosition = rightChildPosition;
                }
            }

            if (potentialSwapPosition !== currentPosition) {
                this.#elements[currentPosition] = this.#elements[potentialSwapPosition]; // Move child up
                currentPosition = potentialSwapPosition;
            } else {
                break; // Correct position for lastElementValue found
            }
        }
        this.#elements[currentPosition] = lastElementValue; // Place the last element
        return topValue;
    }

    get allStoredElements() {
        return this.#elements.slice(1); // Return all elements excluding the placeholder
    }
}

const maxHeapInstance = new PriorityQueue(initialArray, true);

for (let operationCounter = 0; operationCounter < numOperationsK; operationCounter++) {
    const currentMax = maxHeapInstance.extractTop();
    if (currentMax !== undefined) { // Ensure heap is not empty
        const halvedValue = Math.floor(currentMax / 2);
        maxHeapInstance.insert(halhedValue);
    }
}

let finalSum = 0;
const remainingElements = maxHeapInstance.allStoredElements;

for (const element of remainingElements) {
    finalSum += element;
}

console.log(finalSum);
