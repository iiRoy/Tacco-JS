const sourceData = require('fs').readFileSync('/dev/stdin', 'utf8');

let textLines = sourceData.split('\n');

const firstLineTokens = textLines.shift().split(' ');

const totalItems = parseInt(firstLineTokens[0], 10);

const numOperations = Number(firstLineTokens[1]);

const startingValues = textLines.shift().split(' ').map(Number);

/*
 * This object implements a basic binary heap (priority queue) data structure.
 * It supports both min-heap and max-heap configurations.
 */
const PriorityQueueManager = {
    // The internal array that stores the heap elements.
    // Index 0 is intentionally left unused to simplify parent/child index calculations.
    storageArray: [],

    // The comparison function determines the heap type (min-heap or max-heap).
    // By default, it's configured for a min-heap (smaller values have higher priority).
    comparisonFunc: (firstVal, secondVal) => firstVal < secondVal,

    /**
     * Initializes the priority queue with a given set of elements.
     * @param {Array<number>} inputElements - An array of numbers to populate the heap.
     * @param {boolean} isMaxHeapMode - If true, the heap operates as a max-heap; otherwise, it's a min-heap.
     * @returns {void}
     */
    initialize(inputElements, isMaxHeapMode) {
        // Reset the storage array, ensuring the first slot is empty.
        this.storageArray = [0];

        // Configure the comparison logic based on the requested heap type.
        if (isMaxHeapMode) {
            this.comparisonFunc = (valA, valB) => valA > valB; // For max-heap, larger values have higher priority.
        }

        // Add each element from the input array one by one, maintaining heap property.
        for (let idx = 0; idx < inputElements.length; idx++) {
            this.insertElement(inputElements[idx]);
        }
    },

    /**
     * Inserts a new value into the heap and then bubbles it up to maintain the heap property.
     * @param {number} valueToInsert - The numeric value to be added to the heap.
     * @returns {void}
     */
    insertElement(valueToInsert) {
        let currentPosition = this.storageArray.length; // New element starts at the end.

        // Continuously compare the new element with its parent and swap if necessary.
        while (currentPosition > 1) {
            const parentPosition = Math.floor(currentPosition / 2); // Calculate parent's index.
            // If the new value has higher priority than its parent, swap them.
            if (this.comparisonFunc(valueToInsert, this.storageArray[parentPosition])) {
                this.storageArray[currentPosition] = this.storageArray[parentPosition];
                currentPosition = parentPosition; // Move up to the parent's old position.
            } else {
                // If the new value is in its correct place relative to its parent, stop.
                break;
            }
        }
        this.storageArray[currentPosition] = valueToInsert; // Place the element in its final spot.
    },

    /**
     * Removes and returns the root element (the highest priority element) from the heap.
     * It then re-establishes the heap property by sifting down the last element.
     * @returns {number|undefined} The extracted root value, or undefined if the heap is empty.
     */
    extractRoot() {
        // Handle cases where the heap has zero or one actual element.
        if (this.storageArray.length <= 1) {
            return undefined; // Heap is empty (only placeholder at index 0).
        } else if (this.storageArray.length === 2) {
            return this.storageArray.pop(); // Only one actual element at index 1.
        }

        const topValue = this.storageArray[1]; // The element to be returned.
        const lastElementInHeap = this.storageArray.pop(); // Remove the last element for re-insertion.
        let currentIdx = 1; // Start the sift-down process from the root.

        // Sift down the 'lastElementInHeap' until its correct position is found.
        while (true) {
            const childLeft = currentIdx * 2;
            const childRight = currentIdx * 2 + 1;
            let bestChildIdx = currentIdx; // Assume current position is the best for now.

            // Check if the left child exists and has higher priority than the 'lastElementInHeap'.
            if (childLeft < this.storageArray.length && this.comparisonFunc(this.storageArray[childLeft], lastElementInHeap)) {
                bestChildIdx = childLeft;
            }

            // Check if the right child exists and has higher priority than 'lastElementInHeap',
            // AND also has higher priority than the current 'bestChildIdx' (could be left child or currentIdx).
            if (childRight < this.storageArray.length &&
                this.comparisonFunc(this.storageArray[childRight], lastElementInHeap) &&
                this.comparisonFunc(this.storageArray[childRight], this.storageArray[bestChildIdx]))
            {
                bestChildIdx = childRight;
            }

            // If a child with higher priority was found, swap with it.
            if (bestChildIdx !== currentIdx) {
                this.storageArray[currentIdx] = this.storageArray[bestChildIdx];
                currentIdx = bestChildIdx; // Move down to the child's position.
            } else {
                // If no child has higher priority, the element is in its correct place.
                break;
            }
        }
        this.storageArray[currentIdx] = lastElementInHeap; // Place the element in its final sifted position.
        return topValue; // Return the original root value.
    }
};

// Initialize the priority queue as a max-heap using the parsed starting values.
PriorityQueueManager.initialize(startingValues, true); // 'true' indicates a max-heap.

// Execute the specified number of reduction operations.
for (let iterationCounter = 0; iterationCounter < numOperations; iterationCounter++) {
    const currentLargest = PriorityQueueManager.extractRoot(); // Get the largest item.
    PriorityQueueManager.insertElement(Math.floor(currentLargest / 2)); // Insert half of it (integer division).
}

let runningTotal = 0; // Variable to accumulate the sum of remaining elements.

// Sum up all elements currently present in the heap (skipping the unused index 0).
for (let heapPosition = 1; heapPosition < PriorityQueueManager.storageArray.length; heapPosition++) {
    runningTotal += PriorityQueueManager.storageArray[heapPosition];
}

// Print the final calculated sum to the standard output.
console.log(runningTotal);