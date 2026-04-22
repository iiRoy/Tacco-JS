// This script processes numerical data from standard input, simulating a sequence of operations
// on a collection of values using a max-priority queue (binary heap structure).
// The core logic involves repeatedly extracting the largest element, halving it (integer division),
// and re-inserting the modified value back into the collection. Finally, the sum of all
// remaining elements in the collection is computed and displayed.

// --- Stage 1: Input Data Acquisition and Initial Parsing ---
// Utilizes Node.js 'fs' module to read the entire content of standard input synchronously.
const rawInputContent = require('fs').readFileSync('/dev/stdin', 'utf8');

// Divides the raw input string into an array of individual lines.
const inputLineSegments = rawInputContent.split('\n');

// Extracts the very first line from the input and separates its components by spaces.
const initialConfigurationTokens = inputLineSegments.shift().split(' ');

// Parses the numeric values for the total count of elements (not directly used later)
// and the number of iterative operations to perform.
const totalElementCount = Number.parseInt(initialConfigurationTokens[0], 10);
const numberOfHalvingOperations = Number.parseInt(initialConfigurationTokens[1], 10);

// Extracts the second line, splits it by spaces, and converts each resulting string
// token into a number, forming the initial set of values for processing.
const startingValueCollection = inputLineSegments.shift().split(' ').map(Number);

// --- Stage 2: Priority Queue (Max-Heap) Class Definition ---
// Defines a custom class to represent a Binary Max-Heap.
// This implementation uses 1-based indexing for its internal array, where
// heap[0] is intentionally left unused to simplify parent/child index calculations.
class BinaryMaxHeap {
    #storageArray; // Private array to store the heap elements.
    #comparisonFunction; // Private function defining the comparison logic for a max-heap.

    /**
     * Initializes a new instance of the BinaryMaxHeap.
     * Sets up the internal storage array and defines the comparison rule for max-heap behavior.
     */
    constructor() {
        this.#storageArray = [0]; // Placeholder at index 0.
        // For a max-heap, element 'a' has higher priority if it's strictly greater than 'b'.
        this.#comparisonFunction = (valA, valB) => valA > valB;
    }

    /**
     * Returns the current number of actual elements stored in the heap.
     * @returns {number} The count of elements.
     */
    get currentSize() {
        return this.#storageArray.length - 1;
    }

    /**
     * Determines if the heap currently contains no elements.
     * @returns {boolean} True if empty, false otherwise.
     */
    isEmpty() {
        return this.currentSize === 0;
    }

    /**
     * Swaps the positions of two elements within the internal storage array.
     * This is a utility function used internally by sift-up and sift-down operations.
     * @param {number} indexA - The index of the first element.
     * @param {number} indexB - The index of the second element.
     */
    #performElementSwap(indexA, indexB) {
        [this.#storageArray[indexA], this.#storageArray[indexB]] = [this.#storageArray[indexB], this.#storageArray[indexA]];
    }

