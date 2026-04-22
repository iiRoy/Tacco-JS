function InputTokenizer(sourceTextPayload) {
    // Retains a reference to the current instance for method access
    const instanceContext = this;
    // Tracks the current position for token retrieval
    let processingIndex = 0;
    // Stores the original raw input string
    instanceContext.rawInputPayload = sourceTextPayload;

    // Initializes the array of parsed string segments using an Immediately Invoked Function Expression (IIFE).
    // This pre-processes the entire input string upon instantiation.
    instanceContext.parsedSegments = (() => {
        // Ensures the input is a string, handling potential null/undefined values gracefully
        const initialString = String(sourceTextPayload || '');
        // Replaces sequences of whitespace (newlines, tabs, spaces) with a single space,
        // then trims any leading or trailing whitespace.
        const normalizedString = initialString.replace(/[\n\s\t]+/g, ' ').trim();

        // If the string is empty after normalization, return an empty array
        if (normalizedString.length === 0) {
            return [];
        }

        // Splits the normalized string by spaces and filters out any empty string tokens
        // (which can occur if there were multiple spaces originally)
        const segments = normalizedString.split(' ').filter(segment => segment !== '');
        return segments;
    })();

    /**
     * Retrieves the next token as a string from the parsed segments.
     * @returns {string|null} The next string token or null if no more tokens are available.
     */
    instanceContext.retrieveNextToken = function() {
        // Checks if the processing index has exceeded the bounds of the segments array
        if (processingIndex >= instanceContext.parsedSegments.length) {
            return null; // Indicates no more tokens to process
        }
        // Fetches the token at the current index
        const nextToken = instanceContext.parsedSegments[processingIndex];
        // Advances the index for the subsequent call
        processingIndex++;
        return nextToken;
    };

    /**
     * Retrieves the next token and attempts to parse it into an integer.
     * @returns {number|null} The parsed integer value or null if no more tokens or parsing fails.
     */
    instanceContext.fetchNextInteger = function() {
        const token = instanceContext.retrieveNextToken();
        // Uses Number.parseInt with radix 10 for reliable integer conversion
        return token !== null ? Number.parseInt(token, 10) : null;
    };

    /**
     * Retrieves the next token and attempts to parse it into a floating-point number.
     * @returns {number|null} The parsed floating-point value or null if no more tokens or parsing fails.
     */
    instanceContext.acquireNextDecimal = function() {
        const token = instanceContext.retrieveNextToken();
        // Uses Number.parseFloat for floating-point conversion
        return token !== null ? Number.parseFloat(token) : null;
    };

    /**
     * Retrieves the next token, parses it as an integer, and returns its byte value (0-255).
     * This implementation ensures the value is within the byte range using a bitwise AND operation.
     * @returns {number|null} The parsed byte value or null if no more tokens or parsing fails.
     */
    instanceContext.readNextByte = function() {
        const token = instanceContext.retrieveNextToken();
        if (token === null) {
            return null;
        }
        const parsedInteger = Number.parseInt(token, 10);
        // Returns the integer masked to an 8-bit unsigned value (0-255)
        return Number.isNaN(parsedInteger) ? null : (parsedInteger & 0xFF);
    };
}

// Utility function to find the insertion point for an element in a sorted array
// This is an "upper_bound" equivalent: finds the index of the first element
// that is greater than or equal to the given 'value'.
// Returns `sortedArray.length` if `value` is greater than all elements.
function findInsertionPointForReplacement(sortedArray, value) {
    let lowIndex = 0;
    let highIndex = sortedArray.length - 1;
    let resultIndex = sortedArray.length; // Default: value is greater than all

    while (lowIndex <= highIndex) {
        const midIndex = Math.floor(lowIndex + (highIndex - lowIndex) / 2);
        if (sortedArray[midIndex] >= value) {
            resultIndex = midIndex;
            highIndex = midIndex - 1; // Try to find an even smaller index
        } else {
            lowIndex = midIndex + 1; // Value is greater, search in the right half
        }
    }
    return resultIndex;
}


