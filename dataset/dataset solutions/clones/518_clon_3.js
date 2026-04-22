const fileSystemOps = require('fs');

// Constants for graph operations and pathfinding
const UNREACHABLE_DISTANCE = Number.MAX_SAFE_INTEGER; // Represents an unreachable path or infinite distance
const INITIAL_NODE_IDENTIFIER = 0; // Convention for the starting node in our graph problems

/**
 * A utility function to safely parse a string into an integer.
 * It provides basic error handling for non-numeric input.
 * @param {string} inputString - The string to parse.
 * @returns {number} The parsed integer, or 0 if parsing fails.
 */
const retrieveNumericValue = (inputString) => {
    const parsedValue = parseInt(inputString, 10);
    if (isNaN(parsedValue)) {
        // In a production environment, this might throw an error or log more extensively.
        // For competitive programming, returning 0 or a default might be expected.
        console.warn("Input parsing issue: Non-numeric value encountered, defaulting to 0:", inputString);
        return 0;
    }
    return parsedValue;
};

// Synchronously reads all content from standard input, simulating file read.
// This approach is common in Node.js for competitive programming where input is piped.
let processedInputContent;
try {
    const standardInputDescriptor = process.stdin.fd;
    const fileStatistics = fileSystemOps.fstatSync(standardInputDescriptor);
    const totalDataLength = fileStatistics.size;

    // Allocate a buffer to hold the input data. Buffer.alloc is safer than new Buffer.
    const rawInputBuffer = Buffer.alloc(totalDataLength);
    const actualBytesTransferred = fileSystemOps.readSync(standardInputDescriptor, rawInputBuffer, 0, totalDataLength, 0);

    processedInputContent = rawInputBuffer.toString('utf8', 0, actualBytesTransferred);
} catch (ioError) {
    console.error("Critical error: Unable to read from standard input stream.", ioError.message);
    // If input reading fails, proceed with an empty string to prevent further errors.
    processedInputContent = '';
}

// Splits the input content into an array of individual lines, removing any blank lines.
const systemInputLines = processedInputContent.split('\n').filter(line => line.trim() !== '');

/**
 * Constructs and initializes a two-dimensional array (matrix) with a specified default value.
 * This function provides a more functional way to create matrices.
 * @param {number} rowCount - The desired number of rows.
 * @param {number} columnCount - The desired number of columns.
 * @param {*} defaultValue - The value to assign to each cell in the matrix.
 * @returns {Array<Array<*>>} A newly created 2D array.
 */
function createTwoDimensionalArray(rowCount, columnCount, defaultValue) {
    // Input validation: ensure dimensions are positive.
    if (rowCount <= 0 || columnCount <= 0) {
        console.warn("Invalid dimensions provided for matrix creation. Returning empty array.");
        return [];
    }
    // Using Array.from with a map function ensures that each inner array is a distinct instance.
    return Array.from({ length: rowCount }, () => Array(columnCount).fill(defaultValue));
}

/**
 * Implements a Min-Priority Queue, crucial for optimizing Dijkstra's algorithm.
 * This class allows efficient insertion and extraction of elements based on their priority.
 */
class MinPriorityQueue {
    constructor() {
        this.internalHeap = []; // Stores elements as { priority, value } objects
    }

    /** Checks if the priority queue is empty. */
    isQueueEmpty() {
        return this.internalHeap.length === 0;
    }

    /**
     * Inserts a new item into the priority queue.
     * @param {number} priority - The priority of the item (lower is higher priority).
     * @param {*} itemValue - The actual value to be stored.
     */
    insertItem(priority, itemValue) {
        this.internalHeap.push({ priority, value: itemValue });
        this.heapifyUp(this.internalHeap.length - 1);
    }

    /**
     * Extracts and returns the item with the smallest priority.
     * @returns {*} The value of the item with the highest priority, or null if the queue is empty.
     */
    extractHighestPriorityItem() {
        if (this.isQueueEmpty()) return null;
        if (this.internalHeap.length === 1) return this.internalHeap.pop().value;

        const minItemValue = this.internalHeap[0].value;
        this.internalHeap[0] = this.internalHeap.pop(); // Move last element to root
        this.heapifyDown(0); // Restore heap property
        return minItemValue;
    }

