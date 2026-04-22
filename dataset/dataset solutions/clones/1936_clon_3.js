function DataStreamProcessor(sourceText) {
    // Reference to the current instance for internal method access
    const instanceRef = this;

    // Initialize the index for the next token to be consumed
    instanceRef.currentElementIndex = 0;

    // Store the original input text for potential debugging or future use (optional, can be removed)
    instanceRef.rawInputText = sourceText;

    // Pre-process the input string:
    // 1. Replace all newline, space, and tab characters with a single space.
    // 2. Trim leading/trailing spaces.
    // 3. Split the cleaned string by space to get an array of tokens.
    // This self-executing function ensures tokenization happens once at initialization.
    instanceRef.tokenizedSegments = (() => {
        if (typeof sourceText !== 'string' || sourceText.trim() === '') {
            return []; // Handle empty or invalid input gracefully
        }
        const cleanedText = sourceText.replace(/[\n\s\t]+/g, ' ').trim();
        // Return an array of non-empty strings. Filtering empty strings handles multiple spaces.
        return cleanedText.split(' ').filter(s => s.length > 0);
    })();

    /**
     * Retrieves the next token as a string.
     * @returns {string|null} The next token or null if no more tokens are available.
     */
    instanceRef.retrieveNextString = function() {
        if (instanceRef.currentElementIndex >= instanceRef.tokenizedSegments.length) {
            return null; // End of stream
        }
        // Fetch the token and advance the index
        const token = instanceRef.tokenizedSegments[instanceRef.currentElementIndex];
        instanceRef.currentElementIndex++;
        return token;
    };

    /**
     * Retrieves the next token parsed as an integer.
     * @returns {number|null} The next token as an integer or null if no more tokens or parsing fails.
     */
    instanceRef.fetchNextInteger = function() {
        const token = instanceRef.retrieveNextString();
        // Use Number() for parsing, which handles both int and float and returns NaN for non-numeric.
        // Check if the token is not null and can be converted to a valid number.
        if (token !== null) {
            const parsedValue = Number(token);
            return Number.isFinite(parsedValue) ? Math.floor(parsedValue) : null;
        }
        return null;
    };

    /**
     * Retrieves the next token parsed as a floating-point number.
     * @returns {number|null} The next token as a float or null if no more tokens or parsing fails.
     */
    instanceRef.grabNextFloat = function() {
        const token = instanceRef.retrieveNextString();
        if (token !== null) {
            const parsedValue = Number(token);
            return Number.isFinite(parsedValue) ? parsedValue : null;
        }
        return null;
    };
}

/**
 * Main application logic for processing graph data and calculating LIS.
 * @param {DataStreamProcessor} inputReader - An instance of the data stream processor.
 */