// The primary function encapsulating the application's core logic
function ExecuteApplicationLogic(inputSource) {
    // Reads the initial integer, representing the total number of nodes/elements
    const totalElements = inputSource.fetchNextInteger();

    // Basic validation for the primary input size
    if (totalElements === null || totalElements <= 0 || Number.isNaN(totalElements)) {
        console.error("Error: Invalid or missing total number of elements provided.");
        return; // Exit if input is invalid
    }

    // Array to store the final computed Longest Increasing Subsequence (LIS) lengths for each node's path
    const computedLengths = [];

    // A Map to store the numerical values associated with each node, using 1-based indexing
    const nodeValuesMap = new Map();
    for (let i = 1; i <= totalElements; i++) {
        const nodeValue = inputSource.fetchNextInteger();
        if (nodeValue === null || Number.isNaN(nodeValue)) {
            console.error(`Error: Missing or invalid value for node ${i}.`);
            return;
        }
        nodeValuesMap.set(i, nodeValue);
    }

    // Represents the graph structure using an adjacency list (Map where keys are node IDs, values are arrays of connected node IDs)
    const connectionRegistry = new Map();
    // Reads N-1 edges, which is typical for a tree structure
    for (let i = 0; i < totalElements - 1; i++) {
        const nodeA = inputSource.fetchNextInteger();
        const nodeB = inputSource.fetchNextInteger();

        if (nodeA === null || nodeB === null || Number.isNaN(nodeA) || Number.isNaN(nodeB)) {
            console.error(`Error: Missing or invalid edge definition at entry ${i + 1}.`);
            return;
        }
        
        // Optional: Add validation for node IDs being within the expected range
        if (nodeA < 1 || nodeA > totalElements || nodeB < 1 || nodeB > totalElements) {
             console.warn(`Warning: Edge defined with out-of-range node identifiers (${nodeA}, ${nodeB}). Skipping this edge.`);
             continue; // Skip processing this invalid edge
        }

        // Establishes bidirectional connections in the adjacency list
        if (!connectionRegistry.has(nodeA)) {
            connectionRegistry.set(nodeA, []);
        }
        connectionRegistry.get(nodeA).push(nodeB);

        if (!connectionRegistry.has(nodeB)) {
            connectionRegistry.set(nodeB, []);
        }
        connectionRegistry.get(nodeB).push(nodeA);
    }

    // Stores the accumulated sequence of node values for the path from the root to each node.
    // Keys are node IDs, values are arrays of numbers.
    const cumulativeSequences = new Map();
    // A queue for managing nodes to visit during the graph traversal (Breadth-First Search like approach)
    // Each element in the queue is an array: [currentNodeId, parentNodeId]
    const traversalQueue = [];

    /**
     * Explores a specific node, recording its value into its path sequence
     * and adding its unvisited neighbors to the traversal queue.
     * @param {number} currentNodeIdentifier - The unique ID of the node currently being processed.
     * @param {number} parentNodeIdentifier - The ID of the node from which `currentNodeIdentifier` was reached (-1 for the initial root).
     */
    const depthFirstExplore = (currentNodeIdentifier, parentNodeIdentifier) => {
        // Retrieves the path sequence of the parent node, or initializes an empty array if it's the root
        // or a disconnected node. A deep copy is made to avoid modifying parent's path.
        let currentPathSegment = [];
        if (parentNodeIdentifier !== -1 && cumulativeSequences.has(parentNodeIdentifier)) {
            currentPathSegment = [...cumulativeSequences.get(parentNodeIdentifier)];
        }

        // Appends the current node's value to its path segment
        const valueForCurrentNode = nodeValuesMap.get(currentNodeIdentifier);
        if (valueForCurrentNode !== undefined) {
             currentPathSegment.push(valueForCurrentNode);
        } else {
            console.warn(`Warning: Node ${currentNodeIdentifier} found during traversal but has no defined value in nodeValuesMap.`);
        }
       
        // Stores the complete path sequence for the `currentNodeIdentifier`
        cumulativeSequences.set(currentNodeIdentifier, currentPathSegment);

        // Fetches the list of neighbors for the current node
        const neighborsOfCurrent = connectionRegistry.get(currentNodeIdentifier);

        // If neighbors exist, iterate through them to queue unvisited ones
        if (neighborsOfCurrent && neighborsOfCurrent.length > 0) {
            for (const neighborIdentifier of neighborsOfCurrent) {
                // Ensures the neighbor is not the parent (to prevent immediate backtracking)
                // and has not yet been processed in this traversal (checked via cumulativeSequences map)
                if (neighborIdentifier !== parentNodeIdentifier && !cumulativeSequences.has(neighborIdentifier)) {
                    traversalQueue.push([neighborIdentifier, currentNodeIdentifier]);
                }
            }
        }
    };

    // Initiates the graph traversal starting from node 1 (assuming it's the root)
    // -1 signifies that node 1 has no parent in this context.
    traversalQueue.push([1, -1]);

    // Loop to process nodes from the traversal queue until it's empty or a safety limit is reached
    let traversalSafetyCounter = 0;
    const MAXIMUM_TRAVERSAL_ITERATIONS = 10000000; // A large arbitrary limit to prevent infinite loops

    while (traversalQueue.length > 0 && traversalSafetyCounter < MAXIMUM_TRAVERSAL_ITERATIONS) {
        const [nextNodeId, nextParentId] = traversalQueue.shift(); // Dequeue the next node to explore
        depthFirstExplore(nextNodeId, nextParentId); // Process the node
        traversalSafetyCounter++; // Increment safety counter
    }

    if (traversalSafetyCounter >= MAXIMUM_TRAVERSAL_ITERATIONS) {
        console.error("Traversal aborted: Exceeded maximum iterations. Possible infinite loop or extremely large graph.");
    }

    // --- Calculation of Longest Increasing Subsequence (LIS) for Each Node's Path ---

    // Iterates through each node from 1 to totalElements
    for (let i = 1; i <= totalElements; i++) {
        const fullNodePath = cumulativeSequences.get(i);

        // If a node's path was not found (e.g., disconnected node, traversal issue), handle it
        if (!fullNodePath || fullNodePath.length === 0) {
            computedLengths.push(0); // Assign 0 LIS length for empty or missing paths
            continue;
        }

        // `lisBuildingArray` will maintain the smallest ending element of all increasing subsequences
        // of a given length. Its length at any point is the length of the LIS found so far.
        const lisBuildingArray = [];

        for (const currentValue of fullNodePath) {
            // Case 1: If the `lisBuildingArray` is empty or `currentValue` is greater than the last element,
            // it extends the longest increasing subsequence.
            if (lisBuildingArray.length === 0 || currentValue > lisBuildingArray[lisBuildingArray.length - 1]) {
                lisBuildingArray.push(currentValue);
            }
            // Case 2: If `currentValue` is less than or equal to the first element,
            // it can potentially start a new LIS of length 1, replacing the current smallest.
            else if (currentValue <= lisBuildingArray[0]) {
                lisBuildingArray[0] = currentValue;
            }
            // Case 3: `currentValue` is somewhere in the middle (i.e., `lisBuildingArray[0] < currentValue <= lisBuildingArray[last]`).
            // We need to find the smallest element in `lisBuildingArray` that is greater than or equal to `currentValue`
            // and replace it. This maintains the property that `lisBuildingArray` stores the smallest end elements.
            // A binary search is used for efficient lookup.
            else {
                const replacementIndex = findInsertionPointForReplacement(lisBuildingArray, currentValue);
                // The `findInsertionPointForReplacement` function guarantees `replacementIndex`
                // will be within bounds or `lisBuildingArray.length` if `currentValue` is largest.
                // Given the `else if` conditions, `replacementIndex` will always be a valid index to replace.
                if (replacementIndex < lisBuildingArray.length) { 
                    lisBuildingArray[replacementIndex] = currentValue;
                }
            }
        }
        // The length of `lisBuildingArray` at the end of processing a path is its LIS length.
        computedLengths.push(lisBuildingArray.length);
    }

    // Outputs the computed LIS lengths, each on a new line.
    console.log(computedLengths.join('\n'));
}

// Entry point for execution: Reads input from standard input and passes it to the main logic function.
ExecuteApplicationLogic(new InputTokenizer(require("fs").readFileSync("/dev/stdin", "utf8")));