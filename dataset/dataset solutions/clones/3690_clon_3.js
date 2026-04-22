const MAX_PATH_VALUE_OFFSET = 1_000_000_000_000_000; // A large constant used for offsetting path values

/**
 * Processes graph data from a raw input string to calculate maximized path differences.
 *
 * @param {string} rawGraphInput - The raw input string containing graph parameters and edge definitions.
 */
function processGraphData(rawGraphInput) {
    // Split the input string into individual lines
    const inputLines = rawGraphInput.split('\n');

    // --- Input Validation and Parsing of Graph Parameters ---
    if (!inputLines || inputLines.length === 0) {
        console.error("Error: Empty input provided.");
        return;
    }

    // Parse the first line to get graph dimensions and starting nodes
    const graphDimensionParts = inputLines[0].split(' ').map(Number);
    if (graphDimensionParts.some(isNaN) || graphDimensionParts.length < 4) {
        console.error("Error: Invalid graph dimension parameters in the first line.");
        return;
    }

    const totalNodesCount = graphDimensionParts[0];
    const totalEdgesCount = graphDimensionParts[1];
    const sourceNodeAIndex = graphDimensionParts[2] - 1; // Adjust to 0-based index
    const sourceNodeBIndex = graphDimensionParts[3] - 1; // Adjust to 0-based index

    // --- Edge Data Storage ---
    // Arrays to store details for each edge: start node, end node, and two different weights (A and B)
    const edgeStartNodes = [];
    const edgeEndNodes = [];
    const pathWeightsA = [];
    const pathWeightsB = [];

    // Loop through the remaining lines to parse edge information
    for (let currentEdgeIdx = 0; currentEdgeIdx < totalEdgesCount; ++currentEdgeIdx) {
        const edgeLine = inputLines[currentEdgeIdx + 1];
        if (!edgeLine) {
            console.error(`Error: Missing edge data for edge ${currentEdgeIdx + 1}.`);
            return;
        }

        const edgeDataParts = edgeLine.split(' ').map(Number);
        if (edgeDataParts.some(isNaN) || edgeDataParts.length < 4) {
            console.error(`Error: Invalid edge data in line ${currentEdgeIdx + 2}.`);
            return;
        }

        // Store edge details, adjusting node indices to be 0-based
        edgeStartNodes[currentEdgeIdx] = edgeDataParts[0] - 1;
        edgeEndNodes[currentEdgeIdx] = edgeDataParts[1] - 1;
        pathWeightsA[currentEdgeIdx] = edgeDataParts[2];
        pathWeightsB[currentEdgeIdx] = edgeDataParts[3];
    }

    // --- Calculate Shortest Paths from Two Different Sources ---
    // First Dijkstra run: using pathWeightsA from sourceNodeAIndex
    const distancesFromSourceA = calculateShortestPaths(
        edgeStartNodes,
        edgeEndNodes,
        pathWeightsA,
        sourceNodeAIndex,
        totalNodesCount
    );

    // Second Dijkstra run: using pathWeightsB from sourceNodeBIndex
    const distancesFromSourceB = calculateShortestPaths(
        edgeStartNodes,
        edgeEndNodes,
        pathWeightsB,
        sourceNodeBIndex,
        totalNodesCount
    );

    // --- Compute and Maximize Result Values ---
    // Initialize an array to store the final computed values for each node
    const maximizedResultValues = new Array(totalNodesCount);

    // Calculate the value for the last node (totalNodesCount - 1)
    const lastNodeIndex = totalNodesCount - 1;
    const initialValue = MAX_PATH_VALUE_OFFSET - distancesFromSourceA[lastNodeIndex] - distancesFromSourceB[lastNodeIndex];
    maximizedResultValues[lastNodeIndex] = initialValue;

    // Iterate backwards from the second-to-last node to the first node
    // Each node's value is the maximum of its own calculated value and the next node's maximized value
    for (let nodeIterator = totalNodesCount - 2; nodeIterator >= 0; --nodeIterator) {
        const currentNodeValue = MAX_PATH_VALUE_OFFSET - distancesFromSourceA[nodeIterator] - distancesFromSourceB[nodeIterator];
        maximizedResultValues[nodeIterator] = Math.max(maximizedResultValues[nodeIterator + 1], currentNodeValue);
    }

    // --- Output Results ---
    // Join the computed values with newline characters and print to console
    console.log(maximizedResultValues.join('\n'));
}

/**
 * Implements Dijkstra's algorithm to find the shortest paths from a single source vertex
 * to all other vertices in a graph.
 *
 * @param {number[]} startNodesArr - Array of starting nodes for each edge (0-based index).
 * @param {number[]} endNodesArr - Array of ending nodes for each edge (0-based index).
 * @param {number[]} weightsArr - Array of weights for each edge.
 * @param {number} startVertexIdx - The index of the source vertex (0-based).
 * @param {number} totalVertices - The total number of vertices in the graph.
 * @returns {number[]} An array where each element `distances[i]` is the shortest distance from `startVertexIdx` to vertex `i`.
 */
