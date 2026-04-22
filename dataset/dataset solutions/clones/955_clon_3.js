// Global variables for the min-priority queue (heap) implementation.
// This heap will store elements as arrays: [destinationNodeIndex, edgeWeight, sourceNodeIndex]
let priorityQueueElements = []; // The actual heap array for storing edges
let currentQueueSize = 0;       // Tracks the number of elements currently in the heap

// Initialize the first element of the heap array (index 0) with dummy values.
// This allows for 1-based indexing of the heap, simplifying parent/child calculations.
priorityQueueElements[0] = [-1, -1, -1]; // Placeholder element, not used for actual data

// --- Constants for heap item structure for improved readability ---
// These indices define the meaning of elements within an edge array stored in the heap.
const HEAP_DESTINATION_NODE_INDEX = 0;
const HEAP_EDGE_WEIGHT_INDEX = 1;
const HEAP_SOURCE_NODE_INDEX = 2;

/**
 * Helper function to efficiently swap two elements within a given array.
 * This function is utilized by heap operations to maintain its structure.
 * @param {Array<Array<number>>} arrayToModify The array where elements need to be swapped (e.g., the heap).
 * @param {number} indexOne Index of the first element to swap.
 * @param {number} indexTwo Index of the second element to swap.
 */
function swapHeapElements(arrayToModify, indexOne, indexTwo) {
    const temporaryElement = arrayToModify[indexOne];
    arrayToModify[indexOne] = arrayToModify[indexTwo];
    arrayToModify[indexTwo] = temporaryElement;
}

/**
 * Inserts a new edge item into the min-priority queue (heap).
 * The heap self-organizes to maintain the min-heap property based on the edge's weight.
 * @param {Array<number>} edgeItem An array representing the edge:
 *                                  [destinationNodeIndex, edgeWeight, sourceNodeIndex].
 */
function enqueueEdgeToMinHeap(edgeItem) {
    // Basic validation to ensure the item has the expected structure.
    if (!Array.isArray(edgeItem) || edgeItem.length !== 3) {
        console.warn("Skipping invalid edge item for heap insertion:", edgeItem);
        return;
    }

    // Increment the heap size and place the new item at the very end.
    currentQueueSize++;
    priorityQueueElements[currentQueueSize] = edgeItem;

    let childPosition = currentQueueSize;

    // Perform the "bubble up" operation to restore the min-heap property.
    // This continues as long as the child is not the root (index 1)
    // and its weight is less than its parent's weight.
    while (childPosition > 1 && priorityQueueElements[childPosition][HEAP_EDGE_WEIGHT_INDEX] < priorityQueueElements[childPosition >> 1][HEAP_EDGE_WEIGHT_INDEX]) {
        // Swap the child element with its parent element.
        swapHeapElements(priorityQueueElements, childPosition, childPosition >> 1);
        // Move the child position up to where its parent was.
        childPosition = childPosition >> 1; // Efficiently calculates Math.floor(childPosition / 2)
    }
}

/**
 * Extracts and returns the edge with the minimum weight from the min-priority queue (heap).
 * After extraction, the heap property is re-established.
 * @returns {Array<number>|null} The minimum weight edge (an array), or null if the heap is empty.
 */
function dequeueMinEdgeFromHeap() {
    // If the heap contains no actual elements, return null.
    if (currentQueueSize <= 0) {
        return null;
    }

    // The minimum element is always found at the root (index 1) of a min-heap.
    const extractedMinimumElement = priorityQueueElements[1];

    // Move the last element of the heap to the root position
    // and then logically decrease the heap size.
    priorityQueueElements[1] = priorityQueueElements[currentQueueSize];
    currentQueueSize--;

    let parentPosition = 1; // Start the "bubble down" process from the new root.

    // Continue bubbling down as long as the parent has at least one child.
    while (parentPosition * 2 <= currentQueueSize) {
        const leftChildPosition = parentPosition * 2;
        const rightChildPosition = parentPosition * 2 + 1;
        let positionOfSmallestChild = leftChildPosition; // Initially assume left child is smaller.

        // If a right child exists within the heap bounds
        // and its weight is less than the left child's weight,
        // then the right child is the true smallest child.
        if (rightChildPosition <= currentQueueSize && priorityQueueElements[rightChildPosition][HEAP_EDGE_WEIGHT_INDEX] < priorityQueueElements[leftChildPosition][HEAP_EDGE_WEIGHT_INDEX]) {
            positionOfSmallestChild = rightChildPosition;
        }

        // If the parent's weight is less than or equal to the smallest child's weight,
        // the min-heap property is satisfied at this level, so we can stop.
        if (priorityQueueElements[parentPosition][HEAP_EDGE_WEIGHT_INDEX] <= priorityQueueElements[positionOfSmallestChild][HEAP_EDGE_WEIGHT_INDEX]) {
            break;
        }

        // Otherwise, swap the parent with the smallest child.
        swapHeapElements(priorityQueueElements, parentPosition, positionOfSmallestChild);
        // Move the parent's position down to where the child was.
        parentPosition = positionOfSmallestChild;
    }
    return extractedMinimumElement;
}

/**
 * Main function to process graph input data and compute the Minimum Spanning Tree (MST) weight
 * using Prim's algorithm.
 * @param {string} graphInputString The raw input string containing graph configuration.
 */
