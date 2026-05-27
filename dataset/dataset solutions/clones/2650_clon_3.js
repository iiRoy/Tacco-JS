const InputReaderFactory = (function() {
    /**
     * Parses a string of input into lines and tokens for sequential reading.
     * @param {string} inputString - The raw input string.
     */
    class InputReader {
        constructor(inputString) {
            this.sourceLines = inputString.trim().split("\n");
            this.currentLineIndex = 0;
        }

        /**
         * Reads the next token from the current line. Tokens are read from right to left.
         * If the current line is exhausted, it moves to the next line.
         * @param {boolean} [asString=false] - If true, returns the token as a string; otherwise, as a number.
         * @returns {string|number} The next token.
         */
        readNextToken(asString = false) {
            let currentLineTokens = this.sourceLines[this.currentLineIndex];
            // If the current line is still a string, split it and reverse to read from right.
            if (typeof currentLineTokens === "string") {
                this.sourceLines[this.currentLineIndex] = currentLineTokens.split(" ").reverse();
                currentLineTokens = this.sourceLines[this.currentLineIndex];
            }

            const token = currentLineTokens.pop();

            // If the current line is now empty, advance to the next line.
            if (!currentLineTokens.length) {
                this.currentLineIndex++;
            }
            return asString ? token : Number(token);
        }

        /**
         * Reads all tokens from the current line and advances to the next line.
         * @param {boolean} [asString=false] - If true, returns tokens as strings; otherwise, as numbers.
         * @returns {Array<string|number>} An array of tokens from the line.
         */
        readLineTokens(asString = false) {
            const lineContent = this.sourceLines[this.currentLineIndex++];
            const tokens = lineContent.split(" ");
            return asString ? tokens : tokens.map(val => Number(val));
        }

        /**
         * Reads 'numLines' lines, splitting each into tokens, and advances the line index.
         * @param {number} numLines - The number of lines to read.
         * @param {boolean} [asString=false] - If true, returns tokens as strings; otherwise, as numbers.
         * @returns {Array<Array<string|number>>} A 2D array (matrix) of tokens.
         */
        readMatrix(numLines, asString = false) {
            const matrixRows = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numLines);
            this.currentLineIndex += numLines;
            const parsedMatrix = matrixRows.map(line => line.split(" "));
            return asString ? parsedMatrix : parsedMatrix.map(row => row.map(val => Number(val)));
        }

        /**
         * Reads 'numLines' lines as whole strings or numbers, and advances the line index.
         * @param {number} numLines - The number of lines to read.
         * @param {boolean} [asString=false] - If true, returns lines as strings; otherwise, as numbers.
         * @returns {Array<string|number>} An array of lines.
         */
        readLines(numLines, asString = false) {
            const lines = this.sourceLines.slice(this.currentLineIndex, this.currentLineIndex + numLines);
            this.currentLineIndex += numLines;
            return asString ? lines : lines.map(val => Number(val));
        }
    }

    // The factory function to create an instance of InputReader
    return function createInputReader(inputString) {
        return new InputReader(inputString);
    };
})();

// Initialize the input reader with data from stdin
const inputData = InputReaderFactory(require("fs").readFileSync("/dev/stdin", "utf8"));

/**
 * Creates a multi-dimensional array initialized with a given value.
 * This function uses `eval` and should be used with caution.
 * @param {*} initialValue - The value to initialize array elements with.
 * @param {...number} dimensions - The dimensions of the array (e.g., createMultiDimArray(0, 2, 3) for a 2x3 array).
 * @returns {Array} The multi-dimensional array.
 */
function createMultiDimArray(initialValue) {
    const dimensions = Array.from(arguments).slice(1); // Get all arguments after initialValue
    let dimCount = dimensions.length;
    let arrayCreationString = `Array(dimensions[${--dimCount}]).fill(0).map(x=>{return initialValue;})`;
    while (--dimCount >= 0) {
        arrayCreationString = `Array(dimensions[${dimCount}]).fill(0).map(x=>${arrayCreationString})`;
    }
    // Using eval is generally discouraged due to security risks and performance,
    // but preserving original behavior as per Type III rules.
    return eval(arrayCreationString);
}

