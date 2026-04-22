"use strict"; // Maintain strict mode for robust code.

// --- Global Input Handling Utilities ---
// Reads all standard input at once.
const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
// Splits the input into tokens by spaces or newlines.
let tokenStream = rawInputData.split(/ |\n/);
// Index to keep track of the current token being read.
let currentTokenIndex = 0;

/**
 * Retrieves the next token from the stream and converts it to an integer.
 * @returns {number} The next integer token.
 */
function acquireNextInteger() {
    // Using Number() for explicit conversion, slightly more verbose than unary '+'.
    return Number(tokenStream[currentTokenIndex++]);
}

/**
 * Retrieves the next token as a string.
 * @returns {string} The next string token.
 */
function acquireNextString() {
    return tokenStream[currentTokenIndex++];
}

/**
 * Retrieves the next token and converts it to a BigInt.
 * @returns {BigInt} The next BigInt token.
 */
function acquireNextBigInt() {
    // Explicit BigInt constructor for clarity.
    return BigInt(tokenStream[currentTokenIndex++]);
}

/**
 * Reads a specified number of tokens and converts them to numbers.
 * @param {number} count - The number of tokens to read.
 * @param {boolean} [shouldConvertToNumber=true] - Whether to convert tokens to numbers.
 * @returns {Array<number|string>} An array of tokens.
 */
function acquireNumberSequence(count, shouldConvertToNumber = true) {
    const startIndex = currentTokenIndex;
    currentTokenIndex += count;
    const sequence = tokenStream.slice(startIndex, currentTokenIndex);
    return shouldConvertToNumber ? sequence.map(val => Number(val)) : sequence;
}

/**
 * Reads a 2D matrix of tokens.
 * @param {number} numRows - The number of rows.
 * @param {number} numCols - The number of columns.
 * @param {boolean} [shouldParseAsInt=true] - Whether to convert tokens in the matrix to integers.
 * @returns {Array<Array<number|string>>} The 2D matrix.
 */
function acquireMatrix(numRows, numCols, shouldParseAsInt = true) {
    const matrixData = [];
    for (let r = 0; r < numRows; r++) {
        const rowTokens = tokenStream.slice(currentTokenIndex, currentTokenIndex + numCols);
        currentTokenIndex += numCols;
        matrixData.push(shouldParseAsInt ? rowTokens.map(val => Number(val)) : rowTokens);
    }
    return matrixData;
}

// --- Custom Priority Queue (Min-Heap) Implementation ---
// Renamed from priorityQueue to MinValueHeap and internal array 'a' to 'heapStorage'.
class MinValueHeap {
    constructor() {
        this.heapStorage = []; // Stores elements as [priority, data]
    }

    /**
     * Inserts an element into the heap.
     * @param {BigInt} priorityValue - The priority of the element (cost).
     * @param {BigInt} associatedData - The data associated with the priority (node value).
     */
    insertElement(priorityValue, associatedData) {
        const dataStore = this.heapStorage;
        let currentIndex = dataStore.length;
        // Bubble up: Compare with parent and swap if parent has higher priority.
        while (currentIndex > 0) {
            const parentIndex = (currentIndex - 1) >> 1; // Equivalent to Math.floor((i-1)/2)
            if (dataStore[parentIndex][0] <= priorityValue) {
                break; // Correct position found
            }
            dataStore[currentIndex] = dataStore[parentIndex];
            currentIndex = parentIndex;
        }
        dataStore[currentIndex] = [priorityValue, associatedData];
    }

    /**
     * Removes and returns the element with the smallest priority.
     * @returns {Array<BigInt>|undefined} The element with the smallest priority: [priority, data].
     */
    extractMin() {
        const dataStore = this.heapStorage;
        if (dataStore.length === 0) {
            return undefined; // Heap is empty
        }
        if (dataStore.length === 1) {
            return dataStore.pop(); // Only one element, just remove it
        }

        const minElement = dataStore[0]; // The smallest element
        const lastElement = dataStore.pop(); // The element to re-position

        let currentIndex = 0;
        const halfLength = dataStore.length >> 1; // Optimization: only need to check up to half length for parents

        // Bubble down: Compare with children and swap with the smaller child.
        while (currentIndex < halfLength) {
            let leftChildIndex = (currentIndex << 1) + 1; // 2 * i + 1
            let rightChildIndex = leftChildIndex + 1; // 2 * i + 2
            let smallestChildIndex = leftChildIndex;

            // Determine which child has the smaller priority
            if (rightChildIndex < dataStore.length && dataStore[rightChildIndex][0] < dataStore[leftChildIndex][0]) {
                smallestChildIndex = rightChildIndex;
            }

            // If the lastElement is smaller than or equal to the smallest child, its position is found.
            if (lastElement[0] <= dataStore[smallestChildIndex][0]) {
                break;
            }

            dataStore[currentIndex] = dataStore[smallestChildIndex];
            currentIndex = smallestChildIndex;
        }

        // Place the lastElement in its final position
        dataStore[currentIndex] = lastElement;
        return minElement;
    }

