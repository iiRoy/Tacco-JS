const InputProcessor = (function() {
    // Function to create an InputBuffer instance
    function initializeProcessor(rawDataString) {
        return new InputBuffer(rawDataString);
    }

    // Class responsible for handling line-by-line input parsing
    class InputBuffer {
        // Private fields to store the processed lines and current reading position
        #lineSegments; // Stores lines, potentially split into tokens and reversed
        #currentLinePosition; // Index of the next line to be read

        /**
         * Constructs an InputBuffer from a raw string.
         * @param {string} rawStringData - The entire input content as a single string.
         */
        constructor(rawStringData) {
            // Trim leading/trailing whitespace from the input and split into an array of lines.
            this.#lineSegments = rawStringData.trim().split("\n");
            this.#currentLinePosition = 0; // Start reading from the very first line.
        }

        /**
         * Extracts and returns the next token from the current line.
         * Tokens are read from left to right, effectively popping from a reversed array.
         * Advances to the next line if the current one becomes empty.
         * @param {boolean} [rawStringOutput=false] - If true, returns the token as a string; otherwise, attempts conversion to a number.
         * @returns {string|number|undefined} The extracted token, or undefined if no more input.
         */
        extractNextToken(rawStringOutput = false) {
            // Check if we've reached the end of the input
            if (this.#currentLinePosition >= this.#lineSegments.length) {
                console.warn("InputBuffer: Attempted to read beyond the end of input lines.");
                return undefined; // Indicate no more data
            }

            let activeLineData = this.#lineSegments[this.#currentLinePosition];

            // If the current line is still a single string, split it into tokens and reverse.
            // Reversing allows `pop()` to extract tokens in their original order (left-to-right).
            if (typeof activeLineData === "string") {
                this.#lineSegments[this.#currentLinePosition] = activeLineData.split(" ").reverse();
                activeLineData = this.#lineSegments[this.#currentLinePosition];
            }

            const extractedToken = activeLineData.pop(); // Retrieve the token

            // If the current line has no more tokens, advance to the next line.
            if (activeLineData.length === 0) {
                this.#currentLinePosition++;
            }

            // Return the token, converting to a number if rawStringOutput is false.
            return rawStringOutput ? extractedToken : +extractedToken;
        }

        /**
         * Reads an entire line of space-separated tokens.
         * Automatically advances the line position for the next read.
         * @param {boolean} [rawStringOutput=false] - If true, returns an array of strings; otherwise, an array of numbers.
         * @returns {Array<string|number>} An array of tokens from the line. Returns an empty array if no more lines.
         */
        readFullLine(rawStringOutput = false) {
            if (this.#currentLinePosition >= this.#lineSegments.length) {
                console.warn("InputBuffer: Attempted to read line beyond the end of input.");
                return [];
            }

            // Get the current line and advance the line pointer.
            const currentLineContent = this.#lineSegments[this.#currentLinePosition++];

            // Ensure the content is treated as a string before splitting.
            // If it was already split and reversed by extractNextToken, re-join it.
            const lineTokens = (typeof currentLineContent === 'string'
                                ? currentLineContent
                                : currentLineContent.reverse().join(' ')
                               ).split(" ");

            // Return tokens, converting to numbers if required.
            return rawStringOutput ? lineTokens : lineTokens.map(str => +str);
        }

        /**
         * Reads 'numLines' consecutive lines, treating each as an array of space-separated tokens,
         * forming a 2D matrix.
         * @param {number} numLines - The number of lines to read.
         * @param {boolean} [rawStringOutput=false] - If true, returns a string matrix; otherwise, a numeric matrix.
         * @returns {Array<Array<string|number>>} A matrix of tokens. Returns an empty array if numLines is invalid or no lines remain.
         */
        readTokenMatrix(numLines, rawStringOutput = false) {
            if (numLines <= 0) {
                console.warn("InputBuffer: 'numLines' must be positive for readTokenMatrix.");
                return [];
            }

            const startIdx = this.#currentLinePosition;
            let endIdx = startIdx + numLines;

            // Adjust endIdx if it goes beyond the available lines.
            if (endIdx > this.#lineSegments.length) {
                 console.warn(`InputBuffer: Requested ${numLines} lines, but only ${this.#lineSegments.length - startIdx} lines remain. Reading available lines.`);
                 endIdx = this.#lineSegments.length;
            }

            // Extract the relevant lines and advance the line pointer.
            const linesToParse = this.#lineSegments.slice(startIdx, endIdx);
            this.#currentLinePosition = endIdx;

            // Map each line to an array of tokens.
            const resultMatrix = linesToParse.map(line => {
                // Handle cases where a line might have been partially processed by extractNextToken.
                return (typeof line === 'string' ? line : line.reverse().join(' ')).split(" ");
            });

            // Return the matrix, with inner elements converted to numbers if requested.
            return rawStringOutput ? resultMatrix : resultMatrix.map(row => row.map(str => +str));
        }

        /**
         * Reads 'numLines' consecutive lines, treating each line as a single value (string or number).
         * @param {number} numLines - The number of lines to read.
         * @param {boolean} [rawStringOutput=false] - If true, returns an array of strings; otherwise, an array of numbers.
         * @returns {Array<string|number>} An array of values, one for each line. Returns an empty array if numLines is invalid or no lines remain.
         */
        readSequentialLines(numLines, rawStringOutput = false) {
            if (numLines <= 0) {
                console.warn("InputBuffer: 'numLines' must be positive for readSequentialLines.");
                return [];
            }

            const startIdx = this.#currentLinePosition;
            let endIdx = startIdx + numLines;

            // Adjust endIdx if it goes beyond the available lines.
            if (endIdx > this.#lineSegments.length) {
                 console.warn(`InputBuffer: Requested ${numLines} lines, but only ${this.#lineSegments.length - startIdx} lines remain. Reading available lines.`);
                 endIdx = this.#lineSegments.length;
            }

            // Extract the relevant lines and advance the line pointer.
            const linesToExtract = this.#lineSegments.slice(startIdx, endIdx);
            this.#currentLinePosition = endIdx;

            // Return the lines, converting to numbers if requested.
            // Note: If extractNextToken was used on these lines, they might be arrays of tokens.
            // This method assumes each line is a single value, so we'll join if it's an array.
            const processedLines = linesToExtract.map(line => {
                return typeof line === 'string' ? line : line.reverse().join(' '); // Re-join if it was split
            });

            return rawStringOutput ? processedLines : processedLines.map(str => +str);
        }
    }

    return initializeProcessor;
})();