function ExecuteProgram(inputReader) {
    // Read the total number of nodes (N) from the input stream
    const nodeCount = inputReader.fetchNextInteger();
    if (nodeCount === null || nodeCount <= 0) {
        console.error("Invalid node count provided.");
        return; // Terminate if N is invalid
    }

    // Array to store the final computed results for each path
    const finalResults = [];

    // Map to store the numerical value associated with each node ID
    // Key: Node ID (1-indexed), Value: Integer value of the node
    const nodeValuesMap = {};
    for (let nodeIdx = 1; nodeIdx <= nodeCount; ++nodeIdx) {
        nodeValuesMap[nodeIdx] = inputReader.fetchNextInteger();
    }

    // Adjacency list representation of the tree structure
    // Key: Node ID, Value: Array of connected node IDs
    const adjacencyList = {};
    for (let edgeIdx = 0; edgeIdx < nodeCount - 1; ++edgeIdx) {
        const nodeA = inputReader.fetchNextInteger();
        const nodeB = inputReader.fetchNextInteger();

        // Ensure both nodes are valid
        if (nodeA === null || nodeB === null) {
            console.error("Missing edge data.");
            return;
        }

        // Add bidirectional connections
        adjacencyList[nodeA] = adjacencyList[nodeA] || [];
        adjacencyList[nodeA].push(nodeB);

        adjacencyList[nodeB] = adjacencyList[nodeB] || [];
        adjacencyList[nodeB].push(nodeA);
    }

    // Map to store the sequence of node values encountered on the path from the root to each node
    // Key: Node ID, Value: Array of values along the path
    const pathValueSequences = {};

    /**
     * Recursively traverses the tree to collect node values along each path from the root.
     * This is a Depth-First Search (DFS) implementation.
     * @param {number} currentNodeId - The ID of the node currently being visited.
     * @param {number} parentNodeId - The ID of the node from which `currentNodeId` was visited (to prevent backtracking).
     * @param {number[]} accumulatedPathValues - An array containing values of nodes from the root to `parentNodeId`.
     */
    const traverseAndCollect = (currentNodeId, parentNodeId, accumulatedPathValues) => {
        // Create a new array for the current path, appending the current node's value
        const updatedPath = [...accumulatedPathValues, nodeValuesMap[currentNodeId]];

        // Store this complete path sequence for the current node
        pathValueSequences[currentNodeId] = updatedPath;

        // Get neighbors of the current node
        const neighbors = adjacencyList[currentNodeId];

        // If the current node has neighbors, iterate through them
        if (neighbors && neighbors.length > 0) {
            for (const neighborNodeId of neighbors) {
                // Prevent traversing back to the parent node
                if (neighborNodeId !== parentNodeId) {
                    // Recursively call for the neighbor, passing the updated path
                    traverseAndCollect(neighborNodeId, currentNodeId, updatedPath);
                }
            }
        }
    };

    // Start the tree traversal from node 1 (assuming it's the root), with no parent (-1) and an empty initial path
    traverseAndCollect(1, -1, []);

    // Helper function for binary search (finds the insertion point for LIS)
    // Returns the index of the smallest element >= target, or array.length if all elements are smaller.
    const findCeilIndex = (arr, target) => {
        let low = 0;
        let high = arr.length - 1;
        let insertionPoint = arr.length; // Default: insert at end

        while (low <= high) {
            const mid = Math.floor(low + (high - low) / 2);
            if (arr[mid] >= target) {
                insertionPoint = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }
        return insertionPoint;
    };

    // Iterate through each node's path sequence to calculate the Longest Increasing Subsequence (LIS) length
    for (let nodeId = 1; nodeId <= nodeCount; ++nodeId) {
        const currentSequence = pathValueSequences[nodeId];
        const lisTailArray = []; // This array stores the smallest tail of all increasing subsequences of length i+1

        if (!currentSequence) {
            finalResults.push(0); // Handle case where a node path might be missing (shouldn't happen in a connected tree)
            continue;
        }

        // Process each value in the path sequence
        for (const currentValue of currentSequence) {
            if (lisTailArray.length === 0 || currentValue > lisTailArray[lisTailArray.length - 1]) {
                // If the array is empty or current value extends the longest LIS, append it
                lisTailArray.push(currentValue);
            } else {
                // Find the smallest element in lisTailArray that is greater than or equal to currentValue
                // This element is then replaced by currentValue to potentially allow for a longer LIS later
                const replaceIndex = findCeilIndex(lisTailArray, currentValue);
                lisTailArray[replaceIndex] = currentValue;
            }
        }
        // The length of lisTailArray at the end is the length of the LIS for the current path
        finalResults.push(lisTailArray.length);
    }

    // Output the final results, each on a new line
    console.log(finalResults.join('\n'));
}

// Entry point: Initialize the DataStreamProcessor with input from stdin and execute the main program logic.
ExecuteProgram(new DataStreamProcessor(require("fs").readFileSync("/dev/stdin", "utf8")));

// Example usage with a hardcoded string input (for testing purposes)
// ExecuteProgram(new DataStreamProcessor("3\n10 20 30\n1 2\n2 3"));
// Expected output for "3\n10 20 30\n1 2\n2 3":
// 1 (path 1: [10] -> LIS: 1)
// 2 (path 2: [10, 20] -> LIS: 2)
// 3 (path 3: [10, 20, 30] -> LIS: 3)