function calculateShortestPaths(startNodesArr, endNodesArr, weightsArr, startVertexIdx, totalVertices) {
    // Initialize an adjacency list to represent the graph
    // Each entry `adjacencyList[u]` is an array of objects `{ target: v, weight: w }`
    const adjacencyList = Array.from({ length: totalVertices }, () => []);

    // Populate the adjacency list from the provided edge arrays
    // Assuming an undirected graph where edges go both ways
    for (let edgeIndex = 0; edgeIndex < startNodesArr.length; ++edgeIndex) {
        const u = startNodesArr[edgeIndex];
        const v = endNodesArr[edgeIndex];
        const w = weightsArr[edgeIndex];

        adjacencyList[u].push({ target: v, weight: w });
        adjacencyList[v].push({ target: u, weight: w }); // Add reverse edge for undirected graph
    }

    // Initialize distances array: all to infinity, source to 0
    const distances = new Array(totalVertices).fill(Number.POSITIVE_INFINITY);
    distances[startVertexIdx] = 0;

    // Initialize visited flags for each vertex
    const visitedStatus = new Array(totalVertices).fill(false);

    // Create a min-priority queue to efficiently retrieve the next unvisited vertex with the smallest distance
    // Stores elements as `[vertexIndex, currentDistance]`
    const minDistanceQueue = new newMinPriorityQueue();
    minDistanceQueue.insert([startVertexIdx, 0]);

    // Dijkstra's main loop
    while (minDistanceQueue.getCurrentSize() > 0) {
        // Extract the vertex with the smallest known distance
        const currentVertexData = minDistanceQueue.extractMin(); // Returns [vertexIndex, distance]
        const currentVertexId = currentVertexData[0];
        const currentVertexDistance = currentVertexData[1];

        // If this vertex has already been finalized (visited), skip it
        if (visitedStatus[currentVertexId]) {
            continue;
        }

        // Mark the current vertex as visited
        visitedStatus[currentVertexId] = true;

        // Iterate over all neighbors of the current vertex
        for (const edge of adjacencyList[currentVertexId]) {
            const neighborVertexId = edge.target;
            const edgeWeight = edge.weight;

            // Calculate the potential new distance to the neighbor through the current vertex
            const potentialNewDistance = currentVertexDistance + edgeWeight;

            // If a shorter path to the neighbor is found, update its distance and add/update it in the priority queue
            if (potentialNewDistance < distances[neighborVertexId]) {
                distances[neighborVertexId] = potentialNewDistance;
                minDistanceQueue.insert([neighborVertexId, potentialNewDistance]);
            }
        }
    }

    return distances;
}

/**
 * Implements a Min-Priority Queue using a binary heap structure.
 * Elements are stored as `[value, priority]`, and sorted by `priority`.
 */
class newMinPriorityQueue {
    constructor() {
        this.dataStorage = []; // The array representing the heap
    }

    /**
     * Inserts a new element into the priority queue.
     * The element should be an array `[value, priority]`.
     *
     * @param {Array<any, number>} elementToInsert - The element to add, e.g., `[nodeIndex, distance]`.
     */
    insert(elementToInsert) {
        // Add the new element to the end of the heap
        let currentIndex = this.dataStorage.length;
        this.dataStorage[currentIndex] = elementToInsert;

        // Bubble up the element to maintain heap property (min-heap)
        while (currentIndex > 0) {
            // Calculate the parent node's index
            const parentIndex = Math.floor((currentIndex - 1) / 2);

            // If the parent's priority is already less than or equal to the current element's priority,
            // the heap property is satisfied, so break.
            if (this.dataStorage[parentIndex][1] <= elementToInsert[1]) {
                break;
            }

            // Otherwise, swap the current element with its parent
            this.dataStorage[currentIndex] = this.dataStorage[parentIndex];
            currentIndex = parentIndex;
        }
        // Place the element in its final sorted position
        this.dataStorage[currentIndex] = elementToInsert;
    }

    /**
     * Extracts and returns the element with the smallest priority from the queue.
     *
     * @returns {Array<any, number>} The element with the minimum priority.
     */
    extractMin() {
        if (this.dataStorage.length === 0) {
            return undefined; // Or throw an error for an empty queue
        }

        // The minimum element is always at the root of the heap
        const minElement = this.dataStorage[0];

        // Move the last element to the root position
        const lastElement = this.dataStorage.pop(); // Remove and get the last element
        if (this.dataStorage.length === 0) {
            return minElement; // If the heap is now empty, we're done
        }
        this.dataStorage[0] = lastElement;

        // Bubble down the new root to maintain heap property
        let currentIndex = 0;
        const totalElements = this.dataStorage.length;

        // Loop while the current node has at least one child
        while (currentIndex * 2 + 1 < totalElements) {
            let leftChildIndex = currentIndex * 2 + 1;  // Index of the left child
            let rightChildIndex = currentIndex * 2 + 2; // Index of the right child
            let smallestChildIndex = leftChildIndex;    // Assume left child is smaller initially

            // If a right child exists and its priority is smaller than the left child's priority
            if (rightChildIndex < totalElements && this.dataStorage[rightChildIndex][1] < this.dataStorage[leftChildIndex][1]) {
                smallestChildIndex = rightChildIndex;
            }

            // If the current node's priority is less than or equal to its smallest child's priority,
            // the heap property is satisfied, so break.
            if (this.dataStorage[smallestChildIndex][1] >= lastElement[1]) {
                break;
            }

            // Otherwise, swap the current element with its smallest child
            this.dataStorage[currentIndex] = this.dataStorage[smallestChildIndex];
            currentIndex = smallestChildIndex;
        }
        // Place the last element (which was moved to root) in its final sorted position
        this.dataStorage[currentIndex] = lastElement;

        return minElement; // Return the original minimum element
    }

    /**
     * Returns the current number of elements in the priority queue.
     *
     * @returns {number} The number of elements in the queue.
     */
    getCurrentSize() {
        return this.dataStorage.length;
    }
}

// --- Main Program Execution ---
// Read input from standard input, decode as UTF-8, and pass to the main processing function.
processGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));