    /**
     * Helper to move an element up the heap to maintain the min-heap property.
     * @param {number} currentIndex - The index of the element to bubble up.
     */
    heapifyUp(currentIndex) {
        while (currentIndex > 0) {
            const parentIndex = Math.floor((currentIndex - 1) / 2);
            if (this.internalHeap[parentIndex].priority > this.internalHeap[currentIndex].priority) {
                // Swap current element with its parent
                [this.internalHeap[parentIndex], this.internalHeap[currentIndex]] =
                    [this.internalHeap[currentIndex], this.internalHeap[parentIndex]];
                currentIndex = parentIndex;
            } else {
                break; // Correct position found
            }
        }
    }

    /**
     * Helper to move an element down the heap to maintain the min-heap property.
     * @param {number} currentIndex - The index of the element to sink down.
     */
    heapifyDown(currentIndex) {
        const lastHeapIndex = this.internalHeap.length - 1;
        while (true) {
            let smallestPriorityIndex = currentIndex;
            const leftChild = 2 * currentIndex + 1;
            const rightChild = 2 * currentIndex + 2;

            // Check if left child exists and has a smaller priority
            if (leftChild <= lastHeapIndex && this.internalHeap[leftChild].priority < this.internalHeap[smallestPriorityIndex].priority) {
                smallestPriorityIndex = leftChild;
            }
            // Check if right child exists and has a smaller priority
            if (rightChild <= lastHeapIndex && this.internalHeap[rightChild].priority < this.internalHeap[smallestPriorityIndex].priority) {
                smallestPriorityIndex = rightChild;
            }

            // If the smallest priority is not at the current index, swap and continue
            if (smallestPriorityIndex !== currentIndex) {
                [this.internalHeap[currentIndex], this.internalHeap[smallestPriorityIndex]] =
                    [this.internalHeap[smallestPriorityIndex], this.internalHeap[currentIndex]];
                currentIndex = smallestPriorityIndex;
            } else {
                break; // Heap property restored
            }
        }
    }
}

/**
 * Computes the shortest path distances from a designated source node to all other nodes
 * within a graph, employing Dijkstra's algorithm with a min-priority queue for efficiency.
 * @param {Array<Array<number>>} graphAdjacencyMatrix - The graph represented as an adjacency matrix,
 *                                          where graphAdjacencyMatrix[u][v] is the weight of the edge (u,v).
 * @param {number} startingNode - The index of the node from which to calculate distances.
 * @returns {Array<number>} An array where shortestPathDistances[i] is the shortest
 *                          distance from startingNode to node i.
 */
function computeShortestPathDistances(graphAdjacencyMatrix, startingNode) {
    const totalGraphNodes = graphAdjacencyMatrix.length;

    // Guard clause for invalid input graph or starting node.
    if (totalGraphNodes === 0 || startingNode < 0 || startingNode >= totalGraphNodes) {
        console.warn("Invalid graph configuration or start node for shortest path computation.");
        return []; // Return an empty array indicating failure or invalid state.
    }

    const shortestPathDistances = new Array(totalGraphNodes).fill(UNREACHABLE_DISTANCE);
    const nodePriorityQueue = new MinPriorityQueue();

    shortestPathDistances[startingNode] = 0; // Distance to self is zero.
    nodePriorityQueue.insertItem(0, startingNode); // Add start node to PQ with priority 0.

    // Process nodes until the priority queue is exhausted.
    while (!nodePriorityQueue.isQueueEmpty()) {
        // Peek at the highest priority (smallest distance) element.
        // This peek is slightly redundant if extractHighestPriorityItem already gives distance.
        // It's part of the lazy deletion pattern.
        const currentMinDistance = nodePriorityQueue.internalHeap[0].priority;
        const currentProcessingNode = nodePriorityQueue.extractHighestPriorityItem();

        // If a shorter path to currentProcessingNode has already been found and processed, skip.
        // This handles cases where a node is added to the PQ multiple times with different distances.
        if (currentMinDistance > shortestPathDistances[currentProcessingNode]) {
            continue;
        }

        // Explore all potential neighbors of the current node.
        for (let neighborNodeIndex = 0; neighborNodeIndex < totalGraphNodes; neighborNodeIndex++) {
            const edgeCost = graphAdjacencyMatrix[currentProcessingNode][neighborNodeIndex];

            // If an edge exists and a shorter path to the neighbor can be formed through currentProcessingNode.
            if (edgeCost !== UNREACHABLE_DISTANCE &&
                shortestPathDistances[currentProcessingNode] + edgeCost < shortestPathDistances[neighborNodeIndex]) {

                shortestPathDistances[neighborNodeIndex] = shortestPathDistances[currentProcessingNode] + edgeCost;
                nodePriorityQueue.insertItem(shortestPathDistances[neighborNodeIndex], neighborNodeIndex);
            }
        }
    }
    return shortestPathDistances;
}

