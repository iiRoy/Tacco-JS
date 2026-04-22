// This module provides a flexible parser for processing structured input text.
const InputDataProcessor = (function () {
    /**
     * Factory function to create a new parser instance.
     * @param {string} rawInputText - The complete string content to parse.
     * @returns {TextStreamHandler} A new instance of the text stream handler.
     */
    function createTextParser(rawInputText) {
        if (typeof rawInputText !== 'string' || rawInputText.length === 0) {
            // In competitive programming, often empty input is not a concern,
            // but for robustness, we can handle it.
            return new TextStreamHandler(""); // Return handler for empty string
        }
        return new TextStreamHandler(rawInputText);
    }

    /**
     * Handles parsing operations on a stream of text, line by line.
     * @class TextStreamHandler
     */
    function TextStreamHandler(sourceContent) {
        // Normalize line endings and split into an array of lines.
        // Also remove any leading/trailing whitespace from the overall content.
        this._inputLines = sourceContent.trim().split(/\r?\n/);
        this._currentLineIndex = 0; // Pointer to the current line being processed.
    }

    /**
     * Retrieves the next token from the current line. If the current line is exhausted,
     * it moves to the next line. Tokens are separated by spaces.
     * This method modifies the internal state of the current line's token buffer.
     * @param {boolean} [asString=false] - If true, returns the token as a string; otherwise, attempts to convert to a number.
     * @returns {string|number|undefined} The extracted token, or undefined if no more tokens are available.
     */
    TextStreamHandler.prototype.extractNextToken = function (asString = false) {
        // Ensure we don't go past the end of the input lines.
        if (this._currentLineIndex >= this._inputLines.length) {
            return undefined; // No more lines to process.
        }

        let lineBeingProcessed = this._inputLines[this._currentLineIndex];

        // Lazily tokenize the current line if it hasn't been done yet.
        // We store tokens directly on the line object for efficiency in subsequent calls.
        if (!lineBeingProcessed._tokensCache) {
            lineBeingProcessed._tokensCache = lineBeingProcessed.split(" ").filter(t => t !== ''); // Split and filter out empty strings from multiple spaces.
            lineBeingProcessed._tokenPointer = 0; // Initialize pointer for this line's tokens.
        }

        // If the current line's tokens are exhausted, move to the next line and try again.
        if (lineBeingProcessed._tokenPointer >= lineBeingProcessed._tokensCache.length) {
            this._currentLineIndex++;
            // Clear the cache for the previously processed line to free memory.
            delete lineBeingProcessed._tokensCache;
            delete lineBeingProcessed._tokenPointer;
            return this.extractNextToken(asString); // Recursively call for the next line.
        }

        // Extract the next token from the current line's cache.
        const nextToken = lineBeingProcessed._tokensCache[lineBeingProcessed._tokenPointer++];

        // If this token was the last one on the line, clean up the cache for this line.
        if (lineBeingProcessed._tokenPointer >= lineBeingProcessed._tokensCache.length) {
            delete lineBeingProcessed._tokensCache;
            delete lineBeingProcessed._tokenPointer;
        }

        // Return the token, converting to number if not explicitly requested as string.
        return asString ? nextToken : Number(nextToken);
    };

    /**
     * Reads and parses an entire line, returning its tokens.
     * After calling this, the internal line pointer will advance to the next line.
     * @param {boolean} [asString=false] - If true, returns tokens as strings; otherwise, attempts to convert to numbers.
     * @returns {Array<string|number>|undefined} An array of tokens from the line, or undefined if no more lines.
     */
    TextStreamHandler.prototype.parseCurrentLine = function (asString = false) {
        if (this._currentLineIndex >= this._inputLines.length) {
            return undefined; // No more lines to process.
        }

        // Fetch the line and advance the line pointer immediately.
        const lineContent = this._inputLines[this._currentLineIndex++];
        const tokens = lineContent.split(" ").filter(t => t !== ''); // Filter out empty strings.

        // Convert tokens to numbers if required.
        return asString ? tokens : tokens.map(Number);
    };

    /**
     * Reads a specified number of lines and parses them into a matrix (array of arrays).
     * The internal line pointer advances by `numLines`.
     * @param {number} numLinesToRead - The number of lines to read for the matrix.
     * @param {boolean} [asString=false] - If true, matrix elements are strings; otherwise, attempts to convert to numbers.
     * @returns {Array<Array<string|number>>} A 2D array representing the matrix. Returns an empty array if `numLinesToRead` is invalid.
     */
    TextStreamHandler.prototype.readDataMatrix = function (numLinesToRead, asString = false) {
        if (numLinesToRead <= 0) {
            // Log a warning or throw an error for invalid input, depending on strictness.
            return [];
        }

        const availableLines = this._inputLines.length - this._currentLineIndex;
        if (numLinesToRead > availableLines) {
            // Adjust to read only available lines if requested amount exceeds.
            numLinesToRead = availableLines;
        }

        const resultingMatrix = [];
        for (let i = 0; i < numLinesToRead; i++) {
            const parsedLine = this.parseCurrentLine(asString);
            if (parsedLine) { // Ensure parseCurrentLine didn't return undefined.
                resultingMatrix.push(parsedLine);
            }
        }
        return resultingMatrix;
    };

    /**
     * Reads a specified number of lines and returns them as a flat array of values.
     * The internal line pointer advances by `numLines`.
     * @param {number} numLinesToRead - The number of lines to read.
     * @param {boolean} [asString=false] - If true, array elements are strings; otherwise, attempts to convert to numbers.
     * @returns {Array<string|number>} A 1D array of values from the lines. Returns an empty array if `numLinesToRead` is invalid.
     */
    TextStreamHandler.prototype.fetchLineRange = function (numLinesToRead, asString = false) {
        if (numLinesToRead <= 0) {
            return [];
        }

        const availableLines = this._inputLines.length - this._currentLineIndex;
        if (numLinesToRead > availableLines) {
            numLinesToRead = availableLines;
        }

        const lineValuesArray = [];
        for (let i = 0; i < numLinesToRead; i++) {
            const currentLine = this._inputLines[this._currentLineIndex++];
            lineValuesArray.push(asString ? currentLine : Number(currentLine));
        }
        return lineValuesArray;
    };

    return createTextParser;
})();