function calculateMinimumSpanningTreeWeight(graphInputString) {
    // Split the entire input string into individual lines for easier parsing.
    const inputLines = graphInputString.split("\n");

    // The first line of input provides the number of vertices in the graph.
    const numberOfVertices = Number(inputLines[0]);

    // Initialize the adjacency matrix for the graph.
    // `adjacencyMatrix[i][j]` will store the weight of the edge between node `i` and node `j`.
    // A value of -1 typically signifies that there is no direct edge between the two nodes.
    const adjacencyMatrix = Array.from({ length: numberOfVertices }, () => Array(numberOfVertices).fill(-1));

    // Parse the graph's adjacency matrix from the input lines.
    // The input lines starting from index 1 (after the `numberOfVertices` line) represent the matrix rows.
    for (let i = 0; i < numberOfVertices; i++) {
        // Each line is split by spaces to get individual edge weights.
        const currentRowValues = inputLines[i + 1].split(" ");
        for (let j = 0; j < numberOfVertices; j++) {
            // Convert string values to numbers. The original code uses `j+1` for column access,
            // implying the first element of each split row might be a row label to be skipped.
            adjacencyMatrix[i][j] = Number(currentRowValues[j + 1]);
        }
    }

    // Initialize a matrix to store the edges that form the Minimum Spanning Tree.
    // `mstEdgeMatrix[i][j]` will hold the weight of the edge (i, j) if it's part of the MST,
    // otherwise, it will remain -1.
    const mstEdgeMatrix = Array.from({ length: numberOfVertices }, () => Array(numberOfVertices).fill(-1));

    // A boolean array to keep track of which nodes have already been included in the MST.
    // `isNodeVisited[k]` is true if node `k` is part of the MST, false otherwise.
    const isNodeVisited = Array.from({ length: numberOfVertices }, () => false);

    let nodesIncludedInMst = 0; // Counter for vertices added to the MST.
    let totalMstWeightAccumulator = 0; // Accumulator for the total weight of the MST.

    // --- Prim's Algorithm Initialization (starting from node 0) ---

    // Mark the initial node (node 0) as visited and add it to the MST count.
    isNodeVisited[0] = true;
    nodesIncludedInMst++;

    // Add all edges emanating from the starting node (node 0) to the priority queue.
    // These are the initial candidate edges for the MST.
    for (let neighborIndex = 0; neighborIndex < numberOfVertices; neighborIndex++) {
        // If a valid edge exists from node 0 to `neighborIndex`.
        if (adjacencyMatrix[0][neighborIndex] > -1) {
            // Enqueue the edge: [destination, weight, source].
            enqueueEdgeToMinHeap([neighborIndex, adjacencyMatrix[0][neighborIndex], 0]);
        }
    }

    // --- Prim's Algorithm Main Loop ---
    // The loop continues until all vertices are included in the MST.
    while (nodesIncludedInMst < numberOfVertices) {
        // Extract the edge with the smallest weight from the priority queue.
        const currentBestEdgeCandidate = dequeueMinEdgeFromHeap();

        // If the heap becomes empty before all nodes are visited, it implies the graph is disconnected.
        if (currentBestEdgeCandidate === null) {
            console.error("Graph is disconnected; cannot form a complete MST for all vertices.");
            break; // Exit the loop as no more edges can be found.
        }

        const destinationNode = currentBestEdgeCandidate[HEAP_DESTINATION_NODE_INDEX];
        const edgeWeight = currentBestEdgeCandidate[HEAP_EDGE_WEIGHT_INDEX];
        const sourceNode = currentBestEdgeCandidate[HEAP_SOURCE_NODE_INDEX];

        // If the destination node of this extracted edge has already been visited (i.e., it's already
        // part of the MST), then adding this edge would create a cycle. So, we skip it.
        if (isNodeVisited[destinationNode]) {
            continue;
        }

        // Mark the destination node as visited, as it's now officially part of the MST.
        isNodeVisited[destinationNode] = true;
        nodesIncludedInMst++;

        // Record this edge in our MST result matrix.
        mstEdgeMatrix[destinationNode][sourceNode] = edgeWeight;
        mstEdgeMatrix[sourceNode][destinationNode] = edgeWeight; // For symmetry in the matrix.

        // Add the weight of this newly included edge to our running total MST weight.
        totalMstWeightAccumulator += edgeWeight;

        // Now, explore all unvisited neighbors of the `destinationNode` (the node just added to the MST).
        // Add their connecting edges to the priority queue as new candidates.
        for (let neighborIndex = 0; neighborIndex < numberOfVertices; neighborIndex++) {
            // If there's a direct edge from `destinationNode` to `neighborIndex`
            // AND `neighborIndex` has not yet been included in the MST.
            if (adjacencyMatrix[destinationNode][neighborIndex] > -1 && !isNodeVisited[neighborIndex]) {
                // Enqueue this potential edge into the priority queue.
                enqueueEdgeToMinHeap([neighborIndex, adjacencyMatrix[destinationNode][neighborIndex], destinationNode]);
            }
        }
    }

    // Output the final accumulated total weight of the Minimum Spanning Tree.
    console.log(totalMstWeightAccumulator);
}

// Entry point for the script: Read graph data from standard input and initiate processing.
// This line uses Node.js's 'fs' module to synchronously read from '/dev/stdin'.
calculateMinimumSpanningTreeWeight(require("fs").readFileSync("/dev/stdin", "utf8"));