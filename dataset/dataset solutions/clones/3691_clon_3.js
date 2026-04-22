// --- Helper for input parsing (simulated for standalone script) ---
// In a real environment, these functions would typically read from stdin
// using modules like 'readline' or 'process.stdin'.
// For this standalone code, we'll assume an 'inputLines' array is populated
// with input data, and these functions consume from it.
let currentInputLineIndex = 0;
const inputSourceLines = []; // This array would hold lines read from standard input.

/**
 * Retrieves the next line from the simulated input source.
 * @returns {string} The next line of input.
 */
function retrieveNextLine() {
    if (currentInputLineIndex < inputSourceLines.length) {
        return inputSourceLines[currentInputLineIndex++];
    }
    // In a production environment, this might throw an error or return null/undefined
    // to signal end-of-input. For this clone, an empty string is a placeholder.
    return "";
}

/**
 * Parses a line of space-separated numbers into an array of JavaScript numbers.
 * @returns {number[]} An array of numerical values.
 */
function parseLineOfNumbers() {
    return retrieveNextLine().split(' ').map(Number);
}

/**
 * Parses a line of space-separated numbers into an array of JavaScript BigInts.
 * This is crucial for handling very large integer values beyond Number.MAX_SAFE_INTEGER.
 * @returns {BigInt[]} An array of BigInt values.
 */
function parseLineOfBigInts() {
    return retrieveNextLine().split(' ').map(BigInt);
}

// --- Custom Min-Priority Queue Implementation for Graph Algorithms ---
/**
 * Represents an element stored in the priority queue.
 * @typedef {object} QueueEntry
 * @property {BigInt} priorityValue - The priority (e.g., distance) of the element.
 * @property {number} elementIndex - The value (e.g., node index) associated with the priority.
 */
class PriorityQueueMin {
    constructor() {
        /** @type {QueueEntry[]} */
        this.internalHeap = [];
    }

    /**
     * Adds a new entry to the priority queue.
     * @param {BigInt} priorityValue - The priority of the entry.
     * @param {number} elementIndex - The value (node index) of the entry.
     */
    addEntry(priorityValue, elementIndex) {
        const newEntry = { priorityValue, elementIndex };
        this.internalHeap.push(newEntry);
        this.siftUp(this.internalHeap.length - 1);
    }

    /**
     * Removes and returns the entry with the smallest priority value.
     * @returns {QueueEntry | undefined} The entry with the lowest priority, or undefined if the queue is empty.
     */
    extractMin() {
        if (this.isEmpty()) {
            return undefined;
        }
        if (this.internalHeap.length === 1) {
            return this.internalHeap.pop();
        }

        const minEntry = this.internalHeap[0];
        this.internalHeap[0] = this.internalHeap.pop(); // Move last element to root
        this.siftDown(0); // Restore heap property
        return minEntry;
    }

    /**
     * Returns the entry with the smallest priority value without removing it.
     * @returns {QueueEntry | undefined} The entry with the lowest priority, or undefined if the queue is empty.
     */
    peekMin() {
        return this.internalHeap[0];
    }

    /**
     * Checks if the priority queue contains any elements.
     * @returns {boolean} True if empty, false otherwise.
     */
    isEmpty() {
        return this.internalHeap.length === 0;
    }

    /**
     * Moves an element up the heap to maintain the min-heap property.
     * @param {number} currentIdx - The index of the element to move up.
     */
    siftUp(currentIdx) {
        while (currentIdx > 0) {
            const parentIdx = Math.floor((currentIdx - 1) / 2);
            if (this.internalHeap[currentIdx].priorityValue < this.internalHeap[parentIdx].priorityValue) {
                // Swap current element with its parent
                [this.internalHeap[currentIdx], this.internalHeap[parentIdx]] = [this.internalHeap[parentIdx], this.internalHeap[currentIdx]];
                currentIdx = parentIdx;
            } else {
                break; // Min-heap property is satisfied
            }
        }
    }