// This utility function creates a multi-dimensional array filled with a specified value.
// It avoids using `eval` for safer and more predictable execution.
function createNestedArray(dimensions, fillValue) {
    // Validate dimensions input to ensure it's an array of non-negative integers.
    if (!Array.isArray(dimensions) || dimensions.some(d => !Number.isInteger(d) || d < 0)) {
        // In a production system, this might throw an error. For competitive programming,
        // it might be assumed valid input.
        return [];
    }

    // Base case for the recursion: if only one dimension remains, create a 1D array.
    if (dimensions.length === 1) {
        return Array(dimensions[0]).fill(fillValue);
    }

    // Recursive step: create an outer array and fill it with nested arrays.
    const currentDimensionSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1); // Get dimensions for the inner arrays.

    const outerArray = [];
    for (let i = 0; i < currentDimensionSize; i++) {
        outerArray.push(createNestedArray(remainingDimensions, fillValue));
    }
    return outerArray;
}

// Implements a min-priority queue (min-heap) data structure.
// This module exports a factory function to create new heap instances.
const MinHeapModule = (function () {
    /**
     * Factory function to create a new MinPriorityQueue instance.
     * @returns {MinPriorityQueue} A new min-priority queue.
     */
    function createMinHeap() {
        return new MinPriorityQueue();
    }

    /**
     * @class MinPriorityQueue
     * Implements a binary min-heap. Elements are expected to be arrays where the first element
     * is the priority (e.g., `[priority, data]`). Lower priority values are extracted first.
     */
    function MinPriorityQueue() {
        this.heapStorage = []; // The underlying array that stores heap elements.
    }

    /**
     * Helper function to swap two elements in the heap storage array.
     * @param {number} idx1 - Index of the first element to swap.
     * @param {number} idx2 - Index of the second element to swap.
     * @private
     */
    MinPriorityQueue.prototype._swap = function (idx1, idx2) {
        const temp = this.heapStorage[idx1];
        this.heapStorage[idx1] = this.heapStorage[idx2];
        this.heapStorage[idx2] = temp;
    };

    /**
     * Adds an element to the priority queue and maintains the heap property.
     * The element should be an array, with its priority as the first item (e.g., `[priority, data]`).
     * @param {Array<any>} newItem - The item to add to the heap.
     */
    MinPriorityQueue.prototype.insertElement = function (newItem) {
        this.heapStorage.push(newItem); // Add new item to the end.
        let currentIndex = this.heapStorage.length - 1; // Index of the newly added item.

        // Perform heapify-up operation:
        // Move the new item up the heap until its parent's priority is smaller or it becomes the root.
        while (currentIndex > 0) {
            const parentIndex = Math.floor((currentIndex - 1) / 2);
            // If the parent's priority is less than or equal to the current item's priority,
            // the min-heap property is satisfied at this point, so we can stop.
            if (this.heapStorage[parentIndex][0] <= newItem[0]) {
                break;
            }
            // Otherwise, the parent is larger, so swap them and continue bubbling up.
            this._swap(currentIndex, parentIndex);
            currentIndex = parentIndex;
        }
    };

    /**
     * Removes and returns the element with the smallest priority from the queue (the root element).
     * @returns {Array<any>|undefined} The element with the smallest priority, or `undefined` if the queue is empty.
     */
    MinPriorityQueue.prototype.extractMin = function () {
        const currentHeapSize = this.heapStorage.length;
        if (currentHeapSize === 0) {
            return undefined; // The queue is empty, nothing to extract.
        }

        // The element with the smallest priority is always at the root (index 0).
        const minPriorityElement = this.heapStorage[0];

        // Move the last element of the heap to the root position.
        const lastElement = this.heapStorage.pop();
        if (this.heapStorage.length === 0) {
            // If the heap became empty after popping, return the min element directly.
            return minPriorityElement;
        }

        this.heapStorage[0] = lastElement; // Place the last element at the root.
        let currentIndex = 0;
        const newHeapSize = this.heapStorage.length;

        // Perform heapify-down operation:
        // Move the new root down the heap until its children are larger or it becomes a leaf.
        while (true) {
            const leftChildIndex = 2 * currentIndex + 1;
            const rightChildIndex = 2 * currentIndex + 2;
            let smallestChildIndex = currentIndex; // Assume the current node is the smallest among itself and its children.

            // Check if a left child exists and has a smaller priority.
            if (leftChildIndex < newHeapSize && this.heapStorage[leftChildIndex][0] < this.heapStorage[smallestChildIndex][0]) {
                smallestChildIndex = leftChildIndex;
            }

            // Check if a right child exists and has a smaller priority than the current smallest.
            if (rightChildIndex < newHeapSize && this.heapStorage[rightChildIndex][0] < this.heapStorage[smallestChildIndex][0]) {
                smallestChildIndex = rightChildIndex;
            }

            // If the current node is indeed the smallest, the heap property is restored.
            if (smallestChildIndex === currentIndex) {
                break;
            }

            // Otherwise, swap with the smallest child and continue bubbling down.
            this._swap(currentIndex, smallestChildIndex);
            currentIndex = smallestChildIndex;
        }

        return minPriorityElement;
    };

    /**
     * Returns the number of elements currently in the priority queue.
     * @returns {number} The current size of the heap.
     */
    MinPriorityQueue.prototype.size = function () {
        return this.heapStorage.length;
    };

    /**
     * Checks if the priority queue is empty.
     * @returns {boolean} True if the queue contains no elements, false otherwise.
     */
    MinPriorityQueue.prototype.isEmpty = function () {
        return this.heapStorage.length === 0;
    };

    return createMinHeap;
})();

