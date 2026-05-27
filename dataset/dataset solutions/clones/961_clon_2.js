var priorityQueue = [],
    queueSize = 0; // Initialize heap array and its current size.
priorityQueue[0] = new Array(2); // Placeholder for 0th index, not used in 1-based indexing.
priorityQueue[0][0] = -1;
priorityQueue[0][1] = -1;

/**
 * Inserts a new element into the min-priority queue (min-heap).
 * The heap maintains the property that the parent's second element is less than or equal to its children's second elements.
 * @param {Array<number>} elementToAdd - The element to insert, typically [node_id, distance].
 */
function addNodeToQueue(elementToAdd) {
    priorityQueue[++queueSize] = elementToAdd; // Add new element to the end of the heap.

    let currentIndex = queueSize; // Start from the newly added element's position.

    // Bubble up the element if its 'distance' is smaller than its parent's 'distance'.
    while (priorityQueue[currentIndex][1] < priorityQueue[Math.floor(currentIndex / 2)][1]) {
        // Swap current element with its parent.
        let tempSwap = priorityQueue[currentIndex];
        priorityQueue[currentIndex] = priorityQueue[Math.floor(currentIndex / 2)];
        priorityQueue[Math.floor(currentIndex / 2)] = tempSwap;
        currentIndex = Math.floor(currentIndex / 2); // Move up to the parent's position.
    }
}

/**
 * Extracts the minimum element (root) from the min-priority queue.
 * The minimum element is always at index 1.
 * @returns {Array<number>|undefined} The minimum element, or undefined if the queue is empty.
 */
function retrieveMinNode() {
    if (queueSize <= 0) {
        return undefined; // Queue is empty.
    }

    let minElement = priorityQueue[1]; // The minimum element is at the root.

    priorityQueue[1] = priorityQueue[queueSize--]; // Move the last element to the root and decrease heap size.

    let heapIndex = 1; // Start from the root to heapify down.
    // While the current node has children and violates the heap property.
    while ((heapIndex * 2 <= queueSize && priorityQueue[heapIndex][1] > priorityQueue[heapIndex * 2][1]) ||
        (heapIndex * 2 + 1 <= queueSize && priorityQueue[heapIndex][1] > priorityQueue[heapIndex * 2 + 1][1])) {

        let leftChildIdx = heapIndex * 2;
        let rightChildIdx = heapIndex * 2; // Initialize right child index.

        if (heapIndex * 2 + 1 <= queueSize) {
            rightChildIdx++; // If right child exists, update its index.
        }

        // Determine which child has the smaller 'distance'.
        let minChildIdx = (priorityQueue[leftChildIdx][1] <= priorityQueue[rightChildIdx][1]) ? leftChildIdx : rightChildIdx;

        // Swap current element with the smaller child.
        let swapVal = priorityQueue[heapIndex];
        priorityQueue[heapIndex] = priorityQueue[minChildIdx];
        priorityQueue[minChildIdx] = swapVal;
        heapIndex = minChildIdx; // Move down to the child's position.
    }
    return minElement; // Return the extracted minimum element.
}

/**
 * Main function to process graph data and compute shortest paths using a Dijkstra-like algorithm.
 * @param {string} rawData - The input string containing graph definition.
 */
function ProcessGraphData(rawData) {
    rawData = rawData.split("\n"); // Split input into lines.
    let nodeCount = parseInt(rawData[0], 10); // First line is the number of nodes.

    let adjacencyList = new Array(nodeCount); // Adjacency list to store graph.

    // Parse graph input.
    for (let idx = 0; idx < nodeCount; idx++) {
        rawData[idx + 1] = rawData[idx + 1].split(" "); // Split each node's line by spaces.
        let currentNodeIdx = parseInt(rawData[idx + 1][0], 10); // Node index.
        let neighborCount = parseInt(rawData[idx + 1][1], 10); // Number of neighbors.
        adjacencyList[currentNodeIdx] = new Array(neighborCount); // Initialize array for neighbors.

        // Initialize neighbor entries.
        for (let subIdx = 0; subIdx < neighborCount; subIdx++) {
            adjacencyList[currentNodeIdx][subIdx] = new Array(2);
        }

        // Populate neighbor data (neighbor_node_id, weight).
        for (let subIdx = 0; subIdx < neighborCount; subIdx++) {
            adjacencyList[currentNodeIdx][subIdx][0] = parseInt(rawData[idx + 1][subIdx * 2 + 2], 10);
            adjacencyList[currentNodeIdx][subIdx][1] = parseInt(rawData[idx + 1][subIdx * 2 + 3], 10);
        }
    }

    let visitedNodes = 1; // Counter for nodes for which shortest path is finalized.
    let minDistances = Array(nodeCount); // Array to store shortest distances from source (node 0).

    // Initialize all distances to a very large number (infinity).
    for (let idx = 0; idx < nodeCount; idx++) {
        minDistances[idx] = 1000000000; // Represents infinity.
    }
    minDistances[0] = 0; // Distance to source node (0) is 0.

    // Add neighbors of the source node to the priority queue.
    for (let idx = 0; idx < adjacencyList[0].length; idx++) {
        addNodeToQueue(adjacencyList[0][idx]);
    }

    // Main loop of Dijkstra's algorithm.
    while (visitedNodes < nodeCount) {
        let extractedPath = retrieveMinNode(); // Get the node with the smallest distance from the queue.

        // If the extracted node has already been finalized with a shorter path, skip.
        if (minDistances[extractedPath[0]] < 1000000000) {
            continue;
        }

        minDistances[extractedPath[0]] = extractedPath[1]; // Finalize the shortest distance for this node.
        visitedNodes++; // Increment count of finalized nodes.

        // Explore neighbors of the current node.
        for (let idx = 0; idx < adjacencyList[extractedPath[0]].length; idx++) {
            // Calculate potential new distance to neighbor.
            adjacencyList[extractedPath[0]][idx][1] += minDistances[extractedPath[0]];
            // Add neighbor to the priority queue with its updated distance.
            addNodeToQueue(adjacencyList[extractedPath[0]][idx]);
        }
    }

    // Output the shortest distances for each node.
    for (let idx = 0; idx < nodeCount; idx++) {
        console.log(idx + " " + minDistances[idx]);
    }
}

// Read input from stdin and pass it to the main processing function.
ProcessGraphData(require("fs").readFileSync("/dev/stdin", "utf8"));
