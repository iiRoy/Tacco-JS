// Define a small utility class for a Min-Priority Queue.
// This encapsulates the heap logic and provides methods for adding and extracting elements.
class MinPriorityQueue {
    constructor() {
        // The internal array storing the heap elements.
        // Elements are expected to be arrays like [priority, value].
        this.elements = [];
    }

    /**
     * Adds a new element to the priority queue.
     * The element should be an array [priority, value], where a lower priority value
     * indicates a higher priority (e.g., [distance, node_index]).
     * @param {Array} item The element to add to the queue.
     */
    enqueue(item) {
        this.elements.push(item);
        this._siftUp(); // Restore the heap property by moving the new element up the tree.
    }

    /**
     * Private helper method to restore the heap property by moving an element up.
     * This is typically called after adding a new element to the end of the heap.
     */
    _siftUp() {
        let currentIdx = this.elements.length - 1;
        // Store the element being moved to avoid repeated array access during swaps.
        const itemToPlace = this.elements[currentIdx];

        // Continue moving up as long as the current element is not the root
        // and has a higher priority (smaller value) than its parent.
        while (currentIdx > 0) {
            const parentIdx = Math.floor((currentIdx - 1) / 2);
            const parentItem = this.elements[parentIdx];

            // If the item to place has a lower priority (larger value) than or equal to its parent,
            // its correct position has been found.
            if (itemToPlace[0] >= parentItem[0]) {
                break;
            }

            // Otherwise, move the parent element down to the current position.
            this.elements[currentIdx] = parentItem;
            currentIdx = parentIdx;
        }
        // Place the item in its final sorted position within the heap.
        this.elements[currentIdx] = itemToPlace;
    }

    /**
     * Removes and returns the element with the highest priority (smallest priority value).
     * This is the root element of the min-heap.
     * @returns {Array|undefined} The element with the highest priority, or `undefined` if the queue is empty.
     */
    dequeue() {
        if (this.isEmpty()) {
            return undefined;
        }

        const minElement = this.elements[0]; // The element to be returned (highest priority).
        const lastElement = this.elements.pop(); // Remove the last element from the heap.

        // If there are still elements remaining after removing the last one,
        // move the last element to the root and restore the heap property.
        if (!this.isEmpty()) {
            this.elements[0] = lastElement;
            this._siftDown(); // Restore heap property by moving the new root element down.
        }

        return minElement;
    }

    /**
     * Private helper method to restore the heap property by moving an element down.
     * This is typically called after replacing the root element with the last element.
     */
    _siftDown() {
        let currentIdx = 0;
        // Store the element that was moved to the root to avoid repeated array access.
        const itemToPlace = this.elements[0];
        const totalElements = this.elements.length;

        // Continue moving down as long as the current node has at least one child.
        while (2 * currentIdx + 1 < totalElements) {
            let leftChildIdx = 2 * currentIdx + 1;
            let rightChildIdx = 2 * currentIdx + 2;
            let smallestChildIdx = leftChildIdx; // Assume the left child is initially the smallest.

            // If a right child exists and has a higher priority (smaller value) than the left child,
            // then the right child is the true smallest child.
            if (rightChildIdx < totalElements && this.elements[rightChildIdx][0] < this.elements[leftChildIdx][0]) {
                smallestChildIdx = rightChildIdx;
            }

            // If the element to place has a higher priority (smaller value) than or equal to its smallest child,
            // its correct position has been found.
            if (itemToPlace[0] <= this.elements[smallestChildIdx][0]) {
                break;
            }

            // Otherwise, move the smallest child up to the current position.
            this.elements[currentIdx] = this.elements[smallestChildIdx];
            currentIdx = smallestChildIdx;
        }
        // Place the item in its final sorted position within the heap.
        this.elements[currentIdx] = itemToPlace;
    }

    /**
     * Checks if the priority queue contains any elements.
     * @returns {boolean} `true` if the queue is empty, `false` otherwise.
     */
    isEmpty() {
        return this.elements.length === 0;
    }

    /**
     * Returns the current number of elements in the priority queue.
     * @returns {number} The count of elements.
     */
    size() {
        return this.elements.length;
    }
}