    /**
     * Moves an element down the heap to maintain the min-heap property.
     * @param {number} currentIdx - The index of the element to move down.
     */
    siftDown(currentIdx) {
        const heapSize = this.internalHeap.length;
        while (true) {
            let leftChildIdx = 2 * currentIdx + 1;
            let rightChildIdx = 2 * currentIdx + 2;
            let smallestPriorityIdx = currentIdx;

            // Compare with left child
            if (leftChildIdx < heapSize && this.internalHeap[leftChildIdx].priorityValue < this.internalHeap[smallestPriorityIdx].priorityValue) {
                smallestPriorityIdx = leftChildIdx;
            }
            // Compare with right child
            if (rightChildIdx < heapSize && this.internalHeap[rightChildIdx].priorityValue < this.internalHeap[smallestPriorityIdx].priorityValue) {
                smallestPriorityIdx = rightChildIdx;
            }

            if (smallestPriorityIdx !== currentIdx) {
                // Swap current element with the child that has the smallest priority
                [this.internalHeap[currentIdx], this.internalHeap[smallestPriorityIdx]] = [this.internalHeap[smallestPriorityIdx], this.internalHeap[currentIdx]];
                currentIdx = smallestPriorityIdx;
            } else {
                break; // Min-heap property is satisfied
            }
        }
    }
}

// --- Helper for BigInt comparison ---
/**
 * Returns the maximum of two BigInt values.
 * @param {BigInt} valueA
 * @param {BigInt} valueB
 * @returns {BigInt} The greater of the two BigInts.
 */
const findMaxBigInt = (valueA, valueB) => (valueA > valueB ? valueA : valueB);

// --- Dijkstra's Algorithm Implementation ---
/**
 * Calculates the shortest path distances from a specified starting node to all other nodes
 * in a given weighted graph using Dijkstra's algorithm.
 * @param {number} startingNodeIdx - The 0-indexed starting node.
 * @param {Array<Array<{ targetNode: number, edgeWeight: BigInt }>>} graphAdjacencyList - The graph represented as an adjacency list.
 * @param {Array<BigInt>} computedShortestDistances - An array to store the calculated shortest distances.
 */
function calculateOptimalTraversalTimes(startingNodeIdx, graphAdjacencyList, computedShortestDistances) {
    // A very large BigInt value to represent "infinity" for initial distances.
    // Using a value significantly larger than Number.MAX_SAFE_INTEGER to ensure BigInt operations are safe.
    const INFINITE_DISTANCE = BigInt(Number.MAX_SAFE_INTEGER) * 2n;

    // Initialize all distances to "infinity"
    for (let i = 0; i < graphAdjacencyList.length; i++) {
        computedShortestDistances[i] = INFINITE_DISTANCE;
    }

    // The distance from the starting node to itself is zero.
    computedShortestDistances[startingNodeIdx] = 0n;

    // Create a min-priority queue to manage nodes to visit.
    // Entries are { priorityValue: distance, elementIndex: nodeIndex }.
    const traversalQueue = new PriorityQueueMin();
    traversalQueue.addEntry(0n, startingNodeIdx); // Add the starting node to the queue.

    // Process nodes from the priority queue until it is empty.
    while (!traversalQueue.isEmpty()) {
        const { priorityValue: currentPathCost, elementIndex: currentNode } = traversalQueue.extractMin();

        // If we've already found a shorter path to this node, skip processing.
        if (currentPathCost > computedShortestDistances[currentNode]) {
            continue;
        }

        // Explore all neighbors of the current node.
        for (const connectedEdge of graphAdjacencyList[currentNode]) {
            const neighborNode = connectedEdge.targetNode;
            const weightToNeighbor = connectedEdge.edgeWeight;
            const potentialNewCost = currentPathCost + weightToNeighbor;

            // If a shorter path to the neighbor is found, update its distance
            // and add it to the priority queue.
            if (potentialNewCost < computedShortestDistances[neighborNode]) {
                computedShortestDistances[neighborNode] = potentialNewCost;
                traversalQueue.addEntry(potentialNewCost, neighborNode);
            }
        }
    }
}

// --- Main Application Logic ---
/**
 * Orchestrates the overall solution by reading input, running Dijkstra's algorithm
 * twice with different cost structures, and then calculating and printing the final benefits.
 */