/**
 * Computes a target position by adding a move distance and an optional node-specific offset,
 * ensuring the result stays within defined bounds.
 * This helper encapsulates the complex `pos` calculation logic from the original code.
 * @param {number} currentPosition - The current node index (equivalent to 'i').
 * @param {number} stepDistance - The distance to move (equivalent to 'j').
 * @param {number} totalIntermediateNodes - The total count of intermediate nodes (equivalent to 'n').
 * @param {Array<number>} nodeOffsetValues - An array of additional distance offsets for nodes.
 * @returns {number} The calculated and bounded target node index.
 */
function calculateBoundedDestination(currentPosition, stepDistance, totalIntermediateNodes, nodeOffsetValues) {
    // Original logic: pos = i + j + (i + j < n + 1 ? d[i + j] : 0);
    const combinedCurrentAndStep = currentPosition + stepDistance;
    let additionalOffset = 0;

    // Only apply offset if combined index is within valid bounds for nodeOffsetValues array.
    if (combinedCurrentAndStep >= 0 && combinedCurrentAndStep < totalIntermediateNodes + 2) {
        additionalOffset = nodeOffsetValues[combinedCurrentAndStep];
    }

    let potentialDestination = combinedCurrentAndStep + additionalOffset;

    // Apply bounds checking: target must be between 0 and totalIntermediateNodes + 1.
    const lowerBoundNode = INITIAL_NODE_IDENTIFIER;
    const upperBoundNode = totalIntermediateNodes + 1; // Represents the final destination node.

    return Math.min(Math.max(potentialDestination, lowerBoundNode), upperBoundNode);
}

/**
 * Determines if a system exhibits specific connectivity properties based on movement rules
 * and node offsets, utilizing Dijkstra's algorithm.
 * @param {number} maximumStepRange - The maximum distance an agent can move in a single step.
 * @param {number} countOfIntermediateNodes - The number of nodes between the start (0) and end (n+1).
 * @param {Array<number>} customNodeOffsets - An array containing custom distance offsets for each node.
 * @returns {boolean} True if all connectivity criteria are satisfied, false otherwise.
 */
