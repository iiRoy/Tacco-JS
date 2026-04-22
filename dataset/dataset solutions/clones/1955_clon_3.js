"use strict";

// Utility for reading input from stdin
const rawInputData = require("fs").readFileSync("/dev/stdin", "utf8");
let inputTokens = rawInputData.split(/ |\n/).filter(token => token.length > 0); // Filter empty strings from split
let currentTokenIndex = 0;

/**
 * Reads a specified number of tokens from the input stream.
 * @param {number} count - The number of tokens to read.
 * @param {boolean} asString - If true, returns tokens as strings; otherwise, attempts to parse as numbers.
 * @returns {Array<string|number>} An array of tokens.
 */
function readInputTokens(count, asString = false) {
    const start = currentTokenIndex;
    const end = start + count;
    currentTokenIndex = end;
    const tokens = inputTokens.slice(start, end);
    if (!asString) {
        return tokens.map(Number);
    }
    return tokens;
}

/**
 * Creates a multi-dimensional array initialized with a default value.
 * This version avoids `eval` for security and clarity.
 * @param {*} defaultValue - The value to initialize array elements with.
 * @param {...number} dimensions - The sizes of each dimension.
 * @returns {Array} A multi-dimensional array.
 */
function createMultiDimensionalArray(defaultValue, ...dimensions) {
    if (dimensions.length === 0) {
        return defaultValue;
    }

    const currentDimSize = dimensions[0];
    const remainingDimensions = dimensions.slice(1);

    const arr = new Array(currentDimSize);
    for (let idx = 0; idx < currentDimSize; idx++) {
        arr[idx] = createMultiDimensionalArray(defaultValue, ...remainingDimensions);
    }
    return arr;
}

/**
 * Implements a Min-Priority Queue (Min-Heap) data structure.
 * Elements are expected to be arrays where the first element is the priority key.
 */
class MinPriorityQueue {
    constructor() {
        this.heapElements = [];
        this.currentSize = 0; // Track size explicitly
    }

    /**
     * Inserts an item into the priority queue.
     * @param {Array} item - The item to insert, with item[0] being its priority.
     */
    insert(item) {
        this.heapElements.push(item);
        this.currentSize++;
        this.bubbleUp(this.currentSize - 1);
    }

    /**
     * Removes and returns the item with the smallest priority.
     * @returns {Array|undefined} The item with the smallest priority, or undefined if the queue is empty.
     */
    extractMin() {
        if (this.currentSize === 0) {
            return undefined; // Or throw an error
        }

        const minItem = this.heapElements[0];
        const lastItem = this.heapElements.pop();
        this.currentSize--;

        if (this.currentSize > 0) {
            this.heapElements[0] = lastItem;
            this.bubbleDown(0);
        }
        return minItem;
    }

    /**
     * Moves an element up the heap to maintain heap property.
     * @param {number} index - The index of the element to bubble up.
     */
    bubbleUp(index) {
        let current = index;
        while (current > 0) {
            const parent = Math.floor((current - 1) / 2);
            if (this.heapElements[parent][0] <= this.heapElements[current][0]) {
                break; // Heap property satisfied
            }
            // Swap with parent
            [this.heapElements[parent], this.heapElements[current]] = [this.heapElements[current], this.heapElements[parent]];
            current = parent;
        }
    }

    /**
     * Moves an element down the heap to maintain heap property.
     * @param {number} index - The index of the element to bubble down.
     */
    bubbleDown(index) {
        let current = index;
        const lastIndex = this.currentSize - 1;
        const elements = this.heapElements;

        while (true) {
            let leftChild = 2 * current + 1;
            let rightChild = 2 * current + 2;
            let smallest = current;

            // Check if left child exists and is smaller
            if (leftChild <= lastIndex && elements[leftChild][0] < elements[smallest][0]) {
                smallest = leftChild;
            }

            // Check if right child exists and is smaller than current smallest
            if (rightChild <= lastIndex && elements[rightChild][0] < elements[smallest][0]) {
                smallest = rightChild;
            }

            if (smallest === current) {
                break; // Heap property satisfied
            }

            // Swap with the smallest child
            [elements[current], elements[smallest]] = [elements[smallest], elements[current]];
            current = smallest;
        }
    }

    /**
     * Returns the number of elements in the priority queue.
     * @returns {number} The size of the queue.
     */
    size() {
        return this.currentSize;
    }
}

// Main execution block
const problemResult = solveProblem();
if (problemResult !== undefined) {
    console.log(problemResult);
}

/**
 * Orchestrates the solution to the main problem.
 * This is a Dijkstra-like algorithm variant considering time and 'silver' currency/charge.
 * @returns {string} The shortest times to reach each node (excluding the start node), joined by newlines.
 */
