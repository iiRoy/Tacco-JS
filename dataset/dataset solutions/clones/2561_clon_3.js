const fileSystem = require('fs'); // Dependency: File System module for I/O operations

// --- Core Data Structures & Utilities ---

/**
 * Represents a basic queue data structure.
 * Elements are added to the back and removed from the front.
 */
class ProcessQueue {
    #elements; // Private field for internal array storing queue elements.
    #frontIndex; // Index pointing to the front of the queue.

    /**
     * Initializes a new queue, optionally pre-populated with items.
     * @param {Array<any>} initialItems - Optional array of items to start the queue with.
     */
    constructor(initialItems = []) {
        this.#elements = [...initialItems]; // Create a shallow copy to avoid modifying the original array reference.
        this.#frontIndex = 0; // Initialize the front index.
    }

    /**
     * Adds an item to the end of the queue.
     * @param {any} item - The item to be enqueued.
     */
    enqueueItem(item) {
        this.#elements.push(item);
    }

    /**
     * Removes and returns the item from the front of the queue.
     * Implements an optimization to periodically clean up the underlying array.
     * @returns {any|undefined} The item at the front, or undefined if the queue is empty.
     */
    dequeueItem() {
        // Guard clause: If the queue is empty, return undefined immediately.
        if (this.isEmpty()) {
            return undefined;
        }

        const itemToReturn = this.#elements[this.#frontIndex];
        this.#frontIndex++; // Advance the front index.

        // Optimization: Prevent excessive memory use by slicing the array
        // when a significant portion of elements have been conceptually removed.
        const cleanupThreshold = 2000; // Arbitrary number of dequeues before considering cleanup.
        const halfArraySize = this.#elements.length / 2;

        if (this.#frontIndex > cleanupThreshold && this.#frontIndex > halfArraySize) {
            this.#elements = this.#elements.slice(this.#frontIndex);
            this.#frontIndex = 0; // Reset index after cleaning.
        }

        return itemToReturn;
    }

    /**
     * Checks if the queue currently contains any elements.
     * @returns {boolean} True if the queue is empty, false otherwise.
     */
    isEmpty() {
        return this.#frontIndex >= this.#elements.length;
    }

    /**
     * Clears all items from the queue, resetting it to an empty state.
     */
    resetQueue() {
        this.#elements = [];
        this.#frontIndex = 0;
    }

    /**
     * Gets the number of items currently available in the queue.
     * @returns {number} The current size of the queue.
     */
    get currentSize() {
        return this.#elements.length - this.#frontIndex;
    }
}

/**
 * Utility class for reading and parsing input tokens from a single string.
 * It tokenizes the input and manages access via an internal queue.
 */
class DataStreamProcessor {
    #tokenQueue; // Private queue to hold the parsed input tokens.

    /**
     * Initializes the processor with a raw input string.
     * The string is trimmed and split into tokens based on whitespace.
     * @param {string} rawInputString - The string containing all input data.
     */
    constructor(rawInputString) {
        // Pre-process the input: remove leading/trailing whitespace and split by any sequence of whitespace.
        const processedTokens = rawInputString.trim().split(/\s+/g);
        this.#tokenQueue = new ProcessQueue(processedTokens); // Initialize the queue with tokens.
    }

    /**
     * Reads and returns the next raw string token from the input stream.
     * @returns {string|undefined} The next string token, or undefined if no more tokens are available.
     */
    readNextToken() {
        return this.#tokenQueue.dequeueItem();
    }

    /**
     * Reads the next token, attempts to parse it as a base-10 integer, and returns it.
     * Includes robust error handling for parsing failures and empty streams.
     * @returns {number|undefined} The next integer, or undefined if parsing fails or no tokens remain.
     */
    readNextInteger() {
        const tokenValue = this.readNextToken();
        if (tokenValue === undefined) {
            // Log a warning if an attempt is made to read an integer from an exhausted stream.
            console.warn("DataStreamProcessor: Attempted to read integer from an empty input stream.");
            return undefined;
        }

        const parsedNumber = parseInt(tokenValue, 10); // Parse with explicit radix 10.

        // Guard clause: Check if parsing resulted in NaN.
        if (isNaN(parsedNumber)) {
            console.error(`DataStreamProcessor: Failed to parse "${tokenValue}" as an integer. Returning undefined.`);
            return undefined;
        }
        return parsedNumber;
    }

