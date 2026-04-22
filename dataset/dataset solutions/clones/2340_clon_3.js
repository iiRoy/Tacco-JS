// This is a self-contained script designed to process graph data from standard input.
// It computes a specific path metric based on two Breadth-First Search (BFS) traversals
// originating from two distinct starting points within the graph.

// --- Helper Class: Input Token Buffer ---
// Manages a sequence of input tokens, allowing for efficient sequential reading.
class InputTokenBuffer {
    /**
     * Constructs a new buffer, optionally initialized with an array of string elements.
     * @param {Array<string>} [initialItems=[]] - An array of strings to load into the buffer initially.
     */
    constructor(initialItems = []) {
        // The underlying array that holds the tokens.
        this.bufferElements = initialItems;
        // The current number of items remaining to be read.
        this.currentSize = initialItems.length;
        // An internal pointer indicating the index of the next element to be dequeued.
        this.readPointer = 0;
    }

    /**
     * Adds a single element to the end of the buffer.
     * @param {string} elementToAdd - The string element to append.
     */
    enqueueElement(elementToAdd) {
        this.currentSize++;
        this.bufferElements.push(elementToAdd);
    }

    /**
     * Retrieves and removes the next element from the front of the buffer (FIFO).
     * This method assumes there are elements available to be dequeued.
     * @returns {string} The next string element from the buffer.
     * @throws {Error} If an attempt is made to dequeue from an exhausted buffer.
     */
    dequeueElement() {
        // A basic check to prevent reading beyond the available elements.
        if (this.readPointer >= this.bufferElements.length) {
            console.error("Warning: Attempted to dequeue from an empty or exhausted buffer. This might indicate malformed input.");
            return ""; // Return empty string or handle error appropriately.
        }
        this.currentSize--;
        // Increment the read pointer and return the element at the original pointer position.
        return this.bufferElements[this.readPointer++];
    }

    /**
     * Resets the buffer to its initial empty state, clearing all stored elements
     * and resetting the read pointer and size.
     */
    resetState() {
        this.bufferElements = [];
        this.currentSize = 0;
        this.readPointer = 0;
    }
}

// --- Helper Class: Graph Input Interpreter ---
// Parses raw input text into tokens and provides methods to read specific data types.
class GraphInputInterpreter {
    /**
     * Creates an input interpreter by processing a raw input string.
     * The string is trimmed and then split into individual tokens based on whitespace.
     * @param {string} rawInputText - The complete input content as a single string.
     */
    constructor(rawInputText) {
        // Perform initial parsing: trim leading/trailing whitespace, then split by any whitespace sequence.
        const parsedTokens = rawInputText.trim().split(/\s+/g);
        // Store these tokens in an InputTokenBuffer for sequential, robust access.
        this.tokenBuffer = new InputTokenBuffer(parsedTokens);
    }

    /**
     * Reads the next available token from the input buffer as a string.
     * @returns {string} The next string token.
     */
    getNextToken() {
        return this.tokenBuffer.dequeueElement();
    }

    /**
     * Reads the next available token from the input buffer and converts it to an integer.
     * @returns {number} The next integer value.
     */
    readInteger() {
        // Use parseInt with radix 10 for reliable and explicit base-10 conversion.
        return parseInt(this.tokenBuffer.dequeueElement(), 10);
    }

    /**
     * Clears the internal token buffer, effectively discarding any unread input.
     * This can be useful if only a subset of the input is needed.
     */
    clearBuffer() {
        this.tokenBuffer.resetState();
    }
}

// --- Core Algorithm: Breadth-First Search (BFS) ---

/**
 * Executes a Breadth-First Search (BFS) algorithm to compute shortest path distances
 * from a specified starting node to all other reachable nodes in an unweighted graph.
 *
 * @param {number} startingNodeIndex - The 0-indexed node from which the BFS begins.
 * @param {Array<Array<number>>} graphAdjacencyList - The graph represented as an adjacency list.
 * @param {Array<Object>} nodeTraversalData - An array of objects, where each object
 *   stores traversal-specific data (visited status, distance) for a corresponding node.
 * @param {string} distancePropertyKey - The key string within `nodeTraversalData` objects
 *   to store the calculated distance for this particular BFS run (e.g., 'distanceFromA').
 * @param {string} visitedPropertyKey - The key string within `nodeTraversalData` objects
 *   to store the visited status for this specific BFS run (e.g., 'visitedFromA').
 */