// Obtain the raw input string from standard input
const rawInputContent = require("fs").readFileSync("/dev/stdin", "utf8");
// Initialize the input processing utility
const dataStreamProcessor = InputProcessor(rawInputContent);

/**
 * Creates a multi-dimensional array initialized with a specified value or expression.
 * This function provides a more robust and safer alternative to the original eval-based method,
 * constructing the array recursively.
 *
 * @param {string|any} initialValueExpression - The value or a string expression to initialize each element.
 *                                              If a string, it will be evaluated for each leaf element to create distinct objects.
 * @param {...number} dimensions - A variable number of arguments, each representing the size of a dimension.
 * @returns {Array} A multi-dimensional array.
 */
function createMultiDimArray(initialValueExpression, ...dimensions) {
    // If no dimensions are provided, return the initial value (or its evaluation if it's a string).
    if (!dimensions || dimensions.length === 0) {
        return typeof initialValueExpression === 'string'
               ? new Function(`return ${initialValueExpression};`)() // Evaluate expression for unique object
               : initialValueExpression;
    }

    /**
     * Helper recursive function to build the array structure.
     * @param {number} dimIndex - The current dimension index being processed.
     * @returns {Array} A (sub)array for the current dimension.
     */
    function buildArrayRecursive(dimIndex) {
        const currentDimensionSize = dimensions[dimIndex];
        if (currentDimensionSize <= 0) {
            // Handle zero or negative dimensions gracefully by returning an empty array.
            console.warn(`createMultiDimArray: Dimension at index ${dimIndex} is non-positive (${currentDimensionSize}). Returning an empty array for this level.`);
            return [];
        }

        const currentArray = new Array(currentDimensionSize);

        if (dimIndex === dimensions.length - 1) {
            // Base case: This is the last dimension, fill with initial values.
            for (let i = 0; i < currentDimensionSize; i++) {
                // If the initialValueExpression is a string, evaluate it to create a new instance for each element.
                currentArray[i] = typeof initialValueExpression === 'string'
                                  ? new Function(`return ${initialValueExpression};`)()
                                  : initialValueExpression;
            }
        } else {
            // Recursive case: Build nested arrays for subsequent dimensions.
            for (let i = 0; i < currentDimensionSize; i++) {
                currentArray[i] = buildArrayRecursive(dimIndex + 1);
            }
        }
        return currentArray;
    }

    return buildArrayRecursive(0); // Start building from the first dimension.
}


/**
 * Computes a unique index for an unordered pair of two non-negative integers (nodes).
 * This is a common method for mapping {a, b} to a single integer, ensuring (a, b) and (b, a) map to the same index.
 * It's based on Cantor pairing function principles, adapted for graph edges or node pairs.
 *
 * @param {number} nodeA - The first node index (0-based).
 * @param {number} nodeB - The second node index (0-based).
 * @returns {number} A unique integer identifier for the pair {nodeA, nodeB}.
 */