    /**
     * Gets the number of elements currently in the heap.
     * @returns {number} The current size of the heap.
     */
    get currentSize() {
        return this.heapStorage.length;
    }

    /**
     * Peeks at the element with the smallest priority without removing it.
     * @returns {Array<BigInt>|undefined} The smallest element, or undefined if heap is empty.
     */
    get peekMin() {
        return this.heapStorage.length > 0 ? this.heapStorage[0] : undefined;
    }
}

// --- Main Program Execution ---
// Stores the result of the computation, if any.
const programOutput = executeSolution();

// If the solution returns a value (e.g., for a single test case), print it.
if (programOutput !== undefined) {
    console.log(programOutput);
}

/**
 * Helper function for BigInt Math.min equivalent.
 * @param {BigInt} a
 * @param {BigInt} b
 * @returns {BigInt} The smaller of the two BigInts.
 */
function bigIntMin(a, b) {
    return a < b ? a : b;
}

/**
 * The core logic for solving the problem.
 * This function handles multiple test cases.
 */
function executeSolution() {
    // Read the total number of test cases.
    const numTestCases = acquireNextInteger();

    // Loop through each test case.
    for (let caseIdx = 0; caseIdx < numTestCases; caseIdx++) {
        // Read the target value for the current test case.
        const targetValue = acquireNextBigInt();
        // Read the conversion costs for prime factors (2, 3, 5).
        const primeConversionCosts = [acquireNextBigInt(), acquireNextBigInt(), acquireNextBigInt()];

        // Precompute costs for small values (0 to 4) using dynamic programming-like approach.
        // `baseCosts[i]` represents the minimum cost to reach 0 from `i` using only decrement by 1 operations (cost `baseCosts[1]`)
        // or by using conversion costs `primeConversionCosts[0]` (for 2), `primeConversionCosts[1]` (for 3), etc.
        // Note: `baseCosts[0]` is 0, `baseCosts[1]` is given.
        const baseCosts = [0n, acquireNextBigInt()]; // Initialize with 0n for 0, and the cost for 1.

        // Cost for 2: Either 1+1 (2*baseCosts[1]) or 1+cost_for_2 (baseCosts[1]+primeConversionCosts[0])
        baseCosts.push(bigIntMin(baseCosts[1] + baseCosts[1], baseCosts[1] + primeConversionCosts[0]));

        // Cost for 3: Either 2+1 (baseCosts[2]+baseCosts[1]) or 1+cost_for_3 (baseCosts[1]+primeConversionCosts[1])
        baseCosts.push(bigIntMin(baseCosts[2] + baseCosts[1], baseCosts[1] + primeConversionCosts[1]));

        // Cost for 4: Three options from the original logic:
        // 1. Cost to reach 3, then add 1: baseCosts[3] + baseCosts[1]
        // 2. Cost to reach 2, then apply cost for factor 2: baseCosts[2] + primeConversionCosts[0]
        // 3. Cost to reach 1, then apply cost for factor 5: baseCosts[1] + primeConversionCosts[2]
        const costOption_from3_plus1 = baseCosts[3] + baseCosts[1];
        const costOption_from2_plusCostForFactor2 = baseCosts[2] + primeConversionCosts[0];
        const costOption_from1_plusCostForFactor5 = baseCosts[1] + primeConversionCosts[2];

        let minCostForFour = costOption_from3_plus1;
        minCostForFour = bigIntMin(minCostForFour, costOption_from2_plusCostForFactor2);
        minCostForFour = bigIntMin(minCostForFour, costOption_from1_plusCostForFactor5);
        baseCosts.push(minCostForFour); // baseCosts[4]

        // Initialize a min-priority queue for Dijkstra's algorithm.
        const minPriorityQueue = new MinValueHeap();
        // Start by pushing the target value with an initial cost of 0.
        minPriorityQueue.insertElement(0n, targetValue);

        // Store the minimum cost found so far to reach a specific value.
        const minCostsMap = new Map();
        minCostsMap.set(targetValue, 0n);

        // Define the prime factors for division operations.
        const primeFactors = [2n, 3n, 5n];

        // Dijkstra's algorithm loop.
        for (;;) { // Equivalent to while(true)
            // If the queue is empty, we can't reach 0, though problem constraints usually prevent this.
            if (minPriorityQueue.currentSize === 0) {
                // This case should ideally not happen if 0 is reachable.
                // For robustness, could throw an error or handle it.
                break;
            }

            // Extract the node with the smallest cost.
            const extractedEntry = minPriorityQueue.extractMin();
            const currentCost = extractedEntry[0];
            const currentNodeValue = extractedEntry[1];

            // If we found a shorter path to this node previously, skip.
            if (minCostsMap.has(currentNodeValue) && minCostsMap.get(currentNodeValue) < currentCost) {
                continue;
            }

            // If we have reached 0, we found the minimum cost.
            if (currentNodeValue === 0n) {
                console.log(currentCost.toString());
                break; // Exit the loop for this test case.
            }

            // Handle small node values (less than 5) using precomputed base costs.
            if (currentNodeValue < 5n) {
                // The cost to reach 0 from this small value is currentCost + baseCosts[currentNodeValue].
                const costToZeroFromSmall = currentCost + baseCosts[Number(currentNodeValue)];

                // If this is a new or better path to 0, update and add to queue.
                if (!minCostsMap.has(0n) || minCostsMap.get(0n) > costToZeroFromSmall) {
                    minCostsMap.set(0n, costToZeroFromSmall);
                    minPriorityQueue.insertElement(costToZeroFromSmall, 0n);
                }
                continue; // Skip further processing for small values.
            }

            // For larger node values, consider division and subtraction operations.
            for (let factorIndex = 0; factorIndex < 3; factorIndex++) {
                const currentFactor = primeFactors[factorIndex];
                const currentFactorCost = primeConversionCosts[factorIndex];

                // --- Option 1: Reduce by division (floor division) ---
                // Calculate the value after division.
                const nextValueFloorDiv = currentNodeValue / currentFactor;
                // Calculate the remainder.
                const remainder = currentNodeValue % currentFactor;

                // Cost for this operation:
                // Option A: Apply `currentFactorCost` and reduce remainder by `baseCosts[1]` operations.
                const costOptionA = currentFactorCost + baseCosts[1] * remainder;
                // Option B: Simply subtract `currentNodeValue - nextValueFloorDiv` times `baseCosts[1]`.
                const costOptionB = (currentNodeValue - nextValueFloorDiv) * baseCosts[1];

                // Choose the minimum cost for this transformation.
                const effectiveReductionCostFloorDiv = bigIntMin(costOptionA, costOptionB);
                const totalCostFloorDiv = currentCost + effectiveReductionCostFloorDiv;

                // If this path is new or better, update the map and queue.
                if (!minCostsMap.has(nextValueFloorDiv) || minCostsMap.get(nextValueFloorDiv) > totalCostFloorDiv) {
                    minCostsMap.set(nextValueFloorDiv, totalCostFloorDiv);
                    minPriorityQueue.insertElement(totalCostFloorDiv, nextValueFloorDiv);
                }

                // --- Option 2: Reduce by division (ceiling division), if there's a remainder ---
                if (remainder !== 0n) {
                    const nextValueCeilDiv = nextValueFloorDiv + 1n; // Value after ceiling division.
                    const complementRemainder = currentFactor - remainder; // How much more to add to reach next multiple.

                    // Cost for this operation:
                    // Option C: Apply `currentFactorCost` and add `complementRemainder` by `baseCosts[1]` operations.
                    const costOptionC = currentFactorCost + baseCosts[1] * complementRemainder;
                    // Option D: Simply subtract `currentNodeValue - nextValueCeilDiv` times `baseCosts[1]`.
                    const costOptionD = (currentNodeValue - nextValueCeilDiv) * baseCosts[1];

                    // Choose the minimum cost for this transformation.
                    const effectiveReductionCostCeilDiv = bigIntMin(costOptionC, costOptionD);
                    const totalCostCeilDiv = currentCost + effectiveReductionCostCeilDiv;

                    // If this path is new or better, update the map and queue.
                    if (!minCostsMap.has(nextValueCeilDiv) || minCostsMap.get(nextValueCeilDiv) > totalCostCeilDiv) {
                        minCostsMap.set(nextValueCeilDiv, totalCostCeilDiv);
                        minPriorityQueue.insertElement(totalCostCeilDiv, nextValueCeilDiv);
                    }
                }
            }
        }
    }
}