const executeBreadthFirstSearch = (
    startingNodeIndex,
    graphAdjacencyList,
    nodeTraversalData,
    distancePropertyKey,
    visitedPropertyKey
) => {
    // Initialize the queue for BFS. Each entry contains the vertex and its distance from the start.
    // Using an array and a read pointer to simulate an efficient queue (FIFO).
    const bfsQueue = [{ vertex: startingNodeIndex, currentDistance: 0 }];
    let queueReadPointer = 0; // Pointer to the next element to dequeue.

    // Mark the starting node as visited for this BFS and set its distance to zero.
    nodeTraversalData[startingNodeIndex][visitedPropertyKey] = true;
    nodeTraversalData[startingNodeIndex][distancePropertyKey] = 0;

    // Continue the BFS as long as there are nodes in the queue to process.
    while (queueReadPointer < bfsQueue.length) {
        // Dequeue the next item (FIFO order).
        const { vertex: currentVertex, currentDistance: distFromStart } = bfsQueue[queueReadPointer++];

        // Iterate over all directly connected neighbors of the current vertex.
        for (const adjacentNode of graphAdjacencyList[currentVertex]) {
            // If this neighbor has not yet been visited in the current BFS traversal.
            if (!nodeTraversalData[adjacentNode][visitedPropertyKey]) {
                // Mark the neighbor as visited.
                nodeTraversalData[adjacentNode][visitedPropertyKey] = true;
                // Calculate and store its shortest distance from the starting node.
                nodeTraversalData[adjacentNode][distancePropertyKey] = distFromStart + 1;
                // Enqueue the neighbor to process it in subsequent steps.
                bfsQueue.push({ vertex: adjacentNode, currentDistance: distFromStart + 1 });
            }
        }
    }
};

// --- Main Logic: Graph Path Analysis ---

/**
 * Processes graph input to determine a specific optimal path value based on
 * two BFS traversals and a comparison of their resulting distances.
 *
 * @param {GraphInputInterpreter} dataInterpreterInstance - An instance of the input interpreter
 *   configured to read graph data.
 */