    /**
     * Clears all tokens from the internal queue, effectively resetting the input stream.
     */
    clearInputStream() {
        this.#tokenQueue.resetQueue();
    }
}

/**
 * Helper function for comparison: checks if 'a' is less than or equal to 'b'.
 * This is the default comparison for a min-heap.
 * @param {number} a - The first value for comparison.
 * @param {number} b - The second value for comparison.
 * @returns {boolean} True if a <= b, false otherwise.
 */
const compareValuesLE = (a, b) => a <= b;

/**
 * Helper function for comparison: checks if 'a' is greater than or equal to 'b'.
 * This is used for a max-heap.
 * @param {number} a - The first value for comparison.
 * @param {number} b - The second value for comparison.
 * @returns {boolean} True if a >= b, false otherwise.
 */
const compareValuesGE = (a, b) => a >= b;

/**
 * Implements a binary heap data structure, which can operate as a min-heap (default) or a max-heap.
 * Uses an array to represent the heap and a custom comparison function for ordering.
 */
class BinaryHeap {
    #heapArray; // The internal array that stores the heap elements.
    #comparisonFunction; // The function defining the heap's ordering (e.g., for min-heap: (a, b) => a <= b).

    /**
     * Initializes a new BinaryHeap instance.
     * @param {Array<number>} [initialElements=[]] - An optional array of numbers to build the heap from.
     * @param {boolean} [isMinHeap=true] - If true, the heap will be a min-heap; if false, a max-heap.
     * @param {Function} [customComparator] - An optional function (a, b) => boolean to define custom ordering.
     *                                        If provided, this overrides 'isMinHeap'.
     */
    constructor(initialElements = [], isMinHeap = true, customComparator = undefined) {
        // Set the comparison function based on 'isMinHeap' or 'customComparator'.
        if (customComparator) {
            this.#comparisonFunction = customComparator;
        } else {
            this.#comparisonFunction = isMinHeap ? compareValuesLE : compareValuesGE;
        }

        this.#heapArray = [...initialElements]; // Create a shallow copy of initial elements.

        // If initial elements are provided, build the heap property.
        if (this.#heapArray.length > 0) {
            this.#buildHeap();
        }
    }

    /**
     * Transforms an arbitrary array into a heap-ordered array.
     * It does this by starting from the last non-leaf node and sifting down each node.
     */
    #buildHeap() {
        // The last non-leaf node in a 0-indexed array is at Math.floor(n/2) - 1.
        const lastParentNodeIndex = Math.floor(this.#heapArray.length / 2) - 1;
        for (let i = lastParentNodeIndex; i >= 0; i--) {
            this.#siftDown(i); // Sift down each parent node.
        }
    }

    /**
     * Restores the heap property by moving an element downwards in the heap.
     * This is typically called after extraction or during heap construction.
     * @param {number} startingIndex - The index of the element to sift down.
     */
    #siftDown(startingIndex) {
        const currentHeapSize = this.#heapArray.length;
        let currentIndex = startingIndex;