// Main function to execute the graph traversal algorithm (Dijkstra's Shortest Path).
function executeGraphTraversal() {
    // Define constants for better readability and easier modification.
    const MAX_PATH_COST = Infinity;
    const UNREACHABLE_NODE_LABEL = 'INF';

    // Read initial graph parameters: number of vertices, number of edges, and the starting vertex index.
    const numGraphVertices = readNextInputToken();
    const numGraphEdges = readNextInputToken();
    const sourceVertexIdx = readNextInputToken();

    // Initialize the adjacency list for the graph.
    // Each entry `graphAdjacency[i]` will store an array of its neighbors.
    // Each neighbor is represented as an array: `[target_vertex_index, edge_weight]`.
    const graphAdjacency = Array.from({ length: numGraphVertices }, () => []);

    // Populate the graph adjacency list by reading edge information.
    for (let edgeCount = 0; edgeCount < numGraphEdges; ++edgeCount) {
        const startNode = readNextInputToken();
        const endNode = readNextInputToken();
        const edgeWeight = readNextInputToken();
        // Add a directed edge from `startNode` to `endNode` with the given `edgeWeight`.
        graphAdjacency[startNode].push([endNode, edgeWeight]);
    }

    // Initialize the array `shortestPathCosts` to store the minimum distance from `sourceVertexIdx`
    // to every other vertex. All are initially set to `MAX_PATH_COST` (infinity).
    const shortestPathCosts = new Array(numGraphVertices).fill(MAX_PATH_COST);

    // The distance from the source vertex to itself is 0.
    shortestPathCosts[sourceVertexIdx] = 0;

    // Create an instance of our `MinPriorityQueue` to manage vertices to visit.
    // The queue will store elements as `[current_distance, vertex_index]`.
    const vertexPriorityQueue = new MinPriorityQueue();
    // Enqueue the source vertex with its initial distance.
    vertexPriorityQueue.enqueue([0, sourceVertexIdx]);

    // Main loop for Dijkstra's algorithm. Continues as long as there are vertices to process in the queue.
    while (!vertexPriorityQueue.isEmpty()) {
        // Extract the vertex with the smallest known distance from the priority queue.
        // Using array destructuring for clarity.
        const [currentDistance, currentNodeIdx] = vertexPriorityQueue.dequeue();

        // If we have already found a shorter path to `currentNodeIdx` than `currentDistance`,
        // this entry in the priority queue is outdated, so we skip processing it.
        if (currentDistance > shortestPathCosts[currentNodeIdx]) {
            continue;
        }

        // Iterate over all neighbors of the `currentNodeIdx`.
        // Using a `for...of` loop for concise iteration over the adjacency list.
        for (const neighborEdge of graphAdjacency[currentNodeIdx]) {
            // Destructure neighbor information: its index and the cost to reach it from `currentNodeIdx`.
            const [neighborNodeIdx, edgeCost] = neighborEdge;

            // Calculate the potential new path cost to the neighbor through the `currentNodeIdx`.
            const newPathCost = currentDistance + edgeCost;

            // If this new path to `neighborNodeIdx` is shorter than any previously found path,
            // update the shortest path cost and add/update the neighbor in the priority queue.
            if (newPathCost < shortestPathCosts[neighborNodeIdx]) {
                shortestPathCosts[neighborNodeIdx] = newPathCost; // Update the shortest path cost.
                // Enqueue the neighbor with its newly discovered shorter path cost.
                vertexPriorityQueue.enqueue([newPathCost, neighborNodeIdx]);
            }
        }
    }

    // After Dijkstra's algorithm completes, output the shortest path costs for all vertices.
    for (let vertexIdx = 0; vertexIdx < numGraphVertices; ++vertexIdx) {
        // If a vertex is unreachable (cost remains `MAX_PATH_COST`), output 'INF', otherwise output its cost.
        outputResult(shortestPathCosts[vertexIdx] !== MAX_PATH_COST ? shortestPathCosts[vertexIdx] : UNREACHABLE_NODE_LABEL);
    }
}

// --- Standard Input/Output Handling for Competitive Programming ---

// Resume standard input stream and set encoding to UTF-8.
process.stdin.resume();
process.stdin.setEncoding('utf8');

// Global variables to store incoming input data and track parsing progress.
let inputDataBuffer = '';
let bufferReadPointer = 0;

/**
 * Reads the next token (number or string) from the pre-processed input buffer.
 * It advances an internal pointer to the next token.
 * @param {string} [returnType='number'] Specifies the desired return type ('string' or 'number').
 * @returns {*} The next token parsed as a number or string, or `undefined` if end of buffer.
 */
function readNextInputToken(returnType = 'number') {
    // Basic guard to prevent reading past the end of the buffer, though competitive
    // programming problems usually guarantee sufficient input.
    if (bufferReadPointer >= inputDataBuffer.length) {
        console.error("Error: Attempted to read beyond the end of the input buffer.");
        return undefined; // Or throw an error, depending on desired error handling.
    }

    const token = inputDataBuffer[bufferReadPointer++];
    // Convert to number if 'number' type is requested, otherwise return as string.
    return returnType === 'string' ? token : +token;
}

/**
 * Prints a value to the standard output (console), followed by a newline.
 * This function acts as a wrapper for `console.log`.
 * @param {*} value The value to be printed.
 */
function outputResult(value) {
    console.log(value);
}

// Event listener: Appends incoming data chunks to the `inputDataBuffer`.
process.stdin.on('data', function (chunk) {
    inputDataBuffer += chunk;
});

// Event listener: Triggered when all input data has been received.
process.stdin.on('end', function () {
    // Split the entire accumulated input string by any whitespace characters.
    // The `.filter(Boolean)` removes any empty strings that might result from splitting
    // (e.g., from consecutive spaces or leading/trailing whitespace).
    inputDataBuffer = inputDataBuffer.split(/\s+/).filter(Boolean);
    // Once input is ready, execute the main graph traversal logic.
    executeGraphTraversal();
});