const analyzeGraphPaths = (dataInterpreterInstance) => {
    // Read the fundamental graph parameters from the input.
    const totalNodes = dataInterpreterInstance.readInteger();
    // Adjust node indices to be 0-based for array access.
    const startPointNodeA = dataInterpreterInstance.readInteger() - 1;
    const startPointNodeB = dataInterpreterInstance.readInteger() - 1;

    // Guard clause: Handle invalid or empty graph input.
    if (totalNodes <= 0) {
        console.log(0); // If no nodes, the result is 0 by convention or problem specification.
        return;
    }

    // Initialize the graph's adjacency list. Each element is an array of neighbor indices.
    const graphAdjacencyList = Array.from({ length: totalNodes }, () => []);

    // Initialize an array to store comprehensive traversal data for each node.
    // Each node's object will contain properties for two distinct BFS traversals.
    const nodeTraversalData = Array.from({ length: totalNodes }, () => ({
        visitedFromA: false,    // Flag: Was this node visited during BFS from A?
        visitedFromB: false,    // Flag: Was this node visited during BFS from B?
        distanceFromA: -1,      // Shortest distance from starting node A (-1 indicates unreachable).
        distanceFromB: -1       // Shortest distance from starting node B (-1 indicates unreachable).
    }));

    // Read the edge definitions and populate the adjacency list.
    // The graph is assumed to be undirected, so add edges in both directions.
    for (let edgeCounter = 0; edgeCounter < totalNodes - 1; edgeCounter++) {
        // Read two connected nodes for an edge, adjusting to 0-indexed.
        const firstEdgeNode = dataInterpreterInstance.readInteger() - 1;
        const secondEdgeNode = dataInterpreterInstance.readInteger() - 1;

        // Add bidirectional connections.
        graphAdjacencyList[firstEdgeNode].push(secondEdgeNode);
        graphAdjacencyList[secondEdgeNode].push(firstEdgeNode);
    }

    // --- Execute the two required BFS traversals ---

    // First BFS: Calculate distances from `startPointNodeA`.
    executeBreadthFirstSearch(
        startPointNodeA,
        graphAdjacencyList,
        nodeTraversalData,
        'distanceFromA',
        'visitedFromA'
    );

    // Second BFS: Calculate distances from `startPointNodeB`.
    executeBreadthFirstSearch(
        startPointNodeB,
        graphAdjacencyList,
        nodeTraversalData,
        'distanceFromB',
        'visitedFromB'
    );

    // --- Analyze the results to find the specific optimal value ---

    let maximumPathDifference = 0; // Tracks the maximum distance from B for nodes where dist(B) < dist(A).
    const INITIAL_MIN_VALUE = Number.MAX_SAFE_INTEGER; // A very large number to initialize minimums.
    let minimumEqualDistance = INITIAL_MIN_VALUE; // Tracks the minimum distance when dist(A) == dist(B).
    let hasEqualDistancePath = false; // Flag to check if any node satisfies dist(A) == dist(B).

    // Iterate through every node in the graph to compare its distances from A and B.
    for (let nodeComparisonIndex = 0; nodeComparisonIndex < totalNodes; nodeComparisonIndex++) {
        const currentNodeData = nodeTraversalData[nodeComparisonIndex];
        const distA = currentNodeData.distanceFromA;
        const distB = currentNodeData.distanceFromB;

        // Ensure both distances are valid (node is reachable from both A and B).
        if (distA !== -1 && distB !== -1) {
            // Condition 1: Distance from B is strictly less than distance from A.
            if (distB < distA) {
                // Update the maximum `distB` found under this condition.
                maximumPathDifference = Math.max(maximumPathDifference, distB);
            }
            // Condition 2: Distances from A and B are exactly equal.
            else if (distB === distA) {
                hasEqualDistancePath = true; // Mark that such a path exists.
                // Update the minimum `distA` (or `distB`, since they are equal) found.
                minimumEqualDistance = Math.min(minimumEqualDistance, distA);
            }
        }
    }

    // Determine the final result based on the analysis logic.
    let calculatedOptimalValue;
    if (hasEqualDistancePath) {
        // If there's at least one node with equal distances, the result is the maximum
        // between `maximumPathDifference` and `minimumEqualDistance`.
        calculatedOptimalValue = Math.max(maximumPathDifference, minimumEqualDistance);
    } else {
        // If no node has equal distances, the result is simply `maximumPathDifference`.
        calculatedOptimalValue = maximumPathDifference;
    }

    // Output the final computed optimal value to standard output.
    console.log(calculatedOptimalValue);
};

// --- Main Application Entry Point (Self-Executing Function) ---
// This Immediately Invoked Function Expression (IIFE) serves as the primary
// execution flow, initializing the environment and calling the core logic.
(function mainApplicationEntryPoint() {
    let fileSystemModule; // Variable to hold the 'fs' module reference.

    // Attempt to load the 'fs' module. This typically indicates a Node.js environment.
    try {
        fileSystemModule = require('fs');
    } catch (error) {
        // If 'fs' module is not found, the environment is likely not Node.js.
        // Log an error and exit gracefully, as stdin reading won't work as expected.
        console.error("Error: The 'fs' module is required but not found.");
        console.error("This script is designed to run in a Node.js environment to read from /dev/stdin.");
        process.exit(1); // Terminate the process with an error code.
    }

    // Read all input data from standard input (/dev/stdin) as a UTF-8 string.
    const fullInputContentString = fileSystemModule.readFileSync("/dev/stdin", "utf8");

    // Create an interpreter instance to parse the read input string.
    const graphDataInterpreterInstance = new GraphInputInterpreter(fullInputContentString);

    // Invoke the main graph path analysis function with the interpreter.
    analyzeGraphPaths(graphDataInterpreterInstance);
})();