function getUniquePairIdentifier(nodeA, nodeB) {
    // Input validation: Ensure nodes are non-negative.
    if (nodeA < 0 || nodeB < 0) {
        console.warn(`getUniquePairIdentifier: Negative node index provided: (${nodeA}, ${nodeB}). Behavior might be unexpected.`);
        // For robustness, one might throw an error or clamp values.
    }

    // Determine the larger and smaller values to ensure consistent mapping regardless of argument order.
    const largerNodeValue = Math.max(nodeA, nodeB);
    const smallerNodeValue = Math.min(nodeA, nodeB);

    // The formula (N * (N - 1) / 2) calculates the sum of integers from 0 to (N-1).
    // This provides an offset for the 'row' corresponding to the largerNodeValue.
    // Adding the smallerNodeValue then gives the exact position within that 'row'.
    // The bitwise right shift `>> 1` is an efficient way to perform integer division by 2.
    const uniqueIndex = (largerNodeValue * (largerNodeValue - 1) >> 1) + smallerNodeValue;

    return uniqueIndex;
}


/**
 * Performs a topological sort on a directed acyclic graph (DAG) using Kahn's algorithm.
 * It also calculates the maximum "depth" (longest path length) to each node.
 *
 * @param {Array<Object>} graphAdjacencyList - An array where each element is an object
 *                                           representing a node, with 'incomingEdges' and 'outgoingEdges' arrays.
 *                                           e.g., [{ incomingEdges: [], outgoingEdges: [1, 2] }, ...]
 * @returns {Array<Array<number>> | -1} An array of [nodeIndex, depth] tuples in topological order if successful,
 *                                    or -1 if the graph contains a cycle (not a DAG).
 */
function performTopologicalSort(graphAdjacencyList) {
    const totalNodeCount = graphAdjacencyList.length;

    // Array to store the count of incoming edges for each node.
    const nodeInDegreeCounts = new Array(totalNodeCount).fill(0);
    // Array to store the maximum depth (longest path length from a source node) to each node.
    const nodeLongestPathDepths = new Array(totalNodeCount).fill(0);
    // Queue for nodes that are ready to be processed (nodes with an in-degree of 0).
    // Each element in the queue is a tuple: [nodeIndex, currentPathDepth].
    const processingQueue = [];

    // Step 1: Initialize in-degrees for all nodes and populate the initial queue with source nodes.
    for (let nodeIdx = 0; nodeIdx < totalNodeCount; nodeIdx++) {
        // The in-degree of a node is simply the number of its incoming edges.
        nodeInDegreeCounts[nodeIdx] = graphAdjacencyList[nodeIdx].incomingEdges.length;

        // If a node has no incoming edges, it's a source node; add it to the queue with depth 0.
        if (nodeInDegreeCounts[nodeIdx] === 0) {
            processingQueue.push([nodeIdx, 0]);
        }
    }

    // Step 2: Process nodes from the queue until it's empty or a cycle is detected.
    let queueReadPointer = 0; // Use a pointer for efficient queue processing (avoids expensive `shift()`).

    while (queueReadPointer < processingQueue.length) {
        // Dequeue the current node and its associated depth.
        const [currentNodeIndex, currentDepth] = processingQueue[queueReadPointer++];

        // Update the maximum depth for the current node. This ensures we record the longest path to it.
        nodeLongestPathDepths[currentNodeIndex] = Math.max(nodeLongestPathDepths[currentNodeIndex], currentDepth);

        // Iterate over all neighbors (nodes reachable from the current node).
        for (const neighborNodeIndex of graphAdjacencyList[currentNodeIndex].outgoingEdges) {
            // Decrement the in-degree of the neighbor, as one of its prerequisites (currentNodeIndex) has been processed.
            nodeInDegreeCounts[neighborNodeIndex]--;

            // Update the neighbor's depth: it's at least one more than the current node's depth.
            // Use Math.max to ensure we track the longest path to this neighbor from any processed node.
            nodeLongestPathDepths[neighborNodeIndex] = Math.max(nodeLongestPathDepths[neighborNodeIndex], currentDepth + 1);

            // If the neighbor's in-degree becomes 0, it means all its prerequisite nodes have been processed.
            // Add it to the queue for further processing.
            if (nodeInDegreeCounts[neighborNodeIndex] === 0) {
                processingQueue.push([neighborNodeIndex, nodeLongestPathDepths[neighborNodeIndex]]);
            }
        }
    }

    // Step 3: Check for cycles in the graph.
    // If the number of nodes processed in the topological sort (processingQueue.length)
    // is less than the total number of nodes, it indicates that there's a cycle,
    // as some nodes still have non-zero in-degrees and could not be added to the queue.
    if (processingQueue.length < totalNodeCount) {
        // The graph contains a cycle; it's not a DAG.
        return -1;
    }

    // If no cycle, construct the final result: an array of [nodeIndex, finalDepth] tuples
    // in topological order. We use the stored `nodeLongestPathDepths` for the final depths.
    const finalSortedSequenceWithDepths = processingQueue.map(([nodeIdx, _]) => [nodeIdx, nodeLongestPathDepths[nodeIdx]]);

    return finalSortedSequenceWithDepths;
}