        while (true) {
            const leftChildIndex = 2 * currentIndex + 1;
            const rightChildIndex = 2 * currentIndex + 2;
            let bestChildIndex = currentIndex; // Assume current node is the 'best' (min/max) for now.

            // Check if left child exists and is 'better' than the current 'best' node.
            if (leftChildIndex < currentHeapSize && this.#comparisonFunction(this.#heapArray[leftChildIndex], this.#heapArray[bestChildIndex])) {
                bestChildIndex = leftChildIndex;
            }
            // Check if right child exists and is 'better' than the current 'best' node (including comparison with left child).
            if (rightChildIndex < currentHeapSize && this.#comparisonFunction(this.#heapArray[rightChildIndex], this.#heapArray[bestChildIndex])) {
                bestChildIndex = rightChildIndex;
            }

            // If the 'best' node is not the current node, a swap is needed.
            if (bestChildIndex !== currentIndex) {
                // Perform the swap using ES6 array destructuring.
                [this.#heapArray[currentIndex], this.#heapArray[bestChildIndex]] =
                [this.#heapArray[bestChildIndex], this.#heapArray[currentIndex]];
                currentIndex = bestChildIndex; // Continue sifting down from the new position.
            } else {
                break; // Heap property is restored for this branch.
            }
        }
    }

    /**
     * Restores the heap property by moving an element upwards in the heap.
     * This is typically called after insertion.
     * @param {number} startingIndex - The index of the element to sift up.
     */
    #siftUp(startingIndex) {
        let currentIndex = startingIndex;
        while (currentIndex > 0) {
            const parentIndex = Math.floor((currentIndex - 1) / 2);
            // If the current element is 'better' than its parent, swap them.
            if (this.#comparisonFunction(this.#heapArray[currentIndex], this.#heapArray[parentIndex])) {
                // Perform the swap using ES6 array destructuring.
                [this.#heapArray[currentIndex], this.#heapArray[parentIndex]] =
                [this.#heapArray[parentIndex], this.#heapArray[currentIndex]];
                currentIndex = parentIndex; // Continue sifting up.
            } else {
                break; // Heap property is restored for this branch.
            }
        }
    }

    /**
     * Inserts a new value into the heap, maintaining the heap property.
     * @param {number} itemValue - The value to be inserted.
     */
    insert(itemValue) {
        this.#heapArray.push(itemValue); // Add the new item to the end of the array.
        this.#siftUp(this.#heapArray.length - 1); // Sift up the new item to its correct position.
    }

    /**
     * Returns the top (root) element of the heap without removing it.
     * @returns {number|undefined} The top element, or undefined if the heap is empty.
     */
    peek() {
        return this.#heapArray.length > 0 ? this.#heapArray[0] : undefined;
    }

    /**
     * Removes and returns the top (root) element of the heap, maintaining the heap property.
     * @returns {number|undefined} The extracted top element, or undefined if the heap is empty.
     */
    extractTop() {
        if (this.#heapArray.length === 0) {
            return undefined; // Heap is empty.
        }
        if (this.#heapArray.length === 1) {
            return this.#heapArray.pop(); // Only one element, simply remove and return it.
        }

        const topElement = this.#heapArray[0]; // Store the top element to return.
        // Move the last element to the root position.
        this.#heapArray[0] = this.#heapArray.pop();
        this.#siftDown(0); // Sift down the new root to restore heap property.

        return topElement;
    }

    /**
     * Gets the current number of elements in the heap.
     * @returns {number} The size of the heap.
     */
    get size() {
        return this.#heapArray.length;
    }

    /**
     * Checks if the heap is currently empty.
     * @returns {boolean} True if the heap contains no elements, false otherwise.
     */
    isEmpty() {
        return this.#heapArray.length === 0;
    }

    /**
     * Returns a shallow copy of the internal array representing the heap.
     * This can be useful for debugging or inspection but should not be used for modification.
     * @returns {Array<number>} An array containing all elements currently in the heap.
     */
    getElementsAsArray() {
        return [...this.#heapArray];
    }
}

// --- Main Application Logic ---

/**
 * Orchestrates the number transformation process.
 * It reads initial parameters, populates a min-heap, performs halving operations,
 * and then sums the final elements, printing the result.
 * @param {DataStreamProcessor} inputProcessor - An instance of the input processor to read data.
 */
const executeNumberTransformation = (inputProcessor) => {
    // Read the initial count of numbers (N) and the number of operations (M).
    const initialNumbersCount = inputProcessor.readNextInteger(); // Corresponds to 'e' in original module 5.
    const operationIterations = inputProcessor.readNextInteger(); // Corresponds to 'i' in original module 5.

    // Input validation: Ensure N and M are valid non-negative integers.
    if (initialNumbersCount === undefined || operationIterations === undefined || initialNumbersCount < 0 || operationIterations < 0) {
        console.error("Error: Invalid or missing initial count (N) or operation iterations (M) provided. Exiting.");
        return; // Early exit if input is invalid.
    }
    if (initialNumbersCount === 0 && operationIterations === 0) {
        console.log(0); // Special case: no numbers, no operations, sum is 0.
        return;
    }

    // Initialize a min-heap. The problem's logic of halving the 'top' element
    // and re-inserting it, then summing remaining, implies a min-heap based on the original's
    // default heap comparator.
    const numberMinHeap = new BinaryHeap([], true); // 'true' explicitly configures it as a min-heap.

    // Populate the min-heap with 'initialNumbersCount' numbers.
    for (let i = 0; i < initialNumbersCount; i++) {
        const currentInputNumber = inputProcessor.readNextInteger(); // Corresponds to 'o' in original module 5.
        // Guard against insufficient input numbers.
        if (currentInputNumber === undefined) {
            console.error(`Error: Expected ${initialNumbersCount} numbers, but only found ${i} before stream exhausted. Exiting.`);
            return;
        }
        numberMinHeap.insert(currentInputNumber);
    }

    // Perform 'operationIterations' number of transformations.
    // Each transformation involves extracting the smallest element, halving it, and re-inserting.
    for (let opCounter = 0; opCounter < operationIterations; opCounter++) { // Corresponds to 'h' in original module 5.
        // If the heap becomes empty before all operations are complete, warn and stop.
        if (numberMinHeap.isEmpty()) {
            console.warn(`Warning: Heap became empty after ${opCounter} operations, less than the expected ${operationIterations}.`);
            break;
        }
        const smallestElement = numberMinHeap.extractTop(); // Corresponds to 'a' in original module 5.

        // Robustness check: ensure the extracted element is a valid number.
        if (typeof smallestElement !== 'number' || isNaN(smallestElement)) {
            console.error(`Error: Invalid value (${smallestElement}) extracted from heap during operation ${opCounter}. Skipping this operation.`);
            continue; // Skip current operation if value is invalid.
        }

        const halvedResult = Math.floor(smallestElement / 2); // Halve the smallest element.
        numberMinHeap.insert(halvedResult); // Re-insert the halved value into the heap.
    }

    // Calculate the total sum of all remaining elements in the heap.
    let finalTotalSum = 0; // Corresponds to 'u' in original module 5.
    // Loop until the heap is empty, extracting and accumulating values.
    while (!numberMinHeap.isEmpty()) {
        const valueToAdd = numberMinHeap.extractTop();
        // Defensive check: ensure extracted value is valid before adding to sum.
        if (typeof valueToAdd === 'number' && !isNaN(valueToAdd)) {
            finalTotalSum += valueToAdd;
        }
    }

    // Output the final calculated sum.
    console.log(finalTotalSum);
};

// --- Application Entry Point ---

/**
 * This block serves as the main entry point for the application.
 * It replaces the webpack-specific module loading and execution wrapper.
 * It reads input from standard input, processes it, and handles potential errors.
 */
try {
    // Read the entire content from the standard input stream synchronously.
    // Specifying 'utf8' encoding ensures the input is read as a string.
    const standardInputContent = fileSystem.readFileSync('/dev/stdin', 'utf8');

    // Create an instance of the DataStreamProcessor to handle the input.
    const inputDataProcessor = new DataStreamProcessor(standardInputContent);

    // Invoke the main logic function with the prepared input processor.
    executeNumberTransformation(inputDataProcessor);

} catch (executionError) {
    // Catch and report any errors that occur during file reading or the main processing logic.
    console.error("An unhandled error occurred during application execution:");

    // Provide more specific error messages for common issues.
    if (executionError.code === 'ENOENT') {
        console.error("Input file '/dev/stdin' not found or accessible. Please ensure input is provided correctly.");
    } else {
        console.error(`Error message: ${executionError.message}`);
        // For development or debugging, also print the stack trace.
        // console.error(executionError.stack);
    }
    // Exit the process with a non-zero status code to indicate an error.
    process.exit(1);
}