function assessSystemConnectivity(maximumStepRange, countOfIntermediateNodes, customNodeOffsets) {
    // The graph includes an initial node (0), 'n' intermediate nodes, and a final destination node (n+1).
    const fullGraphNodeCount = countOfIntermediateNodes + 2;

    // Initialize the graph's adjacency matrix with UNREACHABLE_DISTANCE for all edges.
    const connectivityGraph = createTwoDimensionalArray(fullGraphNodeCount, fullGraphNodeCount, UNREACHABLE_DISTANCE);

    // Construct the graph by defining possible movements.
    // Iterate through all possible source nodes from 0 to 'n'.
    for (let currentSourceNode = INITIAL_NODE_IDENTIFIER; currentSourceNode <= countOfIntermediateNodes; currentSourceNode++) {
        // Iterate through all allowed step distances (0 up to maximumStepRange - 1).
        // This replicates the `for (var j = max; j--; )` behavior.
        for (let currentStepDistance = 0; currentStepDistance < maximumStepRange; currentStepDistance++) {
            // Calculate the actual destination node based on movement rules and offsets.
            const calculatedDestinationNode = calculateBoundedDestination(
                currentSourceNode,
                currentStepDistance,
                countOfIntermediateNodes,
                customNodeOffsets
            );

            // If the calculated destination is distinct from the source, add an edge.
            // Edge weight is 1, implying a single hop/move.
            if (calculatedDestinationNode !== currentSourceNode) {
                connectivityGraph[currentSourceNode][calculatedDestinationNode] = 1;
            }
        }
    }

    // --- Connectivity Check Phase 1: Reachability from Start Node (0) ---
    const distancesFromInitialNode = computeShortestPathDistances(connectivityGraph, INITIAL_NODE_IDENTIFIER);
    const finalDestinationNodeIndex = countOfIntermediateNodes + 1;

    // If the final destination node is not reachable from the initial node, the system fails.
    if (distancesFromInitialNode[finalDestinationNodeIndex] === UNREACHABLE_DISTANCE) {
        return false;
    }

    // --- Connectivity Check Phase 2: Reachability of Final Destination from Intermediate Nodes ---
    // This check is only relevant if there are intermediate nodes to consider.
    if (countOfIntermediateNodes > 0) {
        // Iterate through all intermediate nodes (1 to 'n').
        for (let intermediateNodeCandidate = 1; intermediateNodeCandidate <= countOfIntermediateNodes; intermediateNodeCandidate++) {
            // Only perform a sub-Dijkstra if the intermediate node itself is reachable from the global start.
            if (distancesFromInitialNode[intermediateNodeCandidate] !== UNREACHABLE_DISTANCE) {
                const distancesFromIntermediate = computeShortestPathDistances(connectivityGraph, intermediateNodeCandidate);

                // If the final destination node is unreachable from this reachable intermediate node, the system fails.
                if (distancesFromIntermediate[finalDestinationNodeIndex] === UNREACHABLE_DISTANCE) {
                    return false;
                }
            }
        }
    }

    // If all connectivity conditions are met, the system is deemed 'OK'.
    return true;
}

// Main processing loop for test cases.
let currentInputLinePointer = 0;
while (currentInputLinePointer < systemInputLines.length) {
    // Retrieve the maximum allowed movement range for the current test case.
    const currentMaxMoveRange = retrieveNumericValue(systemInputLines[currentInputLinePointer++]);

    // A maximum movement range of 0 typically signifies the end of input for this problem type.
    if (currentMaxMoveRange === 0) {
        break;
    }

    // Retrieve the number of intermediate nodes for the current test case.
    const currentNumIntermediateNodes = retrieveNumericValue(systemInputLines[currentInputLinePointer++]);

    // Initialize the array for custom node offsets. It needs space for nodes 0 to n+1.
    // Nodes 0 and n+1 implicitly have an offset of 0.
    const currentNodeOffsetArray = new Array(currentNumIntermediateNodes + 2).fill(0);

    // Read the specific offsets for intermediate nodes (from 1 to n).
    for (let nodeIndex = 1; nodeIndex <= currentNumIntermediateNodes; nodeIndex++) {
        if (currentInputLinePointer < systemInputLines.length) {
            currentNodeOffsetArray[nodeIndex] = retrieveNumericValue(systemInputLines[currentInputLinePointer++]);
        } else {
            console.error("Input format error: Unexpected end of input while reading node offsets.");
            // In a real application, this might throw or handle the error more gracefully.
            // For now, we'll break to prevent further out-of-bounds access.
            break;
        }
    }

    // Execute the main connectivity evaluation logic for the current test case.
    const overallConnectivityResult = assessSystemConnectivity(
        currentMaxMoveRange,
        currentNumIntermediateNodes,
        currentNodeOffsetArray
    );

    // Output the result as 'OK' or 'NG' (Not Good).
    console.log(overallConnectivityResult ? 'OK' : 'NG');
}