/**
 * The main function orchestrates the graph processing.
 * It reads input, builds a graph representing relationships between node pairs,
 * performs a topological sort, and calculates the maximum depth.
 * @returns {number} The maximum depth + 1, or -1 if a cycle is detected.
 */
function executeGraphAlgorithm() {
    // Read the total number of nodes from the input.
    const numberOfNodes = dataStreamProcessor.extractNextToken();

    // Guard clause: Ensure a valid number of nodes for graph construction.
    if (numberOfNodes < 1) {
        console.error("executeGraphAlgorithm: Invalid number of nodes provided. Must be at least 1.");
        return -1;
    }

    // Calculate the maximum possible number of unique pairs (edges) for a fully connected graph.
    // This is n * (n - 1) / 2, representing combinations of 2 nodes from n.
    // This size is used for the adjacency list which stores information for each unique pair.
    const maxPairCombinations = (numberOfNodes * (numberOfNodes - 1)) / 2;

    // Initialize the adjacency list for the graph.
    // Each element at a unique pair index will store its incoming and outgoing connections.
    const nodeConnectionGraph = createMultiDimArray("{ incomingEdges: [], outgoingEdges: [] }", maxPairCombinations);

    // Iterate through each node to build its connections based on input lines.
    for (let currentSourceNode = 0; currentSourceNode < numberOfNodes; currentSourceNode++) {
        // Read a line of space-separated node indices (representing a sequence or path).
        const pathSequence = dataStreamProcessor.readFullLine();

        // The first node in the sequence forms a pair with the current source node.
        // We adjust indices by -1 as input is 1-based, and our graph is 0-based.
        const firstPathNodeAdjusted = pathSequence[0] - 1;
        let previousPairIdentifier = getUniquePairIdentifier(firstPathNodeAdjusted, currentSourceNode);

        // Iterate through the rest of the path sequence to establish directed edges between pairs.
        // The loop starts from the second element (index 1) and goes up to the second-to-last element.
        // This is because 'pathSequence[0]' is already processed and 'pathSequence[n-1]' would be the last 'currentPathNodeAdjusted'.
        for (let pathStepIndex = 1; pathStepIndex < numberOfNodes - 1; pathStepIndex++) {
            const currentPathNodeAdjusted = pathSequence[pathStepIndex] - 1;
            const currentPairIdentifier = getUniquePairIdentifier(currentPathNodeAdjusted, currentSourceNode);

            // Add an outgoing edge from the 'previousPairIdentifier' to the 'currentPairIdentifier'.
            nodeConnectionGraph[previousPairIdentifier].outgoingEdges.push(currentPairIdentifier);
            // Add an incoming edge to the 'currentPairIdentifier' from the 'previousPairIdentifier'.
            nodeConnectionGraph[currentPairIdentifier].incomingEdges.push(previousPairIdentifier);

            // Update the 'previousPairIdentifier' for the next iteration to chain the path.
            previousPairIdentifier = currentPairIdentifier;
        }
    }

    // Perform topological sorting on the constructed graph to determine dependencies and depths.
    const sortedNodeSequence = performTopologicalSort(nodeConnectionGraph);

    // Check if a cycle was detected during topological sort (indicated by -1).
    if (sortedNodeSequence === -1) {
        // If a cycle exists, topological sort is impossible, so return -1.
        return -1;
    }

    // The problem asks for the maximum depth + 1.
    // The last element in the topologically sorted sequence typically corresponds to a node
    // that is part of the longest path, and its associated depth is the maximum depth achieved.
    const lastSortedNodeEntry = sortedNodeSequence[sortedNodeSequence.length - 1];
    const maxDepthAchieved = lastSortedNodeEntry[1]; // The second element of the tuple is the depth.

    return maxDepthAchieved + 1;
}

// Execute the main algorithm and print the result to console.
console.log(executeGraphAlgorithm());