    /**
     * Restores the heap property by moving an element upwards from its current position
     * towards the root, until its correct place is found or the root is reached.
     * This operation is typically performed after adding a new element.
     * @param {number} elementIndex - The starting index of the element to sift up.
     */
    #siftElementUp(elementIndex) {
        let currentPosition = elementIndex;
        // Continue while not at the root and the current element is "better" than its parent.
        while (currentPosition > 1) {
            let parentPosition = Math.floor(currentPosition / 2);
            if (this.#comparisonFunction(this.#storageArray[currentPosition], this.#storageArray[parentPosition])) {
                this.#performElementSwap(currentPosition, parentPosition);
                currentPosition = parentPosition;
            } else {
                break; // Heap property is satisfied at this level.
            }
        }
    }

    /**
     * Restores the heap property by moving an element downwards from its current position
     * towards the leaves, until its correct place is found.
     * This operation is typically performed after removing the root element.
     * @param {number} elementIndex - The starting index of the element to sift down.
     */
    #siftElementDown(elementIndex) {
        let currentPosition = elementIndex;
        const valueToPlace = this.#storageArray[currentPosition]; // The element we need to find a spot for.

        // Loop indefinitely until the element finds its proper place.
        while (true) {
            let leftChildPosition = currentPosition * 2;
            let rightChildPosition = currentPosition * 2 + 1;
            let bestChildToPromote = currentPosition; // Assume current position is where valueToPlace belongs

            // Check if the left child exists and is "better" than the valueToPlace.
            if (leftChildPosition <= this.currentSize && this.#comparisonFunction(this.#storageArray[leftChildPosition], valueToPlace)) {
                bestChildToPromote = leftChildPosition;
            }

            // Check if the right child exists, is "better" than valueToPlace,
            // AND is "better" than the current best candidate (which could be the left child or the parent itself).
            if (rightChildPosition <= this.currentSize &&
                this.#comparisonFunction(this.#storageArray[rightChildPosition], valueToPlace) &&
                this.#comparisonFunction(this.#storageArray[rightChildPosition], this.#storageArray[bestChildToPromote])) {
                bestChildToPromote = rightChildPosition;
            }

            // If a child is found that should be promoted, move it up.
            if (bestChildToPromote !== currentPosition) {
                this.#storageArray[currentPosition] = this.#storageArray[bestChildToPromote]; // Promote child up.
                currentPosition = bestChildToPromote; // Move down to the child's previous position.
            } else {
                break; // The valueToPlace has found its correct spot.
            }
        }
        this.#storageArray[currentPosition] = valueToPlace; // Place the original value.
    }

    /**
     * Efficiently builds a max-heap from an initial array of numbers.
     * This uses the Floyd's buildheap algorithm, which is O(N) complexity.
     * @param {Array<number>} initialElements - An array of numbers to populate the heap.
     */
    buildFromInitialArray(initialElements) {
        // Reset the internal storage and populate it with the new elements, including the placeholder.
        this.#storageArray = [0, ...initialElements.map(val => Number(val))];

        // Iterate from the last non-leaf node up to the root, applying sift-down to each.
        // The last non-leaf node is at index floor(currentSize / 2).
        for (let i = Math.floor(this.currentSize / 2); i >= 1; i--) {
            this.#siftElementDown(i);
        }
    }

    /**
     * Inserts a new element into the heap, maintaining the heap property.
     * @param {number} elementValue - The numeric value to insert.
     */
    insertElement(elementValue) {
        this.#storageArray.push(elementValue); // Add to the end.
        this.#siftElementUp(this.currentSize); // Sift it up to its correct position.
    }

    /**
     * Removes and returns the highest priority (largest) element from the heap.
     * @returns {number|undefined} The largest element, or undefined if the heap is empty.
     */
    extractTopElement() {
        if (this.isEmpty()) {
            return undefined; // Cannot extract from an empty heap.
        }

        if (this.currentSize === 1) {
            return this.#storageArray.pop(); // If only one element, just remove and return it.
        }

        const topPriorityValue = this.#storageArray[1]; // Store the root element.
        this.#storageArray[1] = this.#storageArray.pop(); // Move the last element to the root.
        this.#siftElementDown(1); // Sift down the new root to restore heap property.

        return topPriorityValue;
    }

    /**
     * Returns the highest priority (largest) element without removing it from the heap.
     * @returns {number|undefined} The largest element, or undefined if the heap is empty.
     */
    peekTopElement() {
        if (this.isEmpty()) {
            return undefined;
        }
        return this.#storageArray[1];
    }

    /**
     * Provides a shallow copy of all elements currently in the heap, excluding the unused
     * placeholder at index 0. Useful for final processing or debugging.
     * @returns {Array<number>} An array containing all actual elements.
     */
    retrieveAllElements() {
        return this.#storageArray.slice(1);
    }
}

// --- Stage 3: Main Program Logic Execution ---

// Instantiate a new max-heap to manage the numbers.
const numberProcessorHeap = new BinaryMaxHeap();

// Populate the heap efficiently using the initial collection of values.
numberProcessorHeap.buildFromInitialArray(startingValueCollection);

// Execute the specified number of halving operations.
// In each iteration, the largest value is processed.
for (let operationCounter = 0; operationCounter < numberOfHalvingOperations; operationCounter++) {
    // If the heap becomes empty before all operations are completed,
    // there are no more elements to process, so terminate the loop.
    if (numberProcessorHeap.isEmpty()) {
        break;
    }

    const currentLargestValue = numberProcessorHeap.extractTopElement();
    // Perform integer division by 2 using Math.floor to ensure an integer result.
    const halvedResultValue = Math.floor(currentLargestValue / 2);

    // Only re-insert the halved value if it's still positive.
    // This prevents zero or negative values (if they somehow occurred) from cluttering the heap,
    // as they would not contribute meaningfully to the final sum or further operations.
    if (halvedResultValue > 0) {
        numberProcessorHeap.insertElement(halvedResultValue);
    }
}

// --- Stage 4: Final Summation and Output ---
let accumulatedTotalSum = 0;
// Retrieve all remaining elements from the heap after all operations.
const remainingElementsInHeap = numberProcessorHeap.retrieveAllElements();

// Iterate through the remaining elements and sum them up.
for (const element of remainingElementsInHeap) {
    accumulatedTotalSum += element;
}

// Output the final calculated sum to standard output.
console.log(accumulatedTotalSum);