function executeNetworkAnalysis() {
    // Read the number of locations (nodes) and connections (edges).
    const [totalLocations, totalConnections] = parseLineOfNumbers();
    // Read the designated starting locations for two distinct travel scenarios.
    const [primaryStartLocation, secondaryStartLocation] = parseLineOfNumbers();

    // Adjust location indices to be 0-based for array access.
    const adjustedPrimaryStart = primaryStartLocation - 1;
    const adjustedSecondaryStart = secondaryStartLocation - 1;

    // Initialize two distinct graph structures, each with its own set of edge costs.
    /** @type {Array<Array<{ targetNode: number, edgeWeight: BigInt }>>} */
    const primaryGraphNetwork = Array.from({ length: totalLocations }, () => []);
    /** @type {Array<Array<{ targetNode: number, edgeWeight: BigInt }>>} */
    const secondaryGraphNetwork = Array.from({ length: totalLocations }, () => []);

    // Populate the graph structures based on input connections.
    for (let i = 0; i < totalConnections; i++) {
        const [nodeOne, nodeTwo] = parseLineOfNumbers();
        const [costForPrimary, costForSecondary] = parseLineOfBigInts(); // Costs can be very large

        // Adjust node indices to be 0-based.
        const nodeIdx1 = nodeOne - 1;
        const nodeIdx2 = nodeTwo - 1;

        // Add connections to both graphs. Assume undirected edges.
        primaryGraphNetwork[nodeIdx1].push({ targetNode: nodeIdx2, edgeWeight: costForPrimary });
        primaryGraphNetwork[nodeIdx2].push({ targetNode: nodeIdx1, edgeWeight: costForPrimary });

        secondaryGraphNetwork[nodeIdx1].push({ targetNode: nodeIdx2, edgeWeight: costForSecondary });
        secondaryGraphNetwork[nodeIdx2].push({ targetNode: nodeIdx1, edgeWeight: costForSecondary });
    }

    // Arrays to store the shortest path distances from each starting point.
    /** @type {Array<BigInt>} */
    const distancesFromPrimary = new Array(totalLocations);
    /** @type {Array<BigInt>} */
    const distancesFromSecondary = new Array(totalLocations);

    // Run Dijkstra's algorithm for both networks independently.
    calculateOptimalTraversalTimes(adjustedPrimaryStart, primaryGraphNetwork, distancesFromPrimary);
    calculateOptimalTraversalTimes(adjustedSecondaryStart, secondaryGraphNetwork, distancesFromSecondary);

    // Define a constant representing the total available resource or maximum base value.
    // This value is 10^15, which necessitates BigInt for accurate calculations.
    const MAX_TOTAL_RESOURCE_VALUE = 1_000_000_000_000_000n;

    // Array to store the cumulative maximum benefit for each location.
    /** @type {Array<BigInt>} */
    const finalCalculatedBenefits = new Array(totalLocations);

    // Calculate the maximum potential benefit for each location, iterating in reverse.
    // The 'currentMaxAccumulatedBenefit' tracks the maximum benefit found from the current
    // location index up to the last location (totalLocations - 1).
    let currentMaxAccumulatedBenefit = 0n; // Initialize with BigInt zero.
    for (let locationIdx = totalLocations - 1; locationIdx >= 0; locationIdx--) {
        // Calculate the "direct" benefit for the current location.
        // This is MAX_TOTAL_RESOURCE_VALUE - (distance from primary) - (distance from secondary).
        const directBenefit = MAX_TOTAL_RESOURCE_VALUE - distancesFromPrimary[locationIdx] - distancesFromSecondary[locationIdx];

        // Update the overall maximum accumulated benefit.
        currentMaxAccumulatedBenefit = findMaxBigInt(currentMaxAccumulatedBenefit, directBenefit);

        // Store this accumulated maximum benefit for the current location.
        finalCalculatedBenefits[locationIdx] = currentMaxAccumulatedBenefit;
    }

    // Output the final calculated benefits for each location.
    // The results are printed for locations 0 to (totalLocations - 1).
    for (let locationIdx = 0; locationIdx < totalLocations; locationIdx++) {
        console.log(finalCalculatedBenefits[locationIdx].toString());
    }
}

// --- Script Entry Point ---
// To run this code in a Node.js environment, you would typically populate
// the 'inputSourceLines' array from 'process.stdin' or a file.
// Example of how 'inputSourceLines' would be populated for testing:
/*
inputSourceLines.push("3 3");     // totalLocations, totalConnections
inputSourceLines.push("1 3");     // primaryStartLocation, secondaryStartLocation
inputSourceLines.push("1 2");     // nodeOne, nodeTwo for first connection
inputSourceLines.push("10 100");  // costForPrimary, costForSecondary for first connection
inputSourceLines.push("2 3");     // nodeOne, nodeTwo for second connection
inputSourceLines.push("20 200");  // costForPrimary, costForSecondary for second connection
inputSourceLines.push("1 3");     // nodeOne, nodeTwo for third connection
inputSourceLines.push("30 300");  // costForPrimary, costForSecondary for third connection
*/

// Uncomment the line below to execute the main function if 'inputSourceLines' is populated.
// executeNetworkAnalysis();