function solveProblem() {
    // Read problem parameters: number of nodes, number of edges, initial silver amount
    const [numNodes, numEdges, initialSilver] = readInputTokens(3);

    // Define constants
    const MAX_POSSIBLE_TIME = Infinity; // Using Infinity instead of a large number for clarity
    const MAX_SILVER_CAPACITY = (numNodes - 1) * 50; // Maximum silver capacity relevant for states

    // Initialize adjacency list for the graph
    // Each entry: [neighborNode, silverCostToTravel, timeCostToTravel]
    const adjacencyList = Array.from({
        length: numNodes
    }, () => []);

    // Read edges and populate the adjacency list
    for (let edgeIdx = 0; edgeIdx < numEdges; edgeIdx++) {
        const [fromNode, toNode, silverCost, timeCost] = readInputTokens(4);
        // Adjust to 0-indexed nodes
        const u = fromNode - 1;
        const v = toNode - 1;
        adjacencyList[u].push([v, silverCost, timeCost]);
        adjacencyList[v].push([u, silverCost, timeCost]); // Undirected graph
    }

    // Read node-specific charge/cost information
    // Each entry: [silverGainPerCharge, timeCostPerCharge]
    const nodeChargeDetails = [];
    for (let nodeIdx = 0; nodeIdx < numNodes; nodeIdx++) {
        nodeChargeDetails.push(readInputTokens(2));
    }

    // `minTimeAtNodeSilver[node][silver]` stores the minimum time to reach 'node' with 'silver' amount
    const minTimeAtNodeSilver = createMultiDimensionalArray(MAX_POSSIBLE_TIME, numNodes, MAX_SILVER_CAPACITY + 1);

    // `finalArrivalTimes[node]` stores the minimum time to reach 'node' (regardless of silver amount)
    const finalArrivalTimes = new Array(numNodes).fill(MAX_POSSIBLE_TIME);
    let nodesRemainingToVisit = numNodes;

    // Initialize priority queue for Dijkstra's algorithm
    // Elements: [totalTime, currentNodeIndex, currentSilverAmount]
    const eventQueue = new MinPriorityQueue();

    // Clamp initial silver to max capacity
    const clampedInitialSilver = Math.min(initialSilver, MAX_SILVER_CAPACITY);

    // Start at node 0 with initial silver and time 0
    eventQueue.insert([0, 0, clampedInitialSilver]);
    minTimeAtNodeSilver[0][clampedInitialSilver] = 0;

    /**
     * Helper function to update minimum time and push to priority queue if a better path is found.
     * @param {number} newTime - The calculated new time.
     * @param {number} targetNode - The node index for the update.
     * @param {number} targetSilver - The silver amount for the update.
     */
    const attemptUpdatePath = (newTime, targetNode, targetSilver) => {
        // Ensure silver amount is within valid bounds
        if (targetSilver < 0 || targetSilver > MAX_SILVER_CAPACITY) {
            return;
        }
        if (minTimeAtNodeSilver[targetNode][targetSilver] > newTime) {
            minTimeAtNodeSilver[targetNode][targetSilver] = newTime;
            eventQueue.insert([newTime, targetNode, targetSilver]);
        }
    };

    // Dijkstra's main loop
    while (eventQueue.size() > 0 && nodesRemainingToVisit > 0) {
        const [currentTime, currentNode, currentSilver] = eventQueue.extractMin();

        // Skip if we've already found a faster path to this state (node, silver)
        if (minTimeAtNodeSilver[currentNode][currentSilver] < currentTime) {
            continue;
        }

        // If this is the first time we finalize the minimum time for this node, record it
        if (finalArrivalTimes[currentNode] === MAX_POSSIBLE_TIME) {
            finalArrivalTimes[currentNode] = currentTime;
            nodesRemainingToVisit--;
        }

        // --- Explore possible actions from the current state ---

        // 1. Action: Charge silver at the current node
        // (If current silver is less than max capacity)
        if (currentSilver < MAX_SILVER_CAPACITY) {
            const silverGain = nodeChargeDetails[currentNode][0];
            const chargeTimeCost = nodeChargeDetails[currentNode][1];

            const newTimeAfterCharge = currentTime + chargeTimeCost;
            const newSilverAfterCharge = Math.min(currentSilver + silverGain, MAX_SILVER_CAPACITY); // Don't exceed capacity

            attemptUpdatePath(newTimeAfterCharge, currentNode, newSilverAfterCharge);
        }

        // 2. Action: "Free" discharge of silver
        // (This unusual action allows reducing silver by 1 unit at no time cost, if silver > 0)
        if (currentSilver > 0) {
            const newSilverAfterDischarge = currentSilver - 1;
            // Time remains the same
            attemptUpdatePath(currentTime, currentNode, newSilverAfterDischarge);
        }


        // 3. Action: Travel to neighboring nodes
        for (const edge of adjacencyList[currentNode]) {
            const [neighborNode, travelSilverCost, travelTimeCost] = edge;

            // Check if enough silver to travel
            if (currentSilver >= travelSilverCost) {
                const newTimeAfterTravel = currentTime + travelTimeCost;
                const newSilverAfterTravel = currentSilver - travelSilverCost;

                attemptUpdatePath(newTimeAfterTravel, neighborNode, newSilverAfterTravel);
            }
        }
    }

    // The problem asks for times to nodes 1 through N-1 (0-indexed: 1 to numNodes-1)
    // Node 0 is the starting point, typically not included in results unless specified.
    // The original code uses `ans.slice(1)`, so we follow that convention.
    return finalArrivalTimes.slice(1).join("\n");
}