// Main problem-solving logic encapsulated in a function.
function calculateMinimumOperations() {
    // Initialize input parser from standard input.
    // This assumes a Node.js environment where 'fs' module is available.
    const fileSystem = require("fs");
    const inputContent = fileSystem.readFileSync("/dev/stdin", "utf8");
    const dataInput = InputDataProcessor(inputContent);

    // Read problem parameters: array size N, target array A, and current array B.
    const arraySize = dataInput.extractNextToken(); // N, the number of elements in the arrays.
    const targetArray = dataInput.parseCurrentLine(); // Array A, the desired final state.
    const currentArray = dataInput.parseCurrentLine(); // Array B, the array to be modified.

    // Initialize the priority queue. We use a min-heap but store negative values of B[i]
    // to effectively create a max-heap for B[i]. This means elements with larger B[i]
    // (and thus more "work" to do) will be processed first.
    const elementsToProcess = MinHeapModule();

    // First pass: Iterate through the arrays to check initial conditions and populate the priority queue.
    for (let indexIter = 0; indexIter < arraySize; indexIter++) {
        const targetValueA = targetArray[indexIter];
        const currentValueB = currentArray[indexIter];

        // If an element in B already matches A, no operations are needed for it initially.
        if (targetValueA === currentValueB) {
            continue;
        }

        // If B[i] is already greater than A[i], it's impossible to reach A[i] by only decreasing B[i].
        // The problem implies B[i] can only decrease.
        if (targetValueA > currentValueB) {
            return -1; // Indicate an impossible scenario.
        }

        // If B[i] > A[i], add it to the priority queue.
        // We store `[-currentValueB, indexIter]` so the largest `currentValueB` (most negative priority)
        // comes out first from the min-heap.
        elementsToProcess.insertElement([-currentValueB, indexIter]);
    }

    let totalOperationsCount = 0; // Accumulator for the total number of operations performed.
    // A safety break for competitive programming problems to prevent infinite loops in edge cases.
    // The number of operations can be large, but usually bounded by N * MaxValue or similar.
    // N*N*2 is a heuristic, adjust if problem constraints suggest otherwise.
    const MAX_LOOP_ITERATIONS = arraySize * arraySize * 2;
    let currentLoopIteration = 0;

    // Process elements from the priority queue until it is empty.
    while (!elementsToProcess.isEmpty()) {
        currentLoopIteration++;
        if (currentLoopIteration > MAX_LOOP_ITERATIONS) {
            // This indicates a potential issue where the queue never empties or converges,
            // suggesting an impossible case or a flaw in logic.
            return -1;
        }

        const elementData = elementsToProcess.extractMin();
        // If elementData is undefined, it means the queue became empty unexpectedly,
        // which should not happen right after `!isEmpty()`.
        if (!elementData) {
            break;
        }

        const elementIndex = elementData[1]; // The index of the array element being processed.
        const targetValueA = targetArray[elementIndex];
        let currentValueB = currentArray[elementIndex]; // Get the current value from array B.

        // Calculate the sum of adjacent elements (circularly).
        const previousIndex = (elementIndex - 1 + arraySize) % arraySize;
        const nextIndex = (elementIndex + 1) % arraySize;
        const sumOfAdjacentValues = currentArray[previousIndex] + currentArray[nextIndex];

        // If the sum of adjacent values is zero, B[j] cannot be decreased by the operation.
        if (sumOfAdjacentValues === 0) {
            if (targetValueA !== currentValueB) {
                // If B[j] needs to be decreased but cannot, it's impossible to reach target.
                return -1;
            }
            // If A[j] === B[j], no operations needed, simply continue to next element.
            continue;
        }

        // Calculate how many times we need to apply the operation to B[j].
        // The operation reduces B[j] by `sumOfAdjacentValues`.
        // We need to reduce `currentValueB` to `targetValueA`.
        const neededReduction = currentValueB - targetValueA;
        let numberOfDecrements = Math.floor(neededReduction / sumOfAdjacentValues);

        // If `numberOfDecrements` is zero, but `neededReduction` is positive, it means
        // `neededReduction` is less than `sumOfAdjacentValues`. In this scenario,
        // we cannot perform a full operation to reduce `currentValueB` towards `targetValueA`.
        // This implies it's impossible to reach `targetValueA` exactly or go below it
        // to eventually match it.
        if (numberOfDecrements === 0 && neededReduction > 0) {
            return -1;
        }

        // Apply the calculated number of operations.
        totalOperationsCount += numberOfDecrements;
        currentValueB -= sumOfAdjacentValues * numberOfDecrements;
        currentArray[elementIndex] = currentValueB; // Update the array B with the new value.

        // After operations, re-check the state of the current element.
        if (targetValueA === currentValueB) {
            // If the target is now reached, no need to re-add to the queue.
            continue;
        }

        if (targetValueA > currentValueB) {
            // If we overshot the target value A[j], it's impossible.
            return -1;
        }

        // If target not yet reached (currentValueB is still > targetValueA),
        // re-add the updated element to the priority queue to be processed again later.
        elementsToProcess.insertElement([-currentValueB, elementIndex]);
    }

    return totalOperationsCount;
}

// Execute the main problem-solving function and print the result.
(function executeSolution() {
    try {
        const finalResult = calculateMinimumOperations();
        console.log(finalResult);
    } catch (error) {
        // Catch any unexpected errors during execution and provide a consistent error output.
        console.error("An unexpected error occurred during solution execution:", error.message);
        console.log("-1"); // Standard error output for many competitive programming platforms.
    }
})();