// MinPriorityQueueFactory (formerly PriorityQueue)
const MinPriorityQueueFactory = (function() {
    /**
     * Implements a min-priority queue using a binary heap.
     * Elements are expected to be arrays where the first element is the priority.
     */
    class MinPriorityQueue {
        constructor() {
            this.internalHeap = [];
        }

        /**
         * Helper to move an element up the heap to maintain heap property.
         * @param {number} currentIndex - The index of the element to sift up.
         */
        _siftUp(currentIndex) {
            const elementToSift = this.internalHeap[currentIndex];
            while (currentIndex > 0) {
                const parentIndex = (currentIndex - 1) >> 1; // Equivalent to Math.floor((currentIndex - 1) / 2)
                const parentElement = this.internalHeap[parentIndex];
                if (parentElement[0] <= elementToSift[0]) {
                    break; // Correct position found
                }
                this.internalHeap[currentIndex] = parentElement;
                currentIndex = parentIndex;
            }
            this.internalHeap[currentIndex] = elementToSift;
        }

        /**
         * Helper to move an element down the heap to maintain heap property.
         * @param {number} currentIndex - The index of the element to sift down.
         */
        _siftDown(currentIndex) {
            const elementToSift = this.internalHeap[currentIndex];
            const heapSize = this.internalHeap.length;
            const lastParentIndex = heapSize >> 1; // Index of the last node that can have children

            while (currentIndex < lastParentIndex) {
                let leftChildIndex = (currentIndex << 1) + 1; // Equivalent to (currentIndex * 2) + 1
                let rightChildIndex = leftChildIndex + 1;
                let smallestChildIndex = leftChildIndex;

                // Find the smaller child
                if (rightChildIndex < heapSize && this.internalHeap[rightChildIndex][0] < this.internalHeap[leftChildIndex][0]) {
                    smallestChildIndex = rightChildIndex;
                }

                if (elementToSift[0] <= this.internalHeap[smallestChildIndex][0]) {
                    break; // Correct position found
                }

                this.internalHeap[currentIndex] = this.internalHeap[smallestChildIndex];
                currentIndex = smallestChildIndex;
            }
            this.internalHeap[currentIndex] = elementToSift;
        }

        /**
         * Adds an element to the priority queue.
         * @param {Array} element - The element to add (e.g., [priority, value]).
         */
        push(element) {
            this.internalHeap.push(element);
            this._siftUp(this.internalHeap.length - 1);
        }

        /**
         * Removes and returns the element with the highest priority (smallest value).
         * @returns {Array|undefined} The element with the highest priority, or undefined if the queue is empty.
         */
        pop() {
            const heapSize = this.internalHeap.length;
            if (heapSize === 0) {
                return undefined;
            }
            if (heapSize === 1) {
                return this.internalHeap.pop();
            }

            const minElement = this.internalHeap[0];
            this.internalHeap[0] = this.internalHeap.pop(); // Move last element to root
            this._siftDown(0); // Sift down the new root

            return minElement;
        }

        /**
         * Returns the number of elements in the priority queue.
         * @returns {number} The size of the queue.
         */
        size() {
            return this.internalHeap.length;
        }
    }

    // The factory function to create an instance of MinPriorityQueue
    return function createMinPriorityQueue() {
        return new MinPriorityQueue();
    };
})();


console.log(solveProblem());

/**
 * Solves the main problem logic.
 * @returns {number} The minimum number of operations or -1 if impossible.
 */
function solveProblem() {
    const arrayLength = inputData.readNextToken();
    const initialValuesA = inputData.readLineTokens();
    const currentValuesB = inputData.readLineTokens();

    const priorityQueueInstance = MinPriorityQueueFactory();

    // Initial population of the priority queue
    for (let currentIndex = 0; currentIndex < arrayLength; currentIndex++) {
        if (initialValuesA[currentIndex] === currentValuesB[currentIndex]) {
            continue; // No operation needed for this element
        }
        if (initialValuesA[currentIndex] > currentValuesB[currentIndex]) {
            return -1; // Impossible to reach A from B if B is already smaller
        }
        // Store negative B[i] as priority for min-heap to act as max-heap on B[i]
        priorityQueueInstance.push([-currentValuesB[currentIndex], currentIndex]);
    }

    let totalOperationsCount = 0;

    // Process elements from the priority queue
    while (priorityQueueInstance.size() > 0) {
        const poppedItemData = priorityQueueInstance.pop();
        const targetElementIndex = poppedItemData[1]; // The index of the element to process

        // Calculate the sum of neighbors for the current element
        const prevIndex = (targetElementIndex + arrayLength - 1) % arrayLength;
        const nextIndex = (targetElementIndex + 1) % arrayLength;
        const neighborSumValue = currentValuesB[prevIndex] + currentValuesB[nextIndex];

        // Calculate how many operations are needed for the current element
        // The original uses `|0` for floor division. `Math.floor` is more explicit.
        const requiredOperations = Math.floor((currentValuesB[targetElementIndex] - initialValuesA[targetElementIndex]) / neighborSumValue);

        // If no operations can be performed (or would result in 0), it's impossible
        if (requiredOperations === 0) {
            return -1;
        }

        totalOperationsCount += requiredOperations;
        currentValuesB[targetElementIndex] -= neighborSumValue * requiredOperations;

        // Re-evaluate the current element after modification
        if (initialValuesA[targetElementIndex] === currentValuesB[targetElementIndex]) {
            continue; // Element now matches A[i], no further action needed
        }
        if (initialValuesA[targetElementIndex] > currentValuesB[targetElementIndex]) {
            return -1; // Impossible to reach A from B if B became smaller than A
        }
        // If not yet matched and still greater, re-add to priority queue with updated B[i]
        priorityQueueInstance.push([-currentValuesB[targetElementIndex], targetElementIndex]);
    }

    return totalOperationsCount;
}
